import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  clientId: string;

  @IsString()
  name: string;

  @IsString()
  sku: string;

  @IsString()
  article: string;

  @IsString()
  barcode: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsNumber()
  lengthCm?: number;

  @IsOptional()
  @IsNumber()
  widthCm?: number;

  @IsOptional()
  @IsNumber()
  heightCm?: number;

  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsString()
  packagingTypeId?: string;

  @IsOptional()
  @IsNumber()
  ownPrice?: number;

  @IsOptional()
  @IsNumber()
  fbsProcessingPrice?: number;

  @IsOptional()
  @IsNumber()
  bufferPercent?: number;
}
