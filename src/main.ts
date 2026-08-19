import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { config } from 'dotenv';

// Load environment variables from .env file before initializing the app
config();

async function bootstrap() {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3006;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0', // Để có thể kết nối từ bên ngoài container (nếu dùng Docker)
        port: port,
      },
    },
  );

  await app.listen();
  console.log(`Notification Microservice is running on port: ${port}`);
}
bootstrap().catch((err) => {
  console.error('Failed to start microservice', err);
});
