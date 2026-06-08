/* Odontotech — Dental Services + Insurance Plans */
(function () {
  const { useState, useMemo } = React;
  const { Icon, Button, Card, Badge, Field, Input, Select, Textarea, Switch, Modal, Drawer, EmptyState, Menu } = window;

  const catColor = { 'Clínica Geral': 'blue', 'Prevenção': 'teal', 'Dentística': 'violet', 'Endodontia': 'rose', 'Cirurgia': 'amber', 'Estética': 'green', 'Ortodontia': 'blue', 'Implantodontia': 'teal', 'Radiologia': 'violet', 'Prótese': 'amber' };

  /* ============== SERVICES ============== */
  function Services({ navigate }) {
    const [services, setServices] = useState(window.DATA.services);
    const [q, setQ] = useState('');
    const [cat, setCat] = useState('all');
    const [editing, setEditing] = useState(null);
    const [associate, setAssociate] = useState(false);

    const rows = useMemo(() => services.filter(s => (!q || s.name.toLowerCase().includes(q.toLowerCase())) && (cat === 'all' || s.cat === cat)), [services, q, cat]);

    const save = async (svc) => {
      try {
        const saved = svc.id ? await window.API.updateService(svc.id, svc) : await window.API.createService(svc);
        setServices(list => svc.id ? list.map(s => s.id === saved.id ? saved : s) : [...list, saved]);
        window.toast(svc.id ? 'Serviço atualizado!' : 'Serviço cadastrado!', 'success');
        setEditing(null);
      } catch (err) { window.toast(err.message || 'Erro ao salvar serviço', 'error'); }
    };

    return (
      <div className="page fade-in">
        <div className="page-head">
          <div><h1 className="h1">Serviços Odontológicos</h1><div className="sub">{services.length} procedimentos cadastrados</div></div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" icon="list" onClick={() => setAssociate(true)}>Associar à consulta</Button>
            <Button variant="primary" icon="plus" onClick={() => setEditing({ name: '', cat: 'Clínica Geral', price: 0, dur: 30, desc: '' })}>Novo serviço</Button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, maxWidth: 320 }}><Input lead={<Icon name="search" size={16} />} placeholder="Buscar procedimento..." value={q} onChange={e => setQ(e.target.value)} /></div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            <button className={`chip ${cat === 'all' ? 'active' : ''}`} onClick={() => setCat('all')}>Todos</button>
            {window.DATA.serviceCats.map(c => <button key={c} className={`chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>)}
          </div>
        </div>

        {rows.length === 0 ? <Card><EmptyState icon="tooth" title="Nenhum serviço encontrado" text="Ajuste os filtros ou cadastre um novo procedimento." /></Card> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {rows.map(s => (
              <div key={s.id} className="card card-pad" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span className="stat-ico" style={{ width: 42, height: 42, borderRadius: 12, background: `var(--${catColor[s.cat]}-soft)`, color: `var(--${catColor[s.cat]}-text)` }}><Icon name="tooth" size={21} /></span>
                  <Menu align="right" trigger={<button className="row-action"><Icon name="dotsV" size={16} /></button>} items={[
                    { icon: 'edit', label: 'Editar', onClick: () => setEditing(s) },
                    { icon: 'list', label: 'Associar à consulta', onClick: () => setAssociate(true) },
                    { divider: true },
                    { icon: 'trash', label: 'Excluir', danger: true, onClick: async () => { try { await window.API.deleteService(s.id); setServices(l => l.filter(x => x.id !== s.id)); window.toast('Serviço removido', 'warn'); } catch (err) { window.toast(err.message || 'Erro ao excluir', 'error'); } } },
                  ]} />
                </div>
                <Badge color={catColor[s.cat]}>{s.cat}</Badge>
                <h3 className="h3" style={{ margin: '10px 0 6px' }}>{s.name}</h3>
                <p className="muted-3" style={{ fontSize: 12.5, lineHeight: 1.5, margin: 0, flex: 1 }}>{s.desc}</p>
                <hr className="divider" style={{ margin: '14px 0 12px' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-3)', fontSize: 12.5 }}><Icon name="clock" size={14} />{s.dur} min</span>
                  <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.01em' }}>{window.fmtMoney(s.price)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {editing && <ServiceEdit svc={editing} onClose={() => setEditing(null)} onSave={save} />}
        {associate && <AssociateModal services={services} onClose={() => setAssociate(false)} />}
      </div>
    );
  }

  function ServiceEdit({ svc, onClose, onSave }) {
    const [f, setF] = useState({ ...svc });
    const set = (k, v) => setF(p => ({ ...p, [k]: v }));
    return (
      <Modal title={svc.id ? 'Editar serviço' : 'Novo serviço'} onClose={onClose} width={540}
        footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button variant="primary" icon="check" onClick={() => onSave(f)} disabled={!f.name}>Salvar</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Nome do serviço" required><Input value={f.name} onChange={e => set('name', e.target.value)} placeholder="Ex.: Restauração em Resina" /></Field>
          <Field label="Descrição"><Textarea value={f.desc} onChange={e => set('desc', e.target.value)} placeholder="Breve descrição do procedimento..." style={{ minHeight: 70 }} /></Field>
          <div className="form-grid">
            <Field label="Categoria" required><Select value={f.cat} onChange={e => set('cat', e.target.value)}>{window.DATA.serviceCats.map(c => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Duração (min)" required><Input type="number" value={f.dur} onChange={e => set('dur', +e.target.value)} /></Field>
            <Field label="Preço padrão (R$)" required span2><Input type="number" value={f.price} onChange={e => set('price', +e.target.value)} lead={<span style={{ fontSize: 13, fontWeight: 600 }}>R$</span>} /></Field>
          </div>
        </div>
      </Modal>
    );
  }

  function AssociateModal({ services, onClose }) {
    const [selected, setSelected] = useState([{ id: services[2].id, qty: 1, price: services[2].price }]);
    const add = (s) => { if (!selected.find(x => x.id === s.id)) setSelected(l => [...l, { id: s.id, qty: 1, price: s.price }]); };
    const upd = (id, k, v) => setSelected(l => l.map(x => x.id === id ? { ...x, [k]: v } : x));
    const rm = (id) => setSelected(l => l.filter(x => x.id !== id));
    const total = selected.reduce((s, x) => s + x.price * x.qty, 0);
    return (
      <Modal title="Associar serviços à consulta" subtitle="Consulta de Heitor Santos · 03/06/2026 09:30" onClose={onClose} width={620}
        footer={<div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
          <div><span className="muted" style={{ fontSize: 13 }}>Total</span> <span style={{ fontWeight: 700, fontSize: 18, marginLeft: 8 }}>{window.fmtMoney(total)}</span></div>
          <div style={{ display: 'flex', gap: 10 }}><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button variant="primary" icon="check" onClick={() => { window.toast('Serviços vinculados à consulta!', 'success'); onClose(); }}>Vincular</Button></div>
        </div>}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Serviços selecionados</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
          {selected.length === 0 && <p className="muted-3" style={{ fontSize: 13 }}>Nenhum serviço selecionado.</p>}
          {selected.map(x => {
            const s = services.find(y => y.id === x.id);
            return (
              <div key={x.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13.5 }}>{s.name}</div><Badge color={catColor[s.cat]}>{s.cat}</Badge></div>
                <div style={{ width: 60 }}><label style={{ fontSize: 10.5, color: 'var(--text-3)', fontWeight: 600 }}>Qtd</label><Input type="number" min="1" value={x.qty} onChange={e => upd(x.id, 'qty', Math.max(1, +e.target.value))} style={{ padding: '6px 8px' }} /></div>
                <div style={{ width: 110 }}><label style={{ fontSize: 10.5, color: 'var(--text-3)', fontWeight: 600 }}>Valor (R$)</label><Input type="number" value={x.price} onChange={e => upd(x.id, 'price', +e.target.value)} style={{ padding: '6px 8px' }} className="mono" /></div>
                <button className="row-action danger" style={{ marginTop: 14 }} onClick={() => rm(x.id)}><Icon name="trash" size={16} /></button>
              </div>
            );
          })}
        </div>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Adicionar serviço</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {services.filter(s => !selected.find(x => x.id === s.id)).slice(0, 8).map(s => (
            <button key={s.id} className="chip" onClick={() => add(s)}><Icon name="plus" size={13} />{s.name}</button>
          ))}
        </div>
      </Modal>
    );
  }

  /* ============== PLANS ============== */
  function Plans() {
    const [plans, setPlans] = useState(window.DATA.plans);
    const [editing, setEditing] = useState(null);

    const save = async (pl) => {
      try {
        // Strip canonical backend aliases so the frontend aliases (coverage/carencia/services)
        // take precedence in the backend normalize() and the slider value is not ignored.
        const { id, _new, coveragePercent, gracePeriod, serviceCount, createdAt, updatedAt, ...payload } = pl;
        const saved = _new ? await window.API.createPlan(payload) : await window.API.updatePlan(id, payload);
        setPlans(list => _new ? [...list, saved] : list.map(p => p.id === saved.id ? saved : p));
        window.toast(_new ? 'Plano cadastrado!' : 'Plano atualizado!', 'success');
        setEditing(null);
      } catch (err) { window.toast(err.message || 'Erro ao salvar plano', 'error'); }
    };

    return (
      <div className="page fade-in">
        <div className="page-head">
          <div><h1 className="h1">Gestão de Planos</h1><div className="sub">{plans.filter(p => p.status === 'ativo').length} convênios ativos</div></div>
          <Button variant="primary" icon="plus" onClick={() => setEditing({ id: 'p' + Date.now(), name: '', coverage: 50, status: 'ativo', services: 0, color: 'blue', carencia: '30 dias', _new: true })}>Novo plano</Button>
        </div>

        <div className="table-wrap">
          <div className="table-scroll">
            <table className="tbl">
              <thead><tr><th>Convênio</th><th style={{ textAlign: 'center' }}>Cobertura</th><th style={{ textAlign: 'center' }}>Carência</th><th style={{ textAlign: 'center' }}>Serviços</th><th>Status</th><th style={{ textAlign: 'right' }}>Ações</th></tr></thead>
              <tbody>
                {plans.map(p => (
                  <tr key={p.id} className="clickable" onClick={() => setEditing(p)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <span className="stat-ico" style={{ width: 36, height: 36, background: `var(--${p.color}-soft)`, color: `var(--${p.color}-text)` }}><Icon name="shield" size={18} /></span>
                        <span className="td-strong">{p.name}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9, justifyContent: 'center' }}>
                        <div className="progress" style={{ width: 80 }}><i style={{ width: `${p.coverage}%`, background: `var(--${p.color})` }} /></div>
                        <span className="tnum" style={{ fontWeight: 600, fontSize: 13, width: 36 }}>{p.coverage}%</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }} className="muted">{p.carencia}</td>
                    <td style={{ textAlign: 'center' }}><Badge color="gray">{p.services}</Badge></td>
                    <td>{p.status === 'ativo' ? <Badge color="green" dot>Ativo</Badge> : <Badge color="gray" dot>Inativo</Badge>}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="row-actions">
                        <button className="row-action" title="Editar" onClick={() => setEditing(p)}><Icon name="edit" size={16} /></button>
                        <Menu align="right" trigger={<button className="row-action"><Icon name="dotsV" size={16} /></button>} items={[
                          { icon: p.status === 'ativo' ? 'x' : 'check', label: p.status === 'ativo' ? 'Desativar' : 'Ativar', onClick: async () => { const ns = p.status === 'ativo' ? 'inativo' : 'ativo'; setPlans(l => l.map(x => x.id === p.id ? { ...x, status: ns } : x)); try { await window.API.updatePlan(p.id, { status: ns }); } catch (err) { window.toast(err.message, 'error'); } } },
                          { icon: 'trash', label: 'Excluir', danger: true, onClick: async () => { try { await window.API.deletePlan(p.id); setPlans(l => l.filter(x => x.id !== p.id)); window.toast('Plano removido', 'warn'); } catch (err) { window.toast(err.message || 'Erro ao excluir', 'error'); } } },
                        ]} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {editing && <PlanDrawer plan={editing} onClose={() => setEditing(null)} onSave={save} />}
      </div>
    );
  }

  function PlanDrawer({ plan, onClose, onSave }) {
    const [f, setF] = useState({ ...plan, serviceIds: plan.serviceIds || [] });
    const set = (k, v) => setF(p => ({ ...p, [k]: v }));
    const allServices = window.DATA.services;
    const toggleService = (id) => setF(p => {
      const ids = p.serviceIds || [];
      return { ...p, serviceIds: ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id] };
    });
    return (
      <Drawer title={plan._new ? 'Novo plano' : f.name || 'Editar plano'} subtitle="Convênio odontológico" onClose={onClose} width={460}
        footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button variant="primary" icon="check" onClick={() => onSave(f)} disabled={!f.name}>Salvar plano</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Field label="Nome do convênio" required><Input value={f.name} onChange={e => set('name', e.target.value)} placeholder="Ex.: Amil Dental" /></Field>
          <Field label={`Cobertura: ${f.coverage}%`}>
            <input type="range" min="0" max="100" value={f.coverage} onChange={e => set('coverage', +e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)' }} />
            <div className="progress" style={{ marginTop: 6 }}><i style={{ width: `${f.coverage}%` }} /></div>
          </Field>
          <div className="form-grid">
            <Field label="Carência"><Select value={f.carencia ?? '—'} onChange={e => set('carencia', e.target.value === '—' ? null : e.target.value)}>{['—', '30 dias', '60 dias', '90 dias', '180 dias'].map(c => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Status"><Select value={f.status} onChange={e => set('status', e.target.value)}><option value="ativo">Ativo</option><option value="inativo">Inativo</option></Select></Field>
          </div>
          <Field label="Cor do convênio">
            <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
              {['blue', 'teal', 'violet', 'rose', 'amber', 'green'].map(c => (
                <button key={c} type="button" onClick={() => set('color', c)}
                  title={c}
                  style={{ width: 28, height: 28, borderRadius: '50%', border: f.color === c ? '3px solid var(--text)' : '2px solid var(--border)', background: `var(--${c})`, cursor: 'pointer', outline: 'none' }} />
              ))}
            </div>
          </Field>

          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Serviços cobertos ({(f.serviceIds || []).length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
              {allServices.map(s => {
                const checked = (f.serviceIds || []).includes(s.id);
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', border: `1px solid ${checked ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--r-md)', cursor: 'pointer', background: checked ? 'var(--primary-soft)' : 'transparent' }} onClick={() => toggleService(s.id)}>
                    <span className="stat-ico" style={{ width: 30, height: 30, background: 'var(--surface-2)', color: 'var(--text-2)' }}><Icon name="tooth" size={15} /></span>
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div><div className="muted-3" style={{ fontSize: 11.5 }}>{checked ? `Coberto em ${f.coverage}% · paciente paga ${window.fmtMoney(s.price * (1 - f.coverage / 100))}` : window.fmtMoney(s.price)}</div></div>
                    <Switch checked={checked} onChange={() => toggleService(s.id)} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Drawer>
    );
  }

  Object.assign(window, { Services, Plans });
})();
