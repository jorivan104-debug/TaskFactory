import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { WorkosService } from './workos.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: (config.get<string>('JWT_SECRET', 'change-me') ?? 'change-me').trim(),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRATION', '1d') ?? '1d').trim(),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, WorkosService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
