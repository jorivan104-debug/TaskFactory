import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { CreateTaskAssignmentDto } from './dto/create-task-assignment.dto';
import { UpdateTaskAssignmentDto } from './dto/update-task-assignment.dto';

@ApiTags('Employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly service: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'List employees' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create employee' })
  create(@Body() dto: CreateEmployeeDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update employee' })
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.service.update(id, dto);
  }

  // ── Time Entries ──

  @Get(':id/time-entries')
  @ApiOperation({ summary: 'List time entries for employee' })
  findTimeEntries(@Param('id') id: string) {
    return this.service.findTimeEntries(id);
  }

  @Post(':id/time-entries')
  @ApiOperation({ summary: 'Create time entry (clock in)' })
  createTimeEntry(
    @Param('id') id: string,
    @Body() dto: CreateTimeEntryDto,
    @CurrentUser() user: any,
  ) {
    return this.service.createTimeEntry(id, dto, user.id);
  }

  @Patch('time-entries/:entryId')
  @ApiOperation({ summary: 'Clock out time entry' })
  clockOut(@Param('entryId') entryId: string) {
    return this.service.clockOut(entryId);
  }

  // ── Task Assignments ──

  @Get(':id/tasks')
  @ApiOperation({ summary: 'List task assignments for employee' })
  findTaskAssignments(@Param('id') id: string) {
    return this.service.findTaskAssignments(id);
  }

  @Post(':id/tasks')
  @ApiOperation({ summary: 'Assign task to employee' })
  createTaskAssignment(
    @Param('id') id: string,
    @Body() dto: CreateTaskAssignmentDto,
    @CurrentUser() user: any,
  ) {
    return this.service.createTaskAssignment(id, dto, user.id);
  }

  @Patch('tasks/:taskId')
  @ApiOperation({ summary: 'Update task assignment status' })
  updateTaskAssignment(
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskAssignmentDto,
  ) {
    return this.service.updateTaskAssignment(taskId, dto);
  }
}
