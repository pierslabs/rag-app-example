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
exports.RestaurantProcessorService = void 0;
const common_1 = require("@nestjs/common");
const document_builder_service_1 = require("../document-builder/document-builder.service");
const embeding_generator_service_1 = require("../embeding-generator/embeding-generator.service");
const vector_db_service_1 = require("../vector-db/vector-db.service");
const restaurant_chunker_service_1 = require("./restaurant-chunker.service");
let RestaurantProcessorService = class RestaurantProcessorService {
    documentBuilder;
    embeddingGenerator;
    vectorDbService;
    restaurantChunker;
    logger = new common_1.Logger('RestaurantProcessorService');
    constructor(documentBuilder, embeddingGenerator, vectorDbService, restaurantChunker) {
        this.documentBuilder = documentBuilder;
        this.embeddingGenerator = embeddingGenerator;
        this.vectorDbService = vectorDbService;
        this.restaurantChunker = restaurantChunker;
    }
    async processAndStoreAllData() {
        try {
            this.logger.log('Iniciando procesamiento completo de datos del restaurante...');
            const allData = this.documentBuilder.getAllData();
            const allChunks = this.restaurantChunker.processAllData(allData);
            this.logger.log(`Procesando ${allChunks.length} chunks...`);
            const embeddings = await this.embeddingGenerator.generateEmbeddings(allChunks);
            this.logger.log(`Embeddings generados con modelo: ${this.embeddingGenerator.getCurrentModelName()}`);
            const documents = allChunks.map((chunk, index) => ({
                id: `restaurant_data_${index}`,
                text: chunk,
                metadata: {
                    source: this.detectChunkSource(chunk),
                    index: index,
                    created_at: new Date().toISOString(),
                    chunk_length: chunk.length,
                },
            }));
            await this.vectorDbService.addDocuments(documents, embeddings);
            await this.createCacheDocument(documents, embeddings);
            this.logger.log('Datos del restaurante procesados y almacenados exitosamente');
            const collectionInfo = await this.vectorDbService.getCollectionInfo();
            this.logger.log('Información de ChromaDB:', collectionInfo);
        }
        catch (error) {
            this.logger.error('Error procesando datos del restaurante:', error);
            throw error;
        }
    }
    async processSpecificData(dataType) {
        try {
            this.logger.log(`Procesando datos específicos: ${dataType}`);
            let chunks = [];
            switch (dataType) {
                case 'restaurant_info':
                    const restaurantInfo = this.documentBuilder.getDataByProp('restaurant_info');
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
            const embeddings = await this.embeddingGenerator.generateEmbeddings(chunks);
            const documents = chunks.map((chunk, index) => ({
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
            this.logger.log(`Datos de ${dataType} procesados exitosamente: ${chunks.length} chunks`);
        }
        catch (error) {
            this.logger.error(`Error procesando ${dataType}:`, error);
            throw error;
        }
    }
    detectChunkSource(chunk) {
        if (chunk.includes('Restaurante:') ||
            chunk.includes('Historia del restaurante')) {
            return 'restaurant_info';
        }
        if (chunk.includes('Plato:') ||
            chunk.includes('Categoría del menú') ||
            chunk.includes('Vino:')) {
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
    async createCacheDocument(documents, embeddings) {
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
        }
        else {
            this.logger.error('Error creando cache');
        }
    }
    getDataTypesFromDocuments(documents) {
        const sources = new Set(documents.map((doc) => doc.metadata.source));
        return Array.from(sources);
    }
    async getProcessingStats() {
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
                dataTypes: cacheData.dataTypes || ['restaurant_info'],
                chromaStored: cacheData.chromaStored,
            };
        }
        catch (error) {
            this.logger.error('Error obteniendo estadísticas de procesamiento:', error);
            throw error;
        }
    }
};
exports.RestaurantProcessorService = RestaurantProcessorService;
exports.RestaurantProcessorService = RestaurantProcessorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [document_builder_service_1.DocumentBuilderService,
        embeding_generator_service_1.EmbedingGeneratorService,
        vector_db_service_1.VectorDbService,
        restaurant_chunker_service_1.RestaurantChunkerService])
], RestaurantProcessorService);
//# sourceMappingURL=restaurant-processor.service.js.map