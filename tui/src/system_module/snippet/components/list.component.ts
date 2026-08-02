import { box } from '@clack/prompts'
import { snippetService } from '../services/snippet.service.js'

export async function listSnippetComponent(): Promise<void> {
  const snippets = await snippetService.getList()

  if (snippets.length === 0) {
    box('No snippets found', 'Snippets', {
      rounded: true,
      width: 'auto',
      contentAlign: 'center',
      contentPadding: 4
    })
    return
  }

  const content = snippets.map((s) => {
    const line = `${s.alias.padEnd(15)} ${s.command}`
    if (s.description) {
      return `${line}\n${' '.repeat(15)} ${s.description}`
    }
    return line
  }).join('\n')

  box(content, `Snippets (${snippets.length})`, {
    rounded: true,
    width: 'auto',
    contentAlign: 'left',
    contentPadding: 2
  })
}
