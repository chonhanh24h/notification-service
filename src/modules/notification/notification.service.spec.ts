import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { IEmailService } from '../email/email.interface';

describe('NotificationService', () => {
  let service: NotificationService;
  let emailService: IEmailService;

  const mockEmailService = {
    sendEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: IEmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    emailService = module.get<IEmailService>(IEmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleRegisterOtp', () => {
    it('should send register otp email', async () => {
      await service.handleRegisterOtp({
        email: 'test@example.com',
        otp: '123456',
      });

      expect(emailService.sendEmail).toHaveBeenCalledTimes(1);
    });
  });
});
