export interface AccessTokenItem {
    id: number;
    token: string;
    user_id: number;
    type: string;
}
declare class AccessTokenService {
    private getAuthToken;
    private getStoredTokens;
    private saveTokens;
    private handleError;
    create(): Promise<string>;
    list(): Promise<string[]>;
    delete(tokenToDelete: string): Promise<void>;
    getLocalTokens(): string[];
}
export declare const accessTokenService: AccessTokenService;
export {};
//# sourceMappingURL=access-token.service.d.ts.map