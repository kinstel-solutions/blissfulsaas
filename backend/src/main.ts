import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS for frontend portals
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        // Actual Production Vercel domains
        'https://blissful-patient.vercel.app',
        'https://blissful-therapist.vercel.app',
        'https://blissful-admin.vercel.app',
      ];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

  // Fix for Next.js 18+ undici fetch HeadersTimeoutError
  const server = app.getHttpServer();
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');
  console.log(`Backend running on: http://0.0.0.0:${port}`);
}
bootstrap();
// Trigger reload
