import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: { origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000', credentials: true },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  emitStockUpdated(payload: { productId: string; clientId: string }) {
    this.server?.emit('stock.updated', payload);
  }

  emitOrderUpdated(payload: { orderId: string; status: string }) {
    this.server?.emit('order.updated', payload);
  }

  emitSupplyUpdated(payload: { supplyId: string; status: string }) {
    this.server?.emit('supply.updated', payload);
  }

  emitNotification(payload: { userId?: string | null; clientId?: string | null; title: string; message: string; type: string }) {
    this.server?.emit('notification.created', payload);
  }
}
