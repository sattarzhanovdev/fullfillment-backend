import { SupplyStatus } from '@prisma/client';

const MAIN_FLOW: SupplyStatus[] = [
  'DRAFT',
  'CREATED',
  'PICKING',
  'PICKED',
  'PACKING',
  'READY',
  'SHIPPED',
  'ACCEPTED_BY_MARKETPLACE',
  'COMPLETED',
];

function buildTransitions(): Record<SupplyStatus, SupplyStatus[]> {
  const map = {} as Record<SupplyStatus, SupplyStatus[]>;
  MAIN_FLOW.forEach((status, index) => {
    const next: SupplyStatus[] = [];
    if (index < MAIN_FLOW.length - 1) next.push(MAIN_FLOW[index + 1]);
    next.push('CANCELLED');
    map[status] = next;
  });
  map.CANCELLED = [];
  map.COMPLETED = [];
  return map;
}

export const SUPPLY_TRANSITIONS = buildTransitions();

export function isSupplyTransitionAllowed(from: SupplyStatus, to: SupplyStatus): boolean {
  if (from === to) return true;
  return SUPPLY_TRANSITIONS[from]?.includes(to) ?? false;
}
