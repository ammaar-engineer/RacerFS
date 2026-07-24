import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { CustomGlobalException } from "src/GlobalException";
import request from 'supertest';

describe("Payment Workflow - Buy Storage", () => {
    let app: INestApplication;
    let testAccountToken: string;
    let initialStorage: { total_storage: number; used_storage: number; available_storage: number };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        }).compile()
        app = moduleFixture.createNestApplication()
        const configService = app.get(ConfigService)
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true
        }))
        app.useGlobalFilters(new CustomGlobalException(configService))
        await app.init()
    })

    afterAll(async () => {
        await app.close()
    }, 3000)

    describe("Setup 1: Buat test account", () => {
        it("Berhasil membuat test account dan mendapatkan token", async () => {
            const res = await request(app.getHttpServer())
                .get("/user/create-test-account")
            console.log("TEST ACCOUNT", res.body)
            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(typeof res.body.data.token).toBe("string")
            expect(res.body.data.token.length).toBeGreaterThan(0)
            testAccountToken = res.body.data.token
        })
    })

    describe("Step 1: Cek storage info awal", () => {
        it("Berhasil mendapatkan info storage awal", async () => {
            const res = await request(app.getHttpServer())
                .get("/file/storage-info")
                .set("authorization", testAccountToken)

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toBe("Storage info retrieved successfully")
            expect(typeof res.body.data.total_storage).toBe("number")
            expect(typeof res.body.data.used_storage).toBe("number")
            expect(typeof res.body.data.available_storage).toBe("number")
            expect(res.body.data.total_storage).toBeGreaterThan(0)
            expect(res.body.data.available_storage).toBe(res.body.data.total_storage - res.body.data.used_storage)

            initialStorage = res.body.data
        })
    })

    describe("Step 2: Beli storage (100MB)", () => {
        it("Berhasil menambah storage sebesar 100MB", async () => {
            const res = await request(app.getHttpServer())
                .get("/payment/buy-storage")
                .set("authorization", testAccountToken)
            console.log(res.body)
            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toBe("Added 100mb+ to storage")
        })
    })

    describe("Step 3: Cek storage info setelah beli", () => {
        it("Storage bertambah sebesar 100MB (104857600 bytes)", async () => {
            const res = await request(app.getHttpServer())
                .get("/file/storage-info")
                .set("authorization", testAccountToken)

            const expectedIncrease = 104857600

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data.total_storage).toBe(initialStorage.total_storage + expectedIncrease)
            expect(res.body.data.used_storage).toBe(initialStorage.used_storage)
            expect(res.body.data.available_storage).toBe(res.body.data.total_storage - res.body.data.used_storage)
            expect(res.body.data.available_storage).toBe(initialStorage.available_storage + expectedIncrease)
        })
    })
})