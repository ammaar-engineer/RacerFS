import { serviceSystem } from "../services/fs.services"
import { RACERFS_FOLDER_PATH } from "../SYSTEM-PATH"
import { fileServices } from "../services/file.services"
import { validationSystem } from "./fs.validation"



class FileValidationClass {
  isUserAuthenticated(): boolean {
    const userFile = serviceSystem.createPath(RACERFS_FOLDER_PATH, 'user.rcfs')

    if (!validationSystem.FileShouldBe('exist', userFile, { autoexit: false })) {
      return false
    }

    try {
      const userData = serviceSystem.readFile(userFile, { isJson: true })
      return !!userData.account_token
    } catch {
      return false
    }
  }

  async ensureAccessToken(): Promise<string> {
    const userFile = serviceSystem.createPath(RACERFS_FOLDER_PATH, 'user.rcfs')

    try {
      const userData = serviceSystem.readFile(userFile, { isJson: true })
      if (userData.access_token) {
        return userData.access_token
      }
    } catch {
      // file tidak bisa dibaca, lanjut generate
    }

    // Belum ada access token — generate baru
    return await fileServices.generateAccessToken()
  }

  hasAccessToken(): boolean {
    const userFile = serviceSystem.createPath(RACERFS_FOLDER_PATH, 'user.rcfs')
    
    if (!validationSystem.FileShouldBe('exist', userFile, { autoexit: false })) {
      return false
    }
    
    try {
      const userData = serviceSystem.readFile(userFile, { isJson: true })
      return !!userData.access_token
    } catch {
      return false
    }
  }
}

export const fileValidation = new FileValidationClass()
