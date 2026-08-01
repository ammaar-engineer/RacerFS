import axios from 'axios';
import { fsService } from '../../../system_services/fs.service.js';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
class AccessTokenService {
    getAuthToken() {
        const data = fsService.readUserData();
        if (!data) {
            console.log('Authentication required');
            process.exit(1);
        }
        return data.account_token;
    }
    getStoredTokens() {
        const data = fsService.readUserData();
        return data?.access_tokens ?? [];
    }
    saveTokens(tokens) {
        fsService.writeUserData({ access_tokens: tokens });
    }
    handleError(error, fallback) {
        const message = error.response?.data?.message;
        console.log(message ?? fallback);
        process.exit(1);
    }
    async create() {
        try {
            const token = this.getAuthToken();
            const res = await axios.post(`${BACKEND_URL}/file/access-token`, { name: 'token' }, { headers: { authorization: token } });
            const newToken = res.data.data.token;
            // Save to local storage
            const existing = this.getStoredTokens();
            this.saveTokens([...existing, newToken]);
            return newToken;
        }
        catch (error) {
            this.handleError(error, 'Failed to create access token');
        }
    }
    async list() {
        try {
            const token = this.getAuthToken();
            console.log(token);
            const res = await axios.get(`${BACKEND_URL}/file/access-tokens`, {
                headers: { authorization: token }
            });
            // Sync dengan local storage
            const remoteTokens = res.data.data.tokens;
            this.saveTokens(remoteTokens);
            return remoteTokens;
        }
        catch (error) {
            this.handleError(error, 'Failed to fetch access tokens');
        }
    }
    async delete(tokenToDelete) {
        try {
            const token = this.getAuthToken();
            await axios.delete(`${BACKEND_URL}/file/access-token`, {
                headers: { authorization: token },
                data: { token: tokenToDelete }
            });
            // Remove from local storage
            const existing = this.getStoredTokens();
            this.saveTokens(existing.filter((t) => t !== tokenToDelete));
        }
        catch (error) {
            this.handleError(error, 'Failed to delete access token');
        }
    }
    getLocalTokens() {
        return this.getStoredTokens();
    }
}
export const accessTokenService = new AccessTokenService();
//# sourceMappingURL=access-token.service.js.map