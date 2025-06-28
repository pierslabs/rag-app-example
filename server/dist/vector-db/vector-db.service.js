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
exports.VectorDbService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const chromadb_1 = require("chromadb");
class CustomEmbeddingFunction {
    async generate(texts) {
        throw new Error('Esta función no debería ser llamada - usamos embeddings propios');
    }
}
let VectorDbService = class VectorDbService {
    configService;
    logger = new common_1.Logger('VectorDbService');
    client;
    collection;
    collectionName = 'restaurant_knowledge';
    constructor(configService) {
        this.configService = configService;
    }
    async onModuleInit() {
        try {
            const chromaUrl = this.configService.get('CHROMA_URL') || 'http://localhost:8000';
            const url = new URL(chromaUrl);
            const host = url.hostname;
            const port = parseInt(url.port) || 8000;
            this.client = new chromadb_1.ChromaClient({
                host: host,
                port: port,
            });
            this.logger.log(`Conectando a ChromaDB en: ${host}:${port}`);
            await this.client.heartbeat();
            this.logger.log('Conexión a ChromaDB establecida correctamente');
            await this.ensureCollection();
        }
        catch (error) {
            this.logger.error('Error conectando a ChromaDB:', error);
            throw error;
        }
    }
    async onModuleDestroy() {
        this.logger.log('Cerrando conexión con ChromaDB');
    }
    async ensureCollection() {
        try {
            this.collection = await this.client.getCollection({
                name: this.collectionName,
            });
            this.logger.log(`Colección '${this.collectionName}' encontrada`);
        }
        catch (error) {
            this.logger.log(`Creando nueva colección '${this.collectionName}'`);
            this.collection = await this.client.createCollection({
                name: this.collectionName,
                metadata: {
                    description: 'Conocimiento del restaurante para búsqueda semántica',
                    created_at: new Date().toISOString(),
                },
                embeddingFunction: new CustomEmbeddingFunction(),
            });
            this.logger.log(`Colección '${this.collectionName}' creada exitosamente`);
        }
    }
    async addDocuments(documents, embeddings) {
        try {
            if (documents.length !== embeddings.length) {
                throw new Error('El número de documentos debe coincidir con el número de embeddings');
            }
            this.logger.log(`Agregando ${documents.length} documentos a ChromaDB...`);
            const ids = documents.map((doc) => doc.id);
            const metadatas = documents.map((doc) => doc.metadata || {});
            const texts = documents.map((doc) => doc.text);
            await this.collection.add({
                ids: ids,
                embeddings: embeddings,
                metadatas: metadatas,
                documents: texts,
            });
            this.logger.log('Documentos agregados exitosamente a ChromaDB');
            return true;
        }
        catch (error) {
            this.logger.error('Error agregando documentos a ChromaDB:', error);
            throw error;
        }
    }
    async searchSimilar(queryEmbedding, nResults = 5) {
        return this.searchSimilarWithFilter(queryEmbedding, nResults);
    }
    async searchSimilarWithFilter(queryEmbedding, nResults = 5, filter) {
        try {
            this.logger.log(`Buscando ${nResults} documentos similares en ChromaDB...`);
            if (filter) {
                this.logger.log(`Aplicando filtro:`, filter);
            }
            const results = await this.collection.query({
                queryEmbeddings: [queryEmbedding],
                nResults: nResults,
                where: filter || undefined,
                include: ['documents', 'metadatas', 'distances'],
            });
            const searchResults = [];
            if (results.ids && results.ids[0]) {
                for (let i = 0; i < results.ids[0].length; i++) {
                    searchResults.push({
                        id: results.ids[0][i],
                        text: results.documents?.[0]?.[i] || '',
                        distance: results.distances?.[0]?.[i] || 0,
                        metadata: results.metadatas?.[0]?.[i] || {},
                    });
                }
            }
            this.logger.log(`Encontrados ${searchResults.length} resultados similares`);
            return searchResults;
        }
        catch (error) {
            this.logger.error('Error en búsqueda semántica:', error);
            throw error;
        }
    }
    async searchBySource(queryEmbedding, source, nResults = 5) {
        return this.searchSimilarWithFilter(queryEmbedding, nResults, { source });
    }
    async getDocumentsBySource(source) {
        try {
            this.logger.log(`Obteniendo documentos de fuente: ${source}`);
            const results = await this.collection.get({
                where: { source },
                include: ['documents', 'metadatas'],
            });
            const documents = [];
            if (results.ids) {
                for (let i = 0; i < results.ids.length; i++) {
                    documents.push({
                        id: results.ids[i],
                        text: results.documents?.[i] || '',
                        distance: 0,
                        metadata: results.metadatas?.[i] || {},
                    });
                }
            }
            this.logger.log(`Encontrados ${documents.length} documentos de ${source}`);
            return documents;
        }
        catch (error) {
            this.logger.error(`Error obteniendo documentos de ${source}:`, error);
            throw error;
        }
    }
    async deleteCollection() {
        try {
            await this.client.deleteCollection({ name: this.collectionName });
            this.logger.log(`Colección '${this.collectionName}' eliminada`);
            return true;
        }
        catch (error) {
            this.logger.error('Error eliminando colección:', error);
            return false;
        }
    }
    async getCollectionInfo() {
        try {
            const count = await this.collection.count();
            return {
                name: this.collectionName,
                count: count,
                metadata: this.collection.metadata,
            };
        }
        catch (error) {
            this.logger.error('Error obteniendo información de la colección:', error);
            throw error;
        }
    }
    async getCollectionStats() {
        try {
            const count = await this.collection.count();
            const sampleResults = await this.collection.get({
                limit: 100,
                include: ['metadatas'],
            });
            const sources = new Set();
            if (sampleResults.metadatas) {
                sampleResults.metadatas.forEach((metadata) => {
                    if (metadata?.source) {
                        sources.add(metadata.source);
                    }
                });
            }
            return {
                name: this.collectionName,
                totalDocuments: count,
                availableSources: Array.from(sources),
                metadata: this.collection.metadata,
                lastUpdate: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Error obteniendo estadísticas de la colección:', error);
            throw error;
        }
    }
    async resetCollection() {
        try {
            this.logger.log('Reiniciando colección...');
            await this.deleteCollection();
            await this.ensureCollection();
            this.logger.log('Colección reiniciada exitosamente');
            return true;
        }
        catch (error) {
            this.logger.error('Error reiniciando colección:', error);
            return false;
        }
    }
    async collectionExists() {
        try {
            const collections = await this.client.listCollections();
            return collections.some((col) => col.name === this.collectionName);
        }
        catch (error) {
            return false;
        }
    }
    async loadFromCache(documentBuilder) {
        try {
            const cacheData = documentBuilder.getCacheDocument();
            if (cacheData && !cacheData.chromaStored) {
                this.logger.log('Cargando datos del cache a ChromaDB...');
                const documents = cacheData.data.map((item) => ({
                    id: item.id || `restaurant_info_${item.index || 0}`,
                    text: item.text,
                    metadata: item.metadata || {
                        source: 'restaurant_info',
                        index: item.index || 0,
                        created_at: new Date().toISOString(),
                    },
                }));
                const embeddings = cacheData.data.map((item) => item.embedding);
                await this.addDocuments(documents, embeddings);
                cacheData.chromaStored = true;
                documentBuilder.createCacheDocument(cacheData);
                this.logger.log('Datos cargados del cache a ChromaDB exitosamente');
            }
            else {
                this.logger.log('Los datos ya están en ChromaDB o no hay cache válido');
            }
            const collectionInfo = await this.getCollectionInfo();
            this.logger.log('Información de ChromaDB:', collectionInfo);
        }
        catch (error) {
            this.logger.error('Error cargando desde cache a ChromaDB:', error);
            throw error;
        }
    }
    async syncCacheStatus() {
        try {
            const exists = await this.collectionExists();
            const info = await this.getCollectionInfo();
            return exists && info.count > 0;
        }
        catch (error) {
            this.logger.error('Error sincronizando estado del cache:', error);
            return false;
        }
    }
};
exports.VectorDbService = VectorDbService;
exports.VectorDbService = VectorDbService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], VectorDbService);
//# sourceMappingURL=vector-db.service.js.map