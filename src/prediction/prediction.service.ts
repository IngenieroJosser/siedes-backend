import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class PredictionService {
  constructor(private readonly prisma: PrismaService) {}
}
