import axios from 'axios'
import fs from 'node:fs'
import path from 'node:path'
import { fsService } from '../../../system_services/fs.service.js'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

export interface FileItem {
  id: number
  name: string
  size: number
  file_type: string
  is_public: boolean
  file_key: string
  uploaded_at: string
  user_id: number
}

export interface StorageInfo {
  total_storage: number
  used_storage: number
  available_storage: number
}

export interface LocalFile {
  name: string
  path: string
  size: number
}

export interface UploadURLResponse {
  url: string
  formData: Record<string, string>
  fileKey: string
}

class FileService {
  private getAuthToken(): string {
    const data = fsService.readUserData()
    if (!data) {
      console.log('Authentication required')
      process.exit(1)
    }
    return data.account_token
  }

  private getAccessTokens(): string[] {
    const data = fsService.readUserData()
    return data?.access_tokens ?? []
  }

  private handleError(error: any, fallback: string): never {
    const message = error.response?.data?.message
    console.log(message ?? fallback)
    process.exit(1)
  }

  /**
   * List all files in current working directory (not recursive)
   */
  listLocalFiles(): LocalFile[] {
    const cwd = process.cwd()
    const entries = fs.readdirSync(cwd, { withFileTypes: true })

    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => {
        const filePath = path.join(cwd, entry.name)
        const stats = fs.statSync(filePath)
        return {
          name: entry.name,
          path: filePath,
          size: stats.size
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  async getList(): Promise<FileItem[]> {
    try {
      const token = this.getAuthToken()
      const accessTokens = this.getAccessTokens()

      const headers: Record<string, string> = { authorization: token }
      const firstToken = accessTokens[0]
      if (firstToken) {
        headers['access-token'] = firstToken
      }

      const res = await axios.get(`${BACKEND_URL}/file/list`, { headers })
      return res.data.data.files
    } catch (error: any) {
      this.handleError(error, 'Failed to fetch file list')
    }
  }

  async getUploadURL(fileName: string, fileSize: number): Promise<UploadURLResponse> {
    try {
      const token = this.getAuthToken()
      const res = await axios.get(`${BACKEND_URL}/file/upload-url`, {
        headers: { authorization: token },
        params: { fileName, fileSize }
      })
      console.log(BACKEND_URL)
      return res.data.data
    } catch (error: any) {
      console.log(error)
      this.handleError(error, 'Failed to get upload URL')
    }
  }

  async confirmUpload(fileName: string, fileKey: string, fileSize: number, status: 'SUCCESS' | 'FAILED'): Promise<void> {
    try {
      const token = this.getAuthToken()
      await axios.post(
        `${BACKEND_URL}/file/confirm-upload`,
        { fileName, fileKey, fileSize, status },
        { headers: { authorization: token } }
      )
    } catch (error: any) {
      console.log("Confirm upload erro")
      this.handleError(error, 'Failed to confirm upload')
    }
  }

  async getDownloadURL(fileName: string): Promise<{ url: string; file: { name: string; size: number; type: string } }> {
    try {
      const token = this.getAuthToken()
      const accessTokens = this.getAccessTokens()

      const headers: Record<string, string> = { authorization: token }
      const firstToken = accessTokens[0]
      if (firstToken) {
        headers['access-token'] = firstToken
      }

      const res = await axios.get(`${BACKEND_URL}/file/download`, {
        headers,
        params: { fileName }
      })
      return res.data.data
    } catch (error: any) {
      console.log(error)
      this.handleError(error, 'Failed to get download URL')
    }
  }

  async rename(oldName: string, newName: string): Promise<void> {
    try {
      const token = this.getAuthToken()
      const accessTokens = this.getAccessTokens()

      const headers: Record<string, string> = { authorization: token }
      const firstToken = accessTokens[0]
      if (firstToken) {
        headers['access-token'] = firstToken
      }

      await axios.patch(
        `${BACKEND_URL}/file/rename`,
        { fileName: oldName, newName },
        { headers }
      )
    } catch (error: any) {
      this.handleError(error, 'Failed to rename file')
    }
  }

  async delete(fileName: string): Promise<void> {
    try {
      const token = this.getAuthToken()
      await axios.delete(`${BACKEND_URL}/file/delete`, {
        headers: { authorization: token },
        data: { fileName }
      })
    } catch (error: any) {
      this.handleError(error, 'Failed to delete file')
    }
  }

  async setVisibility(fileName: string, isPublic: boolean): Promise<void> {
    try {
      const token = this.getAuthToken()
      await axios.patch(
        `${BACKEND_URL}/file/set-visibility`,
        { fileName, isPublic },
        { headers: { authorization: token } }
      )
    } catch (error: any) {
      this.handleError(error, 'Failed to set visibility')
    }
  }

  async getPublicList(accessToken: string): Promise<FileItem[]> {
    try {
      const res = await axios.get(`${BACKEND_URL}/file/public-list`, {
        headers: { 'access-token': accessToken }
      })
      return res.data.data.files
    } catch (error: any) {
      this.handleError(error, 'Failed to get public file list')
    }
  }

  async getPublicDownloadURL(fileName: string, accessToken: string): Promise<{ url: string; file: { name: string; size: number; type: string } }> {
    try {
      const res = await axios.get(`${BACKEND_URL}/file/public-download`, {
        headers: { 'access-token': accessToken },
        params: { fileName }
      })
      return res.data.data
    } catch (error: any) {
      this.handleError(error, 'Failed to get public download URL')
    }
  }

  async getStorageInfo(): Promise<StorageInfo> {
    try {
      const token = this.getAuthToken()
      const res = await axios.get(`${BACKEND_URL}/file/storage-info`, {
        headers: { authorization: token }
      })
      return res.data.data
    } catch (error: any) {
      this.handleError(error, 'Failed to get storage info')
    }
  }
}

export const fileService = new FileService()
