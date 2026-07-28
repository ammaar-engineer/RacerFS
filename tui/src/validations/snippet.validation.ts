import { RACERFS_FOLDER_PATH } from "../SYSTEM-PATH.js"
import { serviceSystem } from "../services/fs.services.js"
import { validationSystem } from "./fs.validation.js"

class SnippetValidationClass {
  isUserAuthenticated(): boolean {
    const userFile = serviceSystem.createPath(RACERFS_FOLDER_PATH, 'user.rcfs')
    
    // Check if file exists
    if (!validationSystem.FileShouldBe('exist', userFile, { autoexit: false })) {
      return false
    }
    
    // Check if token exists in file
    try {
      const userData = serviceSystem.readFile(userFile, { isJson: true })
      return userData.account_token
    } catch {
      return false
    }
  }

  validateAlias(alias: string): string {
    console.log(alias)
    if (!alias || alias.trim().length === 0) {
      return "Alias cannot be empty"
    }
    if (alias.length < 3) {
      return "Alias must be at least 3 characters"
    }
    if (alias.length > 50) {
      return "Alias must be less than 50 characters"
    }
    // Alphanumeric, dash, underscore only
    if (!/^[a-zA-Z0-9_-]+$/.test(alias)) {
      return "Alias can only contain letters, numbers, hyphens, and underscores"
    }
    return alias
  }

  validateCommand(command: string): string {
    if (!command || command.trim().length === 0) {
      return "Command cannot be empty"
    }
    if (command.length > 5000) {
      return "Command is too long (max 5000 characters)"
    }
    return command
  }

  validateDescription(description: string): string {
    if (description && description.length > 500) {
      return "Description is too long (max 500 characters)"
    }
    return description
  }
}

export const snippetValidation = new SnippetValidationClass()
