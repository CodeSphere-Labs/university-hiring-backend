import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from 'src/common/guards/role.guard';
import { AllGroupsInterceptor } from 'src/common/interceptors/all.groups.interceptor';
import { AddStudentToGroupRequestDto } from 'src/groups/dto/addStudentToGroup.request.dto';
import { CreateGroupRequestDto } from 'src/groups/dto/create.group.request.dto';
import { GroupsService } from 'src/groups/groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @UseInterceptors(new AllGroupsInterceptor())
  async getAll(
    @Query('withStudents', new DefaultValuePipe(false), ParseBoolPipe)
    withStudents: boolean,
    @Query('search') search?: string,
  ) {
    return this.groupsService.getAll(withStudents, search);
  }

  @Get(':id')
  @UseInterceptors(new AllGroupsInterceptor())
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @Query('withStudents', new DefaultValuePipe(false), ParseBoolPipe)
    withStudents: boolean,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    return this.groupsService.getById(id, withStudents, page, limit, search);
  }

  @Post()
  @Roles(['ADMIN', 'UNIVERSITY_STAFF'])
  async create(@Body() createDto: CreateGroupRequestDto) {
    return this.groupsService.createGroup(createDto);
  }

  @Post('/addStudent')
  @Roles(['ADMIN', 'UNIVERSITY_STAFF'])
  async addStudentToGroup(@Body() addStudentDto: AddStudentToGroupRequestDto) {
    return this.groupsService.addStudentToGroup(addStudentDto);
  }

  @Delete(':id')
  @Roles(['ADMIN', 'UNIVERSITY_STAFF'])
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.delete(id);
  }

  @Get(':id/students')
  @UseInterceptors(new AllGroupsInterceptor())
  async getStudentsByGroupId(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.getStudentsByGroupId(id);
  }
}
