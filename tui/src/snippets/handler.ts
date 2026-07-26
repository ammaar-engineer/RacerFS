import { select } from "@clack/prompts"
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

  const selected = await select({
    message: "Snippet Management",
    options: [
      { value: 'list', label: 'View all snippets', hint: "See your saved snippets" },
      { value: 'create', label: 'Create new snippet', hint: "Add a new command snippet" },
      { value: 'edit', label: 'Edit snippet', hint: "Update existing snippet command" },
      { value: 'delete', label: 'Delete snippet', hint: "Remove a snippet" },
      { value: 'back', label: 'Back to main menu', hint: "Return to main menu" }
    ]
  })

  const options: Record<string, () => Promise<void>> = {
    'list': listSnippets,
    'create': createSnippet,
    'edit': editSnippet,
    'delete': deleteSnippet,
    'back': async () => {} // Do nothing, returns to main
  }

  if (selected !== 'back') {
    await options[selected as string]()
    // After action, return to snippet menu
    await SnippetsHandler()
  }
}
