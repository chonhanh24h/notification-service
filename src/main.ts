import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { config } from 'dotenv';

// Load environment variables from .env file before initializing the app
config();

async function bootstrap() {
  const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  const queue = 'notification_queue';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: queue,
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  await app.listen();
  console.log(
    `Notification Service is listening for RMQ events on queue: ${queue}`,
  );
}
bootstrap().catch((err) => {
  console.error(err);
});
