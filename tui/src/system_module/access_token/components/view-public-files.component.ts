import { select } from '@clack/prompts'
import chalk from 'chalk'
import { fileService } from '../../file/services/file.service.js'
import { fsService } from '../../../system_services/fs.service.js'

export async function viewPublicFilesComponent(): Promise<void> {
  // Get access tokens from local storage
  const userData = fsService.readUserData()
  const accessTokens = userData?.access_tokens ?? []

  if (accessTokens.length === 0) {
    console.log(chalk.yellow('No access tokens available. Create one first via "Manage Access Tokens".'))
    return
  }

  // Select access token
  const selectedToken = await select({
    message: 'Select access token to use',
    options: accessTokens.map((token, idx) => ({
      value: token,
      label: `Token ${idx + 1}`,
      hint: token.substring(0, 20) + '...'
    }))
  })
  if (typeof selectedToken !== 'string') return

  // Fetch public files using access token
  console.log(chalk.dim('→ Fetching public files...'))
  const files = await fileService.getPublicList(selectedToken)

  if (files.length === 0) {
    console.log(chalk.yellow('No public files available from this token owner'))
    return
  }

  // Display file list
  console.log(chalk.green(`\n✓ Found ${files.length} public file(s):\n`))

  files.forEach((file) => {
    const sizeInKB = (file.size / 1024).toFixed(2)
    const uploadDate = new Date(file.uploaded_at).toLocaleDateString()

    console.log(chalk.blue(`  • ${file.name}`))
    console.log(chalk.dim(`    Size: ${sizeInKB} KB | Type: ${file.type} | Uploaded: ${uploadDate}`))
  })

  console.log(chalk.dim('\nTip: Use "Download Public File" to download any of these files.'))
}
