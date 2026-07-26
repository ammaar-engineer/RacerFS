import { createSelectOption } from "@/main_components/select.option"
import { fileValidation } from "@/validations/file.validation"
import { fileServices } from "@/services/file.services"
import { note } from "@clack/prompts"
import chalk from "chalk"

export async function FilesHandler() {
  if (!fileValidation.isUserAuthenticated()) {
    console.log(chalk.red("Please login first before managing files"))
    return
  }

  await createSelectOption("File Management", [
    {
      label: 'Generate access token',
      action: async () => {
        const token = await fileServices.generateAccessToken()
        note(chalk.green(token), "Access token generated and saved")
        await FilesHandler()
      }
    },
    {
      label: 'Back to main menu',
      action: async () => {}
    }
  ])
}
