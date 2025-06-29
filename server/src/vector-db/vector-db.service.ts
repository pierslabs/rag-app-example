import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { ChromaClient } from 'chromadb';
import { DocumentBuilderService } from '../document-builder/document-builder.service';
import { ConfigService } from '../config/config.service';

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

class CustomEmbeddingFunction {
  async generate(texts: string[]): Promise<number[][]> {
    throw new Error(
      'This function should not be called - we use our own embeddings',
    );
  }
}

@Injectable()
export class VectorDbService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('VectorDbService');
  private client: ChromaClient;
  private collection: any;
  private readonly collectionName = 'restaurant_knowledge';

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      const chromaUrl =
        this.configService.database.chromaUrl || 'http://localhost:8000';

      const url = new URL(chromaUrl);
      const host = url.hostname;
      const port = parseInt(url.port) || 8000;

      this.client = new ChromaClient({
        host: host,
        port: port,
      });

      this.logger.log(`Connect ChromaDB : ${host}:${port}`);

      await this.client.heartbeat();
      this.logger.log('Connection to ChromaDB established successfully');

      await this.ensureCollection();
    } catch (error) {
      this.logger.error('ChromaDB connection error:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('Closing connection to ChromaDB');
  }

  private async ensureCollection() {
    try {
      this.collection = await this.client.getCollection({
        name: this.collectionName,
      });
      this.logger.log(`Collection '${this.collectionName}' found`);
    } catch (error) {
      this.logger.log(`Creating new collection '${this.collectionName}'`);

      // Create collection with custom embedding function
      this.collection = await this.client.createCollection({
        name: this.collectionName,
        metadata: {
          description: 'Restaurant knowledge for semantic search',
          created_at: new Date().toISOString(),
        },
        embeddingFunction: new CustomEmbeddingFunction(),
      });

      this.logger.log(
        `Collection '${this.collectionName}' created successfully`,
      );
    }
  }

  async addDocuments(documents: DocumentChunk[], embeddings: number[][]) {
    try {
      if (documents.length !== embeddings.length) {
        throw new Error('Number of documents must match number of embeddings');
      }

      this.logger.log(`Adding ${documents.length} documents to ChromaDB...`);

      const ids = documents.map((doc) => doc.id);
      const metadatas = documents.map((doc) => doc.metadata || {});
      const texts = documents.map((doc) => doc.text);

      await this.collection.add({
        ids: ids,
        embeddings: embeddings,
        metadatas: metadatas,
        documents: texts,
      });

      this.logger.log('Documents added successfully to ChromaDB');
      return true;
    } catch (error) {
      this.logger.error('Error adding documents to ChromaDB:', error);
      throw error;
    }
  }

  async searchSimilar(
    queryEmbedding: number[],
    nResults: number = 5,
  ): Promise<SearchResult[]> {
    return this.searchSimilarWithFilter(queryEmbedding, nResults);
  }

  async searchSimilarWithFilter(
    queryEmbedding: number[],
    nResults: number = 5,
    filter?: Record<string, any>,
  ): Promise<SearchResult[]> {
    try {
      this.logger.log(
        `Searching for ${nResults} similar documents in ChromaDB...`,
      );

      if (filter) {
        this.logger.log(`Applying filter:`, filter);
      }

      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: nResults,
        where: filter || undefined,
        include: ['documents', 'metadatas', 'distances'],
      });

      const searchResults: SearchResult[] = [];

      if (results.ids && results.ids[0]) {
        for (let i = 0; i < results.ids[0].length; i++) {
          searchResults.push({
            id: results.ids[0][i],
            text: results.documents?.[0]?.[i] || '',
            distance: results.distances?.[0]?.[i] || 0,
            metadata: results.metadatas?.[0]?.[i] || {},
          });
        }
      }

      this.logger.log(`Found ${searchResults.length} similar results`);
      return searchResults;
    } catch (error) {
      this.logger.error('Error in semantic search:', error);
      throw error;
    }
  }

  async deleteCollection() {
    try {
      await this.client.deleteCollection({ name: this.collectionName });
      this.logger.log(`Collection '${this.collectionName}' deleted`);
      return true;
    } catch (error) {
      this.logger.error('Error deleting collection:', error);
      return false;
    }
  }

  async getCollectionInfo() {
    try {
      const count = await this.collection.count();
      return {
        name: this.collectionName,
        count: count,
        metadata: this.collection.metadata,
      };
    } catch (error) {
      this.logger.error('Error getting collection information:', error);
      throw error;
    }
  }

  async resetCollection() {
    try {
      this.logger.log('Resetting collection...');
      await this.deleteCollection();
      await this.ensureCollection();
      this.logger.log('Collection reset successfully');
      return true;
    } catch (error) {
      this.logger.error('Error resetting collection:', error);
      return false;
    }
  }

  async loadFromCache(documentBuilder: DocumentBuilderService): Promise<void> {
    try {
      const cacheData = documentBuilder.getCacheDocument();

      if (cacheData && !cacheData.chromaStored) {
        this.logger.log('Loading cache data to ChromaDB...');

        const documents: DocumentChunk[] = cacheData.data.map((item) => ({
          id: item.id || `restaurant_info_${item.index || 0}`,
          text: item.text,
          metadata: item.metadata || {
            source: 'restaurant_info',
            index: item.index || 0,
            created_at: new Date().toISOString(),
          },
        }));

        const embeddings = cacheData.data.map((item) => item.embedding);

        await this.addDocuments(documents, embeddings);

        // Update cache to mark as stored in ChromaDB
        cacheData.chromaStored = true;
        documentBuilder.createCacheDocument(cacheData);

        this.logger.log('Cache data loaded to ChromaDB successfully');
      } else {
        this.logger.log('Data is already in ChromaDB or no valid cache');
      }

      // Display collection information
      const collectionInfo = await this.getCollectionInfo();
      this.logger.log('ChromaDB information:', collectionInfo);
    } catch (error) {
      this.logger.error('Error loading from cache to ChromaDB:', error);
      throw error;
    }
  }
}
