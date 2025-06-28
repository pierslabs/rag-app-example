import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChromaClient } from 'chromadb';
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

// Función de embedding personalizada que no hace nada
// porque nosotros pasaremos los embeddings directamente
class CustomEmbeddingFunction {
  async generate(texts: string[]): Promise<number[][]> {
    // Esta función nunca se llamará porque pasaremos embeddings directamente
    throw new Error(
      'Esta función no debería ser llamada - usamos embeddings propios',
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
        this.configService.get<string>('CHROMA_URL') || 'http://localhost:8000';

      const url = new URL(chromaUrl);
      const host = url.hostname;
      const port = parseInt(url.port) || 8000;

      this.client = new ChromaClient({
        host: host,
        port: port,
      });

      this.logger.log(`Conectando a ChromaDB en: ${host}:${port}`);

      await this.client.heartbeat();
      this.logger.log('Conexión a ChromaDB establecida correctamente');

      await this.ensureCollection();
    } catch (error) {
      this.logger.error('Error conectando a ChromaDB:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('Cerrando conexión con ChromaDB');
  }

  private async ensureCollection() {
    try {
      this.collection = await this.client.getCollection({
        name: this.collectionName,
      });
      this.logger.log(`Colección '${this.collectionName}' encontrada`);
    } catch (error) {
      this.logger.log(`Creando nueva colección '${this.collectionName}'`);

      // Crear colección con función de embedding personalizada
      this.collection = await this.client.createCollection({
        name: this.collectionName,
        metadata: {
          description: 'Conocimiento del restaurante para búsqueda semántica',
          created_at: new Date().toISOString(),
        },
        embeddingFunction: new CustomEmbeddingFunction(),
      });

      this.logger.log(`Colección '${this.collectionName}' creada exitosamente`);
    }
  }

  async addDocuments(documents: DocumentChunk[], embeddings: number[][]) {
    try {
      if (documents.length !== embeddings.length) {
        throw new Error(
          'El número de documentos debe coincidir con el número de embeddings',
        );
      }

      this.logger.log(`Agregando ${documents.length} documentos a ChromaDB...`);

      const ids = documents.map((doc) => doc.id);
      const metadatas = documents.map((doc) => doc.metadata || {});
      const texts = documents.map((doc) => doc.text);

      await this.collection.add({
        ids: ids,
        embeddings: embeddings,
        metadatas: metadatas,
        documents: texts,
      });

      this.logger.log('Documentos agregados exitosamente a ChromaDB');
      return true;
    } catch (error) {
      this.logger.error('Error agregando documentos a ChromaDB:', error);
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
        `Buscando ${nResults} documentos similares en ChromaDB...`,
      );

      if (filter) {
        this.logger.log(`Aplicando filtro:`, filter);
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

      this.logger.log(
        `Encontrados ${searchResults.length} resultados similares`,
      );
      return searchResults;
    } catch (error) {
      this.logger.error('Error en búsqueda semántica:', error);
      throw error;
    }
  }

  async searchBySource(
    queryEmbedding: number[],
    source: string,
    nResults: number = 5,
  ): Promise<SearchResult[]> {
    return this.searchSimilarWithFilter(queryEmbedding, nResults, { source });
  }

  async getDocumentsBySource(source: string): Promise<SearchResult[]> {
    try {
      this.logger.log(`Obteniendo documentos de fuente: ${source}`);

      const results = await this.collection.get({
        where: { source },
        include: ['documents', 'metadatas'],
      });

      const documents: SearchResult[] = [];

      if (results.ids) {
        for (let i = 0; i < results.ids.length; i++) {
          documents.push({
            id: results.ids[i],
            text: results.documents?.[i] || '',
            distance: 0, // No hay distancia en get
            metadata: results.metadatas?.[i] || {},
          });
        }
      }

      this.logger.log(
        `Encontrados ${documents.length} documentos de ${source}`,
      );
      return documents;
    } catch (error) {
      this.logger.error(`Error obteniendo documentos de ${source}:`, error);
      throw error;
    }
  }

  async deleteCollection() {
    try {
      await this.client.deleteCollection({ name: this.collectionName });
      this.logger.log(`Colección '${this.collectionName}' eliminada`);
      return true;
    } catch (error) {
      this.logger.error('Error eliminando colección:', error);
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
      this.logger.error('Error obteniendo información de la colección:', error);
      throw error;
    }
  }

  async getCollectionStats(): Promise<any> {
    try {
      const count = await this.collection.count();

      // Obtener una muestra de documentos para analizar fuentes
      const sampleResults = await this.collection.get({
        limit: 100,
        include: ['metadatas'],
      });

      const sources = new Set<string>();
      if (sampleResults.metadatas) {
        sampleResults.metadatas.forEach((metadata: any) => {
          if (metadata?.source) {
            sources.add(metadata.source);
          }
        });
      }

      return {
        name: this.collectionName,
        totalDocuments: count,
        availableSources: Array.from(sources),
        metadata: this.collection.metadata,
        lastUpdate: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        'Error obteniendo estadísticas de la colección:',
        error,
      );
      throw error;
    }
  }

  async resetCollection() {
    try {
      this.logger.log('Reiniciando colección...');
      await this.deleteCollection();
      await this.ensureCollection();
      this.logger.log('Colección reiniciada exitosamente');
      return true;
    } catch (error) {
      this.logger.error('Error reiniciando colección:', error);
      return false;
    }
  }

  async collectionExists(): Promise<boolean> {
    try {
      const collections = await this.client.listCollections();
      return collections.some((col) => col.name === this.collectionName);
    } catch (error) {
      return false;
    }
  }

  async loadFromCache(documentBuilder: DocumentBuilderService): Promise<void> {
    try {
      const cacheData = documentBuilder.getCacheDocument();

      if (cacheData && !cacheData.chromaStored) {
        this.logger.log('Cargando datos del cache a ChromaDB...');

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

        // Actualizar cache para marcar que ya está en ChromaDB
        cacheData.chromaStored = true;
        documentBuilder.createCacheDocument(cacheData);

        this.logger.log('Datos cargados del cache a ChromaDB exitosamente');
      } else {
        this.logger.log('Los datos ya están en ChromaDB o no hay cache válido');
      }

      // Mostrar información de la colección
      const collectionInfo = await this.getCollectionInfo();
      this.logger.log('Información de ChromaDB:', collectionInfo);
    } catch (error) {
      this.logger.error('Error cargando desde cache a ChromaDB:', error);
      throw error;
    }
  }

  async syncCacheStatus(): Promise<boolean> {
    try {
      const exists = await this.collectionExists();
      const info = await this.getCollectionInfo();
      return exists && info.count > 0;
    } catch (error) {
      this.logger.error('Error sincronizando estado del cache:', error);
      return false;
    }
  }
}
