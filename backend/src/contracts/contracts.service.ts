import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  async create(createContractDto: CreateContractDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: createContractDto.propertyId },
    });

    if (!property) {
      throw new NotFoundException('Imóvel não encontrado');
    }

    if (createContractDto.unitId) {
      const unit = await this.prisma.unit.findUnique({
        where: { id: createContractDto.unitId },
      });

      if (!unit) {
        throw new NotFoundException('Unidade não encontrada');
      }
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: createContractDto.tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Inquilino não encontrado');
    }

    const contract = await this.prisma.contract.create({
      data: createContractDto,
      include: {
        property: true,
        unit: true,
        tenant: true,
      },
    });

    // Generate initial payments for the contract
    try {
      await this.generatePaymentsForContract(contract);
    } catch (error) {
      console.error('Erro ao gerar pagamentos:', error);
      // Don't fail contract creation if payment generation fails
    }

    return contract;
  }

  async generatePaymentsForContract(contract: any) {
    // Check if payments already exist for this contract
    const existingPayments = await this.prisma.payment.count({
      where: { contractId: contract.id },
    });

    if (existingPayments > 0) {
      console.log(`Contract ${contract.id} already has ${existingPayments} payments`);
      return { message: `Contrato já possui ${existingPayments} pagamentos`, count: existingPayments };
    }

    const startDate = new Date(contract.startDate);
    const endDate = contract.endDate ? new Date(contract.endDate) : null;
    const paymentsToGenerate: any[] = [];

    // Determine how many months to generate (max 12 or until end date)
    const maxMonths = 12;
    
    for (let i = 0; i < maxMonths; i++) {
      // Calculate the reference month
      const referenceDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      
      // Stop if we've passed the end date
      if (endDate) {
        const refMonthEnd = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
        if (refMonthEnd > endDate) {
          break;
        }
      }

      // Calculate due date for this month
      const dueDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), contract.dueDay);
      
      // If dueDay doesn't exist in this month (e.g., Feb 31), set to last day of month
      if (dueDate.getMonth() !== referenceDate.getMonth()) {
        dueDate.setDate(0); // Go back to last day of previous month
        dueDate.setMonth(referenceDate.getMonth() + 1); // Then move to end of current month
        dueDate.setDate(0);
      }

      paymentsToGenerate.push({
        contractId: contract.id,
        referenceMonth: referenceDate.toISOString(), // First day of the month as DateTime
        dueDate: dueDate.toISOString(),
        amount: contract.rentAmount,
        status: 'PENDENTE',
      });
    }

    console.log(`Generating ${paymentsToGenerate.length} payments for contract ${contract.id}`);

    // Create all payments in bulk
    if (paymentsToGenerate.length > 0) {
      await this.prisma.payment.createMany({
        data: paymentsToGenerate,
      });
      console.log(`Successfully created ${paymentsToGenerate.length} payments`);
      return { message: `${paymentsToGenerate.length} pagamentos gerados com sucesso`, count: paymentsToGenerate.length };
    }
    
    return { message: 'Nenhum pagamento foi gerado', count: 0 };
  }

  async findAll(status?: string, propertyId?: string) {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (propertyId) {
      where.propertyId = propertyId;
    }

    return this.prisma.contract.findMany({
      where,
      include: {
        property: true,
        unit: true,
        tenant: true,
        _count: {
          select: {
            payments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        property: true,
        unit: true,
        tenant: true,
        payments: {
          orderBy: { referenceMonth: 'desc' },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException('Contrato não encontrado');
    }

    return contract;
  }

  async update(id: string, updateContractDto: UpdateContractDto) {
    await this.findOne(id);

    return this.prisma.contract.update({
      where: { id },
      data: updateContractDto,
      include: {
        property: true,
        unit: true,
        tenant: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Check if there are payments associated and inform user
    const paymentsCount = await this.prisma.payment.count({
      where: { contractId: id },
    });

    // Payments have onDelete: Cascade, so they will be deleted automatically
    // This is just for logging/tracking purposes
    if (paymentsCount > 0) {
      console.log(`Deleting contract ${id} will also delete ${paymentsCount} payment(s)`);
    }

    await this.prisma.contract.delete({
      where: { id },
    });

    return { 
      message: 'Contrato removido com sucesso',
      deletedPayments: paymentsCount
    };
  }
}
