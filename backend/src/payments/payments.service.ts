import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: createPaymentDto.contractId },
    });

    if (!contract) {
      throw new NotFoundException('Contrato não encontrado');
    }

    return this.prisma.payment.create({
      data: createPaymentDto,
      include: {
        contract: {
          include: {
            property: true,
            unit: true,
            tenant: true,
          },
        },
      },
    });
  }

  async findAll(status?: string, contractId?: string) {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (contractId) {
      where.contractId = contractId;
    }

    const payments = await this.prisma.payment.findMany({
      where,
      include: {
        contract: {
          include: {
            property: true,
            unit: true,
            tenant: true,
          },
        },
      },
      orderBy: { referenceMonth: 'desc' },
    });

    // Atualizar status automaticamente baseado em datas
    for (const payment of payments) {
      if (payment.status === PaymentStatus.PENDENTE) {
        const now = new Date();
        const dueDate = new Date(payment.dueDate);
        
        if (dueDate < now) {
          await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.ATRASADO },
          });
          payment.status = PaymentStatus.ATRASADO;
        }
      }
    }

    return payments;
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        contract: {
          include: {
            property: true,
            unit: true,
            tenant: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    await this.findOne(id);

    return this.prisma.payment.update({
      where: { id },
      data: updatePaymentDto,
      include: {
        contract: {
          include: {
            property: true,
            unit: true,
            tenant: true,
          },
        },
      },
    });
  }

  async markAsPaid(id: string, paidAmount: number, paidDate?: Date) {
    const payment = await this.findOne(id);

    const data: any = {
      status: PaymentStatus.PAGO,
      paidAmount,
      paidDate: paidDate || new Date(),
    };

    // Calcular juros e multa se pago em atraso
    const dueDate = new Date(payment.dueDate);
    const actualPaidDate = paidDate || new Date();

    if (actualPaidDate > dueDate) {
      const daysLate = Math.floor(
        (actualPaidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      
      // Multa de 2% + 0.033% ao dia (exemplo)
      const lateFee = payment.amount * 0.02;
      const interest = payment.amount * 0.00033 * daysLate;
      
      data.lateFee = lateFee;
      data.interest = interest;
    }

    return this.prisma.payment.update({
      where: { id },
      data,
      include: {
        contract: {
          include: {
            property: true,
            tenant: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.payment.delete({
      where: { id },
    });

    return { message: 'Pagamento removido com sucesso' };
  }
}
