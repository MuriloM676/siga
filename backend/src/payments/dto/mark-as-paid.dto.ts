import { IsNotEmpty, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkAsPaidDto {
  @ApiProperty({ example: 2500.0 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  paidAmount: number;

  @ApiProperty({ example: '2024-01-09', required: false })
  @IsDateString()
  @IsOptional()
  paidDate?: string;
}
