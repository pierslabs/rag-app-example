import { Injectable, Logger } from '@nestjs/common';
import { EmbedingGeneratorService } from '../embeding-generator/embeding-generator.service';
import { VectorDbService } from '../vector-db/vector-db.service';
import { LLMGeneratorService } from '../llm-generator/llm-genrator.service';
import { RestaurantKnowledgeService } from '../restaurant-knowledge/restaurant-knowledge.service';

@Injectable()
export class SemanticSearchService {
  private readonly logger = new Logger('SemanticSearchService');
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor(
    private readonly embeddingGenerator: EmbedingGeneratorService,
    private readonly vectorDbService: VectorDbService,
    private readonly llmGenerator: LLMGeneratorService,
    private readonly restaurantKnowledge: RestaurantKnowledgeService,
  ) {}

  // ... métodos existentes ...

  async ragResponse(question: string, maxResults: number = 3) {
    await this.ensureInitialized();

    try {
      this.logger.log(`🤖 Generando respuesta RAG para: "${question}"`);

      const searchResults = await this.semanticSearch(question, maxResults);
      const context = searchResults.results
        .map((result) => result.text)
        .join('\n\n');

      this.logger.log(
        '📄 Contexto encontrado:',
        context.substring(0, 200) + '...',
      );

      const aiResponse = await this.llmGenerator.generateResponse(
        context,
        question,
      );

      return {
        question,
        answer: aiResponse,
        context: {
          sources: searchResults.results.map((result) => ({
            text: result.text,
            relevanceScore: result.relevanceScore,
            metadata: result.metadata,
            source: result.source,
          })),
          totalSources: searchResults.resultsCount,
        },
        models: {
          embedding: this.embeddingGenerator.getCurrentModelName(),
          llm: this.llmGenerator.getCurrentModelName(),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('❌ Error en respuesta RAG:', error);
      throw error;
    }
  }

  async *ragStreamResponse(question: string, maxResults: number = 3) {
    await this.ensureInitialized();

    try {
      this.logger.log(
        `🌊 Generando respuesta RAG streaming para: "${question}"`,
      );

      const searchResults = await this.semanticSearch(question, maxResults);
      const context = searchResults.results
        .map((result) => result.text)
        .join('\n\n');

      this.logger.log(
        '📄 Contexto encontrado para streaming:',
        context.substring(0, 200) + '...',
      );

      // Verificar si el LLM soporta streaming
      if (this.llmGenerator.generateStreamResponse) {
        this.logger.log('🚀 Usando streaming del LLM');
        yield* this.llmGenerator.generateStreamResponse(context, question);
      } else {
        // Fallback para LLMs que no soportan streaming
        this.logger.log('⚠️ LLM no soporta streaming, usando fallback');
        const response = await this.llmGenerator.generateResponse(
          context,
          question,
        );
        yield response;
      }
    } catch (error) {
      this.logger.error('❌ Error en respuesta RAG streaming:', error);
      throw error;
    }
  }

  /**
   * Regenerar todos los embeddings desde cero
   */
  async regenerateAllEmbeddings(): Promise<any> {
    try {
      this.logger.log('🗑️ Reseteando base de conocimientos...');

      // Resetear todo
      await this.restaurantKnowledge.resetKnowledgeBase();

      this.logger.log('🔄 Procesando todos los datos nuevamente...');

      // Procesar todos los datos desde cero
      await this.restaurantKnowledge.refreshKnowledgeBase();

      // Actualizar estado
      this.isInitialized = false;
      this.initializationPromise = null;

      // Obtener información final
      const info = await this.restaurantKnowledge.getKnowledgeBaseInfo();

      this.logger.log('✅ Regeneración completa exitosa');

      return {
        totalDocuments: info.collection?.count || 0,
        dataTypes: info.processing?.dataTypes || [],
        model: this.embeddingGenerator.getCurrentModelName(),
        chromaConnected: info.collection?.connected || false,
      };
    } catch (error) {
      this.logger.error('❌ Error en regeneración de embeddings:', error);
      throw error;
    }
  }

  /**
   * Procesar un tipo específico de datos
   */
  async processSpecificDataType(dataType: string): Promise<void> {
    await this.ensureInitialized();

    try {
      this.logger.log(`🎯 Procesando datos específicos: ${dataType}`);

      await this.restaurantKnowledge.addNewData(dataType);

      this.logger.log(`✅ Datos de ${dataType} procesados exitosamente`);
    } catch (error) {
      this.logger.error(`❌ Error procesando ${dataType}:`, error);
      throw error;
    }
  }

  /**
   * Verificar si necesita migración desde cache antiguo
   */
  async checkCacheMigration(): Promise<{
    needsMigration: boolean;
    reason?: string;
  }> {
    try {
      const info = await this.restaurantKnowledge.getKnowledgeBaseInfo();

      // Si no hay datos en ChromaDB
      if (!info.collection || info.collection.count === 0) {
        return {
          needsMigration: true,
          reason: 'No hay datos en ChromaDB',
        };
      }

      // Si no hay tipos de datos definidos (cache antiguo)
      if (
        !info.processing?.dataTypes ||
        info.processing.dataTypes.length <= 1
      ) {
        return {
          needsMigration: true,
          reason: 'Cache antiguo detectado - solo tiene restaurant_info',
        };
      }

      // Verificar que todos los tipos esperados estén presentes
      const expectedTypes = [
        'restaurant_info',
        'menu',
        'schedules',
        'policies',
        'faqs',
        'special_events',
      ];
      const currentTypes = info.processing.dataTypes;
      const missingTypes = expectedTypes.filter(
        (type) => !currentTypes.includes(type),
      );

      if (missingTypes.length > 0) {
        return {
          needsMigration: true,
          reason: `Faltan tipos de datos: ${missingTypes.join(', ')}`,
        };
      }

      return { needsMigration: false };
    } catch (error) {
      return {
        needsMigration: true,
        reason: `Error verificando migración: ${error.message}`,
      };
    }
  }

  /**
   * Asegurar inicialización con verificación de migración
   */
  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.initializeSearch();

    try {
      await this.initializationPromise;
      this.isInitialized = true;
    } catch (error) {
      this.initializationPromise = null;
      throw error;
    }
  }

  private async initializeSearch(): Promise<void> {
    this.logger.log('🚀 Inicializando servicio de búsqueda semántica...');

    // Verificar si necesita migración
    const migrationCheck = await this.checkCacheMigration();

    if (migrationCheck.needsMigration) {
      this.logger.warn(`⚠️ Migración necesaria: ${migrationCheck.reason}`);
      this.logger.log('🔄 Iniciando migración automática...');

      await this.regenerateAllEmbeddings();
    } else {
      // Inicializar normalmente
      const isKnowledgeInitialized =
        await this.restaurantKnowledge.isInitialized();

      if (!isKnowledgeInitialized) {
        this.logger.log(
          '📚 Base de conocimientos no inicializada, inicializando...',
        );
        await this.restaurantKnowledge.initializeKnowledgeBase();
      }
    }

    this.logger.log('✅ Servicio de búsqueda semántica listo');
  }

  async semanticSearch(question: string, maxResults: number = 5) {
    await this.ensureInitialized();

    try {
      this.logger.log(`🔍 Realizando búsqueda semántica para: "${question}"`);

      const questionEmbedding =
        await this.embeddingGenerator.generateEmbedding(question);
      this.logger.log(
        `📊 Embedding generado (dimensiones: ${questionEmbedding.length})`,
      );

      const searchResults = await this.vectorDbService.searchSimilar(
        questionEmbedding,
        maxResults,
      );
      this.logger.log(
        `📋 Encontrados ${searchResults.length} documentos relevantes`,
      );

      const formattedResults = searchResults.map((result, index) => ({
        rank: index + 1,
        relevanceScore: (1 - result.distance).toFixed(4),
        text: result.text,
        metadata: result.metadata,
        distance: result.distance.toFixed(4),
        source: result.metadata?.source || 'unknown',
      }));

      return {
        question,
        model: this.embeddingGenerator.getCurrentModelName(),
        resultsCount: searchResults.length,
        results: formattedResults,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('❌ Error en búsqueda semántica:', error);
      throw error;
    }
  }

  async searchByCategory(
    question: string,
    category: string,
    maxResults: number = 5,
  ) {
    await this.ensureInitialized();

    try {
      this.logger.log(
        `🎯 Búsqueda por categoría "${category}" para: "${question}"`,
      );

      const questionEmbedding =
        await this.embeddingGenerator.generateEmbedding(question);
      const searchResults = await this.vectorDbService.searchSimilarWithFilter(
        questionEmbedding,
        maxResults,
        { source: category },
      );

      const formattedResults = searchResults.map((result, index) => ({
        rank: index + 1,
        relevanceScore: (1 - result.distance).toFixed(4),
        text: result.text,
        metadata: result.metadata,
        distance: result.distance.toFixed(4),
        source: result.metadata?.source || category,
      }));

      return {
        question,
        category,
        model: this.embeddingGenerator.getCurrentModelName(),
        resultsCount: searchResults.length,
        results: formattedResults,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `❌ Error en búsqueda por categoría ${category}:`,
        error,
      );
      throw error;
    }
  }

  async getAvailableCategories(): Promise<string[]> {
    await this.ensureInitialized();

    try {
      const info = await this.restaurantKnowledge.getKnowledgeBaseInfo();
      return (
        info.processing?.dataTypes || [
          'restaurant_info',
          'menu',
          'schedules',
          'policies',
          'faqs',
          'special_events',
        ]
      );
    } catch (error) {
      this.logger.error('❌ Error obteniendo categorías disponibles:', error);
      return [];
    }
  }

  async resetKnowledgeBase() {
    try {
      const success = await this.restaurantKnowledge.resetKnowledgeBase();
      if (success) {
        this.isInitialized = false;
        this.initializationPromise = null;
        this.logger.log('🗑️ Base de conocimiento reiniciada');
      }
      return success;
    } catch (error) {
      this.logger.error('❌ Error reiniciando base de conocimiento:', error);
      return false;
    }
  }

  async refreshKnowledgeBase() {
    try {
      await this.restaurantKnowledge.refreshKnowledgeBase();
      this.isInitialized = false;
      this.initializationPromise = null;
      this.logger.log('🔄 Base de conocimiento refrescada');
      return true;
    } catch (error) {
      this.logger.error('❌ Error refrescando base de conocimiento:', error);
      return false;
    }
  }

  async getKnowledgeBaseInfo() {
    await this.ensureInitialized();
    return await this.restaurantKnowledge.getKnowledgeBaseInfo();
  }

  async getSearchStats(): Promise<any> {
    try {
      const info = await this.getKnowledgeBaseInfo();
      const categories = await this.getAvailableCategories();
      const migrationCheck = await this.checkCacheMigration();

      return {
        status: info.status,
        totalDocuments: info.collection?.count || 0,
        availableCategories: categories,
        models: {
          embedding: this.embeddingGenerator.getCurrentModelName(),
          llm: this.llmGenerator.getCurrentModelName(),
        },
        lastUpdate: info.lastUpdate,
        isInitialized: this.isInitialized,
        migrationStatus: migrationCheck,
      };
    } catch (error) {
      this.logger.error('❌ Error obteniendo estadísticas de búsqueda:', error);
      return {
        status: 'error',
        error: error.message,
      };
    }
  }
}
