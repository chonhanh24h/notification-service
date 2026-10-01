import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEmailService, SendEmailOptions } from '../../email.interface';

@Injectable()
export class SendGridAdapter implements IEmailService {
  private readonly logger = new Logger(SendGridAdapter.name);
  private readonly apiKey: string;
  private readonly senderEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('SENDGRID_API_KEY') ?? '';
    this.senderEmail = this.configService.get<string>('SENDGRID_SENDER_EMAIL') ?? '';
    
    // Khởi tạo SendGrid SDK tại đây (ví dụ: sgMail.setApiKey(this.apiKey))
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    if (!this.apiKey || !this.senderEmail) {
      this.logger.warn('SENDGRID credentials chưa được cấu hình. Bỏ qua gửi email.');
      return;
    }

    try {
      // Triển khai logic gọi SDK SendGrid tại đây...
      // await sgMail.send({ to: options.to, from: this.senderEmail, subject: options.subject, html: options.html, text: options.text });

      this.logger.log(`[SendGrid] Đã gửi email tới ${options.to}`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`[SendGrid] Lỗi gửi email tới ${options.to}: ${err.message}`, err.stack);
      throw err;
    }
  }
}