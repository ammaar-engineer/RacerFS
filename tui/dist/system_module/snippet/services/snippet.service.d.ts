export interface Snippet {
    id: number;
    alias: string;
    description: string;
    command: string;
    user_id: number;
    created_at: string;
}
declare class SnippetService {
    private getAuthToken;
    getList(): Promise<Snippet[]>;
    create(alias: string, command: string, description?: string): Promise<void>;
    edit(alias: string, command: string): Promise<void>;
    delete(alias: string): Promise<void>;
}
export declare const snippetService: SnippetService;
export {};
//# sourceMappingURL=snippet.service.d.ts.map