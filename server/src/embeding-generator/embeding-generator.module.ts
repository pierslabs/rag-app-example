import { Module } from '@nestjs/common';

import { EmbedingGeneratorService } from './embeding-generator.service';
import { OpenAIEmbeddingGenerator } from './embending-generator-models/openai.embending-generator';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [EmbedingGeneratorService, OpenAIEmbeddingGenerator],
  exports: [EmbedingGeneratorService],
})
export class EmbedingGeneratorModule {}
