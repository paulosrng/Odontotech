/* Odontotech — Design System reference */
(function () {
  const { useState } = React;
  const { Icon, Button, Card, Badge, StatusBadge, Field, Input, Select, Switch, Avatar } = window;

  function Swatch({ name, varName, hex }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ height: 56, borderRadius: 10, background: `var(${varName})`, border: '1px solid var(--border)' }} />
        <div style={{ fontSize: 12, fontWeight: 600 }}>{name}</div>
        <div className="mono muted-3" style={{ fontSize: 11 }}>{hex}</div>
      </div>
    );
  }
  function Block({ title, desc, children }) {
    return (
      <Card className="card-pad" style={{ marginBottom: 18 }}>
        <h3 className="h3" style={{ marginBottom: 3 }}>{title}</h3>
        {desc && <p className="muted-3" style={{ fontSize: 12.5, margin: '0 0 18px' }}>{desc}</p>}
        {children}
      </Card>
    );
  }

  function DesignSystem({ embedded }) {
    const [inv, setInv] = useState(false);
    return (
      <div className={embedded ? 'fade-in' : 'page fade-in'} style={embedded ? undefined : { maxWidth: 1100 }}>
        {!embedded && <div className="page-head"><div><h1 className="h1">Design System</h1><div className="sub">Tokens e componentes que compõem a interface do Odontotech.</div></div></div>}

        <Block title="Cores" desc="Paleta primária, neutros e cores de status.">
          <div className="eyebrow" style={{ marginBottom: 10 }}>Marca</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14, marginBottom: 22 }}>
            <Swatch name="Primary" varName="--primary" hex="#1C6DD0" />
            <Swatch name="Primary hover" varName="--primary-hover" hex="#195FB6" />
            <Swatch name="Primary soft" varName="--primary-soft" hex="tint" />
            <Swatch name="Teal" varName="--teal" hex="#0DA28C" />
            <Swatch name="Green" varName="--green" hex="#17A65A" />
            <Swatch name="Violet" varName="--violet" hex="#7A5AF0" />
          </div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Status</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14, marginBottom: 22 }}>
            <Swatch name="Agendado" varName="--primary" hex="azul" />
            <Swatch name="Confirmado" varName="--teal" hex="teal" />
            <Swatch name="Concluído" varName="--green" hex="verde" />
            <Swatch name="Em atend." varName="--amber" hex="âmbar" />
            <Swatch name="Cancelado" varName="--rose" hex="rosa" />
            <Swatch name="Neutro" varName="--text-3" hex="cinza" />
          </div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Superfícies e texto</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14 }}>
            <Swatch name="Background" varName="--bg" hex="#F6F8FB" />
            <Swatch name="Surface" varName="--surface" hex="#FFFFFF" />
            <Swatch name="Surface 2" varName="--surface-2" hex="#F1F4F9" />
            <Swatch name="Border" varName="--border" hex="#E4E9F0" />
            <Swatch name="Text" varName="--text" hex="#0E1A2B" />
            <Swatch name="Text 2" varName="--text-2" hex="#4A586B" />
          </div>
        </Block>

        <Block title="Tipografia" desc="Inter para a interface, fonte monoespaçada para CPF, valores e horários.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { t: 'Display / H1', cls: 'h1', s: '26px · 700', ex: 'Gestão de Pacientes' },
              { t: 'Título / H2', cls: 'h2', s: '20px · 650', ex: 'Agenda de hoje' },
              { t: 'Subtítulo / H3', cls: 'h3', s: '16px · 600', ex: 'Dados pessoais' },
              { t: 'Corpo', cls: '', s: '14px · 400', ex: 'Texto padrão da interface, com alta legibilidade.' },
              { t: 'Mono', cls: 'mono', s: '13px · tabular', ex: '123.456.789-00 · R$ 1.800,00 · 09:30' },
            ].map(r => (
              <div key={r.t} style={{ display: 'flex', alignItems: 'baseline', gap: 18, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 130, flexShrink: 0 }}><div style={{ fontSize: 12.5, fontWeight: 600 }}>{r.t}</div><div className="muted-3" style={{ fontSize: 11 }}>{r.s}</div></div>
                <div className={r.cls} style={{ flex: 1 }}>{r.ex}</div>
              </div>
            ))}
          </div>
        </Block>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <Block title="Botões" desc="Hierarquia: primário, secundário, fantasma, perigo.">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              <Button variant="primary">Primário</Button>
              <Button variant="secondary">Secundário</Button>
              <Button variant="ghost">Fantasma</Button>
              <Button variant="danger">Perigo</Button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              <Button variant="primary" icon="plus">Com ícone</Button>
              <Button variant="secondary" icon="download">Exportar</Button>
              <Button variant="success" icon="check">Sucesso</Button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <Button variant="primary" size="sm">Pequeno</Button>
              <Button variant="primary">Padrão</Button>
              <Button variant="primary" size="lg">Grande</Button>
              <Button variant="primary" disabled>Desabilitado</Button>
            </div>
          </Block>

          <Block title="Badges de status" desc="Padrão de cores consistente em todo o sistema.">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginBottom: 16 }}>
              <StatusBadge status="agendado" /><StatusBadge status="confirmado" /><StatusBadge status="concluido" /><StatusBadge status="atendimento" /><StatusBadge status="cancelado" />
            </div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Variantes</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
              {['blue', 'teal', 'green', 'amber', 'rose', 'violet', 'gray'].map(c => <Badge key={c} color={c} dot>{c}</Badge>)}
            </div>
          </Block>

          <Block title="Campos de formulário" desc="Estados: padrão, foco, erro, desabilitado.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Padrão"><Input placeholder="Digite aqui..." /></Field>
              <Field label="Com ícone"><Input lead={<Icon name="search" size={16} />} placeholder="Buscar..." /></Field>
              <Field label="Com erro" error="Campo obrigatório"><Input defaultValue="Valor inválido" /></Field>
              <Field label="Seleção"><Select><option>Opção A</option><option>Opção B</option></Select></Field>
              <Field label="Desabilitado"><Input disabled value="Não editável" /></Field>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Switch checked={inv} onChange={setInv} /><span style={{ fontSize: 13.5, fontWeight: 500 }}>Toggle / switch</span></div>
            </div>
          </Block>

          <Block title="Avatares & ícones" desc="Iniciais coloridas por hash e biblioteca de ícones de linha.">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <Avatar name="Marina Costa" size="sm" /><Avatar name="Rafael Lima" size="md" /><Avatar name="Beatriz Souza" size="lg" /><Avatar name="André Martins" size="xl" />
            </div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Ícones</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9,1fr)', gap: 14, color: 'var(--text-2)' }}>
              {['home', 'calendar', 'tooth', 'users', 'shield', 'file', 'bell', 'search', 'plus', 'clock', 'dollar', 'whatsapp', 'phone', 'mail', 'edit', 'trash', 'eye', 'check'].map(n => (
                <div key={n} style={{ display: 'grid', placeItems: 'center' }} title={n}><Icon name={n} size={20} /></div>
              ))}
            </div>
          </Block>
        </div>

        <Block title="Espaçamento e raios" desc="Sistema base de 8px. Raios consistentes por componente.">
          <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {[{ l: 'xs · 6px', r: 6 }, { l: 'sm · 8px', r: 8 }, { l: 'md · 10px', r: 10 }, { l: 'lg · 14px', r: 14 }, { l: 'xl · 20px', r: 20 }].map(x => (
              <div key={x.l} style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, background: 'var(--primary-soft)', border: '1.5px solid var(--primary)', borderRadius: x.r, marginBottom: 8 }} />
                <div className="mono muted-3" style={{ fontSize: 11 }}>{x.l}</div>
              </div>
            ))}
          </div>
        </Block>
      </div>
    );
  }

  window.DesignSystem = DesignSystem;
})();
