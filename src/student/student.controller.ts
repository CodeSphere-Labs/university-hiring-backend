import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { StudentService } from './student.service';
import { AddProjectDto } from './dto/add-project.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  UserInterceptor,
  UserInterceptorRequest,
} from 'src/common/interceptors/user.interceptor';
import { Request } from '@nestjs/common';

@Controller('students')
@UseInterceptors(UserInterceptor)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post('projects')
  @ApiOperation({ summary: 'Add a new project to student profile' })
  @ApiResponse({
    status: 201,
    description: 'Project has been successfully added',
  })
  async addProject(
    @Request() req: UserInterceptorRequest,
    @Body() project: AddProjectDto,
  ) {
    return await this.studentService.addProject(req.user.id, project);
  }
}
