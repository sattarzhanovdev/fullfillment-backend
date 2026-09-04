import { Injectable } from '@nestjs/common';
import { DocumentType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  findForClient(clientId: string, type?: DocumentType) {
    return this.prisma.document.findMany({
      where: { clientId, ...(type && { type }) },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: { clientId: string; type: DocumentType; title: string; fileUrl: string }) {
    return this.prisma.document.create({ data });
  }

  remove(id: string) {
    return this.prisma.document.delete({ where: { id } });
  }
}
