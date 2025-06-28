import { Module } from '@nestjs/common';
import { RestaurantKnowledgeService } from './restaurant-knowledge.service';
import { RestaurantProcessorService } from './restaurant-processor.service';
import { RestaurantChunkerService } from './restaurant-chunker.service';
import { EmbedingGeneratorModule } from '../embeding-generator/embeding-generator.module';
import { VectorDbModule } from '../vector-db/vector-db.module';
import { DocumentBuilderModule } from '../document-builder/document-builder.module';

@Module({
  providers: [
    RestaurantKnowledgeService,
    RestaurantProcessorService,
    RestaurantChunkerService,
  ],
  imports: [DocumentBuilderModule, EmbedingGeneratorModule, VectorDbModule],
  exports: [RestaurantKnowledgeService],
})
export class RestaurantKnowledgeModule {}
