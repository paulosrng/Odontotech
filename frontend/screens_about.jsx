/* Odontotech — Sobre Nós (pública + autenticada) */
(function () {
  const { Icon, Button, Avatar, OdontotechLogo } = window;

  const TEAM = [
    'Augusto Ramos',
    'Paulo Sérgio',
    'Rafael Takaki',
    'Ana Luiza Gomes',
    'Rodrigo Passos',
    'Bárbara Parente',
  ];

  const STACK = [
    { label: 'React 18',   color: 'blue',   icon: 'grid' },
    { label: 'Node.js',    color: 'green',  icon: 'activity' },
    { label: 'TypeScript', color: 'blue',   icon: 'file' },
    { label: 'Prisma ORM', color: 'violet', icon: 'clipboard' },
    { label: 'SQLite',     color: 'amber',  icon: 'folder' },
    { label: 'Express',    color: 'teal',   icon: 'trending' },
  ];

  const PILLARS = [
    { icon: 'heart',  color: 'rose',  title: 'Missão',  text: 'Simplificar a gestão odontológica por meio de tecnologia acessível, permitindo que profissionais foquem no que realmente importa: o cuidado ao paciente.' },
    { icon: 'eye',    color: 'blue',  title: 'Visão',   text: 'Ser referência acadêmica em sistemas de gestão para clínicas odontológicas de pequeno e médio porte, unindo design moderno e usabilidade.' },
    { icon: 'shield', color: 'green', title: 'Valores', text: 'Cuidado com o paciente · Inovação · Acessibilidade · Transparência · Boas práticas de engenharia de software.' },
  ];

  function AboutContent({ navigate, isPublic }) {
    const secPad = isPublic ? '0 28px 72px' : '0 0 48px';

    return (
      <>
        {/* Hero */}
        <section style={{ maxWidth: 860, margin: '0 auto', padding: isPublic ? '72px 28px 56px' : '0 0 40px', textAlign: 'center' }}>
          {isPublic && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}><OdontotechLogo size={88} radius={22} /></div>}
          <div className="chip active" style={{ marginBottom: 20, display: 'inline-flex' }}>
            <span className="bdot" style={{ background: 'var(--teal)' }} />
            Projeto Integrador
          </div>
          <h1 style={{ fontSize: isPublic ? 46 : 32, fontWeight: 760, letterSpacing: '-0.03em', margin: '0 0 18px', lineHeight: 1.1 }}>
            Sobre o <span style={{ color: 'var(--primary-text)' }}>Odontotech</span>
          </h1>
          <p style={{ fontSize: 16.5, color: 'var(--text-2)', maxWidth: 620, margin: '0 auto 28px', lineHeight: 1.65 }}>
            O Odontotech é um sistema completo de gestão para clínicas odontológicas, desenvolvido como Trabalho de Conclusão de Curso. Reúne agendamento inteligente, prontuário digital, gestão de pacientes, convênios e indicadores clínicos em uma interface moderna e intuitiva.
          </p>
          {isPublic && (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Button variant="primary" size="lg" iconRight="arrowRight" onClick={() => navigate('register')}>Experimentar agora</Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('login')}>Ver demonstração</Button>
            </div>
          )}
        </section>

        {/* Missão / Visão / Valores */}
        <section style={{ maxWidth: 1180, margin: '0 auto', padding: secPad }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Propósito</div>
            <h2 style={{ fontSize: 26, fontWeight: 740, letterSpacing: '-0.025em', margin: 0 }}>Missão, Visão e Valores</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {PILLARS.map(p => (
              <div key={p.title} className="card card-pad">
                <span className="stat-ico" style={{ width: 44, height: 44, background: `var(--${p.color}-soft)`, color: `var(--${p.color}-text)`, marginBottom: 16, borderRadius: 12 }}>
                  <Icon name={p.icon} size={22} />
                </span>
                <h3 className="h3" style={{ marginBottom: 8 }}>{p.title}</h3>
                <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Equipe */}
        <section style={{ maxWidth: 1180, margin: '0 auto', padding: secPad }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>As pessoas por trás</div>
            <h2 style={{ fontSize: 26, fontWeight: 740, letterSpacing: '-0.025em', margin: '0 0 10px' }}>Nossa Equipe</h2>
            <p className="muted" style={{ fontSize: 15, maxWidth: 480, margin: '0 auto' }}>
              Estudantes apaixonados por tecnologia aplicada à saúde.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, maxWidth: 840, margin: '0 auto' }}>
            {TEAM.map(name => (
              <div key={name} className="card card-pad" style={{ textAlign: 'center', padding: '28px 20px' }}>
                <div style={{ margin: '0 auto 14px' }}><Avatar name={name} size="xl" /></div>
                <div style={{ fontWeight: 650, fontSize: 15 }}>{name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Tecnologias */}
        <section style={{ maxWidth: 1180, margin: '0 auto', padding: secPad }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Stack técnica</div>
            <h2 style={{ fontSize: 26, fontWeight: 740, letterSpacing: '-0.025em', margin: 0 }}>Tecnologias utilizadas</h2>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {STACK.map(s => (
              <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 20px' }}>
                <span className="stat-ico" style={{ width: 36, height: 36, background: `var(--${s.color}-soft)`, color: `var(--${s.color}-text)`, borderRadius: 9 }}>
                  <Icon name={s.icon} size={18} />
                </span>
                <span style={{ fontWeight: 650, fontSize: 14 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA — apenas na versão pública */}
        {isPublic && (
          <section style={{ maxWidth: 1180, margin: '0 auto 80px', padding: '0 28px' }}>
            <div className="card" style={{ padding: '52px 44px', textAlign: 'center', background: 'linear-gradient(135deg, var(--primary), var(--primary-active))', border: 'none', color: '#fff' }}>
              <h2 style={{ fontSize: 30, letterSpacing: '-0.03em', fontWeight: 740, margin: '0 0 12px', color: '#fff' }}>Conheça o sistema na prática</h2>
              <p style={{ fontSize: 16, opacity: 0.92, maxWidth: 440, margin: '0 auto 26px' }}>
                Explore todas as funcionalidades com os dados da clínica demo.
              </p>
              <button className="btn btn-lg" style={{ background: '#fff', color: 'var(--primary-active)' }} onClick={() => navigate('login')}>
                Acessar demonstração
              </button>
            </div>
          </section>
        )}
      </>
    );
  }

  function About({ navigate, theme, toggleTheme, isPublic }) {
    if (isPublic) {
      const { PublicNav } = window;
      return (
        <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
          <PublicNav navigate={navigate} theme={theme} toggleTheme={toggleTheme} />
          <AboutContent navigate={navigate} isPublic={true} />
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

    return (
      <div className="page fade-in">
        <div className="page-head">
          <div>
            <h1 className="h1">Sobre Nós</h1>
            <div className="sub">Conheça o projeto e a equipe por trás do Odontotech</div>
          </div>
        </div>
        <AboutContent navigate={navigate} isPublic={false} />
      </div>
    );
  }

  window.About = About;
})();
