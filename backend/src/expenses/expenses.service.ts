import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(createExpenseDto: CreateExpenseDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: createExpenseDto.propertyId },
    });

    if (!property) {
      throw new NotFoundException('Imóvel não encontrado');
    }

    return this.prisma.expense.create({
      data: createExpenseDto,
      include: {
        property: true,
      },
    });
  }

  async findAll(propertyId?: string, type?: string, isPaid?: boolean) {
    const where: any = {};

    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (type) {
      where.type = type;
    }

    if (isPaid !== undefined) {
      where.isPaid = isPaid === true;
    }

    return this.prisma.expense.findMany({
      where,
      include: {
        property: true,
      },
      orderBy: { dueDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: {
        property: true,
        files: true,
      },
    });

    if (!expense) {
      throw new NotFoundException('Despesa não encontrada');
    }

    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    await this.findOne(id);

    return this.prisma.expense.update({
      where: { id },
      data: updateExpenseDto,
      include: {
        property: true,
      },
    });
  }

  async markAsPaid(id: string, paidDate?: Date) {
    await this.findOne(id);

    return this.prisma.expense.update({
      where: { id },
      data: {
        isPaid: true,
        paidDate: paidDate || new Date(),
      },
      include: {
        property: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.expense.delete({
      where: { id },
    });

    return { message: 'Despesa removida com sucesso' };
  }
}
