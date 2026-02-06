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
import { PaymentStatus } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({ example: 'uuid-do-contrato' })
  @IsString()
  @IsNotEmpty()
  contractId: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  @IsNotEmpty()
  referenceMonth: string;

  @ApiProperty({ example: '2024-01-10' })
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @ApiProperty({ example: 2500.0 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PENDENTE })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @ApiProperty({ example: '2024-01-09', required: false })
  @IsDateString()
  @IsOptional()
  paidDate?: string;

  @ApiProperty({ example: 2500.0, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  paidAmount?: number;

  @ApiProperty({ example: 50.0, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  lateFee?: number;

  @ApiProperty({ example: 25.0, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  interest?: number;

  @ApiProperty({ example: 100.0, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  discount?: number;

  @ApiProperty({ example: 'Pagamento realizado via PIX', required: false })
  @IsString()
  @IsOptional()
  observations?: string;
}
