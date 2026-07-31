import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

interface UserData {
  account_token: string
  access_tokens?: string[]
}

class FSService {
  private readonly configDir: string
  private readonly userFile: string

  constructor() {
    this.configDir = path.join(os.homedir(), '.racerfs')
    this.userFile = path.join(this.configDir, 'user.rcfs')
  }

  /**
   * Ensure ~/.racerfs directory exists
   */
  ensureConfigDir(): void {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true })
    }
  }

  /**
   * Read user data from ~/.racerfs/user.rcfs
   */
  readUserData(): UserData | null {
    try {
      if (!fs.existsSync(this.userFile)) {
        return null
      }
      const raw = fs.readFileSync(this.userFile, 'utf-8')
      return JSON.parse(raw) as UserData
    } catch {
      return null
    }
  }

  /**
   * Write arbitrary file content (no merge, full overwrite)
   * Atomic write via temp file untuk hindari corrupt jika crash.
   */
  writeFile(filePath: string, content: string): void {
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    // Tulis ke temp file dulu, baru rename (atomic)
    const tmpFile = `${filePath}.tmp`
    fs.writeFileSync(tmpFile, content, 'utf-8')
    fs.renameSync(tmpFile, filePath)
  }

  /**
   * Write user data to ~/.racerfs/user.rcfs (JSON only)
   * ALWAYS merge dengan data existing agar field lain tidak tertimpa.
   * Atomic write via temp file untuk hindari corrupt jika crash.
   */
  writeUserData(data: Partial<UserData>): void {
    this.ensureConfigDir()

    const existing = this.readUserData() ?? {}
    const merged = { ...existing, ...data }

    // Tulis ke temp file dulu, baru rename (atomic)
    const tmpFile = `${this.userFile}.tmp`
    fs.writeFileSync(tmpFile, JSON.stringify(merged, null, 2), 'utf-8')
    fs.renameSync(tmpFile, this.userFile)
  }

  /**
   * Delete user data file
   */
  deleteUserData(): void {
    if (fs.existsSync(this.userFile)) {
      fs.unlinkSync(this.userFile)
    }
  }

  /**
   * Check if user file exists
   */
  userFileExists(): boolean {
    return fs.existsSync(this.userFile)
  }
}

export const fsService = new FSService()
