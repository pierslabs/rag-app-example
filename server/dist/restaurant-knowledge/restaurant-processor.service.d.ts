import { DocumentBuilderService } from '../document-builder/document-builder.service';
import { EmbedingGeneratorService } from '../embeding-generator/embeding-generator.service';
import { VectorDbService } from '../vector-db/vector-db.service';
import { RestaurantChunkerService } from './restaurant-chunker.service';
export declare class RestaurantProcessorService {
    private readonly documentBuilder;
    private readonly embeddingGenerator;
    private readonly vectorDbService;
    private readonly restaurantChunker;
    private readonly logger;
    constructor(documentBuilder: DocumentBuilderService, embeddingGenerator: EmbedingGeneratorService, vectorDbService: VectorDbService, restaurantChunker: RestaurantChunkerService);
    processAndStoreAllData(): Promise<void>;
    processSpecificData(dataType: string): Promise<void>;
    private detectChunkSource;
    private createCacheDocument;
    private getDataTypesFromDocuments;
    getProcessingStats(): Promise<any>;
}
