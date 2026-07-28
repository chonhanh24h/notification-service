import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('register_otp_requested')
  async handleRegisterOtp(@Payload() data: { email: string; otp: string }) {
    await this.notificationService.handleRegisterOtp(data);
  }
}
