import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  getLink(clientId: string) {
    return this.prisma.telegramLink.findUnique({ where: { clientId } });
  }

  upsertLink(
    clientId: string,
    data: Partial<{
      chatId: string;
      username: string;
      notifyNewOrder: boolean;
      notifyPicked: boolean;
      notifyPacked: boolean;
      notifyShipped: boolean;
      notifyLowStock: boolean;
      notifyDebt: boolean;
      notifyErrors: boolean;
    }>,
  ) {
    return this.prisma.telegramLink.upsert({
      where: { clientId },
      create: { clientId, ...data },
      update: data,
    });
  }

  /** Отправка уведомления в Telegram клиента. Требует настроенного TELEGRAM_BOT_TOKEN. */
  async notify(clientId: string, message: string) {
    const link = await this.getLink(clientId);
    if (!link?.chatId) return;

    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      this.logger.log(`[dev] Telegram → chat ${link.chatId}: ${message}`);
      return;
    }

    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: link.chatId, text: message }),
      });
    } catch (error) {
      this.logger.error('Не удалось отправить сообщение в Telegram', error as Error);
    }
  }
}
