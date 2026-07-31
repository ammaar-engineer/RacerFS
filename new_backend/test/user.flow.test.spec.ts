import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { createClient } from 'redis';
import { REDIS_CLIENT } from '../src/connections/redis.module';
import { GlobalExceptionFilter } from '../src/middleware/global-exception.filter';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('User route testing', () => {
  let app: INestApplication;
  let redisClient: ReturnType<typeof createClient>;
  let registerSessionId: string;
  let loginSessionId: string;
  const testEmail = 'delivered@resend.dev';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    const configService = app.get(ConfigService);
    redisClient = app.get(REDIS_CLIENT);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter(configService));
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('User Workflow Testing', () => {
    it('Step 1: User register dengan alamat email delivered@resend.dev', async () => {
      const res = await request(app.getHttpServer())
        .post('/user/register')
        .send({ email: testEmail });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'OTP Has been sent to your email');
      expect(res.body.data).toHaveProperty('sessionId');
      expect(typeof res.body.data.sessionId).toBe('string');

      // Save sessionId for verification
      registerSessionId = res.body.data.sessionId;
    });

    it('Step 2: User verifikasi kode OTP dari register dengan sessionId', async () => {
      // Ambil OTP dari Redis menggunakan sessionId dengan format key yang benar
      const redisData = await redisClient.get(`auth:${registerSessionId}`);
      expect(redisData).not.toBeNull();
      const { otp } = JSON.parse(redisData!);
      const res = await request(app.getHttpServer())
        .post('/user/verify-otp')
        .send({
          sessionId: registerSessionId,
          otp: otp,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'register successfully');
      expect(res.body.data).toHaveProperty('token');
    });

    it('Step 3: User login dengan email yang sudah terdaftar', async () => {
      const res = await request(app.getHttpServer())
        .post('/user/login')
        .send({ email: testEmail });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'OTP Has been sent to your email');
      expect(res.body.data).toHaveProperty('sessionId');
      expect(typeof res.body.data.sessionId).toBe('string');

      // Save sessionId for login verification
      loginSessionId = res.body.data.sessionId;
    });

    it('Step 4: User verifikasi kode OTP dari login', async () => {
      const redisData = await redisClient.get(`${loginSessionId}:auth`);
      expect(redisData).not.toBeNull();

      const { otp } = JSON.parse(redisData!);

      const res = await request(app.getHttpServer())
        .post('/user/verify-otp')
        .send({
          sessionId: loginSessionId,
          otp: otp,
        });
      // Expected response for successful login verification
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'login successfully');
      expect(res.body.data).toHaveProperty('token');
    });
  });
});
