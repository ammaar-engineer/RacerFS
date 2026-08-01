import { select } from '@clack/prompts'
import chalk from 'chalk'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileService } from '../services/file.service.js'
import { fsService } from '../../../system_services/fs.service.js'

export async function downloadFileComponent(): Promise<void> {
  // Ask user which mode to use
  const mode = await select({
    message: 'Download from',
    options: [
      { value: 'own', label: 'My Files', hint: 'Download your own files' },
      { value: 'token', label: 'Use Access Token', hint: 'Download public files from token owner' },
    ]
  })
  if (typeof mode !== 'string') return

  if (mode === 'token') {
    await downloadPublicFile()
  } else {
    await downloadOwnFile()
  }
}

async function downloadOwnFile(): Promise<void> {
  // Fetch-first: ambil list file milik sendiri
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

async function downloadPublicFile(): Promise<void> {
  // Get access tokens from local storage
  const userData = fsService.readUserData()
  const accessTokens = userData?.access_tokens ?? []

  if (accessTokens.length === 0) {
    console.log(chalk.yellow('No access tokens available. Create one first via "Manage Access Tokens".'))
    return
  }

  // Pilih access token
  const selectedToken = await select({
    message: 'Select access token to use',
    options: accessTokens.map((token, idx) => ({
      value: token,
      label: `Token ${idx + 1}`,
      hint: token.substring(0, 20) + '...'
    }))
  })
  if (typeof selectedToken !== 'string') return

  // Fetch public files dari token owner
  console.log(chalk.dim('→ Fetching public files from token owner...'))
  const files = await fileService.getPublicList(selectedToken)

  if (files.length === 0) {
    console.log(chalk.yellow('No public files available from this token owner'))
    return
  }

  // Pilih file dari list
  const selected = await select({
    message: 'Select file to download',
    options: files.map((f) => ({
      value: f.name,
      label: f.name,
      hint: `${(f.size / 1024).toFixed(2)} KB • ${f.type || 'unknown'}`
    }))
  })
  if (typeof selected !== 'string') return

  // Get presigned download URL
  console.log(chalk.dim('→ Getting download URL...'))
  const downloadData = await fileService.getPublicDownloadURL(selected, selectedToken)

  // Download via curl ke CWD
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

