interface UserData {
    account_token: string;
    access_tokens?: string[];
}
declare class FSService {
    private readonly configDir;
    private readonly userFile;
    constructor();
    /**
     * Ensure ~/.racerfs directory exists
     */
    ensureConfigDir(): void;
    /**
     * Read user data from ~/.racerfs/user.rcfs
     */
    readUserData(): UserData | null;
    /**
     * Write arbitrary file content (no merge, full overwrite)
     * Atomic write via temp file untuk hindari corrupt jika crash.
     */
    writeFile(filePath: string, content: string): void;
    /**
     * Write user data to ~/.racerfs/user.rcfs (JSON only)
     * ALWAYS merge dengan data existing agar field lain tidak tertimpa.
     * Atomic write via temp file untuk hindari corrupt jika crash.
     */
    writeUserData(data: Partial<UserData>): void;
    /**
     * Delete user data file
     */
    deleteUserData(): void;
    /**
     * Check if user file exists
     */
    userFileExists(): boolean;
}
export declare const fsService: FSService;
export {};
//# sourceMappingURL=fs.service.d.ts.map