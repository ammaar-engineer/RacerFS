import axios from 'axios'
import { fsService } from '../../../system_services/fs.service.js'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

interface RequestOTPResponse {
  sessionId: string
}

interface VerifyOTPResponse {
  token: string
}

class AuthService {
  /**
   * Request OTP for login
   */
  async requestLoginOTP(email: string): Promise<string> {
    try {
      const res = await axios.post(`${BACKEND_URL}/user/login`, { email })
      const sessionId: string = res.data.data.sessionId
      return sessionId
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('Email not registered')
      } else {
        console.log('Failed to request OTP')
      }
      process.exit(1)
    }
  }

  /**
   * Request OTP for register
   */
  async requestRegisterOTP(email: string): Promise<string> {
    try {
      const res = await axios.post(`${BACKEND_URL}/user/register`, { email })
      const sessionId: string = res.data.data.sessionId
      return sessionId
    } catch (error: any) {
      if (error.response?.status === 409) {
        console.log('Email already registered')
      } else {
        console.log('Failed to request OTP')
      }
      process.exit(1)
    }
  }

  /**
   * Verify OTP and get JWT token
   */
  async verifyOTP(sessionId: string, otp: string): Promise<string> {
    try {
      const res = await axios.post(`${BACKEND_URL}/user/verify-otp`, {
        sessionId,
        otp
      })
      const token: string = res.data.data.token
      return token
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('Invalid or expired OTP')
      } else {
        console.log('Failed to verify OTP')
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

export const authService = new AuthService()
