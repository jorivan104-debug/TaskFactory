import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskAssignmentStatus } from './create-task-assignment.dto';

export class UpdateTaskAssignmentDto {
  @ApiProperty({ enum: TaskAssignmentStatus })
  @IsEnum(TaskAssignmentStatus)
  status: TaskAssignmentStatus;
}
