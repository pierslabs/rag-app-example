import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { AppConfigDto } from './app.config';
import { DatabaseConfigDto } from './database.config';
import { AiConfigDto } from './ai.config';
import { SecurityConfigDto } from './security.config';
import { LoggingConfigDto } from './logging.config';

@Injectable()
export class ConfigService {
  constructor(private readonly configService: NestConfigService) {}

  get app(): AppConfigDto {
    return this.configService.get<AppConfigDto>('app')!;
  }

  get database(): DatabaseConfigDto {
    return this.configService.get<DatabaseConfigDto>('database')!;
  }

  get ai(): AiConfigDto {
    return this.configService.get<AiConfigDto>('ai')!;
  }

  get security(): SecurityConfigDto {
    return this.configService.get<SecurityConfigDto>('security')!;
  }

  get logging(): LoggingConfigDto {
    return this.configService.get<LoggingConfigDto>('logging')!;
  }

  get isDevelopment(): boolean {
    return this.app.environment === 'development';
  }

  get isProduction(): boolean {
    return this.app.environment === 'production';
  }

  get isTest(): boolean {
    return this.app.environment === 'test';
  }

  // Métodos de utilidad
  getOrThrow<T>(key: string): T {
    const value = this.configService.get<T>(key);
    if (value === undefined || value === null) {
      throw new Error(
        `❌ Variable de configuración requerida no encontrada: ${key}`,
      );
    }
    return value;
  }

  getWithDefault<T>(key: string, defaultValue: T): T {
    return this.configService.get<T>(key, defaultValue);
  }

  // Información del sistema
  getSystemInfo() {
    return {
      app: {
        name: this.app.name,
        version: this.app.version,
        environment: this.app.environment,
      },
      server: {
        host: this.app.host,
        port: this.app.port,
      },
      features: {
        swagger: this.app.enableSwagger,
        cors: this.app.enableCors,
      },
      ai: {
        chatModel: this.ai.chatModel,
        embeddingModel: this.ai.embeddingModel,
      },
      database: {
        collectionName: this.database.collectionName,
        maxResults: this.database.maxResults,
      },
    };
  }
}
