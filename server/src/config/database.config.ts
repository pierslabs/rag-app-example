import { registerAs } from '@nestjs/config';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class DatabaseConfigDto {
  @IsString()
  @IsOptional()
  chromaUrl?: string = 'http://localhost:8000';

  @IsString()
  @IsOptional()
  collectionName?: string = 'restaurant_knowledge';

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(10000)
  @IsOptional()
  maxResults?: number = 10;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  similarityThreshold?: number = 0.7;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1000)
  @Max(30000)
  @IsOptional()
  connectionTimeout?: number = 5000;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  maxRetries?: number = 3;

  @Transform(({ value }) => value === 'true')
  @IsOptional()
  persistData?: boolean = true;
}

export const databaseConfig = registerAs(
  'database',
  (): DatabaseConfigDto => ({
    chromaUrl: process.env.CHROMA_URL || 'http://localhost:8000',
    collectionName:
      process.env.CHROMA_COLLECTION_NAME || 'restaurant_knowledge',
    maxResults: parseInt(process.env.DB_MAX_RESULTS || '10', 10),
    similarityThreshold: parseFloat(
      process.env.DB_SIMILARITY_THRESHOLD || '0.7',
    ),
    connectionTimeout: parseInt(
      process.env.DB_CONNECTION_TIMEOUT || '5000',
      10,
    ),
    maxRetries: parseInt(process.env.DB_MAX_RETRIES || '3', 10),
    persistData: process.env.DB_PERSIST_DATA !== 'false',
  }),
);
