import { Module } from '@nestjs/common';
import { SemanticSearchModule } from './semantic-search/semantic-search.module';
import { ConfigModule } from './config/config.module';
import { EmbedingGeneratorModule } from './embeding-generator/embeding-generator.module';
import { VectorDbModule } from './vector-db/vector-db.module';
import { LLMGeneratorModule } from './llm-generator/llm-genrator.module';
import { RestaurantKnowledgeModule } from './restaurant-knowledge/restaurant-knowledge.module';

@Module({
  imports: [
    ConfigModule,
    SemanticSearchModule,
    EmbedingGeneratorModule,
    VectorDbModule,
    LLMGeneratorModule,
    RestaurantKnowledgeModule,
  ],
})
export class AppModule {}
