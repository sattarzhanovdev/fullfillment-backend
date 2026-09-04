import { isTransitionAllowed } from './order-funnel';

describe('order-funnel transitions', () => {
  it('allows the main happy-path sequence', () => {
    expect(isTransitionAllowed('NEW_REQUEST', 'AWAITING_PROCESSING')).toBe(true);
    expect(isTransitionAllowed('AWAITING_PROCESSING', 'PICKING')).toBe(true);
    expect(isTransitionAllowed('PICKING', 'PICKED')).toBe(true);
    expect(isTransitionAllowed('PICKED', 'PACKING')).toBe(true);
    expect(isTransitionAllowed('PACKING', 'PACKED')).toBe(true);
    expect(isTransitionAllowed('PACKED', 'READY_TO_SHIP')).toBe(true);
    expect(isTransitionAllowed('READY_TO_SHIP', 'SHIPPED')).toBe(true);
    expect(isTransitionAllowed('SHIPPED', 'COMPLETED')).toBe(true);
  });

  it('rejects skipping ahead in the funnel', () => {
    expect(isTransitionAllowed('NEW_REQUEST', 'SHIPPED')).toBe(false);
    expect(isTransitionAllowed('PICKING', 'COMPLETED')).toBe(false);
  });

  it('rejects moving backwards in the funnel', () => {
    expect(isTransitionAllowed('PACKED', 'PICKING')).toBe(false);
    expect(isTransitionAllowed('SHIPPED', 'PACKED')).toBe(false);
  });

  it('allows side statuses from an active status, and recovery back to processing', () => {
    expect(isTransitionAllowed('PICKING', 'ITEM_NOT_FOUND')).toBe(true);
    expect(isTransitionAllowed('ITEM_NOT_FOUND', 'PICKING')).toBe(true);
    expect(isTransitionAllowed('AWAITING_PROCESSING', 'NEEDS_PRICE')).toBe(true);
    expect(isTransitionAllowed('NEEDS_PRICE', 'AWAITING_PROCESSING')).toBe(true);
  });

  it('treats terminal statuses as final', () => {
    expect(isTransitionAllowed('COMPLETED', 'CANCELLED')).toBe(false);
    expect(isTransitionAllowed('CANCELLED', 'NEW_REQUEST')).toBe(false);
  });
});
