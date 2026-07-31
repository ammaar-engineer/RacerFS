import { select, text } from '@clack/prompts'
import chalk from 'chalk'
import { snippetService } from '../services/snippet.service.js'

export async function editSnippetComponent(): Promise<void> {
  // Fetch-first: ambil list dulu
  const snippets = await snippetService.getList()

  if (snippets.length === 0) {
    console.log(chalk.yellow('No snippets to edit'))
    return
  }

  // Pilih snippet yang akan diedit
  const selected = await select({
    message: 'Select snippet to edit',
    options: snippets.map((s) => ({
      value: s.alias,
      label: s.alias,
      hint: s.command
    }))
  })

  if (typeof selected !== 'string') return

  // Input command baru
  const current = snippets.find((s) => s.alias === selected)
  const command = await text({
    message: 'New command',
    placeholder: current?.command || '',
    validate: (value) => {
      if (!value) return 'Command is required'
    }
  })
  if (typeof command !== 'string') return

  await snippetService.edit(selected, command)
  console.log(chalk.green(`✓ Snippet '${selected}' updated`))
}
