import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from './notification.service';

const mockSend = jest.fn();

jest.mock('@aws-sdk/client-ses', () => {
  return {
    SESClient: jest.fn().mockImplementation(() => {
      return {
        send: mockSend,
      };
    }),
    SendEmailCommand: jest.fn().mockImplementation((args: unknown) => {
      return {
        input: args,
      };
    }),
  };
});

jest.mock('@aws-sdk/credential-providers', () => {
  return {
    fromIni: jest.fn(),
  };
});

interface MockLogger {
  warn: jest.Mock;
  log: jest.Mock;
  error: jest.Mock;
}

interface TestServiceWithLogger extends NotificationService {
  logger: MockLogger;
}

describe('NotificationService', () => {
  let service: NotificationService;
  let configService: ConfigService;

  const mockConfigValues: Record<string, string> = {
    AWS_REGION: 'ap-southeast-2',
    SES_SENDER_EMAIL: 'sender@example.com',
    AWS_PROFILE: 'default',
  };

  const mockConfigService = {
    get: jest.fn((key: string): string => mockConfigValues[key] ?? ''),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleRegisterOtp', () => {
    it('should skip sending email if SES_SENDER_EMAIL is not configured', async () => {
      mockConfigService.get.mockImplementation((key: string): string => {
        if (key === 'SES_SENDER_EMAIL') return '';
        return mockConfigValues[key] ?? '';
      });

      const testService = new NotificationService(
        configService,
      ) as TestServiceWithLogger;
      const logWarnSpy = jest.spyOn(testService.logger, 'warn');

      await testService.handleRegisterOtp({
        email: 'test@example.com',
        otp: '123456',
      });

      expect(logWarnSpy).toHaveBeenCalledWith(
        'SES_SENDER_EMAIL is not configured. Skipping sending email.',
      );
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('should successfully send an email when SES_SENDER_EMAIL is configured', async () => {
      mockConfigService.get.mockImplementation(
        (key: string): string => mockConfigValues[key] ?? '',
      );

      const testService = new NotificationService(
        configService,
      ) as TestServiceWithLogger;
      mockSend.mockResolvedValueOnce({ MessageId: 'test-message-id' });

      const logLogSpy = jest.spyOn(testService.logger, 'log');

      await testService.handleRegisterOtp({
        email: 'recipient@example.com',
        otp: '654321',
      });

      expect(mockSend).toHaveBeenCalled();
      expect(logLogSpy).toHaveBeenCalledWith(
        'OTP Email sent successfully to recipient@example.com. MessageId: test-message-id',
      );
    });

    it('should log an error if SESClient send fails', async () => {
      mockConfigService.get.mockImplementation(
        (key: string): string => mockConfigValues[key] ?? '',
      );

      const testService = new NotificationService(
        configService,
      ) as TestServiceWithLogger;
      const testError = new Error('SES service down');
      mockSend.mockRejectedValueOnce(testError);

      const logErrorSpy = jest.spyOn(testService.logger, 'error');

      await testService.handleRegisterOtp({
        email: 'recipient@example.com',
        otp: '654321',
      });

      expect(mockSend).toHaveBeenCalled();
      expect(logErrorSpy).toHaveBeenCalledWith(
        'Failed to send OTP Email to recipient@example.com: SES service down',
        testError.stack,
      );
    });
  });
});
