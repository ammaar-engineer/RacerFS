import { text } from "@clack/prompts";
import chalk from "chalk";
import { createSelectOption } from "../main_components/select.option.js";
import { serviceSystem } from "../services/fs.services.js";
import { testingServices } from "../services/testing.services.js";
import { RACERFS_FOLDER_PATH } from "../SYSTEM-PATH.js";
export async function testingHandler() {
    await createSelectOption("Testing Menu", [
        {
            label: 'Create test account',
            action: async () => {
                const accountName = await text({
                    message: "Enter test account name",
                    placeholder: "test-user-123"
                });
                if (!accountName || accountName.trim().length === 0) {
                    console.log(chalk.red("\nAccount name cannot be empty\n"));
                    return;
                }
                console.log(chalk.dim("\nCreating test account..."));
                const { token } = await testingServices.createTestAccount(accountName);
                // Save token using same method as register component
                serviceSystem.modifyJsonFile(serviceSystem.createPath(RACERFS_FOLDER_PATH, 'user.rcfs'), { "account_token": token });
                console.log(chalk.green(`\n✓ Test account created successfully!`));
                console.log(chalk.dim(`Account: ${accountName}\n`));
            }
        },
        {
            label: 'Back to main menu',
            action: async () => { } // Do nothing, returns to main
        }
    ]);
}
//# sourceMappingURL=handler.js.map