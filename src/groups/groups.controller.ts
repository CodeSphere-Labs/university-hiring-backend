import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from 'src/common/guards/role.guard';
import { AllGroupsInterceptor } from 'src/common/interceptors/all.groups.interceptor';
import { CreateGroupRequestDto } from 'src/groups/dto/create.group.request.dto';
import { GroupsService } from 'src/groups/groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @UseInterceptors(new AllGroupsInterceptor())
  async getAll() {
    return this.groupsService.getAll();
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.getById(id);
  }

  @Post()
  @Roles(['ADMIN', 'STAFF'])
  async create(@Body() createDto: CreateGroupRequestDto) {
    return this.groupsService.createGroup(createDto);
  }
}
