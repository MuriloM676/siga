'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2, MapPin, Pencil, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { PropertyFormDialog } from '@/components/forms/property-form-dialog';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';

interface Property {
  id: string;
  type: string;
  name: string;
  city: string;
  state: string;
  address: string;
  hasUnits: boolean;
  units: any[];
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await api.get('/properties');
      setProperties(response.data);
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setDialogOpen(true);
  };

  const handleDeleteClick = (property: Property) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/properties/${propertyToDelete.id}`);
      alert('Imóvel excluído com sucesso!');
      loadProperties();
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    } catch (error: any) {
      alert('Erro ao excluir imóvel: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeleting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedProperty(null);
    }
  };

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Imóveis</h1>
          <p className="text-muted-foreground">Gerenciar imóveis cadastrados</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Imóvel
        </Button>
      </div>

      <PropertyFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSuccess={loadProperties}
        property={selectedProperty}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Excluir Imóvel"
        description={`Tem certeza que deseja excluir o imóvel "${propertyToDelete?.name}"? Esta ação não pode ser desfeita.`}
        loading={deleting}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <Card key={property.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {property.name}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(property)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteClick(property)}
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
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {property.city}, {property.state}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{property.address}</p>
                <div className="pt-2">
                  <span className="inline-block px-2 py-1 text-xs rounded bg-primary/10 text-primary">
                    {property.type}
                  </span>
                  {property.hasUnits && (
                    <span className="ml-2 inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                      {property.units?.length || 0} unidades
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {properties.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum imóvel cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece cadastrando seu primeiro imóvel
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Imóvel
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
