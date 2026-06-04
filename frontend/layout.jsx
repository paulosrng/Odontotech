/* Odontotech — App shell: Sidebar + Topbar */
(function () {
  const { useState } = React;
  const { Icon, Avatar, Menu } = window;

  const NAV = [
    { group: null, items: [
      { key: 'dashboard', route: 'dashboard', icon: 'home', label: 'Início' },
    ]},
    { group: 'Atendimento', items: [
      { key: 'agenda',   route: 'agenda',   icon: 'calendar', label: 'Agendamento', badge: 'hoje' },
      { key: 'patients', route: 'patients', icon: 'users',    label: 'Pacientes' },
      { key: 'exams',    route: 'exams',    icon: 'file',     label: 'Exames' },
    ]},
    { group: 'Cadastros', items: [
      { key: 'services', route: 'services', icon: 'tooth',  label: 'Serviços' },
      { key: 'plans',    route: 'plans',    icon: 'shield', label: 'Planos' },
    ]},
    { group: 'Sistema', items: [
      { key: 'settings', route: 'settings', icon: 'settings', label: 'Configurações' },
    ]},
  ];

  // which top-level section each route belongs to
  const SECTION = {
    dashboard: 'dashboard',
    agenda: 'agenda', 'new-appointment': 'agenda',
    patients: 'patients', 'new-patient': 'patients', 'patient-detail': 'patients', 'edit-patient': 'patients',
    exams: 'exams', 'exam-detail': 'exams',
    services: 'services',
    plans: 'plans',
    settings: 'settings', design: 'settings',
  };

  function Sidebar({ route, navigate, collapsed, setCollapsed }) {
    const active = SECTION[route] || route;
    const { clinic } = window.DATA;
    return (
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sb-brand">
          <div className="sb-logo"><Icon name="tooth" size={20} stroke={1.9} /></div>
          <div className="sb-brand-name">Odonto<b>tech</b></div>
        </div>
        <nav className="sb-nav">
          {NAV.map((grp, gi) => (
            <div className="sb-group" key={gi}>
              {grp.group && <div className="sb-group-label">{grp.group}</div>}
              {grp.items.map(it => (
                <a key={it.key} className={`sb-item ${active === it.key ? 'active' : ''}`}
                   onClick={() => navigate(it.route)} title={collapsed ? it.label : undefined}>
                  <span className="sb-ico"><Icon name={it.icon} size={19} /></span>
                  <span className="sb-label">{it.label}</span>
                  {it.badge && <span className="sb-badge">{it.badge}</span>}
                </a>
              ))}
            </div>
          ))}
        </nav>
        <div className="sb-foot">
          <button className="sb-collapse-btn" onClick={() => setCollapsed(c => !c)}>
            <Icon name={collapsed ? 'chevronsRight' : 'chevronsLeft'} size={18} />
            <span>Recolher menu</span>
          </button>
        </div>
      </aside>
    );
  }

  function NotificationsButton() {
    const { notifications } = window.DATA;
    const [open, setOpen] = useState(false);
    const unread = notifications.filter(n => n.unread).length;
    return (
      <Menu
        align="right"
        trigger={<button className="icon-btn" title="Notificações"><Icon name="bell" size={19} />{unread > 0 && <span className="dot" />}</button>}
        items={[]}
      >
      </Menu>
    );
  }

  function Topbar({ route, navigate, theme, toggleTheme, openCmd }) {
    const { clinic, notifications } = window.DATA;
    const unread = notifications.filter(n => n.unread).length;
    const [notifOpen, setNotifOpen] = useState(false);

    const titles = {
      dashboard: 'Início', agenda: 'Agendamento de Consultas', 'new-appointment': 'Nova Consulta',
      patients: 'Gestão de Pacientes', 'new-patient': 'Novo Paciente', 'patient-detail': 'Ficha do Paciente',
      'edit-patient': 'Editar Paciente', exams: 'Exames', 'exam-detail': 'Detalhe do Exame',
      services: 'Serviços Odontológicos', plans: 'Gestão de Planos',
      settings: 'Configurações', design: 'Design System',
    };

    return (
      <header className="topbar">
        <div className="topbar-search" onClick={openCmd}>
          <Icon name="search" size={17} />
          <input placeholder="Buscar pacientes, consultas..." onFocus={e => e.target.blur()} readOnly />
          <kbd>⌘K</kbd>
        </div>
        <div className="topbar-spacer" />

        <button className="icon-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19} />
        </button>

        <Menu align="right" trigger={
          <button className="icon-btn" title="Notificações"><Icon name="bell" size={19} />{unread > 0 && <span className="dot" />}</button>
        } items={notifications.map(n => ({
          icon: n.ico, label: n.title, onClick: () => window.toast && window.toast('Notificação aberta'),
        }))} />

        <Menu align="right" trigger={
          <button className="topbar-user">
            <Avatar name={clinic.user.name} size="sm" />
            <div style={{ textAlign: 'left' }} className="hide-collapse">
              <div className="nm">{clinic.user.name}</div>
              <div className="rl">{clinic.user.role}</div>
            </div>
            <Icon name="chevronDown" size={15} />
          </button>
        } items={[
          { icon: 'user', label: 'Meu perfil', onClick: () => navigate('settings', { tab: 'team' }) },
          { icon: 'settings', label: 'Configurações', onClick: () => navigate('settings') },
          { icon: theme === 'dark' ? 'sun' : 'moon', label: theme === 'dark' ? 'Modo claro' : 'Modo escuro', onClick: toggleTheme },
          { divider: true },
          { icon: 'logout', label: 'Sair', danger: true, onClick: () => navigate('__logout') },
        ]} />
      </header>
    );
  }

  Object.assign(window, { Sidebar, Topbar });
})();
