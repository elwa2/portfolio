  // ── TOOLS STUDIO (لانشر موحد: دمج كل الأدوات + وصول سريع) ──
  const TOOLS_META = [
    { src: 'cssDashBtn', name: 'استوديو CSS', icon: 'ti ti-brand-css3',            key: '1' },
    { src: 'sbDashBtn',  name: 'Scrollbar',  icon: 'ti ti-scroll',                  key: '2' },
    { src: 'cpDashBtn',  name: 'الألوان',    icon: 'ti ti-palette',                 key: '3' },
    { src: 'edDashBtn',  name: 'المحرر',     icon: 'ti ti-code-dots',               key: '4' },
    { src: 'devDashBtn', name: 'أدوات',      icon: 'ti ti-tools',                   key: '7' },
    { src: 'b64DashBtn', name: 'Base64',     icon: 'ti ti-binary',                  key: '8' },
    { src: 'qrDashBtn',  name: 'QR',         icon: 'ti ti-qrcode',                  key: '9' },
    { src: 'rtDashBtn',  name: 'التحكم',     icon: 'ti ti-adjustments-horizontal',  key: '0' },
    { src: '__home',     name: 'الرئيسية',   icon: 'ti ti-home-2',                  key: 'H' },
  ];
  const TOOLS_RECENT_KEY = 'csman_v2_tools_recent';
  function getRecentTools(){ try { return JSON.parse(localStorage.getItem(TOOLS_RECENT_KEY) || '[]'); } catch(e){ return []; } }
  function pushRecentTool(src){
    try {
      let r = getRecentTools().filter(x => x !== src);
      r.unshift(src); r = r.slice(0, 3);
      localStorage.setItem(TOOLS_RECENT_KEY, JSON.stringify(r));
    } catch(e){}
  }
  function toggleToolsMenu(e){
    if(e){ e.stopPropagation(); }
    const m = document.getElementById('toolsMenu');
    if(!m) return;
    const open = m.hidden;
    m.hidden = !open;
    if(open){
      const s = document.getElementById('toolsMenuSearch');
      if(s){ s.value = ''; filterToolsMenu(''); setTimeout(() => s.focus(), 30); }
      syncToolsUI();
    }
  }
  function closeToolsMenu(){ const m = document.getElementById('toolsMenu'); if(m) m.hidden = true; }
  function toolsGo(src){
    if(src === '__home'){ if(typeof toggleHomeDash === 'function') toggleHomeDash(); }
    else { toggleById(src); }
    pushRecentTool(src);
    closeToolsMenu();
    setTimeout(syncToolsUI, 0);
    document.getElementById('mainBody')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function filterToolsMenu(q){
    q = (q || '').trim();
    document.querySelectorAll('#toolsMenu .tm-item').forEach(b => {
      const t = b.textContent || '';
      b.style.display = (!q || t.includes(q)) ? '' : 'none';
    });
    document.querySelectorAll('#toolsMenu .tm-group').forEach(g => {
      const vis = [...g.querySelectorAll('.tm-item')].some(b => b.style.display !== 'none');
      g.style.display = vis ? '' : 'none';
    });
  }
  function syncToolsUI(){
    const dash = (typeof currentDashId === 'function') ? currentDashId() : 'main';
    const map = { sb:'sbDashBtn', css:'cssDashBtn', cv:'cssDashBtn', has:'cssDashBtn', ed:'edDashBtn', dev:'devDashBtn', b64:'b64DashBtn', qr:'qrDashBtn', cp:'cpDashBtn', rt:'rtDashBtn', home:'__home' };
    const activeSrc = map[dash] || null;
    const meta = TOOLS_META.find(t => t.src === activeSrc);
    const nameEl = document.getElementById('toolsLauncherName');
    const launcher = document.getElementById('toolsLauncher');
    if(nameEl) nameEl.textContent = meta ? meta.name : 'كل الأدوات';
    if(launcher) launcher.classList.toggle('tool-on', !!meta);
    document.querySelectorAll('#toolsMenu .tm-item').forEach(b => {
      b.classList.toggle('on', b.dataset.src === activeSrc);
    });
    // شرائح آخر استخدام
    const q = document.getElementById('toolsQuick');
    if(q){
      const rec = getRecentTools().filter(s => TOOLS_META.some(t => t.src === s)).slice(0, 3);
      q.innerHTML = rec.map(src => {
        const m = TOOLS_META.find(t => t.src === src);
        if(!m) return '';
        return `<button class="tq-chip${src === activeSrc ? ' on' : ''}" onclick="toolsGo('${src}')" title="فتح سريع: ${m.name} (Alt+${m.key})"><i class="${m.icon}"></i>${m.name}</button>`;
      }).join('');
    }
  }
  document.addEventListener('click', e => {
    const m = document.getElementById('toolsMenu');
    if(!m || m.hidden) return;
    if(m.contains(e.target)) return;
    if(document.getElementById('toolsLauncher')?.contains(e.target)) return;
    m.hidden = true;
  });
  document.addEventListener('click', e => {
    const m = document.getElementById('tbMenu');
    if(!m || m.hidden) return;
    if(m.contains(e.target)) return;
    if(document.getElementById('tbMoreBtn')?.contains(e.target)) return;
    m.hidden = true;
  });

  // ── NAV HUB ──
  const NAV_CATS = [
    { tag:'all',        label:'الكل',       ic:'ti-layout-grid' },
    { tag:'css',        label:'CSS',        ic:'ti-brand-css3' },
    { tag:'responsive', label:'Responsive', ic:'ti-devices' },
    { tag:'brand',      label:'Brand',      ic:'ti-swatch' },
    { tag:'salla',      label:'Salla',      ic:'ti-shopping-bag' },
    { tag:'has',        label:':has()',     ic:'ti-code' },
    { tag:'javascript', label:'JavaScript', ic:'ti-brand-javascript' }
  ];
  const NAV_TOOLS = [
    { g:'تصميم', items:[
      { id:'designStudio', cls:'design-active', label:'استوديو التصميم', ic:'ti-palette',
        k:'design colors color colour gradient palette scrollbar scroll سكرول css imgscr has converter محدد استوديو route theme control تحكم الوان لون تدرج بالتة' } ]},
    { g:'كود', items:[
      { id:'edDashBtn',  cls:'ed-active',  label:'المحرر',  ic:'ti-terminal-2',     k:'editor محرر' } ]},
    { g:'أدوات', items:[
      { id:'devDashBtn', cls:'dev-active', label:'أدوات',  ic:'ti-tools',  k:'minify css js svg encode ضغط' },
      { id:'b64DashBtn', cls:'b64-active', label:'Base64', ic:'ti-binary', k:'base64 encode decode image' },
      { id:'qrDashBtn',  cls:'qr-active',  label:'QR',     ic:'ti-qrcode', k:'qr code' } ]}
  ];
  const NAV_RECENT_KEY = 'csman_v2_nav_recent';
  let navView = 'codes', navLastHtml = '', npSel = 0, npItems = [];
  let navLastDash = null;

  function navRecent(){ try { return JSON.parse(localStorage.getItem(NAV_RECENT_KEY)||'[]'); } catch(e){ return []; } }
  function navPushRecent(id){
    try { localStorage.setItem(NAV_RECENT_KEY, JSON.stringify([id, ...navRecent().filter(x=>x!==id)].slice(0,6))); } catch(e){}
  }
  function navAllTools(){ return NAV_TOOLS.flatMap(g => g.items.map(t => ({ ...t, g:g.g }))); }
  function navToolActive(t){
    if(t.id === 'designStudio'){
      const did = (typeof currentDashId === 'function') ? currentDashId() : '';
      return ['cp','sb','css','cv','has','rt'].includes(did);
    }
    const b = document.getElementById(t.id); return !!(b && b.classList.contains(t.cls));
  }

  function navSetView(v){
    if(v === 'tools'){
      // زر "الأدوات" العلوي: افتح قائمة الأدوات + حوّل فوراً على تاب الأدوات (devDashBtn)
      navView = 'tools'; navLastHtml = '';
      const dev = (typeof navAllTools === 'function') ? navAllTools().find(x => x.id === 'devDashBtn') : null;
      if(dev && !navToolActive(dev)){ navOpenTool('devDashBtn'); return; }
      navLastDash = currentDashId(); navSync();
      document.getElementById('mainBody')?.scrollIntoView({ behavior:'smooth', block:'start' });
      return;
    }
    navView = v; navLastHtml = ''; navLastDash = currentDashId(); navSync();
  }

  // ── عرض الأكواد: تصفير أي داش مفتوح والرجوع للقائمة الرئيسية ──
  function navShowCodes(){
    navView = 'codes'; navLastHtml = '';
    try { if(typeof clearDashFlags === 'function') clearDashFlags(); } catch(e){}
    navLastDash = 'main';
    if(typeof renderAll === 'function') renderAll();
    else if(typeof window.renderAll === 'function') window.renderAll();
    document.getElementById('mainBody')?.scrollIntoView({ behavior:'smooth', block:'start' });
  }

  // ── DESIGN STUDIO HERO (الألوان + Scrollbar + imgscr + :has() + التحكم في بطاقة واحدة) ──
  function designHero(active){
    try {
      if(active === 'css' && typeof cssTab !== 'undefined') active = cssTab;
      const btn = DESIGN_BTNS[active];
      if(btn) localStorage.setItem(LAST_DESIGN_KEY, btn);
    } catch(e){}
    const t = (k, fn, icon, label, hint) =>
      `<button class="dt-tab${k === active ? ' active' : ''}" role="tab" aria-selected="${k === active ? 'true' : 'false'}" title="${hint}" onclick="${fn}()"><i class="${icon}" aria-hidden="true"></i><span>${label}</span></button>`;
    return `<div class="dt-hero design-hero">
      <div class="dt-hero-top">
        <span class="dt-hero-ic"><i class="ti ti-palette" aria-hidden="true"></i></span>
        <span class="dt-hero-title">استوديو التصميم</span>
        <span class="dt-hero-sub">الألوان و Scrollbar و imgscr و :has() والتحكم — كل أدوات التصميم في مكان واحد</span>
      </div>
      <div class="dt-tabs" role="tablist" aria-label="استوديو التصميم">
        ${t('rt', 'toggleRtDash', 'ti ti-adjustments-horizontal', 'التحكم', 'لوحة التحكم — باقة الثيم والروت المخصص')}
        ${t('cv', 'cssOpenCv', 'ti ti-arrows-shuffle', 'imgscr', 'استبدال الصور — imgscr HTML/CSS إلى كود صحيح')}
        ${t('has', 'cssOpenHas', 'ti ti-code', ':has()', 'توليد محددات :has()')}
        ${t('sb', 'toggleScrollbarDash', 'ti ti-scroll', 'Scrollbar', 'بناء سكرول بار مخصص')}
        ${t('cp', 'toggleCpDash', 'ti ti-palette', 'الألوان', 'مولد لوحة الألوان والتدرجات')}
      </div>
    </div>`;
  }

  const DESIGN_BTNS = { cp:'cpDashBtn', sb:'sbDashBtn', cv:'cssDashBtn', has:'cssDashBtn', css:'cssDashBtn', rt:'rtDashBtn' };
  const DESIGN_DASH = ['cp','sb','css','cv','has','rt'];
  const LAST_DESIGN_KEY = 'csman_v2_last_design_btn';

  function navOpenDesign(){
    const did = (typeof currentDashId === 'function') ? currentDashId() : '';
    if(DESIGN_DASH.includes(did)) return; // مفتوح بالفعل — التبويبات تحت هي المسؤولة
    let last = 'cssDashBtn';
    try { last = localStorage.getItem(LAST_DESIGN_KEY) || 'cssDashBtn'; } catch(e){}
    if(!Object.values(DESIGN_BTNS).includes(last)) last = 'cssDashBtn';
    const b = document.getElementById(last);
    if(b) b.click();
  }

  function navOpenTool(id){
    if(id === 'designStudio'){ navPushRecent(id); navOpenDesign(); return; }
    const t = navAllTools().find(x => x.id === id);
    const b = document.getElementById(id);
    if(!t || !b) return;
    if(!navToolActive(t)) navPushRecent(id);
    b.click();
  }
  function navOpenCat(tag){
    navView = 'codes';
    navLastDash = 'main';
    if (typeof activeTag !== 'undefined') activeTag = tag;
    else window.activeTag = tag;
    document.querySelectorAll('.filter-tag').forEach(b => b.classList.toggle('active', b.dataset.tag === tag));
    if (typeof renderAll === 'function') renderAll();
    else if (typeof window.renderAll === 'function') window.renderAll();
    document.getElementById('mainBody')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function navSync(){
    const did = currentDashId();
    // تبديل تلقائي للفيو بس لما الداش نفسه يتغير — مش على كل رندر
    // (لو عملناه على كل نداء كان ضغطة "الأدوات" بترجع فوراً لـ"الأكواد")
    if(did !== navLastDash){
      if(did !== 'main' && did !== 'home' && did !== 'al') navView = 'tools';
      else if(did === 'main') navView = 'codes';
      navLastDash = did;
    }
    const inCodes = (did === 'main');

    const codesTab = document.getElementById('navSegCodes');
    if(codesTab){
      codesTab.classList.toggle('on', navView === 'codes');
      codesTab.setAttribute('aria-pressed', String(navView === 'codes'));
      if(navView === 'codes') codesTab.setAttribute('aria-current', 'page');
      else codesTab.removeAttribute('aria-current');
    }
    const toolsTab = document.getElementById('navSegTools');
    if(toolsTab){
      toolsTab.classList.toggle('on', navView === 'tools');
      toolsTab.setAttribute('aria-pressed', String(navView === 'tools'));
    }

    let html = '';
    if(navView === 'codes'){
      html = NAV_CATS.map(c => {
        const n = c.tag==='all' ? DATA.length
                : DATA.filter(s => {
                    try {
                      if(typeof sectionGroup === 'function' && sectionGroup(s) === c.tag) return true;
                    } catch(e){}
                    return s.tags.some(x => String(x).toLowerCase() === String(c.tag).toLowerCase());
                  }).length;
        const on = inCodes && activeTag === c.tag;
        return `<button class="nav-chip${on?' on':''}" onclick="navOpenCat('${c.tag}')">
          <i class="ti ${c.ic}" aria-hidden="true"></i>${c.label}<span class="n">${n}</span></button>`;
      }).join('');
    } else {
      html = NAV_TOOLS.map(g => `<div class="nav-group"><span class="nav-glabel">${g.g}</span>` +
        g.items.map(t => `<button class="nav-tool${navToolActive(t)?' on':''}" onclick="navOpenTool('${t.id}')">
          <i class="ti ${t.ic}" aria-hidden="true"></i>${t.label}</button>`).join('') + `</div>`).join('');
    }
    if(html !== navLastHtml){
      document.getElementById('navRow').innerHTML = html;
      navLastHtml = html;
    }
  }

  /* ── Palette ── */
  function npBuild(q){
    q = (q||'').trim().toLowerCase();
    const rec = navRecent();
    const tools = navAllTools()
      .sort((a,b) => (rec.indexOf(a.id)<0?99:rec.indexOf(a.id)) - (rec.indexOf(b.id)<0?99:rec.indexOf(b.id)))
      .map(t => ({ type:'tool', id:t.id, label:t.label, ic:t.ic, sub:t.g, hay:(t.label+' '+t.k+' '+t.g).toLowerCase() }));
    const cats = NAV_CATS.map(c => ({ type:'cat', id:c.tag, label:'فلتر: '+c.label, ic:c.ic, sub:'أكواد', hay:(c.label+' '+c.tag+' فلتر').toLowerCase() }));
    return [...tools, ...cats].filter(i => !q || i.hay.includes(q));
  }
  function npRender(){
    const list = document.getElementById('npList');
    if(!npItems.length){ list.innerHTML = '<div class="np-empty">مفيش نتائج</div>'; return; }
    list.innerHTML = npItems.map((it,i) =>
      `<div class="np-item${i===npSel?' active':''}" onmouseenter="npSel=${i};npRender()" onclick="npRun(${i})">
        <i class="ti ${it.ic}" aria-hidden="true"></i><b>${escHtml(it.label)}</b><small>${escHtml(it.sub)}</small></div>`).join('');
    list.querySelector('.active')?.scrollIntoView({ block:'nearest' });
  }
  function npRun(i){
    const it = npItems[i]; if(!it) return;
    closeNavPalette();
    it.type === 'tool' ? navOpenTool(it.id) : navOpenCat(it.id);
  }
  function openNavPalette(){
    document.getElementById('npOverlay').classList.add('open');
    const inp = document.getElementById('npInput');
    inp.value = ''; npSel = 0; npItems = npBuild(''); npRender(); inp.focus();
  }
  function closeNavPalette(){ document.getElementById('npOverlay').classList.remove('open'); }

  /* ── قائمة ⋯ في التوب بار (تصدير/استيراد) ── */
  function toggleTbMenu(e){
    if(e) e.stopPropagation();
    const m = document.getElementById('tbMenu');
    if(!m) return;
    m.hidden = !m.hidden;
  }
  function closeTbMenu(){ const m = document.getElementById('tbMenu'); if(m) m.hidden = true; }

  (function initNavPalette(){
    const inp = document.getElementById('npInput');
    inp.addEventListener('input', () => { npSel = 0; npItems = npBuild(inp.value); npRender(); });
    inp.addEventListener('keydown', e => {
      if(e.key==='ArrowDown'){ e.preventDefault(); npSel = Math.min(npSel+1, npItems.length-1); npRender(); }
      else if(e.key==='ArrowUp'){ e.preventDefault(); npSel = Math.max(npSel-1, 0); npRender(); }
      else if(e.key==='Enter'){ e.preventDefault(); npRun(npSel); }
      else if(e.key==='Escape'){ closeNavPalette(); }
    });
    document.addEventListener('keydown', e => {
      if(e.altKey && !e.ctrlKey && !e.metaKey && (e.key==='t' || e.key==='T' || e.key==='ت')){
        e.preventDefault(); openNavPalette();
      }
    });
  })();

  // ── INIT ──
  DATA.forEach(s => openIds.add(s.id));
  // اختصارات: "/" للبحث و Ctrl/Cmd+K للوحة بحث سريعة + Alt+رقم لفتح مباشر (Alt+T للبالتة الجديدة)
  document.addEventListener('keydown', e => {
    const tag = (e.target && e.target.tagName || '').toLowerCase();
    const typing = tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable);
    // ملاحظة: Alt+T مملوك الآن لبالتة Nav Hub (openNavPalette) — لا تكرر هنا
    // تنقل سريع بين الكروت: Alt+↓ / Alt+↑
    if(e.altKey && !e.ctrlKey && !e.metaKey && !typing && (e.key === 'ArrowDown' || e.key === 'ArrowUp')){
      e.preventDefault();
      idxStep(e.key === 'ArrowDown' ? 1 : -1);
      return;
    }
    // فتح مباشر: Alt+1..0 و Alt+H للرئيسية (يعمل حتى أثناء الكتابة)
    if(e.altKey && !e.ctrlKey && !e.metaKey && !typing){
      const k = e.key.toLowerCase();
      const hit = (typeof TOOLS_META !== 'undefined') ? TOOLS_META.find(t => t.key.toLowerCase() === k) : null;
      if(hit){ e.preventDefault(); toolsGo(hit.src); return; }
    }
    if(e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey){
      e.preventDefault();
      const si = document.getElementById('searchInput');
      if(si){ si.focus(); si.value = ''; renderAll(); renderSuggest(); }
    }
    else if((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey) && !typing){
      e.preventDefault();
      const si = document.getElementById('searchInput');
      if(si){ si.focus(); si.select(); renderSuggest(); }
    }
    else if(e.key === 'Escape'){
      const box = document.getElementById('searchSug');
      if(box && box.classList.contains('open')) box.className = 'search-sug';
      closeToolsMenu();
      closeTbMenu();
    }
  });
(function(){
  const KEY='csman_qn_usage_v1';
  let use={}; try{use=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
  let q='';
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(use))}catch(e){}};
  function rec(id){ if(!id) return; const u=use[id]||(use[id]={n:0,t:0}); u.n++; u.t=Date.now(); save(); }

  // تسجيل الاستخدام (نسخ / فتح)
  const _ts=window.toggleSection; window.toggleSection=function(id){rec(id);return _ts.apply(this,arguments)};
  const _qc=window.quickCopy;     window.quickCopy=function(id){rec(id);return _qc.apply(this,arguments)};
  const _cc=window.copyCode;      window.copyCode=function(btn){
    const h=btn&&btn.closest&&btn.closest('[data-id]'); if(h) rec(h.dataset.id); return _cc.apply(this,arguments)};
  const _cci=window.copyCodeId;
  if(_cci) window.copyCodeId=function(btn, sid){
    if(sid) rec(sid);
    else { const h=btn&&btn.closest&&btn.closest('[data-id]'); if(h) rec(h.dataset.id); }
    return _cci.apply(this,arguments)};

  const title=id=>(DATA.find(s=>s.id===id)||{}).title||'';
  const item=(s,n,extra)=>`<a class="qn-i" data-qid="${s.id}" title="${escHtml(s.title)}" onclick="idxJump('${s.id}')"><small>${n||''}</small>${escHtml(s.title)}${extra||''}</a>`;

  function build(){
    const box=document.getElementById('qn'); if(!box) return;
    const on=currentDashId()==='main'; document.body.classList.toggle('qn-on',on);
    if(!on) return;
    const list=getFiltered().filter(s=>!q||s.title.toLowerCase().includes(q)||s.tags.some(t=>t.toLowerCase().includes(q)));
    const byId=Object.fromEntries(list.map(s=>[s.id,s]));
    const pick=arr=>arr.map(id=>byId[id]).filter(Boolean);
    const fresh=list.slice(0,8);
    const top=pick(Object.keys(use).filter(id=>use[id].n>1).sort((a,b)=>use[b].n-use[a].n)).slice(0,5);
    const recent=pick(Object.keys(use).sort((a,b)=>use[b].t-use[a].t)).slice(0,5);
    let h='';
    const sec=(t,arr,badge)=>arr.length?`<div class="qn-h">${t}<b>${arr.length}</b></div>`+arr.map(s=>item(s,'',badge?` <small>×${use[s.id]?use[s.id].n:0}</small>`:'')).join(''):'';
    h+=sec('🆕 الأحدث',fresh)+sec('🔥 الأكثر استخداماً',top,true)+sec('🕘 آخر ما استخدمت',recent);
    let n=0;
    GROUP_LIST.forEach(g=>{
      const items=list.filter(s=>sectionGroup(s)===g.key); if(!items.length) return;
      h+=`<div class="qn-h"><i class="ti ${g.icon}"></i>${g.label}<b>${items.length}</b></div>`+items.map(s=>item(s,++n)).join('');
    });
    document.getElementById('qnList').innerHTML=h||'<div class="qn-h">لا نتائج</div>';
    spy();
  }

  // scroll-spy: يلوّن العنصر الحالي
  let raf=0;
  function spy(){
    const cards=[...document.querySelectorAll('#mainBody .crow[data-id],#mainBody .section[data-id]')];
    let cur=null; for(const c of cards){ if(c.getBoundingClientRect().top<=170) cur=c.dataset.id; else break; }
    const L=document.getElementById('qnList'); if(!L) return;
    L.querySelectorAll('.qn-i.on').forEach(e=>e.classList.remove('on'));
    if(!cur) return;
    const hit=[...L.querySelectorAll('.qn-i[data-qid="'+cur+'"]')];
    hit.forEach(e=>e.classList.add('on'));
    const e=hit[hit.length-1]; if(e){ const r=e.getBoundingClientRect(),lr=L.getBoundingClientRect();
      if(r.top<lr.top||r.bottom>lr.bottom) L.scrollTop+=r.top-lr.top-lr.height/2; }
  }
  window.addEventListener('scroll',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(spy)},{passive:true});
  document.getElementById('qnQ').addEventListener('input',e=>{q=e.target.value.trim().toLowerCase();build()});

  // ربط بإعادة الرسم
  const _ra=window.renderAll; window.renderAll=function(){const r=_ra.apply(this,arguments);try{build()}catch(e){}return r};

  // ابدأ مطوي بدل ما كل الأكواد تتفتح
  openIds.clear();
  if(typeof currentHash === 'function' && currentHash() === 'tool') hashGo();
  else renderAll();
})();
