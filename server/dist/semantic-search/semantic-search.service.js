"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemanticSearchService = void 0;
const common_1 = require("@nestjs/common");
const embeding_generator_service_1 = require("../embeding-generator/embeding-generator.service");
const vector_db_service_1 = require("../vector-db/vector-db.service");
const llm_genrator_service_1 = require("../llm-generator/llm-genrator.service");
const restaurant_knowledge_service_1 = require("../restaurant-knowledge/restaurant-knowledge.service");
let SemanticSearchService = class SemanticSearchService {
    embeddingGenerator;
    vectorDbService;
    llmGenerator;
    restaurantKnowledge;
    logger = new common_1.Logger('SemanticSearchService');
    isInitialized = false;
    initializationPromise = null;
    constructor(embeddingGenerator, vectorDbService, llmGenerator, restaurantKnowledge) {
        this.embeddingGenerator = embeddingGenerator;
        this.vectorDbService = vectorDbService;
        this.llmGenerator = llmGenerator;
        this.restaurantKnowledge = restaurantKnowledge;
    }
    async ragResponse(question, maxResults = 3) {
        await this.ensureInitialized();
        try {
            this.logger.log(`🤖 Generando respuesta RAG para: "${question}"`);
            const searchResults = await this.semanticSearch(question, maxResults);
            const context = searchResults.results
                .map((result) => result.text)
                .join('\n\n');
            this.logger.log('📄 Contexto encontrado:', context.substring(0, 200) + '...');
            const aiResponse = await this.llmGenerator.generateResponse(context, question);
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
        }
        catch (error) {
            this.logger.error('❌ Error en respuesta RAG:', error);
            throw error;
        }
    }
    async *ragStreamResponse(question, maxResults = 3) {
        await this.ensureInitialized();
        try {
            this.logger.log(`🌊 Generando respuesta RAG streaming para: "${question}"`);
            const searchResults = await this.semanticSearch(question, maxResults);
            const context = searchResults.results
                .map((result) => result.text)
                .join('\n\n');
            this.logger.log('📄 Contexto encontrado para streaming:', context.substring(0, 200) + '...');
            if (this.llmGenerator.generateStreamResponse) {
                this.logger.log('🚀 Usando streaming del LLM');
                yield* this.llmGenerator.generateStreamResponse(context, question);
            }
            else {
                this.logger.log('⚠️ LLM no soporta streaming, usando fallback');
                const response = await this.llmGenerator.generateResponse(context, question);
                yield response;
            }
        }
        catch (error) {
            this.logger.error('❌ Error en respuesta RAG streaming:', error);
            throw error;
        }
    }
    async regenerateAllEmbeddings() {
        try {
            this.logger.log('🗑️ Reseteando base de conocimientos...');
            await this.restaurantKnowledge.resetKnowledgeBase();
            this.logger.log('🔄 Procesando todos los datos nuevamente...');
            await this.restaurantKnowledge.refreshKnowledgeBase();
            this.isInitialized = false;
            this.initializationPromise = null;
            const info = await this.restaurantKnowledge.getKnowledgeBaseInfo();
            this.logger.log('✅ Regeneración completa exitosa');
            return {
                totalDocuments: info.collection?.count || 0,
                dataTypes: info.processing?.dataTypes || [],
                model: this.embeddingGenerator.getCurrentModelName(),
                chromaConnected: info.collection?.connected || false,
            };
        }
        catch (error) {
            this.logger.error('❌ Error en regeneración de embeddings:', error);
            throw error;
        }
    }
    async processSpecificDataType(dataType) {
        await this.ensureInitialized();
        try {
            this.logger.log(`🎯 Procesando datos específicos: ${dataType}`);
            await this.restaurantKnowledge.addNewData(dataType);
            this.logger.log(`✅ Datos de ${dataType} procesados exitosamente`);
        }
        catch (error) {
            this.logger.error(`❌ Error procesando ${dataType}:`, error);
            throw error;
        }
    }
    async checkCacheMigration() {
        try {
            const info = await this.restaurantKnowledge.getKnowledgeBaseInfo();
            if (!info.collection || info.collection.count === 0) {
                return {
                    needsMigration: true,
                    reason: 'No hay datos en ChromaDB',
                };
            }
            if (!info.processing?.dataTypes ||
                info.processing.dataTypes.length <= 1) {
                return {
                    needsMigration: true,
                    reason: 'Cache antiguo detectado - solo tiene restaurant_info',
                };
            }
            const expectedTypes = [
                'restaurant_info',
                'menu',
                'schedules',
                'policies',
                'faqs',
                'special_events',
            ];
            const currentTypes = info.processing.dataTypes;
            const missingTypes = expectedTypes.filter((type) => !currentTypes.includes(type));
            if (missingTypes.length > 0) {
                return {
                    needsMigration: true,
                    reason: `Faltan tipos de datos: ${missingTypes.join(', ')}`,
                };
            }
            return { needsMigration: false };
        }
        catch (error) {
            return {
                needsMigration: true,
                reason: `Error verificando migración: ${error.message}`,
            };
        }
    }
    async ensureInitialized() {
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
        }
        catch (error) {
            this.initializationPromise = null;
            throw error;
        }
    }
    async initializeSearch() {
        this.logger.log('🚀 Inicializando servicio de búsqueda semántica...');
        const migrationCheck = await this.checkCacheMigration();
        if (migrationCheck.needsMigration) {
            this.logger.warn(`⚠️ Migración necesaria: ${migrationCheck.reason}`);
            this.logger.log('🔄 Iniciando migración automática...');
            await this.regenerateAllEmbeddings();
        }
        else {
            const isKnowledgeInitialized = await this.restaurantKnowledge.isInitialized();
            if (!isKnowledgeInitialized) {
                this.logger.log('📚 Base de conocimientos no inicializada, inicializando...');
                await this.restaurantKnowledge.initializeKnowledgeBase();
            }
        }
        this.logger.log('✅ Servicio de búsqueda semántica listo');
    }
    async semanticSearch(question, maxResults = 5) {
        await this.ensureInitialized();
        try {
            this.logger.log(`🔍 Realizando búsqueda semántica para: "${question}"`);
            const questionEmbedding = await this.embeddingGenerator.generateEmbedding(question);
            this.logger.log(`📊 Embedding generado (dimensiones: ${questionEmbedding.length})`);
            const searchResults = await this.vectorDbService.searchSimilar(questionEmbedding, maxResults);
            this.logger.log(`📋 Encontrados ${searchResults.length} documentos relevantes`);
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
        }
        catch (error) {
            this.logger.error('❌ Error en búsqueda semántica:', error);
            throw error;
        }
    }
    async searchByCategory(question, category, maxResults = 5) {
        await this.ensureInitialized();
        try {
            this.logger.log(`🎯 Búsqueda por categoría "${category}" para: "${question}"`);
            const questionEmbedding = await this.embeddingGenerator.generateEmbedding(question);
            const searchResults = await this.vectorDbService.searchSimilarWithFilter(questionEmbedding, maxResults, { source: category });
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
        }
        catch (error) {
            this.logger.error(`❌ Error en búsqueda por categoría ${category}:`, error);
            throw error;
        }
    }
    async getAvailableCategories() {
        await this.ensureInitialized();
        try {
            const info = await this.restaurantKnowledge.getKnowledgeBaseInfo();
            return (info.processing?.dataTypes || [
                'restaurant_info',
                'menu',
                'schedules',
                'policies',
                'faqs',
                'special_events',
            ]);
        }
        catch (error) {
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
        }
        catch (error) {
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
        }
        catch (error) {
            this.logger.error('❌ Error refrescando base de conocimiento:', error);
            return false;
        }
    }
    async getKnowledgeBaseInfo() {
        await this.ensureInitialized();
        return await this.restaurantKnowledge.getKnowledgeBaseInfo();
    }
    async getSearchStats() {
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
        }
        catch (error) {
            this.logger.error('❌ Error obteniendo estadísticas de búsqueda:', error);
            return {
                status: 'error',
                error: error.message,
            };
        }
    }
};
exports.SemanticSearchService = SemanticSearchService;
exports.SemanticSearchService = SemanticSearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [embeding_generator_service_1.EmbedingGeneratorService,
        vector_db_service_1.VectorDbService,
        llm_genrator_service_1.LLMGeneratorService,
        restaurant_knowledge_service_1.RestaurantKnowledgeService])
], SemanticSearchService);
//# sourceMappingURL=semantic-search.service.js.map