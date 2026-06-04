/* Odontotech — Landing + Auth */
(function () {
  const { useState } = React;
  const { Icon, Button, Field, Input, Avatar } = window;

  function PublicNav({ navigate, theme, toggleTheme }) {
    return (
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: 'color-mix(in srgb, var(--surface) 82%, transparent)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px', height: 68, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="sb-logo" style={{ width: 32, height: 32 }}><Icon name="tooth" size={19} stroke={1.9} /></div>
          <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>Odonto<b style={{ color: 'var(--primary-text)' }}>tech</b></div>
          <nav style={{ display: 'flex', gap: 4, marginLeft: 28 }} className="hide-collapse">
            {['Recursos', 'Módulos', 'Preços', 'Suporte'].map(l => (
              <a key={l} style={{ padding: '8px 14px', fontSize: 13.5, fontWeight: 500, color: 'var(--text-2)', borderRadius: 8, cursor: 'pointer' }}
                 onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text)'; }}
                 onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}>{l}</a>
            ))}
          </nav>
          <div style={{ flex: 1 }} />
          <button className="icon-btn" onClick={toggleTheme}><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19} /></button>
          <Button variant="ghost" onClick={() => navigate('login')}>Entrar</Button>
          <Button variant="primary" iconRight="arrowRight" onClick={() => navigate('register')}>Começar agora</Button>
        </div>
      </div>
    );
  }

  function Landing({ navigate, theme, toggleTheme }) {
    const features = [
      { icon: 'calendar', color: 'blue', title: 'Agenda inteligente', text: 'Visualize por mês, semana ou dia. Consultas coloridas por status, com confirmação automática via WhatsApp.' },
      { icon: 'users', color: 'teal', title: 'Gestão de pacientes', text: 'Ficha completa com prontuário, histórico clínico, alergias e responsável legal para menores.' },
      { icon: 'file', color: 'violet', title: 'Prontuário e exames', text: 'Anexe radiografias e laudos, registre evolução clínica e acompanhe exames por paciente.' },
      { icon: 'tooth', color: 'amber', title: 'Serviços e procedimentos', text: 'Catálogo de procedimentos com preço, duração e categoria — vinculados a cada consulta.' },
      { icon: 'shield', color: 'green', title: 'Convênios e planos', text: 'Controle coberturas, carências e serviços associados a cada convênio odontológico.' },
      { icon: 'trending', color: 'rose', title: 'Indicadores da clínica', text: 'Faturamento, taxa de comparecimento e produtividade por dentista em tempo real.' },
    ];
    const stats = [
      { v: '+2.400', l: 'clínicas ativas' }, { v: '1,2M', l: 'consultas/mês' },
      { v: '98%', l: 'uptime garantido' }, { v: '4,9★', l: 'avaliação média' },
    ];
    return (
      <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
        <PublicNav navigate={navigate} theme={theme} toggleTheme={toggleTheme} />

        {/* Hero */}
        <section style={{ maxWidth: 1180, margin: '0 auto', padding: '76px 28px 48px', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 56, alignItems: 'center' }}>
          <div>
            <div className="chip active" style={{ marginBottom: 22 }}><span className="bdot" style={{ background: 'var(--teal)' }} />Plataforma completa para clínicas odontológicas</div>
            <h1 style={{ fontSize: 50, lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 760, margin: '0 0 20px' }}>
              A gestão da sua clínica,<br /><span style={{ color: 'var(--primary-text)' }}>simples e sob controle.</span>
            </h1>
            <p style={{ fontSize: 17.5, lineHeight: 1.55, color: 'var(--text-2)', maxWidth: 480, margin: '0 0 30px' }}>
              Agendamento, pacientes, prontuário e convênios em um só lugar. O Odontotech organiza o dia a dia do consultório para você focar no que importa: o sorriso do paciente.
            </p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 30 }}>
              <Button variant="primary" size="lg" iconRight="arrowRight" onClick={() => navigate('register')}>Criar conta da clínica</Button>
              <Button variant="secondary" size="lg" icon="eye" onClick={() => navigate('login')}>Ver demonstração</Button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-3)', fontSize: 13 }}>
              <div style={{ display: 'flex' }}>
                {['Ana Lima', 'Caio Reis', 'Duda Melo', 'Eva Pinto'].map((n, i) => (
                  <div key={i} style={{ marginLeft: i ? -10 : 0, border: '2px solid var(--bg)', borderRadius: 99 }}><Avatar name={n} size="sm" /></div>
                ))}
              </div>
              Mais de 2.400 clínicas já confiam no Odontotech
            </div>
          </div>

          {/* Hero visual — mini dashboard preview */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-lg)', transform: 'perspective(1400px) rotateY(-7deg) rotateX(2deg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 14px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 99, background: '#FF5F57' }} />
              <span style={{ width: 10, height: 10, borderRadius: 99, background: '#FEBC2E' }} />
              <span style={{ width: 10, height: 10, borderRadius: 99, background: '#28C840' }} />
              <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>app.odontotech.com.br</span>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginBottom: 13 }}>
                {[{ l: 'Pacientes', v: '1.284', i: 'users', c: 'blue' }, { l: 'Hoje', v: '9', i: 'calendar', c: 'teal' }].map(s => (
                  <div key={s.l} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 13 }}>
                    <span className="stat-ico" style={{ width: 30, height: 30, background: `var(--${s.c}-soft)`, color: `var(--${s.c}-text)`, marginBottom: 8 }}><Icon name={s.i} size={16} /></span>
                    <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{s.v}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 13 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, color: 'var(--text-2)' }}>Próximas consultas</div>
                {[{ t: '09:30', n: 'Heitor Santos', s: 'atendimento' }, { t: '11:00', n: 'Patrícia Costa', s: 'confirmado' }, { t: '14:00', n: 'Larissa Souza', s: 'agendado' }].map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: i ? '1px solid var(--border)' : 'none' }}>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 600, width: 38 }}>{a.t}</span>
                    <Avatar name={a.n} size="sm" />
                    <span style={{ fontSize: 12.5, fontWeight: 500, flex: 1 }}>{a.n}</span>
                    <window.StatusBadge status={a.s} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
            {stats.map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 30, fontWeight: 760, letterSpacing: '-0.02em', color: 'var(--primary-text)' }}>{s.v}</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ maxWidth: 1180, margin: '0 auto', padding: '72px 28px' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Tudo em um só sistema</div>
            <h2 style={{ fontSize: 36, letterSpacing: '-0.03em', fontWeight: 740, margin: '0 0 12px' }}>Recursos pensados para o consultório</h2>
            <p style={{ fontSize: 16, color: 'var(--text-2)', maxWidth: 540, margin: '0 auto' }}>Da recepção ao prontuário clínico, o Odontotech cobre todo o fluxo de atendimento odontológico.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {features.map(f => (
              <div key={f.title} className="card card-pad" style={{ transition: 'transform .15s, box-shadow .15s' }}
                   onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                   onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
                <span className="stat-ico" style={{ width: 44, height: 44, background: `var(--${f.color}-soft)`, color: `var(--${f.color}-text)`, marginBottom: 16, borderRadius: 12 }}><Icon name={f.icon} size={22} /></span>
                <h3 className="h3" style={{ marginBottom: 7 }}>{f.title}</h3>
                <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ maxWidth: 1180, margin: '0 auto 80px', padding: '0 28px' }}>
          <div className="card" style={{ padding: '52px 44px', textAlign: 'center', background: 'linear-gradient(135deg, var(--primary), var(--primary-active))', border: 'none', color: '#fff' }}>
            <h2 style={{ fontSize: 32, letterSpacing: '-0.03em', fontWeight: 740, margin: '0 0 12px', color: '#fff' }}>Pronto para modernizar sua clínica?</h2>
            <p style={{ fontSize: 16.5, opacity: 0.92, maxWidth: 480, margin: '0 auto 26px' }}>Comece gratuitamente por 14 dias. Sem cartão de crédito, sem compromisso.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-lg" style={{ background: '#fff', color: 'var(--primary-active)' }} onClick={() => navigate('register')}>Criar conta gratuita</button>
              <button className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.16)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }} onClick={() => navigate('login')}>Entrar</button>
            </div>
          </div>
        </section>

        <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px', display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-3)', fontSize: 13 }}>
            <div className="sb-logo" style={{ width: 26, height: 26 }}><Icon name="tooth" size={15} /></div>
            <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>Odontotech</span>
            <span>© 2026 — Sistema de gestão odontológica</span>
            <div style={{ flex: 1 }} />
            <span>Termos · Privacidade · LGPD</span>
          </div>
        </footer>
      </div>
    );
  }

  /* ---------- Auth shell ---------- */
  function AuthShell({ children, theme, toggleTheme, navigate }) {
    return (
      <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg)' }}>
        {/* Left brand panel */}
        <div style={{ position: 'relative', background: 'linear-gradient(150deg, var(--primary), var(--primary-active))', padding: '48px 56px', display: 'flex', flexDirection: 'column', color: '#fff', overflow: 'hidden' }} className="auth-aside">
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 22px, rgba(255,255,255,0.04) 22px, rgba(255,255,255,0.04) 23px)' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('landing')}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(255,255,255,0.18)', display: 'grid', placeItems: 'center' }}><Icon name="tooth" size={23} stroke={1.9} /></div>
            <div style={{ fontWeight: 740, fontSize: 21, letterSpacing: '-0.02em' }}>Odontotech</div>
          </div>
          <div style={{ position: 'relative', marginTop: 'auto' }}>
            <div style={{ fontSize: 30, fontWeight: 720, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 18 }}>“Reduzimos as faltas em 40% e a recepção nunca foi tão organizada.”</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ border: '2px solid rgba(255,255,255,0.4)', borderRadius: 99 }}><Avatar name="Camila Verdi" size="md" /></div>
              <div>
                <div style={{ fontWeight: 650 }}>Dra. Camila Verdi</div>
                <div style={{ opacity: 0.85, fontSize: 13 }}>Clínica Sorriso Pleno · São Paulo</div>
              </div>
            </div>
          </div>
        </div>
        {/* Right form */}
        <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 28px' }}>
            <button className="icon-btn" onClick={toggleTheme}><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19} /></button>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 28px 40px' }}>
            <div style={{ width: '100%', maxWidth: 400 }}>{children}</div>
          </div>
        </div>
      </div>
    );
  }

  function Login({ navigate, theme, toggleTheme, onLogin }) {
    const [email, setEmail] = useState('marina.costa@odontotech.com.br');
    const [pwd, setPwd] = useState('demo1234');
    const [show, setShow] = useState(false);
    const [busy, setBusy] = useState(false);
    const submit = async e => { e.preventDefault(); setBusy(true); await onLogin(email, pwd); setBusy(false); };
    return (
      <AuthShell theme={theme} toggleTheme={toggleTheme} navigate={navigate}>
        <div className="fade-in">
          <h1 style={{ fontSize: 27, fontWeight: 740, letterSpacing: '-0.025em', margin: '0 0 7px' }}>Bem-vinda de volta</h1>
          <p className="muted" style={{ margin: '0 0 28px', fontSize: 14.5 }}>Acesse o painel da sua clínica.</p>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="E-mail">
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} lead={<Icon name="mail" size={17} />} placeholder="voce@clinica.com.br" />
            </Field>
            <Field label="Senha">
              <Input type={show ? 'text' : 'password'} value={pwd} onChange={e => setPwd(e.target.value)} lead={<Icon name="lock" size={17} />}
                trail={<span style={{ pointerEvents: 'auto', cursor: 'pointer' }} onClick={() => setShow(s => !s)}><Icon name={show ? 'eye' : 'eye'} size={17} /></span>} />
            </Field>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-2)', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ width: 15, height: 15, accentColor: 'var(--primary)' }} /> Manter conectada
              </label>
              <a style={{ color: 'var(--primary-text)', fontWeight: 600, cursor: 'pointer' }}>Esqueci a senha</a>
            </div>
            <Button variant="primary" size="lg" className="btn-block" type="submit" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</Button>
          </form>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0', color: 'var(--text-3)', fontSize: 12.5 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} /> ou <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <Button variant="secondary" size="lg" className="btn-block" onClick={() => onLogin(email, pwd)} icon="building" disabled={busy}>Entrar com SSO da clínica</Button>
          <p className="muted-3" style={{ textAlign: 'center', fontSize: 12, marginTop: 14 }}>Demo: <b>admin@odontotech.com</b> / admin123 · ou marina.costa@odontotech.com.br / demo1234</p>
          <p style={{ textAlign: 'center', marginTop: 26, fontSize: 14, color: 'var(--text-2)' }}>
            Novo por aqui? <a style={{ color: 'var(--primary-text)', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('register')}>Cadastre sua clínica</a>
          </p>
        </div>
      </AuthShell>
    );
  }

  function Register({ navigate, theme, toggleTheme, onLogin }) {
    const [form, setForm] = useState({ clinic: '', name: '', email: '', pwd: '' });
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const submit = e => { e.preventDefault(); window.toast('Cadastro de novas clínicas indisponível na demo. Entre com um usuário existente.', 'info'); navigate('login'); };
    return (
      <AuthShell theme={theme} toggleTheme={toggleTheme} navigate={navigate}>
        <div className="fade-in">
          <h1 style={{ fontSize: 27, fontWeight: 740, letterSpacing: '-0.025em', margin: '0 0 7px' }}>Cadastre sua clínica</h1>
          <p className="muted" style={{ margin: '0 0 28px', fontSize: 14.5 }}>14 dias grátis. Configure em poucos minutos.</p>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Nome da clínica" required>
              <Input value={form.clinic} onChange={e => set('clinic', e.target.value)} lead={<Icon name="building" size={17} />} placeholder="Clínica Sorriso Pleno" />
            </Field>
            <Field label="Seu nome" required>
              <Input value={form.name} onChange={e => set('name', e.target.value)} lead={<Icon name="user" size={17} />} placeholder="Dra. Marina Costa" />
            </Field>
            <Field label="E-mail profissional" required>
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} lead={<Icon name="mail" size={17} />} placeholder="voce@clinica.com.br" />
            </Field>
            <Field label="Crie uma senha" required hint="Mínimo de 8 caracteres.">
              <Input type="password" value={form.pwd} onChange={e => set('pwd', e.target.value)} lead={<Icon name="lock" size={17} />} placeholder="••••••••" />
            </Field>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ width: 15, height: 15, marginTop: 2, accentColor: 'var(--primary)' }} />
              Concordo com os <a style={{ color: 'var(--primary-text)', fontWeight: 600 }}>Termos de Uso</a> e a <a style={{ color: 'var(--primary-text)', fontWeight: 600 }}>Política de Privacidade (LGPD)</a>.
            </label>
            <Button variant="primary" size="lg" className="btn-block" type="submit" iconRight="arrowRight">Criar conta da clínica</Button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 26, fontSize: 14, color: 'var(--text-2)' }}>
            Já tem conta? <a style={{ color: 'var(--primary-text)', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('login')}>Entrar</a>
          </p>
        </div>
      </AuthShell>
    );
  }

  Object.assign(window, { Landing, Login, Register });
})();
