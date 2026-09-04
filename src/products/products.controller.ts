import { Body, Controller, Get, Param, Patch, Post, Query, Delete } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  findAll(@Query('clientId') clientId?: string, @Query('search') search?: string) {
    return this.productsService.findAll({ clientId, search });
  }

  @Get('by-barcode/:barcode')
  findByBarcode(@Param('barcode') barcode: string, @Query('clientId') clientId?: string) {
    return this.productsService.findByBarcode(barcode, clientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get(':id/history')
  history(@Param('id') id: string) {
    return this.productsService.history(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
