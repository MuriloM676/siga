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
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('contracts')
@ApiBearerAuth()
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Criar novo contrato' })
  create(@Body() createContractDto: CreateContractDto) {
    return this.contractsService.create(createContractDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os contratos' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'propertyId', required: false })
  findAll(
    @Query('status') status?: string,
    @Query('propertyId') propertyId?: string,
  ) {
    return this.contractsService.findAll(status, propertyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar contrato por ID' })
  findOne(@Param('id') id: string) {
    return this.contractsService.findOne(id);
  }

  @Post(':id/generate-payments')
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Gerar pagamentos para um contrato existente' })
  async generatePayments(@Param('id') id: string) {
    const contract = await this.contractsService.findOne(id);
    const result = await this.contractsService.generatePaymentsForContract(contract);
    return result;
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.GESTOR)
  @ApiOperation({ summary: 'Atualizar contrato' })
  update(@Param('id') id: string, @Body() updateContractDto: UpdateContractDto) {
    return this.contractsService.update(id, updateContractDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Remover contrato (apenas ADMIN)' })
  remove(@Param('id') id: string) {
    return this.contractsService.remove(id);
  }
}
