import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExpenseType } from '@prisma/client';

export class CreateExpenseDto {
  @ApiProperty({ example: 'uuid-do-imovel' })
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({ enum: ExpenseType, example: ExpenseType.IPTU })
  @IsEnum(ExpenseType)
  @IsNotEmpty()
  type: ExpenseType;

  @ApiProperty({ example: 'IPTU 2024' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 1500.0 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @ApiProperty({ example: '2024-03-15' })
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @ApiProperty({ example: '2024-03-10', required: false })
  @IsDateString()
  @IsOptional()
  paidDate?: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @ApiProperty({ example: '2024-03-01' })
  @IsDateString()
  @IsNotEmpty()
  referenceMonth: string;

  @ApiProperty({ example: 'Pagamento da primeira parcela', required: false })
  @IsString()
  @IsOptional()
  observations?: string;
}
