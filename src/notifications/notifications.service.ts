import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

export interface CreateNotificationInput {
  userId?: string | null;
  clientId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async create(input: CreateNotificationInput) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId ?? null,
        clientId: input.clientId ?? null,
        type: input.type,
        title: input.title,
        message: input.message,
      },
    });
    this.eventsGateway.emitNotification({
      userId: input.userId,
      clientId: input.clientId,
      title: input.title,
      message: input.message,
      type: input.type,
    });
    return notification;
  }

  async findForUser(userId: string, clientId: string | null, take = 30) {
    return this.prisma.notification.findMany({
      where: {
        OR: [{ userId }, ...(clientId ? [{ clientId }] : [])],
      },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  async markRead(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async unreadCount(userId: string, clientId: string | null) {
    return this.prisma.notification.count({
      where: {
        isRead: false,
        OR: [{ userId }, ...(clientId ? [{ clientId }] : [])],
      },
    });
  }
}
