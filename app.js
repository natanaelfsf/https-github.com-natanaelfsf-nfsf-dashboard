// NFSF Dashboard - Lógica da Aplicação
const STORAGE_KEY = 'nfsf_dashboard_v1';

const defaultData = {
  admin: { username: 'admin', password: 'nfsf2026' },
  clients: [
    {
      id: 1,
      name: 'Cliente Exemplo',
      username: 'cliente',
      password: 'cliente123',
      email: 'cliente@exemplo.com',
      campaigns: []
    }
  ]
};

let appData = loadData();
let currentUser = null; // { type: 'admin'|'client', data: ... }

function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : structuredClone(defaultData);
  } catch {
    return structuredClone(defaultData);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function showAlert(msg, type = 'success') {
  const el = document.getElementById('alert');
  if (!el) return;
  el.className = `alert alert-${type}`;
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 4000);
}

function formatCurrency(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
}

function formatNumber(val) {
  return new Intl.NumberFormat('pt-BR').format(val || 0);
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    // Simple CSV parse (handles basic quotes)
    const values = [];
    let current = '', inQuotes = false;
    for (let char of line) {
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
      else current += char;
    }
    values.push(current.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  }).filter(r => Object.values(r).some(v => v));
}

function extractMetrics(rows) {
  let spend = 0, impressions = 0, clicks = 0, results = 0;
  rows.forEach(r => {
    const s = parseFloat((r['Amount spent'] || r['Valor gasto'] || r['Spend'] || r['Amount spent (BRL)'] || '0').replace(/[^0-9.-]/g, '')) || 0;
    const imp = parseInt((r['Impressions'] || r['Impressões'] || '0').replace(/\D/g, '')) || 0;
    const clk = parseInt((r['Link clicks'] || r['Cliques no link'] || r['Clicks'] || '0').replace(/\D/g, '')) || 0;
    const res = parseInt((r['Results'] || r['Resultados'] || r['Purchases'] || '0').replace(/\D/g, '')) || 0;
    spend += s;
    impressions += imp;
    clicks += clk;
    results += res;
  });
  const ctr = impressions ? (clicks / impressions * 100) : 0;
  const cpc = clicks ? (spend / clicks) : 0;
  return { spend, impressions, clicks, results, ctr, cpc, count: rows.length };
}

function login(username, password) {
  if (username === appData.admin.username && password === appData.admin.password) {
    currentUser = { type: 'admin', name: 'Administrador' };
    return true;
  }
  const client = appData.clients.find(c => c.username === username && c.password === password);
  if (client) {
    currentUser = { type: 'client', ...client };
    return true;
  }
  return false;
}

function logout() {
  currentUser = null;
  render();
}

function render() {
  const app = document.getElementById('app');
  if (!currentUser) {
    app.innerHTML = `
      <div class="login-screen">
        <img src="logo.jpg" alt="NFSF Logo">
        <h2>NFSF Dashboard</h2>
        <p>Natanael Figueiredo • TI | Marketing Digital | Consultoria e Vendas</p>
        <input type="text" id="user" placeholder="Usuário" autocomplete="username">
        <input type="password" id="pass" placeholder="Senha" autocomplete="current-password">
        <button class="btn" onclick="doLogin()">Entrar</button>
        <div id="alert" class="alert hidden"></div>
      </div>
    `;
    return;
  }

  const isAdmin = currentUser.type === 'admin';
  app.innerHTML = `
    <header>
      <div class="logo-area">
        <img src="logo.jpg" alt="Logo">
        <div class="brand">
          <h1>NFSF</h1>
          <p>${isAdmin ? 'Painel Administrativo' : currentUser.name}</p>
        </div>
      </div>
      <nav>
        <button onclick="showSection('dashboard')">Dashboard</button>
        ${isAdmin ? '<button onclick="showSection(\'clients\')">👤 Clientes</button><button onclick="showSection(\'import\')">Importar Meta</button>' : ''}
        <button onclick="showSection('reports')">Relatórios</button>
        <button class="btn-danger btn-sm" onclick="logout()">Sair</button>
      </nav>
    </header>
    <div id="content"></div>
    <div id="alert" class="alert hidden"></div>
    <footer>
      Estratégia. Tecnologia. Crescimento. • @figueiredo.natanael • (92) 98492-5493<br>
      NFSF • Natanael Figueiredo • Acesso seguro via login
    </footer>
  `;
  showSection('dashboard');
}

