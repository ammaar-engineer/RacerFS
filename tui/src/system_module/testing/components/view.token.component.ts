import chalk from 'chalk'
import { fsService } from '../../../system_services/fs.service.js'

/**
 * View saved token (full token)
 */
export async function viewTokenComponent(): Promise<void> {
  const userData = fsService.readUserData()

  if (!userData) {
    console.log(chalk.red('✗ No token found'))
    return
  }

  console.log(chalk.blue('Saved Token:'))
  console.log(userData.account_token)
}
