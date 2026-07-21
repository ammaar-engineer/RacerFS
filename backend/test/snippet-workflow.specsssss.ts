import { INestApplication, ValidationPipe } from "@nestjs/common"
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import request from 'supertest'
import { AppModule } from "src/app.module";
import { CustomGlobalException } from "src/GlobalException";

describe("Snippet Workflow - User Journey", () => {
    let app: INestApplication;
    let testAccountToken: string;
    let snippet1: any;
    let snippet2: any;

    // Test data
    const snippet1Data = {
        alias: "git-push",
        description: "Push ke remote repository",
        command: "git add . && git commit -m 'update' && git push"
    }

    const snippet1UpdatedCommand = "git add . && git commit -m 'auto commit' && git push origin main"

    const snippet2Data = {
        alias: "docker-run",
        command: "docker-compose up -d"
    }

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
    })

    describe("1. Setup: Buat test account", () => {
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

    describe("2. Workflow: Cek list snippet awal (empty state)", () => {
        it("List snippet masih kosong", async () => {
            const res = await request(app.getHttpServer())
                .get("/snippet/list")
                .set("authorization", testAccountToken)
            
            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toBe("Snippet list retrieved successfully")
            expect(Array.isArray(res.body.data.snippets)).toBe(true)
            expect(res.body.data.snippets.length).toBe(0)
        })
    })

    describe("3. Workflow: User membuat snippet", () => {
        it("Create snippet pertama (dengan description)", async () => {
            const res = await request(app.getHttpServer())
                .post("/snippet/create")
                .set("authorization", testAccountToken)
                .send(snippet1Data)
            
            expect(res.status).toBe(201)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toBe("Snippet created successfully")
            expect(res.body.data.snippet).toBeDefined()
            expect(res.body.data.snippet.id).toBeDefined()
            expect(res.body.data.snippet.alias).toBe(snippet1Data.alias)
            expect(res.body.data.snippet.description).toBe(snippet1Data.description)
            expect(res.body.data.snippet.command).toBe(snippet1Data.command)
            expect(res.body.data.snippet.created_at).toBeDefined()
            
            snippet1 = res.body.data.snippet
        })

        it("Create snippet kedua (tanpa description)", async () => {
            const res = await request(app.getHttpServer())
                .post("/snippet/create")
                .set("authorization", testAccountToken)
                .send(snippet2Data)
            
            expect(res.status).toBe(201)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toBe("Snippet created successfully")
            expect(res.body.data.snippet).toBeDefined()
            expect(res.body.data.snippet.id).toBeDefined()
            expect(res.body.data.snippet.alias).toBe(snippet2Data.alias)
            expect(res.body.data.snippet.command).toBe(snippet2Data.command)
            expect(res.body.data.snippet.created_at).toBeDefined()
            
            snippet2 = res.body.data.snippet
        })
    })

    describe("4. Workflow: User cek list setelah create", () => {
        it("List berisi 2 snippet yang telah dibuat", async () => {
            const res = await request(app.getHttpServer())
                .get("/snippet/list")
                .set("authorization", testAccountToken)
            
            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data.snippets).toBeDefined()
            expect(res.body.data.snippets.length).toBe(2)
            
            const snippets = res.body.data.snippets
            const gitPushSnippet = snippets.find((s: any) => s.alias === snippet1Data.alias)
            const dockerRunSnippet = snippets.find((s: any) => s.alias === snippet2Data.alias)
            
            expect(gitPushSnippet).toBeDefined()
            expect(gitPushSnippet.alias).toBe(snippet1Data.alias)
            expect(gitPushSnippet.description).toBe(snippet1Data.description)
            expect(gitPushSnippet.command).toBe(snippet1Data.command)
            
            expect(dockerRunSnippet).toBeDefined()
            expect(dockerRunSnippet.alias).toBe(snippet2Data.alias)
            expect(dockerRunSnippet.command).toBe(snippet2Data.command)
        })
    })

    describe("5. Workflow: User edit snippet", () => {
        it("Edit command dari snippet pertama", async () => {
            const res = await request(app.getHttpServer())
                .patch(`/snippet/edit?alias=${snippet1Data.alias}`)
                .set("authorization", testAccountToken)
                .send({ command: snippet1UpdatedCommand })
            
            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toBe(`Snippet '${snippet1Data.alias}' updated successfully`)
            expect(res.body.data.snippet).toBeDefined()
            expect(res.body.data.snippet.alias).toBe(snippet1Data.alias)
            expect(res.body.data.snippet.command).toBe(snippet1UpdatedCommand)
        })
    })

    describe("6. Workflow: User cek list setelah edit", () => {
        it("Snippet pertama memiliki command yang baru, snippet kedua tidak berubah", async () => {
            const res = await request(app.getHttpServer())
                .get("/snippet/list")
                .set("authorization", testAccountToken)
            
            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data.snippets.length).toBe(2)
            
            const snippets = res.body.data.snippets
            const gitPushSnippet = snippets.find((s: any) => s.alias === snippet1Data.alias)
            const dockerRunSnippet = snippets.find((s: any) => s.alias === snippet2Data.alias)
            
            expect(gitPushSnippet.command).toBe(snippet1UpdatedCommand)
            expect(dockerRunSnippet.command).toBe(snippet2Data.command)
        })
    })

    describe("7. Workflow: User hapus snippet", () => {
        it("Delete snippet pertama", async () => {
            const res = await request(app.getHttpServer())
                .delete(`/snippet/delete?alias=${snippet1Data.alias}`)
                .set("authorization", testAccountToken)
            
            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toBe(`Snippet '${snippet1Data.alias}' deleted successfully`)
        })
    })

    describe("8. Workflow: User cek list setelah delete", () => {
        it("List tinggal 1 snippet, snippet pertama sudah tidak ada", async () => {
            const res = await request(app.getHttpServer())
                .get("/snippet/list")
                .set("authorization", testAccountToken)
            
            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.data.snippets.length).toBe(1)
            
            const snippets = res.body.data.snippets
            const dockerRunSnippet = snippets.find((s: any) => s.alias === snippet2Data.alias)
            const gitPushSnippet = snippets.find((s: any) => s.alias === snippet1Data.alias)
            
            expect(dockerRunSnippet).toBeDefined()
            expect(dockerRunSnippet.alias).toBe(snippet2Data.alias)
            expect(gitPushSnippet).toBeUndefined()
        })
    })
})