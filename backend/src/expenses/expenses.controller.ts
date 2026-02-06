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
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('expenses')
@ApiBearerAuth()
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Criar nova despesa' })
  create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expensesService.create(createExpenseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as despesas' })
  @ApiQuery({ name: 'propertyId', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'isPaid', required: false, type: Boolean })
  findAll(
    @Query('propertyId') propertyId?: string,
    @Query('type') type?: string,
    @Query('isPaid') isPaid?: string,
  ) {
    return this.expensesService.findAll(
      propertyId,
      type,
      isPaid === 'true' ? true : isPaid === 'false' ? false : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar despesa por ID' })
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Atualizar despesa' })
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Post(':id/mark-as-paid')
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Marcar despesa como paga' })
  markAsPaid(@Param('id') id: string) {
    return this.expensesService.markAsPaid(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Remover despesa (apenas ADMIN)' })
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
