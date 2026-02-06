import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  async create(createUnitDto: CreateUnitDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: createUnitDto.propertyId },
    });

    if (!property) {
      throw new NotFoundException('Imóvel não encontrado');
    }

    const existingUnit = await this.prisma.unit.findFirst({
      where: {
        propertyId: createUnitDto.propertyId,
        number: createUnitDto.number,
      },
    });

    if (existingUnit) {
      throw new ConflictException('Já existe uma unidade com este número neste imóvel');
    }

    return this.prisma.unit.create({
      data: createUnitDto,
      include: { property: true },
    });
  }

  async findAll(propertyId?: string) {
    const where: any = {};

    if (propertyId) {
      where.propertyId = propertyId;
    }

    return this.prisma.unit.findMany({
      where,
      include: {
        property: true,
        contracts: {
          where: { status: 'ATIVO' },
          include: { tenant: true },
        },
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
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      include: {
        property: true,
        contracts: {
          include: { tenant: true },
          orderBy: { createdAt: 'desc' },
        },
        maintenanceTickets: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!unit) {
      throw new NotFoundException('Unidade não encontrada');
    }

    return unit;
  }

  async update(id: string, updateUnitDto: UpdateUnitDto) {
    await this.findOne(id);

    if (updateUnitDto.number) {
      const unit = await this.prisma.unit.findUnique({ where: { id } });
      
      const existingUnit = await this.prisma.unit.findFirst({
        where: {
          propertyId: unit.propertyId,
          number: updateUnitDto.number,
          NOT: { id },
        },
      });

      if (existingUnit) {
        throw new ConflictException('Já existe uma unidade com este número neste imóvel');
      }
    }

    return this.prisma.unit.update({
      where: { id },
      data: updateUnitDto,
      include: { property: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.unit.delete({
      where: { id },
    });

    return { message: 'Unidade removida com sucesso' };
  }
}
