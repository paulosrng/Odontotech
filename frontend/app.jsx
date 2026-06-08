/* Odontotech — Root app: router, state, theme, tweaks */
(function () {
  const { useState, useEffect, useRef } = React;
  const { Sidebar, Topbar, ToastHost } = window;

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "primary": "#1C6DD0",
    "radius": "default",
    "density": "comfortable",
    "sidebarCollapsed": false
  }/*EDITMODE-END*/;

  const RADII = {
    sharp:   { xs: '3px', sm: '4px', md: '5px', lg: '7px', xl: '10px' },
    default: { xs: '6px', sm: '8px', md: '10px', lg: '14px', xl: '20px' },
    rounded: { xs: '9px', sm: '12px', md: '15px', lg: '20px', xl: '28px' },
  };

  function applyTweaks(t, theme) {
    const r = document.documentElement;
    const c = t.primary;
    r.style.setProperty('--primary', c);
    r.style.setProperty('--primary-hover', `color-mix(in srgb, ${c} 88%, #000)`);
    r.style.setProperty('--primary-active', `color-mix(in srgb, ${c} 76%, #000)`);
    r.style.setProperty('--primary-soft', `color-mix(in srgb, ${c} ${theme === 'dark' ? 16 : 13}%, transparent)`);
    r.style.setProperty('--primary-text', theme === 'dark' ? `color-mix(in srgb, ${c} 50%, #fff)` : `color-mix(in srgb, ${c} 84%, #000)`);
    const rad = RADII[t.radius] || RADII.default;
    r.style.setProperty('--r-xs', rad.xs); r.style.setProperty('--r-sm', rad.sm);
    r.style.setProperty('--r-md', rad.md); r.style.setProperty('--r-lg', rad.lg); r.style.setProperty('--r-xl', rad.xl);
    document.body.classList.toggle('compact', t.density === 'compact');
  }

  function App() {
    const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
    const [theme, setTheme] = useState(() => localStorage.getItem('odt-theme') || 'light');
    const [authed, setAuthed] = useState(() => !!(window.API && window.API.isAuthed()));
    const [ready, setReady] = useState(false);
    const [bootError, setBootError] = useState(null);
    const [publicView, setPublicView] = useState(() => localStorage.getItem('odt-public') || 'landing');
    const [collapsed, setCollapsed] = useState(t.sidebarCollapsed);
    const [route, setRoute] = useState(() => localStorage.getItem('odt-route') || 'dashboard');
    const [params, setParams] = useState(() => { try { return JSON.parse(localStorage.getItem('odt-params') || '{}'); } catch { return {}; } });
    const contentRef = useRef(null);

    // shared mutable data
    const [appts, setAppts] = useState(window.DATA.appts);
    const [patients, setPatients] = useState(window.DATA.patients);

    useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('odt-theme', theme); applyTweaks(t, theme); }, [theme]);
    useEffect(() => { applyTweaks(t, theme); }, [t]);
    // Load real data from the backend whenever authenticated but not yet loaded.
    useEffect(() => {
      if (!authed || ready) return;
      let alive = true;
      window.API.bootstrap()
        .then(() => { if (!alive) return; setAppts(window.DATA.appts); setPatients(window.DATA.patients); setReady(true); })
        .catch(err => { if (alive) setBootError((err && err.message) || 'Falha ao carregar dados.'); });
      return () => { alive = false; };
    }, [authed, ready]);
    useEffect(() => { localStorage.setItem('odt-public', publicView); }, [publicView]);
    useEffect(() => { localStorage.setItem('odt-route', route); localStorage.setItem('odt-params', JSON.stringify(params)); if (contentRef.current) contentRef.current.scrollTop = 0; }, [route, params]);

    const toggleTheme = () => setTheme(th => th === 'dark' ? 'light' : 'dark');

    const navigate = (to, p) => {
      if (to === '__logout') { window.API.logout(); setAuthed(false); setReady(false); setBootError(null); setPublicView('login'); window.toast && window.toast('Sessão encerrada'); return; }
      if (to === 'landing' || to === 'login' || to === 'register') { setPublicView(to); return; }
      setRoute(to); setParams(p || {});
    };

    // keyboard: cmd+k toast, esc
    useEffect(() => {
      const h = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); window.toast && window.toast('Busca global (demo)'); } };
      window.addEventListener('keydown', h);
      return () => window.removeEventListener('keydown', h);
    }, []);

    /* ---------- Public (unauthenticated) ---------- */
    if (!authed) {
      const onLogin = async (email, password) => {
        try {
          await window.API.login(email, password);
          setRoute('dashboard'); setParams({}); setBootError(null); setReady(false); setAuthed(true);
        } catch (err) {
          window.toast && window.toast((err && err.message) || 'Falha no login', 'error');
        }
      };
      const shared = { navigate, theme, toggleTheme, onLogin };
      let view;
      if (publicView === 'login') view = <window.Login {...shared} />;
      else if (publicView === 'register') view = <window.Register {...shared} />;
      else view = <window.Landing navigate={navigate} theme={theme} toggleTheme={toggleTheme} />;
      return (<>{view}<ToastHost /><TweaksUI t={t} setTweak={setTweak} theme={theme} setTheme={setTheme} /></>);
    }

    /* ---------- Loading / bootstrap ---------- */
    if (!ready) {
      return (<><LoadingScreen error={bootError} onRetry={() => { setBootError(null); setReady(false); }} onLogout={() => navigate('__logout')} /><ToastHost /></>);
    }

    /* ---------- Authenticated app ---------- */
    const screens = {
      dashboard: () => <window.Dashboard navigate={navigate} appts={appts} />,
      agenda: () => <window.Agenda navigate={navigate} appts={appts} setAppts={setAppts} />,
      'new-appointment': () => <window.CreateAppointment navigate={navigate} appts={appts} setAppts={setAppts} preset={params} />,
      'edit-appointment': () => <window.EditAppointment navigate={navigate} appts={appts} setAppts={setAppts} params={params} />,
      patients: () => <window.PatientList navigate={navigate} patients={patients} setPatients={setPatients} />,
      'new-patient': () => <window.PatientForm navigate={navigate} patients={patients} setPatients={setPatients} />,
      'edit-patient': () => <window.PatientForm navigate={navigate} patients={patients} setPatients={setPatients} editId={params.id} />,
      'patient-detail': () => <window.PatientDetail navigate={navigate} patients={patients} appts={appts} params={params} />,
      exams: () => <window.Exams navigate={navigate} />,
      services: () => <window.Services navigate={navigate} />,
      plans: () => <window.Plans navigate={navigate} />,
      settings: () => <window.Settings navigate={navigate} params={params} t={t} setTweak={setTweak} theme={theme} setTheme={setTheme} />,
      design: () => <window.DesignSystem />,
    };
    const Screen = screens[route] || screens.dashboard;

    return (
      <div className="shell">
        <Sidebar route={route} navigate={navigate} collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="main">
          <Topbar route={route} navigate={navigate} theme={theme} toggleTheme={toggleTheme} openCmd={() => window.toast('Busca global (demo)')} />
          <div className="content" ref={contentRef}>
            {Screen()}
          </div>
        </div>
        <ToastHost />
        <TweaksUI t={t} setTweak={setTweak} theme={theme} setTheme={setTheme} />
      </div>
    );
  }

  function LoadingScreen({ error, onRetry, onLogout }) {
    const { Icon, Button } = window;
    return (
      <div style={{ height: '100%', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', maxWidth: 360, padding: 24 }}>
          <div className="sb-logo" style={{ width: 48, height: 48, margin: '0 auto 18px' }}><Icon name="tooth" size={26} stroke={1.9} /></div>
          {!error ? (
            <>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              <div style={{ fontWeight: 600 }}>Carregando dados da clínica…</div>
              <div className="muted-3" style={{ fontSize: 13, marginTop: 4 }}>Conectando ao servidor</div>
            </>
          ) : (
            <>
              <h2 className="h2" style={{ marginBottom: 8 }}>Não foi possível carregar</h2>
              <p className="muted" style={{ fontSize: 13.5, marginBottom: 18 }}>{error} Verifique se o servidor (backend) está rodando em <b>http://localhost:4000</b>.</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <Button variant="primary" icon="activity" onClick={onRetry}>Tentar novamente</Button>
                <Button variant="ghost" onClick={onLogout}>Sair</Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  function TweaksUI({ t, setTweak, theme, setTheme }) {
    const { TweaksPanel, TweakSection, TweakColor, TweakRadio, TweakToggle } = window;
    if (!TweaksPanel) return null;
    return (
      <TweaksPanel title="Tweaks">
        <TweakSection label="Marca" />
        <TweakColor label="Cor primária" value={t.primary}
          options={['#1C6DD0', '#0E7C86', '#3E5BD6', '#0A6E50', '#7A5AF0']}
          onChange={v => setTweak('primary', v)} />
        <TweakSection label="Layout" />
        <TweakRadio label="Cantos" value={t.radius} options={['sharp', 'default', 'rounded']} onChange={v => setTweak('radius', v)} />
        <TweakRadio label="Densidade" value={t.density} options={['comfortable', 'compact']} onChange={v => setTweak('density', v)} />
        <TweakSection label="Tema" />
        <TweakToggle label="Modo escuro" value={theme === 'dark'} onChange={v => setTheme(v ? 'dark' : 'light')} />
      </TweaksPanel>
    );
  }

  window.OdontotechApp = App;
})();
