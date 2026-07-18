import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { fromIni } from '@aws-sdk/credential-providers';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly sesClient: SESClient;
  private readonly senderEmail: string;

  constructor(private readonly configService: ConfigService) {
    const region =
      this.configService.get<string>('AWS_REGION') ?? 'ap-southeast-2';
    this.senderEmail = this.configService.get<string>('SES_SENDER_EMAIL') ?? '';

    this.sesClient = new SESClient({
      region,
      credentials: fromIni({
        profile: this.configService.get<string>('AWS_PROFILE'),
      }),
    });
  }

  async handleRegisterOtp(data: { email: string; otp: string }) {
    this.logger.log(
      `Received register_otp_requested event for email: ${data.email}`,
    );

    if (!this.senderEmail) {
      this.logger.warn(
        'SES_SENDER_EMAIL is not configured. Skipping sending email.',
      );
      return;
    }

    const mailOptions = {
      Destination: {
        ToAddresses: [data.email],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `
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
            `,
          },
          Text: {
            Charset: 'UTF-8',
            Data: `Hello, your OTP for registration at Chợ Nhanh 24h is: ${data.otp}. It is valid for 5 minutes.`,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: `[Chợ Nhanh 24h] Your Registration OTP Code`,
        },
      },
      Source: this.senderEmail,
    };

    try {
      const command = new SendEmailCommand(mailOptions);
      const response = await this.sesClient.send(command);
      this.logger.log(
        `OTP Email sent successfully to ${data.email}. MessageId: ${response.MessageId}`,
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Failed to send OTP Email to ${data.email}: ${err.message}`,
        err.stack,
      );
    }
  }
}
