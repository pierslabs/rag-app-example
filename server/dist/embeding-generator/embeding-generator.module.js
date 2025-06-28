"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbedingGeneratorModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const embeding_generator_service_1 = require("./embeding-generator.service");
const openai_embending_generator_1 = require("./embending-generator-models/openai.embending-generator");
let EmbedingGeneratorModule = class EmbedingGeneratorModule {
};
exports.EmbedingGeneratorModule = EmbedingGeneratorModule;
exports.EmbedingGeneratorModule = EmbedingGeneratorModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [embeding_generator_service_1.EmbedingGeneratorService, openai_embending_generator_1.OpenAIEmbeddingGenerator],
        exports: [embeding_generator_service_1.EmbedingGeneratorService],
    })
], EmbedingGeneratorModule);
//# sourceMappingURL=embeding-generator.module.js.map