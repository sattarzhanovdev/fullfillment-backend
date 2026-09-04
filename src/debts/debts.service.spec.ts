import { DebtsService } from './debts.service';

function makeService() {
  return new DebtsService({} as any, {} as any, {} as any);
}

describe('DebtsService.stateForPercent', () => {
  const service = makeService();

  it('is NORMAL below 50%', () => {
    expect(service.stateForPercent(0)).toBe('NORMAL');
    expect(service.stateForPercent(49.9)).toBe('NORMAL');
  });

  it('is WARNING from 50% to under 80%', () => {
    expect(service.stateForPercent(50)).toBe('WARNING');
    expect(service.stateForPercent(79.9)).toBe('WARNING');
  });

  it('is CRITICAL from 80% to under 100%', () => {
    expect(service.stateForPercent(80)).toBe('CRITICAL');
    expect(service.stateForPercent(99.9)).toBe('CRITICAL');
  });

  it('is BLOCKED at or above 100%', () => {
    expect(service.stateForPercent(100)).toBe('BLOCKED');
    expect(service.stateForPercent(150)).toBe('BLOCKED');
  });
});
