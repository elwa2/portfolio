  // ── CSS STUDIO (imgscr + :has() — تبويبان علويان في استوديو التصميم) ──
  let showCssDash = false;
  let cssTab = 'cv';
  try {
    const savedTab = localStorage.getItem('csman_v2_css_tab_v1');
    if(savedTab === 'has' || savedTab === 'cv') cssTab = savedTab;
  } catch(e){}
  function cssSaveTab(){ try { localStorage.setItem('csman_v2_css_tab_v1', cssTab); } catch(e){} }
  function cssSetTab(t){
    cssTab = (t === 'has') ? 'has' : 'cv';
    cssSaveTab();
    renderAll();
  }
  function cssActivate(tab){
    cssTab = (tab === 'has') ? 'has' : 'cv';
    cssSaveTab();
    showCssDash = true;
    const cb = document.getElementById('cssDashBtn');
    if(cb) cb.classList.toggle('css-active', true);
    document.querySelectorAll('.filter-tag:not(#cssDashBtn)').forEach(b=>b.classList.remove('active'));
    showHomeDash = false;
    const hb = document.getElementById('homeBtn');
    if(hb) hb.classList.remove('home-active');
    showScrollbarDash = false;
    const sb = document.getElementById('sbDashBtn');
    if(sb) sb.classList.remove('scrollbar-active');
    showEdDash = false;
    const ed = document.getElementById('edDashBtn');
    if(ed) ed.classList.remove('ed-active');
    showDevDash = false;
    const dv = document.getElementById('devDashBtn');
    if(dv) dv.classList.remove('dev-active');
    showB64Dash = false;
    const b6 = document.getElementById('b64DashBtn');
    if(b6) b6.classList.remove('b64-active');
    showQrDash = false;
    const qr = document.getElementById('qrDashBtn');
    if(qr) qr.classList.remove('qr-active');
    showCpDash = false;
    const cp = document.getElementById('cpDashBtn');
    if(cp) cp.classList.remove('cp-active');
    showRtDash = false;
    const rt = document.getElementById('rtDashBtn');
    if(rt) rt.classList.remove('rt-active');
    renderAll();
  }
  function cssOpenCv(){ cssActivate('cv'); }
  function cssOpenHas(){ cssActivate('has'); }
  function toggleCssDash(){
    showCssDash = !showCssDash;
    document.getElementById('cssDashBtn').classList.toggle('css-active', showCssDash);
    if(showCssDash){
      document.querySelectorAll('.filter-tag:not(#cssDashBtn)').forEach(b=>b.classList.remove('active'));
      showHomeDash = false;
      document.getElementById('homeBtn').classList.remove('home-active');
      showScrollbarDash = false;
      document.getElementById('sbDashBtn').classList.remove('scrollbar-active');
      showEdDash = false;
      document.getElementById('edDashBtn').classList.remove('ed-active');
      showDevDash = false;
      document.getElementById('devDashBtn').classList.remove('dev-active');
      showB64Dash = false;
      document.getElementById('b64DashBtn').classList.remove('b64-active');
      showQrDash = false;
      document.getElementById('qrDashBtn').classList.remove('qr-active');
      showCpDash = false;
      document.getElementById('cpDashBtn').classList.remove('cp-active');
      showRtDash = false;
      document.getElementById('rtDashBtn').classList.remove('rt-active');
    }
    renderAll();
  }
  function renderCssDash(){
    document.getElementById('mainBody').innerHTML = `<div class="has-dash">${designHero(cssTab)}
      <div id="cssStudioBody"></div>
    </div>`;
    if(cssTab === 'has') renderHasDashboard('cssStudioBody');
    else renderCvDash('cssStudioBody');
    document.getElementById('countBadge').textContent = cssTab === 'has'
      ? (DATA.filter(s=>s.tags.includes('has')).length + ' :has()')
      : 'imgscr الأكواد';
  }

  function saveHasSnippet(){
    const name   = document.getElementById('hasName').value.trim();
    const parent = document.getElementById('hasParent').value.trim();
    const target = document.getElementById('hasTarget').value.trim();
    const cond   = document.getElementById('hasCondition').value.trim();

    if(!cond){ showToast('الرجاء إدخال شرط :has()'); return; }

    let full = '';
    if(parent) full += parent + ' ';
    if(target) full += target + ' ';
    full += ':has(' + cond + ')';

    const id = 'has_' + Date.now();
    DATA.unshift({
      id, title: name || full.substring(0, 55) + '...',
      tags: ['has', 'css'],
      desc: ':has() selector' + (parent ? ' — ' + parent : ''),
      codes: [{ lang: 'CSS', code: full }]
    });
    openIds.add(id);
    if (typeof saveUserOverlay === 'function') saveUserOverlay();
    document.getElementById('hasName').value = '';
    document.getElementById('hasParent').value = '';
    document.getElementById('hasTarget').value = '';
    document.getElementById('hasCondition').value = '';
    renderAll();
    showToast('تم حفظ المحدد!');
  }

  function copyHasPreview(){
    const parent = document.getElementById('hasParent').value.trim();
    const target = document.getElementById('hasTarget').value.trim();
    const cond   = document.getElementById('hasCondition').value.trim();
    if(!cond){ showToast('أدخل شرط :has() أولاً'); return; }
    let full = '';
    if(parent) full += parent + ' ';
    if(target) full += target + ' ';
    full += ':has(' + cond + ')';
    navigator.clipboard.writeText(full).then(() => {
      showToast('تم نسخ المحدد!');
      const btn = document.getElementById('hasCopyPreviewBtn');
      btn.innerHTML = '<i class="ti ti-check"></i> تم';
      setTimeout(()=>{ btn.innerHTML = '<i class="ti ti-copy"></i> نسخ'; }, 1500);
    }).catch(()=>showToast('تعذّر النسخ'));
  }

  function updateHasPreview(){
    const parent = document.getElementById('hasParent').value.trim();
    const target = document.getElementById('hasTarget').value.trim();
    const cond   = document.getElementById('hasCondition').value.trim();
    const preview = document.getElementById('hasPreview');

    let html = '';
    if(parent) html += '<span class="has-base-part">' + escHtml(parent) + '</span> ';
    if(target) html += '<span class="has-base-part">' + escHtml(target) + '</span> ';
    if(cond) html += '<span class="has-has-part">:has(' + escHtml(cond) + ')</span>';
    preview.innerHTML = html || '<span style="color:var(--text-3)">... سيظهر المحدد هنا</span>';
  }

  function renderHasDashboard(targetId){
    const hasItems = DATA.filter(s => s.tags.includes('has'));
    const q = (document.getElementById('searchInput')||{}).value?.trim().toLowerCase()||'';
    if(!targetId) document.getElementById('countBadge').textContent = hasItems.length + ' :has()';

    const filtered = q ? hasItems.filter(s =>
      s.title.toLowerCase().includes(q) || s.tags.some(t=>t.includes(q)) || s.codes.some(c=>c.code.toLowerCase().includes(q))
    ) : hasItems;

    const itemsHtml = filtered.length
      ? filtered.map(s => {
          const isOpen  = openIds.has(s.id);
          const tagsHtml = s.tags.map(t=>`<span class="stag">${escHtml(t)}</span>`).join('');
          const values = varValues.get(s.id) || {};
          const liveCode = s.codes[0].code;
          let bodyHtml = '';
          if(isOpen){
            bodyHtml = `<div class="section-body open">
              <p class="section-desc" style="direction:ltr;text-align:left;font-family:'JetBrains Mono',monospace;font-size:12px">${escHtml(liveCode)}</p>
              <div class="code-block">
                <div class="code-header">
                  <span class="lang-badge css">CSS</span>
                  <div class="code-actions">
                    <button class="copy-btn" onclick="copyCodeId(this,'${s.id}',0)" title="نسخ"><i class="ti ti-copy"></i> نسخ</button>
                  </div>
                </div>
<pre class="code-pre${wrapMode?' wrap':''}">${hlCode(syntaxHL(liveCode), window._smartWords || [])}</pre>
              </div>
            </div>`;
          }
          return `<div class="section" data-id="${s.id}">
            <div class="section-head" onclick="toggleSection('${s.id}')">
              <i class="ti ti-chevron-left chevron${isOpen?' open':''}"></i>
              <span class="section-title">${hlQuery(s.title, q)}</span>
              <div class="section-tags">${tagsHtml}</div>
              <div class="section-actions">
                <button class="delete-btn" onclick="confirmDelete('${s.id}',event)" title="حذف" aria-label="حذف"><i class="ti ti-trash"></i></button>
              </div>
            </div>
            ${bodyHtml}
          </div>`;
        }).join('')
      : `<div class="has-empty"><i class="ti ti-mood-empty"></i><p>لا توجد محددات :has() محفوظة</p></div>`;

    document.getElementById(targetId || 'mainBody').innerHTML = `<div class="has-dash">
      <div class="has-builder">
        <div class="has-builder-title"><i class="ti ti-code"></i> بناء مُحدد :has()</div>
        <div class="has-builder-grid">
          <div class="form-group">
            <label class="form-label" for="hasParent">العنصر الأب <code>.parent</code></label>
            <input class="has-input" id="hasParent" type="text" placeholder="body.index .container" oninput="updateHasPreview()" dir="ltr">
          </div>
          <div class="form-group">
            <label class="form-label" for="hasTarget">العنصر المستهدف <code>element</code></label>
            <input class="has-input" id="hasTarget" type="text" placeholder=".s-product-card-content-footer" oninput="updateHasPreview()" dir="ltr">
          </div>
          <div class="form-group">
            <label class="form-label" for="hasCondition">شرط :has() <code style="color:var(--accent-cool)">:has()</code></label>
            <input class="has-input" id="hasCondition" type="text" placeholder='[product-status="out-and-notify"]' oninput="updateHasPreview()" dir="ltr">
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="form-group">
            <label class="form-label" for="hasName">اسم المحدد (اختياري)</label>
            <input class="has-input" id="hasName" type="text" placeholder="مثال: منتج غير متوفر" dir="rtl" style="direction:rtl;text-align:right;font-family:'Cairo',sans-serif">
          </div>
          <div style="display:flex;align-items:flex-end;gap:6px">
            <button class="btn-primary" onclick="saveHasSnippet()" style="flex:1;height:40px"><i class="ti ti-plus"></i> حفظ المحدد</button>

          </div>
        </div>
        <div class="has-preview-wrap">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <div class="has-preview-label" style="margin-bottom:0">معاينة المحدد</div>
            <button class="copy-btn" onclick="copyHasPreview()" style="font-size:10px;padding:3px 10px" id="hasCopyPreviewBtn"><i class="ti ti-copy"></i> نسخ</button>
          </div>
          <div class="has-preview" id="hasPreview"><span style="color:var(--text-3)">... سيظهر المحدد هنا</span></div>
        </div>
      </div>

      <div class="has-section-title">
        <i class="ti ti-bookmark" style="color:var(--accent-cool)"></i>
        المحددات المحفوظة
        <span>(${hasItems.length})</span>
      </div>

      <div style="display:grid;gap:6px">${itemsHtml}</div>
    </div>`;

    document.querySelectorAll('.code-pre').forEach(el => el.classList.toggle('wrap', wrapMode));
  }

