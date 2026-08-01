interface SelectOption {
    label: string;
    action: () => Promise<void>;
}
/**
 * Create interactive select menu
 */
export declare function createSelectOption(message: string, options: SelectOption[]): Promise<void>;
export {};
//# sourceMappingURL=selector.service.d.ts.map