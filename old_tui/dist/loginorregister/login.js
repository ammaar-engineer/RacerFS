import { serviceSystem } from "../services/fs.services.js";
import { loginServicesClass } from "../services/login.services.js";
import { RACERFS_FOLDER_PATH } from "../SYSTEM-PATH.js";
import { text } from "@clack/prompts";
import chalk from "chalk";
export async function loginComponent() {
    const loginServices = new loginServicesClass();
    const email = await text({
        message: "Enter your email",
        placeholder: "amarix@gmail.com"
    });
    const { sessionId } = await loginServices.sendLoginRequest(email);
    console.log(`OTP has been sent to ${email}`);
    const otp = await text({
        message: "Confirm OTP code from your email",
        placeholder: '000-000-000'
    });
    const { token } = await loginServices.verifyOtp(sessionId, otp);
    serviceSystem.modifyJsonFile(serviceSystem.createPath(RACERFS_FOLDER_PATH, 'user.rcfs'), { "account_token": token });
    console.log(chalk.green("Welcome back to RacerFS"));
}
//# sourceMappingURL=login.js.map