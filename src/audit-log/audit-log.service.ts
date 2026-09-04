import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogInput {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
  device?: string | null;
  ip?: string | null;
}

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(input: AuditLogInput) {
    return this.prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        oldValue: input.oldValue as any,
        newValue: input.newValue as any,
        device: input.device ?? null,
        ip: input.ip ?? null,
      },
    });
  }

  async findAll(params: { entityType?: string; entityId?: string; userId?: string; take?: number; skip?: number }) {
    const { entityType, entityId, userId, take = 50, skip = 0 } = params;
    return this.prisma.auditLog.findMany({
      where: {
        ...(entityType && { entityType }),
        ...(entityId && { entityId }),
        ...(userId && { userId }),
      },
      include: { user: { select: { id: true, fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
  }
}
