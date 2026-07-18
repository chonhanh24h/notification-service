import { ConfigService } from '@nestjs/config';
export declare class NotificationService {
    private readonly configService;
    private readonly logger;
    private readonly sesClient;
    private readonly senderEmail;
    constructor(configService: ConfigService);
    handleRegisterOtp(data: {
        email: string;
        otp: string;
    }): Promise<void>;
}
