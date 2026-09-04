import { Marketplace, OrderPriority } from '@prisma/client';
declare class OrderItemDto {
    productId: string;
    qtyNeeded: number;
}
export declare class CreateOrderDto {
    orderNumber: string;
    marketplace: Marketplace;
    clientId: string;
    priority?: OrderPriority;
    deadline?: string;
    items: OrderItemDto[];
}
export {};
