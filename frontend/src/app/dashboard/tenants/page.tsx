'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Mail, Phone, Pencil, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { TenantFormDialog } from '@/components/forms/tenant-form-dialog';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';

interface Tenant {
  id: string;
  name: string;
  cpf: string;
  phone?: string;
  email?: string;
  address?: string;
  observations?: string;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const response = await api.get('/tenants');
      setTenants(response.data);
    } catch (error) {
      console.error('Erro ao carregar inquilinos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setDialogOpen(true);
  };

  const handleDeleteClick = (tenant: Tenant) => {
    setTenantToDelete(tenant);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tenantToDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/tenants/${tenantToDelete.id}`);
      alert('Inquilino excluído com sucesso!');
      loadTenants();
      setDeleteDialogOpen(false);
      setTenantToDelete(null);
    } catch (error: any) {
      alert('Erro ao excluir inquilino: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeleting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedTenant(null);
    }
  };

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Inquilinos</h1>
          <p className="text-muted-foreground">Gerenciar inquilinos cadastrados</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Inquilino
        </Button>
      </div>

      <TenantFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSuccess={loadTenants}
        tenant={selectedTenant}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Excluir Inquilino"
        description={`Tem certeza que deseja excluir o inquilino "${tenantToDelete?.name}"? Esta ação não pode ser desfeita.`}
        loading={deleting}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tenants.map((tenant) => (
          <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {tenant.name}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(tenant)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteClick(tenant)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">CPF: {tenant.cpf}</p>
                {tenant.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{tenant.phone}</span>
                  </div>
                )}
                {tenant.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{tenant.email}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tenants.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum inquilino cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece cadastrando seu primeiro inquilino
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Inquilino
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
