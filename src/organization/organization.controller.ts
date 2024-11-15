import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/CreateOrganization.dto';
import { OrganizationService } from './organization.service';
import { Roles } from 'src/common/guards/role.guard';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  async all() {
    return this.organizationService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string | number) {
    return this.organizationService.getById(Number(id));
  }

  @Post()
  @Roles(['ADMIN'])
  async registration(@Body() registrationDto: CreateOrganizationDto) {
    return this.organizationService.registration(registrationDto);
  }
}
