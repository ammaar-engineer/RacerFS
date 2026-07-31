interface Snippet {
    id: number;
    alias: string;
    description: string | null;
    command: string;
    created_at: string;
}
export declare class SnippetServicesClass {
    private getAuthToken;
    getSnippetList(): Promise<Snippet[]>;
    createSnippet(alias: string, command: string, description: string | null): Promise<Snippet>;
    updateSnippet(alias: string, command: string): Promise<any>;
    deleteSnippet(alias: string): Promise<void>;
}
export declare const snippetServices: SnippetServicesClass;
export {};
//# sourceMappingURL=snippet.services.d.ts.map