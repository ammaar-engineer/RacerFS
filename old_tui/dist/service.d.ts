export declare class ServicesClass {
    createFile(path: string, data: any, { isJson }: {
        isJson: boolean;
    }): void;
    deleteFile(path: string): void;
    readFile(path: string, { isJson }: {
        isJson: boolean;
    }): any;
    createFolder(path: string): void;
    createPath(...path: string[]): string;
}
export declare const serviceSystem: ServicesClass;
//# sourceMappingURL=service.d.ts.map