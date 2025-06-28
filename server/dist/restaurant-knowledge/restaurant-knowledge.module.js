"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantKnowledgeModule = void 0;
const common_1 = require("@nestjs/common");
const restaurant_knowledge_service_1 = require("./restaurant-knowledge.service");
const restaurant_processor_service_1 = require("./restaurant-processor.service");
const restaurant_chunker_service_1 = require("./restaurant-chunker.service");
const embeding_generator_module_1 = require("../embeding-generator/embeding-generator.module");
const vector_db_module_1 = require("../vector-db/vector-db.module");
const document_builder_module_1 = require("../document-builder/document-builder.module");
let RestaurantKnowledgeModule = class RestaurantKnowledgeModule {
};
exports.RestaurantKnowledgeModule = RestaurantKnowledgeModule;
exports.RestaurantKnowledgeModule = RestaurantKnowledgeModule = __decorate([
    (0, common_1.Module)({
        providers: [
            restaurant_knowledge_service_1.RestaurantKnowledgeService,
            restaurant_processor_service_1.RestaurantProcessorService,
            restaurant_chunker_service_1.RestaurantChunkerService,
        ],
        imports: [document_builder_module_1.DocumentBuilderModule, embeding_generator_module_1.EmbedingGeneratorModule, vector_db_module_1.VectorDbModule],
        exports: [restaurant_knowledge_service_1.RestaurantKnowledgeService],
    })
], RestaurantKnowledgeModule);
//# sourceMappingURL=restaurant-knowledge.module.js.map