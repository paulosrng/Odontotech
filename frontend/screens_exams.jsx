/* Odontotech — Exams: list, view, edit */
(function () {
  const { useState } = React;
  const { Icon, Button, Card, Avatar, Badge, Field, Input, Select, Textarea, Modal, EmptyState, Menu } = window;

  function ExamStatus({ status }) {
    return status === 'concluido' ? <Badge color="green" dot>Concluído</Badge> : <Badge color="amber" dot>Pendente</Badge>;
  }

  function Exams({ navigate }) {
    const { patients, dentists } = window.DATA;
    const [exams, setExams] = useState(window.DATA.exams);
    const [selected, setSelected] = useState(null);
    const [editing, setEditing] = useState(null);
    const [q, setQ] = useState('');

    const onSaved = (saved, isNew) => {
      setExams(list => isNew ? [saved, ...list] : list.map(e => e.id === saved.id ? saved : e));
      window.DATA.exams = isNew ? [saved, ...window.DATA.exams] : window.DATA.exams.map(e => e.id === saved.id ? saved : e);
    };

    const rows = exams.filter(e => {
      const p = patients.find(x => x.id === e.patientId);
      return !q || (p && p.name.toLowerCase().includes(q.toLowerCase())) || e.type.toLowerCase().includes(q.toLowerCase());
    });

    return (
      <div className="page fade-in">
        <div className="page-head">
          <div><h1 className="h1">Exames</h1><div className="sub">{exams.length} exames · {exams.filter(e => e.status === 'pendente').length} pendentes de laudo</div></div>
          <Button variant="primary" icon="plus" onClick={() => setEditing({ new: true, patientId: '', type: '', date: '2026-06-03', dentistId: (dentists[0] || {}).id || '', notes: '', status: 'pendente', files: 0 })}>Novo exame</Button>
        </div>

        <div className="table-wrap">
          <div className="table-toolbar">
            <div style={{ flex: 1, maxWidth: 320 }}><Input lead={<Icon name="search" size={16} />} placeholder="Buscar por paciente ou tipo..." value={q} onChange={e => setQ(e.target.value)} /></div>
            <div style={{ flex: 1 }} />
            <Button variant="secondary" size="sm" icon="filter">Filtrar</Button>
          </div>
          {rows.length === 0 ? <EmptyState icon="file" title="Nenhum exame encontrado" text="Cadastre um novo exame ou ajuste a busca." /> : (
            <div className="table-scroll">
              <table className="tbl">
                <thead><tr><th>Paciente</th><th>Tipo de exame</th><th>Data</th><th>Responsável</th><th style={{ textAlign: 'center' }}>Anexos</th><th>Status</th><th style={{ textAlign: 'right' }}>Ações</th></tr></thead>
                <tbody>
                  {rows.map(e => {
                    const p = patients.find(x => x.id === e.patientId);
                    const d = dentists.find(x => x.id === e.dentistId);
                    return (
                      <tr key={e.id} className="clickable" onClick={() => setSelected(e)}>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar name={p ? p.name : '?'} size="sm" /><span className="td-strong">{p ? p.name : '—'}</span></div></td>
                        <td>{e.type}</td>
                        <td className="muted">{window.fmtDate(e.date)}</td>
                        <td className="muted">{d ? d.name : '—'}</td>
                        <td style={{ textAlign: 'center' }}>{e.files > 0 ? <Badge color="blue">{e.files} arquivo{e.files > 1 ? 's' : ''}</Badge> : <span className="muted-3">—</span>}</td>
                        <td><ExamStatus status={e.status} /></td>
                        <td onClick={ev => ev.stopPropagation()}>
                          <div className="row-actions">
                            <button className="row-action" title="Visualizar" onClick={() => setSelected(e)}><Icon name="eye" size={16} /></button>
                            <button className="row-action" title="Editar" onClick={() => setEditing(e)}><Icon name="edit" size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selected && <ExamView exam={selected} onClose={() => setSelected(null)} onEdit={() => { setEditing(selected); setSelected(null); }} navigate={navigate} />}
        {editing && <ExamEdit exam={editing} onClose={() => setEditing(null)} onSaved={onSaved} />}
      </div>
    );
  }

  function ExamView({ exam, onClose, onEdit, navigate }) {
    const p = window.DATA.patients.find(x => x.id === exam.patientId);
    const d = window.DATA.dentists.find(x => x.id === exam.dentistId);
    return (
      <Modal title={exam.type} subtitle={`${p ? p.name : ''} · ${window.fmtDate(exam.date)}`} onClose={onClose} width={620}
        footer={<><Button variant="ghost" icon="download" onClick={() => window.toast('Baixando arquivos...')}>Baixar tudo</Button><div style={{ flex: 1 }} /><Button variant="secondary" onClick={onClose}>Fechar</Button><Button variant="primary" icon="edit" onClick={onEdit}>Editar exame</Button></>}>
        <div style={{ display: 'flex', gap: 20, marginBottom: 18, flexWrap: 'wrap' }}>
          <div><div className="eyebrow" style={{ marginBottom: 4 }}>Status</div><ExamStatus status={exam.status} /></div>
          <div><div className="eyebrow" style={{ marginBottom: 4 }}>Responsável</div><div style={{ fontSize: 13.5, fontWeight: 500 }}>{d ? d.name : '—'}</div></div>
          <div><div className="eyebrow" style={{ marginBottom: 4 }}>Paciente</div><a style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--primary-text)', cursor: 'pointer' }} onClick={() => { onClose(); navigate('patient-detail', { id: exam.patientId }); }}>{p ? p.name : '—'}</a></div>
        </div>

        <div className="eyebrow" style={{ marginBottom: 10 }}>Arquivos anexados</div>
        {exam.files > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 18 }}>
            {Array.from({ length: exam.files }).map((_, i) => (
              <div key={i} className="file-tile">
                <div className="file-thumb ph-img">{exam.type.includes('Radio') || exam.type.includes('Tomo') ? `radiografia ${i + 1}` : `arquivo ${i + 1}`}</div>
                <div className="file-meta"><span style={{ fontSize: 12, fontWeight: 500 }}>exame_{i + 1}.jpg</span><button className="row-action" onClick={() => window.toast('Baixando...')}><Icon name="download" size={15} /></button></div>
              </div>
            ))}
          </div>
        ) : <p className="muted-3" style={{ fontSize: 13.5, marginBottom: 18 }}>Nenhum arquivo anexado a este exame.</p>}

        <div className="eyebrow" style={{ marginBottom: 8 }}>Laudo / Observações</div>
        <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{exam.notes || 'Sem laudo registrado.'}</p>
      </Modal>
    );
  }

  function ExamEdit({ exam, onClose, onSaved }) {
    const [f, setF] = useState({ ...exam });
    const [files, setFiles] = useState([]);
    const [busy, setBusy] = useState(false);
    const set = (k, v) => setF(p => ({ ...p, [k]: v }));
    const { patients, dentists } = window.DATA;
    const fileRef = React.useRef(null);

    const save = async () => {
      if (!f.patientId) return window.toast('Selecione um paciente', 'error');
      if (!f.type) return window.toast('Selecione o tipo de exame', 'error');
      setBusy(true);
      try {
        const payload = { type: f.type, date: f.date, dentistId: f.dentistId || null, notes: f.notes || '', status: f.status };
        const saved = exam.new
          ? await window.API.createExam(f.patientId, payload, files)
          : await window.API.updateExam(f.id, payload, files);
        onSaved && onSaved(saved, !!exam.new);
        window.toast('Exame salvo!', 'success');
        onClose();
      } catch (err) {
        window.toast(err.message || 'Erro ao salvar exame', 'error');
      } finally { setBusy(false); }
    };

    return (
      <Modal title={exam.new ? 'Novo exame' : 'Editar exame'} onClose={onClose} width={560}
        footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button variant="primary" icon="check" disabled={busy} onClick={save}>{busy ? 'Salvando…' : 'Salvar'}</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Paciente" required>
            <Select value={f.patientId} onChange={e => set('patientId', e.target.value)}><option value="">Selecione...</option>{patients.slice(0, 20).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</Select>
          </Field>
          <div className="form-grid">
            <Field label="Tipo de exame" required span2>
              <Select value={f.type} onChange={e => set('type', e.target.value)}><option value="">Selecione...</option>{['Radiografia Panorâmica', 'Radiografia Periapical', 'Tomografia (TC)', 'Documentação Ortodôntica', 'Fotografia Intraoral'].map(t => <option key={t}>{t}</option>)}</Select>
            </Field>
            <Field label="Data" required><Input type="date" value={f.date} onChange={e => set('date', e.target.value)} /></Field>
            <Field label="Responsável"><Select value={f.dentistId} onChange={e => set('dentistId', e.target.value)}>{dentists.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</Select></Field>
            <Field label="Status" span2>
              <div className="radio-pills">{['pendente', 'concluido'].map(s => <button key={s} type="button" className={`radio-pill ${f.status === s ? 'active' : ''}`} onClick={() => set('status', s)}>{s === 'pendente' ? 'Pendente' : 'Concluído'}</button>)}</div>
            </Field>
          </div>
          <Field label="Anexar arquivos">
            <input ref={fileRef} type="file" multiple accept="image/*,application/pdf,.dcm" style={{ display: 'none' }}
              onChange={e => setFiles(Array.from(e.target.files || []))} />
            <div className="dropzone" onClick={() => fileRef.current && fileRef.current.click()}>
              <Icon name="upload" size={26} style={{ marginBottom: 8 }} />
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{files.length ? `${files.length} arquivo(s) selecionado(s)` : 'Clique para enviar arquivos'}</div>
              <div style={{ fontSize: 12, marginTop: 3 }}>JPG, PNG, PDF ou DICOM · até 20MB</div>
            </div>
          </Field>
          <Field label="Laudo / Observações"><Textarea value={f.notes} onChange={e => set('notes', e.target.value)} placeholder="Descreva os achados do exame..." style={{ minHeight: 100 }} /></Field>
        </div>
      </Modal>
    );
  }

  window.Exams = Exams;
})();
