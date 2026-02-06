import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async create(createPropertyDto: CreatePropertyDto) {
    return this.prisma.property.create({
      data: createPropertyDto,
      include: {
        units: true,
      },
    });
  }

  async findAll(city?: string, state?: string, type?: string) {
    const where: any = {};

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (state) {
      where.state = { contains: state, mode: 'insensitive' };
    }

    if (type) {
      where.type = type;
    }

    return this.prisma.property.findMany({
      where,
      include: {
        units: true,
        _count: {
          select: {
            contracts: true,
            expenses: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        units: {
          include: {
            contracts: {
              where: { status: 'ATIVO' },
              include: { tenant: true },
            },
          },
        },
        contracts: {
          include: { tenant: true },
          orderBy: { createdAt: 'desc' },
        },
        expenses: {
          orderBy: { dueDate: 'desc' },
        },
        maintenanceTickets: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Imóvel não encontrado');
    }

    return property;
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto) {
    await this.findOne(id);

    return this.prisma.property.update({
      where: { id },
      data: updatePropertyDto,
      include: {
        units: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.property.delete({
      where: { id },
    });

    return { message: 'Imóvel removido com sucesso' };
  }
}
