import axios from 'axios';
import { fsService } from '../../../system_services/fs.service.js';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
class SnippetService {
    getAuthToken() {
        const data = fsService.readUserData();
        if (!data) {
            console.log('Authentication required');
            process.exit(1);
        }
        return data.account_token;
    }
    async getList() {
        try {
            const token = this.getAuthToken();
            const res = await axios.get(`${BACKEND_URL}/snippet/list`, {
                headers: { authorization: token }
            });
            return res.data.data.snippets;
        }
        catch (error) {
            if (error.response?.status === 401)
                console.log('Authentication failed');
            else
                console.log('Failed to fetch snippets');
            process.exit(1);
        }
    }
    async create(alias, command, description) {
        try {
            const token = this.getAuthToken();
            await axios.post(`${BACKEND_URL}/snippet/create`, { alias, command, ...(description && { description }) }, { headers: { authorization: token } });
        }
        catch (error) {
            if (error.response?.status === 401)
                console.log('Authentication failed');
            else if (error.response?.status === 409)
                console.log('Alias already exists');
            else
                console.log('Failed to create snippet');
            process.exit(1);
        }
    }
    async edit(alias, command) {
        try {
            const token = this.getAuthToken();
            await axios.patch(`${BACKEND_URL}/snippet/edit`, { command }, {
                headers: { authorization: token },
                params: { alias }
            });
        }
        catch (error) {
            if (error.response?.status === 401)
                console.log('Authentication failed');
            else if (error.response?.status === 404)
                console.log('Snippet not found');
            else
                console.log('Failed to edit snippet');
            process.exit(1);
        }
    }
    async delete(alias) {
        try {
            const token = this.getAuthToken();
            await axios.delete(`${BACKEND_URL}/snippet/delete`, {
                headers: { authorization: token },
                params: { alias }
            });
        }
        catch (error) {
            if (error.response?.status === 401)
                console.log('Authentication failed');
            else if (error.response?.status === 404)
                console.log('Snippet not found');
            else
                console.log('Failed to delete snippet');
            process.exit(1);
        }
    }
}
export const snippetService = new SnippetService();
//# sourceMappingURL=snippet.service.js.map