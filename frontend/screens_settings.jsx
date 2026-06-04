/* Odontotech — Configurações (clínica, equipe, agenda, aparência, design system) */
(function () {
  const { useState } = React;
  const { Icon, Button, Card, Badge, Field, Input, Select, Textarea, Switch, Segmented, Modal, EmptyState, Menu, Avatar } = window;

  const PRIMARY_OPTIONS = ['#1C6DD0', '#0E7C86', '#3E5BD6', '#0A6E50', '#7A5AF0'];
  const TEAM_COLORS = ['blue', 'teal', 'violet', 'amber', 'green', 'rose'];
  const ROLE = {
    ADMIN:   { label: 'Administrador(a)', badge: 'violet' },
    DENTIST: { label: 'Dentista',         badge: 'blue' },
  };

  const TABS = [
    { key: 'clinic',     icon: 'building', label: 'Clínica',       desc: 'Dados cadastrais e contato' },
    { key: 'team',       icon: 'users',    label: 'Equipe',        desc: 'Usuários e dentistas' },
    { key: 'agenda',     icon: 'calendar', label: 'Agenda',        desc: 'Horário e duração de consultas' },
    { key: 'appearance', icon: 'image',    label: 'Aparência',     desc: 'Tema, cor e densidade' },
    { key: 'design',     icon: 'grid',     label: 'Design System', desc: 'Tokens e componentes' },
  ];

  /* ---------- Reusable section header inside a panel ---------- */
  function PanelHead({ title, desc, action }) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
        <div>
          <h2 className="h2">{title}</h2>
          {desc && <div className="sub muted" style={{ fontSize: 13.5, marginTop: 4 }}>{desc}</div>}
        </div>
        {action}
      </div>
    );
  }

  /* ================= CLÍNICA ================= */
  function ClinicPanel() {
    const [f, setF] = useState({ ...window.DATA.clinic });
    const set = (k, v) => setF(p => ({ ...p, [k]: v }));
    const save = async () => {
      try {
        await window.API.updateSettings({ clinicName: f.name, unit: f.unit, cnpj: f.cnpj, phone: f.phone, email: f.email, address: f.address });
        Object.assign(window.DATA.clinic, f);
        window.toast('Dados da clínica salvos!', 'success');
      } catch (err) { window.toast(err.message || 'Erro ao salvar (requer perfil Administrador).', 'error'); }
    };
    return (
      <Card className="card-pad">
        <PanelHead title="Dados da clínica" desc="Informações exibidas em documentos, recibos e na identidade do sistema." />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
          <span className="stat-ico" style={{ width: 58, height: 58, borderRadius: 'var(--r-lg)', background: 'var(--primary-soft)', color: 'var(--primary-text)' }}>
            <Icon name="tooth" size={28} />
          </span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{f.name || 'Odontotech'}</div>
            <div className="muted-3" style={{ fontSize: 12.5 }}>{f.unit}</div>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 8, paddingLeft: 0 }} onClick={() => window.toast('Upload de logo (demo)')}>
              <Icon name="upload" size={15} /> Trocar logotipo
            </button>
          </div>
        </div>
        <div className="form-grid">
          <Field label="Nome da clínica" required><Input value={f.name} onChange={e => set('name', e.target.value)} /></Field>
          <Field label="Unidade"><Input value={f.unit || ''} onChange={e => set('unit', e.target.value)} placeholder="Ex.: Unidade Paulista" /></Field>
          <Field label="CNPJ"><Input className="mono" value={f.cnpj || ''} onChange={e => set('cnpj', e.target.value)} placeholder="00.000.000/0000-00" /></Field>
          <Field label="Telefone"><Input value={f.phone || ''} onChange={e => set('phone', e.target.value)} lead={<Icon name="phone" size={15} />} placeholder="(11) 0000-0000" /></Field>
          <Field label="E-mail de contato" span2><Input type="email" value={f.email || ''} onChange={e => set('email', e.target.value)} lead={<Icon name="mail" size={15} />} placeholder="contato@clinica.com.br" /></Field>
          <Field label="Endereço" span2><Input value={f.address || ''} onChange={e => set('address', e.target.value)} lead={<Icon name="mapPin" size={15} />} /></Field>
          <Field label="Cidade / UF"><Input value={f.city || ''} onChange={e => set('city', e.target.value)} /></Field>
          <Field label="CEP"><Input className="mono" value={f.cep || ''} onChange={e => set('cep', e.target.value)} placeholder="00000-000" /></Field>
        </div>
        <hr className="divider" style={{ margin: '22px 0 18px' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="ghost" onClick={() => setF({ ...window.DATA.clinic })}>Descartar</Button>
          <Button variant="primary" icon="check" onClick={save}>Salvar alterações</Button>
        </div>
      </Card>
    );
  }

  /* ================= EQUIPE ================= */
  function TeamPanel() {
    const [members, setMembers] = useState(window.DATA.team);
    const [q, setQ] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [editing, setEditing] = useState(null);

    const rows = members.filter(m =>
      (roleFilter === 'all' || m.role === roleFilter) &&
      (!q || m.name.toLowerCase().includes(q.toLowerCase()) || (m.email || '').toLowerCase().includes(q.toLowerCase()))
    );

    const save = async (m) => {
      const exists = m.id && members.find(x => x.id === m.id);
      const payload = { name: m.name, email: m.email, role: m.role, specialty: m.specialty || null, color: m.color, initials: m.initials, active: m.active };
      try {
        const saved = exists
          ? await window.API.updateUser(m.id, payload)
          : await window.API.createUser({ ...payload, password: m.password || 'mudar1234' });
        setMembers(l => exists ? l.map(x => x.id === saved.id ? saved : x) : [...l, saved]);
        window.toast(exists ? 'Membro atualizado!' : 'Membro adicionado!', 'success');
        setEditing(null);
      } catch (err) { window.toast(err.message || 'Erro ao salvar membro', 'error'); }
    };
    const toggleActive = async (m) => {
      setMembers(l => l.map(x => x.id === m.id ? { ...x, active: !x.active } : x));
      try { await window.API.updateUser(m.id, { active: !m.active }); } catch (err) { window.toast(err.message, 'error'); }
    };
    const remove = async (m) => {
      try { await window.API.deleteUser(m.id); setMembers(l => l.filter(x => x.id !== m.id)); window.toast('Membro removido', 'warn'); }
      catch (err) { window.toast(err.message || 'Erro ao remover', 'error'); }
    };

    return (
      <Card className="card-pad">
        <PanelHead title="Equipe" desc={`${members.filter(m => m.active).length} membros ativos · administradores e dentistas`}
          action={<Button variant="primary" icon="plus" onClick={() => setEditing({ name: '', email: '', role: 'DENTIST', specialty: '', color: 'blue', initials: '', active: true, _new: true })}>Adicionar membro</Button>} />

        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, maxWidth: 320 }}><Input lead={<Icon name="search" size={16} />} placeholder="Buscar por nome ou e-mail..." value={q} onChange={e => setQ(e.target.value)} /></div>
          <Segmented value={roleFilter} onChange={setRoleFilter} options={[{ value: 'all', label: 'Todos' }, { value: 'ADMIN', label: 'Admins' }, { value: 'DENTIST', label: 'Dentistas' }]} />
        </div>

        {rows.length === 0 ? <EmptyState icon="users" title="Nenhum membro encontrado" text="Ajuste a busca ou adicione um novo usuário." /> : (
          <div className="table-wrap">
            <div className="table-scroll">
              <table className="tbl">
                <thead><tr><th>Membro</th><th>Função</th><th>Especialidade</th><th>Status</th><th style={{ textAlign: 'right' }}>Ações</th></tr></thead>
                <tbody>
                  {rows.map(m => (
                    <tr key={m.id} className="clickable" onClick={() => setEditing(m)} style={{ opacity: m.active ? 1 : 0.55 }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                          <Avatar name={m.name} size="sm" />
                          <div><div className="td-strong">{m.name}</div><div className="muted-3" style={{ fontSize: 12 }}>{m.email}</div></div>
                        </div>
                      </td>
                      <td><Badge color={ROLE[m.role].badge}>{ROLE[m.role].label}</Badge></td>
                      <td className="muted">{m.specialty || '—'}</td>
                      <td>{m.active ? <Badge color="green" dot>Ativo</Badge> : <Badge color="gray" dot>Inativo</Badge>}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="row-actions">
                          <button className="row-action" title="Editar" onClick={() => setEditing(m)}><Icon name="edit" size={16} /></button>
                          <Menu align="right" trigger={<button className="row-action"><Icon name="dotsV" size={16} /></button>} items={[
                            { icon: m.active ? 'x' : 'check', label: m.active ? 'Desativar' : 'Ativar', onClick: () => toggleActive(m) },
                            { icon: 'lock', label: 'Redefinir senha', onClick: () => window.toast(`Link de redefinição enviado para ${m.email}`) },
                            { divider: true },
                            { icon: 'trash', label: 'Excluir', danger: true, onClick: () => remove(m) },
                          ]} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {editing && <MemberModal member={editing} onClose={() => setEditing(null)} onSave={save} />}
      </Card>
    );
  }

  function MemberModal({ member, onClose, onSave }) {
    const [f, setF] = useState({ ...member });
    const set = (k, v) => setF(p => ({ ...p, [k]: v }));
    const initials = (f.initials || f.name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('')).toUpperCase().slice(0, 3);
    const valid = f.name.trim() && /\S+@\S+\.\S+/.test(f.email || '');
    return (
      <Modal title={member._new ? 'Adicionar membro' : 'Editar membro'} subtitle="Usuário com acesso ao sistema" onClose={onClose} width={560}
        footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button variant="primary" icon="check" onClick={() => onSave({ ...f, initials })} disabled={!valid}>Salvar</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Nome completo" required><Input value={f.name} onChange={e => set('name', e.target.value)} placeholder="Ex.: Dra. Marina Costa" /></Field>
          <Field label="E-mail" required hint="Usado para login no sistema."><Input type="email" value={f.email || ''} onChange={e => set('email', e.target.value)} lead={<Icon name="mail" size={15} />} placeholder="nome@odontotech.com.br" /></Field>
          <div className="form-grid">
            <Field label="Função" required>
              <Select value={f.role} onChange={e => set('role', e.target.value)}>
                <option value="DENTIST">Dentista</option>
                <option value="ADMIN">Administrador(a)</option>
              </Select>
            </Field>
            <Field label="Especialidade">
              <Select value={f.specialty || ''} onChange={e => set('specialty', e.target.value || null)} disabled={f.role !== 'DENTIST'}>
                <option value="">— Nenhuma</option>
                {window.DATA.specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
          </div>
          {member._new && <Field label="Senha provisória" required hint="O usuário poderá alterá-la no primeiro acesso."><Input type="password" value={f.password || ''} onChange={e => set('password', e.target.value)} lead={<Icon name="lock" size={15} />} placeholder="Mínimo 6 caracteres" /></Field>}
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Cor de identificação</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {TEAM_COLORS.map(c => (
                <button key={c} onClick={() => set('color', c)} title={c} style={{
                  width: 30, height: 30, borderRadius: '50%', background: `var(--${c})`, cursor: 'pointer',
                  border: f.color === c ? '2.5px solid var(--text)' : '2.5px solid transparent', boxShadow: '0 0 0 1px var(--border)',
                }} />
              ))}
              <span className="avatar avatar-sm" style={{ marginLeft: 'auto', background: `var(--${f.color})` }}>{initials || '?'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
            <div><div style={{ fontWeight: 600, fontSize: 13.5 }}>Usuário ativo</div><div className="muted-3" style={{ fontSize: 12 }}>Permite login e aparição na agenda.</div></div>
            <Switch checked={f.active} onChange={v => set('active', v)} />
          </div>
        </div>
      </Modal>
    );
  }

  /* ================= AGENDA ================= */
  function AgendaPanel() {
    const [f, setF] = useState({
      businessHoursStart: window.DATA.clinic.businessHoursStart,
      businessHoursEnd: window.DATA.clinic.businessHoursEnd,
      slotMinutes: window.DATA.clinic.slotMinutes,
      timezone: window.DATA.clinic.timezone,
    });
    const set = (k, v) => setF(p => ({ ...p, [k]: v }));
    const save = async () => {
      try {
        await window.API.updateSettings({ businessHoursStart: f.businessHoursStart, businessHoursEnd: f.businessHoursEnd, appointmentSlotMinutes: f.slotMinutes, timezone: f.timezone });
        Object.assign(window.DATA.clinic, f);
        window.toast('Configurações da agenda salvas!', 'success');
      } catch (err) { window.toast(err.message || 'Erro ao salvar (requer perfil Administrador).', 'error'); }
    };
    const hours = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0') + ':00');
    return (
      <Card className="card-pad">
        <PanelHead title="Agenda" desc="Define o horário de funcionamento e a granularidade dos agendamentos." />
        <div className="form-grid">
          <Field label="Abertura" hint="Primeiro horário disponível."><Select value={f.businessHoursStart} onChange={e => set('businessHoursStart', e.target.value)}>{hours.map(h => <option key={h}>{h}</option>)}</Select></Field>
          <Field label="Fechamento" hint="Último horário disponível."><Select value={f.businessHoursEnd} onChange={e => set('businessHoursEnd', e.target.value)}>{hours.map(h => <option key={h}>{h}</option>)}</Select></Field>
          <Field label="Intervalo entre horários">
            <Select value={f.slotMinutes} onChange={e => set('slotMinutes', +e.target.value)}>
              {[10, 15, 20, 30, 45, 60].map(m => <option key={m} value={m}>{m} minutos</option>)}
            </Select>
          </Field>
          <Field label="Fuso horário">
            <Select value={f.timezone} onChange={e => set('timezone', e.target.value)}>
              {['America/Sao_Paulo', 'America/Manaus', 'America/Recife', 'America/Cuiaba', 'America/Rio_Branco'].map(t => <option key={t}>{t}</option>)}
            </Select>
          </Field>
        </div>
        <hr className="divider" style={{ margin: '22px 0 18px' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" icon="check" onClick={save}>Salvar alterações</Button>
        </div>
      </Card>
    );
  }

  /* ================= APARÊNCIA ================= */
  function AppearancePanel({ t, setTweak, theme, setTheme }) {
    return (
      <Card className="card-pad">
        <PanelHead title="Aparência" desc="Personalize o tema e a identidade visual. As mudanças são aplicadas imediatamente." />

        <div className="eyebrow" style={{ marginBottom: 12 }}>Tema</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 26 }}>
          {[{ v: 'light', label: 'Claro', ico: 'sun' }, { v: 'dark', label: 'Escuro', ico: 'moon' }].map(o => (
            <button key={o.v} onClick={() => setTheme(o.v)} style={{
              flex: 1, maxWidth: 200, display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', cursor: 'pointer',
              border: theme === o.v ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: theme === o.v ? 'var(--primary-soft)' : 'var(--surface)', borderRadius: 'var(--r-md)',
              color: theme === o.v ? 'var(--primary-text)' : 'var(--text)', fontWeight: 600, fontSize: 14,
            }}>
              <Icon name={o.ico} size={20} />{o.label}
              {theme === o.v && <Icon name="check" size={17} style={{ marginLeft: 'auto' }} />}
            </button>
          ))}
        </div>

        <div className="eyebrow" style={{ marginBottom: 12 }}>Cor primária</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 26 }}>
          {PRIMARY_OPTIONS.map(c => (
            <button key={c} onClick={() => setTweak('primary', c)} title={c} style={{
              width: 38, height: 38, borderRadius: '50%', background: c, cursor: 'pointer',
              border: t.primary === c ? '3px solid var(--text)' : '3px solid transparent', boxShadow: '0 0 0 1px var(--border)',
              display: 'grid', placeItems: 'center', color: '#fff',
            }}>{t.primary === c && <Icon name="check" size={18} />}</button>
          ))}
        </div>

        <div className="form-grid" style={{ maxWidth: 560 }}>
          <Field label="Cantos">
            <Segmented value={t.radius} onChange={v => setTweak('radius', v)}
              options={[{ value: 'sharp', label: 'Reto' }, { value: 'default', label: 'Padrão' }, { value: 'rounded', label: 'Arredondado' }]} />
          </Field>
          <Field label="Densidade">
            <Segmented value={t.density} onChange={v => setTweak('density', v)}
              options={[{ value: 'comfortable', label: 'Confortável' }, { value: 'compact', label: 'Compacto' }]} />
          </Field>
        </div>
      </Card>
    );
  }

  /* ================= SETTINGS SHELL ================= */
  function Settings({ navigate, params, t, setTweak, theme, setTheme }) {
    const [tab, setTab] = useState(params && params.tab ? params.tab : 'clinic');

    let panel;
    if (tab === 'clinic') panel = <ClinicPanel />;
    else if (tab === 'team') panel = <TeamPanel />;
    else if (tab === 'agenda') panel = <AgendaPanel />;
    else if (tab === 'appearance') panel = <AppearancePanel t={t} setTweak={setTweak} theme={theme} setTheme={setTheme} />;
    else if (tab === 'design') panel = <window.DesignSystem embedded />;

    return (
      <div className="page fade-in" style={{ maxWidth: 1180 }}>
        <div className="page-head"><div><h1 className="h1">Configurações</h1><div className="sub">Gerencie a clínica, a equipe e as preferências do sistema.</div></div></div>

        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 22, alignItems: 'start' }}>
          <Card className="settings-nav" style={{ padding: 8, position: 'sticky', top: 0 }}>
            {TABS.map(it => (
              <button key={it.key} className={`settings-nav-item ${tab === it.key ? 'active' : ''}`} onClick={() => setTab(it.key)}>
                <span className="settings-nav-ico"><Icon name={it.icon} size={18} /></span>
                <span style={{ textAlign: 'left' }}>
                  <span className="settings-nav-label">{it.label}</span>
                  <span className="settings-nav-desc">{it.desc}</span>
                </span>
              </button>
            ))}
          </Card>
          <div className="fade-in" key={tab}>{panel}</div>
        </div>
      </div>
    );
  }

  window.Settings = Settings;
})();
