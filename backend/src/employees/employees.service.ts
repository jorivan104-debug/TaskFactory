// @ts-nocheck

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { CreateTaskAssignmentDto } from './dto/create-task-assignment.dto';
import { UpdateTaskAssignmentDto } from './dto/update-task-assignment.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Employees CRUD ──

  findAll() {
    return this.prisma.employee.findMany({ orderBy: { fullName: 'asc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.employee.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Employee not found');
    return item;
  }

  create(dto: CreateEmployeeDto, userId: string) {
    return this.prisma.employee.create({
      data: { ...dto, createdByUserId: userId },
    });
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    await this.findOne(id);
    return this.prisma.employee.update({ where: { id }, data: dto });
  }

  // ── Time Entries ──

  findTimeEntries(employeeId: string) {
    return this.prisma.timeEntry.findMany({
      where: { employeeId },
      orderBy: { clockIn: 'desc' },
    });
  }

  async createTimeEntry(employeeId: string, dto: CreateTimeEntryDto, userId: string) {
    await this.findOne(employeeId);
    return this.prisma.timeEntry.create({
      data: {
        employeeId,
        clockIn: dto.clockIn ? new Date(dto.clockIn) : new Date(),
        workSiteId: dto.workSiteId,
        notes: dto.notes,
        createdByUserId: userId,
      },
    });
  }

  async clockOut(timeEntryId: string) {
    const entry = await this.prisma.timeEntry.findUnique({ where: { id: timeEntryId } });
    if (!entry) throw new NotFoundException('Time entry not found');
    return this.prisma.timeEntry.update({
      where: { id: timeEntryId },
      data: { clockOut: new Date() },
    });
  }

  // ── Task Assignments ──

  findTaskAssignments(employeeId: string) {
    return this.prisma.taskAssignment.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTaskAssignment(employeeId: string, dto: CreateTaskAssignmentDto, userId: string) {
    await this.findOne(employeeId);
    return this.prisma.taskAssignment.create({
      data: {
        ...dto,
        employeeId,
        createdByUserId: userId,
      },
    });
  }

  async updateTaskAssignment(taskId: string, dto: UpdateTaskAssignmentDto) {
    const task = await this.prisma.taskAssignment.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task assignment not found');
    return this.prisma.taskAssignment.update({
      where: { id: taskId },
      data: { status: dto.status },
    });
  }
}
