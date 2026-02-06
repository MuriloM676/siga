import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsInt,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContractStatus, GuaranteeType, IndexType } from '@prisma/client';

export class CreateContractDto {
  @ApiProperty({ example: 'uuid-do-imovel' })
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({ example: 'uuid-da-unidade', required: false })
  @IsString()
  @IsOptional()
  unitId?: string;

  @ApiProperty({ example: 'uuid-do-inquilino' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2024-12-31', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ example: 2500.0 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  rentAmount: number;

  @ApiProperty({ example: 10, minimum: 1, maximum: 31 })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(31)
  dueDay: number;

  @ApiProperty({ enum: IndexType, example: IndexType.IPCA })
  @IsEnum(IndexType)
  @IsOptional()
  indexType?: IndexType;

  @ApiProperty({ enum: GuaranteeType, example: GuaranteeType.FIADOR })
  @IsEnum(GuaranteeType)
  @IsOptional()
  guaranteeType?: GuaranteeType;

  @ApiProperty({ example: 'Fiador: José Silva', required: false })
  @IsString()
  @IsOptional()
  guaranteeDetails?: string;

  @ApiProperty({ enum: ContractStatus, example: ContractStatus.ATIVO })
  @IsEnum(ContractStatus)
  @IsOptional()
  status?: ContractStatus;

  @ApiProperty({ example: 'Contrato com reajuste anual', required: false })
  @IsString()
  @IsOptional()
  observations?: string;
}
