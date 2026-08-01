declare class TestingService {
    /**
     * Create test account (development only)
     * Uses GET /user/create-test-account with account-test header
     */
    createTestAccount(email: string): Promise<string>;
    /**
     * Save token to disk
     */
    saveToken(token: string): void;
}
export declare const testingService: TestingService;
export {};
//# sourceMappingURL=testing.service.d.ts.map