// --- Hardened Admin Dashboard Access ---
(function() {
  // Overlay for access check
  let overlay = document.createElement('div');
  overlay.id = 'access-check-overlay';
  overlay.style = 'position:fixed;z-index:9999;top:0;left:0;width:100vw;height:100vh;background:#fff;opacity:0.96;display:flex;align-items:center;justify-content:center;font-size:1.5rem;';
  overlay.innerHTML = '<span>Checking access...</span>';
  document.body.appendChild(overlay);
  document.body.style.opacity = '0';

  function getLoginUrl() {
    if (location.protocol === 'file:') return '../index.html';
    return '/amusements/admin';
  }

  function failAndRedirect() {
    localStorage.removeItem('admin_token');
    window.location.href = getLoginUrl();
  }

  document.addEventListener('DOMContentLoaded', function() {
    // Auth check (run before anything else)
    const token = localStorage.getItem('admin_token');
    if (!token) {
      failAndRedirect();
      return;
    }
    fetch('https://smartverse-vr-api.smartbf.workers.dev/admin/me', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(async res => {
      if (!res.ok) {
        failAndRedirect();
        return;
      }
      let data;
      try { data = await res.json(); } catch { failAndRedirect(); return; }
      if (!data.admin) { failAndRedirect(); return; }
      // Success: reveal page
      document.body.style.opacity = '';
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      // Now start dashboard logic
      if (typeof window.startDashboard === 'function') window.startDashboard();
    })
    .catch(failAndRedirect);
  });
})();

// --- End Hardened Access ---

// STEP 3: Admin Dashboard Auth Guard & Logic

// --- Live VR Data Dashboard Additions ---
const API_BASE = 'https://smartverse-vr-api.smartbf.workers.dev';
const ARCADE_ID = 'smartbf-arcade-01';
const POLL_INTERVAL = 10000;

let lastData = null;
let pollTimeout = null;

function getLoginUrl() {
  if (location.protocol === 'file:') return '../index.html';
  return '/amusements/admin';
}

function showOfflineBanner(show) {
  const offline = document.getElementById('offline-banner');
  if (offline) offline.style.display = show ? '' : 'none';
}

function showStaleIndicator(ageSec) {
  const stale = document.getElementById('stale-indicator');
  if (stale) {
    if (ageSec > 60) {
      stale.textContent = `Stale data (${ageSec}s old)`;
      stale.style.display = '';
    } else {
      stale.style.display = 'none';
    }
  }
}

function renderDashboard(data) {
  // updated_at
  const updatedAt = document.getElementById('updated-at');
  if (updatedAt) {
    updatedAt.textContent = data.updated_at ? `Last updated: ${data.updated_at}` : '';
  }
  // headsets count
  const headsetsTable = document.getElementById('headsets-table');
  if (headsetsTable) {
    if (data.status && data.status.length) {
      let html = `<table class='headsets-table'><thead><tr><th>Name</th><th>Connected</th><th>Game</th><th>Battery</th></tr></thead><tbody>`;
      for (const h of data.status) {
        html += `<tr><td>${h.name||''}</td><td>${h.connected?'<span style=\'color:green\'>Yes</span>':'<span style=\'color:red\'>No</span>'}</td><td>${h.game||''}</td><td>${h.battery!=null?h.battery+'%':'?'}</td></tr>`;
      }
      html += '</tbody></table>';
      headsetsTable.innerHTML = html;
    } else {
      headsetsTable.innerHTML = '<div>No headsets found.</div>';
    }
  }
  // games list
  const gamesList = document.getElementById('games-list');
  if (gamesList) {
    if (data.status && data.status.length) {
      const games = [...new Set(data.status.map(h=>h.game).filter(g=>g))];
      gamesList.textContent = games.length ? games.join(', ') : 'No active games.';
    } else {
      gamesList.textContent = 'No active games.';
    }
  }
}

function pollStatus() {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    window.location.href = getLoginUrl();
    return;
  }
  fetch(`${API_BASE}/dashboard/status?arcade_id=${ARCADE_ID}`, {
    headers: { 'Authorization': 'Bearer ' + token }
  })
    .then(async res => {
      if (res.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = getLoginUrl();
        return;
      }
      if (res.status === 404) {
        document.getElementById('headsets-table').innerHTML = '<div>No data yet. Waiting for first status update...</div>';
        document.getElementById('games-list').textContent = '';
        document.getElementById('updated-at').textContent = '';
        showOfflineBanner(false);
        showStaleIndicator(0);
        lastData = null;
        return;
      }
      let data;
      try { data = await res.json(); } catch { throw new Error('Invalid JSON'); }
      if (!data || !data.updated_at) throw new Error('No data');
      renderDashboard(data);
      lastData = data;
      showOfflineBanner(false);
      // Stale indicator
      const updated = new Date(data.updated_at.replace(' ', 'T') + 'Z');
      const now = new Date();
      const ageSec = Math.floor((now - updated) / 1000);
      showStaleIndicator(ageSec);
    })
    .catch(() => {
      showOfflineBanner(true);
      if (lastData) renderDashboard(lastData);
    })
    .finally(() => {
      pollTimeout = setTimeout(pollStatus, POLL_INTERVAL);
    });
}

