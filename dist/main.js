"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const app_module_1 = require("./app.module");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
async function bootstrap() {
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    const queue = 'notification_queue';
    const app = await core_1.NestFactory.createMicroservice(app_module_1.AppModule, {
        transport: microservices_1.Transport.RMQ,
        options: {
            urls: [rabbitmqUrl],
            queue: queue,
            queueOptions: {
                durable: true,
            },
        },
    });
    await app.listen();
    console.log(`Notification Service is listening for RMQ events on queue: ${queue}`);
}
bootstrap().catch((err) => {
    console.error(err);
});
//# sourceMappingURL=main.js.map