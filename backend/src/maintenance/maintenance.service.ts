import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async create(createMaintenanceDto: CreateMaintenanceDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: createMaintenanceDto.propertyId },
    });

    if (!property) {
      throw new NotFoundException('Imóvel não encontrado');
    }

    if (createMaintenanceDto.unitId) {
      const unit = await this.prisma.unit.findUnique({
        where: { id: createMaintenanceDto.unitId },
      });

      if (!unit) {
        throw new NotFoundException('Unidade não encontrada');
      }
    }

    return this.prisma.maintenanceTicket.create({
      data: createMaintenanceDto,
      include: {
        property: true,
        unit: true,
      },
    });
  }

  async findAll(propertyId?: string, status?: string) {
    const where: any = {};

    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (status) {
      where.status = status;
    }

    return this.prisma.maintenanceTicket.findMany({
      where,
      include: {
        property: true,
        unit: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const ticket = await this.prisma.maintenanceTicket.findUnique({
      where: { id },
      include: {
        property: true,
        unit: true,
        files: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Chamado não encontrado');
    }

    return ticket;
  }

  async update(id: string, updateMaintenanceDto: UpdateMaintenanceDto) {
    await this.findOne(id);

    return this.prisma.maintenanceTicket.update({
      where: { id },
      data: updateMaintenanceDto,
      include: {
        property: true,
        unit: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.maintenanceTicket.delete({
      where: { id },
    });

    return { message: 'Chamado removido com sucesso' };
  }
}
