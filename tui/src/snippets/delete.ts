import { snippetServices } from "@/services/snippet.services"
import { select } from "@clack/prompts"
import chalk from "chalk"

export async function deleteSnippet() {
  const snippets = await snippetServices.getSnippetList()

  if (snippets.length === 0) {
    console.log(chalk.yellow("\nNo snippets to delete\n"))
    return
  }

  const selectedAlias = await select({
    message: "Select snippet to delete",
    options: snippets.map(s => ({
      value: s.alias,
      label: s.alias,
      hint: s.command.length > 50 
        ? s.command.substring(0, 50) + "..." 
        : s.command
    }))
  }) as string

  const snippet = snippets.find(s => s.alias === selectedAlias)!
  
  console.log(chalk.yellow(`\nYou are about to delete:`))
  console.log(chalk.dim(`  Alias: ${snippet.alias}`))
  console.log(chalk.dim(`  Command: ${snippet.command}`))

  const confirm = await select({
    message: `Are you sure?`,
    options: [
      { value: 'yes', label: 'Yes, delete it', hint: "This cannot be undone" },
      { value: 'no', label: 'No, cancel', hint: "Keep the snippet" }
    ]
  }) as string

  if (confirm === 'yes') {
    await snippetServices.deleteSnippet(selectedAlias)
    console.log(chalk.green(`\n✓ Snippet '${selectedAlias}' deleted successfully\n`))
  } else {
    console.log(chalk.dim("\nDeletion cancelled\n"))
  }
}
