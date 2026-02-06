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

const unitSchema = z.object({
  number: z.string().min(1, 'Número da unidade é obrigatório'),
  floor: z.string().optional(),
  area: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().positive('Área deve ser maior que zero').optional()
  ),
  bedrooms: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().int().min(0, 'Quartos deve ser maior ou igual a zero').optional()
  ),
  bathrooms: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().int().min(0, 'Banheiros deve ser maior ou igual a zero').optional()
  ),
  parkingSpots: z.preprocess(
    (val) => (val === '' ? 0 : Number(val)),
    z.number().int().min(0, 'Vagas deve ser maior ou igual a zero').default(0)
  ),
  observations: z.string().optional(),
  propertyId: z.string().min(1, 'Imóvel é obrigatório'),
});

type UnitFormData = z.infer<typeof unitSchema>;

interface Property {
  id: string;
  name: string;
  type: string;
}

interface Unit {
  id: string;
  number: string;
  floor?: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpots: number;
  observations?: string;
  propertyId: string;
  property?: Property;
}

interface UnitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  unit?: Unit | null;
  propertyId?: string;
}

export function UnitFormDialog({
  open,
  onOpenChange,
  onSuccess,
  unit,
  propertyId,
}: UnitFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const isEditing = !!unit;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      parkingSpots: 0,
      propertyId: propertyId || '',
    },
  });

  const selectedPropertyId = watch('propertyId');

  useEffect(() => {
    if (open) {
      loadProperties();
    }
  }, [open]);

  useEffect(() => {
    if (unit && open) {
      setValue('number', unit.number);
      setValue('floor', unit.floor || '');
      setValue('area', unit.area || undefined);
      setValue('bedrooms', unit.bedrooms || undefined);
      setValue('bathrooms', unit.bathrooms || undefined);
      setValue('parkingSpots', unit.parkingSpots);
      setValue('observations', unit.observations || '');
      setValue('propertyId', unit.propertyId);
    } else if (!open) {
      reset({
        parkingSpots: 0,
        propertyId: propertyId || '',
      });
    } else if (propertyId) {
      setValue('propertyId', propertyId);
    }
  }, [unit, open, setValue, reset, propertyId]);

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

  const onSubmit = async (data: UnitFormData) => {
    setLoading(true);
    try {
      if (isEditing) {
        await api.patch(`/units/${unit.id}`, data);
        alert('Unidade atualizada com sucesso!');
      } else {
        await api.post('/units', data);
        alert('Unidade cadastrada com sucesso!');
      }
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      alert(`Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} unidade: ` + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Unidade' : 'Nova Unidade'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize os dados da unidade.' : 'Preencha os dados da unidade que deseja cadastrar.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {!propertyId && (
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
            )}

            <div>
              <Label htmlFor="number">Número da Unidade *</Label>
              <Input
                id="number"
                placeholder="Ex: 101, Apto 12, Sala 5"
                {...register('number')}
              />
              {errors.number && (
                <p className="text-sm text-red-500 mt-1">{errors.number.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="floor">Andar</Label>
              <Input
                id="floor"
                placeholder="Ex: 1º, Térreo"
                {...register('floor')}
              />
            </div>

            <div>
              <Label htmlFor="area">Área (m²)</Label>
              <Input
                id="area"
                type="number"
                step="0.01"
                placeholder="Ex: 85.50"
                {...register('area')}
              />
              {errors.area && (
                <p className="text-sm text-red-500 mt-1">{errors.area.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="bedrooms">Quartos</Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                placeholder="Ex: 2"
                {...register('bedrooms')}
              />
              {errors.bedrooms && (
                <p className="text-sm text-red-500 mt-1">{errors.bedrooms.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="bathrooms">Banheiros</Label>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                placeholder="Ex: 1"
                {...register('bathrooms')}
              />
              {errors.bathrooms && (
                <p className="text-sm text-red-500 mt-1">{errors.bathrooms.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="parkingSpots">Vagas de Garagem</Label>
              <Input
                id="parkingSpots"
                type="number"
                min="0"
                placeholder="Ex: 1"
                {...register('parkingSpots')}
              />
              {errors.parkingSpots && (
                <p className="text-sm text-red-500 mt-1">{errors.parkingSpots.message}</p>
              )}
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
              {loading ? (isEditing ? 'Atualizando...' : 'Cadastrando...') : (isEditing ? 'Atualizar' : 'Cadastrar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
