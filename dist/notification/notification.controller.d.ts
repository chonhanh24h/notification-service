import { NotificationService } from './notification.service';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    handleRegisterOtp(data: {
        email: string;
        otp: string;
    }): Promise<void>;
}