// Move all dashboard logic into a function to be called after auth
window.startDashboard = function() {
  // Start polling after auth check
  window.addEventListener('DOMContentLoaded', function() {
    setTimeout(pollStatus, 500); // slight delay to allow auth check
  });
}; // end window.startDashboard

// STEP 4: Admin Dashboard History View

const HISTORY_CACHE_KEY = 'admin_history_cache';
const TOKEN_KEY = 'admin_token';
const PAGE_SIZE = 25;

let currentData = null;
let currentPage = 1;
let currentSort = 'newest';
let currentRange = '24h';
let currentHeadset = '';
let currentSearch = '';
let lastLoaded = null;
let lastSortCol = null;
let lastSortDir = 'desc';
let offline = false;
let stale = false;
let authChecked = false;

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function getLoginUrl() {
  if (location.protocol === 'file:') return '../index.html';
  return '/amusements/admin';
}
function showOverlay(show) {
  const overlay = document.getElementById('access-check-overlay');
  document.body.style.opacity = show ? '0' : '';
  if (overlay) overlay.style.display = show ? 'flex' : 'none';
}
function showBanner(msg) {
  const banner = document.getElementById('offline-banner');
  if (banner) {
    banner.textContent = msg;
    banner.style.display = msg ? '' : 'none';
  }
}
function showStaleBadge(show, ageSec) {
  const badge = document.getElementById('stale-indicator');
  if (badge) {
    badge.textContent = show ? `Stale data (${ageSec}s old)` : '';
    badge.style.display = show ? '' : 'none';
  }
}
function showError(msg) {
  const err = document.getElementById('error-message');
  if (err) {
    err.textContent = msg;
    err.style.display = msg ? 'block' : 'none';
  }
}
function formatSeconds(sec) {
  sec = Math.max(0, sec||0);
  const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60), s = sec%60;
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}
function formatDate(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  return d.toLocaleString();
}
function clearTable(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = '';
}
function renderSummary(data) {
  const s = data.summary || {};
  document.getElementById('online-seconds').textContent = formatSeconds(s.online_seconds);
  document.getElementById('game-seconds').textContent = formatSeconds(s.game_seconds);
  document.getElementById('idle-seconds').textContent = formatSeconds(s.idle_seconds);
  document.getElementById('sessions-count').textContent = s.sessions_count || 0;
  document.getElementById('last-updated').textContent = data.to ? `Last updated: ${formatDate(data.to)}` : '';

  // Per-headset summary section
  let perHeadsetDiv = document.getElementById('per-headset-summary');
  if (!perHeadsetDiv) {
    perHeadsetDiv = document.createElement('div');
    perHeadsetDiv.id = 'per-headset-summary';
    perHeadsetDiv.style = 'margin-top:16px;';
    const parent = document.getElementById('summary-cards') || document.body;
    parent.appendChild(perHeadsetDiv);
  }
  // If per_headset missing, hide section
  if (!Array.isArray(data.per_headset)) {
    perHeadsetDiv.style.display = 'none';
    return;
  }
  perHeadsetDiv.style.display = '';
  let html = `<div style="font-weight:bold;margin-bottom:4px;">Per Headset</div><table style="width:auto;min-width:320px;font-size:0.97em;"><thead><tr><th>Headset</th><th>Operating</th><th>Game</th><th>Idle</th><th>Sessions</th></tr></thead><tbody>`;
  for (const h of data.per_headset) {
    html += `<tr><td>${h.headset_name||h.headset_serial||''}</td><td>${formatSeconds(h.online_seconds)}</td><td>${formatSeconds(h.game_seconds)}</td><td>${formatSeconds(h.idle_seconds)}</td><td>${h.sessions_count||0}</td></tr>`;
  }
  html += '</tbody></table>';
  perHeadsetDiv.innerHTML = html;
}
function renderGameTotals(data) {
  const container = document.getElementById('game-totals-table-container');
  if (!container) return;
  const totals = (data.game_totals||[]).slice();
  totals.sort((a,b)=>b.total_seconds-a.total_seconds);
  let html = `<table class='game-totals-table'><thead><tr><th>Game</th><th>Sessions</th><th>Total Time</th></tr></thead><tbody>`;
  for (const g of totals) {
    html += `<tr class='game-row' data-game='${g.game_package}'><td>${g.game_package}</td><td>${g.sessions}</td><td>${formatSeconds(g.total_seconds)}</td></tr>`;
  }
  html += '</tbody></table>';
  container.innerHTML = html;
  // Click to filter timeline
  container.querySelectorAll('.game-row').forEach(row => {
    row.onclick = () => {
      document.getElementById('search-input').value = row.getAttribute('data-game');
      currentSearch = row.getAttribute('data-game');
      currentPage = 1;
      renderTimeline(currentData);
    };
  });
}
function renderTimeline(data) {
  const container = document.getElementById('timeline-table-container');
  if (!container) return;
  let sessions = (data.sessions||[]).slice();
  // Filter by headset (use headset_serial as stable key)
  if (currentHeadset) {
    // Find serial for selected name (for backward compat, allow name or serial)
    let serial = currentHeadset;
    // Try to map name to serial if per_headset exists
    if (Array.isArray(data.per_headset)) {
      const found = data.per_headset.find(h => h.headset_name === currentHeadset || h.headset_serial === currentHeadset);
      if (found) serial = found.headset_serial;
    }
    sessions = sessions.filter(s=>s.headset_serial===serial || s.headset_name===currentHeadset);
  }
  // Filter by search
  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    sessions = sessions.filter(s=>(s.game_package||'').toLowerCase().includes(q) || (s.headset_name||'').toLowerCase().includes(q));
  }
  // Sort by column
  if (lastSortCol) {
    sessions.sort((a,b)=>{
      let va, vb;
      if (lastSortCol==='duration') { va=a.duration_seconds||0; vb=b.duration_seconds||0; }
      else if (lastSortCol==='start') { va=Date.parse(a.started_at); vb=Date.parse(b.started_at); }
      else if (lastSortCol==='end') { va=Date.parse(a.ended_at||''); vb=Date.parse(b.ended_at||''); }
      else if (lastSortCol==='game') { va=a.game_package||''; vb=b.game_package||''; }
      else if (lastSortCol==='headset') { va=a.headset_name||''; vb=b.headset_name||''; }
      else { va=Date.parse(a.started_at); vb=Date.parse(b.started_at); }
      if (va<vb) return lastSortDir==='asc'?-1:1;
      if (va>vb) return lastSortDir==='asc'?1:-1;
      return 0;
    });
  } else {
    // Sort by dropdown
    if (currentSort==='oldest') sessions.sort((a,b)=>Date.parse(a.started_at)-Date.parse(b.started_at));
    else if (currentSort==='duration_desc') sessions.sort((a,b)=>(b.duration_seconds||0)-(a.duration_seconds||0));
    else if (currentSort==='duration_asc') sessions.sort((a,b)=>(a.duration_seconds||0)-(b.duration_seconds||0));
    else if (currentSort==='game_asc') sessions.sort((a,b)=>(a.game_package||'').localeCompare(b.game_package||''));
    else sessions.sort((a,b)=>Date.parse(b.started_at)-Date.parse(a.started_at));
  }
  // Pagination
  const totalPages = Math.max(1, Math.ceil(sessions.length/PAGE_SIZE));
  currentPage = Math.max(1, Math.min(currentPage, totalPages));
  const startIdx = (currentPage-1)*PAGE_SIZE;
  const pageSessions = sessions.slice(startIdx, startIdx+PAGE_SIZE);
  let html = `<table class='timeline-table'><thead><tr>
    <th data-col='start'>Start</th>
    <th data-col='end'>End</th>
    <th data-col='duration'>Duration</th>
    <th data-col='type'>Type</th>
    <th data-col='headset'>Headset</th>
    <th data-col='game'>Game</th>
  </tr></thead><tbody>`;
  for (const s of pageSessions) {
    const start = formatDate(s.started_at);
    const end = s.ended_at ? formatDate(s.ended_at) : '<span style="color:#ff6b6b">Running</span>';
    const dur = s.ended_at ? formatSeconds(s.duration_seconds) : formatSeconds(Math.floor((Date.now()-Date.parse(s.started_at))/1000));
    html += `<tr><td>${start}</td><td>${end}</td><td>${dur}</td><td>Game</td><td>${s.headset_name||''}</td><td>${s.game_package||''}</td></tr>`;
  }
  html += '</tbody></table>';
  container.innerHTML = html;
  // Table sorting
  container.querySelectorAll('th[data-col]').forEach(th => {
    th.style.cursor = 'pointer';
    th.onclick = () => {
      const col = th.getAttribute('data-col');
      if (lastSortCol===col) lastSortDir = lastSortDir==='asc'?'desc':'asc';
      else { lastSortCol=col; lastSortDir='desc'; }
      renderTimeline(currentData);
    };
  });
  // Pagination controls
  const pag = document.getElementById('pagination-controls');
  pag.innerHTML = `<button id='prev-page' ${currentPage<=1?'disabled':''}>Prev</button> Page ${currentPage} of ${totalPages} <button id='next-page' ${currentPage>=totalPages?'disabled':''}>Next</button>`;
  document.getElementById('prev-page').onclick = ()=>{ if(currentPage>1){currentPage--;renderTimeline(currentData);} };
  document.getElementById('next-page').onclick = ()=>{ if(currentPage<totalPages){currentPage++;renderTimeline(currentData);} };
}
function renderHeadsetFilter(data) {
  const sel = document.getElementById('headset-select');
  if (!sel) return;
  let headsets = [];
  // Prefer per_headset for filter options
  if (Array.isArray(data.per_headset)) {
    headsets = data.per_headset.map(h => ({
      label: h.headset_name || h.headset_serial,
      value: h.headset_serial
    }));
  } else {
    // fallback: use sessions
    headsets = Array.from(new Set((data.sessions||[]).map(s=>s.headset_name).filter(Boolean))).map(h=>({label:h,value:h}));
  }
  sel.innerHTML = `<option value="">All</option>` + headsets.map(h=>`<option value="${h.value}">${h.label}</option>`).join('');
  sel.value = currentHeadset;
}
function updateAll(data) {
  currentData = data;
  renderSummary(data);
  renderGameTotals(data);
  renderTimeline(data);
  renderHeadsetFilter(data);
}
function cacheData(data) {
  try { localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(data)); } catch {}
}
function loadCache() {
  try { return JSON.parse(localStorage.getItem(HISTORY_CACHE_KEY)||'null'); } catch { return null; }
}
function fetchHistory() {
  offline = false;
  stale = false;
  showBanner('');
  showStaleBadge(false);
  showError('');
  const token = getToken();
  if (!token) return;
  let url = `${API_BASE}/dashboard/history?arcade_id=${ARCADE_ID}&range=${currentRange}&sort=${currentSort}`;
  fetch(url, { headers: { 'Authorization': 'Bearer ' + token } })
    .then(async res => {
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      lastLoaded = Date.now();
      cacheData(data);
      updateAll(data);
      // Stale badge
      const updated = data.to ? Date.parse(data.to) : Date.now();
      const ageSec = Math.floor((Date.now()-updated)/1000);
      if (ageSec>60) { stale=true; showStaleBadge(true, ageSec); } else { showStaleBadge(false); }
    })
    .catch(()=>{
      offline=true;
      showBanner('Offline: showing last loaded data');
      const cached = loadCache();
      if (cached) {
        updateAll(cached);
        const updated = cached.to ? Date.parse(cached.to) : Date.now();
        const ageSec = Math.floor((Date.now()-updated)/1000);
        if (ageSec>60) { stale=true; showStaleBadge(true, ageSec); } else { showStaleBadge(false); }
      } else {
        showError('No cached data available.');
      }
    });
}
function setupControls() {
  document.getElementById('range-select').onchange = e => {
    currentRange = e.target.value;
    currentPage = 1;
    fetchHistory();
  };
  document.getElementById('sort-select').onchange = e => {
    currentSort = e.target.value;
    lastSortCol = null;
    currentPage = 1;
    fetchHistory();
  };
  document.getElementById('headset-select').onchange = e => {
    currentHeadset = e.target.value;
    currentPage = 1;
    renderTimeline(currentData);
  };
  document.getElementById('search-input').oninput = e => {
    currentSearch = e.target.value;
    currentPage = 1;
    renderTimeline(currentData);
  };
  document.getElementById('refresh-btn').onclick = () => {
    fetchHistory();
  };
}
function setupAuthGuard() {
  showOverlay(true);
  const token = getToken();
  if (!token) {
    window.location.href = getLoginUrl();
    return;
  }
  fetch(`${API_BASE}/admin/me`, { headers: { 'Authorization': 'Bearer ' + token } })
    .then(async res => {
      if (!res.ok) throw new Error('Auth failed');
      const data = await res.json();
      if (!data.admin) throw new Error('Not admin');
      showOverlay(false);
      authChecked = true;
      // Load cache immediately
      const cached = loadCache();
      if (cached) updateAll(cached);
      fetchHistory();
      setupControls();
    })
    .catch(()=>{
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = getLoginUrl();
    });
}
document.addEventListener('DOMContentLoaded', function() {
  setupAuthGuard();
  document.getElementById('logout-btn').onclick = function() {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = getLoginUrl();
  };
});
window.addEventListener('beforeunload', function() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_history_cache');
});
// STEP 4 END
