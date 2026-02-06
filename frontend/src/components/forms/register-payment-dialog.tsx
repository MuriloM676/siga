'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

const registerPaymentSchema = z.object({
  paidAmount: z.string().min(1, 'Valor obrigatório'),
  paidDate: z.string().min(1, 'Data obrigatória'),
});

type RegisterPaymentFormData = z.infer<typeof registerPaymentSchema>;

interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  referenceMonth: string;
  contract: {
    property: { name: string };
    tenant: { name: string };
  };
}

interface RegisterPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  payment: Payment | null;
}

export function RegisterPaymentDialog({
  open,
  onOpenChange,
  onSuccess,
  payment,
}: RegisterPaymentDialogProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterPaymentFormData>({
    resolver: zodResolver(registerPaymentSchema),
    defaultValues: {
      paidAmount: payment?.amount.toString() || '',
      paidDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: RegisterPaymentFormData) => {
    if (!payment) return;

    setLoading(true);
    try {
      await api.post(`/payments/${payment.id}/mark-as-paid`, {
        paidAmount: parseFloat(data.paidAmount),
        paidDate: data.paidDate,
      });
      alert('Pagamento registrado com sucesso!');
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      alert('Erro ao registrar pagamento: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!payment) return null;

  const referenceDate = new Date(payment.referenceMonth);
  const monthName = referenceDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
          <DialogDescription>
            Registre o recebimento do pagamento de aluguel.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2 bg-muted p-4 rounded-md">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Imóvel:</span>
              <span className="text-sm">{payment.contract.property.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Inquilino:</span>
              <span className="text-sm">{payment.contract.tenant.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Referência:</span>
              <span className="text-sm capitalize">{monthName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Valor devido:</span>
              <span className="text-sm font-bold">
                R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="paidAmount">Valor Pago *</Label>
            <Input
              id="paidAmount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('paidAmount')}
            />
            {errors.paidAmount && (
              <p className="text-sm text-red-500 mt-1">{errors.paidAmount.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="paidDate">Data do Pagamento *</Label>
            <Input
              id="paidDate"
              type="date"
              {...register('paidDate')}
            />
            {errors.paidDate && (
              <p className="text-sm text-red-500 mt-1">{errors.paidDate.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar Pagamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
