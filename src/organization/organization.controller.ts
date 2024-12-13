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
import { CreateOrganizationDto } from './dto/CreateOrganization.dto';
import { OrganizationService } from './organization.service';
import { Roles } from 'src/common/guards/role.guard';
import { TransformDataInterceptor } from 'src/common/transform.data';
import { OrganizationResponseDto } from 'src/organization/dto/organization.response.dto';
import { ChangeOrganizationDto } from 'src/organization/dto/change.organization.dto';
import {
  UserInterceptor,
  UserInterceptorRequest,
} from 'src/common/interceptors/user.interceptor';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  async all() {
    return this.organizationService.findAll();
  }

  @Get(':id')
  @UseInterceptors(new TransformDataInterceptor(OrganizationResponseDto))
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @Query('withFavorites', new DefaultValuePipe(false), ParseBoolPipe)
    withFavorites: boolean,
  ) {
    return this.organizationService.getById(id, withFavorites);
  }

  @Patch()
  @UseInterceptors(UserInterceptor)
  async changeOrganization(
    @Req() request: UserInterceptorRequest,
    @Body() body: ChangeOrganizationDto,
  ) {
    return this.organizationService.change(request.user.organizationId, body);
  }

  @Patch('favorites/:studentId')
  @UseInterceptors(UserInterceptor)
  @UseInterceptors(new TransformDataInterceptor(OrganizationResponseDto))
  async addFavoriteStudent(
    @Req() request: UserInterceptorRequest,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.organizationService.addFavoriteStudent(
      request.user.organizationId,
      studentId,
    );
  }

  @Delete('favorites/:studentId')
  @UseInterceptors(UserInterceptor)
  @UseInterceptors(new TransformDataInterceptor(OrganizationResponseDto))
  async removeFavoriteStudent(
    @Req() request: UserInterceptorRequest,

    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.organizationService.removeFavoriteStudent(
      request.user.organizationId,
      studentId,
    );
  }

  @Post()
  @Roles(['ADMIN'])
  async registration(@Body() registrationDto: CreateOrganizationDto) {
    return this.organizationService.registration(registrationDto);
  }
}
