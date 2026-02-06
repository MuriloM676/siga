import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { cpf: createTenantDto.cpf },
    });

    if (existingTenant) {
      throw new ConflictException('CPF já cadastrado');
    }

    return this.prisma.tenant.create({
      data: createTenantDto,
    });
  }

  async findAll(search?: string) {
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.tenant.findMany({
      where,
      include: {
        _count: {
          select: {
            contracts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        contracts: {
          include: {
            property: true,
            unit: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Inquilino não encontrado');
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    await this.findOne(id);

    if (updateTenantDto.cpf) {
      const existingTenant = await this.prisma.tenant.findUnique({
        where: { cpf: updateTenantDto.cpf },
      });

      if (existingTenant && existingTenant.id !== id) {
        throw new ConflictException('CPF já cadastrado');
      }
    }

    return this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Verificar se há contratos associados
    const contractsCount = await this.prisma.contract.count({
      where: { tenantId: id },
    });

    if (contractsCount > 0) {
      throw new ConflictException(
        `Não é possível excluir este inquilino pois existem ${contractsCount} contrato(s) associado(s). Exclua os contratos primeiro.`
      );
    }

    await this.prisma.tenant.delete({
      where: { id },
    });

    return { message: 'Inquilino removido com sucesso' };
  }
}
