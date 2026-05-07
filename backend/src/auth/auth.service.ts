import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { applyBaselineSeed } from '../database/baseline-seed';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  async getSetupStatus() {
    const n = await this.prisma.user.count();
    return { setupRequired: n === 0 };
  }

  async bootstrapFirstAdmin(dto: { email: string; password: string; fullName?: string }) {
    const n = await this.prisma.user.count();
    if (n > 0) {
      throw new ForbiddenException('La instalación ya fue completada. Inicie sesión con su cuenta.');
    }

    const email = this.normalizeEmail(dto.email);
    const hash = await bcrypt.hash(dto.password, 10);

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const user = await tx.user.create({
            data: {
              email,
              passwordHash: hash,
              fullName: dto.fullName?.trim() || 'Administrador',
            },
          });

          await applyBaselineSeed(tx, user.id);

          const full = await tx.user.findUnique({
            where: { id: user.id },
            include: { userRoles: { include: { role: true } } },
          });
          if (!full) throw new UnauthorizedException();
          return this.login(full);
        },
        {
          maxWait: 30000,
          timeout: 120000,
        },
      );
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ConflictException('Ese correo ya está registrado.');
        }
        throw new BadRequestException(
          `No se pudo crear la instalación inicial (${e.code}). Compruebe migraciones y la base de datos.`,
        );
      }
      if (e instanceof UnauthorizedException || e instanceof ForbiddenException) throw e;
      const msg = e instanceof Error ? e.message : String(e);
      throw new BadRequestException(`Error al completar la instalación: ${msg}`);
    }
  }

  async validateUser(email: string, password: string) {
    const normalized = this.normalizeEmail(email);
    const user = await this.prisma.user.findUnique({
      where: { email: normalized },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user || !user.isActive) throw new UnauthorizedException();
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException();
    return user;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwt.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: user.userRoles.map((ur: any) => ({
          key: ur.role.key,
          name: ur.role.name,
          workSiteId: ur.workSiteId,
        })),
      },
    };
  }

  async register(email: string, password: string, fullName: string, createdByUserId?: string) {
    const hash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: this.normalizeEmail(email),
        passwordHash: hash,
        fullName,
        createdByUserId,
      },
    });
    return user;
  }
}
