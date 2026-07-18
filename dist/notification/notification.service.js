"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_ses_1 = require("@aws-sdk/client-ses");
const credential_providers_1 = require("@aws-sdk/credential-providers");
let NotificationService = NotificationService_1 = class NotificationService {
    configService;
    logger = new common_1.Logger(NotificationService_1.name);
    sesClient;
    senderEmail;
    constructor(configService) {
        this.configService = configService;
        const region = this.configService.get('AWS_REGION') ?? 'ap-southeast-2';
        this.senderEmail = this.configService.get('SES_SENDER_EMAIL') ?? '';
        this.sesClient = new client_ses_1.SESClient({
            region,
            credentials: (0, credential_providers_1.fromIni)({
                profile: this.configService.get('AWS_PROFILE'),
            }),
        });
    }
    async handleRegisterOtp(data) {
        this.logger.log(`Received register_otp_requested event for email: ${data.email}`);
        if (!this.senderEmail) {
            this.logger.warn('SES_SENDER_EMAIL is not configured. Skipping sending email.');
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
            const command = new client_ses_1.SendEmailCommand(mailOptions);
            const response = await this.sesClient.send(command);
            this.logger.log(`OTP Email sent successfully to ${data.email}. MessageId: ${response.MessageId}`);
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.logger.error(`Failed to send OTP Email to ${data.email}: ${err.message}`, err.stack);
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map