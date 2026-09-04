export interface MarketplaceOrderPayload {
    externalOrderNumber: string;
    productBarcode: string;
    qty: number;
}
export interface MarketplaceStockPayload {
    productBarcode: string;
    qty: number;
}
export interface MarketplaceAdapter {
    fetchOrders(apiKey: string): Promise<MarketplaceOrderPayload[]>;
    fetchStock(apiKey: string): Promise<MarketplaceStockPayload[]>;
    fetchSupplies(apiKey: string): Promise<unknown[]>;
    pushLabels(apiKey: string, orderNumbers: string[]): Promise<void>;
}
