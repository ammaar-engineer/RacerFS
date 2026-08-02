import { box, select } from '@clack/prompts'
import chalk from 'chalk'
import { spawn } from 'node:child_process'
import { snippetService } from '../services/snippet.service.js'

export async function executeSnippetComponent(): Promise<void> {
  // Fetch-first: ambil list dulu
  const snippets = await snippetService.getList()

  if (snippets.length === 0) {
    box('No snippets to execute', 'Execute Snippet', {
      rounded: true,
      width: 'auto',
      contentAlign: 'center',
      contentPadding: 4
    })
    return
  }

  // Pilih snippet yang akan dieksekusi
  const selected = await select({
    message: 'Select snippet to execute',
    options: snippets.map((s) => ({
      value: s.alias,
      label: s.alias,
      hint: s.command
    }))
  })
  if (typeof selected !== 'string') return

  const snippet = snippets.find((s) => s.alias === selected)!
  console.log(chalk.dim(`→ Executing: ${snippet.command}`))

  // Jalankan command via spawn (inherit stdio agar output langsung ke terminal)
  const child = spawn(snippet.command, {
    shell: true,
    stdio: 'inherit',
    cwd: process.cwd()
  })

  child.on('error', (err) => {
    box(`Failed to execute: ${err.message}`, 'Execute Snippet', {
      rounded: true,
      width: 'auto',
      contentAlign: 'center',
      contentPadding: 4
    })
  })

  child.on('close', (code) => {
    if (code === 0) {
      box(`Done (exit code ${code})`, 'Execute Snippet', {
        rounded: true,
        width: 'auto',
        contentAlign: 'center',
        contentPadding: 4
      })
    } else {
      box(`Exited with code ${code}`, 'Execute Snippet', {
        rounded: true,
        width: 'auto',
        contentAlign: 'center',
        contentPadding: 4
      })
    }
  })

  // Tunggu process selesai
  await new Promise<void>((resolve) => child.on('close', () => resolve()))
}
