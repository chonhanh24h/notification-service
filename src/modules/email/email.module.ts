import { Module } from '@nestjs/common';
import { AwsSesAdapter } from './adapters/aws/aws-ses.adapter';
import { SendGridAdapter } from './adapters/sendgrid/sendgrid.adapter';
import { IEmailService } from './email.interface';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    AwsSesAdapter,
    SendGridAdapter,
    {
      provide: IEmailService,
      useFactory: (configService: ConfigService, awsAdapter: AwsSesAdapter, sendgridAdapter: SendGridAdapter) => {
        const emailProvider = configService.get<string>('EMAIL_PROVIDER', 'aws');
        switch (emailProvider) {
          case 'sendgrid':
            return sendgridAdapter;
          case 'aws':
            return awsAdapter;
          default:
            throw new Error(`Unsupported email provider: ${emailProvider}`);
        }
      },
      inject: [ConfigService, AwsSesAdapter, SendGridAdapter],
    },
  ],
  exports: [IEmailService],
})
export class EmailModule { }
