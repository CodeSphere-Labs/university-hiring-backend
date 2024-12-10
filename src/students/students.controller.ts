import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { Roles } from 'src/common/guards/role.guard';
import { TransformDataInterceptor } from 'src/common/transform.data';
import { ResponseStudentDto } from 'src/students/dto/student.response.dto';
import { StudentsService } from 'src/students/students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @Roles(['ADMIN', 'STAFF'])
  @UseInterceptors(new TransformDataInterceptor(ResponseStudentDto))
  async getStudentsList() {
    return this.studentsService.studentList();
  }
}
