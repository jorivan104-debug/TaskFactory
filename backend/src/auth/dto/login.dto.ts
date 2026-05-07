import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'jorivan104@hotmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'e7sacxtf' })
  @IsNotEmpty()
  password: string;
}
