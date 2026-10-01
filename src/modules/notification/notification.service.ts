import { Injectable, Logger } from '@nestjs/common';
import { IEmailService } from '../email/email.interface';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly emailService: IEmailService) {}

  async handleRegisterOtp(data: { email: string; otp: string }) {
    this.logger.log(
      `Received register_otp_requested event for email: ${data.email}`,
    );

    const htmlData = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Chợ Nhanh 24h - OTP Verification Code</h2>
        <p>Hello,</p>
        <p>Thank you for registering at <strong>Chợ Nhanh 24h</strong>. Your One-Time Password (OTP) for registration is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; padding: 10px 20px; background-color: #f4f4f4; border-radius: 5px; border: 1px dashed #ccc;">
            ${data.otp}
          </span>
        </div>
        <p>This code is valid for 5 minutes. If you did not request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
        <p style="font-size: 12px; color: #888; text-align: center;">This is an automated email. Please do not reply directly.</p>
      </div>
    `;
    const textData = `Hello, your OTP for registration at Chợ Nhanh 24h is: ${data.otp}. It is valid for 5 minutes.`;
    const subjectData = `[Chợ Nhanh 24h] Your Registration OTP Code`;

    await this.emailService.sendEmail({
      to: data.email,
      subject: subjectData,
      html: htmlData,
      text: textData,
    });
  }
}
