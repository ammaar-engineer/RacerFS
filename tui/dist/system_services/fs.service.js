import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
class FSService {
    configDir;
    userFile;
    constructor() {
        this.configDir = path.join(os.homedir(), '.racerfs');
        this.userFile = path.join(this.configDir, 'user.rcfs');
    }
    /**
     * Ensure ~/.racerfs directory exists
     */
    ensureConfigDir() {
        if (!fs.existsSync(this.configDir)) {
            fs.mkdirSync(this.configDir, { recursive: true });
        }
    }
    /**
     * Read user data from ~/.racerfs/user.rcfs
     */
    readUserData() {
        try {
            if (!fs.existsSync(this.userFile)) {
                return null;
            }
            const raw = fs.readFileSync(this.userFile, 'utf-8');
            return JSON.parse(raw);
        }
        catch {
            return null;
        }
    }
    /**
     * Write arbitrary file content (no merge, full overwrite)
     * Atomic write via temp file untuk hindari corrupt jika crash.
     */
    writeFile(filePath, content) {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        // Tulis ke temp file dulu, baru rename (atomic)
        const tmpFile = `${filePath}.tmp`;
        fs.writeFileSync(tmpFile, content, 'utf-8');
        fs.renameSync(tmpFile, filePath);
    }
    /**
     * Write user data to ~/.racerfs/user.rcfs (JSON only)
     * ALWAYS merge dengan data existing agar field lain tidak tertimpa.
     * Atomic write via temp file untuk hindari corrupt jika crash.
     */
    writeUserData(data) {
        this.ensureConfigDir();
        const existing = this.readUserData() ?? {};
        const merged = { ...existing, ...data };
        // Tulis ke temp file dulu, baru rename (atomic)
        const tmpFile = `${this.userFile}.tmp`;
        fs.writeFileSync(tmpFile, JSON.stringify(merged, null, 2), 'utf-8');
        fs.renameSync(tmpFile, this.userFile);
    }
    /**
     * Delete user data file
     */
    deleteUserData() {
        if (fs.existsSync(this.userFile)) {
            fs.unlinkSync(this.userFile);
        }
    }
    /**
     * Check if user file exists
     */
    userFileExists() {
        return fs.existsSync(this.userFile);
    }
}
export const fsService = new FSService();
//# sourceMappingURL=fs.service.js.map