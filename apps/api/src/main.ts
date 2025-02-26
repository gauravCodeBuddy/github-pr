import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppConfigService } from './app-config/app-config.service';

async function bootstrap() {
  BigInt.prototype['toJSON'] = function () {
    return Number(this.toString());
  };
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'Bearer',
    })
    .build();

  const options: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
    },
  };
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, options);

  const loggerService = new Logger('Main');
  const appConfigService: AppConfigService = app.get(AppConfigService);

  try {
    await app.listen(appConfigService.app.port);
    loggerService.log(`Application started on http://localhost:${appConfigService.app.port}/api`);
  } catch (error) {
    loggerService.error('Failed to start application', error);
    process.exit(1);
  }
  process.on('SIGTERM', async () => {
    try {
      await app.close();
      loggerService.log('Application gracefully closed');
      process.exit(0);
    } catch (error) {
      loggerService.error('Error during shutdown', error);
      process.exit(1);
    }
  });
}
bootstrap();
