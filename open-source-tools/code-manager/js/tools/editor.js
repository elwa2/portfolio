  // ── VERSIONS & DIFF DASHBOARD ──
  const VD_KEY = 'csman_v2_versions_v1';

  function defaultVdStore(){
    return { snippets: [], activeSnippetId: null };
  }

  let vdStore = loadVd();
  let vdActiveSnippetId = vdStore.activeSnippetId || null;

  function loadVd(){
    try {
      const d = JSON.parse(localStorage.getItem(VD_KEY));
      if (d && Array.isArray(d.snippets)) return d;
    } catch (e) {}
    return defaultVdStore();
  }

  function saveVd(){
    vdStore.activeSnippetId = vdActiveSnippetId;
    try { localStorage.setItem(VD_KEY, JSON.stringify(vdStore)); return true; }
    catch (e) { return false; }
  }

  function newVdSnippet(name){
    const id = 'vd_' + Date.now() + Math.random().toString(36).slice(2,5);
    const sn = { id, name: name || ('مربع ' + (vdStore.snippets.length + 1)), versions: [], draft: '' };
    vdStore.snippets.unshift(sn);
    vdActiveSnippetId = id;
    return sn;
  }

  function activeVdSnippet(){
    let sn = vdStore.snippets.find(s => s.id === vdActiveSnippetId);
    if (!sn) {
      if (vdStore.snippets.length) { sn = vdStore.snippets[0]; vdActiveSnippetId = sn.id; }
      else sn = newVdSnippet();
    }
    return sn;
  }

  function vdSelectSnippet(id){
    vdActiveSnippetId = id;
    saveVd();
    renderAll();
  }

  function vdDeleteSnippet(id){
    confirmDeleteSnippet(id || activeVdSnippet().id);
  }

  function confirmDeleteSnippet(id){
    const sn = vdStore.snippets.find(s => s.id === id);
    if (!sn) return;
    if (vdStore.snippets.length <= 1) { showToast('لا يمكن حذف آخر مربع'); return; }
    _deleteSnippetId = id;
    document.getElementById('confirmText').textContent = 'حذف مربع "' + sn.name + '" وكل نسخه؟';
    document.getElementById('confirmOverlay').classList.add('open');
  }

  function doDeleteSnippet(id){
    vdStore.snippets = vdStore.snippets.filter(s => s.id !== id);
    if (vdActiveSnippetId === id) vdActiveSnippetId = vdStore.snippets[0].id;
    saveVd();
    renderAll();
    showToast('تم حذف المربع');
  }

  function inlineRenameSnippet(){
    const el = document.querySelector('.vd-tab.active .vd-tab-name');
    const sn = activeVdSnippet();
    if (!el || !sn) return;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = sn.name;
    input.className = 'vd-tab-input';
    input.setAttribute('aria-label', 'اسم المربع');
    el.replaceWith(input);
    input.focus();
    input.select();
    let done = false;
    const commit = () => {
      if (done) return; done = true;
      const v = input.value.trim();
      if (v) { sn.name = v; saveVd(); }
      renderAll();
    };
    const cancel = () => {
      if (done) return; done = true;
      renderAll();
    };
    input.addEventListener('click', e => e.stopPropagation());
    input.addEventListener('keydown', e => {
      e.stopPropagation();
      if (e.key === 'Enter') commit();
      else if (e.key === 'Escape') cancel();
    });
    input.addEventListener('blur', commit);
  }

  function renameSnippetOnClick(id){
    vdActiveSnippetId = id;
    saveVd();
    renderAll();
    inlineRenameSnippet();
  }

  function vdRestore(id){
    const sn = activeVdSnippet();
    const v = sn.versions.find(x => x.id === id);
    if (!v) return;
    sn.draft = v.content;
    saveVd();
    renderAll();
    showToast('تم استرجاع V' + v.n + ' في المحرر');
  }

  function vdDelete(id){
    const sn = activeVdSnippet();
    sn.versions = sn.versions.filter(x => x.id !== id);
    if (sn.baseId === id) sn.baseId = null;
    sn.versions.forEach((x, i) => x.n = i + 1);
    saveVd();
    renderAll();
    showToast('تم حذف النسخة');
  }

  function vdCopy(id){
    const sn = activeVdSnippet();
    const v = sn.versions.find(x => x.id === id);
    if (!v) return;
    navigator.clipboard.writeText(v.content).then(() => showToast('تم نسخ V' + v.n + '!')).catch(() => showToast('تعذّر النسخ'));
  }

  function fillVdCompareSelects(sn){
    const oldSel = document.getElementById('vdOldSel');
    const newSel = document.getElementById('vdNewSel');
    if (!oldSel || !newSel) return;
    const opts = sn.versions.map(v => {
      const t = new Date(v.time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      return `<option value="${v.id}">V${v.n} · ${t}</option>`;
    }).join('');
    oldSel.innerHTML = opts;
    newSel.innerHTML = opts + `<option value="__editor__">المحرر (الحالي)</option>`;
    if (sn.versions.length >= 2) {
      oldSel.value = sn.versions[sn.versions.length - 2].id;
      newSel.value = sn.versions[sn.versions.length - 1].id;
    } else if (sn.versions.length === 1) {
      newSel.value = sn.versions[0].id;
    }
  }

  function vdToggleCustomCompare(){
    const wrap = document.getElementById('vdCustomCompare');
    const btn = document.getElementById('vdCustomToggleBtn');
    if (!wrap || !btn) return;
    const open = wrap.style.display === 'none';
    wrap.style.display = open ? 'block' : 'none';
    btn.innerHTML = open
      ? '<i class="ti ti-arrows-left-right"></i> إخفاء المخصصة'
      : '<i class="ti ti-arrows-left-right"></i> مقارنة مخصصة';
    if (open) fillVdCompareSelects(activeVdSnippet());
  }

  function vdRunCompare(){
    const sn = activeVdSnippet();
    const aId = document.getElementById('vdOldSel').value;
    const bId = document.getElementById('vdNewSel').value;
    if (!aId || !bId) { showToast('اختر نسختين'); return; }
    const a = sn.versions.find(v => v.id === aId);
    if (!a) return;
    if (bId === '__editor__') {
      const ed = document.getElementById('edInput');
      const current = ed ? ed.value : (sn.draft || '');
      if (!current.trim()) { showToast('المربع فارغ'); return; }
      document.getElementById('vdCustomOut').innerHTML = vdDiffHTML(a.content, current, 'V' + a.n + ' (قاعدة)', 'المحرر (الحالي)');
      return;
    }
    const b = sn.versions.find(v => v.id === bId);
    if (!b) return;
    document.getElementById('vdCustomOut').innerHTML = vdDiffHTML(a.content, b.content, 'V' + a.n + ' (قبل)', 'V' + b.n + ' (بعد)');
  }

  function vdSetBase(id){
    const sn = activeVdSnippet();
    const latest = sn.versions[sn.versions.length - 1];
    if (latest && id === latest.id) { showToast('اختر قاعدة أقدم من الأحدث'); renderAll(); return; }
    sn.baseId = id;
    saveVd();
    renderAll();
    showToast('تم تحديد القاعدة للمقارنة');
  }

  function resolveVdBase(sn){
    const latest = sn.versions[sn.versions.length - 1];
    let base = null;
    if (sn.baseId) base = sn.versions.find(v => v.id === sn.baseId) || null;
    if (!base && sn.versions.length >= 2) base = sn.versions[sn.versions.length - 2];
    if (base && latest && base.id === latest.id && sn.versions.length >= 2) base = sn.versions[sn.versions.length - 2];
    return base;
  }

  function vdOpen(id){
    const sn = activeVdSnippet();
    const v = sn.versions.find(x => x.id === id);
    if (!v) return;
    const url = URL.createObjectURL(new Blob([v.content], { type: 'text/plain;charset=utf-8' }));
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  function vdDownload(id){
    const sn = activeVdSnippet();
    const v = sn.versions.find(x => x.id === id);
    if (!v) return;
    const url = URL.createObjectURL(new Blob([v.content], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = (sn.name || 'snippet').replace(/[\\/:*?"<>|]/g, '_') + '-V' + v.n + '.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('تم تحميل V' + v.n);
  }

  function vdLineDiff(aLines, bLines){
    const n = aLines.length, m = bLines.length;
    if (n * m <= 4000000) {
      const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
      for (let i = n - 1; i >= 0; i--) {
        for (let j = m - 1; j >= 0; j--) {
          if (aLines[i] === bLines[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
          else dp[i][j] = dp[i + 1][j] > dp[i][j + 1] ? dp[i + 1][j] : dp[i][j + 1];
        }
      }
      const ops = []; let i = 0, j = 0;
      while (i < n && j < m) {
        if (aLines[i] === bLines[j]) { ops.push([0, i, j]); i++; j++; }
        else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push([-1, i, -1]); i++; }
        else { ops.push([1, -1, j]); j++; }
      }
      while (i < n) { ops.push([-1, i, -1]); i++; }
      while (j < m) { ops.push([1, -1, j]); j++; }
      return ops;
    }
    let start = 0;
    while (start < n && start < m && aLines[start] === bLines[start]) start++;
    let endA = n, endB = m;
    while (endA > start && endB > start && aLines[endA - 1] === bLines[endB - 1]) { endA--; endB--; }
    const ops = [];
    for (let i = 0; i < start; i++) ops.push([0, i, i]);
    for (let i = start; i < endA; i++) ops.push([-1, i, -1]);
    for (let j = start; j < endB; j++) ops.push([1, -1, j]);
    for (let i = endA; i < n; i++) ops.push([0, i, i]);
    return ops;
  }

  function vdDiffHTML(a, b, aName, bName){
    const aLines = a.split('\n');
    const bLines = b.split('\n');
    const ops = vdLineDiff(aLines, bLines);

    const rows = [];
    const changeSet = [];
    for (let i = 0; i < ops.length; i++) if (ops[i][0] !== 0) changeSet.push(i);

    if (!changeSet.length) {
      rows.push({ t: 'fold', text: 'لا تغيير بين النسختين — الأكواد متطابقة' });
    } else {
      const CONTEXT = 2;
      const showIdx = new Set(changeSet);
      changeSet.forEach(idx => {
        for (let k = 1; k <= CONTEXT; k++) {
          if (idx - k >= 0 && ops[idx - k][0] === 0) showIdx.add(idx - k);
          if (idx + k < ops.length && ops[idx + k][0] === 0) showIdx.add(idx + k);
        }
      });
      const sorted = Array.from(showIdx).sort((x, y) => x - y);
      let prevShown = -1;
      sorted.forEach(idx => {
        if (prevShown !== -1 && idx > prevShown + 1) {
          let count = 0;
          for (let k = prevShown + 1; k < idx; k++) if (ops[k][0] === 0) count++;
          if (count > 0) rows.push({ t: 'fold', text: count + ' سطر متطابق مخفي' });
        }
        const op = ops[idx];
        if (op[0] === 0) rows.push({ t: 'eq', text: aLines[op[1]] });
        else if (op[0] === -1) rows.push({ t: 'del', text: aLines[op[1]] });
        else rows.push({ t: 'add', text: bLines[op[2]] });
        prevShown = idx;
      });
    }

    let added = 0, removed = 0, same = 0;
    ops.forEach(op => { if (op[0] === 1) added++; else if (op[0] === -1) removed++; else same++; });

    const rowsHtml = rows.map(r => {
      if (r.t === 'fold') return `<div class="vd-fold">${escHtml(r.text)}</div>`;
      if (r.t === 'del') return `<div class="vd-dl vd-dl-del"><span class="vd-dl-mark">−</span><span class="vd-dl-code">${escHtml(r.text) || ' '}</span></div>`;
      if (r.t === 'add') return `<div class="vd-dl vd-dl-add"><span class="vd-dl-mark">+</span><span class="vd-dl-code">${escHtml(r.text) || ' '}</span></div>`;
      return `<div class="vd-dl vd-dl-ctx"><span class="vd-dl-mark"> </span><span class="vd-dl-code">${escHtml(r.text) || ' '}</span></div>`;
    }).join('');

    const statHtml = `<div class="vd-summary">
      <span class="vd-stat added">+ ${added} مضافة</span>
      <span class="vd-stat removed">− ${removed} محذوفة</span>
      <span class="vd-stat same">${same} متطابقة</span>
    </div>`;

    return statHtml + `<div class="vd-diff">
      <div class="vd-diff-head">
        <span class="vd-file-old">— ${escHtml(aName)}</span>
        <span class="vd-file-new">+ ${escHtml(bName)}</span>
      </div>
      <div class="vd-diff-body">${rowsHtml}</div>
    </div>`;
  }

  // ── EDITOR DASHBOARD (VS Code-like) ──
  function toggleEdDash(){
    showEdDash = !showEdDash;
    document.getElementById('edDashBtn').classList.toggle('ed-active', showEdDash);
    if(showEdDash){
      document.querySelectorAll('.filter-tag:not(#edDashBtn)').forEach(b => b.classList.remove('active'));
      showCssDash = false;
      document.getElementById('cssDashBtn').classList.remove('css-active');
      showHomeDash = false;
      document.getElementById('homeBtn').classList.remove('home-active');
      showScrollbarDash = false; showDevDash = false; showB64Dash = false; showQrDash = false; showFavDash = false; showCpDash = false; showRtDash = false;

      document.getElementById('sbDashBtn').classList.remove('scrollbar-active');


      document.getElementById('devDashBtn').classList.remove('dev-active');
      document.getElementById('b64DashBtn').classList.remove('b64-active');
      document.getElementById('qrDashBtn').classList.remove('qr-active');
      const __favEd = document.getElementById('favDashBtn');
      if(__favEd) __favEd.classList.remove('fav-active');
      document.getElementById('cpDashBtn').classList.remove('cp-active');
      document.getElementById('rtDashBtn').classList.remove('rt-active');
    }
    renderAll();
  }

  // تبويب المحرر الداخلي (تحرير | مقارنة) — النسخ اندمجت داخل المحرر
  let edSub = 'edit';
  function edSetSub(v){
    edSub = (v === 'compare') ? 'compare' : 'edit';
    renderAll();
  }
  function goToVd(){
    showEdDash = true;
    edSub = 'compare';
    renderAll();
  }

  function edSelectSnippet(id){
    vdActiveSnippetId = id;
    saveVd();
    renderEdDash();
  }

  function edAddSnippet(){
    newVdSnippet();
    saveVd();
    renderAll();
    inlineRenameSnippet();
  }

  function edSync(){
    const input = document.getElementById('edInput');
    const pre = document.getElementById('edHigh');
    const gut = document.getElementById('edGutter');
    if (!input || !pre || !gut) return;
    pre.innerHTML = (syntaxHL(input.value) || '') + '\n';
    const lines = input.value.split('\n').length;
    const nums = [];
    for (let i = 1; i <= lines; i++) nums.push(i);
    gut.textContent = nums.join('\n');
    gut.style.minWidth = (String(lines).length * 9 + 22) + 'px';
    pre.scrollTop = input.scrollTop;
    pre.scrollLeft = input.scrollLeft;
    gut.scrollTop = input.scrollTop;
    edBuildColors();
  }

  function edStatus(){
    const input = document.getElementById('edInput');
    if (!input) return;
    const pos = document.getElementById('edPos');
    const count = document.getElementById('edCount');
    const before = input.value.slice(0, input.selectionStart);
    const line = before.split('\n').length;
    const col = before.length - before.lastIndexOf('\n');
    if (pos) pos.textContent = 'السطر ' + line + ' · العمود ' + col;
    if (count) count.textContent = input.value.length + ' حرف';
  }

  /* ===== EDITOR — FIND & REPLACE (Ctrl+F) ===== */
  let edFindMatches = [];
  let edFindIndex = -1;
  let edFindQuery = '';
  let edFindBound = false;

  function edInitFindBox(){
    const box = document.getElementById('edFindBox');
    if (!box || edFindBound) return;
    edFindBound = true;
    const fi = document.getElementById('edFindInput');
    const ri = document.getElementById('edReplaceInput');
    if (fi){
      fi.addEventListener('input', () => edPerformFind());
      fi.addEventListener('keydown', e => {
        if (e.key === 'Enter'){ e.preventDefault(); e.shiftKey ? edFindPrevious() : edFindNext(); }
        else if (e.key === 'Escape'){ e.preventDefault(); edCloseFindBox(); }
      });
    }
    if (ri){
      ri.addEventListener('input', edUpdateReplaceBtns);
      ri.addEventListener('keydown', e => {
        if (e.key === 'Enter'){ e.preventDefault(); e.ctrlKey || e.altKey ? edReplaceAll() : edReplaceSingle(); }
        else if (e.key === 'Escape'){ e.preventDefault(); edCloseFindBox(); }
      });
    }
  }

  function edSyncFindToggles(){
    document.querySelectorAll('.ed-find-box .ed-find-toggle').forEach(l => {
      const cb = l.querySelector('input');
      if (cb) l.classList.toggle('active', !!cb.checked);
    });
  }

  function edFindRegex(){
    const fi = document.getElementById('edFindInput');
    if (!fi) return { re: null, bad: false, q: '' };
    const q = fi.value;
    if (!q) return { re: null, bad: false, q: q };
    const opt = id => { const el = document.getElementById(id); return !!(el && el.checked); };
    let src = opt('edFindRegex') ? q : q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (opt('edFindWord')) src = '(?<![\\p{L}\\p{N}_])(?:' + src + ')(?![\\p{L}\\p{N}_])';
    try { return { re: new RegExp(src, opt('edFindCase') ? 'gu' : 'giu'), bad: false, q: q }; }
    catch (e) { return { re: null, bad: true, q: q }; }
  }

  function edCollectMatches(re){
    const input = document.getElementById('edInput');
    const out = [];
    if (!input || !re) return out;
    const text = input.value;
    let m, guard = 0;
    re.lastIndex = 0;
    while ((m = re.exec(text)) !== null){
      if (m[0].length === 0){ re.lastIndex++; continue; }
      out.push({ start: m.index, end: m.index + m[0].length });
      if (++guard >= 20000) break;
    }
    return out;
  }

  function edSetFindBtns(on){
    ['edFindPrev','edFindNext','edReplaceSingle','edReplaceAll'].forEach(id => {
      const b = document.getElementById(id);
      if (b) b.disabled = !on;
    });
  }
  function edUpdateReplaceBtns(){
    const b = document.getElementById('edReplaceAll');
    if (b) b.disabled = !edFindMatches.length;
  }

  function edRenderFindLayer(){
    const input = document.getElementById('edInput');
    const layer = document.getElementById('edFindLayer');
    if (!input || !layer) return;
    if (!edFindMatches.length){ if (layer.innerHTML) layer.innerHTML = ''; return; }
    const v = input.value;
    const LIMIT = 3000;
    const n = Math.min(edFindMatches.length, LIMIT);
    let html = '', last = 0;
    for (let i = 0; i < n; i++){
      const m = edFindMatches[i];
      if (m.start < last) continue;
      html += escHtml(v.slice(last, m.start));
      html += '<mark' + (i === edFindIndex ? ' class="cur"' : '') + '>' + escHtml(v.slice(m.start, m.end)) + '</mark>';
      last = m.end;
    }
    html += escHtml(v.slice(last)) + '\n';
    layer.innerHTML = html;
    layer.scrollTop = input.scrollTop;
    layer.scrollLeft = input.scrollLeft;
  }

  function edScrollToIndex(idx){
    const input = document.getElementById('edInput');
    if (!input) return;
    const pre  = document.getElementById('edHigh');
    const gut  = document.getElementById('edGutter');
    const fl   = document.getElementById('edFindLayer');
    const cs   = getComputedStyle(input);
    const lh   = parseFloat(cs.lineHeight) || 20;
    const padT = parseFloat(cs.paddingTop) || 0;
    const target = padT + (input.value.slice(0, idx).match(/\n/g) || []).length * lh;
    const view = input.clientHeight || 400;
    if (target < input.scrollTop + lh || target > input.scrollTop + view - lh * 2){
      input.scrollTop = Math.max(0, target - view / 3);
    }
    if (pre) pre.scrollTop = input.scrollTop;
    if (gut) gut.scrollTop = input.scrollTop;
    if (fl){ fl.scrollTop = input.scrollTop; fl.scrollLeft = input.scrollLeft; }
    if (typeof edPlaceColors === 'function') edPlaceColors();
  }

  function edSelectFind(i){
    const input = document.getElementById('edInput');
    const m = edFindMatches[i];
    if (!input || !m) return;
    edFindIndex = i;
    try { input.setSelectionRange(m.start, m.end); } catch (e) {}
    edRenderFindLayer();
    edScrollToIndex(m.start);
    edStatus();
    const stats = document.getElementById('edFindStats');
    if (stats) stats.textContent = (i + 1) + ' / ' + edFindMatches.length;
  }

  function edPerformFind(preferAt){
    const input = document.getElementById('edInput');
    const stats = document.getElementById('edFindStats');
    if (!input) return;
    edSyncFindToggles();
    const r = edFindRegex();
    edFindQuery = r.q;
    if (r.bad){
      edFindMatches = []; edFindIndex = -1;
      if (stats) stats.textContent = 'تعبير نمطي غير صالح';
      edSetFindBtns(false);
      edRenderFindLayer();
      return;
    }
    if (!r.re){
      edFindMatches = []; edFindIndex = -1;
      if (stats) stats.textContent = 'اكتب نص للبحث';
      edSetFindBtns(false);
      edRenderFindLayer();
      return;
    }
    edFindMatches = edCollectMatches(r.re);
    if (!edFindMatches.length){
      edFindIndex = -1;
      if (stats) stats.textContent = 'لا نتائج';
      edSetFindBtns(false);
      edRenderFindLayer();
      return;
    }
    const from = (typeof preferAt === 'number') ? preferAt : (input.selectionEnd || 0);
    let idx = edFindMatches.findIndex(m => m.start >= from);
    if (idx < 0) idx = 0;
    edSetFindBtns(true);
    edSelectFind(idx);
  }

  function edFindNext(){
    if (!edFindMatches.length){ edPerformFind(); return; }
    edSelectFind((edFindIndex + 1) % edFindMatches.length);
  }
  function edFindPrevious(){
    if (!edFindMatches.length){ edPerformFind(); return; }
    edSelectFind((edFindIndex - 1 + edFindMatches.length) % edFindMatches.length);
  }

  function edSetEditorValue(text){
    const input = document.getElementById('edInput');
    if (!input) return;
    input.value = text;
    const sn = activeVdSnippet();
    sn.draft = text;
    saveVd();
    edSync();
    edStatus();
  }

  function edReplaceSingle(){
    const input = document.getElementById('edInput');
    const ri = document.getElementById('edReplaceInput');
    if (!input || !ri) return;
    if (!edFindMatches.length){ edPerformFind(); return; }
    const m = edFindMatches[edFindIndex];
    if (!m) return;
    const rep = ri.value;
    const at = m.start;
    edSetEditorValue(input.value.slice(0, at) + rep + input.value.slice(m.end));
    edPerformFind(at + rep.length);
    const total = edFindMatches.length;
    showToast(total ? 'تم استبدال واحد · باقي ' + total : 'تم استبدال واحد · لا نتائج أخرى');
  }

  function edReplaceAll(){
    const input = document.getElementById('edInput');
    const ri = document.getElementById('edReplaceInput');
    if (!input || !ri) return;
    const r = edFindRegex();
    if (r.bad){ showToast('تعبير نمطي غير صالح'); return; }
    if (!r.re){ showToast('اكتب نص للبحث أولاً'); return; }
    if (!edFindMatches.length){ edPerformFind(); return; }
    const count = edFindMatches.length;
    const rep = ri.value;
    edSetEditorValue(input.value.replace(r.re, () => rep));
    edPerformFind();
    showToast('تم استبدال ' + count + ' نتيجة');
  }

  function edOpenFindBox(){
    const input = document.getElementById('edInput');
    const box = document.getElementById('edFindBox');
    if (!input || !box) return;
    edInitFindBox();
    const fi = document.getElementById('edFindInput');
    const sel = input.value.slice(input.selectionStart, input.selectionEnd);
    if (sel && sel.length < 200 && sel.indexOf('\n') === -1) fi.value = sel;
    else if (edFindQuery) fi.value = edFindQuery;
    box.style.display = 'block';
    const fb = document.getElementById('edFindBtn');
    if (fb) fb.classList.add('active');
    edSyncFindToggles();
    edPerformFind();
    fi.focus();
    if (fi.value) fi.select();
  }

  function edCloseFindBox(){
    const box = document.getElementById('edFindBox');
    if (box) box.style.display = 'none';
    const fb = document.getElementById('edFindBtn');
    if (fb) fb.classList.remove('active');
    edFindMatches = []; edFindIndex = -1;
    edRenderFindLayer();
    const input = document.getElementById('edInput');
    if (input) input.focus();
  }

  document.addEventListener('keydown', e => {
    const mod = e.ctrlKey || e.metaKey;
    const k = (e.key || '').toLowerCase();
    if (mod && k === 'f' && !e.altKey){
      const box = document.getElementById('edFindBox');
      if (!document.getElementById('edInput') || !document.body.classList.contains('editor-active')) return;
      e.preventDefault();
      if (box && box.style.display !== 'none') edCloseFindBox();
      else edOpenFindBox();
      return;
    }
    if (e.key === 'Escape'){
      const box = document.getElementById('edFindBox');
      if (box && box.style.display !== 'none') edCloseFindBox();
    }
  });

  function edSaveVersion(opts){
    const silent = !!(opts && opts.silent);
    const sn = activeVdSnippet();
    const input = document.getElementById('edInput');
    const content = input ? input.value : (sn.draft || '');
    if (!content.trim()) { if (!silent) showToast('المحرر فارغ — اكتب أو الصق كود أولاً'); return false; }
    const last = sn.versions[sn.versions.length - 1];
    if (last && last.content === content) {
      if (silent) showToast('تم اللصق — لا تغيير عن آخر نسخة');
      else showToast('لا تغيير عن النسخة الأخيرة');
      return false;
    }
    const had = sn.versions.length;
    const v = { id: 'vv_' + Date.now() + Math.random().toString(36).slice(2,5), n: had + 1, time: Date.now(), content };
    sn.versions.push(v);
    sn.draft = content;
    const prevId = had ? sn.versions[had - 1].id : null;
    const wasDefaultBase = had >= 2 && sn.baseId === sn.versions[had - 2].id;
    if (sn.baseId == null || wasDefaultBase) sn.baseId = prevId;
    if (!saveVd()) { sn.versions.pop(); showToast('مساحة التخزين ممتلئة'); return false; }
    const totalVersions = vdStore.snippets.reduce((a, s) => a + s.versions.length, 0);
    document.getElementById('countBadge').textContent = totalVersions + ' نسخة · محرر';
    const tabNum = document.querySelector('.vd-tab.active .vd-tab-num');
    if (tabNum) tabNum.textContent = sn.versions.length;
    showToast('تم حفظ نسخة V' + v.n + (silent ? ' تلقائيًا' : ''));
    return true;
  }

  function edCopyAll(){
    const sn = activeVdSnippet();
    navigator.clipboard.writeText(sn.draft || '').then(() => showToast('تم نسخ الكود!')).catch(() => showToast('تعذّر النسخ'));
  }

  function edDownload(){
    const sn = activeVdSnippet();
    const content = sn.draft || '';
    if (!content.trim()) { showToast('المحرر فارغ'); return; }
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = (sn.name || 'snippet').replace(/[\\/:*?"<>|]/g, '_') + '.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('تم التحميل');
  }

  // ── Editor view controls (align / direction / font size) ──
  const ED_VIEW_KEY = 'csman_v2_ed_view_v1';
  let edView = loadEdView();
  function loadEdView(){
    try {
      const d = JSON.parse(localStorage.getItem(ED_VIEW_KEY) || '{}');
      return { align: d.align || 'left', dir: d.dir || 'ltr', size: (typeof d.size === 'number' && d.size >= 8 && d.size <= 26) ? d.size : 12.5 };
    } catch (e) { return { align: 'left', dir: 'ltr', size: 12.5 }; }
  }
  function saveEdView(){
    try { localStorage.setItem(ED_VIEW_KEY, JSON.stringify(edView)); } catch (e) {}
  }
  function edApplyView(){
    const input = document.getElementById('edInput');
    const pre   = document.getElementById('edHigh');
    const gut   = document.getElementById('edGutter');
    const flay  = document.getElementById('edFindLayer');
    if (input){
      input.style.textAlign = edView.align;
      input.style.direction = edView.dir;
      input.style.fontSize  = edView.size + 'px';
      if (pre){
        pre.style.textAlign = edView.align;
        pre.style.direction = edView.dir;
        pre.style.fontSize  = edView.size + 'px';
      }
      if (flay){
        flay.style.textAlign = edView.align;
        flay.style.direction = edView.dir;
        flay.style.fontSize  = edView.size + 'px';
      }
      if (gut) gut.style.fontSize = edView.size + 'px';
    }
    document.querySelectorAll('.ed-toolbar [data-align]').forEach(b => b.classList.toggle('active', b.dataset.align === edView.align));
    document.querySelectorAll('.ed-toolbar [data-dir]').forEach(b => b.classList.toggle('active', b.dataset.dir === edView.dir));
    const sz = document.getElementById('edFontVal');
    if (sz) sz.textContent = edView.size + 'px';
    edSync();
  }
  function edSetAlign(v){ edView.align = v; saveEdView(); edApplyView(); const i = document.getElementById('edInput'); if (i) i.focus(); }
  function edSetDir(v){ edView.dir = v; saveEdView(); edApplyView(); }
  function edFontSize(step){
    const n = edView.size + step;
    if (n < 8 || n > 26) return;
    edView.size = n; saveEdView(); edApplyView();
  }
  function edFontReset(){ edView.size = 12.5; saveEdView(); edApplyView(); }

  /* ══════════ ALARM — المنبه (تبويب داخل المحرر) ══════════ */
  const AL_KEY = 'csman_v2_alarm_v1';
  const AL_MIN = 60000;
  const AL_RING_GAP = 1700;
  const AL_R = 96;
  const AL_CIRC = 2 * Math.PI * AL_R;
  const AL_DAYS = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const AL_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const AL_HIJRI = ['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
  const AL_CUSTOM_ID = 'custom';

  /* كل نغمة = [نوع الموجة, تردد البداية, تردد النهاية, تأخير ث, طول ث, قوة] */
  const AL_SOUNDS = [
    { id:'bell',    name:'جرس',        eq:[16,10,6,14,8,4],  notes:[['sine',880,880,0,0.9,1],['sine',1318,1318,0,0.75,0.6],['sine',1760,1760,0.02,0.5,0.34]] },
    { id:'siren',   name:'صفارة',      eq:[4,9,16,9,4],      notes:[['sawtooth',480,1250,0,0.85,0.8]] },
    { id:'chime',   name:'رنّة',        eq:[6,12,16,12,6],    notes:[['sine',523,523,0,0.5,0.9],['sine',659,659,0.18,0.5,0.9],['sine',784,784,0.36,0.72,0.9]] },
    { id:'beep',    name:'صافرة',      eq:[16,3,3,16,3,3],   notes:[['square',1046,1046,0,0.11,0.55],['square',1046,1046,0.2,0.11,0.55],['square',1046,1046,0.4,0.11,0.55]] },
    { id:'pulse',   name:'نبضات',      eq:[14,5,14,5,14,5],  notes:[['square',180,150,0,0.13,0.9],['square',180,150,0.17,0.13,0.9],['square',180,150,0.34,0.13,0.9],['square',180,150,0.51,0.13,0.9]] },
    { id:'digital', name:'ساعة رقمية', eq:[12,6,12,6,12],    notes:[['square',880,880,0,0.08,0.5],['square',1174,1174,0.1,0.08,0.5],['square',880,880,0.2,0.08,0.5],['square',1174,1174,0.3,0.08,0.5]] },
    { id:'wave',    name:'موجة',       eq:[4,10,16,10,4],    notes:[['triangle',380,900,0,0.6,0.7],['triangle',900,380,0.6,0.6,0.7]] }
  ];
  const AL_MIX_ID = 'mix';
  const AL_PRESETS = [
    { m:1,  label:'دقيقة' }, { m:3, label:'3 دقائق' }, { m:5, label:'5 دقائق' },
    { m:10, label:'10 دقائق' }, { m:15, label:'15 دقيقة' }, { m:30, label:'30 دقيقة' },
    { m:60, label:'ساعة' }
  ];
  const AL_RING_FOR = [
    { m:1, label:'1 د' }, { m:3, label:'3 د' }, { m:5, label:'5 د' },
    { m:10, label:'10 د' }, { m:15, label:'15 د' }, { m:30, label:'30 د' }
  ];
  const AL_REST_FOR = [
    { s:15, label:'15 ث' }, { s:30, label:'30 ث' }, { s:60, label:'دقيقة' },
    { s:120, label:'دقيقتين' }, { s:300, label:'5 د' }
  ];
  /* مقدار التذكير قبل الصلاة (بالدقائق) */
  const AL_LEAD = [
    { m:0,  label:'عند الصلاة' }, { m:5,  label:'قبلها 5 د' },
    { m:10, label:'قبلها 10 د' }, { m:15, label:'قبلها 15 د' },
    { m:20, label:'قبلها 20 د' }, { m:30, label:'قبلها 30 د' },
    { m:45, label:'قبلها 45 د' }, { m:60, label:'قبلها ساعة' },
    { m:90, label:'قبلها ساعة ونص' }, { m:120, label:'قبلها ساعتين' }
  ];
  /* جدول المنبهات: ترتيب العرض المعتاد (السبت أولًا)، i = Date.getDay() */
  const AL_WDAYS = [
    { i:6, s:'س' }, { i:0, s:'ح' }, { i:1, s:'ن' }, { i:2, s:'ث' },
    { i:3, s:'ر' }, { i:4, s:'خ' }, { i:5, s:'ج' }
  ];
  const AL_DAY_ALL = [0,1,2,3,4,5,6];
  const AL_DAY_WKD = [6,0,1,2,3];        /* السبت → الخميس */
  const AL_MAX_SCHED = 12;

  /* ── المواقيت: حساب شمسي محلي (مفيش إنترنت) ── */
  const AL_PRAYERS = [
    { id:'fajr',    name:'الفجر',   ico:'ti-moon' },
    { id:'sunrise', name:'الشروق',  ico:'ti-sunrise' },
    { id:'dhuhr',   name:'الظهر',   ico:'ti-sun' },
    { id:'asr',     name:'العصر',   ico:'ti-cloud' },
    { id:'maghrib', name:'المغرب',  ico:'ti-sunset' },
    { id:'isha',    name:'العشاء',  ico:'ti-moon-stars' },
    { id:'jumua',   name:'الجمعة',  ico:'ti-users' }
  ];
  /* tz = فرق توقيت المدينة عن UTC بالساعات (الوقت الرسمي بدون التوقيت الصيفي) */
  const AL_CITIES = [
    { n:'القاهرة',     lat:30.0444, lng:31.2357, tz:2 },
    { n:'الجيزة',      lat:30.0131, lng:31.2089, tz:2 },
    { n:'الإسكندرية',  lat:31.2001, lng:29.9187, tz:2 },
    { n:'المنصورة',    lat:31.0409, lng:31.3789, tz:2 },
    { n:'طنطا',        lat:30.7865, lng:31.0004, tz:2 },
    { n:'أسيوط',       lat:27.1801, lng:31.1837, tz:2 },
    { n:'بورسعيد',     lat:31.2653, lng:32.3019, tz:2 },
    { n:'السويس',      lat:29.9668, lng:32.5498, tz:2 },
    { n:'الأقصر',      lat:25.6872, lng:32.6396, tz:2 },
    { n:'أسوان',       lat:24.0889, lng:32.8998, tz:2 },
    { n:'الرياض',      lat:24.7136, lng:46.6753, tz:3 },
    { n:'دبي',         lat:25.2048, lng:55.2708, tz:4 },
    { n:'تونس',        lat:36.8065, lng:10.1815, tz:1 },
    { n:'الجزائر',     lat:36.7538, lng:3.0588, tz:1 },
    { n:'الرباط',      lat:34.0209, lng:6.8416, tz:1 },
    { n:'عمّان',       lat:31.9454, lng:35.9284, tz:3 },
    { n:'بغداد',       lat:33.3152, lng:44.3661, tz:3 },
    { n:'إسطنبول',     lat:41.0082, lng:28.9784, tz:3 },
    { n:'لندن',        lat:51.5074, lng:-0.1278, tz:0 },
    { n:'باريس',       lat:48.8566, lng:2.3522, tz:1 },
    { n:'نيويورك',     lat:40.7128, lng:-74.0060, tz:-5 }
  ];

  let alCtx = null, alTickTimer = null, alRingTimer = null, alRingStep = 0;
  let alTitleOn = false, alTitleWas = '';
  let alOverlayBuilt = false;
  let alAudioEl = null, alCustomPlay = false;
  let alFileInput = null;
  let showAlDash = false;
  let alStore = loadAl();
  let alNoToast = false;

  function defaultAl(){
    return { armed:false, ringing:false, dueAt:0, dur:5*AL_MIN, mode:'dur',
             sound:AL_MIX_ID, vol:0.7, repeat:true, label:'', h:0, m:5, s:0, hms:'0:5:0',
             ringFor:5*AL_MIN, restFor:1*AL_MIN, phase:'ring', phaseEndsAt:0,
             th:5, tm:0, tap:'ص', daily:false, prayer:'', lead:0, sched:[],
             city:'القاهرة', lat:30.0444, lng:31.2357, tz:-new Date().getTimezoneOffset() / 60, allAdj:0,
             fajrAng:19.5, ishaAng:18, ishaMin:0, asr:1, asrAdj:0,
             custom:null };
  }
  function alNum(v, def, lo, hi){
    const n = typeof v === 'number' ? v : parseFloat(v);
    if (!isFinite(n)) return def;
    return Math.max(lo, Math.min(hi, n));
  }
  function loadAl(){
    try {
      const d = JSON.parse(localStorage.getItem(AL_KEY) || 'null');
      if (d && typeof d === 'object'){
        const a = Object.assign(defaultAl(), d);
        a.vol = alNum(a.vol, 0.7, 0, 1);
        a.dur = alNum(a.dur, 5*AL_MIN, 1000, 24*60*AL_MIN);
        a.ringFor = alNum(a.ringFor, 5*AL_MIN, 5000, 6*60*AL_MIN);
        a.restFor = alNum(a.restFor, AL_MIN, 5000, 60*AL_MIN);
        a.h = alNum(a.h, 0, 0, 23); a.m = alNum(a.m, 5, 0, 59); a.s = alNum(a.s, 0, 0, 59);
        a.th = Math.round(alNum(a.th, 5, 1, 12));
        a.tm = Math.round(alNum(a.tm, 0, 0, 59));
        a.tap = a.tap === 'م' ? 'م' : 'ص';
        a.lat = alNum(a.lat, 30.0444, -66, 66);
        a.lng = alNum(a.lng, 31.2357, -180, 180);
        a.tz = alNum(a.tz, -new Date().getTimezoneOffset() / 60, -12, 14);
        a.allAdj = alNum(a.allAdj, 0, -90, 90);
        a.fajrAng = alNum(a.fajrAng, 19.5, 10, 22);
        a.ishaAng = alNum(a.ishaAng, 18, 10, 22);
        a.ishaMin = alNum(a.ishaMin, 0, 0, 120);
        a.asrAdj = alNum(a.asrAdj, 0, -90, 90);
        a.lead = Math.round(alNum(a.lead, 0, 0, 24*60));
        a.asr = a.asr === 2 ? 2 : 1;
        a.sched = alSchedNorm(a.sched);
        a.mode = (a.mode === 'time' || a.mode === 'prayer' || a.mode === 'sched') ? a.mode : 'dur';
        a.phase = a.phase === 'rest' ? 'rest' : 'ring';
        a.daily = !!a.daily;
        if (a.sound === AL_CUSTOM_ID && (!a.custom || !a.custom.data)) a.sound = AL_MIX_ID;
        else if (a.sound !== AL_MIX_ID && a.sound !== AL_CUSTOM_ID && !AL_SOUNDS.some(x => x.id === a.sound)) a.sound = AL_MIX_ID;
        if (a.custom && typeof a.custom.data !== 'string') a.custom = null;
        return a;
      }
    } catch (e) {}
    return defaultAl();
  }
  function saveAl(){ try { localStorage.setItem(AL_KEY, JSON.stringify(alStore)); } catch (e) {} }

  /* ── تنسيق 12 ساعة (ص/م) ── */
  function alTwo(n){ return (n < 10 ? '0' : '') + n; }
  function alAp(h24){ return h24 < 12 ? 'ص' : 'م'; }
  function alH12(h24){ const h = h24 % 12; return h === 0 ? 12 : h; }
  function alFmt12Num(d, withSec){
    const h = d.getHours();
    return alH12(h) + ':' + alTwo(d.getMinutes()) + (withSec ? ':' + alTwo(d.getSeconds()) : '') + ' ' + alAp(h);
  }
  function alTo24(th, tm, tap){
    let h = Math.round(alNum(th, 12, 1, 12)) % 12;
    const m = Math.round(alNum(tm, 0, 0, 59));
    if (tap === 'م') h += 12;
    return { h:h, m:m };
  }
  function alFmtDur(ms){
    const s = Math.max(0, Math.round(ms / 1000));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    if (h) return h + ' ساعة' + (m ? ' ' + m + ' د' : '') + (sec ? ' ' + sec + ' ث' : '');
    if (m) return m + ' دقيقة' + (sec ? ' ' + sec + ' ثانية' : '');
    return sec + ' ثانية';
  }
  function alFmtClock(ms){
    const s = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return (h ? h + ':' : '') + alTwo(m) + ':' + alTwo(sec);
  }
  function alFmtDate12(d){
    const h = d.getHours();
    return alH12(h) + ':' + alTwo(d.getMinutes()) + ' ' + alAp(h);
  }
  function alDateText(d){
    return AL_DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + AL_MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }
  function alHijri(d){
    try {
      let y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
      if (m <= 2){ y -= 1; m += 12; }
      const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
      const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;
      const l0 = Math.floor(jd) - 1 - 1948440 + 10632;
      const n = Math.floor((l0 - 1) / 10631);
      let l = l0 - 10631 * n + 354;
      const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719)
              + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
      l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
            - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
      const mo = Math.floor((24 * l) / 709);
      return { y:30 * n + j - 30, m:mo, d:l - Math.floor((709 * mo) / 24) };
    } catch (e) { return null; }
  }

  /* ── محرك الفلك: موقع الشمس → مواقيت الصلاة ── */
  const AL_D2R = Math.PI / 180;
  function alSin(x){ return Math.sin(x * AL_D2R); }
  function alCos(x){ return Math.cos(x * AL_D2R); }
  function alTan(x){ return Math.tan(x * AL_D2R); }
  function alAsinD(x){ return Math.asin(Math.max(-1, Math.min(1, x))) / AL_D2R; }
  function alAcosD(x){ return Math.acos(Math.max(-1, Math.min(1, x))) / AL_D2R; }
  function alAtan2D(y, x){ return Math.atan2(y, x) / AL_D2R; }
  function alWrap360(a){ const r = a % 360; return r < 0 ? r + 360 : r; }
  function alJd(date){
    let y = date.getFullYear(), m = date.getMonth() + 1;
    const d = date.getDate();
    if (m <= 2){ y -= 1; m += 12; }
    const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  }
  function alSunPos(jd){
    const D = jd - 2451545.0;
    const g = alWrap360(357.529 + 0.98560028 * D);
    const q = alWrap360(280.459 + 0.98564736 * D);
    const L = alWrap360(q + 1.915 * alSin(g) + 0.020 * alSin(2 * g));
    const e = 23.439 - 0.00000036 * D;
    // خط الميمين بالساعات (من -12 لـ +12) — نرجعه لنطاق 0..24 قبل طرحه
    let Ra = alAtan2D(alCos(e) * alSin(L), alCos(L)) / 15;
    if (Ra < 0) Ra += 24;
    return { dec: alAsinD(alSin(e) * alSin(L)), eqt: q / 15 - Ra };
  }
  function alTz(){ return alNum(alStore.tz, -new Date().getTimezoneOffset() / 60, -12, 14); }
  /* مواقيت اليوم = دقائق من منتصف ليل *توقيت المدينة* (مش توقيت المتصفح) — null لو مش موجودة */
  function alSolarDay(date){
    const tz = alTz();
    const lat = alStore.lat, lng = alStore.lng;
    const jd = alJd(date);
    const eqt = alSunPos(jd + 0.5).eqt;
    // eqt = (الشمس الحقيقية − الشمس المتوسطة)؛ الزوال لما eqt موجب بيحصل قبل 12:00
    const dhuhr = 12 + tz - lng / 15 - eqt;
    const dec = alSunPos(jd + (dhuhr - tz) / 24).dec;
    // T(alt) = فرق الزاوية الساعية عن الظهر، لدول الشمس على ارتفاع alt (بالساعات)
    const T = alt => {
      const den = alCos(lat) * alCos(dec);
      if (Math.abs(den) < 1e-9) return null;
      const v = (alSin(alt) - alSin(lat) * alSin(dec)) / den;
      if (!(v >= -1 && v <= 1)) return null;
      return (1 / 15) * alAcosD(v);
    };
    const set = T(-0.833);
    // العصر: زاوية الشمس وقت استواء الظل = arccot(طول الظل + tan(|خط العرض - الميل الشمسي|))
    const shadow = alStore.asr === 2 ? 2 : 1;
    const dLat = Math.abs(lat - dec);
    const asrAlt = Math.abs(alCos(dLat)) < 1e-9 ? 45 : alAtan2D(1, shadow + alTan(dLat));
    const fT = T(-alStore.fajrAng);
    const aT = T(asrAlt);
    const iT = alStore.ishaMin > 0 ? (set == null ? null : set + alStore.ishaMin / 60) : T(-alStore.ishaAng);
    const mn = h => (h == null || !isFinite(h)) ? null : Math.round(h * 60);
    const all = alStore.allAdj || 0;
    const out = {
      fajr: fT == null ? null : mn(dhuhr - fT) + all,
      sunrise: set == null ? null : mn(dhuhr - set) + all,
      dhuhr: mn(dhuhr) + all,
      asr: aT == null ? null : mn(dhuhr + aT) + all + (alStore.asrAdj || 0),
      maghrib: set == null ? null : mn(dhuhr + set) + all,
      isha: iT == null ? null : mn(dhuhr + iT) + all,
      jumua: mn(dhuhr + 40 / 60)
    };
    Object.keys(out).forEach(k => { if (out[k] != null && (out[k] < 0 || out[k] > 1439)) out[k] = null; });
    return out;
  }
  function alFmtMins(mins){
    if (mins == null || !isFinite(mins)) return '—';
    const m = Math.round(mins);
    return alTwo(Math.floor(m / 60)) + ':' + alTwo(m % 60) + ' ' + alAp(Math.floor(m / 60));
  }
  /* وقت الصلاة = تاريخ حقيقي (epoch) — بيحوّل وقت المدينة للتوقيت المحلي */
  function alPrayerEpoch(id, date){
    const day = alSolarDay(date);
    if (!day) return null;
    const mins = day[id];
    if (mins == null) return null;
    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, Math.round(mins) * 60000) - alTz() * 3600000;
  }
  /* الجمعة: آخر جمعة قبل اليوم ده، بعد الظهر بـ 40 دقيقة */
  function alPrayerDate(id, date){
    if (id === 'jumua'){
      const back = (date.getDay() - 5 + 7) % 7;
      const base = new Date(date.getFullYear(), date.getMonth(), date.getDate() - back, 0, 0, 0, 0);
      return alPrayerEpoch('jumua', base);
    }
    return alPrayerEpoch(id, date);
  }
  function alNextPrayer(date){
    const nowMs = date.getTime();
    for (let k = 0; k < 8; k++){
      const base = new Date(date.getFullYear(), date.getMonth(), date.getDate() + k, 0, 0, 0, 0);
      let best = null;
      AL_PRAYERS.forEach(p => {
        if (p.id === 'jumua') return;
        const ms = alPrayerDate(p.id, base);
        if (ms == null) return;
        if (ms > nowMs + 1000 && (!best || ms < best.ms)) best = { name:p.name, ico:p.ico, ms:ms };
      });
      if (best) return { name:best.name, ico:best.ico, at:new Date(best.ms) };
    }
    return null;
  }

  /* ── الصوت (Web Audio — بدون ملفات خارجية) ── */
  function alAudioCtx(){
    try {
      if (!alCtx){
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        alCtx = new AC();
      }
      if (alCtx.state === 'suspended' && alCtx.resume) { try { alCtx.resume(); } catch (e) {} }
      return alCtx;
    } catch (e) { return null; }
  }
  function alPlaySound(id, vol){
    const ctx = alAudioCtx();
    if (!ctx) return false;
    const snd = AL_SOUNDS.find(s => s.id === id);
    if (!snd) return false;
    const t0 = ctx.currentTime + 0.03;
    const peak = Math.max(0.02, Math.min(1, (typeof vol === 'number' ? vol : 0.7))) * 0.34;
    snd.notes.forEach(n => {
      const type = n[0], f0 = n[1], f1 = n[2], at = n[3], dur = n[4], g = n[5];
      let o, gn;
      try { o = ctx.createOscillator(); gn = ctx.createGain(); } catch (e) { return; }
      o.type = type;
      o.frequency.setValueAtTime(Math.max(20, f0), t0 + at);
      if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + at + dur);
      gn.gain.setValueAtTime(0.0001, t0 + at);
      gn.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak * (g || 1)), t0 + at + Math.min(0.02, dur * 0.25));
      gn.gain.exponentialRampToValueAtTime(0.0001, t0 + at + dur);
      o.connect(gn); gn.connect(ctx.destination);
      o.start(t0 + at);
      o.stop(t0 + at + dur + 0.03);
    });
    return true;
  }
  function alSoundIds(){
    return (alStore.sound === AL_MIX_ID) ? AL_SOUNDS.map(s => s.id) : [alStore.sound];
  }
  /* ── الصوت المرفوع من المستخدم (عصافير / بحر / أي ملف) ── */
  const AL_MAX_FILE = 2.6 * 1024 * 1024;
  function alCustomEl(){
    if (!alStore.custom || !alStore.custom.data) return null;
    try {
      if (!alAudioEl){
        alAudioEl = new Audio();
        alAudioEl.preload = 'auto';
        alAudioEl.loop = true;
      }
      if (alAudioEl.dataset.src !== alStore.custom.data){
        alAudioEl.src = alStore.custom.data;
        alAudioEl.dataset.src = alStore.custom.data;
        alAudioEl.load();
      }
      alAudioEl.volume = Math.max(0, Math.min(1, alStore.vol));
      return alAudioEl;
    } catch (e) { return null; }
  }
  function alPickFile(input){
    const f = input && input.files && input.files[0];
    if (!f) return;
    if (f.size > AL_MAX_FILE){
      input.value = '';
      showToast('الملف كبير (' + Math.round(f.size / 1048576) + ' ميجا) — الحد 2.5 ميجا');
      return;
    }
    const fr = new FileReader();
    fr.onload = () => {
      const url = String(fr.result || '');
      try {
        localStorage.setItem(AL_KEY + '_probe', url);
        localStorage.removeItem(AL_KEY + '_probe');
      } catch (e) {
        input.value = '';
        showToast('المساحة المتاحة مش كافية للصوت ده — جرّب ملف أصغر');
        return;
      }
      alStore.custom = { name:String(f.name || 'صوتي').slice(0, 40), data:url, type:String(f.type || 'audio/mpeg') };
      alStore.sound = AL_CUSTOM_ID;
      saveAl();
      renderAlDash();
      showToast('تم رفع الصوت: ' + alStore.custom.name);
    };
    fr.onerror = () => { input.value = ''; showToast('مش قادر أقرا الملف ده'); };
    fr.readAsDataURL(f);
  }
  function alClearCustom(){
    if (alCustomPlay && alAudioEl){ try { alAudioEl.pause(); } catch (e) {} }
    alCustomPlay = false;
    alStore.custom = null;
    if (alStore.sound === AL_CUSTOM_ID) alStore.sound = AL_MIX_ID;
    saveAl();
    renderAlDash();
    showToast('تم مسح الصوت المرفوع');
  }
  function alOpenFile(){ alFileInput = document.getElementById('alFileInput'); if (alFileInput) alFileInput.click(); }

  function alRingStart(){
    if (alRingTimer || alCustomPlay) return;
    alRingStep = 0;
    if (alStore.sound === AL_CUSTOM_ID && alStore.custom && alStore.custom.data){
      const el = alCustomEl();
      if (el){ try { el.currentTime = 0; el.play(); alCustomPlay = true; return; } catch (e) {} }
    }
    const ids = alSoundIds();
    if (ids.indexOf(AL_CUSTOM_ID) > -1) return;
    const cycle = () => {
      const list = alSoundIds();
      if (list.indexOf(AL_CUSTOM_ID) > -1) return;
      alPlaySound(list[alRingStep % list.length], alStore.vol);
      alRingStep++;
    };
    cycle();
    alRingTimer = setInterval(cycle, AL_RING_GAP);
  }
  function alRingStop(){
    if (alRingTimer){ clearInterval(alRingTimer); alRingTimer = null; }
    if (alCustomPlay && alAudioEl){ try { alAudioEl.pause(); alAudioEl.currentTime = 0; } catch (e) {} }
    alCustomPlay = false;
    alRingStep = 0;
  }

  /* ── التشغيل / الإيقاف ── */
  function alArmAt(target, label){
    const d = Math.max(1000, target - Date.now());
    alRingStop();
    alStore.ringing = false;
    alStore.phase = 'ring';
    alStore.armed = true;
    alStore.dur = d;
    alStore.dueAt = Date.now() + d;
    if (label != null) alStore.label = String(label || '');
    saveAl();
    alAudioCtx();
    alEnsureTick();
    alPaint();
    if (!alNoToast) showToast('المنبه اتفعّل — ' + label + ' بعد ' + alFmtDur(d));
  }
  function alArm(ms, label){ alArmAt(Date.now() + Math.max(1000, ms || 0), label); }
  function alDisarm(silent, rerun){
    const wasRinging = alStore.ringing;
    const isSched = alStore.mode === 'sched';
    const wasDaily = isSched || (alStore.daily && (alStore.mode === 'time' || alStore.mode === 'prayer'));
    const keep = { mode:alStore.mode, prayer:alStore.prayer, th:alStore.th, tm:alStore.tm, tap:alStore.tap };
    alRingStop();
    alStore.armed = false;
    alStore.ringing = false;
    alStore.dueAt = 0;
    alStore.phaseEndsAt = 0;
    alStore.label = '';
    saveAl();
    alTitleOff();
    /* إعادة الضبط التلقائي بتحصل بس بعد ما المنبه يرن فعلاً — زر إيقاف يوقف فعلاً */
    if (wasDaily && !silent && (wasRinging || rerun)){
      alStore.daily = true;
      if (isSched) alSchedArm(true);
      else if (keep.mode === 'prayer' && keep.prayer) alArmPrayer(keep.prayer, true);
      else alArmClock(true);
      showToast('اتعاد لليوم اللي بعده — ' + alStore.label);
      return;
    }
    alPaint();
    if (!silent) showToast('تم إيقاف المنبه');
  }
  function alFire(){
    if (alStore.ringing) return;
    alStore.armed = false;
    alStore.ringing = true;
    alStore.phase = 'ring';
    alStore.phaseEndsAt = Date.now() + alStore.ringFor;
    saveAl();
    alEnsureTick();
    alRingStart();
    alPaint();
    alNotify();
    showToast('⏰ حان وقت المنبه!');
  }
  /* دورة الرن: يرن ringFor ثم rests restFor ثم يرجع — لحد ما تضغط إيقاف */
  function alCycle(){
    const now = Date.now();
    if (alStore.phase === 'ring'){
      alRingStop();
      alTitleOff();
      if (!alStore.repeat){ alDisarm(); return; }
      alStore.phase = 'rest';
      alStore.phaseEndsAt = now + alStore.restFor;
    } else {
      alStore.phase = 'ring';
      alStore.phaseEndsAt = now + alStore.ringFor;
      alRingStart();
      alNotify();
    }
    saveAl();
    alPaint();
  }
  function alDismiss(){
    if (!alStore.ringing && !alStore.armed) return;
    alDisarm(false, true);
  }
  function alSnooze(min){
    if (!alStore.ringing) return;
    alRingStop();
    alTitleOff();
    alStore.phase = 'rest';
    alStore.phaseEndsAt = Date.now() + Math.max(5000, (min || 5) * AL_MIN);
    saveAl();
    alPaint();
    showToast('تم التأجيل ' + (min || 5) + ' دقيقة');
  }
  function alTest(){
    alAudioCtx();
    if (alStore.sound === AL_CUSTOM_ID && alStore.custom && alStore.custom.data){
      const el = alCustomEl();
      if (el){ try { el.currentTime = 0; el.volume = Math.max(0, Math.min(1, alStore.vol)); el.play(); setTimeout(() => { try { el.pause(); } catch (e) {} }, 4500); showToast('تجربة: ' + alStore.custom.name); return; } catch (e) {} }
      showToast('الصوت المرفوع مش متاح');
      return;
    }
    const ids = alSoundIds();
    if (ids.length > 1){
      ids.forEach((id, i) => setTimeout(() => alPlaySound(id, alStore.vol), i * 950));
      showToast('تجربة كل الأصوات');
    } else {
      alPlaySound(ids[0], alStore.vol);
      showToast('تجربة الصوت');
    }
  }
  function alAskNotify(){
    try { if (window.Notification && Notification.permission === 'default') Notification.requestPermission(); } catch (e) {}
  }
  function alNotify(){
    try {
      if (window.Notification && Notification.permission === 'granted'){
        new Notification('⏰ المنبه', { body:(alStore.label ? alStore.label + ' — ' : '') + 'بيرن ' + alFmtDur(alStore.ringFor) + (alStore.repeat ? ' ثم يكمّل' : ''), tag:'csman_alarm', requireInteraction:true });
      }
    } catch (e) {}
  }
  function alTitleOff(){
    if (alTitleOn){ alTitleOn = false; if (alTitleWas) document.title = alTitleWas; }
  }
  function alTitleOnSet(){
    if (alTitleOn) { document.title = '⏰ ' + alTitleWas; return; }
    alTitleOn = true; alTitleWas = document.title;
    document.title = '⏰ ' + alTitleWas;
  }

  /* ── الإعدادات ── */
  function alSyncHmsInputs(){
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
    set('alHh', alStore.h); set('alMm', alStore.m); set('alSs', alStore.s);
    set('alTh', alStore.th); set('alTm', alStore.tm);
  }
  function alSetMode(m){
    alStore.mode = (m === 'time' || m === 'prayer' || m === 'sched') ? m : 'dur';
    saveAl();
    renderAlDash();
  }
  function alChipStart(ms, label){
    alStore.h = Math.floor(ms / 3600000);
    alStore.m = Math.floor((ms % 3600000) / 60000);
    alStore.s = Math.floor((ms % 60000) / 1000);
    alStore.mode = 'dur';
    alSyncHmsInputs();
    alArm(ms, label);
  }
  function alSetHms(){
    const h = Math.max(0, Math.min(23, parseInt((document.getElementById('alHh') || {}).value, 10) || 0));
    const m = Math.max(0, Math.min(59, parseInt((document.getElementById('alMm') || {}).value, 10) || 0));
    const s = Math.max(0, Math.min(59, parseInt((document.getElementById('alSs') || {}).value, 10) || 0));
    alStore.h = h; alStore.m = m; alStore.s = s;
    alStore.hms = h + ':' + m + ':' + s;
    alStore.dur = Math.max(0, (h * 3600 + m * 60 + s) * 1000);
    saveAl();
    alPaint();
    return alStore.dur;
  }
  function alStartHms(){
    const raw = alSetHms();
    if (raw < 1000){ showToast('اكتب مدة أكبر من صفر'); return; }
    alStore.mode = 'dur';
    alArm(raw, 'منبه ' + alStore.hms);
  }
  /* ── وقت محدد (12 ساعة) ── */
  function alSetClock(){
    const th = Math.round(alNum((document.getElementById('alTh') || {}).value, 12, 1, 12));
    const tm = Math.round(alNum((document.getElementById('alTm') || {}).value, 0, 0, 59));
    alStore.th = th; alStore.tm = tm;
    saveAl();
    const t = alClockTarget();
    const hint = document.getElementById('alClockHint');
    if (hint) hint.textContent = t ? ('هيشتغل ' + (t.tomorrow ? 'بكرة ' : 'النهارده ') + alFmtDate12(t.at)) : 'اختر وقت أكبر من دلوقتي';
    alPaint();
    return t;
  }
  function alClockTarget(){
    const v = alTo24(alStore.th, alStore.tm, alStore.tap);
    const now = new Date();
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate(), v.h, v.m, 0, 0);
    let tomorrow = false;
    if (at.getTime() <= Date.now() + 30000){
      at.setDate(at.getDate() + 1);
      tomorrow = true;
    }
    return { at:at, tomorrow:tomorrow };
  }
  function alToggleAmPm(){
    alStore.tap = alStore.tap === 'ص' ? 'م' : 'ص';
    saveAl();
    alSetClock();
    renderAlDash();
  }
  function alArmClock(silent){
    const t = alClockTarget();
    if (!t) return;
    alStore.mode = 'time';
    alArmAt(t.at.getTime(), 'منبه ' + alStore.th + ':' + alTwo(alStore.tm) + ' ' + alStore.tap + (t.tomorrow ? ' (بكرة)' : ''));
  }
  function alSetDaily(on){
    alStore.daily = !!on;
    saveAl();
    renderAlDash();
  }
  /* ── جدول المنبهات: أكتر من منبه، كل واحد وقت + أيام مختارة ── */
  function alNewId(){ return 's' + Date.now().toString(36) + Math.floor(Math.random() * 46656).toString(36); }
  function alSchedNorm(list){
    if (!Array.isArray(list)) return [];
    const out = [];
    for (let i = 0; i < list.length && out.length < AL_MAX_SCHED; i++){
      const a = list[i];
      if (!a || typeof a !== 'object') continue;
      let days = AL_DAY_ALL.slice();
      if (Array.isArray(a.days)){
        days = a.days.map(n => parseInt(n, 10)).filter(n => n >= 0 && n <= 6)
                     .filter((n, ix, arr) => arr.indexOf(n) === ix);
      }
      if (!days.length) days = [0];
      days.sort((x, y) => ((x + 1) % 7) - ((y + 1) % 7));
      out.push({
        id: (typeof a.id === 'string' && a.id) ? a.id : alNewId(),
        th: Math.round(alNum(a.th, 5, 1, 12)),
        tm: Math.round(alNum(a.tm, 0, 0, 59)),
        tap: a.tap === 'م' ? 'م' : 'ص',
        days: days,
        on: a.on !== false,
        name: String(a.name == null ? '' : a.name).slice(0, 40)
      });
    }
    return out;
  }
  function alDayName(ms){ return AL_DAYS[new Date(ms).getDay()]; }
  /* موعد منبه واحد بعد اللحظة المطلوبة (null = مفيش) */
  function alAlarmNext(a, from){
    if (!a || a.on === false || !a.days || !a.days.length) return null;
    const v = alTo24(a.th, a.tm, a.tap);
    const base = new Date(from);
    base.setHours(0, 0, 0, 0);
    for (let d = 0; d <= 7; d++){
      const day = new Date(base.getTime() + d * 864e5);
      if (a.days.indexOf(day.getDay()) < 0) continue;
      const t = new Date(day.getFullYear(), day.getMonth(), day.getDate(), v.h, v.m, 0, 0).getTime();
      if (t > from) return t;
    }
    return null;
  }
  /* أقرب موعد في الجدول كله */
  function alSchedNext(from){
    let best = null, bestAl = null;
    for (let i = 0; i < alStore.sched.length; i++){
      const t = alAlarmNext(alStore.sched[i], from);
      if (t != null && (best == null || t < best)){ best = t; bestAl = alStore.sched[i]; }
    }
    return best == null ? null : { at:best, al:bestAl };
  }
  function alDaysTxt(a){
    if (!a || !a.days.length) return 'مفيش يوم';
    if (a.days.length === 7) return 'كل يوم';
    return AL_WDAYS.filter(d => a.days.indexOf(d.i) >= 0).map(d => AL_DAYS[d.i]).join('، ');
  }
  function alSchedLabel(a, at){
    const when = (a.name ? a.name : ('منبه ' + alH12(a.th) + ':' + alTwo(a.tm) + ' ' + a.tap));
    const dn = alDayName(at);
    const today = new Date().toDateString() === new Date(at).toDateString();
    return dn && !today ? (when + ' (' + dn + ')') : when;
  }
  /* بعد أي تعديل على الجدول: لو شغّال بنحسب الموعد الجديد فورًا */
  function alSchedChanged(){
    saveAl();
    if (alStore.mode === 'sched' && (alStore.armed || alStore.ringing)) alSchedArm(true);
    else renderAlDash();
  }
  function alSchedAdd(){
    if (alStore.sched.length >= AL_MAX_SCHED){ showToast('الحد الأقصى ' + AL_MAX_SCHED + ' منبه'); return; }
    alStore.sched.push({ id:alNewId(), th:alStore.th, tm:alStore.tm, tap:alStore.tap, days:AL_DAY_ALL.slice(), on:true, name:'' });
    alSetMode('sched');
    alSchedChanged();
  }
  function alSchedDel(i){
    if (!alStore.sched[i]) return;
    alStore.sched.splice(i, 1);
    alSchedChanged();
  }
  function alSchedOn(i){
    const a = alStore.sched[i];
    if (!a) return;
    a.on = !a.on;
    alSchedChanged();
  }
  function alSchedTime(i, field, val){
    const a = alStore.sched[i];
    if (!a) return;
    if (field === 'th') a.th = Math.round(alNum(val, a.th, 1, 12));
    else if (field === 'tm') a.tm = Math.round(alNum(val, a.tm, 0, 59));
    else if (field === 'tap') a.tap = (val === 'م') ? 'م' : 'ص';
    alSchedChanged();
  }
  function alSchedDay(i, day){
    const a = alStore.sched[i];
    if (!a) return;
    const k = parseInt(day, 10);
    if (isNaN(k) || k < 0 || k > 6) return;
    const ix = a.days.indexOf(k);
    if (ix >= 0) a.days.splice(ix, 1);
    else a.days.push(k);
    if (!a.days.length) a.days.push(k);       /* مينفعش يبقى منبه بلا أيام */
    a.days.sort((x, y) => ((x + 1) % 7) - ((y + 1) % 7));
    alSchedChanged();
  }
  function alSchedDays(i, preset){
    const a = alStore.sched[i];
    if (!a) return;
    a.days = (preset === 'wkd' ? AL_DAY_WKD : AL_DAY_ALL).slice();
    alSchedChanged();
  }
  function alSchedArm(silent){
    const n = alSchedNext(Date.now() + 1000);
    if (!n){
      if (alStore.armed || alStore.ringing) alDisarm(true);   // مفيش حاجة تبقى متسلّحة
      if (!silent) showToast('مفيش أي منبه مفعّل — اختار يوم أو شغّل منبه');
      return;
    }
    alStore.mode = 'sched';
    const prev = alNoToast; alNoToast = !!silent;
    alArmAt(n.at, alSchedLabel(n.al, n.at));
    alNoToast = prev;
  }
  /* ── مواقيت الصلاة ── */
  function alArmPrayer(id, silent){
    const p = AL_PRAYERS.find(x => x.id === id);
    if (!p) return;
    // دوّر على أقرب يوم متاح: الجمعة بتبعد 7 أيام، والباقي 3 أيام (خط عرض عالي ممكن الصلاة ماتظهرش نهارده)
    const now = Date.now();
    const lead = (id === 'jumua') ? 0 : alStore.lead;   // الجمعة التذكير بيكون عند الصلاة نفسها
    const days = (id === 'jumua') ? [0, 7, 14] : [0, 1, 2];
    let ms = null, shift = 0;
    for (let i = 0; i < days.length && ms == null; i++){
      const base = new Date();
      base.setDate(base.getDate() + days[i]);
      const t = alPrayerDate(id, base);
      if (t == null) continue;
      const at = t - lead * AL_MIN;
      if (at > now){ ms = at; shift = days[i]; }
    }
    if (ms == null){ showToast('الوقت ده مش متاح عند خط العرض ده'); return; }
    alStore.mode = 'prayer';
    alStore.prayer = id;
    const when = shift ? (id === 'jumua' ? ' (الجمعة الجاية)' : ' (بكرة)') : '';
    alArmAt(ms, lead ? (p.name + ' — ' + alLeadLabel()) : ('أذان ' + p.name + when));
  }
  function alSetCity(name){
    const c = AL_CITIES.find(x => x.n === name);
    if (c){
      alStore.city = c.n; alStore.lat = c.lat; alStore.lng = c.lng;
      // لو الفارق بين توقيت جهازك والتوقيت الرسمي للمدينة ≤ ساعة → نعتبر إنك في نفس الدولة (فرق صيفي) ونسيب توقيت جهازك
      const mine = -new Date().getTimezoneOffset() / 60;
      alStore.tz = Math.abs(mine - c.tz) <= 1 ? mine : c.tz;
    }
    saveAl();
    renderAlDash();
  }
  function alSetTz(v){
    alStore.tz = alNum(v, alTz(), -12, 14);
    saveAl();
    renderAlDash();
  }
  function alSetCoords(kind, v){
    const n = alNum(v, NaN, kind === 'lat' ? -66 : -180, kind === 'lat' ? 66 : 180);
    if (!isFinite(n)) return;
    alStore[kind] = n;
    alStore.city = 'مخصص';
    saveAl();
    renderAlDash();
  }
  function alSetMethod(){
    const f = alNum((document.getElementById('alFajrAng') || {}).value, 19.5, 10, 22);
    const i = alNum((document.getElementById('alIshaAng') || {}).value, 18, 10, 22);
    const im = alNum((document.getElementById('alIshaMin') || {}).value, 0, 0, 120);
    alStore.fajrAng = f; alStore.ishaAng = i; alStore.ishaMin = im;
    const a = (document.getElementById('alAsr') || {}).value;
    alStore.asr = (a === '2') ? 2 : 1;
    saveAl();
    renderAlDash();
  }
  function alSetAllAdj(v){
    alStore.allAdj = alNum(v, 0, -90, 90);
    saveAl();
    renderAlDash();
  }
  function alSetAsrAdj(v){
    alStore.asrAdj = alNum(v, 0, -90, 90);
    saveAl();
    renderAlDash();
  }
  function alSetLead(m){
    alStore.lead = Math.round(alNum(m, 0, 0, 24*60));
    saveAl();
    renderAlDash();
  }
  function alLeadLabel(){
    const l = AL_LEAD.find(x => x.m === alStore.lead);
    return l ? l.label : ('قبلها ' + alFmtDur(alStore.lead * AL_MIN));
  }
  function alSetSound(id){
    alStore.sound = (id === AL_MIX_ID || id === AL_CUSTOM_ID || AL_SOUNDS.some(s => s.id === id)) ? id : AL_MIX_ID;
    saveAl();
    const panel = document.getElementById('alSndGrid');
    if (panel) panel.querySelectorAll('.al-snd').forEach(b => b.classList.toggle('on', b.dataset.snd === alStore.sound));
    const lab = document.getElementById('alSndLabel');
    if (lab) lab.textContent = alSoundLabel();
  }
  function alSoundLabel(){
    if (alStore.sound === AL_MIX_ID) return 'كل الأصوات بالتناوب';
    if (alStore.sound === AL_CUSTOM_ID) return alStore.custom ? alStore.custom.name : 'صوت مرفوع';
    return (AL_SOUNDS.find(s => s.id === alStore.sound) || { name:'—' }).name;
  }
  function alSetVol(v){
    alStore.vol = Math.max(0, Math.min(1, (parseFloat(v) || 0)));
    saveAl();
    const lab = document.getElementById('alVol');
    if (lab) lab.textContent = Math.round(alStore.vol * 100) + '%';
    if (alAudioEl) { try { alAudioEl.volume = alStore.vol; } catch (e) {} }
  }
  function alSetRepeat(on){
    alStore.repeat = !!on;
    saveAl();
    const sw = document.getElementById('alRepeat');
    if (sw){
      sw.classList.toggle('on', alStore.repeat);
      sw.setAttribute('aria-checked', alStore.repeat ? 'true' : 'false');
    }
    const nt = document.getElementById('alRepNote');
    if (nt) nt.textContent = alStore.repeat
      ? 'يرن ' + alRepTxt(alStore.ringFor) + ' ثم يسكت ' + alRepTxt(alStore.restFor) + ' ويرجع تاني لحد ما تضغط إيقاف.'
      : 'يرن مرة واحدة بس ' + alRepTxt(alStore.ringFor) + ' ويقف.';
  }
  function alRepTxt(ms){ return alFmtDur(ms); }
  function alSetRingFor(ms){
    alStore.ringFor = alNum(ms, 5*AL_MIN, 5000, 6*60*AL_MIN);
    saveAl();
    renderAlDash();
  }
  function alSetRestFor(ms){
    alStore.restFor = alNum(ms, AL_MIN, 5000, 60*AL_MIN);
    saveAl();
    renderAlDash();
  }

  /* ── التحديث الدوري (ساعة + العدّاد + التحقق من الموعد) ── */
  function alEnsureTick(){ if (!alTickTimer) alTickTimer = setInterval(alTick, 250); }
  function alTick(){
    const now = Date.now();
    if (alStore.armed && !alStore.ringing && now >= alStore.dueAt) alFire();
    else if (alStore.ringing && alStore.phaseEndsAt && now >= alStore.phaseEndsAt) alCycle();
    alPaint();
  }
  function alRingingNow(){ return !!(alStore.ringing && alStore.phase === 'ring'); }

  function alPaint(){
    const now = new Date();
    const hj = alHijri(now);
    const clock = document.getElementById('alClock');
    if (clock){
      clock.innerHTML = alH12(now.getHours()) + ':' + alTwo(now.getMinutes()) +
        ':<span class="al-sec">' + alTwo(now.getSeconds()) + '</span>' +
        '<b class="al-ap">' + alAp(now.getHours()) + '</b>' +
        '<small>' + alDateText(now) + (hj ? ' — ' + alTwo(hj.d) + ' ' + AL_HIJRI[hj.m - 1] + ' ' + hj.y + 'هـ <i>(تقريبي)</i>' : '') + '</small>';
    }
    const np = document.getElementById('alNextPrayer');
    if (np){
      const p = alNextPrayer(now);
      np.innerHTML = p
        ? '<i class="ti ' + p.ico + '" aria-hidden="true"></i> أقرب صلاة: <b>' + p.name + '</b> ' + alFmtDate12(p.at) +
          ' <span class="al-val">(بعد ' + alFmtDur(p.at - now.getTime()) + ')</span>'
        : '<i class="ti ti-calendar" aria-hidden="true"></i> مواقيت الصلاة مش متاحة عند خط العرض ده';
    }

    const ring = alRingingNow();
    const rest = !!(alStore.ringing && alStore.phase === 'rest');
    const total = Math.max(1000, alStore.dur);
    let left, lbl, p, numTxt, capTxt = null;
    let atClock = false;
    // الرقم الكبير = وقت رنين المنبه (لو الوقت محدد)، والعد التنازلي تحته بوحدات صريحة
    const capFor = ms => (ms >= 3600000 ? 'ساعة : دقيقة : ثانية' : 'دقيقة : ثانية');
    if (ring || rest){
      left = Math.max(0, alStore.phaseEndsAt - Date.now());
      p = ring ? (left / Math.max(1000, alStore.ringFor)) : (left / Math.max(1000, alStore.restFor));
      lbl = ring ? 'يرن الآن' : 'استراحة — هيرن تاني';
      atClock = (alStore.mode === 'time' || alStore.mode === 'prayer' || alStore.mode === 'sched') && !!alStore.dueAt;
      numTxt = atClock ? alFmtDate12(new Date(alStore.dueAt)) : alFmtClock(left);
      if (!atClock) capTxt = capFor(left);
    }
    else if (alStore.armed){
      left = Math.max(0, alStore.dueAt - Date.now());
      p = left / total;
      // وضع الوقت/الصلاة: الرقم الكبير = وقت رنين المنبه، والعد التنازلي تحته بوحدات صريحة
      atClock = (alStore.mode === 'time' || alStore.mode === 'prayer' || alStore.mode === 'sched') && !!alStore.dueAt;
      if (atClock){
        numTxt = alFmtDate12(new Date(alStore.dueAt));
        lbl = 'المتبقي ' + alFmtDur(left);
      } else {
        numTxt = alFmtClock(left);
        lbl = 'المتبقي';
        capTxt = capFor(left);
      }
    }
    else {
      left = total; p = 1;
      const onCount = alStore.sched.filter(a => a.on && a.days.length).length;
      const idle = alStore.mode === 'sched' ? (onCount ? (onCount + ' منبه في الجدول') : 'الجدول فاضي')
                 : alStore.mode === 'prayer' ? 'وقت الصلاة'
                 : alStore.mode === 'time' ? 'الوقت المضبوط' : 'مدة المنبه';
      if (alStore.mode === 'prayer' || alStore.mode === 'time' || alStore.mode === 'sched'){ numTxt = idle; lbl = 'ابدأ المنبه'; }
      else { numTxt = alFmtClock(total); lbl = idle; capTxt = capFor(total); }
    }
    const num = document.getElementById('alRingNum');
    if (num){
      num.textContent = numTxt;
      num.classList.toggle('isclock', !!atClock);
    }
    const lblEl = document.getElementById('alRingLbl');
    if (lblEl) lblEl.textContent = lbl;
    const capEl = document.getElementById('alRingCap');
    if (capEl){
      if (capTxt){ capEl.textContent = capTxt; capEl.hidden = false; }
      else capEl.hidden = true;
    }
    const arc = document.getElementById('alArc');
    if (arc){ arc.style.strokeDashoffset = String(AL_CIRC * (1 - Math.max(0, Math.min(1, p)))); arc.classList.toggle('rest', rest); }
    const card = document.getElementById('alRingCard');
    if (card) card.classList.toggle('ring-flash', ring);
    const st = document.getElementById('alState');
    if (st){
      st.className = 'al-state' + (ring ? ' ring' : (rest ? ' rest' : (alStore.armed ? ' on' : '')));
      st.textContent = ring ? '⏰ يرن الآن — اضغط إيقاف'
        : (rest ? 'استراحة قصيرة — يرن تاني بعد ' + alFmtClock(Math.max(0, alStore.phaseEndsAt - Date.now()))
        : (alStore.armed ? 'مفعّل · ' + (alStore.label || 'منبه') : 'متوقف — اختار المدة أو الوقت وابدأ'));
    }
    const go = document.getElementById('alGo');
    if (go) go.innerHTML = (alStore.armed || alStore.ringing)
      ? '<i class="ti ti-refresh"></i> إعادة الضبط'
      : '<i class="ti ti-player-play"></i> ابدأ المنبه';
    const stop = document.getElementById('alStopBtn');
    if (stop) stop.disabled = !alStore.armed && !alStore.ringing;
    const sn = document.getElementById('alSnoozeBtn');
    if (sn) sn.disabled = !alStore.ringing;
    if (ring) alTitleOnSet(); else alTitleOff();

    const sb = document.getElementById('alDashBtn');
    if (sb){
      sb.classList.toggle('al-badge', !!(alStore.armed || alStore.ringing));
      sb.classList.toggle('al-ringing', ring);
    }
    if (showAlDash){
      const badge = document.getElementById('countBadge');
      if (badge) badge.textContent = ring ? 'المنبه يرن الآن'
        : (rest ? 'منبه · استراحة'
        : (alStore.armed ? 'منبه · ' + alFmtClock(left) : 'منبه'));
    }
    alOverlaySync();
  }

  /* ── طبقة التنبيه Global (لو المستخدم في تاب تاني) ── */
  function alBuildOverlay(){
    if (alOverlayBuilt) return;
    if (!document.body) return;
    alOverlayBuilt = true;
    const d = document.createElement('div');
    d.className = 'al-overlay';
    d.id = 'alOverlay';
    d.innerHTML = `<div class="al-overlay-box" role="alertdialog" aria-live="assertive">
        <i class="ti ti-alarm al-overlay-ico" aria-hidden="true"></i>
        <h3>⏰ حان وقت المنبه!</h3>
        <p id="alOvMsg">حان الوقت</p>
        <div class="al-actions" style="margin-top:0">
          <button class="al-btn stop" onclick="alDismiss()"><i class="ti ti-player-stop"></i> إيقاف</button>
          <button class="al-btn" onclick="alSnooze(5)"><i class="ti ti-clock-hour-4"></i> تأجيل 5 د</button>
          <button class="al-btn go" onclick="alGoToPanel()"><i class="ti ti-alarm"></i> فتح المنبه</button>
        </div>
      </div>`;
    document.body.appendChild(d);
  }
  function alOverlaySync(){
    const ov = document.getElementById('alOverlay');
    if (!ov) return;
    if (!alRingingNow()){ ov.classList.remove('open'); return; }
    alBuildOverlay();
    const onPanel = showAlDash && !!document.getElementById('alPanel');
    ov.classList.toggle('open', !onPanel);
    if (!onPanel){
      const m = document.getElementById('alOvMsg');
      if (m) m.textContent = (alStore.label ? alStore.label + ' — ' : '') + 'بيرن ' + alFmtDur(alStore.ringFor) +
        (alStore.repeat ? ' ثم يسكت شوية ويكمل' : ' لحد ما توقفه');
    }
  }

  /* ── الواجهة ── */
  function alOpts(from, to, step, lead, sel){
    const st = step || 1, pad = !!lead;
    let s = '';
    for (let i = from; i <= to; i += st) s += '<option value="' + i + '"' + (i === sel ? ' selected' : '') + '>' + (pad ? alTwo(i) : i) + '</option>';
    return s;
  }
  function alSchedHtml(){
    const rows = alStore.sched.map((a, i) => {
      const days = AL_WDAYS.map(d => {
        const on = a.days.indexOf(d.i) >= 0;
        return `<button class="al-dchip${on ? ' on' : ''}" onclick="alSchedDay(${i},${d.i})" aria-pressed="${on}" title="${AL_DAYS[d.i]}" aria-label="${AL_DAYS[d.i]}">${d.s}</button>`;
      }).join('');
      const nxt = alAlarmNext(a, Date.now() + 1000);
      return `<div class="al-sitem${a.on ? '' : ' off'}" data-sched="${i}">
        <div class="al-shead">
          <select class="al-sel sm" onchange="alSchedTime(${i},'th',this.value)" aria-label="ساعة المنبه ${i + 1}">${alOpts(1, 12, 1, false, a.th)}</select>
          <span class="al-tp-c sm">:</span>
          <select class="al-sel sm" onchange="alSchedTime(${i},'tm',this.value)" aria-label="دقيقة المنبه ${i + 1}">${alOpts(0, 59, 1, true, a.tm)}</select>
          <button class="al-ampm${a.tap === 'م' ? ' pm' : ''}" onclick="alSchedTime(${i},'tap','${a.tap === 'م' ? 'ص' : 'م'}')" aria-label="صباح أم مساء">${a.tap}</button>
          <span class="al-sdays" role="group" aria-label="أيام التكرار">${days}</span>
          <span class="al-sw${a.on ? ' on' : ''}" onclick="alSchedOn(${i})" onkeydown="if(event.key===' '||event.key==='Enter'){event.preventDefault();alSchedOn(${i})}" role="switch" aria-checked="${a.on}" tabindex="0" aria-label="تشغيل المنبه ${i + 1}"></span>
          <button class="al-x" onclick="alSchedDel(${i})" title="حذف المنبه" aria-label="حذف المنبه ${i + 1}"><i class="ti ti-x" aria-hidden="true"></i></button>
        </div>
        <div class="al-sfoot">
          <span class="al-val" title="أيام التكرار">${alDaysTxt(a)}</span>
          <span class="al-val">${nxt ? ('الجاي ' + alFmtDate12(new Date(nxt)) + ' — ' + alDayName(nxt)) : 'مش مفعّل'}</span>
          <button class="al-chip sm" onclick="alSchedDays(${i},'all')">كل يوم</button>
          <button class="al-chip sm" onclick="alSchedDays(${i},'wkd')">أيام العمل</button>
        </div>
      </div>`;
    }).join('');
    return `<div class="al-sched" id="alSchedList">${rows || '<div class="al-note" style="margin:0">مفيش منبهات في الجدول — اضغط «إضافة منبه».</div>'}</div>
      <div class="al-row" style="margin-top:12px">
        <button class="al-btn go" onclick="alSchedAdd()"><i class="ti ti-plus" aria-hidden="true"></i> إضافة منبه</button>
        <span class="al-note" style="margin:0">اختار لكل منبه وقته والأيام اللي يتكرر فيها — وكل المنبهات المفعّلة تشتغل مع بعض.</span>
      </div>`;
  }
  function alSegHtml(modes){
    return `<div class="al-seg" role="tablist" aria-label="نوع المنبه">` + modes.map(x =>
      `<button class="al-segi${alStore.mode === x[0] ? ' on' : ''}" onclick="alSetMode('${x[0]}')" role="tab" aria-selected="${alStore.mode === x[0]}">
        <i class="ti ${x[2]}" aria-hidden="true"></i> ${x[1]}</button>`).join('') + `</div>`;
  }
  function alModeHtml(){
    if (alStore.mode === 'sched') return alSchedHtml();
    if (alStore.mode === 'time'){
      const t = alClockTarget();
      return `<div class="al-tp">
          <select class="al-sel" id="alTh" onchange="alSetClock()" aria-label="الساعة">${alOpts(1, 12, 1, false, alStore.th)}</select>
          <span class="al-tp-c">:</span>
          <select class="al-sel" id="alTm" onchange="alSetClock()" aria-label="الدقيقة">${alOpts(0, 59, 1, true, alStore.tm)}</select>
          <button class="al-ampm${alStore.tap === 'م' ? ' pm' : ''}" id="alAmPm" onclick="alToggleAmPm()" aria-label="صباح أم مساء">${alStore.tap}</button>
          <button class="al-btn go" onclick="alArmClock()"><i class="ti ti-player-play"></i> ابدأ</button>
        </div>
        <div class="al-note" id="alClockHint">${t ? 'هيشتغل ' + (t.tomorrow ? 'بكرة ' : 'النهارده ') + alFmtDate12(t.at) : ''}</div>
        <div class="al-row">
          <label>يتكرر كل يوم</label>
          <span class="al-sw${alStore.daily ? ' on' : ''}" id="alDaily" onclick="alSetDaily(!alStore.daily)" onkeydown="if(event.key===' '||event.key==='Enter'){event.preventDefault();alSetDaily(!alStore.daily)}" role="switch" aria-checked="${alStore.daily}" tabindex="0" aria-label="يتكرر كل يوم"></span>
          <span class="al-note" style="margin:0">لو الوقت عدّى، بينتقل لليوم اللي بعده تلقائيًا</span>
        </div>`;
    }
    if (alStore.mode === 'prayer'){
      const now = new Date();
      const day = alSolarDay(now);
      const rows = AL_PRAYERS.map(p => {
        const at = alPrayerDate(p.id, now);
        const past = (at != null && at <= Date.now());
        // الجمعة: لو آخر جمعة عدّت، اعرض الجمعة الجاية بنفس وقت الصلاة
        let mins = (day || {})[p.id];
        if (p.id === 'jumua' && past){
          const nx = new Date(now.getTime() + 7*24*60*AL_MIN);
          mins = (alSolarDay(new Date(nx.getFullYear(), nx.getMonth(), nx.getDate(), 0, 0, 0, 0)) || {}).jumua;
        }
        const shown = past && p.id !== 'jumua' && mins != null
          ? alFmtMins(mins) + ' <span class="al-val">(عدّى)</span>'
          : alFmtMins(mins) + (p.id === 'jumua' ? ' <span class="al-val">(آخر جمعة)</span>' : '');
        // وقت التذكير الفعلي = وقت الصلاة − مدة التذكير المختارة
        let rem = '';
        const leadRow = (p.id === 'jumua') ? 0 : alStore.lead;
        if (leadRow > 0 && mins != null){
          const rm = mins - leadRow;
          rem = rm >= 0
            ? '<span class="al-rem">تنبيه ' + alFmtMins(rm) + '</span>'
            : '<span class="al-rem">تنبيه اليوم اللي فات</span>';
        }
        return `<div class="al-prow${alStore.prayer === p.id ? ' sel' : ''}">
          <span class="al-pn"><i class="ti ${p.ico}" aria-hidden="true"></i> ${p.name}</span>
          <span class="al-pt">${shown}${rem}</span>
          <button class="al-btn mini${alStore.prayer === p.id ? ' on' : ''}" onclick="alArmPrayer('${p.id}')" ${at ? '' : 'disabled'}>${alStore.prayer === p.id ? 'محدد' : 'اضبط'}</button>
        </div>`;
      }).join('');
      const cities = AL_CITIES.map(c => `<option value="${c.n}"${alStore.city === c.n ? ' selected' : ''}>${c.n}</option>`).join('');
      const leadChips = AL_LEAD.map(l => `<button class="al-chip sm${alStore.lead === l.m ? ' on' : ''}" onclick="alSetLead(${l.m})" title="اضبط المنبه ${l.label === 'عند الصلاة' ? 'في وقت الصلاة' : l.label}">${l.label}</button>`).join('');
      const tzs = alTz();
      const tzsTxt = (tzs >= 0 ? '+' : '') + alTwo(Math.floor(Math.abs(tzs))) + (Math.abs(tzs) % 1 ? ':30' : ':00');
      return `<div class="al-prow-row">
          <label for="alCity">المدينة</label>
          <select class="al-sel wide" id="alCity" onchange="alSetCity(this.value)">${cities}<option value="مخصص"${AL_CITIES.some(c => c.n === alStore.city) ? '' : ' selected'}>مخصص</option></select>
        </div>
        <div class="al-row">
          <label for="alLat">خط العرض</label>
          <input class="al-num wide" id="alLat" type="number" step="0.01" min="-66" max="66" value="${alStore.lat.toFixed(3)}" onchange="alSetCoords('lat', this.value)" aria-label="خط العرض">
          <label for="alLng">خط الطول</label>
          <input class="al-num wide" id="alLng" type="number" step="0.01" min="-180" max="180" value="${alStore.lng.toFixed(3)}" onchange="alSetCoords('lng', this.value)" aria-label="خط الطول">
        </div>
        <div class="al-row">
          <label for="alTz" title="فرق توقيت مدينتك عن Greenwich — زود ساعة لو عندك توقيت صيفي">التوقيت</label>
          <input class="al-num" id="alTz" type="number" step="0.5" min="-12" max="14" value="${tzs}" onchange="alSetTz(this.value)" aria-label="فرق التوقيت عن UTC">
          <span class="al-unit">UTC ${tzsTxt}</span>
        </div>
        <div class="al-prow-row" style="margin:14px 0 0">
          <label>التنبيه قبل الصلاة</label>
          <span class="al-chips inline" id="alLeadChips">${leadChips}</span>
        </div>
        <div class="al-row" style="margin-top:8px">
          <label>يتكرر كل يوم</label>
          <span class="al-sw${alStore.daily ? ' on' : ''}" id="alDaily" onclick="alSetDaily(!alStore.daily)" onkeydown="if(event.key===' '||event.key==='Enter'){event.preventDefault();alSetDaily(!alStore.daily)}" role="switch" aria-checked="${alStore.daily}" tabindex="0" aria-label="يتكرر كل يوم"></span>
          <span class="al-note" style="margin:0">يعيد الضبط تلقائيًا كل يوم على نفس الصلاة بنفس مقدار التذكير</span>
        </div>
        <div class="al-ptable">${rows}</div>
        <div class="al-row">
          <label for="alFajrAng">الفجر</label>
          <input class="al-num" id="alFajrAng" type="number" step="0.5" min="10" max="22" value="${alStore.fajrAng}" onchange="alSetMethod()" aria-label="زاوية الفجر">
          <span class="al-unit">°</span>
          <label for="alIshaAng">العشاء</label>
          <input class="al-num" id="alIshaAng" type="number" step="0.5" min="10" max="22" value="${alStore.ishaAng}" onchange="alSetMethod()" aria-label="زاوية العشاء">
          <span class="al-unit">°</span>
          <label for="alAsr">العصر</label>
          <select class="al-sel" id="alAsr" onchange="alSetMethod()" aria-label="مذهب العصر">
            <option value="1"${alStore.asr === 1 ? ' selected' : ''}>شافعي</option>
            <option value="2"${alStore.asr === 2 ? ' selected' : ''}>حنفي</option>
          </select>
        </div>
        <div class="al-row">
          <label for="alAllAdj" title="زيّ كل المواقيت معًا عشان تطابق جدول مسجدك">تصحيح عام</label>
          <input class="al-num" id="alAllAdj" type="number" step="1" min="-90" max="90" value="${alStore.allAdj}" onchange="alSetAllAdj(this.value)" aria-label="تصحيح عام بالدقائق">
          <span class="al-unit">د</span>
          <label for="alAsrAdj" title="لو وقت العصر مختلف عندك">العصر</label>
          <input class="al-num" id="alAsrAdj" type="number" step="1" min="-90" max="90" value="${alStore.asrAdj}" onchange="alSetAsrAdj(this.value)" aria-label="تصحيح وقت العصر بالدقائق">
          <span class="al-unit">د</span>
        </div>
        <div class="al-note">محسوبة فلكيًا للمدينة المختارة (الافتراضي القاهرة، زاوية الفجر 19.5° والعشاء 18°). المواقيت بتوقيت مدينتك لا بتوقيت جهازك. <b>قارنها بجدول مسجدك</b> — دار الإفتاء المصرية بتنشر جداول بتوقيت شرعي مختلف عن الزوال الشمسي، استخدم «تصحيح عام» لمطابقتها.</div>`;
    }
    const chips = AL_PRESETS.map(p => {
      const ms = p.m * AL_MIN;
      const on = !alStore.armed && !alStore.ringing && Math.abs(alStore.dur - ms) < 1000;
      return `<button class="al-chip${on ? ' on' : ''}${p.m === 5 ? ' hero' : ''}" onclick="alChipStart(${ms}, 'منبه ${p.label}')" title="ابدأ المنبه ${p.label}">${p.label}</button>`;
    }).join('');
    return `<div class="al-chips">${chips}</div>
      <div class="al-row">
        <label for="alHh">ساعة : دقيقة : ثانية</label>
        <input class="al-num" id="alHh" type="number" min="0" max="23" value="${alStore.h}" inputmode="numeric" oninput="alSetHms()" aria-label="ساعات">
        <input class="al-num" id="alMm" type="number" min="0" max="59" value="${alStore.m}" inputmode="numeric" oninput="alSetHms()" aria-label="دقائق">
        <input class="al-num" id="alSs" type="number" min="0" max="59" value="${alStore.s}" inputmode="numeric" oninput="alSetHms()" aria-label="ثواني">
        <button class="al-btn go" onclick="alStartHms()"><i class="ti ti-player-play"></i> ابدأ</button>
      </div>
      <div class="al-note">الافتراضي <b>5 دقائق</b> من دلوقتي.</div>`;
  }
  function alPanelHtml(){
    const sounds = AL_SOUNDS.map(s => {
      const on = alStore.sound === s.id;
      const bars = s.eq.map(h => '<i style="height:' + h + 'px"></i>').join('');
      return `<button class="al-snd${on ? ' on' : ''}" data-snd="${s.id}" onclick="alSetSound('${s.id}')" title="جرّب: ${s.name}"><span class="al-eq">${bars}</span>${s.name}</button>`;
    }).join('');
    const mBars = [16,7,12,5,16,9,14,6].map(h => '<i style="height:' + h + 'px"></i>').join('');
    const cOn = alStore.sound === AL_CUSTOM_ID;
    const cTile = alStore.custom
      ? `<div class="al-cfile">
           <i class="ti ti-music" aria-hidden="true"></i>
           <span class="al-cname" title="${alStore.custom.name}">${alStore.custom.name}</span>
           <span class="al-val">${Math.round((alStore.custom.data.length * 0.75) / 1024)} ك.ب</span>
           <button class="al-x" onclick="alClearCustom()" title="مسح الصوت المرفوع" aria-label="مسح الصوت المرفوع"><i class="ti ti-x"></i></button>
         </div>`
      : '';
    const ringChips = AL_RING_FOR.map(r => {
      const on = Math.abs(alStore.ringFor - r.m * AL_MIN) < 1000;
      return `<button class="al-chip sm${on ? ' on' : ''}" onclick="alSetRingFor(${r.m * AL_MIN})">${r.label}</button>`;
    }).join('');
    const restChips = AL_REST_FOR.map(r => {
      const on = Math.abs(alStore.restFor - r.s * 1000) < 1000;
      return `<button class="al-chip sm${on ? ' on' : ''}" onclick="alSetRestFor(${r.s * 1000})">${r.label}</button>`;
    }).join('');

    return `<div class="al-grid" id="alPanel">
      <div class="al-col">
        <div class="al-card" id="alRingCard">
          <div class="al-ring">
            <svg width="208" height="208" viewBox="0 0 208 208" aria-hidden="true">
              <circle cx="104" cy="104" r="${AL_R}" fill="none" stroke="var(--border-sub)" stroke-width="10"></circle>
              <circle id="alArc" cx="104" cy="104" r="${AL_R}" fill="none" stroke="#38bdf8" stroke-width="10" stroke-linecap="round"
                      stroke-dasharray="${AL_CIRC.toFixed(2)}" stroke-dashoffset="${AL_CIRC.toFixed(2)}" style="transition:stroke-dashoffset 0.25s linear"></circle>
            </svg>
            <div class="al-ring-txt">
              <div class="al-ring-num" id="alRingNum">00:00</div>
              <div class="al-ring-lbl" id="alRingLbl">مدة المنبه</div>
              <div class="al-ring-cap" id="alRingCap" hidden>ساعة : دقيقة : ثانية</div>
            </div>
          </div>
          <div class="al-state" id="alState">متوقف</div>
          <div class="al-actions">
            <button class="al-btn go" id="alGo" onclick="alGoClick()"><i class="ti ti-player-play"></i> ابدأ المنبه</button>
            <button class="al-btn stop" id="alStopBtn" onclick="alDisarm()"><i class="ti ti-player-stop"></i> إيقاف</button>
          </div>
          <div class="al-actions">
            <button class="al-btn" id="alSnoozeBtn" onclick="alSnooze(5)"><i class="ti ti-clock-hour-4"></i> تأجيل 5 د</button>
            <button class="al-btn" onclick="alTest()"><i class="ti ti-volume"></i> تجربة الصوت</button>
          </div>
        </div>

        <div class="al-card">
          <div class="al-card-title"><i class="ti ti-clock" aria-hidden="true"></i> الساعة الآن</div>
          <div class="al-clock" id="alClock">--:--:-- <b class="al-ap">—</b></div>
          <div class="al-next" id="alNextPrayer"><i class="ti ti-calendar" aria-hidden="true"></i> …</div>
        </div>
      </div>

      <div class="al-col">
        <div class="al-card">
          <div class="al-card-title"><i class="ti ti-target" aria-hidden="true"></i> اضبط المنبه</div>
          ${alSegHtml([['dur','مدة من دلوقتي','ti-timer'], ['time','وقت محدد','ti-clock'], ['sched','جدول','ti-list'], ['prayer','صلاة','ti-moon']])}
          ${alModeHtml()}
        </div>

        <div class="al-card">
          <div class="al-card-title"><i class="ti ti-volume" aria-hidden="true"></i> الصوت — المختار: <span id="alSndLabel">${alSoundLabel()}</span></div>
          <div class="al-sounds" id="alSndGrid">
            <button class="al-snd${alStore.sound === AL_MIX_ID ? ' on' : ''}" data-snd="mix" onclick="alSetSound('mix')" title="كل الأصوات بالتناوب"><span class="al-eq">${mBars}</span>كل الأصوات</button>
            ${sounds}
            <button class="al-snd up${cOn ? ' on' : ''}" data-snd="custom" onclick="alOpenFile()" title="ارفع صوتك (MP3/WAV/OGG) — الحد 2.5 ميجا">
              <i class="ti ti-upload" aria-hidden="true"></i> ${alStore.custom ? 'تغيير الصوتي' : 'صوتي'}
            </button>
          </div>
          <input type="file" id="alFileInput" accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac" style="display:none" onchange="alPickFile(this)">
          ${cTile}
          ${cOn ? `<div class="al-note">الصوت المرفوع بيتكرر طول مدة الرن من أوله لآخره (loop).</div>` : ''}
          <div class="al-row" style="margin-top:14px">
            <label for="alVolRange">مستوى الصوت</label>
            <input class="al-range" id="alVolRange" type="range" min="0" max="100" value="${Math.round(alStore.vol * 100)}" oninput="alSetVol(this.value/100)" aria-label="مستوى الصوت">
            <span class="al-val" id="alVol">${Math.round(alStore.vol * 100)}%</span>
          </div>
        </div>

        <div class="al-card">
          <div class="al-card-title"><i class="ti ti-repeat" aria-hidden="true"></i> نمط الرن — لحد ما تصحى</div>
          <div class="al-row">
            <label>يرن لمدة</label>
            <span class="al-chips inline" id="alRingChips">${ringChips}</span>
          </div>
          <div class="al-row">
            <label>ثم يسكت</label>
            <span class="al-chips inline" id="alRestChips">${restChips}</span>
          </div>
          <div class="al-row">
            <label>يكمّل بلا توقف</label>
            <span class="al-sw${alStore.repeat ? ' on' : ''}" id="alRepeat" onclick="alSetRepeat(!alStore.repeat)" onkeydown="if(event.key===' '||event.key==='Enter'){event.preventDefault();alSetRepeat(!alStore.repeat)}" role="switch" aria-checked="${alStore.repeat}" tabindex="0" aria-label="يكمّل بلا توقف"></span>
            <span class="al-note" style="margin:0" id="alRepNote">${alStore.repeat ? 'يرن ' + alRepTxt(alStore.ringFor) + ' ثم يسكت ' + alRepTxt(alStore.restFor) + ' ويرجع تاني لحد ما تضغط إيقاف.' : 'يرن مرة واحدة بس ' + alRepTxt(alStore.ringFor) + ' ويقف.'}</span>
          </div>
          <div class="al-row">
            <label>إشعارات النظام</label>
            <button class="al-btn" style="flex:0 0 auto;padding:7px 13px" onclick="alAskNotify()"><i class="ti ti-bell"></i> تفعيل</button>
            <span class="al-note" style="margin:0">عشان ينبهك حتى لو كنت في تاب تاني</span>
          </div>
          <div class="al-note">الصفحة لازم تكون مفتوحة — المتصفح بيوقف المؤقتات في التاب المخفي، فبمجرد ما ترجع الصفحة بيرن فورًا لو الوقت عدّى.</div>
        </div>
      </div>
    </div>`;
  }

  function alGoClick(){
    if (alStore.mode === 'sched'){
      if (alStore.armed || alStore.ringing) alDisarm(true);
      alSchedArm();
      return;
    }
    if (alStore.mode === 'prayer'){
      if (alStore.armed || alStore.ringing) alDisarm(true);
      if (alStore.prayer) alArmPrayer(alStore.prayer); else { alSetMode('prayer'); showToast('اختار الصلاة اللي عايزها'); }
      return;
    }
    if (alStore.mode === 'time'){
      if (alStore.armed || alStore.ringing) alDisarm(true);
      alArmClock();
      return;
    }
    if (alStore.armed || alStore.ringing) alDisarm(true);
    alStartHms();
  }
  function alGoToPanel(){
    if (showAlDash) return;
    toggleAlDash();
  }
  function alSyncDash(){
    if (!showAlDash) return;
    const other = showHomeDash || showScrollbarDash ||
                  showEdDash || showDevDash || showB64Dash || showQrDash || showFavDash || showCpDash ||
                  showRtDash || showCssDash;
    if (other){
      showAlDash = false;
      const b = document.getElementById('alDashBtn');
      if (b) b.classList.remove('al-active');
    }
  }
  function toggleAlDash(){
    showAlDash = !showAlDash;
    const btn = document.getElementById('alDashBtn');
    if (btn) btn.classList.toggle('al-active', showAlDash);
    if (showAlDash){
      document.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
      const home = document.getElementById('homeBtn');
      if (home) home.classList.remove('home-active');
      showHomeDash = false; showScrollbarDash = false; showCssDash = false;
      showEdDash = false; showDevDash = false; showB64Dash = false;
      showQrDash = false; showFavDash = false; showCpDash = false; showRtDash = false;
    }
    renderAll();
  }

  function renderAlDash(){
    document.getElementById('mainBody').innerHTML = `<div class="has-dash">
      <div class="al-builder">
        <div class="al-builder-title"><i class="ti ti-alarm" aria-hidden="true"></i> المنبه — ساعة وتنبيه صوتي
          <span>اضغط أي مدة وابدأ فورًا · لو ما قفلتهوش بيرن تاني بأصوات مختلفة لحد ما توقفه</span>
        </div>
        ${alPanelHtml()}
      </div>
    </div>`;
    alPaint();
  }

  // ── Inline color swatches + picker (editor) ──
  const ED_COLOR_SRC = '(?:#(?:[0-9a-fA-F]{3,8})|(?:rgb|rgba|hsl|hsla)\\(\\s*(?:[0-9.%,/\\s-])+\\s*\\))';
  let edColTokens = [];
  let edColActive = false;
  let edColTarget = null;
  let edColSnap = '';
  let edColInit = false;
  let edPopColor = { r: 0, g: 0, b: 0, a: 1 };

  function edMeasureHost(){
    let el = document.getElementById('edMeasureHost');
    if (!el){
      el = document.createElement('div');
      el.id = 'edMeasureHost';
      el.setAttribute('aria-hidden','true');
      el.style.position = 'fixed'; el.style.left = '-99999px'; el.style.top = '0';
      el.style.visibility = 'hidden'; el.style.pointerEvents = 'none';
      el.style.whiteSpace = 'pre';
      document.body.appendChild(el);
    }
    return el;
  }

  function edBuildColors(){
    const input = document.getElementById('edInput');
    const layer = document.getElementById('edColLayer');
    edColTokens = [];
    if (!input || !layer) return;
    const raw = input.value;
    if (!raw.trim()){ layer.innerHTML = ''; return; }
    const cs = window.getComputedStyle(input);
    const host = edMeasureHost();
    host.style.width = input.clientWidth + 'px';
    host.style.padding = '12px 14px';
    host.style.fontFamily = cs.fontFamily;
    host.style.fontSize = cs.fontSize;
    host.style.lineHeight = cs.lineHeight;
    host.style.direction = edView.dir;
    host.style.textAlign = edView.align;
    host.style.tabSize = '2';
    host.style.letterSpacing = cs.letterSpacing;

    const cands = [];
    const re = new RegExp(ED_COLOR_SRC, 'g');
    let mm;
    while ((mm = re.exec(raw))) cands.push(mm);
    const tokens = cands.filter(x => edParseColor(x[0]));

    let html = '', last = 0;
    for (let k = 0; k < tokens.length; k++){
      const tk = tokens[k];
      html += escHtml(raw.slice(last, tk.index)) + '<span class="m">' + escHtml(tk[0]) + '</span>';
      edColTokens.push({ from: tk.index, to: tk.index + tk[0].length, text: tk[0] });
      last = tk.index + tk[0].length;
    }
    html += escHtml(raw.slice(last));
    host.innerHTML = html;
    const spans = host.querySelectorAll('span.m');
    for (let k = 0; k < spans.length && k < edColTokens.length; k++){
      edColTokens[k].offL = spans[k].offsetLeft;
      edColTokens[k].offT = spans[k].offsetTop;
      edColTokens[k].offW = spans[k].offsetWidth;
      edColTokens[k].lineH = spans[k].offsetHeight;
    }
    layer.innerHTML = edColTokens.map((t, k) =>
      '<button type="button" class="ed-csw" data-i="' + k + '"'
      + ' title="' + escHtml(t.text) + '" aria-label="تغيير اللون ' + escHtml(t.text) + '"'
      + ' onmousedown="event.preventDefault();event.stopPropagation()"'
      + ' onclick="edOpenColor(' + k + ',event)"'
      + ' style="background:' + edSafeColor(t.text) + '"></button>'
    ).join('');
    edPlaceColors();
  }

  function edSafeColor(text){
    const p = edParseColor(text);
    if (p) return 'rgba(' + Math.round(p.r) + ',' + Math.round(p.g) + ',' + Math.round(p.b) + ',' + p.a + ')';
    return 'transparent';
  }

  function edPlaceColors(){
    const input = document.getElementById('edInput');
    const layer = document.getElementById('edColLayer');
    if (!input || !layer) return;
    const sl = input.scrollLeft, st = input.scrollTop;
    const btns = layer.querySelectorAll('.ed-csw');
    for (let k = 0; k < btns.length && k < edColTokens.length; k++){
      const t = edColTokens[k];
      const b = btns[k];
      const w = 15, gap = 7;
      let left = t.offL - sl;
      if (edView.dir === 'rtl') left = left - gap - w;
      else left = left + t.offW + gap;
      const top = t.offT - st + ((t.lineH || 20) - w) / 2;
      b.style.left = left + 'px';
      b.style.top = top + 'px';
      b.classList.toggle('hidden', top < -30 || top > layer.clientHeight || left < -40 || left > layer.clientWidth);
    }
  }

  function edParseColor(text){
    const s = String(text || '').trim();
    let m;
    if ((m = s.match(/^#([0-9a-fA-F]{3,8})$/))){
      let h = m[1], r, g, b, a = 1;
      if (h.length === 3 || h.length === 4){
        r = parseInt(h[0] + h[0], 16); g = parseInt(h[1] + h[1], 16); b = parseInt(h[2] + h[2], 16);
        if (h.length === 4) a = parseInt(h[3] + h[3], 16) / 255;
      } else {
        r = parseInt(h.slice(0,2), 16); g = parseInt(h.slice(2,4), 16); b = parseInt(h.slice(4,6), 16);
        if (h.length === 8) a = parseInt(h.slice(6,8), 16) / 255;
      }
      return { r, g, b, a };
    }
    if ((m = s.match(/^(rgba?|hsla?)\(([\s\S]*?)\)$/i))){
      const fn = m[1].toLowerCase();
      const body = m[2];
      let alpha = 1;
      let core = body;
      const splitSlash = body.split('/');
      if (splitSlash.length > 1){
        core = splitSlash[0];
        const av = splitSlash[1].trim();
        alpha = parseFloat(av.replace('%','')) / (av.includes('%') ? 100 : 1);
      }
      const nums = core.split(/[,\s]+/).filter(Boolean).map(v => parseFloat(v));
      if (!nums.length) return null;
      if ((fn === 'rgba' || fn === 'hsla') && nums.length >= 4 && splitSlash.length === 1) alpha = nums[3];
      if (fn === 'rgb' || fn === 'rgba'){
        if (nums.length < 3) return null;
        let r = nums[0], g = nums[1], b = nums[2];
        if (body.includes('%')){ r = r / 100 * 255; g = g / 100 * 255; b = b / 100 * 255; }
        return {
          r: Math.round(Math.min(255, Math.max(0, r))),
          g: Math.round(Math.min(255, Math.max(0, g))),
          b: Math.round(Math.min(255, Math.max(0, b))),
          a: Math.max(0, Math.min(1, isNaN(alpha) ? 1 : alpha))
        };
      }
      if (fn === 'hsl' || fn === 'hsla'){
        if (nums.length < 3) return null;
        const h = ((nums[0] % 360) + 360) % 360;
        const sat = Math.max(0, Math.min(100, isNaN(nums[1]) ? 0 : nums[1])) / 100;
        const lig = Math.max(0, Math.min(100, isNaN(nums[2]) ? 0 : nums[2])) / 100;
        const { r, g, b } = edHslToRgb(h, sat, lig);
        return { r, g, b, a: Math.max(0, Math.min(1, isNaN(alpha) ? 1 : alpha)) };
      }
    }
    return null;
  }

  function edHslToRgb(h, s, l){
    if (s === 0){ const v = Math.round(l * 255); return { r: v, g: v, b: v }; }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue = h / 360;
    const f = t => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    return {
      r: Math.round(f(hue + 1 / 3) * 255),
      g: Math.round(f(hue) * 255),
      b: Math.round(f(hue - 1 / 3) * 255)
    };
  }

  function edRgbToHex(col){
    const R = Math.round(Math.min(255, Math.max(0, col.r)));
    const G = Math.round(Math.min(255, Math.max(0, col.g)));
    const B = Math.round(Math.min(255, Math.max(0, col.b)));
    if (col.a >= 0.999) return '#' + [R, G, B].map(v => v.toString(16).padStart(2, '0')).join('');
    const A = Math.round(Math.max(0, Math.min(1, col.a)) * 1000) / 1000;
    return 'rgba(' + R + ', ' + G + ', ' + B + ', ' + A + ')';
  }

  function edPopRender(){
    const c = edPopColor;
    const rEl = document.getElementById('ecpR'), gEl = document.getElementById('ecpG');
    const bEl = document.getElementById('ecpB'), aEl = document.getElementById('ecpA');
    const hexEl = document.getElementById('ecpHex'), nativeEl = document.getElementById('ecpNative');
    const aVal = document.getElementById('ecpAVal'), sw = document.getElementById('ecpSw');
    if (rEl) rEl.value = c.r;
    if (gEl) gEl.value = c.g;
    if (bEl) bEl.value = c.b;
    if (aEl) aEl.value = Math.round(c.a * 100);
    if (aVal) aVal.textContent = Math.round(c.a * 100) + '%';
    if (hexEl) hexEl.value = edRgbToHex({ r: c.r, g: c.g, b: c.b, a: 1 });
    if (nativeEl) nativeEl.value = edRgbToHex({ r: c.r, g: c.g, b: c.b, a: 1 });
    if (sw) sw.style.background = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + c.a + ')';
  }

  function edOpenColor(k, ev){
    const input = document.getElementById('edInput');
    if (!input || !edColTokens[k]) return;
    const t = edColTokens[k];
    if (input.value.slice(t.from, t.to) !== t.text){
      edBuildColors();
      if (!edColTokens[k]) return;
      return;
    }
    edColTarget = t;
    edColSnap = input.value;
    const p = edParseColor(t.text);
    edPopColor = p || { r: 0, g: 0, b: 0, a: 1 };
    edColorInit();
    const pop = document.getElementById('edColorPop');
    if (!pop) return;
    edPopRender();
    pop.classList.add('open');
    pop.setAttribute('aria-hidden', 'false');
    edColActive = true;
    const btn = ev && ev.currentTarget;
    const r = btn ? btn.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
    pop.style.left = '0px'; pop.style.top = '0px';
    const pw = pop.offsetWidth, ph = pop.offsetHeight;
    let left = r.left + r.width / 2 - pw / 2;
    let top = r.bottom + 8;
    if (left < 8) left = 8;
    if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;
    if (top + ph > window.innerHeight - 8) top = r.top - ph - 8;
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
    const hexEl = document.getElementById('ecpHex');
    if (hexEl){ hexEl.focus(); hexEl.select(); }
  }

  function edCloseColor(){
    const pop = document.getElementById('edColorPop');
    if (pop && pop.classList.contains('open')) pop.classList.remove('open');
    if (pop) pop.setAttribute('aria-hidden', 'true');
    edColActive = false;
    edColTarget = null;
  }

  function edPopLive(){
    const input = document.getElementById('edInput');
    if (!input || !edColTarget) return;
    const t = edColTarget;
    let val = input.value;
    if (val !== edColSnap){
      const idx = val.indexOf(t.text, Math.max(0, t.from - 300));
      if (idx === -1) return;
      t.from = idx; t.to = idx + t.text.length;
    }
    const out = edRgbToHex(edPopColor);
    if (out === val.slice(t.from, t.to)) return;
    val = val.slice(0, t.from) + out + val.slice(t.to);
    input.value = val;
    t.text = out;
    t.to = t.from + out.length;
    edColSnap = val;
    const sn = activeVdSnippet();
    sn.draft = val;
    saveVd();
    edSync();
    edStatus();
  }

  function edColorInit(){
    if (edColInit) return;
    edColInit = true;
    const pop = document.getElementById('edColorPop');
    if (!pop) return;
    const q = id => pop.querySelector('#' + id);
    const nativeEl = q('ecpNative'), hexEl = q('ecpHex');
    const rEl = q('ecpR'), gEl = q('ecpG'), bEl = q('ecpB'), aEl = q('ecpA');
    nativeEl.addEventListener('input', () => {
      const p = edParseColor(nativeEl.value);
      if (p){ edPopColor = { r: p.r, g: p.g, b: p.b, a: 1 }; edPopRender(); edPopLive(); }
    });
    hexEl.addEventListener('input', () => {
      const p = edParseColor(hexEl.value);
      if (p){ edPopColor = { r: p.r, g: p.g, b: p.b, a: p.a }; edPopRender(); edPopLive(); }
    });
    hexEl.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); edCloseColor(); } });
    [[rEl, 'r'], [gEl, 'g'], [bEl, 'b']].forEach(pair => {
      pair[0].addEventListener('input', () => {
        edPopColor[pair[1]] = Math.min(255, Math.max(0, parseInt(pair[0].value, 10) || 0));
        edPopRender(); edPopLive();
      });
    });
    aEl.addEventListener('input', () => {
      edPopColor.a = (parseInt(aEl.value, 10) || 100) / 100;
      edPopRender(); edPopLive();
    });
    q('ecpOk').addEventListener('click', () => edCloseColor());
    document.addEventListener('click', e => {
      if (!edColActive) return;
      if (pop.contains(e.target)) return;
      if (e.target.closest && e.target.closest('.ed-csw')) return;
      edCloseColor();
    });
    document.addEventListener('keydown', e => {
      if (edColActive && e.key === 'Escape') edCloseColor();
    });
  }

  const ED_ICONS = {
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    compare: '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    restore: '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
    open: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    alignRight: '<line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/>',
    alignCenter: '<line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/>',
    alignLeft: '<line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/>',
    fontPlus: '<path d="M4 7h10M4 12h7M4 17h9"/><path d="M17 8v6M14 11h6"/>',
    fontMinus: '<path d="M4 7h10M4 12h7M4 17h9"/><path d="M14 11h6"/>',
    find: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
    close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    prev: '<path d="M15 19l-7-7 7-7"/>',
    next: '<path d="M9 5l7 7-7 7"/>',
    replace: '<path d="M3 12l4-4v3h10V8l4 4-4 4v-3H7v3l-4-4z" transform="translate(0 1)"/><path d="M21 12l-4 4v-3H7v3l-4-4 4-4v3h10V8l4 4z" transform="translate(0 -1)"/>',
    replaceAll: '<path d="M3 8l4-4v3h8V4l4 4-4 4v-3H7v3l-4-4z"/><path d="M21 16l-4-4v3H9v-3l-4 4 4 4v-3h8v3l4-4z"/>'
  };
  function svgIcon(name, size){
    const s = size || 17;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ED_ICONS[name] || '') + '</svg>';
  }

  function edCompareAdd(){
    edSub = 'edit';
    newVdSnippet();
    saveVd();
    renderAll();
    inlineRenameSnippet();
  }

  function edCompareHtml(sn){
    const boxOpts = vdStore.snippets.map(s=>`<option value="${s.id}"${s.id===sn.id?' selected':''}>${escHtml(s.name)} (${s.versions.length})</option>`).join('');
    let versionsHtml;
    if(sn.versions.length){
      const lastId = sn.versions[sn.versions.length-1].id;
      versionsHtml = sn.versions.map(v=>{
        const lines = v.content.split('\n').length;
        const t = new Date(v.time);
        const timeStr = t.toLocaleDateString('ar-EG',{day:'2-digit',month:'2-digit'})+' '+t.toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
        const isBase = sn.baseId === v.id;
        const isLast = v.id === lastId;
        return `<div class="vd-version">
          <label class="vd-base" title="${isLast?'النسخة الأحدث لا تصلح كقاعدة للمقارنة':'اضغط لتجعل هذه النسخة هي «قاعدة» المقارنة تلقائيًا'}">
            <input type="radio" name="vdBase_${sn.id}"${isBase?' checked':''}${isLast?' disabled':''} onchange="vdSetBase('${v.id}')">
            <span class="vd-base-radio"></span>
            <span class="vd-base-label">قاعدة</span>
          </label>
          <span class="vd-vnum">V${v.n}</span>
          <div class="vd-vmeta">
            <span class="vd-vtime">${timeStr}</span>
            <span class="vd-vinfo">${lines} سطر</span>
          </div>
          <div class="vd-vactions">
            <button class="vd-mini-btn vd-restore" onclick="vdRestore('${v.id}')" title="استرجاع للمحرر"><i class="ti ti-corner-up-left"></i> استرجاع</button>
            <button class="vd-mini-btn" onclick="vdOpen('${v.id}')" title="فتح النسخة في صفحة جديدة"><i class="ti ti-external-link"></i> فتح</button>
            <button class="vd-mini-btn" onclick="vdDownload('${v.id}')" title="تحميل الكود كملف txt"><i class="ti ti-download"></i> تحميل</button>
            <button class="vd-mini-btn" onclick="vdCopy('${v.id}')" title="نسخ"><i class="ti ti-copy"></i> نسخ</button>
            <button class="vd-mini-btn vd-del" onclick="vdDelete('${v.id}')" title="حذف النسخة"><i class="ti ti-trash"></i> حذف</button>
          </div>
        </div>`;
      }).join('');
    }else{
      versionsHtml = `<div class="vd-empty"><i class="ti ti-history"></i><p>لا توجد نسخ محفوظة بعد — ارجع للتحرير والصق كودك (اللصق يحفظ نسخة تلقائيًا) أو اضغط «حفظ نسخة» بالأسفل</p></div>`;
    }
    const base = resolveVdBase(sn);
    const latest = sn.versions[sn.versions.length-1];
    const cur = (sn.draft && sn.draft.trim()) ? sn.draft : '';
    const ref = base || latest;
    let autoHtml;
    if(ref && cur && cur !== ref.content){
      autoHtml = vdDiffHTML(ref.content, cur, 'V'+ref.n+((base && ref.id===base.id)?' (القاعدة)':' (الأحدث)'), 'المحرر (الحالي)');
    }else if(ref && latest && base && base.id !== latest.id){
      autoHtml = vdDiffHTML(base.content, latest.content, 'V'+base.n+' (القاعدة)', 'V'+latest.n+' (الأحدث)');
    }else if(ref && latest){
      autoHtml = '<div class="vd-empty"><i class="ti ti-check"></i><p>المحتوى الحالي مطابق لآخر نسخة محفوظة — لا فروق</p></div>';
    }else{
      autoHtml = '<div class="vd-empty"><i class="ti ti-git-compare"></i><p>احفظ نسخة أولاً ثم عدّل في المحرر لتظهر الفروق هنا تلقائيًا — الأخضر مضاف، الأحمر محذوف</p></div>';
    }
    return `<div class="vd-section-title" style="margin-top:0"><i class="ti ti-git-compare" style="color:var(--success)"></i> النسخ والمقارنة — «${escHtml(sn.name)}» <span>(${sn.versions.length})</span>
      <span class="vd-legend"><span class="vd-dot" style="background:#22c55e"></span> مضاف</span>
      <span class="vd-legend"><span class="vd-dot" style="background:#ef4444"></span> محذوف</span></div>
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap">
      <select class="form-select" onchange="edSelectSnippet(this.value)" style="max-width:250px" title="المربع النشط">${boxOpts}</select>
      <button class="btn-cancel" onclick="edCompareAdd()"><i class="ti ti-plus"></i> مربع جديد</button>
    </div>
    <div class="vd-versions">${versionsHtml}</div>
    <div class="vd-actions" style="margin-top:12px">
      <button class="btn-primary" onclick="if(edSaveVersion())renderAll()"><i class="ti ti-plus"></i> حفظ نسخة من الحالي</button>
      <button class="btn-cancel" onclick="edCopyAll()"><i class="ti ti-copy"></i> نسخ المحتوى الحالي</button>
      <button class="btn-cancel" onclick="edDownload()"><i class="ti ti-download"></i> تحميل</button>
    </div>
    <div class="vd-compare" style="margin-top:14px">
      <div class="vd-section-title" style="margin-top:0"><i class="ti ti-arrows-left-right" style="color:var(--accent-cool)"></i> مقارنة مخصصة
        <button class="vd-mini-btn" onclick="vdToggleCustomCompare()" id="vdCustomToggleBtn" style="margin-inline-start:auto"><i class="ti ti-arrows-left-right"></i> إظهار</button></div>
      <div id="vdAutoCompareOut">${autoHtml}</div>
      <div id="vdCustomCompare" style="display:none">
        <div class="vd-compare-row" style="margin-top:12px">
          <div class="form-group">
            <label class="form-label">النسخة القديمة (قبل)</label>
            <select class="form-select" id="vdOldSel"></select>
          </div>
          <div class="form-group">
            <label class="form-label">النسخة الجديدة (بعد)</label>
            <select class="form-select" id="vdNewSel"></select>
          </div>
          <button class="btn-primary" onclick="vdRunCompare()"><i class="ti ti-arrows-left-right"></i> عرض الفرق</button>
        </div>
        <div id="vdCustomOut"></div>
      </div>
    </div>`;
  }

  function renderEdDash(){
    const sn = activeVdSnippet();
    const totalVersions = vdStore.snippets.reduce((a, s) => a + s.versions.length, 0);
    document.getElementById('countBadge').textContent = totalVersions + ' نسخة · محرر';

    const tabsHtml = vdStore.snippets.map(s => `
      <div class="vd-tab${s.id === sn.id ? ' active' : ''}" onclick="edSelectSnippet('${s.id}')">
        <span style="display:inline-flex;color:var(--accent-warm)">${svgIcon('file', 14)}</span>
        <span class="vd-tab-name" onclick="event.stopPropagation(); renameSnippetOnClick('${s.id}')" title="اضغط لتعديل الاسم">${escHtml(s.name)}</span>
        <span class="vd-tab-num">${s.versions.length}</span>
        <button class="vd-tab-del" onclick="event.stopPropagation(); vdDeleteSnippet('${s.id}')" title="حذف المربع" aria-label="حذف المربع">${svgIcon('trash', 12)}</button>
      </div>`).join('') + `
      <div class="vd-tab vd-tab-add" onclick="edAddSnippet()"><span style="display:inline-flex">${svgIcon('plus', 13)}</span> جديد</div>`;

    document.getElementById('mainBody').innerHTML = `<div class="has-dash">
      <div class="ed-builder">
        <div class="ed-builder-title"><span style="display:inline-flex;color:#38bdf8">${svgIcon('code', 18)}</span> محرر الأكواد — تعديل سريع
          <span>كود ملون ومرقّم الأسطر — أي لصق أو حفظ ينشئ نسخة، وقارن القديم بالجديد من تبويب «النسخ والمقارنة»</span>
        </div>

        <div class="vd-section-title" style="margin-top:0"><i class="ti ti-folders" style="color:var(--accent-warm)"></i> المربعات (السنيبتات)</div>
        <div class="vd-tabs">${tabsHtml}</div>

        <div style="display:flex;margin:2px 0 12px"><div class="cb-seg" title="عرض المحرر">
          <button class="cb-btn${edSub==='edit'?' on':''}" onclick="edSetSub('edit')"><i class="ti ti-code" aria-hidden="true"></i> تحرير</button>
          <button class="cb-btn${edSub==='compare'?' on':''}" onclick="edSetSub('compare')"><i class="ti ti-git-compare" aria-hidden="true"></i> النسخ والمقارنة (${sn.versions.length})</button>
        </div></div>

        ${edSub === 'compare' ? edCompareHtml(sn) : `<div class="ed-toolbar">
          <span class="ed-file"><span style="display:inline-flex;color:#38bdf8">${svgIcon('file', 15)}</span> ${escHtml(sn.name)}</span>
          <div class="ed-tools" role="toolbar" aria-label="أدوات التحرير">
            <button class="ed-ibtn" data-align="right" onclick="edSetAlign('right')" title="محاذاة لليمين" aria-label="محاذاة لليمين">${svgIcon('alignRight')}</button>
            <button class="ed-ibtn" data-align="center" onclick="edSetAlign('center')" title="توسيط" aria-label="توسيط">${svgIcon('alignCenter')}</button>
            <button class="ed-ibtn" data-align="left" onclick="edSetAlign('left')" title="محاذاة لليسار" aria-label="محاذاة لليسار">${svgIcon('alignLeft')}</button>
            <span class="ed-tools-sep"></span>
            <button class="ed-ibtn" data-dir="rtl" onclick="edSetDir('rtl')" title="اتجاه النص من اليمين لليسار" aria-label="اتجاه RTL"><span class="ed-btn-txt">RTL</span></button>
            <button class="ed-ibtn" data-dir="ltr" onclick="edSetDir('ltr')" title="اتجاه النص من اليسار لليمين" aria-label="اتجاه LTR"><span class="ed-btn-txt">LTR</span></button>
            <span class="ed-tools-sep"></span>
            <button class="ed-ibtn" onclick="edFontSize(1)" title="تكبير الخط" aria-label="تكبير الخط">${svgIcon('fontPlus')}</button>
            <button class="ed-ibtn" onclick="edFontSize(-1)" title="تصغير الخط" aria-label="تصغير الخط">${svgIcon('fontMinus')}</button>
            <button class="ed-ibtn" onclick="edFontReset()" title="إعادة ضبط حجم الخط" aria-label="إعادة ضبط حجم الخط">${svgIcon('restore')}</button>
            <span class="ed-font-val" id="edFontVal"></span>
            <span class="ed-tools-sep"></span>
            <button class="ed-ibtn" id="edFindBtn" onclick="edOpenFindBox()" title="بحث واستبدال (Ctrl+F)" aria-label="بحث واستبدال">${svgIcon('find')}</button>
          </div>
          <div class="ed-toolbar-actions">
            <button class="ed-ibtn primary" onclick="edSaveVersion()" title="حفظ نسخة (Ctrl+S)" aria-label="حفظ نسخة">${svgIcon('save')}</button>
            <button class="ed-ibtn" onclick="goToVd()" title="النسخ والمقارنة" aria-label="النسخ والمقارنة">${svgIcon('compare')}</button>
            <button class="ed-ibtn" onclick="edCopyAll()" title="نسخ الكل" aria-label="نسخ الكل">${svgIcon('copy')}</button>
            <button class="ed-ibtn" onclick="edDownload()" title="تحميل كملف txt" aria-label="تحميل">${svgIcon('download')}</button>
            <button class="ed-ibtn danger" onclick="vdDeleteSnippet()" title="حذف المربع الحالي" aria-label="حذف المربع الحالي">${svgIcon('trash')}</button>
          </div>
        </div>

        <div class="ed-wrap" id="edWrap">
          <div class="ed-gutter" id="edGutter"></div>
          <div class="ed-body">
            <pre class="ed-find-layer" id="edFindLayer" aria-hidden="true"></pre>
            <pre class="ed-highlight" id="edHigh"></pre>
            <textarea class="ed-input" id="edInput" spellcheck="false" wrap="off" placeholder="/* الصق أو اكتب الكود هنا... */"></textarea>
            <div class="ed-col-layer" id="edColLayer"></div>
            <!-- EDITOR FIND & REPLACE BOX -->
            <div class="ed-find-box" id="edFindBox" style="display:none;">
              <div class="ed-find-header">
                <span style="display:inline-flex">${svgIcon('find', 15)}</span>
                <span>البحث والاستبدال</span>
                <button class="ed-find-close" onclick="edCloseFindBox()" title="إغلاق البحث (Esc)" aria-label="إغلاق">${svgIcon('close', 14)}</button>
              </div>
              <input class="ed-find-input" id="edFindInput" type="text" placeholder="البحث..." spellcheck="false">
              <div class="ed-find-row">
                <span class="ed-find-stats" id="edFindStats"></span>
                <div class="ed-find-nav">
                  <button class="ed-find-btn" id="edFindPrev" onclick="edFindPrevious()" title="السابق (Shift+Enter)" aria-label="السابق">${svgIcon('prev', 16)}</button>
                  <button class="ed-find-btn" id="edFindNext" onclick="edFindNext()" title="التالي (Enter)" aria-label="التالي">${svgIcon('next', 16)}</button>
                </div>
              </div>
              <div class="ed-find-toggles">
                <label class="ed-find-toggle" title="حساس لحالة الأحرف">
                  <input type="checkbox" id="edFindCase" onchange="edPerformFind()">
                  <span>Aa</span>
                </label>
                <label class="ed-find-toggle" title="كلمة كاملة فقط">
                  <input type="checkbox" id="edFindWord" onchange="edPerformFind()">
                  <span>كلمة</span>
                </label>
                <label class="ed-find-toggle" title="تعبير نمطي">
                  <input type="checkbox" id="edFindRegex" onchange="edPerformFind()">
                  <span>.*</span>
                </label>
              </div>
              <input class="ed-find-input" id="edReplaceInput" type="text" placeholder="استبدل ب..." spellcheck="false">
              <div class="ed-find-row">
                <button class="ed-find-btn" id="edReplaceSingle" onclick="edReplaceSingle()" title="استبدال الحالي" aria-label="استبدال">${svgIcon('replace', 16)}</button>
                <button class="ed-find-btn" id="edReplaceAll" onclick="edReplaceAll()" title="استبدال الكل" aria-label="استبدال الكل" style="background:#38bdf8;color:#0e0e10;border-color:#38bdf8">${svgIcon('replaceAll', 16)}</button>
              </div>
            </div>
          </div>
          </div>
        </div>

        <div class="ed-status">
          <span id="edPos">السطر 1 · العمود 1</span>
          <span id="edCount">0 حرف</span>
          <span style="margin-inline-start:auto;color:var(--text-3)"><span style="display:inline-flex">${svgIcon('clipboard', 13)}</span> لصق = نسخة تلقائيًا · Ctrl+S = حفظ</span>
        </div>
      </div>`}
    </div>`;

    const input = document.getElementById('edInput');
    if (input) {
      input.value = sn.draft || '';
      edSync();
      edStatus();
      edApplyView();
      input.addEventListener('input', () => {
        if (edColActive) edCloseColor();
        const s = activeVdSnippet();
        s.draft = input.value;
        saveVd();
        edSync();
        edStatus();
        const _fb = document.getElementById('edFindBox');
        if (_fb && _fb.style.display !== 'none' && edFindQuery) edPerformFind();
      });
      input.addEventListener('scroll', () => {
        const pre = document.getElementById('edHigh');
        const gut = document.getElementById('edGutter');
        const fl  = document.getElementById('edFindLayer');
        if (pre) { pre.scrollTop = input.scrollTop; pre.scrollLeft = input.scrollLeft; }
        if (gut) gut.scrollTop = input.scrollTop;
        if (fl) { fl.scrollTop = input.scrollTop; fl.scrollLeft = input.scrollLeft; }
        edPlaceColors();
      });
      input.addEventListener('keydown', e => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const st = input.selectionStart, en = input.selectionEnd;
          input.value = input.value.slice(0, st) + '  ' + input.value.slice(en);
          input.selectionStart = input.selectionEnd = st + 2;
          input.dispatchEvent(new Event('input'));
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); edSaveVersion(); }
      });
      input.addEventListener('paste', () => {
        setTimeout(() => edSaveVersion({ silent: true }), 0);
      });
      input.addEventListener('keyup', edStatus);
      input.addEventListener('click', edStatus);
      input.focus();
    }
    edFindBound = false;
    edFindMatches = [];
    edFindIndex = -1;
    edInitFindBox();
    if(edSub === 'compare') fillVdCompareSelects(sn);
    document.querySelectorAll('.code-pre').forEach(el => el.classList.toggle('wrap', wrapMode));
  }

