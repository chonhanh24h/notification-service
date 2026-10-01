export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text: string;
}

export abstract class IEmailService {
    abstract sendEmail(options: SendEmailOptions): Promise<void>;
}