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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SemanticSearchController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemanticSearchController = void 0;
const common_1 = require("@nestjs/common");
const semantic_search_service_1 = require("./semantic-search.service");
const rxjs_1 = require("rxjs");
let SemanticSearchController = SemanticSearchController_1 = class SemanticSearchController {
    semanticSearchService;
    logger = new common_1.Logger(SemanticSearchController_1.name);
    constructor(semanticSearchService) {
        this.semanticSearchService = semanticSearchService;
    }
    async search(body) {
        try {
            const { question, maxResults = 5 } = body;
            if (!question || question.trim().length === 0) {
                throw new common_1.HttpException('La pregunta es requerida', common_1.HttpStatus.BAD_REQUEST);
            }
            return await this.semanticSearchService.semanticSearch(question, maxResults);
        }
        catch (error) {
            throw new common_1.HttpException(`Error en búsqueda semántica: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async searchByCategory(body) {
        try {
            const { question, category, maxResults = 5 } = body;
            if (!question || !category) {
                throw new common_1.HttpException('La pregunta y categoría son requeridas', common_1.HttpStatus.BAD_REQUEST);
            }
            return await this.semanticSearchService.searchByCategory(question, category, maxResults);
        }
        catch (error) {
            throw new common_1.HttpException(`Error en búsqueda por categoría: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async ragResponse(body) {
        try {
            const { question, maxResults = 3 } = body;
            if (!question || question.trim().length === 0) {
                throw new common_1.HttpException('La pregunta es requerida', common_1.HttpStatus.BAD_REQUEST);
            }
            return await this.semanticSearchService.ragResponse(question, maxResults);
        }
        catch (error) {
            throw new common_1.HttpException(`Error en respuesta RAG: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async ragStreamResponse(question, maxResults = '3') {
        try {
            if (!question || question.trim().length === 0) {
                throw new common_1.HttpException('La pregunta es requerida', common_1.HttpStatus.BAD_REQUEST);
            }
            const maxRes = parseInt(maxResults) || 3;
            return new rxjs_1.Observable((observer) => {
                (async () => {
                    try {
                        for await (const chunk of this.semanticSearchService.ragStreamResponse(question, maxRes)) {
                            observer.next({ data: chunk });
                        }
                        observer.complete();
                    }
                    catch (error) {
                        observer.error(error);
                    }
                })();
            });
        }
        catch (error) {
            throw new common_1.HttpException(`Error en respuesta RAG streaming: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAvailableCategories() {
        try {
            return {
                categories: await this.semanticSearchService.getAvailableCategories(),
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Error obteniendo categorías: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getKnowledgeBaseInfo() {
        try {
            return await this.semanticSearchService.getKnowledgeBaseInfo();
        }
        catch (error) {
            throw new common_1.HttpException(`Error obteniendo información: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSearchStats() {
        try {
            return await this.semanticSearchService.getSearchStats();
        }
        catch (error) {
            throw new common_1.HttpException(`Error obteniendo estadísticas: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async refreshKnowledgeBase() {
        try {
            const success = await this.semanticSearchService.refreshKnowledgeBase();
            return {
                success,
                message: success
                    ? 'Base de conocimientos refrescada exitosamente'
                    : 'Error refrescando base de conocimientos',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Error refrescando base de conocimientos: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async resetKnowledgeBase() {
        try {
            const success = await this.semanticSearchService.resetKnowledgeBase();
            return {
                success,
                message: success
                    ? 'Base de conocimientos reseteada exitosamente'
                    : 'Error reseteando base de conocimientos',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Error reseteando base de conocimientos: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async regenerateEmbeddings() {
        try {
            this.logger.log('🔄 Iniciando regeneración completa de embeddings...');
            const result = await this.semanticSearchService.regenerateAllEmbeddings();
            return {
                success: true,
                message: 'Embeddings regenerados exitosamente',
                details: result,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Error regenerando embeddings: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async processSpecificData(body) {
        try {
            const { dataType } = body;
            if (!dataType) {
                throw new common_1.HttpException('El tipo de datos es requerido', common_1.HttpStatus.BAD_REQUEST);
            }
            await this.semanticSearchService.processSpecificDataType(dataType);
            return {
                success: true,
                message: `Datos de ${dataType} procesados exitosamente`,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Error procesando ${body.dataType}: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.SemanticSearchController = SemanticSearchController;
__decorate([
    (0, common_1.Post)('search'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SemanticSearchController.prototype, "search", null);
__decorate([
    (0, common_1.Post)('search/category'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SemanticSearchController.prototype, "searchByCategory", null);
__decorate([
    (0, common_1.Post)('rag'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SemanticSearchController.prototype, "ragResponse", null);
__decorate([
    (0, common_1.Sse)('rag/stream'),
    __param(0, (0, common_1.Query)('question')),
    __param(1, (0, common_1.Query)('maxResults')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SemanticSearchController.prototype, "ragStreamResponse", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SemanticSearchController.prototype, "getAvailableCategories", null);
__decorate([
    (0, common_1.Get)('info'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SemanticSearchController.prototype, "getKnowledgeBaseInfo", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SemanticSearchController.prototype, "getSearchStats", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SemanticSearchController.prototype, "refreshKnowledgeBase", null);
__decorate([
    (0, common_1.Delete)('reset'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SemanticSearchController.prototype, "resetKnowledgeBase", null);
__decorate([
    (0, common_1.Post)('regenerate-embeddings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SemanticSearchController.prototype, "regenerateEmbeddings", null);
__decorate([
    (0, common_1.Post)('process-specific-data'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SemanticSearchController.prototype, "processSpecificData", null);
exports.SemanticSearchController = SemanticSearchController = SemanticSearchController_1 = __decorate([
    (0, common_1.Controller)('semantic-search'),
    __metadata("design:paramtypes", [semantic_search_service_1.SemanticSearchService])
], SemanticSearchController);
//# sourceMappingURL=semantic-search.controller.js.map