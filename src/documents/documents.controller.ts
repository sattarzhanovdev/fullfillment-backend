import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { DocumentType, UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { DocumentsService } from './documents.service';

const STORAGE_DIR = join(process.cwd(), 'storage', 'documents');
if (!existsSync(STORAGE_DIR)) mkdirSync(STORAGE_DIR, { recursive: true });

@Controller('documents')
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get('client/:clientId')
  findForClient(@Param('clientId') clientId: string, @Query('type') type?: DocumentType) {
    return this.documentsService.findForClient(clientId, type);
  }

  @Post('client/:clientId')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: STORAGE_DIR,
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          cb(null, unique);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  upload(
    @Param('clientId') clientId: string,
    @Body('type') type: DocumentType,
    @Body('title') title: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documentsService.create({
      clientId,
      type,
      title: title || file.originalname,
      fileUrl: `/storage/documents/${file.filename}`,
    });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR)
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
