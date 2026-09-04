import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class ClientsService {
  constructor(
    private prisma: PrismaService,
    private analyticsService: AnalyticsService,
  ) {}

  async findAll() {
    const clients = await this.prisma.client.findMany({
      include: {
        manager: { select: { id: true, fullName: true } },
        _count: { select: { products: true, orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const debts = await this.prisma.debtLedgerEntry.groupBy({
      by: ['clientId'],
      _sum: { amount: true },
    });
    const debtMap = new Map(debts.map((d) => [d.clientId, Number(d._sum.amount ?? 0)]));

    return clients.map((c) => ({
      ...c,
      productsCount: c._count.products,
      ordersCount: c._count.orders,
      debt: debtMap.get(c.id) ?? 0,
    }));
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        manager: { select: { id: true, fullName: true } },
        requisites: true,
        contract: true,
        telegramLink: true,
        clientPrice: true,
        marketplaceLinks: true,
      },
    });
    if (!client) throw new NotFoundException('Клиент не найден');
    return client;
  }

  create(data: { name: string; type?: 'IP' | 'OOO'; managerId?: string; debtLimit?: number; bufferPercent?: number }) {
    return this.prisma.client.create({ data });
  }

  update(id: string, data: Partial<Parameters<ClientsService['create']>[0]> & { status?: any }) {
    return this.prisma.client.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.client.update({ where: { id }, data: { status: 'ARCHIVED' } });
  }

  // ---- Requisites ----
  upsertRequisites(
    clientId: string,
    data: {
      legalName: string;
      inn: string;
      ogrn?: string;
      legalAddress?: string;
      actualAddress?: string;
      phone?: string;
      email?: string;
      bankName?: string;
      bankAccount?: string;
      bankBik?: string;
      contactPerson?: string;
    },
  ) {
    return this.prisma.clientRequisites.upsert({
      where: { clientId },
      create: { clientId, ...data },
      update: data,
    });
  }

  // ---- Contract ----
  upsertContract(
    clientId: string,
    data: {
      number: string;
      date: string;
      startDate: string;
      termMonths?: number;
      tariff?: string;
      terms?: string;
      status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
    },
  ) {
    return this.prisma.contract.upsert({
      where: { clientId },
      create: { clientId, ...data, date: new Date(data.date), startDate: new Date(data.startDate) },
      update: { ...data, date: new Date(data.date), startDate: new Date(data.startDate) },
    });
  }

  async analytics(clientId: string, period: { from?: string; to?: string } = {}) {
    const from = period.from ? new Date(period.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = period.to ? new Date(period.to) : new Date();

    const [ordersCount, fbsCount, fboCount, revenueAgg, debtAgg] = await Promise.all([
      this.prisma.marketplaceOrder.count({
        where: { clientId, createdAt: { gte: from, lte: to } },
      }),
      this.prisma.marketplaceOrder.count({ where: { clientId, createdAt: { gte: from, lte: to } } }),
      this.prisma.supply.count({ where: { clientId, createdAt: { gte: from, lte: to } } }),
      this.prisma.marketplaceOrder.aggregate({
        where: { clientId, createdAt: { gte: from, lte: to } },
        _sum: { processingCost: true },
      }),
      this.prisma.debtLedgerEntry.aggregate({ where: { clientId }, _sum: { amount: true } }),
    ]);

    const [timeSeries, topProducts] = await Promise.all([
      this.analyticsService.timeSeries(from, to, clientId),
      this.analyticsService.topProducts(from, to, 5, clientId),
    ]);

    return {
      period: { from, to },
      ordersCount,
      fbsCount,
      fboCount,
      revenue: Number(revenueAgg._sum.processingCost ?? 0),
      debt: Number(debtAgg._sum.amount ?? 0),
      timeSeries,
      topProducts,
    };
  }
}
