import { createSelectOption } from "@/main_components/select.option"
import { listSnippets } from "./list"
import { createSnippet } from "./create"
import { editSnippet } from "./edit"
import { deleteSnippet } from "./delete"
import { snippetValidation } from "@/validations/snippet.validation"
import chalk from "chalk"

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
        await SnippetsHandler()
      }
    },
    { 
      label: 'Create new snippet', 
      action: async () => {
        await createSnippet()
        await SnippetsHandler()
      }
    },
    { 
      label: 'Edit snippet', 
      action: async () => {
        await editSnippet()
        await SnippetsHandler()
      }
    },
    { 
      label: 'Delete snippet', 
      action: async () => {
        await deleteSnippet()
        await SnippetsHandler()
      }
    },
    { 
      label: 'Back to main menu', 
      action: async () => {} // Do nothing, returns to main
    }
  ])
}