function showSection(name) {
  const content = document.getElementById('content');
  if (!content) return;
  if (name === 'dashboard') content.innerHTML = renderDashboard();
  else if (name === 'clients') content.innerHTML = renderClients();
  else if (name === 'import') content.innerHTML = renderImport();
  else if (name === 'reports') content.innerHTML = renderReports();
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
}

function renderDashboard() {
  const isAdmin = currentUser.type === 'admin';
  let allRows = [];
  if (isAdmin) {
    appData.clients.forEach(c => c.campaigns.forEach(camp => allRows.push(...(camp.data || []))));
  } else {
    (currentUser.campaigns || []).forEach(camp => allRows.push(...(camp.data || [])));
  }
  const m = extractMetrics(allRows);
  return `
    <div class="section">
      <h2 style="color:var(--gold);margin-bottom:1rem;">Visão Geral de Custos e Performance</h2>
      <div class="cards">
        <div class="card"><h3>Investimento Total</h3><div class="value">${formatCurrency(m.spend)}</div></div>
        <div class="card"><h3>Impressões</h3><div class="value">${formatNumber(m.impressions)}</div></div>
        <div class="card"><h3>Cliques</h3><div class="value">${formatNumber(m.clicks)}</div></div>
        <div class="card"><h3>CTR</h3><div class="value">${m.ctr.toFixed(2)}%</div></div>
        <div class="card"><h3>CPC Médio</h3><div class="value">${formatCurrency(m.cpc)}</div></div>
        <div class="card"><h3>Resultados</h3><div class="value">${formatNumber(m.results)}</div></div>
      </div>
      <p style="color:var(--text-muted);font-size:0.9rem;">Dados importados do Meta Ads Manager. Atualize via exportação CSV.</p>
    </div>
  `;
}

function renderClients() {
  if (currentUser.type !== 'admin') return '<p>Acesso restrito.</p>';
  let html = `
    <div class="section">
      <h2 style="color:var(--gold);">Cadastro de Clientes</h2>
      <button class="btn btn-gold" onclick="showAddClient()" style="font-size:1.05rem; padding:0.7rem 1.4rem;">
        👤 + Cadastrar Novo Cliente
      </button>
      <div id="client-form" class="hidden" style="margin:1.2rem 0; background:rgba(17,17,34,0.8); padding:1.2rem; border-radius:12px; border:1px solid var(--border);">
        <h3 style="color:var(--blue); margin-bottom:0.8rem;">Novo Cliente</h3>
        <input id="c-name" placeholder="Nome do Cliente" required>
        <div style="display:flex; gap:0.5rem; align-items:center;">
          <input id="c-user" placeholder="Usuário (gerado automaticamente)" style="flex:1;">
          <button type="button" class="btn-sm" onclick="generateCredentials()" title="Gerar login e senha">🔄 Gerar</button>
        </div>
        <input id="c-pass" placeholder="Senha (gerada automaticamente)" type="text">
        <input id="c-email" placeholder="Email (opcional)">
        <div style="margin-top:0.8rem;">
          <button class="btn" onclick="addClient()">Salvar Cliente</button>
          <button class="btn-sm" style="margin-left:0.5rem;" onclick="document.getElementById('client-form').classList.add('hidden')">Cancelar</button>
        </div>
        <p id="cred-preview" style="margin-top:0.8rem; font-size:0.9rem; color:var(--gold);"></p>
      </div>
      <div class="table-wrap" style="margin-top:1.5rem;">
        <table>
          <thead><tr><th>Nome</th><th>Usuário</th><th>Senha</th><th>Campanhas</th><th>Ações</th></tr></thead>
          <tbody>
  `;
  appData.clients.forEach(c => {
    html += `<tr>
      <td>${c.name}</td>
      <td><code>${c.username}</code></td>
      <td><code>${c.password}</code></td>
      <td>${c.campaigns.length} mês(es)</td>
      <td>
        <button class="btn-sm btn-danger" onclick="deleteClient(${c.id})">Excluir</button>
      </td>
    </tr>`;
  });
  html += '</tbody></table></div></div>';
  return html;
}

function showAddClient() {
  document.getElementById('client-form').classList.remove('hidden');
  generateCredentials();
}

function generateCredentials() {
  const name = document.getElementById('c-name')?.value.trim() || 'cliente';
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'cliente';
  const random = Math.random().toString(36).substring(2, 6);
  const username = base + random;
  const password = 'NFSF' + Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const userInput = document.getElementById('c-user');
  const passInput = document.getElementById('c-pass');
  if (userInput) userInput.value = username;
  if (passInput) passInput.value = password;
  
  const preview = document.getElementById('cred-preview');
  if (preview) preview.innerHTML = `Login gerado: <strong>${username}</strong> &nbsp;|&nbsp; Senha: <strong>${password}</strong>`;
}

