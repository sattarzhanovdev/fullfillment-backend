"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPLY_TRANSITIONS = void 0;
exports.isSupplyTransitionAllowed = isSupplyTransitionAllowed;
const MAIN_FLOW = [
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
function buildTransitions() {
    const map = {};
    MAIN_FLOW.forEach((status, index) => {
        const next = [];
        if (index < MAIN_FLOW.length - 1)
            next.push(MAIN_FLOW[index + 1]);
        next.push('CANCELLED');
        map[status] = next;
    });
    map.CANCELLED = [];
    map.COMPLETED = [];
    return map;
}
exports.SUPPLY_TRANSITIONS = buildTransitions();
function isSupplyTransitionAllowed(from, to) {
    if (from === to)
        return true;
    return exports.SUPPLY_TRANSITIONS[from]?.includes(to) ?? false;
}
//# sourceMappingURL=supply-funnel.js.map