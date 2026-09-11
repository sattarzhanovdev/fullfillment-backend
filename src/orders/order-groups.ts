import { FunnelStatus } from '@prisma/client';

/** Группы статусов для вкладок списка заказов (Новые / На сборке / В доставке / Завершённые / Отменённые). */
export const ORDER_GROUPS = {
  NEW: [
    'NEW_REQUEST',
    'AWAITING_RECEIPT',
    'RECEIVING',
    'RECEIVED',
    'AWAITING_PROCESSING',
    'NEEDS_PRICE',
    'BLOCKED_DEBT',
    'NEEDS_CLARIFICATION',
  ],
  PICKING: ['IN_PROGRESS', 'PICKING', 'PICKED', 'PACKING', 'PACKED', 'READY_TO_SHIP', 'ITEM_NOT_FOUND', 'ERROR'],
  SHIPPING: ['SHIPPED'],
  COMPLETED: ['COMPLETED'],
  CANCELLED: ['CANCELLED'],
} as const satisfies Record<string, FunnelStatus[]>;

export type OrderGroup = keyof typeof ORDER_GROUPS;

export function isOrderGroup(value: string): value is OrderGroup {
  return value in ORDER_GROUPS;
}
