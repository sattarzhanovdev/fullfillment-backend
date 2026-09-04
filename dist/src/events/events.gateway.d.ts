import { Server } from 'socket.io';
export declare class EventsGateway {
    server: Server;
    emitStockUpdated(payload: {
        productId: string;
        clientId: string;
    }): void;
    emitOrderUpdated(payload: {
        orderId: string;
        status: string;
    }): void;
    emitSupplyUpdated(payload: {
        supplyId: string;
        status: string;
    }): void;
    emitNotification(payload: {
        userId?: string | null;
        clientId?: string | null;
        title: string;
        message: string;
        type: string;
    }): void;
}
