export declare class CreateProductDto {
    clientId: string;
    name: string;
    sku: string;
    article: string;
    barcode: string;
    category?: string;
    photoUrl?: string;
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
    weightKg?: number;
    packagingTypeId?: string;
    ownPrice?: number;
    fbsProcessingPrice?: number;
    bufferPercent?: number;
}
