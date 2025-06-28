"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const openAi_llm_generator_service_1 = require("./openAi-llm-generator.service");
let LLMGeneratorService = class LLMGeneratorService extends openAi_llm_generator_service_1.OpenAILLMGenerator {
    getCurrentModelName() {
        return this.getModelName();
    }
};
exports.LLMGeneratorService = LLMGeneratorService;
exports.LLMGeneratorService = LLMGeneratorService = __decorate([
    (0, common_1.Injectable)()
], LLMGeneratorService);
//# sourceMappingURL=llm-genrator.service.js.map