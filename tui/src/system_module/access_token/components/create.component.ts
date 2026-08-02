import { box } from '@clack/prompts'
import chalk from 'chalk'
import { accessTokenService } from '../services/access-token.service.js'

export async function createAccessTokenComponent(): Promise<void> {
  console.log(chalk.dim('→ Creating access token...'))

  const token = await accessTokenService.create()

  box(`Token: ${token}\n\nThis token can be used to access your public files.`, 'Access Token Created', {
    rounded: true,
    width: 'auto',
    contentAlign: 'left',
    contentPadding: 2
  })
}
