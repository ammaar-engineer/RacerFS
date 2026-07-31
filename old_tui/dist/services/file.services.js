import axios from "axios";
import chalk from "chalk";
import * as fs from "fs";
import { BACKEND_URL, RACERFS_FOLDER_PATH } from "../SYSTEM-PATH.js";
import { serviceSystem } from "./fs.services.js";
export class FileServicesClass {
    getTokens() {
        try {
            const userFile = serviceSystem.createPath(RACERFS_FOLDER_PATH, 'user.rcfs');
            const userData = serviceSystem.readFile(userFile, { isJson: true });
            return {
                accountToken: userData.account_token,
                accessToken: userData.access_token ?? null,
            };
        }
        catch {
            console.log(chalk.red("Error reading authentication token"));
            process.exit(1);
        }
    }
    async generateAccessToken() {
        try {
            const { accountToken } = this.getTokens();
            const response = await axios.post(`${BACKEND_URL}/token/generate-access-token`, {}, { headers: { authorization: accountToken } });
            const token = response.data.data.access_token;
            // Simpan ke user.rcfs
            const userFile = serviceSystem.createPath(RACERFS_FOLDER_PATH, 'user.rcfs');
            serviceSystem.modifyJsonFile(userFile, { access_token: token });
            return token;
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log(chalk.red("Authentication failed. Please login again."));
            }
            else {
                console.log(chalk.red("Error generating access token"));
            }
            process.exit(1);
        }
    }
    async deleteAccessToken(token) {
        try {
            const { accountToken } = this.getTokens();
            await axios.delete(`${BACKEND_URL}/token/delete-access-token`, {
                headers: { authorization: accountToken },
                data: { token }
            });
            // Hapus dari user.rcfs
            const userFile = serviceSystem.createPath(RACERFS_FOLDER_PATH, 'user.rcfs');
            const userData = serviceSystem.readFile(userFile, { isJson: true });
            delete userData.access_token;
            serviceSystem.createFile(userFile, userData, { isJson: true });
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log(chalk.red("Authentication failed. Please login again."));
            }
            else if (error.response?.status === 404) {
                console.log(chalk.red("Access token not found"));
            }
            else {
                console.log(chalk.red("Error deleting access token"));
            }
            process.exit(1);
        }
    }
    async getFileList() {
        try {
            const { accountToken, accessToken } = this.getTokens();
            if (!accessToken) {
                console.log(chalk.red("No access token found. Please generate one first."));
                process.exit(1);
            }
            const response = await axios.get(`${BACKEND_URL}/file/list`, {
                headers: {
                    authorization: accountToken,
                    'access-token': accessToken
                }
            });
            return response.data.data.files;
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log(chalk.red("Authentication failed. Please login again."));
            }
            else {
                console.log(chalk.red("Error fetching file list"));
            }
            process.exit(1);
        }
    }
    async getDownloadUrl(fileName) {
        try {
            const { accountToken, accessToken } = this.getTokens();
            if (!accessToken) {
                console.log(chalk.red("No access token found. Please generate one first."));
                process.exit(1);
            }
            const response = await axios.get(`${BACKEND_URL}/file/download-url?file-name=${encodeURIComponent(fileName)}`, {
                headers: {
                    authorization: accountToken,
                    'access-token': accessToken
                }
            });
            return response.data.data.url;
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log(chalk.red("Authentication failed. Please login again."));
            }
            else if (error.response?.status === 404) {
                console.log(chalk.red(`File '${fileName}' not found`));
            }
            else {
                console.log(chalk.red("Error getting download URL"));
            }
            process.exit(1);
        }
    }
    async downloadFile(fileName, savePath) {
        try {
            const url = await this.getDownloadUrl(fileName);
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            fs.writeFileSync(savePath, response.data);
        }
        catch (error) {
            console.log(chalk.red("Error downloading file"));
            process.exit(1);
        }
    }
    async renameFile(fileName, newName) {
        try {
            const { accountToken, accessToken } = this.getTokens();
            if (!accessToken) {
                console.log(chalk.red("No access token found. Please generate one first."));
                process.exit(1);
            }
            await axios.patch(`${BACKEND_URL}/file/rename`, { 'file-name': fileName, 'new-name': newName }, {
                headers: {
                    authorization: accountToken,
                    'access-token': accessToken
                }
            });
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log(chalk.red("Authentication failed. Please login again."));
            }
            else if (error.response?.status === 404) {
                console.log(chalk.red(`File '${fileName}' not found`));
            }
            else {
                console.log(chalk.red("Error renaming file"));
            }
            process.exit(1);
        }
    }
    async deleteFile(fileName) {
        try {
            const { accountToken } = this.getTokens();
            await axios.delete(`${BACKEND_URL}/file/delete`, {
                headers: { authorization: accountToken },
                data: { 'file-name': fileName }
            });
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log(chalk.red("Authentication failed. Please login again."));
            }
            else if (error.response?.status === 404) {
                console.log(chalk.red(`File '${fileName}' not found`));
            }
            else {
                console.log(chalk.red("Error deleting file"));
            }
            process.exit(1);
        }
    }
    async setFileVisibility(fileName, isPublic) {
        try {
            const { accountToken } = this.getTokens();
            const response = await axios.patch(`${BACKEND_URL}/file/set-visibility`, { 'file-name': fileName, 'is_public': isPublic }, { headers: { authorization: accountToken } });
            return response.data.data;
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log(chalk.red("Authentication failed. Please login again."));
            }
            else if (error.response?.status === 404) {
                console.log(chalk.red(`File '${fileName}' not found`));
            }
            else {
                console.log(chalk.red("Error setting file visibility"));
            }
            process.exit(1);
        }
    }
    async getPresignedUploadUrl(fileName, fileSize) {
        try {
            const { accountToken } = this.getTokens();
            const response = await axios.get(`${BACKEND_URL}/file/upload-url?file-name=${encodeURIComponent(fileName)}&file-size=${fileSize}`, { headers: { authorization: accountToken } });
            console.log(response.data);
            // Extract file-key from URL or response
            const urlObj = new URL(response.data.data.url);
            const fileKey = urlObj.pathname.split('/').pop() || '';
            return {
                url: response.data.data.url,
                fields: response.data.data.fields,
                fileKey: fileKey
            };
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log(chalk.red("Authentication failed. Please login again."));
            }
            else if (error.response?.status === 413) {
                console.log(chalk.red("File size exceeds storage limit"));
            }
            else {
                console.log(chalk.red("Error getting upload URL"));
            }
            process.exit(1);
        }
    }
    async confirmUpload(fileName, fileKey, fileSize, status) {
        try {
            const { accountToken } = this.getTokens();
            await axios.post(`${BACKEND_URL}/file/confirm-upload`, {
                'file-name': fileName,
                'file-key': fileKey,
                'file-size': String(fileSize),
                'status': status
            }, { headers: { authorization: accountToken } });
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log(chalk.red("Authentication failed. Please login again."));
            }
            else {
                console.log(chalk.red("Error confirming upload"));
            }
            process.exit(1);
        }
    }
    async uploadFile(localFilePath, fileName) {
        try {
            // Read file
            const fileBuffer = fs.readFileSync(localFilePath);
            const fileSize = fileBuffer.length;
            // Get presigned URL
            const { url, fileKey } = await this.getPresignedUploadUrl(fileName, fileSize);
            console.log(url);
            // Upload to S3
            await axios.put(url, fileBuffer, {
                headers: {
                    'Content-Type': 'application/octet-stream'
                }
            });
            // Confirm upload
            await this.confirmUpload(fileName, fileKey, fileSize, 'SUCCESS');
        }
        catch (error) {
            console.log(error);
            console.log(chalk.red("Error uploading file"));
            // Try to confirm failed upload if we have the info
            try {
                const stats = fs.statSync(localFilePath);
                // We don't have fileKey here, so just exit
            }
            catch { }
            process.exit(1);
        }
    }
}
export const fileServices = new FileServicesClass();
//# sourceMappingURL=file.services.js.map