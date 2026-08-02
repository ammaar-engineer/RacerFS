import { box } from '@clack/prompts'
import { fsService } from '../../../system_services/fs.service.js'

/**
 * View saved token (full token)
 */
export async function viewTokenComponent(): Promise<void> {
  const userData = fsService.readUserData()

  if (!userData) {
    box('No token found', 'Token', {
      rounded: true,
      width: 'auto',
      contentAlign: 'center',
      contentPadding: 4
    })
    return
  }

  box(userData.account_token, 'Saved Token', {
    rounded: true,
    width: 'auto',
    contentAlign: 'left',
    contentPadding: 2
  })
}
