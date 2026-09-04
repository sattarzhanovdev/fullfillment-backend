import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsOptional, IsString, IsNumber, ValidateNested } from 'class-validator';
import { Marketplace, OrderPriority } from '@prisma/client';

class OrderItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  qtyNeeded: number;
}

export class CreateOrderDto {
  @IsString()
  orderNumber: string;

  @IsEnum(Marketplace)
  marketplace: Marketplace;

  @IsString()
  clientId: string;

  @IsOptional()
  @IsEnum(OrderPriority)
  priority?: OrderPriority;

  @IsOptional()
  @IsString()
  deadline?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
