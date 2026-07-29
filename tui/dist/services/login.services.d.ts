export declare class loginServicesClass {
    sendLoginRequest(email: string): Promise<{
        sessionId: any;
    }>;
    verifyOtp(sessionId: string, otp: string): Promise<{
        token: any;
    }>;
}
//# sourceMappingURL=login.services.d.ts.map