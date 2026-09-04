import { FunnelStatus } from '@prisma/client';

/** Основная последовательность воронки FBS-заказа (ТЗ §4). */
export const MAIN_FLOW: FunnelStatus[] = [
  'NEW_REQUEST',
  'AWAITING_RECEIPT',
  'RECEIVING',
  'RECEIVED',
  'AWAITING_PROCESSING',
  'IN_PROGRESS',
  'PICKING',
  'PICKED',
  'PACKING',
  'PACKED',
  'READY_TO_SHIP',
  'SHIPPED',
  'COMPLETED',
] as const as FunnelStatus[];

/** Отдельные статусы, в которые можно попасть из любого активного статуса воронки. */
const SIDE_STATUSES: FunnelStatus[] = [
  'CANCELLED',
  'ERROR',
  'ITEM_NOT_FOUND',
  'NEEDS_PRICE',
  'BLOCKED_DEBT',
  'NEEDS_CLARIFICATION',
];

function buildTransitions(): Record<FunnelStatus, FunnelStatus[]> {
  const map = {} as Record<FunnelStatus, FunnelStatus[]>;
  MAIN_FLOW.forEach((status, index) => {
    const next: FunnelStatus[] = [];
    if (index < MAIN_FLOW.length - 1) next.push(MAIN_FLOW[index + 1]);
    next.push(...SIDE_STATUSES);
    map[status] = next;
  });
  // FBS-заказы обычно не требуют повторной физической приёмки — разрешаем прямой переход
  map.NEW_REQUEST.push('AWAITING_PROCESSING', 'IN_PROGRESS');
  map.AWAITING_PROCESSING.push('PICKING');
  map.PICKED.push('PACKING');

  // Из отдельных статусов можно вернуться в обработку
  map.CANCELLED = [];
  map.ERROR = ['AWAITING_PROCESSING', 'CANCELLED'];
  map.ITEM_NOT_FOUND = ['PICKING', 'CANCELLED'];
  map.NEEDS_PRICE = ['AWAITING_PROCESSING', 'CANCELLED'];
  map.BLOCKED_DEBT = ['AWAITING_PROCESSING', 'CANCELLED'];
  map.NEEDS_CLARIFICATION = ['AWAITING_PROCESSING', 'CANCELLED'];
  map.COMPLETED = [];
  return map;
}

export const FUNNEL_TRANSITIONS = buildTransitions();

export function isTransitionAllowed(from: FunnelStatus, to: FunnelStatus): boolean {
  if (from === to) return true;
  return FUNNEL_TRANSITIONS[from]?.includes(to) ?? false;
}
