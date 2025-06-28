import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Query,
  Sse,
} from '@nestjs/common';
import { SemanticSearchService } from './semantic-search.service';
import { Observable } from 'rxjs';

@Controller('semantic-search')
export class SemanticSearchController {
  logger = new Logger(SemanticSearchController.name);

  constructor(private readonly semanticSearchService: SemanticSearchService) {}

  @Post('search')
  async search(@Body() body: { question: string; maxResults?: number }) {
    try {
      const { question, maxResults = 5 } = body;

      if (!question || question.trim().length === 0) {
        throw new HttpException(
          'La pregunta es requerida',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.semanticSearchService.semanticSearch(
        question,
        maxResults,
      );
    } catch (error) {
      throw new HttpException(
        `Error en búsqueda semántica: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('search/category')
  async searchByCategory(
    @Body() body: { question: string; category: string; maxResults?: number },
  ) {
    try {
      const { question, category, maxResults = 5 } = body;

      if (!question || !category) {
        throw new HttpException(
          'La pregunta y categoría son requeridas',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.semanticSearchService.searchByCategory(
        question,
        category,
        maxResults,
      );
    } catch (error) {
      throw new HttpException(
        `Error en búsqueda por categoría: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('rag')
  async ragResponse(@Body() body: { question: string; maxResults?: number }) {
    try {
      const { question, maxResults = 3 } = body;

      if (!question || question.trim().length === 0) {
        throw new HttpException(
          'La pregunta es requerida',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.semanticSearchService.ragResponse(question, maxResults);
    } catch (error) {
      throw new HttpException(
        `Error en respuesta RAG: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Sse('rag/stream')
  async ragStreamResponse(
    @Query('question') question: string,
    @Query('maxResults') maxResults: string = '3',
  ): Promise<Observable<any>> {
    try {
      if (!question || question.trim().length === 0) {
        throw new HttpException(
          'La pregunta es requerida',
          HttpStatus.BAD_REQUEST,
        );
      }

      const maxRes = parseInt(maxResults) || 3;

      return new Observable((observer) => {
        (async () => {
          try {
            for await (const chunk of this.semanticSearchService.ragStreamResponse(
              question,
              maxRes,
            )) {
              observer.next({ data: chunk });
            }
            observer.complete();
          } catch (error) {
            observer.error(error);
          }
        })();
      });
    } catch (error) {
      throw new HttpException(
        `Error en respuesta RAG streaming: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('categories')
  async getAvailableCategories() {
    try {
      return {
        categories: await this.semanticSearchService.getAvailableCategories(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        `Error obteniendo categorías: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('info')
  async getKnowledgeBaseInfo() {
    try {
      return await this.semanticSearchService.getKnowledgeBaseInfo();
    } catch (error) {
      throw new HttpException(
        `Error obteniendo información: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats')
  async getSearchStats() {
    try {
      return await this.semanticSearchService.getSearchStats();
    } catch (error) {
      throw new HttpException(
        `Error obteniendo estadísticas: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('refresh')
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
    } catch (error) {
      throw new HttpException(
        `Error refrescando base de conocimientos: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('reset')
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
    } catch (error) {
      throw new HttpException(
        `Error reseteando base de conocimientos: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('regenerate-embeddings')
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
    } catch (error) {
      throw new HttpException(
        `Error regenerando embeddings: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('process-specific-data')
  async processSpecificData(@Body() body: { dataType: string }) {
    try {
      const { dataType } = body;

      if (!dataType) {
        throw new HttpException(
          'El tipo de datos es requerido',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.semanticSearchService.processSpecificDataType(dataType);

      return {
        success: true,
        message: `Datos de ${dataType} procesados exitosamente`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        `Error procesando ${body.dataType}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
