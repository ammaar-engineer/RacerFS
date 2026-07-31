import { BACKEND_URL, RACERFS_FOLDER_PATH } from "../SYSTEM-PATH.js"
import axios from "axios"
import chalk from "chalk"
import { serviceSystem } from "./fs.services.js"

interface Snippet {
  id: number
  alias: string
  description: string | null
  command: string
  created_at: string
}

export class SnippetServicesClass {
  private getAuthToken(): string {
    try {
      const userFile = serviceSystem.createPath(RACERFS_FOLDER_PATH, 'user.rcfs')
      const userData = serviceSystem.readFile(userFile, { isJson: true })
      console.log()
      return userData.account_token
    } catch (error) {
      console.log(chalk.red("Error reading authentication token"))
      process.exit(1)
    }
  }

  async getSnippetList(): Promise<Snippet[]> {
    try {
      const token = this.getAuthToken()
      // console.log(token)
      const response = await axios.get(`${BACKEND_URL}/snippet/list`, {
        headers: { authorization: token }
      })
      return response.data.data.snippets
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log(chalk.red("Authentication failed. Please login again."))
      } else {
        console.log(chalk.red("Error fetching snippet list"))
      }
      process.exit(1)
    }
  }

  async createSnippet(
    alias: string, 
    command: string, 
    description: string | null
  ): Promise<Snippet> {
    try {
      const token = this.getAuthToken()
      const response = await axios.post(
        `${BACKEND_URL}/snippet/create`,
        { alias, command, description },
        { headers: { authorization: token } }
      )
      return response.data.data.snippet
    } catch (error: any) {
      if (error.response?.status === 409) {
        console.log(chalk.red(`Snippet with alias '${alias}' already exists`))
      } else if (error.response?.status === 401) {
        console.log(chalk.red("Authentication failed. Please login again."))
      } else {
        console.log(chalk.red("Error creating snippet"))
      }
      process.exit(1)
    }
  }

  async updateSnippet(alias: string, command: string): Promise<any> {
    try {
      const token = this.getAuthToken()
      const response = await axios.patch(
        `${BACKEND_URL}/snippet/edit?alias=${encodeURIComponent(alias)}`,
        { command },
        { headers: { authorization: token } }
      )
      return response.data.data.snippet
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log(chalk.red(`Snippet '${alias}' not found`))
      } else if (error.response?.status === 401) {
        console.log(chalk.red("Authentication failed. Please login again."))
      } else {
        console.log(chalk.red("Error updating snippet"))
      }
      process.exit(1)
    }
  }

  async deleteSnippet(alias: string): Promise<void> {
    try {
      const token = this.getAuthToken()
      await axios.delete(
        `${BACKEND_URL}/snippet/delete?alias=${encodeURIComponent(alias)}`,
        { headers: { authorization: token } }
      )
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log(chalk.red(`Snippet '${alias}' not found`))
      } else if (error.response?.status === 401) {
        console.log(chalk.red("Authentication failed. Please login again."))
      } else {
        console.log(chalk.red("Error deleting snippet"))
      }
      process.exit(1)
    }
  }
}

export const snippetServices = new SnippetServicesClass()
