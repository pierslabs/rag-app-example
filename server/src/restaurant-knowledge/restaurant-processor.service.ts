import { Injectable, Logger } from '@nestjs/common';
import { DocumentBuilderService } from '../document-builder/document-builder.service';
import { EmbedingGeneratorService } from '../embeding-generator/embeding-generator.service';
import { DocumentChunk, VectorDbService } from '../vector-db/vector-db.service';
import { RestaurantChunkerService } from './restaurant-chunker.service';

@Injectable()
export class RestaurantProcessorService {
  private readonly logger = new Logger('RestaurantProcessorService');

  constructor(
    private readonly documentBuilder: DocumentBuilderService,
    private readonly embeddingGenerator: EmbedingGeneratorService,
    private readonly vectorDbService: VectorDbService,
    private readonly restaurantChunker: RestaurantChunkerService,
  ) {}

  async processAndStoreAllData(): Promise<void> {
    try {
      this.logger.log(
        'Iniciando procesamiento completo de datos del restaurante...',
      );

      // Obtener todos los datos
      const allData = this.documentBuilder.getAllData();

      // Procesar todos los chunks
      const allChunks = this.restaurantChunker.processAllData(allData);

      this.logger.log(`Procesando ${allChunks.length} chunks...`);

      // Generar embeddings
      const embeddings =
        await this.embeddingGenerator.generateEmbeddings(allChunks);

      this.logger.log(
        `Embeddings generados con modelo: ${this.embeddingGenerator.getCurrentModelName()}`,
      );

      // Crear documentos para ChromaDB
      const documents: DocumentChunk[] = allChunks.map((chunk, index) => ({
        id: `restaurant_data_${index}`,
        text: chunk,
        metadata: {
          source: this.detectChunkSource(chunk),
          index: index,
          created_at: new Date().toISOString(),
          chunk_length: chunk.length,
        },
      }));

      // Almacenar en ChromaDB
      await this.vectorDbService.addDocuments(documents, embeddings);

      // Crear cache local
      await this.createCacheDocument(documents, embeddings);

      this.logger.log(
        'Datos del restaurante procesados y almacenados exitosamente',
      );

      // Mostrar información de la colección
      const collectionInfo = await this.vectorDbService.getCollectionInfo();
      this.logger.log('Información de ChromaDB:', collectionInfo);
    } catch (error) {
      this.logger.error('Error procesando datos del restaurante:', error);
      throw error;
    }
  }

  async processSpecificData(dataType: string): Promise<void> {
    try {
      this.logger.log(`Procesando datos específicos: ${dataType}`);

      let chunks: string[] = [];

      switch (dataType) {
        case 'restaurant_info':
          const restaurantInfo =
            this.documentBuilder.getDataByProp('restaurant_info');
          chunks = this.restaurantChunker.processRestaurantInfo(restaurantInfo);
          break;
        case 'menu':
          const menu = this.documentBuilder.getDataByProp('menu');
          chunks = this.restaurantChunker.processMenu(menu);
          break;
        case 'schedules':
          const schedules = this.documentBuilder.getDataByProp('schedules');
          chunks = this.restaurantChunker.processSchedules(schedules);
          break;
        case 'policies':
          const policies = this.documentBuilder.getDataByProp('policies');
          chunks = this.restaurantChunker.processPolicies(policies);
          break;
        case 'faqs':
          const faqs = this.documentBuilder.getDataByProp('faqs');
          chunks = this.restaurantChunker.processFAQs(faqs);
          break;
        case 'special_events':
          const events = this.documentBuilder.getDataByProp('special_events');
          chunks = this.restaurantChunker.processSpecialEvents(events);
          break;
        default:
          throw new Error(`Tipo de datos no válido: ${dataType}`);
      }

      if (chunks.length === 0) {
        this.logger.warn(`No se encontraron chunks para ${dataType}`);
        return;
      }

      const embeddings =
        await this.embeddingGenerator.generateEmbeddings(chunks);

      const documents: DocumentChunk[] = chunks.map((chunk, index) => ({
        id: `${dataType}_${index}`,
        text: chunk,
        metadata: {
          source: dataType,
          index: index,
          created_at: new Date().toISOString(),
          chunk_length: chunk.length,
        },
      }));

      await this.vectorDbService.addDocuments(documents, embeddings);

      this.logger.log(
        `Datos de ${dataType} procesados exitosamente: ${chunks.length} chunks`,
      );
    } catch (error) {
      this.logger.error(`Error procesando ${dataType}:`, error);
      throw error;
    }
  }

  private detectChunkSource(chunk: string): string {
    // Detectar el tipo de chunk basado en su contenido
    if (
      chunk.includes('Restaurante:') ||
      chunk.includes('Historia del restaurante')
    ) {
      return 'restaurant_info';
    }
    if (
      chunk.includes('Plato:') ||
      chunk.includes('Categoría del menú') ||
      chunk.includes('Vino:')
    ) {
      return 'menu';
    }
    if (chunk.includes('Horarios') || chunk.includes('Horario especial')) {
      return 'schedules';
    }
    if (chunk.includes('Política de')) {
      return 'policies';
    }
    if (chunk.includes('Pregunta frecuente:')) {
      return 'faqs';
    }
    if (chunk.includes('Evento especial:')) {
      return 'special_events';
    }
    return 'unknown';
  }

  private async createCacheDocument(
    documents: DocumentChunk[],
    embeddings: number[][],
  ): Promise<void> {
    const cacheData = {
      model: this.embeddingGenerator.getCurrentModelName(),
      createdAt: new Date().toISOString(),
      totalChunks: documents.length,
      chromaStored: true,
      dataTypes: this.getDataTypesFromDocuments(documents),
      data: documents.map((doc, index) => ({
        id: doc.id,
        text: doc.text,
        embedding: embeddings[index],
        metadata: doc.metadata,
      })),
    };

    const success = this.documentBuilder.createCacheDocument(cacheData);
    if (success) {
      this.logger.log('Cache creado exitosamente');
    } else {
      this.logger.error('Error creando cache');
    }
  }

  private getDataTypesFromDocuments(documents: DocumentChunk[]): string[] {
    const sources = new Set(documents.map((doc) => doc.metadata!.source));
    return Array.from(sources);
  }

  async getProcessingStats(): Promise<any> {
    try {
      const cacheExists = this.documentBuilder.checkCacheDocument();

      if (!cacheExists) {
        return {
          cacheExists: false,
          message: 'No hay datos procesados',
        };
      }

      const cacheData = this.documentBuilder.getCacheDocument();

      return {
        cacheExists: true,
        model: cacheData.model,
        createdAt: cacheData.createdAt,
        totalChunks: cacheData.totalChunks,
        dataTypes: cacheData.dataTypes || ['restaurant_info'], // Fallback para cache antiguo
        chromaStored: cacheData.chromaStored,
      };
    } catch (error) {
      this.logger.error(
        'Error obteniendo estadísticas de procesamiento:',
        error,
      );
      throw error;
    }
  }
}
