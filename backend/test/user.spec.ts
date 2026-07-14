import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { CustomGlobalException } from 'src/GlobalException';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { REDIS_CLIENT } from 'src/global_modules/redis.module';

describe("User route testing", () => {
  let app: INestApplication;
  let redisClient: ReturnType<typeof createClient>;
  let registerSessionId: string;
  let loginSessionId: string;
  const testEmail = "delivered@resend.dev";

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()
    app = moduleFixture.createNestApplication()
    const configService = app.get(ConfigService)
    redisClient = app.get(REDIS_CLIENT)
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true
    }))
    app.useGlobalFilters(new CustomGlobalException(configService))
    await app.init()
  })

  afterAll(async() => {
    await app.close()
  })

  describe("User Workflow Testing", () => {
    it("Step 1: User register dengan alamat email delivered@resend.dev", async () => {
      const res = await request(app.getHttpServer())
        .post("/user/register")
        .send({ email: testEmail })

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty("message", "OTP Has been sent to your email")
      expect(res.body.data).toHaveProperty("sessionId")
      expect(typeof res.body.data.sessionId).toBe("string")
      
      // Save sessionId for verification
      registerSessionId = res.body.data.sessionId
    })

    it("Step 2: User verifikasi kode OTP dari register dengan sessionId", async () => {
      // Ambil OTP dari Redis menggunakan sessionId
      const redisData = await redisClient.get(registerSessionId)
      expect(redisData).not.toBeNull()
      const { otp } = JSON.parse(redisData!)
      const res = await request(app.getHttpServer())
        .post("/user/verify-otp")
        .send({ 
          sessionId: registerSessionId,
          otp: otp
      })

      // Expected response for successful registration verification
      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty("message", "OTP verified successfully and user created")
      expect(res.body.data).toHaveProperty("token")
    })

    it("Step 3: User login dengan alamat email tersebut", async () => {
      const res = await request(app.getHttpServer())
        .post("/user/login")
        .send({ email: testEmail })

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty("message", "OTP Has been sent to your email")
      expect(res.body.data).toHaveProperty("sessionId")
      expect(typeof res.body.data.sessionId).toBe("string")
      
      // Save sessionId for login verification
      loginSessionId = res.body.data.sessionId
    })

    it("Step 4: User verifikasi kode OTP dari login", async () => {
      const redisData = await redisClient.get(loginSessionId)
      expect(redisData).not.toBeNull()
      
      const { otp } = JSON.parse(redisData!)

      const res = await request(app.getHttpServer())
        .post("/user/verify-otp")
        .send({ 
          sessionId: loginSessionId,
          otp: otp
        })
      console.log(res.body)
      // Expected response for successful login verification
      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty("message", "Login successful")
      expect(res.body.data).toHaveProperty("email")
      expect(res.body.data).toHaveProperty("userId")
      expect(res.body.data.email).toBe(testEmail)
    })
  })
})
