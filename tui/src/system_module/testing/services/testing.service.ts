import axios from 'axios'
import { fsService } from '../../../system_services/fs.service.js'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

class TestingService {
  /**
   * Create test account (development only)
   * Uses GET /user/create-test-account with account-test header
   */
  async createTestAccount(email: string): Promise<string> {
    try {
      const res = await axios.get(`${BACKEND_URL}/user/create-test-account`, {
        headers: { 'account-test': email }
      })
      const token: string = res.data.data.token
      return token
    } catch (error: any) {
      if (error.response?.status === 409) {
        console.log('Test account already exists')
      } else {
        console.log('Failed to create test account')
      }
      process.exit(1)
    }
  }

  /**
   * Save token to disk
   */
  saveToken(token: string): void {
    fsService.writeUserData({ account_token: token })
  }
}

export const testingService = new TestingService()
