/* Odontotech — database seed (mirrors the frontend mock data in data.js). */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
function cpf(seed: number): string {
  const n = (s: number) => String((seed * s) % 1000).padStart(3, '0');
  return `${n(37)}.${n(53)}.${n(71)}-${String((seed * 13) % 100).padStart(2, '0')}`;
}
function at(date: string, hour: number, min: number): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d, hour, min, 0, 0);
}

async function main() {
  console.log('🌱  Limpando dados existentes...');
  await prisma.appointmentService.deleteMany();
  await prisma.examFile.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.dentalRecord.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.service.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.clinicSettings.deleteMany();

  // --- Clinic settings -----------------------------------------------
  await prisma.clinicSettings.create({
    data: {
      id: 'singleton',
      clinicName: 'Odontotech',
      unit: 'Unidade Paulista',
      phone: '(11) 3000-0000',
      email: 'contato@odontotech.com',
      address: 'Av. Paulista, 1000 — São Paulo/SP',
      primaryColor: '#1C6DD0',
      radius: 'default',
      density: 'comfortable',
      theme: 'light',
    },
  });

  // --- Users (admin + dentists) --------------------------------------
  console.log('👤  Criando usuários...');
  const adminHash = await bcrypt.hash('admin123', 10);
  const demoHash = await bcrypt.hash('demo1234', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@odontotech.com',
      passwordHash: adminHash,
      role: 'ADMIN',
      initials: 'AD',
      color: 'blue',
    },
  });

  const dentistSeeds = [
    { name: 'Dra. Marina Costa', specialty: 'Ortodontia', color: 'blue', initials: 'MC', email: 'marina.costa@odontotech.com.br', role: 'ADMIN' },
    { name: 'Dr. Rafael Lima', specialty: 'Implantodontia', color: 'teal', initials: 'RL', email: 'rafael.lima@odontotech.com.br', role: 'DENTIST' },
    { name: 'Dra. Beatriz Souza', specialty: 'Endodontia', color: 'violet', initials: 'BS', email: 'beatriz.souza@odontotech.com.br', role: 'DENTIST' },
    { name: 'Dr. André Martins', specialty: 'Clínico Geral', color: 'amber', initials: 'AM', email: 'andre.martins@odontotech.com.br', role: 'DENTIST' },
  ];
  const dentists = [] as { id: string }[];
  for (const d of dentistSeeds) {
    const u = await prisma.user.create({
      data: {
        name: d.name,
        email: d.email,
        passwordHash: demoHash,
        role: d.role,
        specialty: d.specialty,
        color: d.color,
        initials: d.initials,
      },
    });
    dentists.push(u);
  }

  // --- Plans ----------------------------------------------------------
  console.log('🛡️   Criando planos...');
  const planSeeds = [
    { name: 'Particular', coveragePercent: 0, status: 'ativo', serviceCount: 32, color: 'gray', gracePeriod: '—' },
    { name: 'Amil Dental', coveragePercent: 70, status: 'ativo', serviceCount: 24, color: 'blue', gracePeriod: '30 dias' },
    { name: 'Bradesco Saúde', coveragePercent: 80, status: 'ativo', serviceCount: 28, color: 'rose', gracePeriod: '60 dias' },
    { name: 'SulAmérica Odonto', coveragePercent: 60, status: 'ativo', serviceCount: 19, color: 'green', gracePeriod: '30 dias' },
    { name: 'Odontoprev', coveragePercent: 75, status: 'ativo', serviceCount: 26, color: 'teal', gracePeriod: '90 dias' },
    { name: 'Porto Seguro', coveragePercent: 65, status: 'inativo', serviceCount: 14, color: 'violet', gracePeriod: '60 dias' },
  ];
  const plans = [] as { id: string }[];
  for (const p of planSeeds) plans.push(await prisma.plan.create({ data: p }));

  // --- Services -------------------------------------------------------
  console.log('🦷  Criando serviços...');
  const serviceSeeds = [
    { name: 'Consulta de Avaliação', category: 'Clínica Geral', price: 120, duration: 30, description: 'Avaliação inicial e diagnóstico do paciente.' },
    { name: 'Limpeza / Profilaxia', category: 'Prevenção', price: 180, duration: 40, description: 'Remoção de placa bacteriana e tártaro, polimento.' },
    { name: 'Restauração em Resina', category: 'Dentística', price: 250, duration: 50, description: 'Restauração estética com resina composta.' },
    { name: 'Tratamento de Canal', category: 'Endodontia', price: 850, duration: 90, description: 'Tratamento endodôntico de canal radicular.' },
    { name: 'Extração Simples', category: 'Cirurgia', price: 300, duration: 45, description: 'Extração dentária sem complicações.' },
    { name: 'Clareamento Dental', category: 'Estética', price: 950, duration: 60, description: 'Clareamento a laser em consultório.' },
    { name: 'Aparelho Ortodôntico', category: 'Ortodontia', price: 1800, duration: 60, description: 'Instalação de aparelho fixo metálico.' },
    { name: 'Implante Unitário', category: 'Implantodontia', price: 3200, duration: 120, description: 'Implante de titânio com prótese.' },
    { name: 'Radiografia Panorâmica', category: 'Radiologia', price: 140, duration: 20, description: 'Exame radiográfico panorâmico digital.' },
    { name: 'Coroa de Porcelana', category: 'Prótese', price: 1400, duration: 75, description: 'Coroa protética em porcelana.' },
  ];
  const services = [] as { id: string; duration: number; price: number }[];
  for (const s of serviceSeeds) services.push(await prisma.service.create({ data: s }));

  // --- Patients (47, deterministic generator) ------------------------
  console.log('🧑‍⚕️  Criando pacientes...');
  const firstNames = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elaine', 'Felipe', 'Gabriela', 'Heitor', 'Isabela', 'João', 'Larissa', 'Marcos', 'Natália', 'Otávio', 'Patrícia', 'Rodrigo', 'Sofia', 'Thiago', 'Vanessa', 'William'];
  const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Costa', 'Pereira', 'Almeida', 'Ferreira', 'Rodrigues', 'Gomes', 'Martins', 'Araújo', 'Ribeiro', 'Carvalho', 'Lima'];
  const statuses = ['ativo', 'ativo', 'ativo', 'ativo', 'inativo'];
  const cities = ['São Paulo', 'Campinas', 'Santos', 'Guarulhos', 'Osasco'];

  const patients = [] as { id: string }[];
  for (let i = 0; i < 47; i++) {
    const fn = firstNames[(i * 7) % firstNames.length];
    const ln = lastNames[(i * 5) % lastNames.length];
    const ln2 = lastNames[(i * 3 + 2) % lastNames.length];
    const year = 1958 + ((i * 11) % 52);
    const month = 1 + ((i * 7) % 12);
    const day = 1 + ((i * 13) % 27);
    const age = 2026 - year;
    const plan = plans[(i * 3) % plans.length];
    const allergies = i % 5 === 0 ? ['Penicilina'] : i % 7 === 0 ? ['Látex', 'Dipirona'] : [];
    const conditions = i % 6 === 0 ? ['Hipertensão'] : i % 9 === 0 ? ['Diabetes tipo 2'] : [];
    const isMinor = age < 18;

    const created = await prisma.patient.create({
      data: {
        name: `${fn} ${ln} ${ln2}`,
        cpf: cpf(i + 11),
        birthdate: new Date(year, month - 1, day),
        gender: i % 2 === 0 ? 'Feminino' : 'Masculino',
        phone: `(11) 9${pad((i * 7) % 10)}${pad((i * 3) % 10)}${pad((i * 9) % 10)}-${pad((i * 11) % 100)}${pad((i * 5) % 100)}`.slice(0, 16),
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@email.com`,
        status: statuses[i % statuses.length],
        planId: plan.id,
        city: cities[i % 5],
        address: `Rua ${lastNames[i % lastNames.length]}, ${100 + i * 7}`,
        cep: `0${pad((i * 3) % 100)}${pad((i * 7) % 100)}-${pad((i * 9) % 1000).slice(0, 3)}`.slice(0, 9),
        uf: 'SP',
        allergies: JSON.stringify(allergies),
        conditions: JSON.stringify(conditions),
        observations: i % 4 === 0 ? 'Paciente ansioso, prefere sedação leve em procedimentos longos.' : null,
        isMinor,
        responsibleParty: isMinor ? `${firstNames[(i * 3) % firstNames.length]} ${ln2}` : null,
      },
    });
    patients.push(created);
  }

  // Dental records for the first few patients
  for (const p of patients.slice(0, 8)) {
    await prisma.dentalRecord.create({
      data: { patientId: p.id, notes: 'Prontuário iniciado. Sem evoluções registradas.' },
    });
  }

  // --- Appointments (mirrors data.js generation) ---------------------
  console.log('📅  Criando consultas...');
  const apptStatusKeys = ['agendado', 'confirmado', 'concluido', 'cancelado', 'atendimento'];
  const mkAppt = async (date: string, hour: number, min: number, durMin: number, ptIdx: number, dIdx: number, sIdx: number, status: string) => {
    const patient = patients[ptIdx % patients.length];
    const dentist = dentists[dIdx % dentists.length];
    const service = services[sIdx % services.length];
    await prisma.appointment.create({
      data: {
        patientId: patient.id,
        dentistId: dentist.id,
        serviceId: service.id,
        datetime: at(date, hour, min),
        durationMin: durMin,
        status,
      },
    });
  };

  const today = '2026-06-03';
  await mkAppt(today, 8, 0, 30, 0, 0, 0, 'concluido');
  await mkAppt(today, 9, 0, 40, 3, 1, 1, 'concluido');
  await mkAppt(today, 9, 30, 90, 7, 2, 3, 'atendimento');
  await mkAppt(today, 11, 0, 50, 12, 0, 2, 'confirmado');
  await mkAppt(today, 13, 30, 60, 18, 3, 6, 'confirmado');
  await mkAppt(today, 14, 0, 45, 22, 1, 4, 'agendado');
  await mkAppt(today, 15, 30, 120, 5, 2, 7, 'agendado');
  await mkAppt(today, 16, 0, 40, 9, 3, 1, 'agendado');
  await mkAppt(today, 17, 0, 30, 15, 0, 8, 'cancelado');

  const monthDays = [2, 4, 4, 5, 5, 6, 9, 10, 11, 12, 12, 15, 16, 17, 18, 19, 22, 23, 24, 25, 26, 29, 30];
  for (let i = 0; i < monthDays.length; i++) {
    const d = monthDays[i];
    const h = 8 + (i % 9);
    await mkAppt(`2026-06-${pad(d)}`, h, (i % 2) * 30, [30, 40, 50, 60, 90][i % 5], i * 3, i, i * 2, apptStatusKeys[i % 4]);
    if (i % 3 === 0) await mkAppt(`2026-06-${pad(d)}`, h + 2, 0, 45, i * 5 + 1, i + 1, i + 3, apptStatusKeys[(i + 1) % 4]);
  }
  await mkAppt('2026-06-01', 10, 0, 50, 2, 1, 2, 'concluido');
  await mkAppt('2026-06-02', 14, 0, 60, 8, 2, 5, 'concluido');
  await mkAppt('2026-06-04', 9, 0, 40, 14, 0, 1, 'confirmado');
  await mkAppt('2026-06-04', 11, 0, 90, 20, 2, 3, 'agendado');
  await mkAppt('2026-06-05', 15, 0, 75, 6, 3, 9, 'agendado');

  // --- Exams ----------------------------------------------------------
  console.log('🔬  Criando exames...');
  const examSeeds = [
    { ptIdx: 6, type: 'Radiografia Panorâmica', date: '2026-05-28', dIdx: 1, status: 'concluido', notes: 'Sem alterações ósseas significativas. Presença de terceiros molares inclusos.' },
    { ptIdx: 6, type: 'Tomografia (TC)', date: '2026-05-15', dIdx: 1, status: 'concluido', notes: 'Avaliação para implante região 36. Volume ósseo adequado.' },
    { ptIdx: 2, type: 'Radiografia Periapical', date: '2026-06-01', dIdx: 2, status: 'pendente', notes: '' },
    { ptIdx: 11, type: 'Documentação Ortodôntica', date: '2026-05-20', dIdx: 0, status: 'concluido', notes: 'Documentação completa para planejamento ortodôntico.' },
    { ptIdx: 4, type: 'Radiografia Panorâmica', date: '2026-06-02', dIdx: 3, status: 'pendente', notes: '' },
  ];
  for (const e of examSeeds) {
    await prisma.exam.create({
      data: {
        patientId: patients[e.ptIdx].id,
        dentistId: dentists[e.dIdx].id,
        type: e.type,
        date: at(e.date, 9, 0),
        status: e.status,
        notes: e.notes || null,
      },
    });
  }

  console.log('\n✅  Seed concluído!');
  console.log('   Admin:    admin@odontotech.com / admin123');
  console.log('   Dentista: marina.costa@odontotech.com.br / demo1234  (ADMIN)');
  console.log(`   ${patients.length} pacientes · ${services.length} serviços · ${plans.length} planos\n`);
}

main()
  .catch((e) => {
    console.error('❌  Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
