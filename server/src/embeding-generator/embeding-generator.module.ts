import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmbedingGeneratorService } from './embeding-generator.service';
import { OpenAIEmbeddingGenerator } from './embending-generator-models/openai.embending-generator';

@Module({
  imports: [ConfigModule],
  providers: [EmbedingGeneratorService, OpenAIEmbeddingGenerator],
  exports: [EmbedingGeneratorService],
})
export class EmbedingGeneratorModule {}
