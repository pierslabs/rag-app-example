import { registerAs } from '@nestjs/config';
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export type LogLevel =
  | 'error'
  | 'warn'
  | 'info'
  | 'http'
  | 'verbose'
  | 'debug'
  | 'silly';

export class LoggingConfigDto {
  @IsString()
  @IsOptional()
  @IsIn(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
  level?: LogLevel = 'info';

  @Transform(({ value }) => value === 'true')
  @IsOptional()
  enableFileLogging?: boolean = true;

  @IsString()
  @IsOptional()
  logDir?: string = 'logs';

  @IsString()
  @IsOptional()
  logFileName?: string = 'app.log';

  @IsString()
  @IsOptional()
  errorFileName?: string = 'error.log';

  @Transform(({ value }) => value === 'true')
  @IsOptional()
  enableConsoleLogging?: boolean = true;

  @Transform(({ value }) => value === 'true')
  @IsOptional()
  prettyPrint?: boolean = true;

  @Transform(({ value }) =>
    value.split(',').map((context: string) => context.trim()),
  )
  @IsArray()
  @IsOptional()
  excludeContexts?: string[] = [];
}

export const loggingConfig = registerAs(
  'logging',
  (): LoggingConfigDto => ({
    level: (process.env.LOG_LEVEL as LogLevel) || 'info',
    enableFileLogging: process.env.ENABLE_FILE_LOGGING !== 'false',
    logDir: process.env.LOG_DIR || 'logs',
    logFileName: process.env.LOG_FILE_NAME || 'app.log',
    errorFileName: process.env.ERROR_FILE_NAME || 'error.log',
    enableConsoleLogging: process.env.ENABLE_CONSOLE_LOGGING !== 'false',
    prettyPrint: process.env.NODE_ENV === 'development',
    excludeContexts:
      process.env.LOG_EXCLUDE_CONTEXTS?.split(',').map((context) =>
        context.trim(),
      ) || [],
  }),
);
