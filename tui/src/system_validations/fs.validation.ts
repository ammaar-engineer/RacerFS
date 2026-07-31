import { fsService } from '../system_services/fs.service.js'

class FSValidation {
  /**
   * Check if user is authenticated (token file exists and valid)
   */
  isUserAuthenticated(): boolean {
    const userData = fsService.readUserData()
    return userData !== null && !!userData.account_token
  }
}

export const validation = new FSValidation()
