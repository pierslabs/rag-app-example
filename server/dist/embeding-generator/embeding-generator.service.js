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
exports.EmbedingGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const embeding_generator_interface_1 = require("./interfaces/embeding-generator.interface");
const openai_embending_generator_1 = require("./embending-generator-models/openai.embending-generator");
let EmbedingGeneratorService = class EmbedingGeneratorService {
    configService;
    openAIGenerator;
    currentGenerator;
    constructor(configService, openAIGenerator) {
        this.configService = configService;
        this.openAIGenerator = openAIGenerator;
        const defaultModel = this.configService.get('EMBEDDING_MODEL_TYPE') ||
            embeding_generator_interface_1.EmbeddingModelType.OPENAI;
        this.setGenerator(defaultModel);
    }
    setGenerator(modelType) {
        switch (modelType) {
            case embeding_generator_interface_1.EmbeddingModelType.OPENAI:
                this.currentGenerator = this.openAIGenerator;
                break;
            default:
                throw new Error(`Unsupported embedding model type: ${modelType}`);
        }
    }
    async generateEmbedding(text) {
        return this.currentGenerator.generateEmbedding(text);
    }
    async generateEmbeddings(texts) {
        return this.currentGenerator.generateEmbeddings(texts);
    }
    getCurrentModelName() {
        return this.currentGenerator.getModelName();
    }
    getAvailableModels() {
        return Object.values(embeding_generator_interface_1.EmbeddingModelType);
    }
};
exports.EmbedingGeneratorService = EmbedingGeneratorService;
exports.EmbedingGeneratorService = EmbedingGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        openai_embending_generator_1.OpenAIEmbeddingGenerator])
], EmbedingGeneratorService);
//# sourceMappingURL=embeding-generator.service.js.map