import axios from 'axios'
import { fsService } from '../../../system_services/fs.service.js'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

export interface AccessTokenItem {
  id: number
  token: string
  user_id: number
  type: string
}

class AccessTokenService {
  private getAuthToken(): string {
    const data = fsService.readUserData()
    if (!data) {
      console.log('Authentication required')
      process.exit(1)
    }
    return data.account_token
  }

  private getStoredTokens(): string[] {
    const data = fsService.readUserData()
    return data?.access_tokens ?? []
  }

  private saveTokens(tokens: string[]): void {
    fsService.writeUserData({ access_tokens: tokens })
  }

  private handleError(error: any, fallback: string): never {
    const message = error.response?.data?.message
    console.log(message ?? fallback)
    process.exit(1)
  }

  async create(): Promise<string> {
    try {
      const token = this.getAuthToken()
      const res = await axios.post(
        `${BACKEND_URL}/file/access-token`,
        { name: 'token' },
        { headers: { authorization: token } }
      )
      const newToken = res.data.data.token

      // Save to local storage
      const existing = this.getStoredTokens()
      this.saveTokens([...existing, newToken])

      return newToken
    } catch (error: any) {
      this.handleError(error, 'Failed to create access token')
    }
  }

  async list(): Promise<string[]> {
    try {
      const token = this.getAuthToken()
      console.log(token)
      const res = await axios.get(`${BACKEND_URL}/file/access-tokens`, {
        headers: { authorization: token }
      })

      // Sync dengan local storage
      const remoteTokens: string[] = res.data.data.tokens
      this.saveTokens(remoteTokens)

      return remoteTokens
    } catch (error: any) {
      this.handleError(error, 'Failed to fetch access tokens')
    }
  }

  async delete(tokenToDelete: string): Promise<void> {
    try {
      const token = this.getAuthToken()
      await axios.delete(`${BACKEND_URL}/file/access-token`, {
        headers: { authorization: token },
        data: { token: tokenToDelete }
      })

      // Remove from local storage
      const existing = this.getStoredTokens()
      this.saveTokens(existing.filter((t) => t !== tokenToDelete))
    } catch (error: any) {
      this.handleError(error, 'Failed to delete access token')
    }
  }

  getLocalTokens(): string[] {
    return this.getStoredTokens()
  }
}

export const accessTokenService = new AccessTokenService()
