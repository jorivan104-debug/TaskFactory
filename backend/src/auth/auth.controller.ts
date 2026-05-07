import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { BootstrapSetupDto } from './dto/bootstrap-setup.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  @ApiOperation({ summary: 'Iniciar sesión' })
  async login(@Request() req: any, @Body() _dto: LoginDto) {
    return this.authService.login(req.user);
  }
}
