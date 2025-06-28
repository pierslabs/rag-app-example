"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const semantic_search_module_1 = require("./semantic-search/semantic-search.module");
const config_1 = require("@nestjs/config");
const embeding_generator_module_1 = require("./embeding-generator/embeding-generator.module");
const vector_db_module_1 = require("./vector-db/vector-db.module");
const llm_genrator_module_1 = require("./llm-generator/llm-genrator.module");
const restaurant_knowledge_module_1 = require("./restaurant-knowledge/restaurant-knowledge.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            semantic_search_module_1.SemanticSearchModule,
            embeding_generator_module_1.EmbedingGeneratorModule,
            vector_db_module_1.VectorDbModule,
            llm_genrator_module_1.LLMGeneratorModule,
            restaurant_knowledge_module_1.RestaurantKnowledgeModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map