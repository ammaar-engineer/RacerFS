import { select } from '@clack/prompts'
import chalk from 'chalk'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileService } from '../services/file.service.js'

export async function downloadFileComponent(): Promise<void> {
  // Fetch-first: ambil list file
  const files = await fileService.getList()

  if (files.length === 0) {
    console.log(chalk.yellow('No files to download'))
    return
  }

  // Pilih file
  const selected = await select({
    message: 'Select file to download',
    options: files.map((f) => ({
      value: f.name,
      label: f.name,
      hint: f.file_type
    }))
  })
  if (typeof selected !== 'string') return

  // Get presigned download URL + file metadata
  console.log(chalk.dim('→ Getting download URL...'))
  const downloadData = await fileService.getDownloadURL(selected)

  // Download via curl ke CWD dengan nama asli dari backend
  const outputPath = path.join(process.cwd(), downloadData.file.name)
  console.log(chalk.dim(`→ Downloading ${downloadData.file.name} (${downloadData.file.type})...`))

  const result = spawnSync('curl', ['-fsSL', '-o', outputPath, downloadData.url], {
    stdio: 'inherit'
  })

  if (result.status !== 0) {
    console.log(chalk.red('✗ Download failed'))
    return
  }

  console.log(chalk.green(`✓ File '${selected}' downloaded to ${outputPath}`))
}
