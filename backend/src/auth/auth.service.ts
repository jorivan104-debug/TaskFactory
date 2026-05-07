import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { applyBaselineSeed } from '../database/baseline-seed';

@Injectable()
export class AuthService {
  private readonly log = new Logger(AuthService.name);

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
      throw new ForbiddenException(
        'La instalación ya fue completada (hay al menos un usuario). Use inicio de sesión. Si usó semilla: admin@taskfactory.co / admin123',
      );
    }

    const email = this.normalizeEmail(dto.email);
    const hash = await bcrypt.hash(dto.password, 10);

    let userId: string;
    try {
      userId = await this.prisma.$transaction(
        async (tx) => {
          const user = await tx.user.create({
            data: {
              email,
              passwordHash: hash,
              fullName: dto.fullName?.trim() || 'Administrador',
            },
          });

          await applyBaselineSeed(tx, user.id);
          return user.id;
        },
        {
          maxWait: 60000,
          timeout: 180000,
        },
      );
    } catch (e) {
      this.log.warn(`bootstrapFirstAdmin falló: ${e instanceof Error ? e.stack : String(e)}`);
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ConflictException('Ese correo ya está registrado.');
        }
        if (e.code === 'P2003') {
          throw new BadRequestException(
            `Violación de integridad (${e.code}). Ejecute migraciones en el backend (prisma migrate deploy) y verifique DATABASE_URL.`,
          );
        }
        if (e.code === 'P2028') {
          throw new BadRequestException(
            'Tiempo de espera de la transacción agotado. Intente de nuevo; si persiste, revise carga de la base de datos.',
          );
        }
        const meta = e.meta ? ` ${JSON.stringify(e.meta)}` : '';
        throw new BadRequestException(
          `No se pudo crear la instalación inicial (${e.code}).${meta} Revise migraciones y logs del backend.`,
        );
      }
      if (e instanceof UnauthorizedException || e instanceof ForbiddenException) throw e;
      if (e instanceof Error && e.name === 'PrismaClientValidationError') {
        throw new BadRequestException(`Error de validación Prisma: ${e.message}`);
      }
      const msg = e instanceof Error ? e.message : String(e);
      throw new BadRequestException(`Error al completar la instalación: ${msg}`);
    }

    const full = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    });
    if (!full) {
      throw new BadRequestException('Usuario creado pero no se pudo recargar. Intente iniciar sesión.');
    }

    try {
      return this.login(full);
    } catch (e) {
      this.log.error(`JWT tras instalación: ${e instanceof Error ? e.message : e}`);
      throw new BadRequestException(
        'La cuenta y catálogos se crearon, pero falló la firma del token. Revise JWT_SECRET (sin saltos de línea) e intente iniciar sesión con el correo y contraseña que definió.',
      );
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
