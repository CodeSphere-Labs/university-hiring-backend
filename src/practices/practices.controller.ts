import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { PracticesService } from './practices.service';
import { CreatePracticeDto } from './dto/create.practice.dto';
import { Roles } from 'src/common/guards/role.guard';
import {
  UserInterceptor,
  UserInterceptorRequest,
} from 'src/common/interceptors/user.interceptor';

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

  @Get('university/:universityId')
  @Roles(['ADMIN', 'UNIVERSITY_STAFF'])
  findByUniversity(@Param('universityId', ParseIntPipe) universityId: number) {
    return this.practicesService.findByUniversity(universityId);
  }

  @Get('organization/:organizationId')
  @Roles(['ADMIN', 'STAFF'])
  findByOrganization(
    @Param('organizationId', ParseIntPipe) organizationId: number,
  ) {
    return this.practicesService.findByOrganization(organizationId);
  }
}
