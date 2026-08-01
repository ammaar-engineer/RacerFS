import chalk from 'chalk'
import { accessTokenService } from '../services/access-token.service.js'

export async function createAccessTokenComponent(): Promise<void> {
  console.log(chalk.dim('→ Creating access token...'))

  const token = await accessTokenService.create()

  console.log(chalk.green('✓ Access token created successfully'))
  console.log(chalk.blue(`\nToken: ${token}`))
  console.log(chalk.dim('\nThis token can be used to access your public files.'))
}
