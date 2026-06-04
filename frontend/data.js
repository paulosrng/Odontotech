/* Odontotech — mock data (pt-BR) */
(function () {
  const dentists = [
    { id: 'd1', name: 'Dra. Marina Costa',   spec: 'Ortodontia',     color: 'blue',  initials: 'MC' },
    { id: 'd2', name: 'Dr. Rafael Lima',     spec: 'Implantodontia', color: 'teal',  initials: 'RL' },
    { id: 'd3', name: 'Dra. Beatriz Souza',  spec: 'Endodontia',     color: 'violet',initials: 'BS' },
    { id: 'd4', name: 'Dr. André Martins',   spec: 'Clínico Geral',  color: 'amber', initials: 'AM' },
  ];

  // Team / users (mirrors backend config module: role ADMIN | DENTIST).
  const team = [
    { id: 'd1', name: 'Dra. Marina Costa',  email: 'marina.costa@odontotech.com.br',  role: 'ADMIN',   specialty: 'Ortodontia',     color: 'blue',   initials: 'MC', active: true },
    { id: 'd2', name: 'Dr. Rafael Lima',    email: 'rafael.lima@odontotech.com.br',   role: 'DENTIST', specialty: 'Implantodontia', color: 'teal',   initials: 'RL', active: true },
    { id: 'd3', name: 'Dra. Beatriz Souza', email: 'beatriz.souza@odontotech.com.br', role: 'DENTIST', specialty: 'Endodontia',     color: 'violet', initials: 'BS', active: true },
    { id: 'd4', name: 'Dr. André Martins',  email: 'andre.martins@odontotech.com.br', role: 'DENTIST', specialty: 'Clínico Geral',  color: 'amber',  initials: 'AM', active: true },
    { id: 'u5', name: 'Camila Ribeiro',     email: 'recepcao@odontotech.com.br',      role: 'ADMIN',   specialty: null,             color: 'green',  initials: 'CR', active: true },
    { id: 'u6', name: 'Dr. Otávio Nunes',   email: 'otavio.nunes@odontotech.com.br',  role: 'DENTIST', specialty: 'Cirurgia',       color: 'rose',   initials: 'ON', active: false },
  ];

  const plans = [
    { id: 'p1', name: 'Particular',        coverage: 0,  status: 'ativo',   services: 32, color: 'gray',   carencia: '—' },
    { id: 'p2', name: 'Amil Dental',       coverage: 70, status: 'ativo',   services: 24, color: 'blue',   carencia: '30 dias' },
    { id: 'p3', name: 'Bradesco Saúde',    coverage: 80, status: 'ativo',   services: 28, color: 'rose',   carencia: '60 dias' },
    { id: 'p4', name: 'SulAmérica Odonto', coverage: 60, status: 'ativo',   services: 19, color: 'green',  carencia: '30 dias' },
    { id: 'p5', name: 'Odontoprev',        coverage: 75, status: 'ativo',   services: 26, color: 'teal',   carencia: '90 dias' },
    { id: 'p6', name: 'Porto Seguro',      coverage: 65, status: 'inativo', services: 14, color: 'violet', carencia: '60 dias' },
  ];

  const services = [
    { id: 's1',  name: 'Consulta de Avaliação',     cat: 'Clínica Geral',  price: 120,  dur: 30, desc: 'Avaliação inicial e diagnóstico do paciente.' },
    { id: 's2',  name: 'Limpeza / Profilaxia',      cat: 'Prevenção',      price: 180,  dur: 40, desc: 'Remoção de placa bacteriana e tártaro, polimento.' },
    { id: 's3',  name: 'Restauração em Resina',     cat: 'Dentística',     price: 250,  dur: 50, desc: 'Restauração estética com resina composta.' },
    { id: 's4',  name: 'Tratamento de Canal',       cat: 'Endodontia',     price: 850,  dur: 90, desc: 'Tratamento endodôntico de canal radicular.' },
    { id: 's5',  name: 'Extração Simples',          cat: 'Cirurgia',       price: 300,  dur: 45, desc: 'Extração dentária sem complicações.' },
    { id: 's6',  name: 'Clareamento Dental',        cat: 'Estética',       price: 950,  dur: 60, desc: 'Clareamento a laser em consultório.' },
    { id: 's7',  name: 'Aparelho Ortodôntico',      cat: 'Ortodontia',     price: 1800, dur: 60, desc: 'Instalação de aparelho fixo metálico.' },
    { id: 's8',  name: 'Implante Unitário',         cat: 'Implantodontia', price: 3200, dur: 120,desc: 'Implante de titânio com prótese.' },
    { id: 's9',  name: 'Radiografia Panorâmica',    cat: 'Radiologia',     price: 140,  dur: 20, desc: 'Exame radiográfico panorâmico digital.' },
    { id: 's10', name: 'Coroa de Porcelana',        cat: 'Prótese',        price: 1400, dur: 75, desc: 'Coroa protética em porcelana.' },
  ];

  const firstNames = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elaine', 'Felipe', 'Gabriela', 'Heitor', 'Isabela', 'João', 'Larissa', 'Marcos', 'Natália', 'Otávio', 'Patrícia', 'Rodrigo', 'Sofia', 'Thiago', 'Vanessa', 'William'];
  const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Costa', 'Pereira', 'Almeida', 'Ferreira', 'Rodrigues', 'Gomes', 'Martins', 'Araújo', 'Ribeiro', 'Carvalho', 'Lima'];
  const statuses = ['ativo', 'ativo', 'ativo', 'ativo', 'inativo'];

  function cpf(seed) {
    const n = (s) => String((seed * s) % 1000).padStart(3, '0');
    return `${n(37)}.${n(53)}.${n(71)}-${String((seed * 13) % 100).padStart(2, '0')}`;
  }
  function pad(n){ return String(n).padStart(2,'0'); }

  const patients = [];
  for (let i = 0; i < 47; i++) {
    const fn = firstNames[(i * 7) % firstNames.length];
    const ln = lastNames[(i * 5) % lastNames.length];
    const ln2 = lastNames[(i * 3 + 2) % lastNames.length];
    const year = 1958 + ((i * 11) % 52);
    const month = 1 + ((i * 7) % 12);
    const day = 1 + ((i * 13) % 27);
    const age = 2026 - year;
    const plan = plans[(i * 3) % plans.length];
    patients.push({
      id: 'pt' + (i + 1),
      name: `${fn} ${ln} ${ln2}`,
      cpf: cpf(i + 11),
      birth: `${year}-${pad(month)}-${pad(day)}`,
      age,
      phone: `(11) 9${pad((i*7)%10)}${pad((i*3)%10)}${pad((i*9)%10)}-${pad((i*11)%100)}${pad((i*5)%100)}`.slice(0,16),
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@email.com`,
      gender: i % 2 === 0 ? 'Feminino' : 'Masculino',
      status: statuses[i % statuses.length],
      planId: plan.id,
      planName: plan.name,
      city: ['São Paulo', 'Campinas', 'Santos', 'Guarulhos', 'Osasco'][i % 5],
      address: `Rua ${lastNames[i % lastNames.length]}, ${100 + i * 7}`,
      cep: `0${pad((i*3)%100)}${pad((i*7)%100)}-${pad((i*9)%1000).slice(0,3)}`.slice(0,9),
      lastVisit: i % 6 === 0 ? null : `2026-0${1 + (i % 5)}-${pad(1 + (i * 3) % 27)}`,
      nextVisit: i % 4 === 0 ? `2026-06-${pad(4 + (i % 20))}` : null,
      consultations: (i * 3) % 14,
      allergies: i % 5 === 0 ? ['Penicilina'] : i % 7 === 0 ? ['Látex', 'Dipirona'] : [],
      conditions: i % 6 === 0 ? ['Hipertensão'] : i % 9 === 0 ? ['Diabetes tipo 2'] : [],
      obs: i % 4 === 0 ? 'Paciente ansioso, prefere sedação leve em procedimentos longos.' : '',
      isMinor: age < 18,
      responsible: age < 18 ? `${firstNames[(i*3)%firstNames.length]} ${ln2}` : null,
    });
  }

  // Appointments for current period — build around "today" June 3 2026
  const apptStatus = [
    { key: 'agendado',  label: 'Agendado',  badge: 'blue',  ev: 'ev-blue' },
    { key: 'confirmado',label: 'Confirmado',badge: 'teal',  ev: 'ev-teal' },
    { key: 'concluido', label: 'Concluído', badge: 'green', ev: 'ev-green' },
    { key: 'cancelado', label: 'Cancelado', badge: 'rose',  ev: 'ev-rose' },
    { key: 'atendimento',label:'Em atendimento', badge:'amber', ev: 'ev-amber' },
  ];
  const statusByKey = Object.fromEntries(apptStatus.map(s => [s.key, s]));

  const appts = [];
  let aid = 1;
  const mkAppt = (dateStr, hour, min, durMin, ptIdx, dIdx, sIdx, st) => {
    const p = patients[ptIdx % patients.length];
    appts.push({
      id: 'ap' + (aid++),
      date: dateStr, hour, min, dur: durMin,
      patientId: p.id, patientName: p.name,
      dentistId: dentists[dIdx % dentists.length].id,
      dentistName: dentists[dIdx % dentists.length].name,
      serviceId: services[sIdx % services.length].id,
      serviceName: services[sIdx % services.length].name,
      status: st,
      planName: p.planName,
      notes: '',
    });
  };
  // Today (2026-06-03)
  const today = '2026-06-03';
  mkAppt(today, 8, 0, 30, 0, 0, 0, 'concluido');
  mkAppt(today, 9, 0, 40, 3, 1, 1, 'concluido');
  mkAppt(today, 9, 30, 90, 7, 2, 3, 'atendimento');
  mkAppt(today, 11, 0, 50, 12, 0, 2, 'confirmado');
  mkAppt(today, 13, 30, 60, 18, 3, 6, 'confirmado');
  mkAppt(today, 14, 0, 45, 22, 1, 4, 'agendado');
  mkAppt(today, 15, 30, 120, 5, 2, 7, 'agendado');
  mkAppt(today, 16, 0, 40, 9, 3, 1, 'agendado');
  mkAppt(today, 17, 0, 30, 15, 0, 8, 'cancelado');
  // Spread across the month for calendar
  const monthDays = [2,4,4,5,5,6,9,10,11,12,12,15,16,17,18,19,22,23,24,25,26,29,30];
  monthDays.forEach((d, i) => {
    const h = 8 + (i % 9);
    mkAppt(`2026-06-${pad(d)}`, h, (i%2)*30, [30,40,50,60,90][i%5], i*3, i, i*2, apptStatus[i % 4].key);
    if (i % 3 === 0) mkAppt(`2026-06-${pad(d)}`, h+2, 0, 45, i*5+1, i+1, i+3, apptStatus[(i+1)%4].key);
  });
  // This week extra (week of June 1-7)
  mkAppt('2026-06-01', 10, 0, 50, 2, 1, 2, 'concluido');
  mkAppt('2026-06-02', 14, 0, 60, 8, 2, 5, 'concluido');
  mkAppt('2026-06-04', 9, 0, 40, 14, 0, 1, 'confirmado');
  mkAppt('2026-06-04', 11, 0, 90, 20, 2, 3, 'agendado');
  mkAppt('2026-06-05', 15, 0, 75, 6, 3, 9, 'agendado');

  const exams = [
    { id: 'ex1', patientId: 'pt7',  type: 'Radiografia Panorâmica', date: '2026-05-28', dentistId: 'd2', status: 'concluido', files: 2, notes: 'Sem alterações ósseas significativas. Presença de terceiros molares inclusos.' },
    { id: 'ex2', patientId: 'pt7',  type: 'Tomografia (TC)',        date: '2026-05-15', dentistId: 'd2', status: 'concluido', files: 4, notes: 'Avaliação para implante região 36. Volume ósseo adequado.' },
    { id: 'ex3', patientId: 'pt3',  type: 'Radiografia Periapical', date: '2026-06-01', dentistId: 'd3', status: 'pendente',  files: 1, notes: '' },
    { id: 'ex4', patientId: 'pt12', type: 'Documentação Ortodôntica', date: '2026-05-20', dentistId: 'd1', status: 'concluido', files: 6, notes: 'Documentação completa para planejamento ortodôntico.' },
    { id: 'ex5', patientId: 'pt5',  type: 'Radiografia Panorâmica', date: '2026-06-02', dentistId: 'd4', status: 'pendente',  files: 0, notes: '' },
  ];

  const activity = [
    { id: 'a1', type: 'appt',   ico: 'calendar', color: 'blue',  who: 'Dra. Marina Costa', text: 'confirmou a consulta de Ana Silva Santos', time: 'há 8 min' },
    { id: 'a2', type: 'patient',ico: 'user',     color: 'teal',  who: 'Recepção',          text: 'cadastrou novo paciente Bruno Costa Lima', time: 'há 25 min' },
    { id: 'a3', type: 'exam',   ico: 'file',     color: 'violet',who: 'Dr. Rafael Lima',   text: 'anexou resultado de Tomografia (TC)', time: 'há 1 h' },
    { id: 'a4', type: 'done',   ico: 'checkCircle',color:'green', who: 'Dra. Beatriz Souza',text: 'concluiu Tratamento de Canal de Carla Oliveira', time: 'há 2 h' },
    { id: 'a5', type: 'payment',ico: 'dollar',   color: 'green', who: 'Financeiro',        text: 'registrou pagamento de R$ 950,00', time: 'há 3 h' },
    { id: 'a6', type: 'cancel', ico: 'x',         color: 'rose',  who: 'Recepção',          text: 'cancelou consulta de William Ferreira', time: 'há 4 h' },
  ];

  const notifications = [
    { id: 'n1', ico: 'calendar', color: 'blue',  title: '3 consultas aguardando confirmação', time: 'há 15 min', unread: true },
    { id: 'n2', ico: 'file',     color: 'violet',title: 'Exame de Sofia pronto para análise', time: 'há 1 h', unread: true },
    { id: 'n3', ico: 'alert',    color: 'amber', title: 'Estoque de anestésico abaixo do mínimo', time: 'há 3 h', unread: true },
    { id: 'n4', ico: 'cake',     color: 'teal',  title: 'Aniversário hoje: Diego Souza Costa', time: 'há 5 h', unread: false },
  ];

  window.DATA = {
    dentists, team, plans, services, patients, appts, exams, activity, notifications,
    apptStatus, statusByKey, today,
    serviceCats: ['Clínica Geral','Prevenção','Dentística','Endodontia','Cirurgia','Estética','Ortodontia','Implantodontia','Radiologia','Prótese'],
    specialties: ['Clínico Geral','Ortodontia','Endodontia','Implantodontia','Periodontia','Cirurgia','Odontopediatria','Prótese','Estética','Radiologia'],
    clinic: {
      name: 'Odontotech',
      unit: 'Unidade Paulista',
      cnpj: '12.345.678/0001-90',
      phone: '(11) 3045-7890',
      email: 'contato@odontotech.com.br',
      address: 'Av. Paulista, 1500 — Bela Vista',
      city: 'São Paulo/SP',
      cep: '01310-100',
      businessHoursStart: '08:00',
      businessHoursEnd: '19:00',
      slotMinutes: 30,
      timezone: 'America/Sao_Paulo',
      user: { name: 'Dra. Marina Costa', role: 'Administradora', initials: 'MC' },
    },
  };

  // helpers
  window.fmtMoney = (v) => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  window.fmtDate = (iso) => { if(!iso) return '—'; const [y,m,d]=iso.split('-'); return `${d}/${m}/${y}`; };
  window.fmtDateShort = (iso) => { if(!iso) return '—'; const [y,m,d]=iso.split('-'); return `${d}/${m}`; };
  window.monthName = (m) => ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][m];
  window.dowName = (d) => ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][d];
  window.avatarColor = (seed) => {
    const colors = ['#1C6DD0','#0DA28C','#7A5AF0','#D9870F','#17A65A','#E04450','#0EA5E9','#DB2777'];
    let h = 0; for (let i=0;i<seed.length;i++) h = seed.charCodeAt(i) + ((h<<5)-h);
    return colors[Math.abs(h) % colors.length];
  };
})();
