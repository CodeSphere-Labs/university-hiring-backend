import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from 'src/common/guards/role.guard';
import { AllOpportunityInterceptor } from 'src/common/interceptors/all.opportunity.interceptor';
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
  @UseInterceptors(new AllOpportunityInterceptor())
  async all(
    @Query('withResponses', new DefaultValuePipe(false), ParseBoolPipe)
    withResponses: boolean,
  ) {
    return this.opportunityService.findAll(withResponses);
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

  @Patch('response/:opportunityId')
  @UseInterceptors(UserInterceptor)
  @Roles(['STUDENT'])
  async response(
    @Req() request: UserInterceptorRequest,
    @Param('opportunityId', ParseIntPipe) opportunityId: number,
    @Body('coverLetter') coverLetter?: string,
  ) {
    return this.opportunityService.response(
      opportunityId,
      request.user,
      coverLetter,
    );
  }
}
