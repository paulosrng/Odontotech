/* Odontotech — UI primitives */
(function () {
  const { useState, useEffect, useRef } = React;
  const Icon = window.Icon;

  /* ---------- Avatar ---------- */
  function Avatar({ name = '?', size = 'md', src }) {
    const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const bg = window.avatarColor(name);
    return (
      <div className={`avatar avatar-${size}`} style={{ background: src ? 'transparent' : bg }}>
        {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
      </div>
    );
  }

  /* ---------- Button ---------- */
  function Button({ variant = 'secondary', size, icon, iconRight, children, className = '', ...rest }) {
    const cls = ['btn', `btn-${variant}`, size ? `btn-${size}` : '', !children ? 'btn-icon' : '', className].filter(Boolean).join(' ');
    return (
      <button className={cls} {...rest}>
        {icon && <Icon name={icon} size={size === 'sm' ? 15 : 17} />}
        {children}
        {iconRight && <Icon name={iconRight} size={size === 'sm' ? 15 : 17} />}
      </button>
    );
  }

  /* ---------- Status badge ---------- */
  function StatusBadge({ status, dot = true }) {
    const s = window.DATA.statusByKey[status] || { label: status, badge: 'gray' };
    return <span className={`badge badge-${s.badge}`}>{dot && <span className="bdot" />}{s.label}</span>;
  }
  function Badge({ color = 'gray', dot = false, children }) {
    return <span className={`badge badge-${color}`}>{dot && <span className="bdot" />}{children}</span>;
  }

  /* ---------- Card ---------- */
  function Card({ children, className = '', ...rest }) {
    return <div className={`card ${className}`} {...rest}>{children}</div>;
  }

  /* ---------- Field / inputs ---------- */
  function Field({ label, required, hint, error, children, className = '', span2 }) {
    return (
      <div className={`field ${error ? 'invalid' : ''} ${span2 ? 'col-span-2' : ''} ${className}`}>
        {label && <label>{label}{required && <span className="req"> *</span>}</label>}
        {children}
        {error ? <span className="err">{error}</span> : hint ? <span className="hint">{hint}</span> : null}
      </div>
    );
  }
  function Input({ lead, trail, className = '', ...rest }) {
    if (lead || trail) {
      return (
        <div className="input-group">
          {lead && <span className="lead">{lead}</span>}
          <input className={`input ${lead ? 'has-lead' : ''} ${trail ? 'has-trail' : ''} ${className}`} {...rest} />
          {trail && <span className="trail">{trail}</span>}
        </div>
      );
    }
    return <input className={`input ${className}`} {...rest} />;
  }
  function Select({ children, ...rest }) { return <select className="select" {...rest}>{children}</select>; }
  function Textarea({ ...rest }) { return <textarea className="textarea" {...rest} />; }
  function Switch({ checked, onChange }) {
    return (
      <label className="switch">
        <input type="checkbox" checked={checked} onChange={e => onChange && onChange(e.target.checked)} />
        <span className="track"><span className="thumb" /></span>
      </label>
    );
  }

  /* ---------- Segmented ---------- */
  function Segmented({ options, value, onChange }) {
    return (
      <div className="segmented">
        {options.map(o => (
          <button key={o.value} className={value === o.value ? 'active' : ''} onClick={() => onChange(o.value)}>{o.label}</button>
        ))}
      </div>
    );
  }

  /* ---------- Modal ---------- */
  function Modal({ title, subtitle, children, footer, onClose, width }) {
    useEffect(() => {
      const h = e => e.key === 'Escape' && onClose && onClose();
      window.addEventListener('keydown', h);
      return () => window.removeEventListener('keydown', h);
    }, []);
    return (
      <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose && onClose()}>
        <div className="modal" style={width ? { width } : undefined} onMouseDown={e => e.stopPropagation()}>
          <div className="modal-head">
            <div>
              <h3 className="h2">{title}</h3>
              {subtitle && <div className="sub">{subtitle}</div>}
            </div>
            <button className="close-x" onClick={onClose}><Icon name="x" size={18} /></button>
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-foot">{footer}</div>}
        </div>
      </div>
    );
  }

  /* ---------- Drawer ---------- */
  function Drawer({ title, subtitle, children, footer, onClose, width }) {
    useEffect(() => {
      const h = e => e.key === 'Escape' && onClose && onClose();
      window.addEventListener('keydown', h);
      return () => window.removeEventListener('keydown', h);
    }, []);
    return (
      <div className="overlay drawer-overlay" onMouseDown={e => e.target === e.currentTarget && onClose && onClose()}>
        <div className="drawer" style={width ? { width } : undefined} onMouseDown={e => e.stopPropagation()}>
          <div className="drawer-head">
            <div>
              <h3 className="h2">{title}</h3>
              {subtitle && <div className="sub muted" style={{ fontSize: 13, marginTop: 3 }}>{subtitle}</div>}
            </div>
            <button className="close-x" onClick={onClose}><Icon name="x" size={18} /></button>
          </div>
          <div className="drawer-body">{children}</div>
          {footer && <div className="drawer-foot">{footer}</div>}
        </div>
      </div>
    );
  }

  /* ---------- Stepper ---------- */
  function Stepper({ steps, current }) {
    return (
      <div className="stepper">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div className={`step ${i === current ? 'active' : ''} ${i < current ? 'done' : ''}`}>
              <div className="step-dot">{i < current ? <Icon name="check" size={15} /> : i + 1}</div>
              <div className="step-text">
                <div className="t">{s.t}</div>
                <div className="d">{s.d}</div>
              </div>
            </div>
            {i < steps.length - 1 && <div className={`step-line ${i < current ? 'done' : ''}`} />}
          </React.Fragment>
        ))}
      </div>
    );
  }

  /* ---------- Empty state ---------- */
  function EmptyState({ icon = 'folder', title, text, action }) {
    return (
      <div className="empty">
        <div className="empty-ico"><Icon name={icon} size={28} /></div>
        <h3 className="h3">{title}</h3>
        {text && <p>{text}</p>}
        {action}
      </div>
    );
  }

  /* ---------- Pagination ---------- */
  function Pagination({ page, pageCount, total, onPage, perPage }) {
    if (pageCount <= 1 && total <= perPage) {
      return (
        <div className="pagination">
          <span>{total} {total === 1 ? 'registro' : 'registros'}</span>
        </div>
      );
    }
    const pages = [];
    for (let i = 1; i <= pageCount; i++) {
      if (i === 1 || i === pageCount || Math.abs(i - page) <= 1) pages.push(i);
      else if (pages[pages.length - 1] !== '…') pages.push('…');
    }
    const from = (page - 1) * perPage + 1;
    const to = Math.min(total, page * perPage);
    return (
      <div className="pagination">
        <span>Exibindo <b>{from}–{to}</b> de <b>{total}</b></span>
        <div className="pag-btns">
          <button className="pag-btn" disabled={page === 1} onClick={() => onPage(page - 1)}><Icon name="chevronLeft" size={15} /></button>
          {pages.map((p, i) => p === '…'
            ? <span key={i} className="pag-btn" style={{ border: 'none', background: 'transparent', pointerEvents: 'none' }}>…</span>
            : <button key={i} className={`pag-btn ${p === page ? 'active' : ''}`} onClick={() => onPage(p)}>{p}</button>)}
          <button className="pag-btn" disabled={page === pageCount} onClick={() => onPage(page + 1)}><Icon name="chevronRight" size={15} /></button>
        </div>
      </div>
    );
  }

  /* ---------- WhatsApp button ---------- */
  function WhatsAppButton({ phone, size, label = 'WhatsApp' }) {
    return (
      <button className={`wa-btn ${size === 'sm' ? 'btn-sm' : ''}`} onClick={() => window.toast && window.toast(`Abrindo conversa no WhatsApp com ${phone}`)} title={`Conversar via WhatsApp: ${phone}`}>
        <Icon name="whatsapp" size={size === 'sm' ? 15 : 17} />{label}
      </button>
    );
  }

  /* ---------- Dropdown menu ---------- */
  function Menu({ trigger, items, align = 'right' }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
      const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
      document.addEventListener('mousedown', h);
      return () => document.removeEventListener('mousedown', h);
    }, []);
    return (
      <div style={{ position: 'relative' }} ref={ref}>
        <div onClick={() => setOpen(o => !o)}>{trigger}</div>
        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', [align]: 0, zIndex: 50,
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
            boxShadow: 'var(--shadow-pop)', padding: 6, minWidth: 180,
          }}>
            {items.map((it, i) => it.divider ? <div key={i} className="divider" style={{ margin: '5px 0' }} /> : (
              <button key={i} onClick={() => { setOpen(false); it.onClick && it.onClick(); }} style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 10px',
                border: 'none', background: 'transparent', borderRadius: 'var(--r-xs)', fontSize: 13.5,
                fontWeight: 500, color: it.danger ? 'var(--rose-text)' : 'var(--text)', textAlign: 'left',
              }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {it.icon && <Icon name={it.icon} size={16} />}{it.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ---------- Toast host ---------- */
  function ToastHost() {
    const [toasts, setToasts] = useState([]);
    useEffect(() => {
      window.toast = (msg, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts(t => [...t, { id, msg, type }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
      };
    }, []);
    const colors = { info: 'blue', success: 'green', error: 'rose', warn: 'amber' };
    const icons = { info: 'info', success: 'checkCircle', error: 'alert', warn: 'alert' };
    return (
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toasts.map(t => (
          <div key={t.id} className="fade-in" style={{
            display: 'flex', alignItems: 'center', gap: 11, background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-lg)',
            padding: '12px 16px', minWidth: 280, maxWidth: 380,
          }}>
            <span className={`stat-ico`} style={{ width: 30, height: 30, background: `var(--${colors[t.type]}-soft)`, color: `var(--${colors[t.type]}-text)` }}>
              <Icon name={icons[t.type]} size={17} />
            </span>
            <span style={{ fontSize: 13.5, fontWeight: 500, flex: 1 }}>{t.msg}</span>
          </div>
        ))}
      </div>
    );
  }

  Object.assign(window, {
    Avatar, Button, StatusBadge, Badge, Card, Field, Input, Select, Textarea, Switch,
    Segmented, Modal, Drawer, Stepper, EmptyState, Pagination, WhatsAppButton, Menu, ToastHost,
  });
})();
