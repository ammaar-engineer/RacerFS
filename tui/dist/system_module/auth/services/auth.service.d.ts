declare class AuthService {
    /**
     * Request OTP for login
     */
    requestLoginOTP(email: string): Promise<string>;
    /**
     * Request OTP for register
     */
    requestRegisterOTP(email: string): Promise<string>;
    /**
     * Verify OTP and get JWT token
     */
    verifyOTP(sessionId: string, otp: string): Promise<string>;
    /**
     * Save token to disk
     */
    saveToken(token: string): void;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=auth.service.d.ts.map