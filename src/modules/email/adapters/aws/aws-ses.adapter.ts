import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { fromIni } from "@aws-sdk/credential-providers";
import { IEmailService, SendEmailOptions } from "../../email.interface";

@Injectable()
export class AwsSesAdapter implements IEmailService {
    private readonly logger = new Logger(AwsSesAdapter.name);
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

    async sendEmail(options: SendEmailOptions) {
        if (!this.senderEmail) {
            this.logger.warn('SES_SENDER_EMAIL is not configured. Skipping sending email.');
            return;
        }

        const mailOptions = {
            Destination: {
                ToAddresses: [options.to],
            },
            Message: {
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: options.html,
                    },
                    Text: {
                        Charset: 'UTF-8',
                        Data: options.text,
                    },
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: options.subject,
                },
            },
            Source: this.senderEmail,
        };

        try {
            const command = new SendEmailCommand(mailOptions);
            const response = await this.sesClient.send(command);
            this.logger.log(
                `Email sent successfully to ${options.to}. MessageId: ${response.MessageId}`,
            );
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.logger.error(
                `Failed to send Email to ${options.to}: ${err.message}`,
                err.stack,
            );
        }
    }
}