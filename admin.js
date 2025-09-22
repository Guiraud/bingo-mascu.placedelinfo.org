(() => {
  'use strict';

  const loginForm = document.getElementById('loginForm');
  const passwordInput = document.getElementById('adminPassword');
  const authError = document.getElementById('authError');
  const adminPanel = document.getElementById('adminPanel');
  const authSection = document.getElementById('auth');
  const refreshBtn = document.getElementById('refresh');
  const createArgumentBtn = document.getElementById('createArgument');
  const createPhenomenonBtn = document.getElementById('createPhenomenon');
  const logoutBtn = document.getElementById('logout');
  const argumentsTable = document.querySelector('#argumentsTable tbody');
  const phenomenaTable = document.querySelector('#phenomenaTable tbody');
  const rowTemplate = document.getElementById('rowTemplate');
  const editDialog = document.getElementById('editDialog');
  const editForm = document.getElementById('editForm');
  const editTitle = document.getElementById('editTitle');
  const itemName = document.getElementById('itemName');
  const itemContent = document.getElementById('itemContent');
  const itemSources = document.getElementById('itemSources');
  const deleteBtn = document.getElementById('deleteBtn');
  const cancelBtn = document.getElementById('cancelBtn');

  const STORAGE_KEY = 'bingo-admin-token';
  const AUTH_ENDPOINT = '/api/admin/login';
  const ARG_ENDPOINT = '/api/admin/argumentaires';
  const PHEN_ENDPOINT = '/api/admin/phenomenes';

  function setError(message) {
    if (!authError) return;
    authError.textContent = message;
    authError.hidden = !message;
  }

  function withAuthHeaders(init = {}) {
    const token = sessionStorage.getItem(STORAGE_KEY);
    return {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
        ...(token ? { 'x-admin-token': token } : {}),
      },
    };
  }

  async function authenticate(password) {
    const res = await fetch(AUTH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      throw new Error(res.status === 401 ? 'Mot de passe incorrect' : `Erreur ${res.status}`);
    }
    const data = await res.json();
    if (!data || typeof data.token !== 'string') {
      throw new Error('Réponse inattendue du serveur');
    }
    sessionStorage.setItem(STORAGE_KEY, data.token);
  }

  async function fetchJSON(url) {
    const res = await fetch(url, withAuthHeaders());
    if (res.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    if (!res.ok) {
      throw new Error(`Erreur ${res.status}`);
    }
    return res.json();
  }

  function openAdminPanel() {
    authSection.hidden = true;
    adminPanel.hidden = false;
    setError('');
  }

  function closeAdminPanel() {
    authSection.hidden = false;
    adminPanel.hidden = true;
    sessionStorage.removeItem(STORAGE_KEY);
    passwordInput.value = '';
  }

  async function loadArgumentaires() {
    const data = await fetchJSON(ARG_ENDPOINT);
    renderList(argumentsTable, data, 'phrase');
  }

  async function loadPhenomena() {
    const data = await fetchJSON(PHEN_ENDPOINT);
    renderList(phenomenaTable, data, 'nom');
  }

  function renderList(container, items, labelKey) {
    container.innerHTML = '';
    const sorted = [...items].sort((a, b) => {
      const ka = (a[labelKey] || '').toLowerCase();
      const kb = (b[labelKey] || '').toLowerCase();
      return ka.localeCompare(kb, 'fr');
    });
    sorted.forEach(item => {
      const row = rowTemplate.content.firstElementChild.cloneNode(true);
      row.querySelector('.label').textContent = item[labelKey] || '(sans titre)';
      row.dataset.item = JSON.stringify(item);
      row.dataset.labelKey = labelKey;
      container.appendChild(row);
    });
  }

  function openEditor(item, type) {
    editTitle.textContent = type === 'argument' ? 'Argumentaire' : 'Phénomène';
    itemName.value = item?.phrase || item?.nom || '';
    itemContent.value = item?.argumentaire || item?.description || '';
    const sources = Array.isArray(item?.sources) && item.sources.length ? JSON.stringify(item.sources, null, 2) : '';
    itemSources.value = sources;
    editForm.dataset.type = type;
    editForm.dataset.original = item ? JSON.stringify(item) : '';
    deleteBtn.hidden = !item;
    editDialog.showModal();
  }

  async function saveItem(type) {
    const payload = {
      name: itemName.value.trim(),
      content: itemContent.value.trim(),
      sources: parseSources(itemSources.value),
    };
    if (!payload.name || !payload.content) {
      throw new Error('Intitulé et contenu sont obligatoires.');
    }
    const endpoint = type === 'argument' ? ARG_ENDPOINT : PHEN_ENDPOINT;
    const method = 'POST';
    const res = await fetch(endpoint, withAuthHeaders({
      method,
      body: JSON.stringify(payload),
    }));
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    if (!res.ok) throw new Error(`Erreur ${res.status}`);
  }

  async function deleteItem(type, original) {
    const endpoint = type === 'argument' ? `${ARG_ENDPOINT}/delete` : `${PHEN_ENDPOINT}/delete`;
    const res = await fetch(endpoint, withAuthHeaders({
      method: 'POST',
      body: JSON.stringify({ name: original }),
    }));
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    if (!res.ok) throw new Error(`Erreur ${res.status}`);
  }

  function parseSources(raw) {
    const text = raw.trim();
    if (!text) return [];
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.filter(entry => entry && (entry.titre || entry.url));
      }
    } catch (_) {
      throw new Error('Les sources doivent être un JSON valide.');
    }
    throw new Error('Les sources doivent être un tableau JSON.');
  }

  async function bootstrap() {
    const token = sessionStorage.getItem(STORAGE_KEY);
    if (token) {
      try {
        await loadArgumentaires();
        await loadPhenomena();
        openAdminPanel();
      } catch (err) {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    setError('');
    const password = passwordInput.value.trim();
    if (!password) return;
    try {
      await authenticate(password);
      openAdminPanel();
      await Promise.all([loadArgumentaires(), loadPhenomena()]);
    } catch (err) {
      console.error(err);
      setError(err.message === 'Mot de passe incorrect' ? err.message : 'Connexion impossible.');
    }
  });

  argumentsTable.addEventListener('click', (event) => {
    const btn = event.target.closest('button.edit');
    if (!btn) return;
    const row = btn.closest('tr');
    const data = JSON.parse(row.dataset.item || '{}');
    openEditor(data, 'argument');
  });

  phenomenaTable.addEventListener('click', (event) => {
    const btn = event.target.closest('button.edit');
    if (!btn) return;
    const row = btn.closest('tr');
    const data = JSON.parse(row.dataset.item || '{}');
    openEditor(data, 'phenomenon');
  });

  refreshBtn.addEventListener('click', async () => {
    try {
      await Promise.all([loadArgumentaires(), loadPhenomena()]);
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') {
        closeAdminPanel();
        setError('Session expirée. Merci de vous reconnecter.');
      }
    }
  });

  createArgumentBtn.addEventListener('click', () => openEditor(null, 'argument'));
  createPhenomenonBtn.addEventListener('click', () => openEditor(null, 'phenomenon'));

  logoutBtn.addEventListener('click', () => {
    closeAdminPanel();
  });

  cancelBtn.addEventListener('click', () => editDialog.close());

  editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const type = editForm.dataset.type;
    try {
      await saveItem(type);
      editDialog.close();
      if (type === 'argument') {
        await loadArgumentaires();
      } else {
        await loadPhenomena();
      }
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') {
        editDialog.close();
        closeAdminPanel();
        setError('Session expirée. Merci de vous reconnecter.');
        return;
      }
      alert(err.message || 'Enregistrement impossible');
    }
  });

  deleteBtn.addEventListener('click', async () => {
    const type = editForm.dataset.type;
    const original = editForm.dataset.original;
    if (!original) return;
    const parsed = JSON.parse(original);
    const label = parsed.phrase || parsed.nom;
    if (!confirm(`Supprimer définitivement « ${label} » ?`)) {
      return;
    }
    try {
      await deleteItem(type, label);
      editDialog.close();
      if (type === 'argument') {
        await loadArgumentaires();
      } else {
        await loadPhenomena();
      }
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') {
        editDialog.close();
        closeAdminPanel();
        setError('Session expirée. Merci de vous reconnecter.');
        return;
      }
      alert(err.message || 'Suppression impossible');
    }
  });

  bootstrap();
})();
