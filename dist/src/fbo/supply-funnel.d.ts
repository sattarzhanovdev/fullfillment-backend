import { SupplyStatus } from '@prisma/client';
export declare const SUPPLY_TRANSITIONS: Record<import(".prisma/client").$Enums.SupplyStatus, import(".prisma/client").$Enums.SupplyStatus[]>;
export declare function isSupplyTransitionAllowed(from: SupplyStatus, to: SupplyStatus): boolean;
