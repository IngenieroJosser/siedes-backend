import { Global, Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { MlEventService } from './ml-event.service';
import { MlOutboxWorker } from './ml-outbox.worker';
import { MlTrainingExportService } from './ml-training-export.service';
import { MlController } from './ml.controller';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [MlController],
  providers: [MlEventService, MlOutboxWorker, MlTrainingExportService],
  exports: [MlEventService, MlOutboxWorker],
})
export class MlModule {}
