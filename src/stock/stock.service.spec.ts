import { StockService } from './stock.service';

/**
 * Регрессия: физический остаток товара уходил в минус при отгрузке, если
 * резерв превышал фактический остаток (например, после расхождения при
 * инвентаризации). ТЗ §61 прямо запрещает списывать товар без основания —
 * consumeReservation обязан снять резерв полностью, но списать физически
 * не больше, чем реально есть, и сообщить о нехватке.
 */
describe('StockService.consumeReservation', () => {
  function makeHarness(stockRow: { id: string; physicalQty: number; reservedQty: number }) {
    const updateCalls: any[] = [];
    const historyCalls: any[] = [];

    const tx = {
      reservation: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'res1',
          productId: 'p1',
          clientId: 'c1',
          qty: 2,
          isReleased: false,
        }),
        update: jest.fn().mockImplementation(({ data }) => ({
          id: 'res1',
          productId: 'p1',
          clientId: 'c1',
          qty: 2,
          ...data,
        })),
      },
      stock: {
        findMany: jest.fn().mockResolvedValue([{ ...stockRow }]),
        update: jest.fn().mockImplementation((args) => {
          updateCalls.push(args);
          return args;
        }),
      },
      productHistoryEntry: {
        create: jest.fn().mockImplementation((args) => {
          historyCalls.push(args.data);
          return args;
        }),
      },
    };

    const prisma = { $transaction: jest.fn().mockImplementation((cb: any) => cb(tx)) } as any;
    const auditLogService = { log: jest.fn() } as any;
    const eventsGateway = { emitStockUpdated: jest.fn() } as any;
    const notificationsService = { create: jest.fn() } as any;

    const service = new StockService(prisma, auditLogService, eventsGateway, notificationsService);
    return { service, updateCalls, historyCalls, auditLogService, notificationsService };
  }

  it('never decrements physical stock below zero even if reservedQty is inflated', async () => {
    const { service, updateCalls, historyCalls, notificationsService } = makeHarness({
      id: 's1',
      physicalQty: 1,
      reservedQty: 2,
    });

    await service.consumeReservation('res1', 'user1', 'FBS заказ №TEST');

    expect(updateCalls).toHaveLength(1);
    expect(updateCalls[0].data.reservedQty).toEqual({ decrement: 2 });
    expect(updateCalls[0].data.physicalQty).toEqual({ decrement: 1 });

    // Только реально списанное количество попадает в историю движения товара
    expect(historyCalls).toHaveLength(1);
    expect(historyCalls[0].delta).toBe(-1);

    // Нехватка должна быть замечена и отправлена уведомлением
    expect(notificationsService.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'DISCREPANCY' }),
    );
  });

  it('decrements physical stock fully when reservation matches available stock', async () => {
    const { service, updateCalls, notificationsService } = makeHarness({
      id: 's1',
      physicalQty: 5,
      reservedQty: 2,
    });

    await service.consumeReservation('res1', 'user1', 'FBS заказ №TEST');

    expect(updateCalls[0].data.physicalQty).toEqual({ decrement: 2 });
    expect(notificationsService.create).not.toHaveBeenCalled();
  });
});
