'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import api from '@/lib/api';

const maintenanceSchema = z.object({
  propertyId: z.string().min(1, 'Selecione um imóvel'),
  unitId: z.string().optional(),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  priority: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']),
  scheduledDate: z.string().optional(),
  estimatedCost: z.string().optional(),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

interface Property {
  id: string;
  name: string;
  hasUnits: boolean;
}

interface Unit {
  id: string;
  identifier: string;
}

interface MaintenanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function MaintenanceFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: MaintenanceFormDialogProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      priority: 'MEDIA',
    },
  });

  const propertyId = watch('propertyId');

  useEffect(() => {
    if (open) {
      loadProperties();
    }
  }, [open]);

  useEffect(() => {
    if (propertyId) {
      const property = properties.find((p) => p.id === propertyId);
      setSelectedProperty(property || null);
      
      if (property?.hasUnits) {
        loadUnits(propertyId);
      } else {
        setUnits([]);
        setValue('unitId', undefined);
      }
    }
  }, [propertyId, properties]);

  const loadProperties = async () => {
    try {
      const response = await api.get('/properties');
      setProperties(response.data);
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error);
    }
  };

  const loadUnits = async (propertyId: string) => {
    try {
      const response = await api.get(`/properties/${propertyId}/units`);
      setUnits(response.data);
    } catch (error) {
      console.error('Erro ao carregar unidades:', error);
      setUnits([]);
    }
  };

  const onSubmit = async (data: MaintenanceFormData) => {
    setLoading(true);
    try {
      const payload: any = {
        propertyId: data.propertyId,
        description: data.description,
        priority: data.priority,
      };

      if (data.unitId) {
        payload.unitId = data.unitId;
      }

      if (data.scheduledDate) {
        payload.scheduledDate = new Date(data.scheduledDate).toISOString();
      }

      if (data.estimatedCost) {
        payload.estimatedCost = parseFloat(data.estimatedCost);
      }

      await api.post('/maintenance', payload);
      alert('Chamado criado com sucesso!');
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      alert('Erro ao criar chamado: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Chamado de Manutenção</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Property Select */}
          <div className="space-y-2">
            <Label htmlFor="propertyId">Imóvel *</Label>
            <Select
              value={watch('propertyId')}
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
              <p className="text-sm text-red-500">{errors.propertyId.message}</p>
            )}
          </div>

          {/* Unit Select (conditional) */}
          {selectedProperty?.hasUnits && (
            <div className="space-y-2">
              <Label htmlFor="unitId">Unidade</Label>
              <Select
                value={watch('unitId')}
                onValueChange={(value) => setValue('unitId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.identifier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição do Problema *</Label>
            <textarea
              id="description"
              {...register('description')}
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Descreva detalhadamente o problema..."
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridade *</Label>
            <Select
              value={watch('priority')}
              onValueChange={(value) => setValue('priority', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BAIXA">Baixa</SelectItem>
                <SelectItem value="MEDIA">Média</SelectItem>
                <SelectItem value="ALTA">Alta</SelectItem>
                <SelectItem value="URGENTE">Urgente</SelectItem>
              </SelectContent>
            </Select>
            {errors.priority && (
              <p className="text-sm text-red-500">{errors.priority.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Scheduled Date */}
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Data Agendada</Label>
              <Input
                id="scheduledDate"
                type="date"
                {...register('scheduledDate')}
              />
            </div>

            {/* Estimated Cost */}
            <div className="space-y-2">
              <Label htmlFor="estimatedCost">Custo Estimado (R$)</Label>
              <Input
                id="estimatedCost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('estimatedCost')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Chamado'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
