import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TaskAssignmentStatus {
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class CreateTaskAssignmentDto {
  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  workOrderId: string;

  @ApiPropertyOptional({ example: 'Sewing collars' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  taskDescription?: string;

  @ApiPropertyOptional({ enum: TaskAssignmentStatus, default: TaskAssignmentStatus.ASSIGNED })
  @IsOptional()
  @IsEnum(TaskAssignmentStatus)
  status?: TaskAssignmentStatus;
}
