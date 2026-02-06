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

const contractSchema = z.object({
  propertyId: z.string().min(1, 'Selecione um imóvel'),
  unitId: z.string().optional(),
  tenantId: z.string().min(1, 'Selecione um inquilino'),
  startDate: z.string().min(1, 'Data de início obrigatória'),
  endDate: z.string().optional(),
  rentAmount: z.string().min(1, 'Valor do aluguel obrigatório'),
  dueDay: z.string().min(1, 'Dia de vencimento obrigatório'),
  depositAmount: z.string().optional(),
  guaranteeType: z.enum(['NENHUMA', 'FIADOR', 'SEGURO_FIANCA', 'DEPOSITO_CAUCAO', 'TITULO_CAPITALIZACAO']),
  indexType: z.enum(['NENHUM', 'IGPM', 'IPCA', 'INPC', 'IPC']),
  observations: z.string().optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

interface ContractFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Property {
  id: string;
  name: string;
  hasUnits: boolean;
  units?: Unit[];
}

interface Unit {
  id: string;
  identifier: string;
}

interface Tenant {
  id: string;
  name: string;
  cpf: string;
}

export function ContractFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: ContractFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      guaranteeType: 'NENHUMA',
      indexType: 'IGPM',
    },
  });

  const propertyId = watch('propertyId');
  const guaranteeType = watch('guaranteeType');
  const indexType = watch('indexType');

  useEffect(() => {
    if (open) {
      loadProperties();
      loadTenants();
    }
  }, [open]);

  useEffect(() => {
    const property = properties.find(p => p.id === propertyId);
    setSelectedProperty(property || null);
    if (!property?.hasUnits) {
      setValue('unitId', undefined);
    }
  }, [propertyId, properties, setValue]);

  const loadProperties = async () => {
    try {
      const response = await api.get('/properties');
      setProperties(response.data);
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error);
    }
  };

  const loadTenants = async () => {
    try {
      const response = await api.get('/tenants');
      setTenants(response.data);
    } catch (error) {
      console.error('Erro ao carregar inquilinos:', error);
    }
  };

  const onSubmit = async (data: ContractFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        rentAmount: parseFloat(data.rentAmount),
        dueDay: parseInt(data.dueDay),
        depositAmount: data.depositAmount ? parseFloat(data.depositAmount) : undefined,
        unitId: data.unitId || undefined,
      };
      await api.post('/contracts', payload);
      alert('Contrato cadastrado com sucesso!');
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      alert('Erro ao cadastrar contrato: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Contrato</DialogTitle>
          <DialogDescription>
            Preencha os dados do contrato de locação.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="propertyId">Imóvel *</Label>
              <Select
                value={propertyId}
                onValueChange={(value) => setValue('propertyId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o imóvel" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.propertyId && (
                <p className="text-sm text-red-500 mt-1">{errors.propertyId.message}</p>
              )}
            </div>

            {selectedProperty?.hasUnits && selectedProperty.units && selectedProperty.units.length > 0 && (
              <div className="col-span-2">
                <Label htmlFor="unitId">Unidade</Label>
                <Select
                  value={watch('unitId')}
                  onValueChange={(value) => setValue('unitId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProperty.units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.identifier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="col-span-2">
              <Label htmlFor="tenantId">Inquilino *</Label>
              <Select
                value={watch('tenantId')}
                onValueChange={(value) => setValue('tenantId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o inquilino" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name} - {tenant.cpf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tenantId && (
                <p className="text-sm text-red-500 mt-1">{errors.tenantId.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="startDate">Data de Início *</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500 mt-1">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="endDate">Data de Término</Label>
              <Input
                id="endDate"
                type="date"
                {...register('endDate')}
              />
            </div>

            <div>
              <Label htmlFor="rentAmount">Valor do Aluguel (R$) *</Label>
              <Input
                id="rentAmount"
                type="number"
                step="0.01"
                placeholder="1500.00"
                {...register('rentAmount')}
              />
              {errors.rentAmount && (
                <p className="text-sm text-red-500 mt-1">{errors.rentAmount.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="dueDay">Dia de Vencimento *</Label>
              <Input
                id="dueDay"
                type="number"
                min="1"
                max="31"
                placeholder="10"
                {...register('dueDay')}
              />
              {errors.dueDay && (
                <p className="text-sm text-red-500 mt-1">{errors.dueDay.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="depositAmount">Valor do Depósito (R$)</Label>
              <Input
                id="depositAmount"
                type="number"
                step="0.01"
                placeholder="1500.00"
                {...register('depositAmount')}
              />
            </div>

            <div>
              <Label htmlFor="guaranteeType">Tipo de Garantia *</Label>
              <Select
                value={guaranteeType}
                onValueChange={(value) => setValue('guaranteeType', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NENHUMA">Nenhuma</SelectItem>
                  <SelectItem value="FIADOR">Fiador</SelectItem>
                  <SelectItem value="SEGURO_FIANCA">Seguro Fiança</SelectItem>
                  <SelectItem value="DEPOSITO_CAUCAO">Depósito Caução</SelectItem>
                  <SelectItem value="TITULO_CAPITALIZACAO">Título de Capitalização</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="indexType">Índice de Reajuste *</Label>
              <Select
                value={indexType}
                onValueChange={(value) => setValue('indexType', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o índice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NENHUM">Nenhum</SelectItem>
                  <SelectItem value="IGPM">IGP-M</SelectItem>
                  <SelectItem value="IPCA">IPCA</SelectItem>
                  <SelectItem value="INPC">INPC</SelectItem>
                  <SelectItem value="IPC">IPC</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
