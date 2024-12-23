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
  ) {
    return this.groupsService.getAll(withStudents);
  }

  @Get(':id')
  @UseInterceptors(new AllGroupsInterceptor())
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @Query('withStudents', new DefaultValuePipe(false), ParseBoolPipe)
    withStudents: boolean,
  ) {
    return this.groupsService.getById(id, withStudents);
  }

  @Post()
  @Roles(['ADMIN', 'STAFF'])
  async create(@Body() createDto: CreateGroupRequestDto) {
    return this.groupsService.createGroup(createDto);
  }

  @Post('/addStudent')
  @Roles(['ADMIN', 'STAFF'])
  async addStudentToGroup(@Body() addStudentDto: AddStudentToGroupRequestDto) {
    return this.groupsService.addStudentToGroup(addStudentDto);
  }

  @Delete(':id')
  @Roles(['ADMIN', 'STAFF'])
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.delete(id);
  }
}
