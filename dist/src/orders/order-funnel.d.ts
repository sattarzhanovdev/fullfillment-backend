import { FunnelStatus } from '@prisma/client';
export declare const MAIN_FLOW: FunnelStatus[];
export declare const FUNNEL_TRANSITIONS: Record<import(".prisma/client").$Enums.FunnelStatus, import(".prisma/client").$Enums.FunnelStatus[]>;
export declare function isTransitionAllowed(from: FunnelStatus, to: FunnelStatus): boolean;
