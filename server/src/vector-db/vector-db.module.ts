import { Module } from '@nestjs/common';

import { VectorDbService } from './vector-db.service';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [VectorDbService],
  exports: [VectorDbService],
})
export class VectorDbModule {}
