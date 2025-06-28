import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LLMGeneratorService } from './llm-genrator.service';

@Module({
  imports: [ConfigModule],
  providers: [LLMGeneratorService],
  exports: [LLMGeneratorService],
})
export class LLMGeneratorModule {}
