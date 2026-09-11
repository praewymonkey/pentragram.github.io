(function () {
  'use strict';

  const data = PORTAL_DATA;
  const functions = data.functions.map(function (item) {
    const tags = [item.category, item.priority, item.status].concat(item.e2e || []).filter(Boolean);
    return Object.assign({}, item, {
      kind: 'Function',
      tags: tags,
      snippet: 'Reference entry for ' + item.name + ' in the ' + item.category + ' folder.'
    });
  });
  const documents = data.documents.map(function (item) {
    return Object.assign({}, item, {
      kind: 'Standalone FSD',
      category: 'Standalone FSDs',
      tags: [item.priority, item.status, 'FSD'].filter(Boolean),
      snippet: 'Standalone functional specification document. Open the source file for the recorded content.'
    });
  });
  const allItems = functions.concat(documents);
  const view = document.getElementById('view');
  const categoryNav = document.getElementById('category-nav');
  const state = { query: '', category: 'all', kind: 'all' };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char];
    });
  }
  function categoryCount(category) { return functions.filter(function (item) { return item.category === category; }).length; }
  function updateChrome() {
    document.getElementById('nav-count').textContent = functions.length;
    document.getElementById('nav-doc-count').textContent = documents.length;
    categoryNav.innerHTML = data.categories.map(function (category) {
      const count = categoryCount(category[1]);
      return '<button class="' + (state.category === category[1] ? 'active' : '') + '" data-category="' + esc(category[1]) + '">' + esc(category[1]) + '<em>' + count + '</em></button>';
    }).join('');
    categoryNav.querySelectorAll('button').forEach(function (button) {
      button.addEventListener('click', function () { state.category = button.dataset.category; state.kind = 'all'; location.hash = 'all'; render(); });
    });
  }
  function filteredItems() {
    const query = state.query.trim().toLowerCase();
    return allItems.filter(function (item) {
      const categoryMatch = state.category === 'all' || item.category === state.category;
      const kindMatch = state.kind === 'all' || (state.kind === 'documents' && item.kind === 'Standalone FSD') || (state.kind === 'functions' && item.kind === 'Function');
      const haystack = [item.id, item.name, item.category, item.priority, item.status, item.risk, item.snippet].concat(item.tags || []).join(' ').toLowerCase();
      return categoryMatch && kindMatch && (!query || haystack.indexOf(query) !== -1);
    });
  }
  function card(item) {
    return '<article class="result-card"><div><h3><a href="#doc/' + encodeURIComponent(item.id) + '">' + esc(item.id) + ' · ' + esc(item.name) + '</a></h3><p>' + esc(item.snippet) + '</p><div class="meta"><span class="tag">' + esc(item.category) + '</span><span class="tag">' + esc(item.updated || 'Date not recorded') + '</span>' + (item.risk ? '<span class="badge warn">' + esc(item.risk) + '</span>' : '') + '</div></div><a class="open" href="#doc/' + encodeURIComponent(item.id) + '">View details&nbsp; →</a></article>';
  }
  function listView(title, description, kind) {
    state.kind = kind || state.kind;
    const results = filteredItems();
    view.innerHTML = '<div class="hero"><div><p class="eyebrow">Knowledge index</p><h2>' + esc(title) + '</h2><p>' + esc(description) + '</p></div><div class="hero-action"><strong>' + results.length + '</strong><span>matching references</span></div></div><div class="panel"><div class="searchbar"><label class="sr-only" for="search">Search the knowledge base</label><input id="search" type="search" value="' + esc(state.query) + '" placeholder="Search titles, folders, tags or IDs…" autocomplete="off"><select id="kind" class="select" aria-label="Filter by type"><option value="all">All types</option><option value="functions">Functions</option><option value="documents">Standalone FSDs</option></select></div><div class="result-list">' + (results.length ? results.map(card).join('') : '<div class="empty">No references match this search. Try a broader term or clear the folder filter.</div>') + '</div></div>';
    document.getElementById('kind').value = state.kind;
    document.getElementById('search').addEventListener('input', function (event) { state.query = event.target.value; listView(title, description, kind); document.getElementById('search').focus(); });
    document.getElementById('kind').addEventListener('change', function (event) { state.kind = event.target.value; listView(title, description, state.kind); });
  }
  function homeView() {
    state.category = 'all'; state.kind = 'all';
    const signedOff = functions.filter(function (item) { return item.status === 'signed-off'; }).length;
    const atRisk = functions.filter(function (item) { return item.risk; }).length;
    view.innerHTML = '<div class="hero"><div><p class="eyebrow">SCB Acquiring · internal reference</p><h2>ACQS Knowledge Portal</h2><p>One calm place to browse the existing function tracker, locate source files and keep document versions discoverable.</p></div><div class="hero-action"><strong>' + allItems.length + '</strong><span>indexed references</span></div></div><div class="stats"><div class="stat"><strong>' + functions.length + '</strong><span>functions indexed</span></div><div class="stat"><strong>' + data.categories.length + '</strong><span>folders</span></div><div class="stat"><strong>' + documents.length + '</strong><span>standalone FSDs</span></div><div class="stat warn"><strong>' + atRisk + '</strong><span>flagged for attention</span></div></div><section class="panel"><div class="panel-title"><h3>Browse by folder</h3><a href="#all">View all functions →</a></div><div class="folder-grid">' + data.categories.map(function (category) { return '<a class="folder" href="#all/' + encodeURIComponent(category[1]) + '"><b>' + categoryCount(category[1]) + '</b><strong>' + esc(category[1]) + '</strong><span>Open folder →</span></a>'; }).join('') + '</div></section><section class="panel"><div class="panel-title"><h3>Getting started</h3></div><p class="muted">Use search for a function name, ID, category, priority or status. Open any result to see its metadata, the current source path and recorded versions. Add new entries in <code>data.js</code>; keep sensitive document content in the private repository rather than this public-facing template.</p><div class="notice">The original E2E function mapping remains available from the left navigation and the existing source paths are preserved.</div></section>';
  }
  function detailView(id) {
    const item = allItems.find(function (entry) { return entry.id === id; });
    if (!item) { listView('Reference not found', 'The requested item is not in the current index.', 'all'); return; }
    const versions = item.versions && item.versions.length ? item.versions : [{ label: 'Current', date: item.updated || 'Date not recorded', path: item.path }];
    const versionMarkup = versions.map(function (version) {
      return '<div class="version"><div><strong>' + esc(version.label || 'Version') + '</strong><small>' + esc(version.date || 'Date not recorded') + '</small></div><a href="' + esc(version.path) + '">Open source →</a></div>';
    }).join('');
    view.innerHTML = '<div class="detail-head"><div><a class="back" href="#all">← Back to index</a><h2>' + esc(item.name) + '</h2><p>' + esc(item.snippet) + '</p><div class="meta"><span class="badge">' + esc(item.kind) + '</span><span class="tag">' + esc(item.category) + '</span><span class="tag">' + esc(item.status || 'Status not recorded') + '</span></div></div></div><div class="detail-grid"><section class="detail-card"><h3>Reference metadata</h3><div class="facts"><div class="fact"><small>Reference ID</small><strong>' + esc(item.id) + '</strong></div><div class="fact"><small>Priority</small><strong>' + esc(item.priority || 'Not recorded') + '</strong></div><div class="fact"><small>Folder</small><strong>' + esc(item.category) + '</strong></div><div class="fact"><small>Last updated</small><strong>' + esc(item.updated || 'Not recorded') + '</strong></div></div>' + (item.e2e && item.e2e.length ? '<div class="notice">E2E mappings: ' + esc(item.e2e.join(', ')) + '</div>' : '') + '</section><section class="detail-card"><h3>Version history</h3>' + versionMarkup + (versions.length === 1 ? '<p class="muted" style="font-size:12px;margin-bottom:0">Older versions will appear here when they are added to this record in <code>data.js</code>.</p>' : '') + '</section></div>';
  }
  function render() {
    updateChrome();
    const hash = decodeURIComponent(location.hash.slice(1) || 'home');
    const parts = hash.split('/');
    document.querySelectorAll('.nav-link').forEach(function (link) { link.classList.toggle('active', parts[0] === (link.dataset.route || '')); });
    if (parts[0] === 'doc') detailView(parts[1]); else if (parts[0] === 'documents') listView('Standalone FSDs', 'Functional specification references retained from the original tracker.', 'documents'); else if (parts[0] === 'all') { state.category = parts[1] || state.category; listView(state.category === 'all' ? 'All functions' : state.category, 'Search and filter the function catalogue without leaving the portal.', 'functions'); } else homeView();
  }
  document.addEventListener('keydown', function (event) { if (event.key === '/' && document.activeElement.tagName !== 'INPUT') { event.preventDefault(); const search = document.getElementById('search'); if (search) search.focus(); } });
  window.addEventListener('hashchange', render);
  render();
}());
