import { Logger } from '@nestjs/common';
import { SemanticSearchService } from './semantic-search.service';
import { Observable } from 'rxjs';
export declare class SemanticSearchController {
    private readonly semanticSearchService;
    logger: Logger;
    constructor(semanticSearchService: SemanticSearchService);
    search(body: {
        question: string;
        maxResults?: number;
    }): Promise<{
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
    searchByCategory(body: {
        question: string;
        category: string;
        maxResults?: number;
    }): Promise<{
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
    ragResponse(body: {
        question: string;
        maxResults?: number;
    }): Promise<{
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
    ragStreamResponse(question: string, maxResults?: string): Promise<Observable<any>>;
    getAvailableCategories(): Promise<{
        categories: string[];
        timestamp: string;
    }>;
    getKnowledgeBaseInfo(): Promise<any>;
    getSearchStats(): Promise<any>;
    refreshKnowledgeBase(): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
    }>;
    resetKnowledgeBase(): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
    }>;
    regenerateEmbeddings(): Promise<{
        success: boolean;
        message: string;
        details: any;
        timestamp: string;
    }>;
    processSpecificData(body: {
        dataType: string;
    }): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
    }>;
}
