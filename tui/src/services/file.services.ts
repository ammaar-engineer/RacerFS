import axios from "axios";
import chalk from "chalk";
import * as fs from "fs";
import { BACKEND_URL, RACERFS_FOLDER_PATH } from "../SYSTEM-PATH";
import { serviceSystem } from "./fs.services";

export interface FileItem {
  id: number
  name: string
  size: number
  is_public: boolean
  file_key: string
  uploaded_at: string
  user_id: number
}

export class FileServicesClass {
  private getTokens(): { accountToken: string; accessToken: string | null } {
    try {
      const userFile = serviceSystem.createPath(RACERFS_FOLDER_PATH, 'user.rcfs')
      const userData = serviceSystem.readFile(userFile, { isJson: true })
      return {
        accountToken: userData.account_token,
        accessToken: userData.access_token ?? null,
      }
    } catch {
      console.log(chalk.red("Error reading authentication token"))
      process.exit(1)
    }
  }

  async generateAccessToken(): Promise<string> {
    try {
      const { accountToken } = this.getTokens()
      const response = await axios.post(
        `${BACKEND_URL}/token/generate-access-token`,
        {},
        { headers: { authorization: accountToken } }
      )
      const token = response.data.data.access_token as string

      // Simpan ke user.rcfs
      const userFile = serviceSystem.createPath(RACERFS_FOLDER_PATH, 'user.rcfs')
      serviceSystem.modifyJsonFile(userFile, { access_token: token })

      return token
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log(chalk.red("Authentication failed. Please login again."))
      } else {
        console.log(chalk.red("Error generating access token"))
      }
      process.exit(1)
    }
  }

  async deleteAccessToken(token: string): Promise<void> {
    try {
      const { accountToken } = this.getTokens()
      await axios.delete(
        `${BACKEND_URL}/token/delete-access-token`,
        {
          headers: { authorization: accountToken },
          data: { token }
        }
      )

      // Hapus dari user.rcfs
      const userFile = serviceSystem.createPath(RACERFS_FOLDER_PATH, 'user.rcfs')
      const userData = serviceSystem.readFile(userFile, { isJson: true })
      delete userData.access_token
      serviceSystem.createFile(userFile, userData, { isJson: true })
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log(chalk.red("Authentication failed. Please login again."))
      } else if (error.response?.status === 404) {
        console.log(chalk.red("Access token not found"))
      } else {
        console.log(chalk.red("Error deleting access token"))
      }
      process.exit(1)
    }
  }

  async getFileList(): Promise<FileItem[]> {
    try {
      const { accountToken, accessToken } = this.getTokens()
      
      if (!accessToken) {
        console.log(chalk.red("No access token found. Please generate one first."))
        process.exit(1)
      }

      const response = await axios.get(`${BACKEND_URL}/file/list`, {
        headers: { 
          authorization: accountToken,
          'access-token': accessToken
        }
      })
      return response.data.data.files
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log(chalk.red("Authentication failed. Please login again."))
      } else {
        console.log(chalk.red("Error fetching file list"))
      }
      process.exit(1)
    }
  }

  async getDownloadUrl(fileName: string): Promise<string> {
    try {
      const { accountToken, accessToken } = this.getTokens()
      
      if (!accessToken) {
        console.log(chalk.red("No access token found. Please generate one first."))
        process.exit(1)
      }

      const response = await axios.get(
        `${BACKEND_URL}/file/download-url?file-name=${encodeURIComponent(fileName)}`,
        {
          headers: { 
            authorization: accountToken,
            'access-token': accessToken
          }
        }
      )
      return response.data.data.url
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log(chalk.red("Authentication failed. Please login again."))
      } else if (error.response?.status === 404) {
        console.log(chalk.red(`File '${fileName}' not found`))
      } else {
        console.log(chalk.red("Error getting download URL"))
      }
      process.exit(1)
    }
  }

  async downloadFile(fileName: string, savePath: string): Promise<void> {
    try {
      const url = await this.getDownloadUrl(fileName)
      const response = await axios.get(url, { responseType: 'arraybuffer' })
      fs.writeFileSync(savePath, response.data)
    } catch (error: any) {
      console.log(chalk.red("Error downloading file"))
      process.exit(1)
    }
  }

  async renameFile(fileName: string, newName: string): Promise<void> {
    try {
      const { accountToken, accessToken } = this.getTokens()
      
      if (!accessToken) {
        console.log(chalk.red("No access token found. Please generate one first."))
        process.exit(1)
      }

      await axios.patch(
        `${BACKEND_URL}/file/rename`,
        { 'file-name': fileName, 'new-name': newName },
        {
          headers: { 
            authorization: accountToken,
            'access-token': accessToken
          }
        }
      )
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log(chalk.red("Authentication failed. Please login again."))
      } else if (error.response?.status === 404) {
        console.log(chalk.red(`File '${fileName}' not found`))
      } else {
        console.log(chalk.red("Error renaming file"))
      }
      process.exit(1)
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      const { accountToken } = this.getTokens()

      await axios.delete(
        `${BACKEND_URL}/file/delete`,
        {
          headers: { authorization: accountToken },
          data: { 'file-name': fileName }
        }
      )
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log(chalk.red("Authentication failed. Please login again."))
      } else if (error.response?.status === 404) {
        console.log(chalk.red(`File '${fileName}' not found`))
      } else {
        console.log(chalk.red("Error deleting file"))
      }
      process.exit(1)
    }
  }

  async setFileVisibility(fileName: string, isPublic: boolean): Promise<FileItem> {
    try {
      const { accountToken } = this.getTokens()

      const response = await axios.patch(
        `${BACKEND_URL}/file/set-visibility`,
        { 'file-name': fileName, 'is_public': isPublic },
        { headers: { authorization: accountToken } }
      )
      return response.data.data
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log(chalk.red("Authentication failed. Please login again."))
      } else if (error.response?.status === 404) {
        console.log(chalk.red(`File '${fileName}' not found`))
      } else {
        console.log(chalk.red("Error setting file visibility"))
      }
      process.exit(1)
    }
  }

  async getPresignedUploadUrl(fileName: string, fileSize: number): Promise<{ url: string; fields: any; fileKey: string }> {
    try {
      const { accountToken } = this.getTokens()

      const response = await axios.get(
        `${BACKEND_URL}/file/upload-url?file-name=${encodeURIComponent(fileName)}&file-size=${fileSize}`,
        { headers: { authorization: accountToken } }
      )
      console.log(response.data)
      
      // Extract file-key from URL or response
      const urlObj = new URL(response.data.data.url)
      const fileKey = urlObj.pathname.split('/').pop() || ''
      
      return {
        url: response.data.data.url,
        fields: response.data.data.fields,
        fileKey: fileKey
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log(chalk.red("Authentication failed. Please login again."))
      } else if (error.response?.status === 413) {
        console.log(chalk.red("File size exceeds storage limit"))
      } else {
        console.log(chalk.red("Error getting upload URL"))
      }
      process.exit(1)
    }
  }

  async confirmUpload(fileName: string, fileKey: string, fileSize: number, status: 'SUCCESS' | 'FAILED'): Promise<void> {
    try {
      const { accountToken } = this.getTokens()

      await axios.post(
        `${BACKEND_URL}/file/confirm-upload`,
        {
          'file-name': fileName,
          'file-key': fileKey,
          'file-size': String(fileSize),
          'status': status
        },
        { headers: { authorization: accountToken } }
      )
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log(chalk.red("Authentication failed. Please login again."))
      } else {
        console.log(chalk.red("Error confirming upload"))
      }
      process.exit(1)
    }
  }

  async uploadFile(localFilePath: string, fileName: string): Promise<void> {
    try {
      // Read file
      const fileBuffer = fs.readFileSync(localFilePath)
      const fileSize = fileBuffer.length

      // Get presigned URL
      const { url, fileKey } = await this.getPresignedUploadUrl(fileName, fileSize)
      console.log(url)
      // Upload to S3
      await axios.put(url, fileBuffer, {
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      })

      // Confirm upload
      await this.confirmUpload(fileName, fileKey, fileSize, 'SUCCESS')
    } catch (error: any) {
      console.log(error)
      console.log(chalk.red("Error uploading file"))
      
      // Try to confirm failed upload if we have the info
      try {
        const stats = fs.statSync(localFilePath)
        // We don't have fileKey here, so just exit
      } catch {}
      
      process.exit(1)
    }
  }
}

export const fileServices = new FileServicesClass()
