import chalk from "chalk"
import { createSelectOption } from "../main_components/select.option"
import { fileValidation } from "../validations/file.validation"
import { TokensHandler } from "./tokens"
import { listFiles } from "./list"
import { uploadFile } from "./upload"
import { downloadFile } from "./download"
import { renameFile } from "./rename"
import { deleteFile } from "./delete"
import { setVisibility } from "./visibility"

export async function FilesHandler() {
  if (!fileValidation.isUserAuthenticated()) {
    console.log(chalk.red("Please login first before managing files"))
    return
  }

  // Check if access token exists
  if (!fileValidation.hasAccessToken()) {
    console.log(chalk.yellow("\nNo access token found. Please generate one first in 'Manage tokens' menu.\n"))
  }

  await createSelectOption("File Management", [
    { 
      label: 'View all files', 
      action: async () => {
        await listFiles()
      }
    },
    { 
      label: 'Upload new file', 
      action: async () => {
        await uploadFile()
      }
    },
    { 
      label: 'Download file', 
      action: async () => {
        await downloadFile()
      }
    },
    { 
      label: 'Rename file', 
      action: async () => {
        await renameFile()
      }
    },
    { 
      label: 'Delete file', 
      action: async () => {
        await deleteFile()
      }
    },
    { 
      label: 'Set file visibility', 
      action: async () => {
        await setVisibility()
      }
    },
    {
      label: 'Manage tokens',
      action: async () => {
        await TokensHandler()
      }
    },
    {
      label: 'Back to main menu',
      action: async () => {}
    }
  ])
}
