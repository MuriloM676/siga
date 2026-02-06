'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Payment {
  id: string;
  dueDate: string;
  paidDate?: string;
  amount: number;
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO';
  lateAmount?: number;
  interestAmount?: number;
  totalAmount?: number;
  contract: {
    property: { name: string };
    tenant: { name: string };
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PENDENTE' | 'PAGO' | 'ATRASADO'>('all');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const response = await api.get('/payments');
      setPayments(response.data);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (id: string) => {
    if (!confirm('Confirma o recebimento deste pagamento?')) return;
    
    try {
      await api.post(`/payments/${id}/mark-as-paid`);
      alert('Pagamento marcado como pago com sucesso!');
      loadPayments();
    } catch (error: any) {
      alert('Erro ao marcar pagamento: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter(p => p.status === filter);

  const stats = {
    total: payments.length,
    pago: payments.filter(p => p.status === 'PAGO').length,
    pendente: payments.filter(p => p.status === 'PENDENTE').length,
    atrasado: payments.filter(p => p.status === 'ATRASADO').length,
    totalReceived: payments.filter(p => p.status === 'PAGO').reduce((sum, p) => sum + (p.totalAmount || p.amount), 0),
    totalPending: payments.filter(p => p.status !== 'PAGO').reduce((sum, p) => sum + (p.totalAmount || p.amount), 0),
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Pagamentos</h1>
        <p className="text-muted-foreground">Gerenciar pagamentos de aluguéis</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalReceived)}
            </div>
            <p className="text-xs text-muted-foreground">{stats.pago} pagamentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(stats.totalPending)}
            </div>
            <p className="text-xs text-muted-foreground">{stats.pendente + stats.atrasado} pagamentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendente}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.atrasado}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todos ({stats.total})
        </Button>
        <Button 
          variant={filter === 'PAGO' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('PAGO')}
        >
          Pagos ({stats.pago})
        </Button>
        <Button 
          variant={filter === 'PENDENTE' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('PENDENTE')}
        >
          Pendentes ({stats.pendente})
        </Button>
        <Button 
          variant={filter === 'ATRASADO' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('ATRASADO')}
        >
          Atrasados ({stats.atrasado})
        </Button>
      </div>

      {/* Payments List */}
      <div className="space-y-3">
        {filteredPayments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum pagamento encontrado.
            </CardContent>
          </Card>
        ) : (
          filteredPayments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{payment.contract.property.name}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          payment.status === 'PAGO'
                            ? 'bg-green-100 text-green-700'
                            : payment.status === 'ATRASADO'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Inquilino: {payment.contract.tenant.name}
                    </p>
                    <div className="flex gap-4 text-sm">
                      <span>
                        Vencimento: <strong>{formatDate(payment.dueDate)}</strong>
                      </span>
                      {payment.paidDate && (
                        <span>
                          Pago em: <strong>{formatDate(payment.paidDate)}</strong>
                        </span>
                      )}
                    </div>
                    {payment.lateAmount && payment.lateAmount > 0 && (
                      <div className="text-sm text-red-600">
                        Multa: {formatCurrency(payment.lateAmount)} | 
                        Juros: {formatCurrency(payment.interestAmount || 0)}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {formatCurrency(payment.totalAmount || payment.amount)}
                    </div>
                    {payment.status !== 'PAGO' && (
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => markAsPaid(payment.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Marcar como Pago
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
