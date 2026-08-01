import axios from 'axios';
import { fsService } from '../../../system_services/fs.service.js';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
class AuthService {
    /**
     * Request OTP for login
     */
    async requestLoginOTP(email) {
        try {
            const res = await axios.post(`${BACKEND_URL}/user/login`, { email });
            const sessionId = res.data.data.sessionId;
            return sessionId;
        }
        catch (error) {
            if (error.response?.status === 404) {
                console.log('Email not registered');
            }
            else {
                console.log('Failed to request OTP');
            }
            process.exit(1);
        }
    }
    /**
     * Request OTP for register
     */
    async requestRegisterOTP(email) {
        try {
            const res = await axios.post(`${BACKEND_URL}/user/register`, { email });
            const sessionId = res.data.data.sessionId;
            return sessionId;
        }
        catch (error) {
            if (error.response?.status === 409) {
                console.log('Email already registered');
            }
            else {
                console.log('Failed to request OTP');
            }
            process.exit(1);
        }
    }
    /**
     * Verify OTP and get JWT token
     */
    async verifyOTP(sessionId, otp) {
        try {
            const res = await axios.post(`${BACKEND_URL}/user/verify-otp`, {
                sessionId,
                otp
            });
            const token = res.data.data.token;
            return token;
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log('Invalid or expired OTP');
            }
            else {
                console.log('Failed to verify OTP');
            }
            process.exit(1);
        }
    }
    /**
     * Save token to disk
     */
    saveToken(token) {
        fsService.writeUserData({ account_token: token });
    }
}
export const authService = new AuthService();
//# sourceMappingURL=auth.service.js.map