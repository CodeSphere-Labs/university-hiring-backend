import {
  Controller,
  Post,
  Body,
  Get,
  UseInterceptors,
  Req,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { PracticesService } from './practices.service';
import { CreatePracticeDto } from './dto/create.practice.dto';
import { Roles } from 'src/common/guards/role.guard';
import {
  UserInterceptor,
  UserInterceptorRequest,
} from 'src/common/interceptors/user.interceptor';
import { AllPracticesInterceptor } from '../common/interceptors/all.practices.interceptor';

@Controller('practices')
export class PracticesController {
  constructor(private readonly practicesService: PracticesService) {}

  @Post()
  @Roles(['ADMIN', 'UNIVERSITY_STAFF'])
  @UseInterceptors(UserInterceptor)
  create(
    @Body() createPracticeDto: CreatePracticeDto,
    @Req() request: UserInterceptorRequest,
  ) {
    return this.practicesService.create(createPracticeDto, request.user);
  }

  @Get()
  @Roles(['ADMIN', 'UNIVERSITY_STAFF', 'STAFF', 'STUDENT'])
  @UseInterceptors(UserInterceptor, new AllPracticesInterceptor())
  findAll(
    @Req() request: UserInterceptorRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('filter') filter?: 'all' | 'createdByMe' | 'assignedToMe',
    @Query('search') search?: string,
  ) {
    return this.practicesService.findPractices(request.user, {
      page,
      limit,
      filter,
      search,
    });
  }

  @Get(':id')
  @Roles(['ADMIN', 'UNIVERSITY_STAFF', 'STAFF', 'STUDENT'])
  @UseInterceptors(UserInterceptor, new AllPracticesInterceptor())
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.practicesService.findPracticeById(id);
  }
}
