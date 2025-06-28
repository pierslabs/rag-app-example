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
exports.RestaurantKnowledgeService = void 0;
const common_1 = require("@nestjs/common");
const document_builder_service_1 = require("../document-builder/document-builder.service");
const vector_db_service_1 = require("../vector-db/vector-db.service");
const restaurant_processor_service_1 = require("./restaurant-processor.service");
let RestaurantKnowledgeService = class RestaurantKnowledgeService {
    documentBuilder;
    vectorDbService;
    restaurantProcessor;
    logger = new common_1.Logger('RestaurantKnowledgeService');
    constructor(documentBuilder, vectorDbService, restaurantProcessor) {
        this.documentBuilder = documentBuilder;
        this.vectorDbService = vectorDbService;
        this.restaurantProcessor = restaurantProcessor;
    }
    async initializeKnowledgeBase() {
        this.logger.log('Inicializando base de conocimientos del restaurante...');
        const cacheExists = this.documentBuilder.checkCacheDocument();
        if (!cacheExists) {
            this.logger.log('Cache no existe, procesando todos los datos...');
            await this.restaurantProcessor.processAndStoreAllData();
        }
        else {
            this.logger.log('Cargando datos desde cache...');
            await this.loadFromCache();
        }
        this.logger.log('Base de conocimientos inicializada correctamente');
    }
    async refreshKnowledgeBase() {
        this.logger.log('Refrescando base de conocimientos...');
        await this.vectorDbService.resetCollection();
        await this.restaurantProcessor.processAndStoreAllData();
        this.logger.log('Base de conocimientos refrescada exitosamente');
    }
    async addNewData(dataType) {
        this.logger.log(`Agregando nuevos datos de tipo: ${dataType}`);
        try {
            await this.restaurantProcessor.processSpecificData(dataType);
            await this.updateCacheAfterAddition();
            this.logger.log(`Datos de ${dataType} agregados exitosamente`);
        }
        catch (error) {
            this.logger.error(`Error agregando datos de ${dataType}:`, error);
            throw error;
        }
    }
    async resetKnowledgeBase() {
        try {
            this.logger.log('Reseteando base de conocimientos...');
            await this.vectorDbService.resetCollection();
            this.logger.log('Base de conocimientos reseteada exitosamente');
            return true;
        }
        catch (error) {
            this.logger.error('Error reseteando base de conocimientos:', error);
            return false;
        }
    }
    async getKnowledgeBaseInfo() {
        try {
            const [collectionInfo, processingStats] = await Promise.all([
                this.vectorDbService.getCollectionInfo(),
                this.restaurantProcessor.getProcessingStats(),
            ]);
            return {
                collection: collectionInfo,
                processing: processingStats,
                status: 'active',
                lastUpdate: processingStats.createdAt,
            };
        }
        catch (error) {
            this.logger.error('Error obteniendo información de la base de conocimientos:', error);
            return {
                status: 'error',
                error: error.message,
            };
        }
    }
    async isInitialized() {
        try {
            const collectionInfo = await this.vectorDbService.getCollectionInfo();
            return collectionInfo.count > 0;
        }
        catch (error) {
            return false;
        }
    }
    async loadFromCache() {
        try {
            await this.vectorDbService.loadFromCache(this.documentBuilder);
            this.logger.log('Datos cargados desde cache exitosamente');
        }
        catch (error) {
            this.logger.error('Error cargando desde cache, procesando datos nuevamente...');
            await this.restaurantProcessor.processAndStoreAllData();
        }
    }
    async updateCacheAfterAddition() {
        this.logger.log('Cache actualizado después de agregar datos');
    }
};
exports.RestaurantKnowledgeService = RestaurantKnowledgeService;
exports.RestaurantKnowledgeService = RestaurantKnowledgeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [document_builder_service_1.DocumentBuilderService,
        vector_db_service_1.VectorDbService,
        restaurant_processor_service_1.RestaurantProcessorService])
], RestaurantKnowledgeService);
//# sourceMappingURL=restaurant-knowledge.service.js.map