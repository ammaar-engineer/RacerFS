import chalk from 'chalk'
import { snippetService } from '../services/snippet.service.js'

export async function listSnippetComponent(): Promise<void> {
  const snippets = await snippetService.getList()

  if (snippets.length === 0) {
    console.log(chalk.yellow('No snippets found'))
    return
  }

  console.log('')
  snippets.forEach((s) => {
    console.log(`${chalk.green(s.alias.padEnd(15))} ${chalk.white(s.command)}`)
    if (s.description) {
      console.log(`${' '.repeat(15)} ${chalk.dim(s.description)}`)
    }
  })
  console.log('')
}
