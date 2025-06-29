import { registerAs } from '@nestjs/config';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class AppConfigDto {
  @IsString()
  @IsOptional()
  name?: string = 'RAG Sistema';

  @IsString()
  @IsOptional()
  version?: string = '1.0.0';

  @IsString()
  @IsOptional()
  description?: string = 'Sistema RAG profesional';

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1000)
  @Max(65535)
  @IsOptional()
  port?: number = 3000;

  @IsString()
  @IsOptional()
  host?: string = '0.0.0.0';

  @IsString()
  @IsOptional()
  environment?: string = 'development';

  @Transform(({ value }) => value === 'true')
  @IsOptional()
  enableCors?: boolean = true;

  @Transform(({ value }) => value === 'true')
  @IsOptional()
  enableSwagger?: boolean = true;

  @IsString()
  @IsOptional()
  swaggerPath?: string = '/api/docs';
}

export const appConfig = registerAs(
  'app',
  (): AppConfigDto => ({
    name: process.env.APP_NAME || 'RAG Sistema',
    version: process.env.APP_VERSION || '1.0.0',
    description: process.env.APP_DESCRIPTION || 'Sistema RAG profesional',
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    environment: process.env.NODE_ENV || 'development',
    enableCors: process.env.ENABLE_CORS !== 'false',
    enableSwagger: process.env.ENABLE_SWAGGER !== 'false',
    swaggerPath: process.env.SWAGGER_PATH || '/api/docs',
  }),
);
