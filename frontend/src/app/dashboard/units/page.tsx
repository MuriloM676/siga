'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Layers, Building2, Pencil, Trash2, Home, Bath, Car } from 'lucide-react';
import api from '@/lib/api';
import { UnitFormDialog } from '@/components/forms/unit-form-dialog';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';

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
  property: Property;
  contracts: any[];
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const response = await api.get('/units');
      setUnits(response.data);
    } catch (error) {
      console.error('Erro ao carregar unidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (unit: Unit) => {
    setSelectedUnit(unit);
    setDialogOpen(true);
  };

  const handleDeleteClick = (unit: Unit) => {
    setUnitToDelete(unit);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!unitToDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/units/${unitToDelete.id}`);
      alert('Unidade excluída com sucesso!');
      loadUnits();
      setDeleteDialogOpen(false);
      setUnitToDelete(null);
    } catch (error: any) {
      alert('Erro ao excluir unidade: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeleting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedUnit(null);
    }
  };

  // Calculate stats
  const totalUnits = units.length;
  const occupiedUnits = units.filter(unit => 
    unit.contracts?.some((contract: any) => contract.status === 'ACTIVE')
  ).length;
  const availableUnits = totalUnits - occupiedUnits;

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Unidades</h1>
          <p className="text-muted-foreground">Gerenciar unidades dos imóveis</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Unidade
        </Button>
      </div>

      <UnitFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSuccess={loadUnits}
        unit={selectedUnit}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Excluir Unidade"
        description={`Tem certeza que deseja excluir a unidade "${unitToDelete?.number}"? Esta ação não pode ser desfeita.`}
        loading={deleting}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Unidades</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unidades Ocupadas</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{occupiedUnits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unidades Disponíveis</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{availableUnits}</div>
          </CardContent>
        </Card>
      </div>

      {/* Units Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {units.map((unit) => {
          const isOccupied = unit.contracts?.some((contract: any) => contract.status === 'ACTIVE');
          
          return (
            <Card key={unit.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Unidade {unit.number}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(unit)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteClick(unit)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{unit.property.name}</span>
                  </div>
                  
                  {unit.floor && (
                    <div className="text-sm text-muted-foreground">
                      Andar: {unit.floor}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 text-sm">
                    {unit.area && (
                      <span className="text-muted-foreground">
                        {unit.area} m²
                      </span>
                    )}
                    {unit.bedrooms !== undefined && unit.bedrooms !== null && (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Home className="h-3 w-3" />
                        {unit.bedrooms} quarto{unit.bedrooms !== 1 ? 's' : ''}
                      </span>
                    )}
                    {unit.bathrooms !== undefined && unit.bathrooms !== null && (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Bath className="h-3 w-3" />
                        {unit.bathrooms} banheiro{unit.bathrooms !== 1 ? 's' : ''}
                      </span>
                    )}
                    {unit.parkingSpots > 0 && (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Car className="h-3 w-3" />
                        {unit.parkingSpots} vaga{unit.parkingSpots !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {unit.observations && (
                    <p className="text-sm text-muted-foreground pt-2 border-t">
                      {unit.observations}
                    </p>
                  )}

                  <div className="pt-2">
                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                      isOccupied 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {isOccupied ? 'Ocupada' : 'Disponível'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {units.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma unidade cadastrada</h3>
            <p className="text-muted-foreground mb-4">
              Comece cadastrando sua primeira unidade
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Unidade
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
