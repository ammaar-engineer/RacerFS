import chalk from "chalk"
import { createSelectOption } from "../main_components/select.option.js"
import { fileValidation } from "../validations/file.validation.js"
import { TokensHandler } from "./tokens.js"
import { listFiles } from "./list.js"
import { uploadFile } from "./upload.js"
import { downloadFile } from "./download.js"
import { renameFile } from "./rename.js"
import { deleteFile } from "./delete.js"
import { setVisibility } from "./visibility.js"

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
