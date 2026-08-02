import { box, select } from '@clack/prompts'
import chalk from 'chalk'
import { accessTokenService } from '../services/access-token.service.js'

export async function deleteAccessTokenComponent(): Promise<void> {
  // Fetch-first: sync dari backend dulu
  console.log(chalk.dim('→ Fetching tokens...'))
  const tokens = await accessTokenService.list()

  if (tokens.length === 0) {
    box('No access tokens available', 'Delete Token', {
      rounded: true,
      width: 'auto',
      contentAlign: 'center',
      contentPadding: 4
    })
    return
  }

  const selected = await select({
    message: 'Select token to delete',
    options: tokens.map((token, idx) => ({
      value: token,
      label: `Token ${idx + 1}`,
      hint: token.substring(0, 30) + '...'
    }))
  })
  if (typeof selected !== 'string') return

  console.log(chalk.dim('→ Deleting access token...'))
  await accessTokenService.delete(selected)

  box('Access token deleted successfully', 'Delete Token', {
    rounded: true,
    width: 'auto',
    contentAlign: 'center',
    contentPadding: 4
  })
}
