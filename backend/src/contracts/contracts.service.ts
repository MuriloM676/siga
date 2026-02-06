import { Injectable, NotFoundException } from '@nestjs/common';
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

    return contract;
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

    await this.prisma.contract.delete({
      where: { id },
    });

    return { message: 'Contrato removido com sucesso' };
  }
}