function addClient() {
  const name = document.getElementById('c-name').value.trim();
  const username = document.getElementById('c-user').value.trim();
  const password = document.getElementById('c-pass').value.trim();
  const email = document.getElementById('c-email').value.trim();
  if (!name || !username || !password) return showAlert('Preencha nome, usuário e senha', 'error');
  if (appData.clients.some(c => c.username === username)) return showAlert('Usuário já existe', 'error');
  appData.clients.push({
    id: Date.now(),
    name, username, password, email,
    campaigns: []
  });
  saveData();
  showAlert('Cliente cadastrado com sucesso!');
  showSection('clients');
}

function deleteClient(id) {
  if (!confirm('Excluir cliente e todos os dados?')) return;
  appData.clients = appData.clients.filter(c => c.id !== id);
  saveData();
  showSection('clients');
}

function renderImport() {
  if (currentUser.type !== 'admin') return '<p>Acesso restrito.</p>';
  const options = appData.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  return `
    <div class="section">
      <h2 style="color:var(--gold);">Importar Base do Meta Ads</h2>
      <p style="color:var(--text-muted);margin-bottom:1rem;">Exporte o relatório do Meta Ads Manager como CSV (nível Campanha ou Anúncio) e importe aqui.</p>
      <select id="imp-client">${options}</select>
      <input type="month" id="imp-month" value="${new Date().toISOString().slice(0,7)}">
      <input type="file" id="csv-file" accept=".csv" onchange="handleFile(event)">
      <div id="preview" style="margin-top:1rem;"></div>
    </div>
  `;
}

function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    const rows = parseCSV(ev.target.result);
    const clientId = parseInt(document.getElementById('imp-client').value);
    const month = document.getElementById('imp-month').value;
    const client = appData.clients.find(c => c.id === clientId);
    if (!client) return showAlert('Cliente não encontrado', 'error');
    const existing = client.campaigns.findIndex(c => c.month === month);
    const entry = { month, data: rows, importedAt: new Date().toISOString() };
    if (existing >= 0) client.campaigns[existing] = entry;
    else client.campaigns.push(entry);
    saveData();
    const m = extractMetrics(rows);
    document.getElementById('preview').innerHTML = `
      <div class="alert alert-success">Importado com sucesso! ${rows.length} linhas • Investimento: ${formatCurrency(m.spend)} • Cliques: ${formatNumber(m.clicks)}</div>
      <p>Dados associados a <strong>${client.name}</strong> para ${month}</p>
    `;
    showAlert('Dados importados!');
  };
  reader.readAsText(file);
}

function renderReports() {
  const isAdmin = currentUser.type === 'admin';
  let html = `<div class="section"><h2 style="color:var(--gold);">Relatórios de Campanhas</h2>`;
  const clients = isAdmin ? appData.clients : [currentUser];
  clients.forEach(client => {
    if (!client.campaigns || client.campaigns.length === 0) {
      html += `<p style="color:var(--text-muted);">Nenhum dado para ${client.name || 'você'}.</p>`;
      return;
    }
    html += `<h3 style="margin:1.5rem 0 0.5rem;color:var(--blue);">${client.name}</h3>`;
    client.campaigns.sort((a,b) => b.month.localeCompare(a.month)).forEach(camp => {
      const m = extractMetrics(camp.data || []);
      html += `
        <div class="card" style="text-align:left;margin:0.5rem 0;">
          <strong>${camp.month}</strong> • ${m.count} registros
          <div class="cards" style="margin-top:0.5rem;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));">
            <div><small>Investimento</small><br><strong>${formatCurrency(m.spend)}</strong></div>
            <div><small>Impressões</small><br>${formatNumber(m.impressions)}</div>
            <div><small>Cliques</small><br>${formatNumber(m.clicks)}</div>
            <div><small>CTR</small><br>${m.ctr.toFixed(2)}%</div>
            <div><small>CPC</small><br>${formatCurrency(m.cpc)}</div>
          </div>
        </div>
      `;
    });
  });
  html += '</div>';
  return html;
}

function doLogin() {
  const u = document.getElementById('user').value.trim();
  const p = document.getElementById('pass').value;
  if (login(u, p)) {
    render();
  } else {
    showAlert('Usuário ou senha inválidos', 'error');
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  // Allow enter key on login
  document.addEventListener('keypress', e => {
    if (e.key === 'Enter' && !currentUser) doLogin();
  });
  render();
});
