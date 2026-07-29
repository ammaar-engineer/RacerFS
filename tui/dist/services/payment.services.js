import { BACKEND_URL, RACERFS_FOLDER_PATH } from "../SYSTEM-PATH.js";
import axios from "axios";
import chalk from "chalk";
import { serviceSystem } from "./fs.services.js";
export class PaymentServicesClass {
    getAuthToken() {
        try {
            const userFile = serviceSystem.createPath(RACERFS_FOLDER_PATH, 'user.rcfs');
            const userData = serviceSystem.readFile(userFile, { isJson: true });
            return userData.account_token;
        }
        catch (error) {
            console.log(chalk.red("Error reading authentication token"));
            process.exit(1);
        }
    }
    async buyStorage() {
        try {
            const token = this.getAuthToken();
            await axios.get(`${BACKEND_URL}/payment/buy-storage`, {
                headers: { authorization: token }
            });
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log(chalk.red("Authentication failed. Please login again."));
            }
            else {
                console.log(chalk.red("Error purchasing storage"));
            }
            process.exit(1);
        }
    }
    async getStorageInfo() {
        try {
            const token = this.getAuthToken();
            const response = await axios.get(`${BACKEND_URL}/file/storage-info`, {
                headers: { authorization: token }
            });
            return response.data.data;
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log(chalk.red("Authentication failed. Please login again."));
            }
            else {
                console.log(chalk.red("Error fetching storage info"));
            }
            process.exit(1);
        }
    }
}
export const paymentServices = new PaymentServicesClass();
//# sourceMappingURL=payment.services.js.map