'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

const expenseSchema = z.object({
  propertyId: z.string().min(1, 'Imóvel é obrigatório'),
  type: z.enum(['IPTU', 'CONDOMINIO', 'MANUTENCAO', 'SEGURO', 'TAXA_IMOBILIARIA', 'AGUA', 'LUZ', 'GAS', 'OUTROS']),
  description: z.string().min(3, 'Descrição deve ter pelo menos 3 caracteres'),
  amount: z.preprocess(
    (val) => Number(val),
    z.number().positive('Valor deve ser maior que zero')
  ),
  dueDate: z.string().min(1, 'Data de vencimento é obrigatória'),
  paidDate: z.string().optional(),
  isPaid: z.boolean().default(false),
  referenceMonth: z.string().min(1, 'Mês de referência é obrigatório'),
  observations: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface Property {
  id: string;
  name: string;
  type: string;
}

interface Expense {
  id: string;
  propertyId: string;
  type: string;
  description: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  isPaid: boolean;
  referenceMonth: string;
  observations?: string;
  property?: Property;
}

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  expense?: Expense | null;
}

export function ExpenseFormDialog({
  open,
  onOpenChange,
  onSuccess,
  expense,
}: ExpenseFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const isEditing = !!expense;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      isPaid: false,
    },
  });

  const selectedPropertyId = watch('propertyId');
  const selectedType = watch('type');
  const isPaidValue = watch('isPaid');

  useEffect(() => {
    if (open) {
      loadProperties();
    }
  }, [open]);

  useEffect(() => {
    if (expense && open) {
      setValue('propertyId', expense.propertyId);
      setValue('type', expense.type as any);
      setValue('description', expense.description);
      setValue('amount', expense.amount);
      setValue('dueDate', expense.dueDate.split('T')[0]);
      setValue('paidDate', expense.paidDate ? expense.paidDate.split('T')[0] : '');
      setValue('isPaid', expense.isPaid);
      setValue('referenceMonth', expense.referenceMonth.split('T')[0]);
      setValue('observations', expense.observations || '');
    } else if (!open) {
      reset({
        isPaid: false,
      });
    }
  }, [expense, open, setValue, reset]);

  const loadProperties = async () => {
    setLoadingProperties(true);
    try {
      const response = await api.get('/properties');
      setProperties(response.data);
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error);
      alert('Erro ao carregar lista de imóveis');
    } finally {
      setLoadingProperties(false);
    }
  };

  const onSubmit = async (data: ExpenseFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        paidDate: data.isPaid && data.paidDate ? data.paidDate : null,
      };

      if (isEditing) {
        await api.patch(`/expenses/${expense.id}`, payload);
        alert('Despesa atualizada com sucesso!');
      } else {
        await api.post('/expenses', payload);
        alert('Despesa cadastrada com sucesso!');
      }
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      alert(`Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} despesa: ` + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const expenseTypeLabels: Record<string, string> = {
    IPTU: 'IPTU',
    CONDOMINIO: 'Condomínio',
    MANUTENCAO: 'Manutenção',
    SEGURO: 'Seguro',
    TAXA_IMOBILIARIA: 'Taxa Imobiliária',
    AGUA: 'Água',
    LUZ: 'Luz',
    GAS: 'Gás',
    OUTROS: 'Outros',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize os dados da despesa.' : 'Preencha os dados da despesa que deseja cadastrar.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="propertyId">Imóvel *</Label>
              <Select
                value={selectedPropertyId}
                onValueChange={(value) => setValue('propertyId', value)}
                disabled={loadingProperties}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingProperties ? "Carregando..." : "Selecione o imóvel"} />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name} ({property.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.propertyId && (
                <p className="text-sm text-red-500 mt-1">{errors.propertyId.message}</p>
              )}
            </div>

            <div className="col-span-2">
              <Label htmlFor="type">Tipo de Despesa *</Label>
              <Select
                value={selectedType}
                onValueChange={(value) => setValue('type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(expenseTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
              )}
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                placeholder="Ex: IPTU Janeiro/2026"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="Ex: 1500.00"
                {...register('amount')}
              />
              {errors.amount && (
                <p className="text-sm text-red-500 mt-1">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="referenceMonth">Mês de Referência *</Label>
              <Input
                id="referenceMonth"
                type="date"
                {...register('referenceMonth')}
              />
              {errors.referenceMonth && (
                <p className="text-sm text-red-500 mt-1">{errors.referenceMonth.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="dueDate">Data de Vencimento *</Label>
              <Input
                id="dueDate"
                type="date"
                {...register('dueDate')}
              />
              {errors.dueDate && (
                <p className="text-sm text-red-500 mt-1">{errors.dueDate.message}</p>
              )}
            </div>

            <div className="col-span-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPaid"
                  {...register('isPaid')}
                  className="h-4 w-4"
                />
                <Label htmlFor="isPaid" className="cursor-pointer">
                  Despesa paga
                </Label>
              </div>
            </div>

            {isPaidValue && (
              <div className="col-span-2">
                <Label htmlFor="paidDate">Data do Pagamento</Label>
                <Input
                  id="paidDate"
                  type="date"
                  {...register('paidDate')}
                />
              </div>
            )}

            <div className="col-span-2">
              <Label htmlFor="observations">Observações</Label>
              <textarea
                id="observations"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Observações adicionais..."
                {...register('observations')}
              />
            </div>
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
              {loading ? (isEditing ? 'Atualizando...' : 'Cadastrando...') : (isEditing ? 'Atualizar' : 'Cadastrar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
