export interface FileItem {
    id: number;
    name: string;
    size: number;
    is_public: boolean;
    file_key: string;
    uploaded_at: string;
    user_id: number;
}
export declare class FileServicesClass {
    private getTokens;
    generateAccessToken(): Promise<string>;
    deleteAccessToken(token: string): Promise<void>;
    getFileList(): Promise<FileItem[]>;
    getDownloadUrl(fileName: string): Promise<string>;
    downloadFile(fileName: string, savePath: string): Promise<void>;
    renameFile(fileName: string, newName: string): Promise<void>;
    deleteFile(fileName: string): Promise<void>;
    setFileVisibility(fileName: string, isPublic: boolean): Promise<FileItem>;
    getPresignedUploadUrl(fileName: string, fileSize: number): Promise<{
        url: string;
        fields: any;
        fileKey: string;
    }>;
    confirmUpload(fileName: string, fileKey: string, fileSize: number, status: 'SUCCESS' | 'FAILED'): Promise<void>;
    uploadFile(localFilePath: string, fileName: string): Promise<void>;
}
export declare const fileServices: FileServicesClass;
//# sourceMappingURL=file.services.d.ts.map