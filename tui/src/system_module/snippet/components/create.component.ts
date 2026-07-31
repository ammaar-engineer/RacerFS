import { text } from '@clack/prompts'
import chalk from 'chalk'
import { snippetService } from '../services/snippet.service.js'

export async function createSnippetComponent(): Promise<void> {
  const alias = await text({
    message: 'Alias',
    placeholder: 'gs',
    validate: (value) => {
      if (!value) return 'Alias is required'
      if (/\s/.test(value)) return 'Alias cannot contain spaces'
    }
  })
  if (typeof alias !== 'string') return

  const command = await text({
    message: 'Command',
    placeholder: 'git status',
    validate: (value) => {
      if (!value) return 'Command is required'
    }
  })
  if (typeof command !== 'string') return

  const description = await text({
    message: 'Description (optional)',
    placeholder: 'Shows git status'
  })
  if (typeof description !== 'string') return

  await snippetService.create(alias, command, description || undefined)
  console.log(chalk.green(`✓ Snippet '${alias}' created`))
}
