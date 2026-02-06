'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ContractFormDialog } from '@/components/forms/contract-form-dialog';

interface Contract {
  id: string;
  startDate: string;
  endDate?: string;
  rentAmount: number;
  status: string;
  property: { name: string };
  tenant: { name: string };
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const response = await api.get('/contracts');
      setContracts(response.data);
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePayments = async (contractId: string) => {
    if (!confirm('Gerar pagamentos para este contrato?')) return;
    
    try {
      const response = await api.post(`/contracts/${contractId}/generate-payments`);
      alert(response.data.message || 'Pagamentos processados com sucesso!');
      // Refresh the page to see potential updates
      window.location.reload();
    } catch (error: any) {
      console.error('Erro ao gerar pagamentos:', error);
      const message = error.response?.data?.message || error.message;
      alert('Erro: ' + message);
    }
  };

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Contratos</h1>
          <p className="text-muted-foreground">Gerenciar contratos de locação</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Contrato
        </Button>
      </div>

      <ContractFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadContracts}
      />

      <div className="space-y-4">
        {contracts.map((contract) => (
          <Card key={contract.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {contract.property.name}
                </span>
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    contract.status === 'ATIVO'
                      ? 'bg-green-100 text-green-700'
                      : contract.status === 'ENCERRADO'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {contract.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Inquilino</p>
                  <p className="font-medium">{contract.tenant.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Valor do Aluguel</p>
                  <p className="font-bold text-lg">{formatCurrency(contract.rentAmount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Início</p>
                  <p className="font-medium">{formatDate(contract.startDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Fim</p>
                  <p className="font-medium">
                    {contract.endDate ? formatDate(contract.endDate) : 'Indeterminado'}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => generatePayments(contract.id)}
                >
                  Gerar Pagamentos
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {contracts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum contrato cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece cadastrando seu primeiro contrato
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Contrato
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
