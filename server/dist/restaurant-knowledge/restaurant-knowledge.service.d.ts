import { DocumentBuilderService } from '../document-builder/document-builder.service';
import { VectorDbService } from '../vector-db/vector-db.service';
import { RestaurantProcessorService } from './restaurant-processor.service';
export declare class RestaurantKnowledgeService {
    private readonly documentBuilder;
    private readonly vectorDbService;
    private readonly restaurantProcessor;
    private readonly logger;
    constructor(documentBuilder: DocumentBuilderService, vectorDbService: VectorDbService, restaurantProcessor: RestaurantProcessorService);
    initializeKnowledgeBase(): Promise<void>;
    refreshKnowledgeBase(): Promise<void>;
    addNewData(dataType: string): Promise<void>;
    resetKnowledgeBase(): Promise<boolean>;
    getKnowledgeBaseInfo(): Promise<any>;
    isInitialized(): Promise<boolean>;
    private loadFromCache;
    private updateCacheAfterAddition;
}
