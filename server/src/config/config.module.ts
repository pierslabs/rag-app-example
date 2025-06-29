import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import {
  aiConfig,
  appConfig,
  databaseConfig,
  loggingConfig,
  securityConfig,
} from './index';
import { validateEnvironment } from './environment.config';
import { ConfigService } from './config.service';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: ['.env.local', '.env'],
      load: [
        appConfig,
        databaseConfig,
        aiConfig,
        securityConfig,
        loggingConfig,
      ],
      validate: validateEnvironment,
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
