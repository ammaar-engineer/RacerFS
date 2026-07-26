declare class ValidationsClass {
    FileShouldBe(beWhat: 'exist' | 'notexist', pathTarget: string, { autoexit }: {
        autoexit: boolean;
    }): boolean;
    FolderShouldBe(beWhat: 'exist' | 'notexist', pathTarget: string, { autoexit }: {
        autoexit: boolean;
    }): boolean;
}
export declare const validationSystem: ValidationsClass;
export {};
//# sourceMappingURL=validation.d.ts.map