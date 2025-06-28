import { Injectable, Logger } from '@nestjs/common';
import { DocumentBuilderService } from '../document-builder/document-builder.service';
import { VectorDbService } from '../vector-db/vector-db.service';
import { RestaurantProcessorService } from './restaurant-processor.service';

@Injectable()
export class RestaurantKnowledgeService {
  private readonly logger = new Logger('RestaurantKnowledgeService');

  constructor(
    private readonly documentBuilder: DocumentBuilderService,
    private readonly vectorDbService: VectorDbService,
    private readonly restaurantProcessor: RestaurantProcessorService,
  ) {}

  async initializeKnowledgeBase(): Promise<void> {
    this.logger.log('Inicializando base de conocimientos del restaurante...');

    const cacheExists = this.documentBuilder.checkCacheDocument();

    if (!cacheExists) {
      this.logger.log('Cache no existe, procesando todos los datos...');
      await this.restaurantProcessor.processAndStoreAllData();
    } else {
      this.logger.log('Cargando datos desde cache...');
      await this.loadFromCache();
    }

    this.logger.log('Base de conocimientos inicializada correctamente');
  }

  async refreshKnowledgeBase(): Promise<void> {
    this.logger.log('Refrescando base de conocimientos...');

    // Resetear colección actual
    await this.vectorDbService.resetCollection();

    // Procesar y almacenar todos los datos nuevamente
    await this.restaurantProcessor.processAndStoreAllData();

    this.logger.log('Base de conocimientos refrescada exitosamente');
  }

  async addNewData(dataType: string): Promise<void> {
    this.logger.log(`Agregando nuevos datos de tipo: ${dataType}`);

    try {
      await this.restaurantProcessor.processSpecificData(dataType);

      // Actualizar cache si es necesario
      await this.updateCacheAfterAddition();

      this.logger.log(`Datos de ${dataType} agregados exitosamente`);
    } catch (error) {
      this.logger.error(`Error agregando datos de ${dataType}:`, error);
      throw error;
    }
  }

  async resetKnowledgeBase(): Promise<boolean> {
    try {
      this.logger.log('Reseteando base de conocimientos...');

      await this.vectorDbService.resetCollection();

      // Eliminar cache si existe
      // (Nota: DocumentBuilderService no tiene método para eliminar cache, pero se puede implementar)

      this.logger.log('Base de conocimientos reseteada exitosamente');
      return true;
    } catch (error) {
      this.logger.error('Error reseteando base de conocimientos:', error);
      return false;
    }
  }

  async getKnowledgeBaseInfo(): Promise<any> {
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
    } catch (error) {
      this.logger.error(
        'Error obteniendo información de la base de conocimientos:',
        error,
      );
      return {
        status: 'error',
        error: error.message,
      };
    }
  }

  async isInitialized(): Promise<boolean> {
    try {
      const collectionInfo = await this.vectorDbService.getCollectionInfo();
      return collectionInfo.count > 0;
    } catch (error) {
      return false;
    }
  }

  private async loadFromCache(): Promise<void> {
    try {
      await this.vectorDbService.loadFromCache(this.documentBuilder);
      this.logger.log('Datos cargados desde cache exitosamente');
    } catch (error) {
      this.logger.error(
        'Error cargando desde cache, procesando datos nuevamente...',
      );
      await this.restaurantProcessor.processAndStoreAllData();
    }
  }

  private async updateCacheAfterAddition(): Promise<void> {
    // Esta función se puede implementar para actualizar el cache
    // después de agregar nuevos datos específicos
    this.logger.log('Cache actualizado después de agregar datos');
  }
}
