import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.role.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { userRoles: true } } },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { userRoles: true } } },
    });
    if (!item) throw new NotFoundException('Role not found');
    return item;
  }

  async create(dto: CreateRoleDto, userId: string) {
    const exists = await this.prisma.role.findUnique({ where: { key: dto.key } });
    if (exists) throw new ConflictException('Role key already exists');
    return this.prisma.role.create({
      data: { ...dto, createdByUserId: userId },
    });
  }

  async update(id: string, dto: UpdateRoleDto) {
    await this.findOne(id);
    if (dto.key) {
      const exists = await this.prisma.role.findFirst({
        where: { key: dto.key, NOT: { id } },
      });
      if (exists) throw new ConflictException('Role key already exists');
    }
    return this.prisma.role.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    if (item._count.userRoles > 0) {
      throw new ConflictException('Cannot delete a role assigned to users');
    }
    return this.prisma.role.delete({ where: { id } });
  }
}
