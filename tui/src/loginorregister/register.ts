import { serviceSystem } from "@/services/fs.services";
import { registerServicesClass } from "@/services/register.services";
import { RACERFS_FOLDER_PATH } from "@/SYSTEM-PATH";
import { box, text } from "@clack/prompts";
import chalk from "chalk";

export async function registerComponent() {
    const registerServices = new registerServicesClass()

    box("Welcome to RacerFS TUI Menu", "Menu")
    const email = await text({
        message: "Enter your email",
        placeholder: "amarix@gmail.com"
    }) as string

    const { sessionId } = await registerServices.sendRegisterRequest(email)
    console.log(`OTP has been sent to ${email}`)

    const otp = await text({
        message: "Confirm OTP code from your email",
        placeholder: '000-000-000'
    }) as string

    const { token } = await registerServices.verifyOtp(sessionId, otp)
    serviceSystem.modifyJsonFile(
        serviceSystem.createPath(RACERFS_FOLDER_PATH, 'user.rcfs'),
        {"account_token": token}
    )
    
    console.log(chalk.green("Welcome to RacerFS! Your account has been created successfully."))
}
