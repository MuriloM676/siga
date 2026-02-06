import { IsNotEmpty, IsOptional, IsString, IsNumber, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUnitDto {
  @ApiProperty({ example: 'uuid-do-imovel' })
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({ example: '101' })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiProperty({ example: '1', required: false })
  @IsString()
  @IsOptional()
  floor?: string;

  @ApiProperty({ example: 45.5, required: false })
  @IsNumber()
  @IsOptional()
  area?: number;

  @ApiProperty({ example: 2, required: false })
  @IsInt()
  @IsOptional()
  bedrooms?: number;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  bathrooms?: number;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  parkingSpots?: number;

  @ApiProperty({ example: 'Sala comercial ampla', required: false })
  @IsString()
  @IsOptional()
  observations?: string;
}
