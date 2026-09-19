import { PartialType } from '@nestjs/swagger';
import { CreateInstitutionReportDto } from './create-report.dto';

export class UpdateInstitutionReportDto extends PartialType(CreateInstitutionReportDto) {}
