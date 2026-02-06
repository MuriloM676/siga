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

const propertySchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  type: z.enum(['CASA', 'APARTAMENTO', 'COMERCIAL', 'TERRENO', 'PREDIO']),
  address: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres (ex: SP)'),
  registration: z.string().optional(),
  hasUnits: z.boolean().default(false),
  observations: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface Property {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  registration?: string;
  hasUnits: boolean;
  observations?: string;
}

interface PropertyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  property?: Property | null;
}

export function PropertyFormDialog({
  open,
  onOpenChange,
  onSuccess,
  property,
}: PropertyFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!property;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      hasUnits: false,
    },
  });

  useEffect(() => {
    if (property && open) {
      setValue('name', property.name);
      setValue('type', property.type as any);
      setValue('address', property.address);
      setValue('city', property.city);
      setValue('state', property.state);
      setValue('registration', property.registration || '');
      setValue('hasUnits', property.hasUnits);
      setValue('observations', property.observations || '');
    } else if (!open) {
      reset();
    }
  }, [property, open, setValue, reset]);

  const propertyType = watch('type');

  const onSubmit = async (data: PropertyFormData) => {
    setLoading(true);
    try {
      if (isEditing) {
        await api.patch(`/properties/${property.id}`, data);
        alert('Imóvel atualizado com sucesso!');
      } else {
        await api.post('/properties', data);
        alert('Imóvel cadastrado com sucesso!');
      }
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      alert(`Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} imóvel: ` + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Imóvel' : 'Novo Imóvel'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize os dados do imóvel.' : 'Preencha os dados do imóvel que deseja cadastrar.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Nome do Imóvel *</Label>
              <Input
                id="name"
                placeholder="Ex: Casa Rua das Flores"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={propertyType}
                onValueChange={(value) => setValue('type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASA">Casa</SelectItem>
                  <SelectItem value="APARTAMENTO">Apartamento</SelectItem>
                  <SelectItem value="COMERCIAL">Comercial</SelectItem>
                  <SelectItem value="TERRENO">Terreno</SelectItem>
                  <SelectItem value="PREDIO">Prédio</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="registration">Matrícula</Label>
              <Input
                id="registration"
                placeholder="Número da matrícula"
                {...register('registration')}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="address">Endereço *</Label>
              <Input
                id="address"
                placeholder="Rua, número, complemento"
                {...register('address')}
              />
              {errors.address && (
                <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                placeholder="Ex: São Paulo"
                {...register('city')}
              />
              {errors.city && (
                <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="state">Estado (UF) *</Label>
              <Input
                id="state"
                placeholder="Ex: SP"
                maxLength={2}
                {...register('state')}
              />
              {errors.state && (
                <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>
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

            <div className="col-span-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasUnits"
                  {...register('hasUnits')}
                  className="h-4 w-4"
                />
                <Label htmlFor="hasUnits" className="cursor-pointer">
                  Este imóvel possui unidades (apartamentos, salas, etc)
                </Label>
              </div>
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
