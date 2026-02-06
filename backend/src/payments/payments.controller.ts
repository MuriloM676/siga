import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { MarkAsPaidDto } from './dto/mark-as-paid.dto';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Criar novo pagamento' })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os pagamentos' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'contractId', required: false })
  findAll(
    @Query('status') status?: string,
    @Query('contractId') contractId?: string,
  ) {
    return this.paymentsService.findAll(status, contractId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pagamento por ID' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Atualizar pagamento' })
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Post(':id/mark-as-paid')
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Marcar pagamento como pago' })
  markAsPaid(@Param('id') id: string, @Body() markAsPaidDto: MarkAsPaidDto) {
    return this.paymentsService.markAsPaid(
      id,
      markAsPaidDto.paidAmount,
      markAsPaidDto.paidDate ? new Date(markAsPaidDto.paidDate) : undefined,
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Remover pagamento (apenas ADMIN)' })
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
