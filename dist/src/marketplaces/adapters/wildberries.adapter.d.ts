import { MarketplaceAdapter, MarketplaceOrderPayload, MarketplaceStockPayload } from './marketplace-adapter.interface';
export declare class WildberriesAdapter implements MarketplaceAdapter {
    private readonly logger;
    fetchOrders(_apiKey: string): Promise<MarketplaceOrderPayload[]>;
    fetchStock(_apiKey: string): Promise<MarketplaceStockPayload[]>;
    fetchSupplies(_apiKey: string): Promise<unknown[]>;
    pushLabels(_apiKey: string, _orderNumbers: string[]): Promise<void>;
}
