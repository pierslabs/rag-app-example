import { EmbedingGeneratorService } from '../embeding-generator/embeding-generator.service';
import { VectorDbService } from '../vector-db/vector-db.service';
import { LLMGeneratorService } from '../llm-generator/llm-genrator.service';
import { RestaurantKnowledgeService } from '../restaurant-knowledge/restaurant-knowledge.service';
export declare class SemanticSearchService {
    private readonly embeddingGenerator;
    private readonly vectorDbService;
    private readonly llmGenerator;
    private readonly restaurantKnowledge;
    private readonly logger;
    private isInitialized;
    private initializationPromise;
    constructor(embeddingGenerator: EmbedingGeneratorService, vectorDbService: VectorDbService, llmGenerator: LLMGeneratorService, restaurantKnowledge: RestaurantKnowledgeService);
    ragResponse(question: string, maxResults?: number): Promise<{
        question: string;
        answer: string;
        context: {
            sources: {
                text: string;
                relevanceScore: string;
                metadata: Record<string, any> | undefined;
                source: any;
            }[];
            totalSources: number;
        };
        models: {
            embedding: string;
            llm: string;
        };
        timestamp: string;
    }>;
    ragStreamResponse(question: string, maxResults?: number): AsyncGenerator<string, void, unknown>;
    regenerateAllEmbeddings(): Promise<any>;
    processSpecificDataType(dataType: string): Promise<void>;
    checkCacheMigration(): Promise<{
        needsMigration: boolean;
        reason?: string;
    }>;
    private ensureInitialized;
    private initializeSearch;
    semanticSearch(question: string, maxResults?: number): Promise<{
        question: string;
        model: string;
        resultsCount: number;
        results: {
            rank: number;
            relevanceScore: string;
            text: string;
            metadata: Record<string, any> | undefined;
            distance: string;
            source: any;
        }[];
        timestamp: string;
    }>;
    searchByCategory(question: string, category: string, maxResults?: number): Promise<{
        question: string;
        category: string;
        model: string;
        resultsCount: number;
        results: {
            rank: number;
            relevanceScore: string;
            text: string;
            metadata: Record<string, any> | undefined;
            distance: string;
            source: any;
        }[];
        timestamp: string;
    }>;
    getAvailableCategories(): Promise<string[]>;
    resetKnowledgeBase(): Promise<boolean>;
    refreshKnowledgeBase(): Promise<boolean>;
    getKnowledgeBaseInfo(): Promise<any>;
    getSearchStats(): Promise<any>;
}
