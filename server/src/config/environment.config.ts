import { plainToInstance, Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Staging = 'staging',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsString()
  @IsNotEmpty()
  OPENAI_API_KEY!: string;

  @IsString()
  @IsOptional()
  CHROMA_URL?: string;

  @IsString()
  @IsOptional()
  PORT?: string;

  @IsString()
  @IsOptional()
  HOST?: string;

  @IsString()
  @IsOptional()
  APP_NAME?: string;

  @IsString()
  @IsOptional()
  APP_VERSION?: string;

  @IsString()
  @IsOptional()
  APP_DESCRIPTION?: string;

  @IsString()
  @IsOptional()
  SWAGGER_PATH?: string;

  @IsString()
  @IsOptional()
  OPENAI_CHAT_MODEL?: string;

  @IsString()
  @IsOptional()
  OPENAI_EMBEDDING_MODEL?: string;

  @IsString()
  @IsOptional()
  OPENAI_TEMPERATURE?: string;

  @IsString()
  @IsOptional()
  OPENAI_MAX_TOKENS?: string;

  @IsString()
  @IsOptional()
  OPENAI_REQUEST_TIMEOUT?: string;

  @IsString()
  @IsOptional()
  OPENAI_MAX_RETRIES?: string;

  @IsString()
  @IsOptional()
  OPENAI_SYSTEM_PROMPT?: string;

  @IsString()
  @IsOptional()
  CHROMA_COLLECTION_NAME?: string;

  @IsString()
  @IsOptional()
  DB_MAX_RESULTS?: string;

  @IsString()
  @IsOptional()
  DB_SIMILARITY_THRESHOLD?: string;

  @IsString()
  @IsOptional()
  DB_CONNECTION_TIMEOUT?: string;

  @IsString()
  @IsOptional()
  DB_MAX_RETRIES?: string;

  @IsString()
  @IsOptional()
  DB_PERSIST_DATA?: string;

  @IsString()
  @IsOptional()
  JWT_SECRET?: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN?: string;

  @IsString()
  @IsOptional()
  CORS_ORIGINS?: string;

  @IsString()
  @IsOptional()
  RATE_LIMIT_MAX?: string;

  @IsString()
  @IsOptional()
  RATE_LIMIT_WINDOW_MS?: string;

  @IsString()
  @IsOptional()
  API_KEY_HEADER?: string;

  @IsString()
  @IsOptional()
  ENABLE_API_KEY?: string;

  @IsString()
  @IsOptional()
  LOG_LEVEL?: string;

  @IsString()
  @IsOptional()
  ENABLE_FILE_LOGGING?: string;

  @IsString()
  @IsOptional()
  LOG_DIR?: string;

  @IsString()
  @IsOptional()
  LOG_FILE_NAME?: string;

  @IsString()
  @IsOptional()
  ERROR_FILE_NAME?: string;

  @IsString()
  @IsOptional()
  ENABLE_CONSOLE_LOGGING?: string;

  @IsString()
  @IsOptional()
  LOG_EXCLUDE_CONTEXTS?: string;

  @Transform(({ value }) => value === 'true')
  @IsOptional()
  ENABLE_SWAGGER?: boolean;

  @Transform(({ value }) => value === 'true')
  @IsOptional()
  ENABLE_CORS?: boolean;
}

export function validateEnvironment(config: Record<string, unknown>) {
  console.log(config);
  const filteredConfig = {
    NODE_ENV: config.NODE_ENV,
    OPENAI_API_KEY: config.OPENAI_API_KEY,
    CHROMA_URL: config.CHROMA_URL,
    PORT: config.PORT,
    HOST: config.HOST,
    APP_NAME: config.APP_NAME,
    APP_VERSION: config.APP_VERSION,
    APP_DESCRIPTION: config.APP_DESCRIPTION,
    SWAGGER_PATH: config.SWAGGER_PATH,
    OPENAI_CHAT_MODEL: config.OPENAI_CHAT_MODEL,
    OPENAI_EMBEDDING_MODEL: config.OPENAI_EMBEDDING_MODEL,
    OPENAI_TEMPERATURE: config.OPENAI_TEMPERATURE,
    OPENAI_MAX_TOKENS: config.OPENAI_MAX_TOKENS,
    OPENAI_REQUEST_TIMEOUT: config.OPENAI_REQUEST_TIMEOUT,
    OPENAI_MAX_RETRIES: config.OPENAI_MAX_RETRIES,
    OPENAI_SYSTEM_PROMPT: config.OPENAI_SYSTEM_PROMPT,
    CHROMA_COLLECTION_NAME: config.CHROMA_COLLECTION_NAME,
    DB_MAX_RESULTS: config.DB_MAX_RESULTS,
    DB_SIMILARITY_THRESHOLD: config.DB_SIMILARITY_THRESHOLD,
    DB_CONNECTION_TIMEOUT: config.DB_CONNECTION_TIMEOUT,
    DB_MAX_RETRIES: config.DB_MAX_RETRIES,
    DB_PERSIST_DATA: config.DB_PERSIST_DATA,
    JWT_SECRET: config.JWT_SECRET,
    JWT_EXPIRES_IN: config.JWT_EXPIRES_IN,
    CORS_ORIGINS: config.CORS_ORIGINS,
    RATE_LIMIT_MAX: config.RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MS: config.RATE_LIMIT_WINDOW_MS,
    API_KEY_HEADER: config.API_KEY_HEADER,
    ENABLE_API_KEY: config.ENABLE_API_KEY,
    LOG_LEVEL: config.LOG_LEVEL,
    ENABLE_FILE_LOGGING: config.ENABLE_FILE_LOGGING,
    LOG_DIR: config.LOG_DIR,
    LOG_FILE_NAME: config.LOG_FILE_NAME,
    ERROR_FILE_NAME: config.ERROR_FILE_NAME,
    ENABLE_CONSOLE_LOGGING: config.ENABLE_CONSOLE_LOGGING,
    LOG_EXCLUDE_CONTEXTS: config.LOG_EXCLUDE_CONTEXTS,
    ENABLE_SWAGGER: config.ENABLE_SWAGGER,
    ENABLE_CORS: config.ENABLE_CORS,
  };

  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    filteredConfig,
    {
      enableImplicitConversion: true,
    },
  );

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    whitelist: false,
    forbidNonWhitelisted: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => {
        const constraints = error.constraints || {};
        const propertyName = error.property;
        const messages = Object.values(constraints);
        return `${propertyName}: ${messages.join(', ')}`;
      })
      .join('; ');

    throw new Error(`❌ Configuración inválida: ${errorMessages}`);
  }

  return config;
}
