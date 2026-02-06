'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Receipt, Building2, Calendar, DollarSign, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { ExpenseFormDialog } from '@/components/forms/expense-form-dialog';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { formatCurrency, formatDate } from '@/lib/utils';

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
  property: Property;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const response = await api.get('/expenses');
      setExpenses(response.data);
    } catch (error) {
      console.error('Erro ao carregar despesas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setDialogOpen(true);
  };

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/expenses/${expenseToDelete.id}`);
      alert('Despesa excluída com sucesso!');
      loadExpenses();
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    } catch (error: any) {
      alert('Erro ao excluir despesa: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeleting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedExpense(null);
    }
  };

  // Filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    const statusMatch = statusFilter === 'all' || 
      (statusFilter === 'paid' && expense.isPaid) ||
      (statusFilter === 'pending' && !expense.isPaid);
    
    const typeMatch = typeFilter === 'all' || expense.type === typeFilter;
    
    return statusMatch && typeMatch;
  });

  // Calculate stats
  const totalExpenses = expenses.length;
  const paidExpenses = expenses.filter(e => e.isPaid).length;
  const pendingExpenses = totalExpenses - paidExpenses;
  const totalPaid = expenses.filter(e => e.isPaid).reduce((sum, e) => sum + e.amount, 0);
  const totalPending = expenses.filter(e => !e.isPaid).reduce((sum, e) => sum + e.amount, 0);

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

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Despesas</h1>
          <p className="text-muted-foreground">Gerenciar despesas dos imóveis</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Despesa
        </Button>
      </div>

      <ExpenseFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSuccess={loadExpenses}
        expense={selectedExpense}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Excluir Despesa"
        description={`Tem certeza que deseja excluir a despesa "${expenseToDelete?.description}"? Esta ação não pode ser desfeita.`}
        loading={deleting}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExpenses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pagas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{paidExpenses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{pendingExpenses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600">{formatCurrency(totalPaid)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-red-600">{formatCurrency(totalPending)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="paid">Pagas</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-48">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              {Object.entries(expenseTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Expenses Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredExpenses.map((expense) => (
          <Card key={expense.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Receipt className="h-5 w-5" />
                  {expenseTypeLabels[expense.type] || expense.type}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(expense)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteClick(expense)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{expense.description}</p>
                
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{expense.property.name}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold text-lg">{formatCurrency(expense.amount)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Venc: {formatDate(expense.dueDate)}</span>
                </div>

                {expense.isPaid && expense.paidDate && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Pago em: {formatDate(expense.paidDate)}</span>
                  </div>
                )}

                {expense.observations && (
                  <p className="text-sm text-muted-foreground pt-2 border-t">
                    {expense.observations}
                  </p>
                )}

                <div className="pt-2">
                  <span className={`inline-block px-2 py-1 text-xs rounded ${
                    expense.isPaid 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {expense.isPaid ? 'Pago' : 'Pendente'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExpenses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {expenses.length === 0 
                ? 'Nenhuma despesa cadastrada' 
                : 'Nenhuma despesa encontrada com os filtros selecionados'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {expenses.length === 0 
                ? 'Comece cadastrando sua primeira despesa'
                : 'Tente ajustar os filtros de busca'}
            </p>
            {expenses.length === 0 && (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Despesa
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
