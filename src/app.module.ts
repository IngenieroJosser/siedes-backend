import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PredictionModule } from './prediction/prediction.module';
import { StudentsModule } from './students/students.module';
import { UserModule } from './user/user.module';
import { InstitutionModule } from './institution/institution.module';
import { HelpModule } from './help/help.module';
import { AuthModule } from './auth/auth.module';
import { AlertsModule } from './alerts/alerts.module';
import { InterventionsModule } from './interventions/interventions.module';

@Module({
  imports: [
    PrismaModule, 
    PredictionModule, 
    StudentsModule, 
    UserModule, InstitutionModule, 
    HelpModule, 
    AuthModule, 
    AlertsModule, 
    InterventionsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
