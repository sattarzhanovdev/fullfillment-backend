import { Module } from '@nestjs/common';
import { FboService } from './fbo.service';
import { FboController } from './fbo.controller';

@Module({
  controllers: [FboController],
  providers: [FboService],
  exports: [FboService],
})
export class FboModule {}
