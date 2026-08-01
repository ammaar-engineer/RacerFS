export interface FileItem {
    id: number;
    name: string;
    size: number;
    file_type: string;
    is_public: boolean;
    file_key: string;
    uploaded_at: string;
    user_id: number;
}
export interface StorageInfo {
    total_storage: number;
    used_storage: number;
    available_storage: number;
}
export interface LocalFile {
    name: string;
    path: string;
    size: number;
}
export interface UploadURLResponse {
    url: string;
    formData: Record<string, string>;
    fileKey: string;
}
declare class FileService {
    private getAuthToken;
    private getAccessTokens;
    private handleError;
    /**
     * List all files in current working directory (not recursive)
     */
    listLocalFiles(): LocalFile[];
    getList(): Promise<FileItem[]>;
    getUploadURL(fileName: string, fileSize: number): Promise<UploadURLResponse>;
    confirmUpload(fileName: string, fileKey: string, fileSize: number, status: 'SUCCESS' | 'FAILED'): Promise<void>;
    getDownloadURL(fileName: string): Promise<{
        url: string;
        file: {
            name: string;
            size: number;
            type: string;
        };
    }>;
    rename(oldName: string, newName: string): Promise<void>;
    delete(fileName: string): Promise<void>;
    setVisibility(fileName: string, isPublic: boolean): Promise<void>;
    getPublicList(accessToken: string): Promise<FileItem[]>;
    getPublicDownloadURL(fileName: string, accessToken: string): Promise<{
        url: string;
        file: {
            name: string;
            size: number;
            type: string;
        };
    }>;
    getStorageInfo(): Promise<StorageInfo>;
}
export declare const fileService: FileService;
export {};
//# sourceMappingURL=file.service.d.ts.map