import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
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
import { OpportunityResponsesInterceptor } from 'src/common/interceptors/opportunity.responses.interceptor';
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
  @UseInterceptors(UserInterceptor)
  async all(
    @Query('withResponses', new DefaultValuePipe(false), ParseBoolPipe)
    withResponses: boolean,
    @Query('createdByMe', new DefaultValuePipe(false), ParseBoolPipe)
    createdByMe: boolean,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Req() request: UserInterceptorRequest,
    @Query('search') search?: string,
  ) {
    return this.opportunityService.findAll(
      withResponses,
      createdByMe,
      page,
      limit,
      request.user,
      search,
    );
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
    const response = await this.opportunityService.response(
      opportunityId,
      request.user,
      coverLetter,
    );
    return {
      ...response,
      userId: request.user.id,
    };
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) opportunityId: number) {
    return this.opportunityService.getById(opportunityId);
  }

  @Get(':id/responses')
  @UseInterceptors(new OpportunityResponsesInterceptor())
  async getResponses(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status', new DefaultValuePipe('waiting'))
    status: 'waiting' | 'accepted' | 'rejected',
  ) {
    return this.opportunityService.getResponses(id, page, limit, status);
  }

  @Patch(':id/responses/:responseId/status')
  @Roles(['ADMIN', 'STAFF'])
  async updateResponseStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('responseId', ParseIntPipe) responseId: number,
    @Body('status') status: 'accepted' | 'rejected' | 'waiting',
  ) {
    return this.opportunityService.updateResponseStatus(id, responseId, status);
  }

  @Delete(':id')
  @Roles(['ADMIN', 'STAFF'])
  async delete(@Param('id', ParseIntPipe) opportunityId: number) {
    return this.opportunityService.delete(opportunityId);
  }
}
