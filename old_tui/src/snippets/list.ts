import { snippetServices } from "../services/snippet.services.js"
import { box } from "@clack/prompts"
import chalk from "chalk"

export async function listSnippets() {
  const snippets = await snippetServices.getSnippetList()

  if (snippets.length === 0) {
    console.log(chalk.yellow("\nNo snippets found. Create one to get started!"))
    return
  }

  box(`Your Snippets (${snippets.length} total)`, "Snippets")

  snippets.forEach((snippet, idx) => {
    console.log(`\n${chalk.bold(`${idx + 1}. ${chalk.cyan(snippet.alias)}`)}`)
    console.log(`   Command: ${snippet.command}`)
    if (snippet.description) {
      console.log(`   Description: ${chalk.dim(snippet.description)}`)
    }
    console.log(`   Created: ${chalk.dim(formatDate(snippet.created_at))}`)
  })

  console.log("") // Empty line for spacing
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
