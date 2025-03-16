import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { AddProjectDto } from './dto/add-project.dto';
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
  async addProject(
    @Request() req: UserInterceptorRequest,
    @Body() project: AddProjectDto,
  ) {
    return await this.studentService.addProject(req.user.id, project);
  }

  @Delete('projects/:id')
  async deleteProject(
    @Request() req: UserInterceptorRequest,
    @Param('id') projectId: string,
  ) {
    return await this.studentService.deleteProject(req.user.id, projectId);
  }
}
