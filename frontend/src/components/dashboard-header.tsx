'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { LogOut, Home, Building2, Users, FileText, DollarSign, Wrench, Layers, Receipt } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">SIGA</h1>
            <p className="text-sm text-muted-foreground">Sistema Integrado de Gestão de Aluguéis</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.role}</p>
            </div>
            <Button variant="outline" size="icon" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            <Link href="/dashboard">
              <Button variant={isActive('/dashboard') ? 'default' : 'ghost'} size="sm">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/properties">
              <Button variant={isActive('/dashboard/properties') ? 'default' : 'ghost'} size="sm">
                <Building2 className="h-4 w-4 mr-2" />
                Imóveis
              </Button>
            </Link>
            <Link href="/dashboard/units">
              <Button variant={isActive('/dashboard/units') ? 'default' : 'ghost'} size="sm">
                <Layers className="h-4 w-4 mr-2" />
                Unidades
              </Button>
            </Link>
            <Link href="/dashboard/tenants">
              <Button variant={isActive('/dashboard/tenants') ? 'default' : 'ghost'} size="sm">
                <Users className="h-4 w-4 mr-2" />
                Inquilinos
              </Button>
            </Link>
            <Link href="/dashboard/contracts">
              <Button variant={isActive('/dashboard/contracts') ? 'default' : 'ghost'} size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Contratos
              </Button>
            </Link>
            <Link href="/dashboard/payments">
              <Button variant={isActive('/dashboard/payments') ? 'default' : 'ghost'} size="sm">
                <DollarSign className="h-4 w-4 mr-2" />
                Pagamentos
              </Button>
            </Link>
            <Link href="/dashboard/expenses">
              <Button variant={isActive('/dashboard/expenses') ? 'default' : 'ghost'} size="sm">
                <Receipt className="h-4 w-4 mr-2" />
                Despesas
              </Button>
            </Link>
            <Link href="/dashboard/maintenance">
              <Button variant={isActive('/dashboard/maintenance') ? 'default' : 'ghost'} size="sm">
                <Wrench className="h-4 w-4 mr-2" />
                Manutenção
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
