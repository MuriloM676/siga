import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Criar usuário admin padrão
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@siga.com' },
    update: {},
    create: {
      email: 'admin@siga.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Criar usuário gestor de exemplo
  const gestorPassword = await bcrypt.hash('gestor123', 10);
  
  const gestor = await prisma.user.upsert({
    where: { email: 'gestor@siga.com' },
    update: {},
    create: {
      email: 'gestor@siga.com',
      password: gestorPassword,
      name: 'Gestor de Exemplo',
      role: 'GESTOR',
      isActive: true,
    },
  });

  console.log('✅ Gestor user created:', gestor.email);

  // Criar usuário visualizador de exemplo
  const viewerPassword = await bcrypt.hash('viewer123', 10);
  
  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@siga.com' },
    update: {},
    create: {
      email: 'viewer@siga.com',
      password: viewerPassword,
      name: 'Visualizador de Exemplo',
      role: 'VISUALIZADOR',
      isActive: true,
    },
  });

  console.log('✅ Viewer user created:', viewer.email);

  // Criar alguns imóveis de exemplo
  const property1 = await prisma.property.create({
    data: {
      type: 'CASA',
      name: 'Casa na Rua das Flores',
      city: 'São Paulo',
      state: 'SP',
      address: 'Rua das Flores, 123',
      zipCode: '01234-567',
      hasUnits: false,
      observations: 'Casa com 3 quartos e garagem para 2 carros',
    },
  });

  console.log('✅ Property created:', property1.name);

  const property2 = await prisma.property.create({
    data: {
      type: 'PREDIO',
      name: 'Edifício Comercial Centro',
      city: 'Rio de Janeiro',
      state: 'RJ',
      address: 'Avenida Presidente Vargas, 456',
      zipCode: '20071-000',
      hasUnits: true,
      observations: 'Prédio comercial com 10 salas',
    },
  });

  console.log('✅ Property created:', property2.name);

  // Criar unidades para o prédio
  const unit1 = await prisma.unit.create({
    data: {
      propertyId: property2.id,
      number: '101',
      floor: '1',
      area: 45.5,
      observations: 'Sala comercial com banheiro',
    },
  });

  const unit2 = await prisma.unit.create({
    data: {
      propertyId: property2.id,
      number: '102',
      floor: '1',
      area: 50.0,
      observations: 'Sala comercial ampla',
    },
  });

  console.log('✅ Units created for property:', property2.name);

  // Criar inquilinos de exemplo
  const tenant1 = await prisma.tenant.create({
    data: {
      name: 'João da Silva',
      cpf: '123.456.789-00',
      phone: '(11) 98765-4321',
      email: 'joao.silva@email.com',
      address: 'Rua Exemplo, 789',
    },
  });

  const tenant2 = await prisma.tenant.create({
    data: {
      name: 'Maria Santos',
      cpf: '987.654.321-00',
      phone: '(21) 99876-5432',
      email: 'maria.santos@email.com',
      address: 'Avenida Teste, 321',
    },
  });

  console.log('✅ Tenants created');

  // Criar contrato de exemplo
  const contract1 = await prisma.contract.create({
    data: {
      propertyId: property1.id,
      tenantId: tenant1.id,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      rentAmount: 2500.00,
      dueDay: 10,
      indexType: 'IPCA',
      guaranteeType: 'FIADOR',
      status: 'ATIVO',
      observations: 'Contrato anual com reajuste pelo IPCA',
    },
  });

  console.log('✅ Contract created');

  // Criar alguns pagamentos
  const payment1 = await prisma.payment.create({
    data: {
      contractId: contract1.id,
      referenceMonth: new Date('2024-01-01'),
      dueDate: new Date('2024-01-10'),
      amount: 2500.00,
      status: 'PAGO',
      paidDate: new Date('2024-01-09'),
      paidAmount: 2500.00,
    },
  });

  const payment2 = await prisma.payment.create({
    data: {
      contractId: contract1.id,
      referenceMonth: new Date('2024-02-01'),
      dueDate: new Date('2024-02-10'),
      amount: 2500.00,
      status: 'PENDENTE',
    },
  });

  console.log('✅ Payments created');

  // Criar despesa de exemplo
  const expense1 = await prisma.expense.create({
    data: {
      propertyId: property1.id,
      type: 'IPTU',
      description: 'IPTU referente ao ano de 2024',
      amount: 1500.00,
      dueDate: new Date('2024-03-15'),
      referenceMonth: new Date('2024-03-01'),
      isPaid: false,
    },
  });

  console.log('✅ Expense created');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📝 Login credentials:');
  console.log('Admin: admin@siga.com / admin123');
  console.log('Gestor: gestor@siga.com / gestor123');
  console.log('Viewer: viewer@siga.com / viewer123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
