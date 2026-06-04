/* Odontotech — Patients: list, registration stepper, detail (ficha) */
(function () {
  const { useState, useMemo } = React;
  const { Icon, Button, Card, Avatar, StatusBadge, Badge, Field, Input, Select, Textarea, Switch, Stepper, Pagination, EmptyState, WhatsAppButton, Menu } = window;

  const PER = 8;

  /* ============== LIST ============== */
  function PatientList({ navigate, patients, setPatients }) {
    const [q, setQ] = useState('');
    const [status, setStatus] = useState('all');
    const [plan, setPlan] = useState('all');
    const [sort, setSort] = useState({ key: 'name', dir: 1 });
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
      let r = patients.filter(p =>
        (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.cpf.includes(q) || p.phone.includes(q)) &&
        (status === 'all' || p.status === status) &&
        (plan === 'all' || p.planId === plan));
      r = [...r].sort((a, b) => {
        let av = a[sort.key], bv = b[sort.key];
        if (sort.key === 'lastVisit') { av = av || ''; bv = bv || ''; }
        return (av > bv ? 1 : av < bv ? -1 : 0) * sort.dir;
      });
      return r;
    }, [q, status, plan, sort, patients]);

    const pageCount = Math.ceil(filtered.length / PER) || 1;
    const pageItems = filtered.slice((page - 1) * PER, page * PER);
    const toggleSort = (key) => setSort(s => ({ key, dir: s.key === key ? -s.dir : 1 }));
    const SortTh = ({ k, children, style }) => (
      <th className="sortable" style={style} onClick={() => toggleSort(k)}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>{children}{sort.key === k && <Icon name={sort.dir === 1 ? 'arrowUp' : 'arrowDown'} size={12} />}</span>
      </th>
    );

    return (
      <div className="page fade-in">
        <div className="page-head">
          <div><h1 className="h1">Gestão de Pacientes</h1><div className="sub">{patients.length} pacientes cadastrados · {patients.filter(p => p.status === 'ativo').length} ativos</div></div>
          <Button variant="primary" icon="plus" onClick={() => navigate('new-patient')}>Novo paciente</Button>
        </div>

        <div className="table-wrap">
          <div className="table-toolbar">
            <div style={{ flex: 1, maxWidth: 320 }}>
              <Input lead={<Icon name="search" size={16} />} placeholder="Buscar nome, CPF ou telefone..." value={q} onChange={e => { setQ(e.target.value); setPage(1); }} />
            </div>
            <Select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} style={{ width: 'auto' }}>
              <option value="all">Todos os status</option><option value="ativo">Ativos</option><option value="inativo">Inativos</option>
            </Select>
            <Select value={plan} onChange={e => { setPlan(e.target.value); setPage(1); }} style={{ width: 'auto' }}>
              <option value="all">Todos os convênios</option>
              {window.DATA.plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <div style={{ flex: 1 }} />
            <Button variant="secondary" size="sm" icon="download" onClick={() => window.toast('Exportando CSV...')}>Exportar</Button>
          </div>

          {pageItems.length === 0 ? (
            <EmptyState icon="users" title="Nenhum paciente encontrado" text="Ajuste os filtros ou cadastre um novo paciente." action={<Button variant="primary" icon="plus" onClick={() => navigate('new-patient')}>Novo paciente</Button>} />
          ) : (
            <div className="table-scroll">
              <table className="tbl">
                <thead><tr>
                  <SortTh k="name">Paciente</SortTh>
                  <th>CPF</th>
                  <SortTh k="age" style={{ textAlign: 'center' }}>Idade</SortTh>
                  <th>Convênio</th>
                  <SortTh k="lastVisit">Última consulta</SortTh>
                  <SortTh k="status">Status</SortTh>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr></thead>
                <tbody>
                  {pageItems.map(p => (
                    <tr key={p.id} className="clickable" onClick={() => navigate('patient-detail', { id: p.id })}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                          <Avatar name={p.name} size="md" />
                          <div>
                            <div className="td-strong">{p.name}{p.isMinor && <span className="badge badge-amber" style={{ marginLeft: 8, fontSize: 10.5, padding: '1px 7px' }}>menor</span>}</div>
                            <div className="muted-3" style={{ fontSize: 12 }}>{p.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="mono muted" style={{ fontSize: 12.5 }}>{p.cpf}</td>
                      <td style={{ textAlign: 'center' }}>{p.age}</td>
                      <td><Badge color={(window.DATA.plans.find(pl => pl.id === p.planId) || {}).color || 'gray'}>{p.planName || '—'}</Badge></td>
                      <td className="muted">{window.fmtDate(p.lastVisit)}</td>
                      <td><StatusBadge2 status={p.status} /></td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="row-actions">
                          <button className="row-action" title="Ver ficha" onClick={() => navigate('patient-detail', { id: p.id })}><Icon name="eye" size={16} /></button>
                          <button className="row-action" title="Editar" onClick={() => navigate('edit-patient', { id: p.id })}><Icon name="edit" size={16} /></button>
                          <Menu align="right" trigger={<button className="row-action"><Icon name="dotsV" size={16} /></button>} items={[
                            { icon: 'calendar', label: 'Agendar consulta', onClick: () => navigate('new-appointment', { patientId: p.id }) },
                            { icon: 'file', label: 'Ver exames', onClick: () => navigate('exams') },
                            { divider: true },
                            { icon: 'trash', label: 'Excluir', danger: true, onClick: async () => { try { await window.API.deletePatient(p.id); setPatients(l => l.filter(x => x.id !== p.id)); window.toast('Paciente excluído', 'warn'); } catch (err) { window.toast(err.message || 'Erro ao excluir', 'error'); } } },
                          ]} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={page} pageCount={pageCount} total={filtered.length} onPage={setPage} perPage={PER} />
        </div>
      </div>
    );
  }
  function StatusBadge2({ status }) {
    return status === 'ativo' ? <Badge color="green" dot>Ativo</Badge> : <Badge color="gray" dot>Inativo</Badge>;
  }

  /* ============== REGISTRATION / EDIT (stepper) ============== */
  const STEPS = [
    { t: 'Dados pessoais', d: 'Identificação' },
    { t: 'Contato', d: 'Telefone e endereço' },
    { t: 'Saúde', d: 'Histórico clínico' },
    { t: 'Revisão', d: 'Confirmar dados' },
  ];

  function PatientForm({ navigate, patients, setPatients, editId }) {
    const existing = editId ? patients.find(p => p.id === editId) : null;
    const [step, setStep] = useState(0);
    const [f, setF] = useState(existing ? { ...existing, allergiesText: (existing.allergies || []).join(', '), conditionsText: (existing.conditions || []).join(', ') } : {
      name: '', cpf: '', birth: '', gender: 'Feminino', rg: '', planId: (window.DATA.plans[0] || {}).id || '',
      phone: '', email: '', cep: '', address: '', city: '', uf: 'SP',
      allergiesText: '', conditionsText: '', obs: '', isMinor: false, responsible: '', responsiblePhone: '',
      status: 'ativo',
    });
    const set = (k, v) => setF(p => ({ ...p, [k]: v }));

    const save = async () => {
      try {
        const saved = editId ? await window.API.updatePatient(editId, f) : await window.API.createPatient(f);
        setPatients(list => editId ? list.map(p => p.id === saved.id ? saved : p) : [...list, saved]);
        window.toast(editId ? 'Paciente atualizado!' : 'Paciente cadastrado com sucesso!', 'success');
        navigate(editId ? 'patient-detail' : 'patients', editId ? { id: saved.id } : undefined);
      } catch (err) {
        window.toast(err.message || 'Erro ao salvar paciente', 'error');
      }
    };

    const canNext = () => {
      if (step === 0) return f.name && f.cpf && f.birth;
      if (step === 1) return f.phone;
      return true;
    };

    return (
      <div className="page fade-in" style={{ maxWidth: 920 }}>
        <div className="breadcrumb"><a onClick={() => navigate('patients')}>Pacientes</a><Icon name="chevronRight" size={13} /><span>{editId ? 'Editar' : 'Novo paciente'}</span></div>
        <div className="page-head"><div><h1 className="h1">{editId ? 'Editar paciente' : 'Cadastro de paciente'}</h1><div className="sub">Preencha as informações em {STEPS.length} etapas.</div></div></div>

        <Card className="card-pad" style={{ marginBottom: 22, overflowX: 'auto' }}>
          <Stepper steps={STEPS} current={step} />
        </Card>

        <Card className="card-pad">
          {step === 0 && (
            <div className="fade-in">
              <div className="form-section-title"><span className="num">1</span>Dados pessoais</div>
              <div className="form-grid" style={{ marginTop: 16 }}>
                <Field label="Nome completo" required span2><Input value={f.name} onChange={e => set('name', e.target.value)} placeholder="Ex.: Ana Silva Santos" /></Field>
                <Field label="CPF" required><Input value={f.cpf} onChange={e => set('cpf', e.target.value)} placeholder="000.000.000-00" className="mono" /></Field>
                <Field label="RG"><Input value={f.rg} onChange={e => set('rg', e.target.value)} placeholder="00.000.000-0" className="mono" /></Field>
                <Field label="Data de nascimento" required><Input type="date" value={f.birth} onChange={e => set('birth', e.target.value)} /></Field>
                <Field label="Sexo"><Select value={f.gender} onChange={e => set('gender', e.target.value)}><option>Feminino</option><option>Masculino</option><option>Outro</option></Select></Field>
                <Field label="Convênio / Plano" span2>
                  <Select value={f.planId} onChange={e => set('planId', e.target.value)}>{window.DATA.plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</Select>
                </Field>
              </div>
              <hr className="divider" style={{ margin: '20px 0 16px' }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <Switch checked={f.isMinor} onChange={v => set('isMinor', v)} />
                <div><div style={{ fontWeight: 600, fontSize: 13.5 }}>Paciente menor de idade</div><div className="muted-3" style={{ fontSize: 12 }}>Exige cadastro de responsável legal.</div></div>
              </label>
              {f.isMinor && (
                <div className="form-grid" style={{ marginTop: 16 }}>
                  <Field label="Responsável legal" required><Input value={f.responsible} onChange={e => set('responsible', e.target.value)} placeholder="Nome do responsável" /></Field>
                  <Field label="Telefone do responsável" required><Input value={f.responsiblePhone} onChange={e => set('responsiblePhone', e.target.value)} placeholder="(11) 90000-0000" /></Field>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="fade-in">
              <div className="form-section-title"><span className="num">2</span>Contato e endereço</div>
              <div className="form-grid" style={{ marginTop: 16 }}>
                <Field label="Telefone / WhatsApp" required><Input value={f.phone} onChange={e => set('phone', e.target.value)} lead={<Icon name="phone" size={16} />} placeholder="(11) 90000-0000" /></Field>
                <Field label="E-mail"><Input type="email" value={f.email} onChange={e => set('email', e.target.value)} lead={<Icon name="mail" size={16} />} placeholder="email@exemplo.com" /></Field>
                <Field label="CEP"><Input value={f.cep} onChange={e => set('cep', e.target.value)} placeholder="00000-000" className="mono" /></Field>
                <Field label="Cidade"><Input value={f.city} onChange={e => set('city', e.target.value)} placeholder="São Paulo" /></Field>
                <Field label="Endereço" span2><Input value={f.address} onChange={e => set('address', e.target.value)} lead={<Icon name="mapPin" size={16} />} placeholder="Rua, número, bairro" /></Field>
                <Field label="Estado"><Select value={f.uf} onChange={e => set('uf', e.target.value)}>{['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA'].map(u => <option key={u}>{u}</option>)}</Select></Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in">
              <div className="form-section-title"><span className="num">3</span>Histórico de saúde</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                <Field label="Alergias" hint="Separe por vírgula. Ex.: Penicilina, Látex">
                  <Input value={f.allergiesText} onChange={e => set('allergiesText', e.target.value)} lead={<Icon name="alert" size={16} />} placeholder="Nenhuma alergia conhecida" />
                </Field>
                <Field label="Condições / doenças pré-existentes" hint="Ex.: Hipertensão, Diabetes">
                  <Input value={f.conditionsText} onChange={e => set('conditionsText', e.target.value)} lead={<Icon name="heart" size={16} />} placeholder="Nenhuma condição informada" />
                </Field>
                <Field label="Observações clínicas">
                  <Textarea value={f.obs} onChange={e => set('obs', e.target.value)} placeholder="Medicações em uso, cuidados especiais, histórico relevante..." style={{ minHeight: 110 }} />
                </Field>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="fade-in">
              <div className="form-section-title"><span className="num">4</span>Revisão dos dados</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16, marginBottom: 20, padding: 16, background: 'var(--surface-2)', borderRadius: 'var(--r-md)' }}>
                <Avatar name={f.name || '?'} size="lg" />
                <div><div style={{ fontWeight: 700, fontSize: 17 }}>{f.name || 'Sem nome'}</div><div className="muted mono" style={{ fontSize: 13 }}>{f.cpf || 'CPF não informado'}</div></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 10 }}>Pessoais</div>
                  <dl className="kv"><dt>Nascimento</dt><dd>{window.fmtDate(f.birth)}</dd><dt>Sexo</dt><dd>{f.gender}</dd><dt>Convênio</dt><dd>{(window.DATA.plans.find(p => p.id === f.planId) || {}).name || '—'}</dd>{f.isMinor && <><dt>Responsável</dt><dd>{f.responsible || '—'}</dd></>}</dl>
                </div>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 10 }}>Contato</div>
                  <dl className="kv"><dt>Telefone</dt><dd>{f.phone || '—'}</dd><dt>E-mail</dt><dd>{f.email || '—'}</dd><dt>Cidade</dt><dd>{f.city || '—'} / {f.uf}</dd></dl>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <div className="eyebrow" style={{ marginBottom: 10 }}>Saúde</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(f.allergiesText ? f.allergiesText.split(',').map(s => s.trim()).filter(Boolean) : []).map(a => <Badge key={a} color="rose">{a}</Badge>)}
                    {(f.conditionsText ? f.conditionsText.split(',').map(s => s.trim()).filter(Boolean) : []).map(c => <Badge key={c} color="amber">{c}</Badge>)}
                    {!f.allergiesText && !f.conditionsText && <span className="muted-3" style={{ fontSize: 13 }}>Sem registros de saúde.</span>}
                  </div>
                  {f.obs && <p className="muted" style={{ marginTop: 12, fontSize: 13.5 }}>{f.obs}</p>}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <Button variant="ghost" onClick={() => step === 0 ? navigate('patients') : setStep(s => s - 1)} icon={step === 0 ? 'x' : 'chevronLeft'}>{step === 0 ? 'Cancelar' : 'Voltar'}</Button>
            <div style={{ display: 'flex', gap: 10 }}>
              <span className="muted-3" style={{ alignSelf: 'center', fontSize: 12.5 }}>Etapa {step + 1} de {STEPS.length}</span>
              {step < STEPS.length - 1
                ? <Button variant="primary" iconRight="chevronRight" disabled={!canNext()} onClick={() => setStep(s => s + 1)}>Continuar</Button>
                : <Button variant="primary" icon="check" onClick={save}>{editId ? 'Salvar alterações' : 'Concluir cadastro'}</Button>}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  /* ============== DETAIL (Ficha completa) ============== */
  function PatientDetail({ navigate, patients, appts, params }) {
    const p = patients.find(x => x.id === params.id) || patients[0];
    const plan = window.DATA.plans.find(pl => pl.id === p.planId);
    const history = useMemo(() => appts.filter(a => a.patientId === p.id).sort((a, b) => b.date.localeCompare(a.date)), [appts, p.id]);
    const nextAppt = history.find(a => a.date >= window.DATA.today && (a.status === 'agendado' || a.status === 'confirmado'));

    const Section = ({ title, action, children }) => (
      <Card style={{ marginBottom: 18 }}>
        <div className="card-head"><h3 className="h3">{title}</h3>{action}</div>
        <div className="card-body">{children}</div>
      </Card>
    );

    return (
      <div className="page fade-in" style={{ maxWidth: 1160 }}>
        <div className="breadcrumb"><a onClick={() => navigate('patients')}>Pacientes</a><Icon name="chevronRight" size={13} /><span>{p.name}</span></div>

        {/* Header */}
        <Card className="card-pad" style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, flexWrap: 'wrap' }}>
            <Avatar name={p.name} size="xl" />
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 className="h1" style={{ fontSize: 24 }}>{p.name}</h1>
                <StatusBadge2 status={p.status} />
                {p.isMinor && <Badge color="amber">Menor de idade</Badge>}
              </div>
              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 10, color: 'var(--text-2)', fontSize: 13.5 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="phone" size={15} />{p.phone}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="mono"><Icon name="user" size={15} />{p.cpf}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="cake" size={15} />{p.age} anos · {window.fmtDate(p.birth)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="shield" size={15} />{plan.name}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <WhatsAppButton phone={p.phone} />
              <Button variant="secondary" icon="edit" onClick={() => navigate('edit-patient', { id: p.id })}>Editar</Button>
              <Button variant="primary" icon="plus" onClick={() => navigate('new-appointment', { patientId: p.id })}>Agendar</Button>
            </div>
          </div>
          {/* Summary stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginTop: 20 }}>
            {[
              { l: 'Total de consultas', v: p.consultations, i: 'calendar', c: 'blue' },
              { l: 'Última consulta', v: window.fmtDate(p.lastVisit), i: 'clock', c: 'teal', small: true },
              { l: 'Próxima consulta', v: nextAppt ? window.fmtDate(nextAppt.date) : 'Nenhuma', i: 'arrowRight', c: 'green', small: true },
            ].map(s => (
              <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
                <span className="stat-ico" style={{ width: 38, height: 38, background: `var(--${s.c}-soft)`, color: `var(--${s.c}-text)` }}><Icon name={s.i} size={18} /></span>
                <div><div className="muted-3" style={{ fontSize: 12 }}>{s.l}</div><div style={{ fontWeight: 700, fontSize: s.small ? 16 : 22, letterSpacing: '-0.01em' }}>{s.v}</div></div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, alignItems: 'start' }}>
          <div>
            {/* Consultations history */}
            <Section title="Últimas consultas" action={<Button variant="ghost" size="sm" iconRight="arrowRight" onClick={() => navigate('agenda')}>Ver agenda</Button>}>
              {history.length === 0 ? <EmptyState icon="calendar" title="Sem consultas" text="Este paciente ainda não possui consultas registradas." /> : (
                <div className="list">
                  {history.slice(0, 6).map(a => (
                    <div key={a.id} className="list-row">
                      <span className="stat-ico" style={{ width: 36, height: 36, background: `var(--${window.DATA.statusByKey[a.status].badge}-soft)`, color: `var(--${window.DATA.statusByKey[a.status].badge}-text)` }}><Icon name="tooth" size={17} /></span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{a.serviceName}</div>
                        <div className="muted-3" style={{ fontSize: 12 }}>{window.fmtDate(a.date)} · {String(a.hour).padStart(2, '0')}:{String(a.min).padStart(2, '0')} · {a.dentistName}</div>
                      </div>
                      <StatusBadge status={a.status} />
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Quick links */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { t: 'Prontuário (Ficha clínica)', d: 'Histórico de procedimentos e evolução', i: 'clipboard', c: 'violet', go: () => window.toast('Abrindo prontuário...') },
                { t: 'Exames', d: 'Radiografias, laudos e anexos', i: 'file', c: 'blue', go: () => navigate('exams') },
              ].map(l => (
                <button key={l.t} className="card card-pad" style={{ textAlign: 'left', cursor: 'pointer', display: 'flex', gap: 13, alignItems: 'flex-start' }}
                  onClick={l.go}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <span className="stat-ico" style={{ width: 40, height: 40, background: `var(--${l.c}-soft)`, color: `var(--${l.c}-text)`, flexShrink: 0 }}><Icon name={l.i} size={20} /></span>
                  <div><div style={{ fontWeight: 650, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>{l.t}<Icon name="arrowRight" size={14} /></div><div className="muted-3" style={{ fontSize: 12, marginTop: 3 }}>{l.d}</div></div>
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar: personal, health */}
          <div>
            <Section title="Dados pessoais" action={<button className="row-action" onClick={() => navigate('edit-patient', { id: p.id })} title="Editar"><Icon name="edit" size={16} /></button>}>
              <dl className="kv">
                <dt>E-mail</dt><dd>{p.email}</dd>
                <dt>Endereço</dt><dd>{p.address}</dd>
                <dt>Cidade</dt><dd>{p.city}</dd>
                <dt>CEP</dt><dd className="mono">{p.cep}</dd>
                <dt>Sexo</dt><dd>{p.gender}</dd>
                {p.isMinor && <><dt>Responsável</dt><dd>{p.responsible}</dd></>}
              </dl>
            </Section>

            <Section title="Saúde e observações">
              <div className="eyebrow" style={{ marginBottom: 8 }}>Alergias</div>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 16 }}>
                {p.allergies.length ? p.allergies.map(a => <Badge key={a} color="rose" dot>{a}</Badge>) : <span className="muted-3" style={{ fontSize: 13 }}>Nenhuma alergia conhecida</span>}
              </div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Condições</div>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: p.obs ? 16 : 0 }}>
                {p.conditions.length ? p.conditions.map(c => <Badge key={c} color="amber" dot>{c}</Badge>) : <span className="muted-3" style={{ fontSize: 13 }}>Nenhuma condição informada</span>}
              </div>
              {p.obs && <><div className="eyebrow" style={{ marginBottom: 8 }}>Observações</div><p className="muted" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>{p.obs}</p></>}
            </Section>
          </div>
        </div>
      </div>
    );
  }

  Object.assign(window, { PatientList, PatientForm, PatientDetail });
})();
