import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  if (configService.app.enableCors) {
    app.enableCors({
      origin: configService.security.corsOrigins,
      credentials: true,
    });
  }

  if (configService.app.enableSwagger && !configService.isProduction) {
    const config = new DocumentBuilder()
      .setTitle(configService.app.name || 'RAG API')
      .setDescription(configService.app.description || 'API del Sistema RAG')
      .setVersion(configService.app.version || '1.0.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(
      configService.app.swaggerPath || 'api/docs',
      app,
      document,
    );
  }

  console.log('🚀 Sistema RAG iniciado:');
  console.log(`📊 Información:`, configService.getSystemInfo());

  await app.listen(
    configService.app.port || 3000,
    configService.app.host || '0.0.0.0',
  );

  console.log(
    `🌟 Aplicación ejecutándose en: http://${configService.app.host}:${configService.app.port}`,
  );
  if (configService.app.enableSwagger) {
    console.log(
      `📚 Swagger disponible en: http://${configService.app.host}:${configService.app.port}${configService.app.swaggerPath}`,
    );
  }
}

bootstrap();
