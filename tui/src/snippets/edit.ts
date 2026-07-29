import { snippetServices } from "../services/snippet.services.js"
import { snippetValidation } from "../validations/snippet.validation.js"
import { select, text } from "@clack/prompts"
import chalk from "chalk"

export async function editSnippet() {
  const snippets = await snippetServices.getSnippetList()

  if (snippets.length === 0) {
    console.log(chalk.yellow("\nNo snippets to edit. Create one first!\n"))
    return
  }

  const selectedAlias = await select({
    message: "Select snippet to edit",
    options: snippets.map(s => ({
      value: s.alias,
      label: s.alias,
      hint: s.command.length > 50 
        ? s.command.substring(0, 50) + "..." 
        : s.command
    }))
  }) as string

  const currentSnippet = snippets.find(s => s.alias === selectedAlias)!

  console.log(chalk.dim(`\nCurrent command: ${currentSnippet.command}\n`))

  const newCommand = await text({
    message: "Enter new command",
    placeholder: currentSnippet.command
  }) as string

  const updated = await snippetServices.updateSnippet(selectedAlias, newCommand)

  console.log(chalk.green(`\n✓ Snippet '${updated.alias}' updated successfully\n`))
}
