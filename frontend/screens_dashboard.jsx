/* Odontotech — Dashboard */
(function () {
  const { useMemo } = React;
  const { Icon, Button, Card, Avatar, StatusBadge, WhatsAppButton } = window;

  function StatCard({ icon, color, label, value, delta, deltaDir, hint }) {
    return (
      <div className="stat fade-in">
        <div className="stat-top">
          <span className="stat-ico" style={{ background: `var(--${color}-soft)`, color: `var(--${color}-text)` }}><Icon name={icon} size={20} /></span>
          {delta && <span className={`stat-delta ${deltaDir}`}><Icon name={deltaDir === 'up' ? 'arrowUp' : deltaDir === 'down' ? 'arrowDown' : 'arrowRight'} size={13} />{delta}</span>}
        </div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className="muted-3" style={{ fontSize: 12 }}>{hint}</div>
      </div>
    );
  }

  function MiniBars() {
    const data = [38, 52, 44, 61, 48, 72, 30];
    const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const max = Math.max(...data);
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 130, padding: '6px 2px' }}>
        {data.map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', height: 100 }}>
              <div title={`${v} consultas`} style={{ width: '100%', height: `${(v / max) * 100}%`, borderRadius: '6px 6px 3px 3px', background: i === 5 ? 'var(--primary)' : 'var(--primary-soft)', transition: 'height .3s', minHeight: 6 }} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>{labels[i]}</span>
          </div>
        ))}
      </div>
    );
  }

  function Dashboard({ navigate }) {
    const { appts, today, activity, patients, dentists, clinic } = window.DATA;
    const todays = useMemo(() => appts.filter(a => a.date === today).sort((a, b) => (a.hour * 60 + a.min) - (b.hour * 60 + b.min)), [appts]);
    const hour = 13;
    const stats = [
      { icon: 'users', color: 'blue', label: 'Total de pacientes', value: patients.length, delta: `${patients.filter(p => p.status === 'ativo').length} ativos`, deltaDir: 'up', hint: 'Base cadastrada' },
      { icon: 'calendar', color: 'teal', label: 'Consultas hoje', value: todays.length, delta: `${todays.filter(a => a.status === 'confirmado').length} confirmadas`, deltaDir: 'flat', hint: `${todays.filter(a => a.status === 'concluido').length} concluídas até agora` },
      { icon: 'file', color: 'violet', label: 'Exames pendentes', value: (window.DATA.exams || []).filter(e => e.status === 'pendente').length, delta: 'laudo', deltaDir: 'flat', hint: 'Aguardando laudo' },
      { icon: 'dollar', color: 'green', label: 'Faturamento (mês)', value: 'R$ 84,2k', delta: '+11,8%', deltaDir: 'up', hint: 'Meta: R$ 90k' },
    ];

    const greeting = 'Boa tarde';
    return (
      <div className="page fade-in">
        <div className="page-head">
          <div>
            <h1 className="h1">{greeting}, Dra. Marina 👋</h1>
            <div className="sub">Terça-feira, 3 de junho de 2026 · {clinic.unit}</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" icon="calendar" onClick={() => navigate('agenda')}>Ver agenda</Button>
            <Button variant="primary" icon="plus" onClick={() => navigate('new-appointment')}>Nova consulta</Button>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 22 }}>
          {[
            { icon: 'plus', color: 'blue', label: 'Nova consulta', sub: 'Agendar atendimento', route: 'new-appointment' },
            { icon: 'user', color: 'teal', label: 'Novo paciente', sub: 'Cadastrar ficha', route: 'new-patient' },
            { icon: 'calendar', color: 'violet', label: 'Ver agenda', sub: 'Mês, semana, dia', route: 'agenda' },
            { icon: 'tooth', color: 'amber', label: 'Serviços', sub: 'Procedimentos', route: 'services' },
          ].map(q => (
            <button key={q.label} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left', cursor: 'pointer', transition: 'border .15s, transform .1s' }}
              onClick={() => navigate(q.route)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
              <span className="stat-ico" style={{ width: 40, height: 40, background: `var(--${q.color}-soft)`, color: `var(--${q.color}-text)` }}><Icon name={q.icon} size={20} /></span>
              <div>
                <div style={{ fontWeight: 650, fontSize: 14 }}>{q.label}</div>
                <div className="muted-3" style={{ fontSize: 12 }}>{q.sub}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="stat-grid" style={{ marginBottom: 22 }}>
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Two columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 22 }}>
          {/* Today's appointments */}
          <Card>
            <div className="card-head">
              <div>
                <h3 className="h3">Agenda de hoje</h3>
                <div className="muted-3" style={{ fontSize: 12.5, marginTop: 2 }}>{todays.length} consultas · {todays.filter(a => a.status === 'confirmado' || a.status === 'agendado').length} pendentes</div>
              </div>
              <Button variant="ghost" size="sm" iconRight="arrowRight" onClick={() => navigate('agenda')}>Ver tudo</Button>
            </div>
            <div style={{ padding: '8px 12px 12px' }}>
              {todays.map(a => {
                const past = a.status === 'concluido' || a.status === 'cancelado';
                const ampm = a.hour < 12 ? 'manhã' : 'tarde';
                const st = window.DATA.statusByKey[a.status];
                return (
                  <div key={a.id} className="appt-row" style={{ opacity: a.status === 'cancelado' ? 0.55 : 1 }} onClick={() => navigate('agenda')}>
                    <div className="appt-time">{String(a.hour).padStart(2, '0')}:{String(a.min).padStart(2, '0')}<span className="ampm">{ampm}</span></div>
                    <div className="appt-bar" style={{ background: `var(--${st.badge})` }} />
                    <Avatar name={a.patientName} size="md" />
                    <div className="appt-main">
                      <div className="appt-name" style={{ textDecoration: a.status === 'cancelado' ? 'line-through' : 'none' }}>{a.patientName}</div>
                      <div className="appt-meta"><Icon name="tooth" size={13} />{a.serviceName} · {a.dentistName.replace('Dra. ', 'Dra. ').replace('Dr. ', 'Dr. ')}</div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Right column: activity + chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <Card className="card-pad">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <h3 className="h3">Consultas na semana</h3>
                <span className="badge badge-green"><Icon name="trending" size={13} />+8%</span>
              </div>
              <MiniBars />
            </Card>

            <Card>
              <div className="card-head"><h3 className="h3">Atividade recente</h3></div>
              <div style={{ padding: '8px 18px 16px' }}>
                {activity.map((a, i) => (
                  <div key={a.id} className="activity-row" style={{ borderTop: i ? '1px solid var(--border)' : 'none' }}>
                    <span className="activity-ico" style={{ background: `var(--${a.color}-soft)`, color: `var(--${a.color}-text)` }}><Icon name={a.ico} size={16} /></span>
                    <div>
                      <div className="activity-text"><span className="who">{a.who}</span> {a.text}</div>
                      <div className="activity-time">{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  window.Dashboard = Dashboard;
})();
