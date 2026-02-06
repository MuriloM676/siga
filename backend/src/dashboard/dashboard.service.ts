import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, ContractStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Total de imóveis
    const totalProperties = await this.prisma.property.count();

    // Total de contratos ativos
    const activeContracts = await this.prisma.contract.count({
      where: { status: ContractStatus.ATIVO },
    });

    // Total de inquilinos
    const totalTenants = await this.prisma.tenant.count();

    // Pagamentos do mês
    const paymentsThisMonth = await this.prisma.payment.findMany({
      where: {
        referenceMonth: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });

    const totalReceived = paymentsThisMonth
      .filter((p) => p.status === PaymentStatus.PAGO)
      .reduce((sum, p) => sum + (p.paidAmount || 0), 0);

    const totalPending = paymentsThisMonth
      .filter((p) => p.status === PaymentStatus.PENDENTE)
      .reduce((sum, p) => sum + p.amount, 0);

    const totalOverdue = paymentsThisMonth
      .filter((p) => p.status === PaymentStatus.ATRASADO)
      .reduce((sum, p) => sum + p.amount, 0);

    const totalExpected = paymentsThisMonth.reduce((sum, p) => sum + p.amount, 0);

    // Despesas do mês
    const expensesThisMonth = await this.prisma.expense.findMany({
      where: {
        referenceMonth: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });

    const totalExpenses = expensesThisMonth.reduce((sum, e) => sum + e.amount, 0);

    const paidExpenses = expensesThisMonth
      .filter((e) => e.isPaid)
      .reduce((sum, e) => sum + e.amount, 0);

    const pendingExpenses = expensesThisMonth
      .filter((e) => !e.isPaid)
      .reduce((sum, e) => sum + e.amount, 0);

    // Lucro líquido (recebido - despesas pagas)
    const netProfit = totalReceived - paidExpenses;

    // Chamados de manutenção abertos
    const openMaintenanceTickets = await this.prisma.maintenanceTicket.count({
      where: {
        status: { in: ['ABERTO', 'EM_ANDAMENTO'] },
      },
    });

    return {
      properties: {
        total: totalProperties,
      },
      contracts: {
        active: activeContracts,
      },
      tenants: {
        total: totalTenants,
      },
      payments: {
        expected: totalExpected,
        received: totalReceived,
        pending: totalPending,
        overdue: totalOverdue,
        receivedPercentage: totalExpected > 0 ? (totalReceived / totalExpected) * 100 : 0,
      },
      expenses: {
        total: totalExpenses,
        paid: paidExpenses,
        pending: pendingExpenses,
      },
      netProfit,
      maintenance: {
        openTickets: openMaintenanceTickets,
      },
      period: {
        start: firstDayOfMonth,
        end: lastDayOfMonth,
      },
    };
  }

  async getRecentActivity() {
    const recentPayments = await this.prisma.payment.findMany({
      where: { status: PaymentStatus.PAGO },
      take: 10,
      orderBy: { paidDate: 'desc' },
      include: {
        contract: {
          include: {
            property: true,
            tenant: true,
          },
        },
      },
    });

    const recentExpenses = await this.prisma.expense.findMany({
      where: { isPaid: true },
      take: 10,
      orderBy: { paidDate: 'desc' },
      include: {
        property: true,
      },
    });

    const recentMaintenance = await this.prisma.maintenanceTicket.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        property: true,
        unit: true,
      },
    });

    return {
      recentPayments,
      recentExpenses,
      recentMaintenance,
    };
  }
}
