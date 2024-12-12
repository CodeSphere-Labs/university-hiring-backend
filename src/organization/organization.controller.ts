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
  UseInterceptors,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/CreateOrganization.dto';
import { OrganizationService } from './organization.service';
import { Roles } from 'src/common/guards/role.guard';
import { TransformDataInterceptor } from 'src/common/transform.data';
import { OrganizationResponseDto } from 'src/organization/dto/organization.response.dto';
import { ChangeOrganizationDto } from 'src/organization/dto/change.organization.dto';

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

  @Patch(':id')
  async changeOrganization(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ChangeOrganizationDto,
  ) {
    return this.organizationService.change(id, body);
  }

  @Patch(':id/favorites/:studentId')
  @UseInterceptors(new TransformDataInterceptor(OrganizationResponseDto))
  async addFavoriteStudent(
    @Param('id', ParseIntPipe) organizationId: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.organizationService.addFavoriteStudent(
      organizationId,
      studentId,
    );
  }

  @Delete(':id/favorites/:studentId')
  @UseInterceptors(new TransformDataInterceptor(OrganizationResponseDto))
  async removeFavoriteStudent(
    @Param('id', ParseIntPipe) organizationId: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.organizationService.removeFavoriteStudent(
      organizationId,
      studentId,
    );
  }

  @Post()
  @Roles(['ADMIN'])
  async registration(@Body() registrationDto: CreateOrganizationDto) {
    return this.organizationService.registration(registrationDto);
  }
}
