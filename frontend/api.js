/* Odontotech — API client + bootstrap.
   Connects the static frontend to the Express/Prisma backend.
   Loaded after data.js (so window.DATA defaults exist) and before the screens. */
(function () {
  // Same-origin ('') when served by the backend on :4000; otherwise target it directly.
  // Override with localStorage 'odt-api' if the backend runs elsewhere.
  const BASE = localStorage.getItem('odt-api') ?? (location.port === '4000' ? '' : 'http://localhost:4000');

  const tokens = {
    get access() { return localStorage.getItem('odt-token'); },
    get refresh() { return localStorage.getItem('odt-refresh'); },
    set({ accessToken, refreshToken }) {
      if (accessToken) localStorage.setItem('odt-token', accessToken);
      if (refreshToken) localStorage.setItem('odt-refresh', refreshToken);
    },
    clear() { localStorage.removeItem('odt-token'); localStorage.removeItem('odt-refresh'); },
  };

  async function parse(res) {
    let json = null;
    try { json = await res.json(); } catch { /* no body */ }
    return json;
  }

  // Core request. Returns the meaningful payload (json.data for every endpoint).
  async function request(method, path, body, opts = {}) {
    const isForm = body instanceof FormData;
    const headers = {};
    if (!isForm && body !== undefined) headers['Content-Type'] = 'application/json';
    if (tokens.access) headers['Authorization'] = `Bearer ${tokens.access}`;

    let res = await fetch(BASE + path, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });

    // Auto-refresh once on expired/invalid access token.
    if (res.status === 401 && tokens.refresh && !opts._retry) {
      const ok = await tryRefresh();
      if (ok) return request(method, path, body, { ...opts, _retry: true });
      tokens.clear();
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    const json = await parse(res);
    if (!res.ok || (json && json.success === false)) {
      const fieldMsg = Array.isArray(json?.error) && json.error[0]?.message;
      throw new Error(fieldMsg || (json && json.message) || `Erro ${res.status}`);
    }
    return json ? json.data : null;
  }

  async function tryRefresh() {
    try {
      const res = await fetch(BASE + '/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refresh }),
      });
      const json = await parse(res);
      if (res.ok && json && json.success && json.data) {
        tokens.set(json.data);
        return true;
      }
    } catch { /* ignore */ }
    return false;
  }

  const get = (p) => request('GET', p);
  const post = (p, b) => request('POST', p, b);
  const put = (p, b) => request('PUT', p, b);
  const patch = (p, b) => request('PATCH', p, b);
  const del = (p) => request('DELETE', p);
  const qs = (o) => {
    const s = Object.entries(o || {}).filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
    return s ? '?' + s : '';
  };

  const API = {
    BASE,
    isAuthed: () => !!tokens.access,

    // --- Auth ---
    async register(clinicName, name, email, password) {
      const data = await post('/auth/register', { clinicName, name, email, password });
      tokens.set(data);
      return data.user;
    },
    async login(email, password) {
      const data = await post('/auth/login', { email, password });
      tokens.set(data);
      return data.user;
    },
    async logout() {
      try { if (tokens.refresh) await post('/auth/logout', { refreshToken: tokens.refresh }); } catch { /* ignore */ }
      tokens.clear();
    },
    me: () => get('/auth/me'),

    // --- Settings & team ---
    getSettings: () => get('/config'),
    updateSettings: (data) => put('/config', data),
    listDentists: () => get('/config/dentists'),
    listUsers: (params) => get('/config/users' + qs(params)),
    createUser: (data) => post('/config/users', data),
    updateUser: (id, data) => put('/config/users/' + id, data),
    deleteUser: (id) => del('/config/users/' + id),

    // --- Patients ---
    listPatients: (params) => get('/patients' + qs({ limit: 100, ...params })),
    getPatient: (id) => get('/patients/' + id),
    createPatient: (data) => post('/patients', data),
    updatePatient: (id, data) => put('/patients/' + id, data),
    deletePatient: (id) => del('/patients/' + id),

    // --- Appointments ---
    agenda: (start, end, dentistId) => get('/appointments/agenda' + qs({ start, end, dentistId })),
    createAppointment: (data) => post('/appointments', data),
    updateAppointment: (id, data) => put('/appointments/' + id, data),
    setAppointmentStatus: (id, status) => patch(`/appointments/${id}/status`, { status }),
    deleteAppointment: (id) => del('/appointments/' + id),
    attachServices: (id, services) => post(`/appointments/${id}/services`, { services }),

    // --- Services ---
    listServices: (params) => get('/services' + qs({ limit: 100, ...params })),
    createService: (data) => post('/services', data),
    updateService: (id, data) => put('/services/' + id, data),
    deleteService: (id) => del('/services/' + id),

    // --- Plans ---
    listPlans: (params) => get('/plans' + qs({ limit: 100, ...params })),
    createPlan: (data) => post('/plans', data),
    updatePlan: (id, data) => put('/plans/' + id, data),
    deletePlan: (id) => del('/plans/' + id),

    // --- Exams ---
    listExams: (params) => get('/exams' + qs({ limit: 100, ...params })),
    createExam(patientId, data, files) {
      return post(`/patients/${patientId}/exams`, examForm(data, files));
    },
    updateExam(id, data, files) {
      return put('/exams/' + id, examForm(data, files));
    },
    deleteExam: (id) => del('/exams/' + id),

    /** Load every collection into window.DATA before the app renders. */
    async bootstrap() {
      const D = window.DATA;
      const safe = (p, fallback) => p.catch(() => fallback);

      const [dentists, plans, services, patients, appts, exams, settings, user] = await Promise.all([
        safe(API.listDentists(), D.dentists),
        safe(API.listPlans(), D.plans),
        safe(API.listServices(), D.services),
        safe(API.listPatients(), D.patients),
        safe(API.agenda('2020-01-01', '2035-12-31'), D.appts),
        safe(API.listExams(), D.exams),
        safe(API.getSettings(), null),
        safe(API.me(), null),
      ]);

      D.dentists = dentists;
      D.plans = plans;
      D.services = services;
      D.patients = patients;
      D.appts = appts;
      D.exams = exams;

      // Team (ADMIN only) — tolerate 403 for dentist accounts.
      D.team = await safe(API.listUsers(), dentists.map((d) => ({
        id: d.id, name: d.name, email: '', role: 'DENTIST',
        specialty: d.spec, color: d.color, initials: d.initials, active: true,
      })));

      if (settings) {
        D.clinic = {
          ...D.clinic,
          name: settings.clinicName,
          unit: settings.unit || '',
          cnpj: settings.cnpj || '',
          phone: settings.phone || '',
          email: settings.email || '',
          address: settings.address || '',
          businessHoursStart: settings.businessHoursStart,
          businessHoursEnd: settings.businessHoursEnd,
          slotMinutes: settings.appointmentSlotMinutes,
          timezone: settings.timezone,
        };
        D._settingsId = settings.id;
      }
      if (user) {
        D.clinic.user = {
          name: user.name,
          role: user.role === 'ADMIN' ? 'Administrador(a)' : 'Dentista',
          initials: user.initials || user.name.split(' ').map((w) => w[0]).slice(0, 2).join(''),
        };
        D.currentUser = user;
      }
      return D;
    },
  };

  function examForm(data, files) {
    const fd = new FormData();
    Object.entries(data || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, v);
    });
    (files || []).forEach((f) => fd.append('files', f));
    return fd;
  }

  window.API = API;
})();
