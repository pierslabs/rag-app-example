import { Module } from '@nestjs/common';

import { LLMGeneratorService } from './llm-genrator.service';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [LLMGeneratorService],
  exports: [LLMGeneratorService],
})
export class LLMGeneratorModule {}
