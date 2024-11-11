import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/CreateOrganization.dto';
import { OrganizationService } from './organization.service';

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
  async registration(@Body() registrationDto: CreateOrganizationDto) {
    return this.organizationService.registration(registrationDto);
  }
}
