import { BACKEND_URL } from "../SYSTEM-PATH.js";
import axios from "axios";
export class TestingServicesClass {
    async createTestAccount(accountName) {
        try {
            const response = await axios.get(`${BACKEND_URL}/user/create-test-account`, {
                headers: {
                    'account-test': accountName
                }
            });
            return {
                token: response.data.data.token
            };
        }
        catch (error) {
            console.log("Error while creating test account");
            console.log(error);
            process.exit(1);
        }
    }
}
export const testingServices = new TestingServicesClass();
//# sourceMappingURL=testing.services.js.map