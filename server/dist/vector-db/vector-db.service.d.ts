import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilderService } from '../document-builder/document-builder.service';
export interface DocumentChunk {
    id: string;
    text: string;
    metadata?: Record<string, any>;
}
export interface SearchResult {
    id: string;
    text: string;
    distance: number;
    metadata?: Record<string, any>;
}
export declare class VectorDbService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private readonly logger;
    private client;
    private collection;
    private readonly collectionName;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private ensureCollection;
    addDocuments(documents: DocumentChunk[], embeddings: number[][]): Promise<boolean>;
    searchSimilar(queryEmbedding: number[], nResults?: number): Promise<SearchResult[]>;
    searchSimilarWithFilter(queryEmbedding: number[], nResults?: number, filter?: Record<string, any>): Promise<SearchResult[]>;
    searchBySource(queryEmbedding: number[], source: string, nResults?: number): Promise<SearchResult[]>;
    getDocumentsBySource(source: string): Promise<SearchResult[]>;
    deleteCollection(): Promise<boolean>;
    getCollectionInfo(): Promise<{
        name: string;
        count: any;
        metadata: any;
    }>;
    getCollectionStats(): Promise<any>;
    resetCollection(): Promise<boolean>;
    collectionExists(): Promise<boolean>;
    loadFromCache(documentBuilder: DocumentBuilderService): Promise<void>;
    syncCacheStatus(): Promise<boolean>;
}
