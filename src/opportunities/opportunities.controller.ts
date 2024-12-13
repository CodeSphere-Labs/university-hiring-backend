import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from 'src/common/guards/role.guard';
import {
  UserInterceptor,
  UserInterceptorRequest,
} from 'src/common/interceptors/user.interceptor';
import { CreateOpportunityDto } from 'src/opportunities/dto/create.opportunity.dto';
import { OpportunitiesService } from 'src/opportunities/opportunities.service';

@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunityService: OpportunitiesService) {}

  @Get()
  async all() {
    return this.opportunityService.findAll();
  }

  @Post()
  @UseInterceptors(UserInterceptor)
  @Roles(['ADMIN', 'STAFF'])
  async create(
    @Req() request: UserInterceptorRequest,
    @Body() dto: CreateOpportunityDto,
  ) {
    return this.opportunityService.create(dto, request.user);
  }
}
