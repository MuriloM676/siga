import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MaintenanceStatus } from '@prisma/client';

export class CreateMaintenanceDto {
  @ApiProperty({ example: 'uuid-do-imovel' })
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({ example: 'uuid-da-unidade', required: false })
  @IsString()
  @IsOptional()
  unitId?: string;

  @ApiProperty({ example: 'Vazamento no banheiro' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Torneira do banheiro está vazando' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 150.0, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  cost?: number;

  @ApiProperty({ enum: MaintenanceStatus, example: MaintenanceStatus.ABERTO })
  @IsEnum(MaintenanceStatus)
  @IsOptional()
  status?: MaintenanceStatus;

  @ApiProperty({ example: '2024-01-15', required: false })
  @IsDateString()
  @IsOptional()
  reportedAt?: string;

  @ApiProperty({ example: '2024-01-20', required: false })
  @IsDateString()
  @IsOptional()
  completedAt?: string;

  @ApiProperty({ example: 'Urgente', required: false })
  @IsString()
  @IsOptional()
  observations?: string;
}
