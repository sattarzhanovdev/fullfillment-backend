"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FUNNEL_TRANSITIONS = exports.MAIN_FLOW = void 0;
exports.isTransitionAllowed = isTransitionAllowed;
exports.MAIN_FLOW = [
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
];
const SIDE_STATUSES = [
    'CANCELLED',
    'ERROR',
    'ITEM_NOT_FOUND',
    'NEEDS_PRICE',
    'BLOCKED_DEBT',
    'NEEDS_CLARIFICATION',
];
function buildTransitions() {
    const map = {};
    exports.MAIN_FLOW.forEach((status, index) => {
        const next = [];
        if (index < exports.MAIN_FLOW.length - 1)
            next.push(exports.MAIN_FLOW[index + 1]);
        next.push(...SIDE_STATUSES);
        map[status] = next;
    });
    map.NEW_REQUEST.push('AWAITING_PROCESSING', 'IN_PROGRESS');
    map.AWAITING_PROCESSING.push('PICKING');
    map.PICKED.push('PACKING');
    map.CANCELLED = [];
    map.ERROR = ['AWAITING_PROCESSING', 'CANCELLED'];
    map.ITEM_NOT_FOUND = ['PICKING', 'CANCELLED'];
    map.NEEDS_PRICE = ['AWAITING_PROCESSING', 'CANCELLED'];
    map.BLOCKED_DEBT = ['AWAITING_PROCESSING', 'CANCELLED'];
    map.NEEDS_CLARIFICATION = ['AWAITING_PROCESSING', 'CANCELLED'];
    map.COMPLETED = [];
    return map;
}
exports.FUNNEL_TRANSITIONS = buildTransitions();
function isTransitionAllowed(from, to) {
    if (from === to)
        return true;
    return exports.FUNNEL_TRANSITIONS[from]?.includes(to) ?? false;
}
//# sourceMappingURL=order-funnel.js.map