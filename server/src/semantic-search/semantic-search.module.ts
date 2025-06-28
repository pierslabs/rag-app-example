import { Module } from '@nestjs/common';
import { SemanticSearchService } from './semantic-search.service';
import { SemanticSearchController } from './semantic-search.controller';
import { RestaurantKnowledgeModule } from '../restaurant-knowledge/restaurant-knowledge.module';
import { EmbedingGeneratorModule } from '../embeding-generator/embeding-generator.module';
import { VectorDbModule } from '../vector-db/vector-db.module';
import { LLMGeneratorModule } from '../llm-generator/llm-genrator.module';

@Module({
  controllers: [SemanticSearchController],
  providers: [SemanticSearchService],
  imports: [
    RestaurantKnowledgeModule,
    EmbedingGeneratorModule,
    VectorDbModule,
    LLMGeneratorModule,
  ],
  exports: [SemanticSearchService],
})
export class SemanticSearchModule {}
