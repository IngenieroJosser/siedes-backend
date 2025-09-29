import { Module } from '@nestjs/common';
import { InstitutionService } from './institution.service';
import { InstitutionController } from './institution.controller';

@Module({
  providers: [InstitutionService],
  controllers: [InstitutionController]
})
export class InstitutionModule {}
