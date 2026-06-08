/* Odontotech — Agenda (calendar) + Create appointment */
(function () {
  const { useState, useMemo } = React;
  const { Icon, Button, Card, Avatar, StatusBadge, Modal, Field, Input, Select, Textarea } = window;

  const TODAY = new Date(2026, 5, 3); // June 3 2026
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const startOfWeek = (d) => addDays(d, -d.getDay());
  const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8..19
  const SLOT_H = 56;

  function EventModal({ appt, onClose, onStatus, navigate }) {
    if (!appt) return null;
    const st = window.DATA.statusByKey[appt.status];
    const dentist = window.DATA.dentists.find(d => d.id === appt.dentistId) || {};
    const patient = window.DATA.patients.find(p => p.id === appt.patientId);
    const end = (() => { const m = appt.hour * 60 + appt.min + appt.dur; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; })();
    return (
      <Modal title="Detalhes da consulta" onClose={onClose} width={480}
        footer={<>
          <Button variant="ghost" icon="edit" onClick={() => { onClose(); navigate('edit-appointment', { id: appt.id }); }}>Editar</Button>
          <div style={{ flex: 1 }} />
          {appt.status !== 'cancelado' && <Button variant="danger-soft" icon="x" onClick={() => { onStatus(appt.id, 'cancelado'); onClose(); window.toast('Consulta cancelada', 'warn'); }}>Cancelar</Button>}
          {appt.status === 'agendado' && <Button variant="primary" icon="check" onClick={() => { onStatus(appt.id, 'confirmado'); onClose(); window.toast('Consulta confirmada', 'success'); }}>Confirmar</Button>}
          {appt.status === 'confirmado' && <Button variant="success" icon="check" onClick={() => { onStatus(appt.id, 'concluido'); onClose(); window.toast('Consulta concluída', 'success'); }}>Concluir</Button>}
        </>}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 18 }}>
          <Avatar name={appt.patientName} size="lg" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{appt.patientName}</div>
            <div className="muted" style={{ fontSize: 13 }}>{patient ? patient.phone : ''}</div>
          </div>
          <StatusBadge status={appt.status} />
        </div>
        <div className="kv" style={{ gridTemplateColumns: '120px 1fr' }}>
          <dt>Procedimento</dt><dd>{appt.serviceName}</dd>
          <dt>Profissional</dt><dd style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="tag-dot" style={{ background: `var(--${dentist.color})` }} />{appt.dentistName}</dd>
          <dt>Data</dt><dd>{window.fmtDate(appt.date)}</dd>
          <dt>Horário</dt><dd className="mono">{String(appt.hour).padStart(2, '0')}:{String(appt.min).padStart(2, '0')} – {end} ({appt.dur} min)</dd>
          <dt>Convênio</dt><dd>{appt.planName}</dd>
        </div>
        <div style={{ marginTop: 16 }}>
          <Button variant="secondary" size="sm" icon="user" onClick={() => { onClose(); navigate('patient-detail', { id: appt.patientId }); }}>Abrir ficha do paciente</Button>
        </div>
      </Modal>
    );
  }

  function MonthView({ cursor, appts, onEvent, onDayClick }) {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const gridStart = startOfWeek(first);
    const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
    const byDay = useMemo(() => {
      const m = {};
      appts.forEach(a => { (m[a.date] = m[a.date] || []).push(a); });
      Object.values(m).forEach(list => list.sort((a, b) => (a.hour * 60 + a.min) - (b.hour * 60 + b.min)));
      return m;
    }, [appts]);
    return (
      <div className="cal-grid">
        <div className="cal-dow">{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => <div key={d}>{d}</div>)}</div>
        <div className="cal-month">
          {cells.map((d, i) => {
            const out = d.getMonth() !== cursor.getMonth();
            const dayAppts = byDay[iso(d)] || [];
            return (
              <div key={i} className={`cal-cell ${out ? 'out' : ''} ${sameDay(d, TODAY) ? 'today' : ''}`} onClick={() => onDayClick(d)}>
                <div className="cal-date">{d.getDate()}</div>
                {dayAppts.slice(0, 3).map(a => {
                  const st = window.DATA.statusByKey[a.status];
                  return (
                    <div key={a.id} className={`cal-event ${st.ev}`} onClick={e => { e.stopPropagation(); onEvent(a); }}>
                      {String(a.hour).padStart(2, '0')}:{String(a.min).padStart(2, '0')} {a.patientName.split(' ')[0]}
                    </div>
                  );
                })}
                {dayAppts.length > 3 && <div className="cal-more">+{dayAppts.length - 3} mais</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function WeekView({ cursor, appts, onEvent, single }) {
    const days = single ? [cursor] : Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(cursor), i));
    const byDay = useMemo(() => {
      const m = {}; appts.forEach(a => { (m[a.date] = m[a.date] || []).push(a); }); return m;
    }, [appts]);
    return (
      <div className="cal-week" style={{ gridTemplateColumns: '56px 1fr' }}>
        {/* header row spanning */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div className="cal-week-head" style={{ gridTemplateColumns: '56px 1fr' }}>
            <div style={{ borderRight: '1px solid var(--border)' }} />
            <div className="cal-week-days" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
              {days.map((d, i) => (
                <div key={i} className={`cal-wd-col ${sameDay(d, TODAY) ? 'today' : ''}`}>
                  <div className="dow">{window.dowName(d.getDay())}</div>
                  <div className="dnum">{d.getDate()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* times */}
        <div className="cal-times">
          {HOURS.map(h => <div key={h} className="cal-time-slot">{String(h).padStart(2, '0')}:00</div>)}
        </div>
        {/* columns */}
        <div className="cal-cols" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
          {days.map((d, di) => {
            const dayAppts = (byDay[iso(d)] || []).filter(a => a.hour >= 8 && a.hour < 20);
            return (
              <div key={di} className="cal-col">
                {HOURS.map(h => <div key={h} className="cal-col-slot" />)}
                {dayAppts.map(a => {
                  const st = window.DATA.statusByKey[a.status];
                  const top = (a.hour - 8) * SLOT_H + (a.min / 60) * SLOT_H;
                  const height = Math.max(26, (a.dur / 60) * SLOT_H - 4);
                  return (
                    <div key={a.id} className={`cal-week-event ${st.ev}`} style={{ top, height }} onClick={() => onEvent(a)}>
                      <div className="we-t">{a.patientName.split(' ').slice(0, 2).join(' ')}</div>
                      {height > 38 && <div className="we-m">{a.serviceName}</div>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function Agenda({ navigate, appts, setAppts }) {
    const [view, setView] = useState('month');
    const [cursor, setCursor] = useState(new Date(2026, 5, 3));
    const [selected, setSelected] = useState(null);
    const [filterDentist, setFilterDentist] = useState('all');

    const filtered = useMemo(() => filterDentist === 'all' ? appts : appts.filter(a => a.dentistId === filterDentist), [appts, filterDentist]);

    const title = useMemo(() => {
      if (view === 'month') return `${window.monthName(cursor.getMonth())} ${cursor.getFullYear()}`;
      if (view === 'day') return `${cursor.getDate()} de ${window.monthName(cursor.getMonth())}, ${cursor.getFullYear()}`;
      const ws = startOfWeek(cursor), we = addDays(ws, 6);
      return `${ws.getDate()} – ${we.getDate()} de ${window.monthName(we.getMonth())}`;
    }, [view, cursor]);

    const move = (dir) => {
      if (view === 'month') setCursor(c => new Date(c.getFullYear(), c.getMonth() + dir, 1));
      else if (view === 'week') setCursor(c => addDays(c, dir * 7));
      else setCursor(c => addDays(c, dir));
    };
    const onStatus = async (id, status) => {
      setAppts(list => list.map(a => a.id === id ? { ...a, status } : a));
      try { await window.API.setAppointmentStatus(id, status); } catch (err) { window.toast(err.message || 'Erro ao atualizar status', 'error'); }
    };

    return (
      <div className="page fade-in" style={{ maxWidth: 1340 }}>
        <div className="page-head">
          <div>
            <h1 className="h1">Agendamento de Consultas</h1>
            <div className="sub">Visualize e gerencie a agenda da clínica.</div>
          </div>
          <Button variant="primary" icon="plus" onClick={() => navigate('new-appointment')}>Nova consulta</Button>
        </div>

        <div className="cal-head">
          <div className="cal-nav">
            <Button variant="secondary" size="sm" onClick={() => setCursor(new Date(2026, 5, 3))}>Hoje</Button>
            <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => move(-1)}><Icon name="chevronLeft" size={18} /></button>
            <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => move(1)}><Icon name="chevronRight" size={18} /></button>
            <div className="cal-title">{title}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Select value={filterDentist} onChange={e => setFilterDentist(e.target.value)} style={{ width: 'auto' }}>
              <option value="all">Todos os dentistas</option>
              {window.DATA.dentists.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
            <window.Segmented value={view} onChange={setView} options={[{ value: 'month', label: 'Mês' }, { value: 'week', label: 'Semana' }, { value: 'day', label: 'Dia' }]} />
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          {window.DATA.apptStatus.map(s => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--text-2)' }}>
              <span className="tag-dot" style={{ background: `var(--${s.badge})` }} />{s.label}
            </div>
          ))}
        </div>

        <div style={{ maxHeight: view === 'month' ? 'none' : 680, overflowY: view === 'month' ? 'visible' : 'auto', borderRadius: 'var(--r-lg)' }}>
          {view === 'month' && <MonthView cursor={cursor} appts={filtered} onEvent={setSelected} onDayClick={(d) => { setCursor(d); setView('day'); }} />}
          {view === 'week' && <WeekView cursor={cursor} appts={filtered} onEvent={setSelected} />}
          {view === 'day' && <WeekView cursor={cursor} appts={filtered} onEvent={setSelected} single />}
        </div>

        <EventModal appt={selected} onClose={() => setSelected(null)} onStatus={onStatus} navigate={navigate} />
      </div>
    );
  }

  /* ---------- Create appointment ---------- */
  function CreateAppointment({ navigate, appts, setAppts, preset }) {
    const { patients, dentists, services } = window.DATA;
    const [q, setQ] = useState('');
    const [patientId, setPatientId] = useState(preset && preset.patientId || '');
    const [dentistId, setDentistId] = useState((dentists[0] || {}).id || '');
    const [serviceId, setServiceId] = useState('');
    const [date, setDate] = useState('2026-06-04');
    const [time, setTime] = useState('09:00');
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState('agendado');

    const results = useMemo(() => !q ? [] : patients.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.cpf.includes(q)).slice(0, 5), [q]);
    const patient = patients.find(p => p.id === patientId);
    const service = services.find(s => s.id === serviceId);
    const dentist = dentists.find(d => d.id === dentistId);

    const save = async () => {
      if (!patientId) return window.toast('Selecione um paciente', 'error');
      if (!serviceId) return window.toast('Selecione um procedimento', 'error');
      if (!dentistId) return window.toast('Selecione um dentista', 'error');
      try {
        const saved = await window.API.createAppointment({ patientId, dentistId, serviceId, date, time, status, notes });
        setAppts(list => [...list, saved]);
        window.toast('Consulta agendada com sucesso!', 'success');
        navigate('agenda');
      } catch (err) {
        window.toast(err.message || 'Erro ao agendar consulta', 'error');
      }
    };

    return (
      <div className="page fade-in" style={{ maxWidth: 1100 }}>
        <div className="breadcrumb"><a onClick={() => navigate('agenda')}>Agenda</a><Icon name="chevronRight" size={13} /><span>Nova consulta</span></div>
        <div className="page-head">
          <div><h1 className="h1">Nova consulta</h1><div className="sub">Agende um novo atendimento.</div></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 22, alignItems: 'start' }}>
          <Card className="card-pad">
            {/* Patient */}
            <div className="form-section-title"><span className="num">1</span>Paciente</div>
            {!patient ? (
              <div style={{ position: 'relative', marginTop: 12 }}>
                <Input lead={<Icon name="search" size={17} />} placeholder="Buscar por nome ou CPF..." value={q} onChange={e => setQ(e.target.value)} />
                {results.length > 0 && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-pop)', padding: 6 }}>
                    {results.map(p => (
                      <button key={p.id} onClick={() => { setPatientId(p.id); setQ(''); }} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: 9, border: 'none', background: 'transparent', borderRadius: 'var(--r-xs)', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <Avatar name={p.name} size="sm" />
                        <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.name}</div><div className="mono muted-3" style={{ fontSize: 11.5 }}>{p.cpf}</div></div>
                        <span className="badge badge-gray">{p.planName}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="hint" style={{ marginTop: 8 }}>Não encontrou? <a style={{ color: 'var(--primary-text)', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('new-patient')}>Cadastrar novo paciente</a></div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, padding: 12, background: 'var(--surface-2)', borderRadius: 'var(--r-md)' }}>
                <Avatar name={patient.name} size="md" />
                <div style={{ flex: 1 }}><div style={{ fontWeight: 650 }}>{patient.name}</div><div className="muted-3 mono" style={{ fontSize: 12 }}>{patient.cpf} · {patient.phone}</div></div>
                <Button variant="ghost" size="sm" onClick={() => setPatientId('')}>Trocar</Button>
              </div>
            )}

            <hr className="divider" style={{ margin: '22px 0' }} />
            <div className="form-section-title"><span className="num">2</span>Procedimento e profissional</div>
            <div className="form-grid" style={{ marginTop: 12 }}>
              <Field label="Procedimento" required span2>
                <Select value={serviceId} onChange={e => setServiceId(e.target.value)}>
                  <option value="">Selecione um procedimento...</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} — {window.fmtMoney(s.price)} ({s.dur}min)</option>)}
                </Select>
              </Field>
              <Field label="Dentista" required span2>
                <Select value={dentistId} onChange={e => setDentistId(e.target.value)}>
                  {dentists.map(d => <option key={d.id} value={d.id}>{d.name} — {d.spec}</option>)}
                </Select>
              </Field>
            </div>

            <hr className="divider" style={{ margin: '22px 0' }} />
            <div className="form-section-title"><span className="num">3</span>Data e horário</div>
            <div className="form-grid" style={{ marginTop: 12 }}>
              <Field label="Data" required><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></Field>
              <Field label="Horário" required><Input type="time" value={time} onChange={e => setTime(e.target.value)} /></Field>
              <Field label="Status inicial" span2>
                <div className="radio-pills">
                  {['agendado', 'confirmado'].map(s => (
                    <button key={s} type="button" className={`radio-pill ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)}>{window.DATA.statusByKey[s].label}</button>
                  ))}
                </div>
              </Field>
              <Field label="Observações" span2><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anotações sobre a consulta..." /></Field>
            </div>
          </Card>

          {/* Summary */}
          <Card className="card-pad" style={{ position: 'sticky', top: 20 }}>
            <h3 className="h3" style={{ marginBottom: 16 }}>Resumo</h3>
            <div className="kv" style={{ gridTemplateColumns: '92px 1fr', fontSize: 13 }}>
              <dt>Paciente</dt><dd>{patient ? patient.name : <span className="muted-3">—</span>}</dd>
              <dt>Procedimento</dt><dd>{service ? service.name : <span className="muted-3">—</span>}</dd>
              <dt>Dentista</dt><dd>{dentist ? dentist.name : '—'}</dd>
              <dt>Data</dt><dd>{window.fmtDate(date)}</dd>
              <dt>Horário</dt><dd className="mono">{time}{service ? ` (${service.dur}min)` : ''}</dd>
              <dt>Convênio</dt><dd>{patient ? patient.planName : <span className="muted-3">—</span>}</dd>
            </div>
            <hr className="divider" style={{ margin: '16px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <span className="muted">Valor estimado</span>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>{service ? window.fmtMoney(service.price) : 'R$ 0,00'}</span>
            </div>
            <Button variant="primary" className="btn-block" icon="check" onClick={save}>Agendar consulta</Button>
            <Button variant="ghost" className="btn-block" style={{ marginTop: 8 }} onClick={() => navigate('agenda')}>Cancelar</Button>
          </Card>
        </div>
      </div>
    );
  }

  function EditAppointment({ navigate, appts, setAppts, params }) {
    const { patients, dentists, services } = window.DATA;
    const appt = appts.find(a => a.id === params.id);

    const [q, setQ] = useState('');
    const [patientId, setPatientId] = useState(appt ? appt.patientId : '');
    const [dentistId, setDentistId] = useState(appt ? appt.dentistId : (dentists[0] || {}).id || '');
    const [serviceId, setServiceId] = useState(appt ? (appt.serviceId || '') : '');
    const [date, setDate] = useState(appt ? appt.date : '');
    const [time, setTime] = useState(appt ? `${String(appt.hour).padStart(2, '0')}:${String(appt.min).padStart(2, '0')}` : '09:00');
    const [notes, setNotes] = useState(appt ? (appt.notes || '') : '');
    const [status, setStatus] = useState(appt ? appt.status : 'agendado');

    if (!appt) return (
      <div className="page fade-in">
        <div className="page-head"><h1 className="h1">Consulta não encontrada</h1></div>
        <Button variant="ghost" onClick={() => navigate('agenda')}>Voltar à agenda</Button>
      </div>
    );

    const results = useMemo(() => !q ? [] : patients.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.cpf.includes(q)).slice(0, 5), [q]);
    const patient = patients.find(p => p.id === patientId);
    const service = services.find(s => s.id === serviceId);
    const dentist = dentists.find(d => d.id === dentistId);

    const save = async () => {
      if (!patientId) return window.toast('Selecione um paciente', 'error');
      try {
        const saved = await window.API.updateAppointment(appt.id, { patientId, dentistId, serviceId: serviceId || null, date, time, status, notes });
        setAppts(list => list.map(a => a.id === saved.id ? saved : a));
        window.toast('Consulta atualizada!', 'success');
        navigate('agenda');
      } catch (err) {
        window.toast(err.message || 'Erro ao atualizar consulta', 'error');
      }
    };

    return (
      <div className="page fade-in" style={{ maxWidth: 1100 }}>
        <div className="breadcrumb"><a onClick={() => navigate('agenda')}>Agenda</a><Icon name="chevronRight" size={13} /><span>Editar consulta</span></div>
        <div className="page-head">
          <div><h1 className="h1">Editar consulta</h1><div className="sub">Altere os dados do agendamento.</div></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 22, alignItems: 'start' }}>
          <Card className="card-pad">
            <div className="form-section-title"><span className="num">1</span>Paciente</div>
            {!patient ? (
              <div style={{ position: 'relative', marginTop: 12 }}>
                <Input lead={<Icon name="search" size={17} />} placeholder="Buscar por nome ou CPF..." value={q} onChange={e => setQ(e.target.value)} />
                {results.length > 0 && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-pop)', padding: 6 }}>
                    {results.map(p => (
                      <button key={p.id} onClick={() => { setPatientId(p.id); setQ(''); }} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: 9, border: 'none', background: 'transparent', borderRadius: 'var(--r-xs)', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <Avatar name={p.name} size="sm" />
                        <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.name}</div><div className="mono muted-3" style={{ fontSize: 11.5 }}>{p.cpf}</div></div>
                        <span className="badge badge-gray">{p.planName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, padding: 12, background: 'var(--surface-2)', borderRadius: 'var(--r-md)' }}>
                <Avatar name={patient.name} size="md" />
                <div style={{ flex: 1 }}><div style={{ fontWeight: 650 }}>{patient.name}</div><div className="muted-3 mono" style={{ fontSize: 12 }}>{patient.cpf} · {patient.phone}</div></div>
                <Button variant="ghost" size="sm" onClick={() => setPatientId('')}>Trocar</Button>
              </div>
            )}
            <hr className="divider" style={{ margin: '22px 0' }} />
            <div className="form-section-title"><span className="num">2</span>Procedimento e profissional</div>
            <div className="form-grid" style={{ marginTop: 12 }}>
              <Field label="Procedimento" span2>
                <Select value={serviceId} onChange={e => setServiceId(e.target.value)}>
                  <option value="">Selecione um procedimento...</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} — {window.fmtMoney(s.price)} ({s.dur}min)</option>)}
                </Select>
              </Field>
              <Field label="Dentista" required span2>
                <Select value={dentistId} onChange={e => setDentistId(e.target.value)}>
                  {dentists.map(d => <option key={d.id} value={d.id}>{d.name} — {d.spec}</option>)}
                </Select>
              </Field>
            </div>
            <hr className="divider" style={{ margin: '22px 0' }} />
            <div className="form-section-title"><span className="num">3</span>Data e horário</div>
            <div className="form-grid" style={{ marginTop: 12 }}>
              <Field label="Data" required><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></Field>
              <Field label="Horário" required><Input type="time" value={time} onChange={e => setTime(e.target.value)} /></Field>
              <Field label="Status" span2>
                <div className="radio-pills">
                  {['agendado', 'confirmado', 'atendimento', 'concluido', 'cancelado'].map(s => (
                    <button key={s} type="button" className={`radio-pill ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)}>{window.DATA.statusByKey[s].label}</button>
                  ))}
                </div>
              </Field>
              <Field label="Observações" span2><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anotações sobre a consulta..." /></Field>
            </div>
          </Card>
          <Card className="card-pad" style={{ position: 'sticky', top: 20 }}>
            <h3 className="h3" style={{ marginBottom: 16 }}>Resumo</h3>
            <div className="kv" style={{ gridTemplateColumns: '92px 1fr', fontSize: 13 }}>
              <dt>Paciente</dt><dd>{patient ? patient.name : <span className="muted-3">—</span>}</dd>
              <dt>Procedimento</dt><dd>{service ? service.name : <span className="muted-3">—</span>}</dd>
              <dt>Dentista</dt><dd>{dentist ? dentist.name : '—'}</dd>
              <dt>Data</dt><dd>{window.fmtDate(date)}</dd>
              <dt>Horário</dt><dd className="mono">{time}{service ? ` (${service.dur}min)` : ''}</dd>
              <dt>Convênio</dt><dd>{patient ? patient.planName : <span className="muted-3">—</span>}</dd>
            </div>
            <hr className="divider" style={{ margin: '16px 0' }} />
            <Button variant="primary" className="btn-block" icon="check" onClick={save}>Salvar alterações</Button>
            <Button variant="ghost" className="btn-block" style={{ marginTop: 8 }} onClick={() => navigate('agenda')}>Cancelar</Button>
          </Card>
        </div>
      </div>
    );
  }

  Object.assign(window, { Agenda, CreateAppointment, EditAppointment });
})();
