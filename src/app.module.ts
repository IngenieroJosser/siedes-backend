import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PredictionModule } from './prediction/prediction.module';
import { StudentsModule } from './students/students.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [PrismaModule, PredictionModule, StudentsModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
