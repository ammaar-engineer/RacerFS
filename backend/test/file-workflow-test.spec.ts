import { INestApplication, ValidationPipe } from "@nestjs/common"
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import request from 'supertest'
import { AppModule } from "src/app.module";
import { CustomGlobalException } from "src/GlobalException";

describe("File Workflow - User Journey", () => {
    let app: INestApplication;
    let testAccountToken: string;
    let accessToken: string;
    let presignedUrl: string;
    let fileKey: string;

    const fileName = "test-document.txt"
    const fileContent = Buffer.from("mock file content here")
    const fileSize = fileContent.byteLength.toString()

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
    }, 3)

    describe("Setup 1: Buat test account", () => {
        it("Berhasil membuat test account dan mendapatkan token", async () => {
            const res = await request(app.getHttpServer())
                .get("/user/create-test-account")

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(typeof res.body.data.token).toBe("string")
            expect(res.body.data.token.length).toBeGreaterThan(0)
            testAccountToken = res.body.data.token
        })
    })

    describe("Setup 2: Generate access token", () => {
        it("Berhasil generate access token", async () => {
            const res = await request(app.getHttpServer())
                .post("/file/generate-access-token")
                .set("authorization", testAccountToken)
            console.log("SUKSES")
            expect(res.status).toBe(201)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toBe("Access token generated successfully")
            expect(typeof res.body.data.access_token).toBe("string")
            expect(res.body.data.access_token.length).toBeGreaterThan(0)
            console.log("AKSES TOKEN", res.body.data)
            accessToken = res.body.data.access_token
        })
    })

    describe("Step 1: Cek list file (empty state)", () => {
        it("List file masih kosong", async () => {
            const res = await request(app.getHttpServer())
                .get("/file/list")
                .set("authorization", testAccountToken)
                .set("access-token", accessToken)

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toBe("File list retrieved successfully")
            expect(Array.isArray(res.body.data.files)).toBe(true)
            expect(res.body.data.files.length).toBe(0)
        })
    })

    describe("Step 2: Get presigned upload URL", () => {
        it("Berhasil mendapatkan presigned upload URL dan file_key", async () => {
            const res = await request(app.getHttpServer())
                .get(`/file/upload-url?file-name=${fileName}`)
                .set("authorization", testAccountToken)
                .set("file-size", fileSize)

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toBe("Upload URL generated successfully")
            expect(typeof res.body.data.url).toBe("string")
            expect(res.body.data.url.length).toBeGreaterThan(0)
            expect(typeof res.body.data.file_key).toBe("string")
            expect(res.body.data.file_key.length).toBeGreaterThan(0)
            console.log(res.body.data)
            presignedUrl = res.body.data.url
            fileKey = res.body.data.file_key
        })
    })

    describe("Step 3: Upload mock file ke MinIO via presigned URL", () => {
        it("Berhasil upload file ke MinIO", async () => {
            const res = await fetch(presignedUrl, {
                method: "PUT",
                body: fileContent,
                headers: { "Content-Type": "application/octet-stream" }
            })
            console.log("ERROR STEP 3: ", res)

            expect(res.status).toBe(200)
        })
    })

    describe("Step 4: Confirm upload SUCCESS", () => {
        it("Berhasil konfirmasi upload dan file tersimpan", async () => {
            const res = await request(app.getHttpServer())
                .post(`/file/confirm-upload?status=SUCCESS&file-name=${fileName}`)
                .set("authorization", testAccountToken)
                .set("file-size", fileSize)
                .set("file-key", fileKey)

            expect(res.status).toBe(201)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toContain("uploaded successfully")
        })
    })

    describe("Step 5: Cek list file (verify file ada)", () => {
        it("List file berisi 1 file yang sudah diupload", async () => {
            const res = await request(app.getHttpServer())
                .get("/file/list")
                .set("authorization", testAccountToken)
                .set("access-token", accessToken)

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data.files.length).toBe(1)
            expect(res.body.data.files[0].name).toBe(fileName)
        })
    })

    describe("Step 6: Set file ke public", () => {
        it("Berhasil set file visibility ke public", async () => {
            const res = await request(app.getHttpServer())
                .patch(`/file/set-visibility?file-name=${fileName}`)
                .set("authorization", testAccountToken)
                .send({ is_public: true })

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toBe("File is now public")
        })
    })

    describe("Step 7: Delete file", () => {
        it("Berhasil delete file", async () => {
            const res = await request(app.getHttpServer())
                .delete(`/file/delete-file?file-name=${fileName}`)
                .set("authorization", testAccountToken)

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toBe(`File ${fileName} deleted successfully`)
        })
    })
})
