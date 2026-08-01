import chalk from 'chalk'
import { accessTokenService } from '../services/access-token.service.js'

export async function listAccessTokenComponent(): Promise<void> {
  console.log(chalk.dim('→ Fetching access tokens...'))

  const tokens = await accessTokenService.list()

  if (tokens.length === 0) {
    console.log(chalk.yellow('No access tokens found'))
    return
  }

  console.log(chalk.green(`\n✓ Found ${tokens.length} access token(s):\n`))

  tokens.forEach((token, idx) => {
    console.log(chalk.blue(`  ${idx + 1}. ${token.substring(0, 50)}...`))
  })
}
