import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { WorkosService } from './workos.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { BootstrapSetupDto } from './dto/bootstrap-setup.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly log = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly workos: WorkosService,
  ) {}

  @Get('setup-status')
  @ApiOperation({ summary: 'Indica si hace falta crear el primer administrador (BD sin usuarios)' })
  setupStatus() {
    return this.authService.getSetupStatus();
  }

  @Post('setup')
  @ApiOperation({
    summary: 'Instalación inicial: crear primer administrador y catálogos base (solo si no hay usuarios)',
  })
  bootstrap(@Body() dto: BootstrapSetupDto) {
    return this.authService.bootstrapFirstAdmin(dto);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Iniciar sesión con correo y contraseña (legacy)' })
  async login(@Request() req: any, @Body() _dto: LoginDto) {
    return this.authService.login(req.user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Devuelve el usuario actual a partir del token JWT' })
  me(@CurrentUser() user: { id: string }) {
    return this.authService.me(user.id);
  }

  @Get('workos/status')
  @ApiOperation({ summary: 'Indica si el login con WorkOS AuthKit está disponible' })
  workosStatus() {
    return { enabled: this.workos.isEnabled() };
  }

  @Get('workos/login')
  @ApiOperation({ summary: 'Inicia el flujo de WorkOS AuthKit (302 al proveedor)' })
  workosLogin(@Res() res: Response) {
    const url = this.workos.getAuthorizationUrl();
    return res.redirect(url);
  }

  @Get('workos/callback')
  @ApiOperation({
    summary: 'Callback de WorkOS: intercambia el code, valida el correo y redirige al frontend',
  })
  async workosCallback(
    @Query('code') code: string | undefined,
    @Query('error') error: string | undefined,
    @Query('error_description') errorDescription: string | undefined,
    @Res() res: Response,
    @Req() req: any,
  ) {
    const frontendUrl = this.workos.getFrontendUrl() || this.inferOrigin(req);
    const target = (path: string) => {
      if (!frontendUrl) return path;
      return `${frontendUrl.replace(/\/+$/, '')}${path}`;
    };

    if (error) {
      this.log.warn(`WorkOS callback error: ${error} ${errorDescription ?? ''}`);
      return res.redirect(target(`/login?error=${encodeURIComponent(errorDescription ?? error)}`));
    }
    if (!code) {
      throw new BadRequestException('Falta el parámetro "code" en el callback de WorkOS.');
    }

    try {
      const { user } = await this.workos.authenticateWithCode(code);
      const email = user?.email;
      if (!email) {
        throw new BadRequestException('WorkOS no devolvió un correo asociado al usuario.');
      }
      const session = await this.authService.loginByEmailOnly(email);
      const token = session.accessToken;
      return res.redirect(target(`/login?token=${encodeURIComponent(token)}`));
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : 'No fue posible completar el inicio de sesión con WorkOS.';
      this.log.warn(`WorkOS callback fallo: ${msg}`);
      return res.redirect(target(`/login?error=${encodeURIComponent(msg)}`));
    }
  }

  private inferOrigin(req: any): string | null {
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    if (!host) return null;
    return `${proto}://${host}`;
  }
}
