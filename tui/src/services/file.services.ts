import { BACKEND_URL, RACERFS_FOLDER_PATH } from "@/SYSTEM-PATH";
import axios from "axios";
import chalk from "chalk";
import { serviceSystem } from "./fs.services";

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
        `${BACKEND_URL}/file/generate-access-token`,
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
        console.log(error)
        console.log(chalk.red("Error generating access token"))
      }
      process.exit(1)
    }
  }
}

export const fileServices = new FileServicesClass()
