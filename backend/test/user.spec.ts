import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { CustomGlobalException } from 'src/GlobalException';

describe("User route testing", () => {
  let app: INestApplication;
  let testEmail: string;
  let sessionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()
    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true
    }))
    app.useGlobalFilters(new CustomGlobalException())
    await app.init()
    
    // Setup test email
    testEmail = `test-${Date.now()}@resend.dev`
  })

  afterAll(async() => {
    await app.close()
  })

  describe("POST /user/register", () => {
    describe("Success case", () => {
      it("should send OTP to email and return sessionId for new user", async () => {
        const res = await request(app.getHttpServer())
          .post("/user/register")
          .send({ email: testEmail })

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty("message", "OTP Has been sent to your email")
        expect(res.body.data).toHaveProperty("sessionId")
        expect(typeof res.body.data.sessionId).toBe("string")
        
        // Save sessionId for later tests
        sessionId = res.body.data.sessionId
      })
    })

    describe("Failure case", () => {
      it("should return 409 conflict when email already exists", async () => {
        // First registration
        await request(app.getHttpServer())
          .post("/user/register")
          .send({ email: 'existing@resend.dev' })

        // Try to register again with same email
        const res = await request(app.getHttpServer())
          .post("/user/register")
          .send({ email: 'existing@resend.dev' })

        console.log(res.body)

        expect(res.status).toBe(409)
        expect(res.body).toHaveProperty("message", "Account already exists")
      })

      it("should return 400 when email is invalid", async () => {
        const res = await request(app.getHttpServer())
          .post("/user/register")
          .send({ email: 'invalid-email' })

        expect(res.status).toBe(400)
      })

      it("should return 400 when email is missing", async () => {
        const res = await request(app.getHttpServer())
          .post("/user/register")
          .send({})

        expect(res.status).toBe(400)
      })
    })
  })

  describe("POST /user/login", () => {
    describe("Success case", () => {
      it("should send OTP to email and return sessionId for existing user", async () => {
        // First ensure user exists by registering
        const registerRes = await request(app.getHttpServer())
          .post("/user/register")
          .send({ email: 'logintest@resend.dev' })
        
        expect(registerRes.status).toBe(200)

        // Now try to login
        const res = await request(app.getHttpServer())
          .post("/user/login")
          .send({ email: 'logintest@resend.dev' })

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty("message", "OTP Has been sent to your email")
        expect(res.body.data).toHaveProperty("sessionId")
        expect(typeof res.body.data.sessionId).toBe("string")
      })
    })

    describe("Failure case", () => {
      it("should return 404 when user does not exist", async () => {
        const res = await request(app.getHttpServer())
          .post("/user/login")
          .send({ email: 'nonexistent@resend.dev' })

        expect(res.status).toBe(404)
        expect(res.body).toHaveProperty("message", "Account not found. Please register first")
      })

      it("should return 400 when email is invalid", async () => {
        const res = await request(app.getHttpServer())
          .post("/user/login")
          .send({ email: 'invalid-email' })

        expect(res.status).toBe(400)
      })

      it("should return 400 when email is missing", async () => {
        const res = await request(app.getHttpServer())
          .post("/user/login")
          .send({})

        expect(res.status).toBe(400)
      })
    })
  })
})
