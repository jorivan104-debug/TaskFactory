import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { BlueprintDefinition, BlueprintEdge, BlueprintNode } from '../work-order-types/blueprint-validator';

export interface TransitionOption {
  edgeId: string;
  label: string;
  targetStateKey: string;
  targetLabel: string;
}

export interface RuntimeContext {
  workOrderId: string;
  currentStateKey: string;
  currentStateLabel: string;
  availableTransitions: TransitionOption[];
  nodes: BlueprintNode[];
  edges: BlueprintEdge[];
}

const ALLOWED_WO_FIELDS = new Set(['status', 'title']);

@Injectable()
export class BlueprintEngineService {
  constructor(private readonly prisma: PrismaService) {}

  async getRuntimeContext(workOrderId: string): Promise<RuntimeContext> {
    const wo = await this.prisma.workOrder.findUnique({ where: { id: workOrderId } });
    if (!wo) throw new NotFoundException('Work order not found');
    if (!wo.blueprintSnapshotJson || !wo.currentStateKey) {
      throw new BadRequestException('Work order has no blueprint assigned');
    }

    const def = wo.blueprintSnapshotJson as unknown as BlueprintDefinition;
    const currentNode = def.nodes.find((n) => n.id === wo.currentStateKey);
    const outgoing = def.edges.filter((e) => e.source === wo.currentStateKey);

    return {
      workOrderId: wo.id,
      currentStateKey: wo.currentStateKey,
      currentStateLabel: currentNode?.data?.label ?? wo.currentStateKey,
      availableTransitions: outgoing.map((e) => {
        const targetNode = def.nodes.find((n) => n.id === e.target);
        return {
          edgeId: e.id,
          label: e.data?.label ?? e.id,
          targetStateKey: e.target,
          targetLabel: targetNode?.data?.label ?? e.target,
        };
      }),
      nodes: def.nodes,
      edges: def.edges,
    };
  }

  async executeTransition(
    workOrderId: string,
    transitionId: string,
    userId: string,
    _payload?: Record<string, unknown>,
  ) {
    const wo = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: { taskAssignments: true },
    });
    if (!wo) throw new NotFoundException('Work order not found');
    if (!wo.blueprintSnapshotJson || !wo.currentStateKey) {
      throw new BadRequestException('Work order has no blueprint assigned');
    }

    const def = wo.blueprintSnapshotJson as unknown as BlueprintDefinition;
    const edge = def.edges.find((e) => e.id === transitionId && e.source === wo.currentStateKey);
    if (!edge) {
      throw new BadRequestException(
        `Transition "${transitionId}" is not valid from current state "${wo.currentStateKey}"`,
      );
    }

    await this.evaluateConditions(edge, wo);

    const previousState = wo.currentStateKey;
    const updateData: Record<string, unknown> = { currentStateKey: edge.target };

    return this.prisma.$transaction(async (tx) => {
      for (const action of edge.data?.actions ?? []) {
        switch (action.type) {
          case 'set_field': {
            if (action.target === 'work_order' && ALLOWED_WO_FIELDS.has(action.field as string)) {
              updateData[action.field as string] = action.value;
            }
            break;
          }
          case 'append_log': {
            await tx.workOrderLog.create({
              data: {
                workOrderId,
                entryType: (action.entryType as string) ?? 'status_change',
                summary: (action.summary as string) ?? `Transition ${edge.id}`,
                changesJson: { previousState, newState: edge.target },
                performedAt: new Date(),
                createdByUserId: userId,
              },
            });
            break;
          }
          case 'complete_open_tasks': {
            await tx.taskAssignment.updateMany({
              where: { workOrderId, status: { not: 'completed' } },
              data: { status: 'completed', completedAt: new Date() },
            });
            break;
          }
          case 'create_task_assignment': {
            break;
          }
        }
      }

      const updated = await tx.workOrder.update({
        where: { id: workOrderId },
        data: updateData as any,
      });

      const targetNode = def.nodes.find((n) => n.id === edge.target);
      if (targetNode?.data?.task?.autoCreateAssignment) {
        const existingOpen = await tx.taskAssignment.findFirst({
          where: {
            workOrderId,
            status: { not: 'completed' },
            description: { contains: targetNode.data.task.title ?? edge.target },
          },
        });
        if (!existingOpen) {
          await tx.taskAssignment.create({
            data: {
              workOrderId,
              employeeId: userId,
              description: targetNode.data.task.title ?? `Task for ${edge.target}`,
              status: 'assigned',
              createdByUserId: userId,
            },
          });
        }
      }

      await tx.workOrderLog.create({
        data: {
          workOrderId,
          entryType: 'status_change',
          summary: `State: ${previousState} → ${edge.target}`,
          changesJson: { previousState, newState: edge.target, transitionId },
          performedAt: new Date(),
          createdByUserId: userId,
        },
      });

      return updated;
    });
  }

  async initializeFromBlueprint(
    workOrderId: string,
    blueprintDef: BlueprintDefinition,
    blueprintVersion: number,
    tx?: any,
  ) {
    const prisma = tx ?? this.prisma;
    return prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        blueprintSnapshotJson: blueprintDef as any,
        blueprintVersion,
        currentStateKey: blueprintDef.initialStateKey,
      },
    });
  }

  private async evaluateConditions(edge: BlueprintEdge, wo: any) {
    for (const cond of edge.data?.conditions ?? []) {
      switch (cond.type) {
        case 'field_equals': {
          const actual = wo[cond.field as string];
          if (String(actual) !== String(cond.value)) {
            throw new BadRequestException(
              `Condition not met: ${cond.field} must be "${cond.value}" (is "${actual}")`,
            );
          }
          break;
        }
        case 'all_tasks_completed': {
          const openCount = await this.prisma.taskAssignment.count({
            where: { workOrderId: wo.id, status: { not: 'completed' } },
          });
          if (openCount > 0) {
            throw new BadRequestException(
              `Condition not met: ${openCount} task(s) still open`,
            );
          }
          break;
        }
        case 'role_has': {
          break;
        }
      }
    }
  }
}
