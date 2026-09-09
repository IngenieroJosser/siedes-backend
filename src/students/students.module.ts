import { Module, forwardRef } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { PredictionModule } from '../prediction/prediction.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => UserModule),
    PredictionModule,
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}