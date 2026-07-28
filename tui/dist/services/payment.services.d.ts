export declare class PaymentServicesClass {
    private getAuthToken;
    buyStorage(): Promise<void>;
    getStorageInfo(): Promise<{
        total_storage: number;
        used_storage: number;
        available_storage: number;
    }>;
}
export declare const paymentServices: PaymentServicesClass;
//# sourceMappingURL=payment.services.d.ts.map