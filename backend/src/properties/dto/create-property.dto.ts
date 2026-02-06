import { IsEnum, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PropertyType } from '@prisma/client';

export class CreatePropertyDto {
  @ApiProperty({ enum: PropertyType, example: PropertyType.CASA })
  @IsEnum(PropertyType)
  @IsNotEmpty()
  type: PropertyType;

  @ApiProperty({ example: 'Casa na Rua das Flores' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: 'Rua das Flores, 123' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Apto 101', required: false })
  @IsString()
  @IsOptional()
  complement?: string;

  @ApiProperty({ example: '01234-567', required: false })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiProperty({ example: '123456', required: false })
  @IsString()
  @IsOptional()
  registration?: string;

  @ApiProperty({ example: 'Imóvel com 3 quartos', required: false })
  @IsString()
  @IsOptional()
  observations?: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  hasUnits?: boolean;
}
