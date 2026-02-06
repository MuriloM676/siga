import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { PdfGeneratorService } from './pdf-generator.service';

@ApiTags('contracts')
@ApiBearerAuth()
@Controller('contracts')
export class ContractsController {
  constructor(
    private readonly contractsService: ContractsService,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

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

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Gerar PDF do contrato' })
  async generatePDF(@Param('id') id: string, @Res() res: Response) {
    const contract = await this.contractsService.findOne(id);
    const pdfBuffer = await this.pdfGeneratorService.generateContractPDF(contract);
    
    const fileName = `Contrato_${contract.property.name.replace(/\s/g, '_')}_${contract.tenant.name.replace(/\s/g, '_')}.pdf`;
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': pdfBuffer.length,
    });
    
    res.send(pdfBuffer);
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
