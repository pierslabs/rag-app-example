import { Injectable } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class DocumentBuilderService {
  getDataByProp(prop: string): any {
    const filePath = join(__dirname, '..', 'data', 'documents.json');
    console.log('Buscando archivo en:', filePath);

    try {
      const document = fs.readFileSync(filePath, 'utf8');
      const documents = JSON.parse(document);

      if (!documents[prop]) {
        throw new Error(
          `Property '${prop}' not found. Available properties: ${Object.keys(documents).join(', ')}`,
        );
      }

      return documents[prop];
    } catch (error) {
      console.error('Error en getDataByProp:', error);
      throw error;
    }
  }

  getAllData(): any {
    const filePath = join(__dirname, '..', 'data', 'documents.json');

    try {
      const document = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(document);
    } catch (error) {
      console.error('Error en getAllData:', error);
      throw error;
    }
  }

  checkFileExists(fileName: string): boolean {
    const filePath = join(__dirname, '..', 'data', fileName);
    return fs.existsSync(filePath);
  }

  readJsonFile(fileName: string): any {
    const filePath = join(__dirname, '..', 'data', fileName);

    if (!fs.existsSync(filePath)) {
      console.log(`El archivo ${fileName} no existe`);
      return null;
    }

    try {
      const document = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(document);
    } catch (error) {
      console.error(`Error al leer el archivo ${fileName}:`, error);
      return null;
    }
  }

  writeJsonFile(fileName: string, data: any): boolean {
    const srcDataPath = join(process.cwd(), 'src', 'data', fileName);

    try {
      // Crear el directorio src/data si no existe
      const srcDataDir = join(process.cwd(), 'src', 'data');
      if (!fs.existsSync(srcDataDir)) {
        fs.mkdirSync(srcDataDir, { recursive: true });
      }

      // Escribir el archivo
      fs.writeFileSync(srcDataPath, JSON.stringify(data, null, 2), 'utf8');

      console.log(`Archivo ${fileName} creado exitosamente en:`, srcDataPath);
      return true;
    } catch (error) {
      console.error(`Error al crear el archivo ${fileName}:`, error);
      return false;
    }
  }

  createCacheDocument(embeddings: any): boolean {
    return this.writeJsonFile('documents-cache.json', embeddings);
  }

  checkCacheDocument(): boolean {
    return this.checkFileExists('documents-cache.json');
  }

  getCacheDocument(): any {
    return this.readJsonFile('documents-cache.json');
  }
}
