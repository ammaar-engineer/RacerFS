import chalk from "chalk"
import { createSelectOption } from "../main_components/select.option.js"
import { snippetValidation } from "../validations/snippet.validation.js"
import { createSnippet } from "./create.js"
import { deleteSnippet } from "./delete.js"
import { editSnippet } from "./edit.js"
import { listSnippets } from "./list.js"

export async function SnippetsHandler() {
  // Check authentication first
  if (!snippetValidation.isUserAuthenticated()) {
    console.log(chalk.red("Please login first before managing snippets"))
    return
  }

  await createSelectOption("Snippet Management", [
    { 
      label: 'View all snippets', 
      action: async () => {
        await listSnippets()
      }
    },
    { 
      label: 'Create new snippet', 
      action: async () => {
        await createSnippet()
      }
    },
    { 
      label: 'Edit snippet', 
      action: async () => {
        await editSnippet()
      }
    },
    { 
      label: 'Delete snippet', 
      action: async () => {
        await deleteSnippet()
      }
    },
    { 
      label: 'Back to main menu', 
      action: async () => {} // Do nothing, returns to main
    }
  ])
}
