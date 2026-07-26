import { createSelectOption } from "@/main_components/select.option"
import { testingServices } from "@/services/testing.services"
import { serviceSystem } from "@/services/fs.services"
import { RACERFS_FOLDER_PATH } from "@/SYSTEM-PATH"
import { text } from "@clack/prompts"
import chalk from "chalk"

export async function testingHandler() {
    await createSelectOption("Testing Menu", [
        {
            label: 'Create test account', 
            action: async () => {
                const accountName = await text({
                    message: "Enter test account name",
                    placeholder: "test-user-123"
                }) as string

                if (!accountName || accountName.trim().length === 0) {
                    console.log(chalk.red("\nAccount name cannot be empty\n"))
                    await testingHandler()
                    return
                }

                console.log(chalk.dim("\nCreating test account..."))
                
                const { token } = await testingServices.createTestAccount(accountName)
                
                // Save token using same method as register component
                serviceSystem.modifyJsonFile(
                    serviceSystem.createPath(RACERFS_FOLDER_PATH, 'user.rcfs'),
                    {"account_token": token}
                )
                
                console.log(chalk.green(`\n✓ Test account created successfully!`))
                console.log(chalk.dim(`Account: ${accountName}\n`))
                await testingHandler()
            }
        },
        {
            label: 'Back to main menu',
            action: async () => {} // Do nothing, returns to main
        }
    ])
}