import { select } from '@clack/prompts'
import chalk from 'chalk'
import { fsService } from '../../../system_services/fs.service.js'

/**
 * Clear saved token (manual logout)
 */
export async function clearTokenComponent(): Promise<void> {
  if (!fsService.userFileExists()) {
    console.log(chalk.yellow('No token to clear'))
    return
  }

  const confirm = await select({
    message: 'Clear saved token?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ]
  })

  if (confirm === 'yes') {
    fsService.deleteUserData()
    console.log(chalk.green('✓ Token cleared'))
  }
}
