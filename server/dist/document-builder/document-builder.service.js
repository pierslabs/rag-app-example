"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentBuilderService = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const fs = require("fs");
let DocumentBuilderService = class DocumentBuilderService {
    getDataByProp(prop) {
        const filePath = (0, path_1.join)(__dirname, '..', 'data', 'documents.json');
        console.log('Buscando archivo en:', filePath);
        try {
            const document = fs.readFileSync(filePath, 'utf8');
            const documents = JSON.parse(document);
            if (!documents[prop]) {
                throw new Error(`Property '${prop}' not found. Available properties: ${Object.keys(documents).join(', ')}`);
            }
            return documents[prop];
        }
        catch (error) {
            console.error('Error en getDataByProp:', error);
            throw error;
        }
    }
    getAllData() {
        const filePath = (0, path_1.join)(__dirname, '..', 'data', 'documents.json');
        try {
            const document = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(document);
        }
        catch (error) {
            console.error('Error en getAllData:', error);
            throw error;
        }
    }
    checkFileExists(fileName) {
        const filePath = (0, path_1.join)(__dirname, '..', 'data', fileName);
        return fs.existsSync(filePath);
    }
    readJsonFile(fileName) {
        const filePath = (0, path_1.join)(__dirname, '..', 'data', fileName);
        if (!fs.existsSync(filePath)) {
            console.log(`El archivo ${fileName} no existe`);
            return null;
        }
        try {
            const document = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(document);
        }
        catch (error) {
            console.error(`Error al leer el archivo ${fileName}:`, error);
            return null;
        }
    }
    writeJsonFile(fileName, data) {
        const srcDataPath = (0, path_1.join)(process.cwd(), 'src', 'data', fileName);
        try {
            const srcDataDir = (0, path_1.join)(process.cwd(), 'src', 'data');
            if (!fs.existsSync(srcDataDir)) {
                fs.mkdirSync(srcDataDir, { recursive: true });
            }
            fs.writeFileSync(srcDataPath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`Archivo ${fileName} creado exitosamente en:`, srcDataPath);
            return true;
        }
        catch (error) {
            console.error(`Error al crear el archivo ${fileName}:`, error);
            return false;
        }
    }
    createCacheDocument(embeddings) {
        return this.writeJsonFile('documents-cache.json', embeddings);
    }
    checkCacheDocument() {
        return this.checkFileExists('documents-cache.json');
    }
    getCacheDocument() {
        return this.readJsonFile('documents-cache.json');
    }
};
exports.DocumentBuilderService = DocumentBuilderService;
exports.DocumentBuilderService = DocumentBuilderService = __decorate([
    (0, common_1.Injectable)()
], DocumentBuilderService);
//# sourceMappingURL=document-builder.service.js.map