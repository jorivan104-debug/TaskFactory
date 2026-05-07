import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class BootstrapSetupDto {
  @ApiProperty({ example: 'admin@mifabrica.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8, description: 'Mínimo 8 caracteres' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @ApiPropertyOptional({ example: 'Administrador' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;
}
