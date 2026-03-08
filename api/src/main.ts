import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = process.env.PORT ?? 3000;
  const config = new DocumentBuilder()
    .setTitle('Canton Wallet API')
    .setDescription('Backend API for Canton Web Wallet')
    .setVersion('0.1.0')
    .addServer(`http://localhost:${port}`, 'Local')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  console.log(`Canton Wallet API running on http://localhost:${port}, Swagger: http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
