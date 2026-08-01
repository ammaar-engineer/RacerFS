import axios from 'axios';
import fs from 'node:fs';
import path from 'node:path';
import { fsService } from '../../../system_services/fs.service.js';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
class FileService {
    getAuthToken() {
        const data = fsService.readUserData();
        if (!data) {
            console.log('Authentication required');
            process.exit(1);
        }
        return data.account_token;
    }
    getAccessTokens() {
        const data = fsService.readUserData();
        return data?.access_tokens ?? [];
    }
    handleError(error, fallback) {
        const message = error.response?.data?.message;
        console.log(message ?? fallback);
        process.exit(1);
    }
    /**
     * List all files in current working directory (not recursive)
     */
    listLocalFiles() {
        const cwd = process.cwd();
        const entries = fs.readdirSync(cwd, { withFileTypes: true });
        return entries
            .filter((entry) => entry.isFile())
            .map((entry) => {
            const filePath = path.join(cwd, entry.name);
            const stats = fs.statSync(filePath);
            return {
                name: entry.name,
                path: filePath,
                size: stats.size
            };
        })
            .sort((a, b) => a.name.localeCompare(b.name));
    }
    async getList() {
        try {
            const token = this.getAuthToken();
            const accessTokens = this.getAccessTokens();
            const headers = { authorization: token };
            const firstToken = accessTokens[0];
            if (firstToken) {
                headers['access-token'] = firstToken;
            }
            const res = await axios.get(`${BACKEND_URL}/file/list`, { headers });
            return res.data.data.files;
        }
        catch (error) {
            this.handleError(error, 'Failed to fetch file list');
        }
    }
    async getUploadURL(fileName, fileSize) {
        try {
            const token = this.getAuthToken();
            const res = await axios.get(`${BACKEND_URL}/file/upload-url`, {
                headers: { authorization: token },
                params: { fileName, fileSize }
            });
            console.log(BACKEND_URL);
            return res.data.data;
        }
        catch (error) {
            console.log(error);
            this.handleError(error, 'Failed to get upload URL');
        }
    }
    async confirmUpload(fileName, fileKey, fileSize, status) {
        try {
            const token = this.getAuthToken();
            await axios.post(`${BACKEND_URL}/file/confirm-upload`, { fileName, fileKey, fileSize, status }, { headers: { authorization: token } });
        }
        catch (error) {
            console.log("Confirm upload erro");
            this.handleError(error, 'Failed to confirm upload');
        }
    }
    async getDownloadURL(fileName) {
        try {
            const token = this.getAuthToken();
            const accessTokens = this.getAccessTokens();
            const headers = { authorization: token };
            const firstToken = accessTokens[0];
            if (firstToken) {
                headers['access-token'] = firstToken;
            }
            const res = await axios.get(`${BACKEND_URL}/file/download`, {
                headers,
                params: { fileName }
            });
            return res.data.data;
        }
        catch (error) {
            console.log(error);
            this.handleError(error, 'Failed to get download URL');
        }
    }
    async rename(oldName, newName) {
        try {
            const token = this.getAuthToken();
            const accessTokens = this.getAccessTokens();
            const headers = { authorization: token };
            const firstToken = accessTokens[0];
            if (firstToken) {
                headers['access-token'] = firstToken;
            }
            await axios.patch(`${BACKEND_URL}/file/rename`, { fileName: oldName, newName }, { headers });
        }
        catch (error) {
            this.handleError(error, 'Failed to rename file');
        }
    }
    async delete(fileName) {
        try {
            const token = this.getAuthToken();
            await axios.delete(`${BACKEND_URL}/file/delete`, {
                headers: { authorization: token },
                data: { fileName }
            });
        }
        catch (error) {
            this.handleError(error, 'Failed to delete file');
        }
    }
    async setVisibility(fileName, isPublic) {
        try {
            const token = this.getAuthToken();
            await axios.patch(`${BACKEND_URL}/file/set-visibility`, { fileName, isPublic }, { headers: { authorization: token } });
        }
        catch (error) {
            this.handleError(error, 'Failed to set visibility');
        }
    }
    async getPublicList(accessToken) {
        try {
            const res = await axios.get(`${BACKEND_URL}/file/public-list`, {
                headers: { 'access-token': accessToken }
            });
            return res.data.data.files;
        }
        catch (error) {
            this.handleError(error, 'Failed to get public file list');
        }
    }
    async getPublicDownloadURL(fileName, accessToken) {
        try {
            const res = await axios.get(`${BACKEND_URL}/file/public-download`, {
                headers: { 'access-token': accessToken },
                params: { fileName }
            });
            return res.data.data;
        }
        catch (error) {
            this.handleError(error, 'Failed to get public download URL');
        }
    }
    async getStorageInfo() {
        try {
            const token = this.getAuthToken();
            const res = await axios.get(`${BACKEND_URL}/file/storage-info`, {
                headers: { authorization: token }
            });
            return res.data.data;
        }
        catch (error) {
            this.handleError(error, 'Failed to get storage info');
        }
    }
}
export const fileService = new FileService();
//# sourceMappingURL=file.service.js.map