import { registerAs } from '@nestjs/config';
import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class SecurityConfigDto {
  @IsString()
  @IsOptional()
  jwtSecret?: string = 'your-super-secret-jwt-key';

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(300)
  @IsOptional()
  jwtExpiresIn?: number = 3600; // 1 hora en segundos

  @Transform(({ value }) =>
    value.split(',').map((origin: string) => origin.trim()),
  )
  @IsArray()
  @IsOptional()
  corsOrigins?: string[] = ['http://localhost:3000', 'http://localhost:3001'];

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @IsOptional()
  rateLimitMax?: number = 100;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(60000)
  @IsOptional()
  rateLimitWindowMs?: number = 900000; // 15 minutos

  @IsString()
  @IsOptional()
  apiKeyHeader?: string = 'x-api-key';

  @Transform(({ value }) => value === 'true')
  @IsOptional()
  enableApiKey?: boolean = false;
}

export const securityConfig = registerAs(
  'security',
  (): SecurityConfigDto => ({
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    jwtExpiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600', 10),
    corsOrigins: process.env.CORS_ORIGINS?.split(',').map((origin) =>
      origin.trim(),
    ) || ['http://localhost:3000', 'http://localhost:3001'],
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    rateLimitWindowMs: parseInt(
      process.env.RATE_LIMIT_WINDOW_MS || '900000',
      10,
    ),
    apiKeyHeader: process.env.API_KEY_HEADER || 'x-api-key',
    enableApiKey: process.env.ENABLE_API_KEY === 'true',
  }),
);
