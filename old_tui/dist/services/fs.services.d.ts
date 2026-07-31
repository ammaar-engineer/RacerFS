export declare class ServicesClass {
    createFile(path: string, data: any, { isJson }: {
        isJson: boolean;
    }): void;
    deleteFile(path: string): void;
    readFile(path: string, { isJson }: {
        isJson: boolean;
    }): any;
    modifyJsonFile(path: string, newData: any): void;
    createFolder(path: string): void;
    createPath(...paths: string[]): string;
}
export declare const serviceSystem: ServicesClass;
//# sourceMappingURL=fs.services.d.ts.map