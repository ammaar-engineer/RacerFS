export declare class registerServicesClass {
    sendRegisterRequest(email: string): Promise<{
        sessionId: any;
    }>;
    verifyOtp(sessionId: string, otp: string): Promise<{
        token: any;
    }>;
}
//# sourceMappingURL=register.services.d.ts.map