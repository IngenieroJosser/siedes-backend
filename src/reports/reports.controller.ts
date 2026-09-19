import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateInstitutionReportDto } from './dto/create-report.dto';
import { UpdateInstitutionReportDto } from './dto/update-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Post()
  create(@Body() dto: CreateInstitutionReportDto) { return this.service.create(dto); }

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInstitutionReportDto) { return this.service.update(id, dto); }

  @Post(':id/finalize')
  finalize(@Param('id') id: string) { return this.service.finalize(id); }
}
