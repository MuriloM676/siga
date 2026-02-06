'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, Clock, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import MaintenanceFormDialog from '@/components/forms/maintenance-form-dialog';

interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  cost?: number;
  status: 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
  reportedAt?: string;
  completedAt?: string;
  observations?: string;
  property: { name: string };
  unit?: { identifier: string };
}

export default function MaintenancePage() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUIDO'>('all');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await api.get('/maintenance');
      setTickets(response.data);
    } catch (error) {
      console.error('Erro ao carregar chamados:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    if (!confirm(`Alterar status do chamado para ${newStatus}?`)) return;
    
    try {
      await api.patch(`/maintenance/${id}`, { status: newStatus });
      alert('Status atualizado com sucesso!');
      loadTickets();
    } catch (error: any) {
      alert('Erro ao atualizar status: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredTickets = filter === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === filter);

  const stats = {
    total: tickets.length,
    aberto: tickets.filter(t => t.status === 'ABERTO').length,
    emAndamento: tickets.filter(t => t.status === 'EM_ANDAMENTO').length,
    concluido: tickets.filter(t => t.status === 'CONCLUIDO').length,
    totalCost: tickets
      .filter(t => t.status === 'CONCLUIDO')
      .reduce((sum, t) => sum + (t.cost || 0), 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONCLUIDO': return 'bg-green-100 text-green-700';
      case 'EM_ANDAMENTO': return 'bg-blue-100 text-blue-700';
      case 'ABERTO': return 'bg-yellow-100 text-yellow-700';
      case 'CANCELADO': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manutenção</h1>
          <p className="text-muted-foreground">Gerenciar chamados de manutenção</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Chamado
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abertos</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aberto}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Wrench className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.emAndamento}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.concluido}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalCost)}</div>
            <p className="text-xs text-muted-foreground">Concluídos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todos ({stats.total})
        </Button>
        <Button 
          variant={filter === 'ABERTO' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('ABERTO')}
        >
          Abertos ({stats.aberto})
        </Button>
        <Button 
          variant={filter === 'EM_ANDAMENTO' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('EM_ANDAMENTO')}
        >
          Em Andamento ({stats.emAndamento})
        </Button>
        <Button 
          variant={filter === 'CONCLUIDO' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('CONCLUIDO')}
        >
          Concluídos ({stats.concluido})
        </Button>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum chamado encontrado.
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{ticket.title}</h3>
                      {ticket.unit && (
                        <span className="text-sm text-muted-foreground">
                          - {ticket.property.name} ({ticket.unit.identifier})
                        </span>
                      )}
                      {!ticket.unit && (
                        <span className="text-sm text-muted-foreground">
                          - {ticket.property.name}
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <p className="text-sm">{ticket.description}</p>
                    
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {ticket.reportedAt && (
                        <span>Reportado: {formatDate(ticket.reportedAt)}</span>
                      )}
                      {ticket.completedAt && (
                        <span>Concluído: {formatDate(ticket.completedAt)}</span>
                      )}
                    </div>

                    {ticket.cost && ticket.cost > 0 && (
                      <div className="text-sm">
                        <span>
                          Custo: <strong>{formatCurrency(ticket.cost)}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    {ticket.status === 'ABERTO' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(ticket.id, 'EM_ANDAMENTO')}
                      >
                        Iniciar
                      </Button>
                    )}
                    {ticket.status === 'EM_ANDAMENTO' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(ticket.id, 'CONCLUIDO')}
                      >
                        Concluir
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <MaintenanceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadTickets}
      />
    </div>
  );
}
