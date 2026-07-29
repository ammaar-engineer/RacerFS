import { createSelectOption } from "../main_components/select.option.js";
import { fileServices } from "../services/file.services.js";
import { serviceSystem } from "../services/fs.services.js";
import { RACERFS_FOLDER_PATH } from "../SYSTEM-PATH.js";
import { note } from "@clack/prompts";
import chalk from "chalk";
async function generateToken() {
    const token = await fileServices.generateAccessToken();
    note(chalk.green(token), "Access token generated and saved");
}
async function deleteToken() {
    const userFile = serviceSystem.createPath(RACERFS_FOLDER_PATH, 'user.rcfs');
    try {
        const userData = serviceSystem.readFile(userFile, { isJson: true });
        const accessToken = userData.access_token;
        if (!accessToken) {
            console.log(chalk.yellow("\nNo active access token found"));
            return;
        }
        await fileServices.deleteAccessToken(accessToken);
        console.log(chalk.green("\nAccess token deleted successfully"));
    }
    catch (error) {
        console.log(chalk.red("\nError reading user configuration"));
    }
}
export async function TokensHandler() {
    await createSelectOption("Token Management", [
        {
            label: 'Generate new access token',
            action: async () => {
                await generateToken();
                await TokensHandler();
            }
        },
        {
            label: 'Delete access token',
            action: async () => {
                await deleteToken();
                await TokensHandler();
            }
        },
        {
            label: 'Back',
            action: async () => { }
        }
    ]);
}
//# sourceMappingURL=tokens.js.map