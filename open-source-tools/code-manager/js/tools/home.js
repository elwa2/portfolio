  // ── HOME DASHBOARD ──
  function toggleHomeDash(){
    showHomeDash = !showHomeDash;
    document.getElementById('homeBtn').classList.toggle('home-active', showHomeDash);
    if(showHomeDash){
      document.querySelectorAll('.filter-tag').forEach(b=>b.classList.remove('active'));
      showScrollbarDash = false; showCssDash = false;
      showEdDash = false; showDevDash = false; showB64Dash = false; showQrDash = false;
      showCpDash = false; showRtDash = false;
      const map = { cssDashBtn:'css-active', sbDashBtn:'scrollbar-active',
        edDashBtn:'ed-active', devDashBtn:'dev-active',
        b64DashBtn:'b64-active', qrDashBtn:'qr-active', cpDashBtn:'cp-active', rtDashBtn:'rt-active' };
      Object.keys(map).forEach(id => {
        const b = document.getElementById(id);
        if (b) b.classList.remove(map[id]);
      });
    }
    renderAll();
  }

  function renderHomeDash(){
    document.getElementById('countBadge').textContent = DATA.length + ' كود';
    const q = (document.getElementById('searchInput')||{}).value?.trim().toLowerCase()||'';
    const latest = DATA.slice(0, 8);

    const dashCards = [
      { id:'cssDashBtn', t:'استوديو CSS', s:'imgscr + :has()', i:'ti-brand-css3', c:'c-purple' },
      { id:'sbDashBtn', t:'سكرول بار', s:'توليد CSS', i:'ti-scroll', c:'c-teal' },
      { id:'edDashBtn', t:'المحرر', s:'أكواد بترقيم', i:'ti-code', c:'c-blue' },
      { id:'devDashBtn', t:'أدوات المطور', s:'Dev Tools', i:'ti-tool', c:'c-teal' },
      { id:'b64DashBtn', t:'Base64', s:'ترميز وفك', i:'ti-database', c:'c-purple' },
      { id:'qrDashBtn', t:'QR Code', s:'مولد QR', i:'ti-qrcode', c:'c-green' },
      { id:'cpDashBtn', t:'لون CSS', s:'أدوات الألوان', i:'ti-color-swatch', c:'c-red' },
      { id:'rtDashBtn', t:'Real-Time', s:'نسخ مباشر', i:'ti-bolt', c:'c-gold' }
    ];

    const toolLinks = [
      { href:'../gradient-generator.html',     t:'مولد التدرجات',     i:'ti-gradient', c:'c-purple' },
      { href:'../color-tools.html',            t:'أدوات الألوان',     i:'ti-color-swatch', c:'c-red' },
      { href:'../primary-color-variables-generator.html', t:'متغيرات اللون', i:'ti-variables', c:'c-blue' },
      { href:'../brand-color-palette-lab.html',t:'لوحة الهوية',       i:'ti-palette', c:'c-gold' },
      { href:'../before-after-comparison.html',t:'قبل وبعد',          i:'ti-compare', c:'c-teal' },
      { href:'../article-image-seo.html',      t:'SEO الصور',         i:'ti-photo', c:'c-green' },
      { href:'../image-optimizer.html',        t:'تحسين الصور',       i:'ti-photo-scan', c:'c-blue' },
      { href:'../image-resizer.html',          t:'تصغير الصور',       i:'ti-resize', c:'c-purple' },
      { href:'../glass-generator.html',        t:'زجاج عليه',          i:'ti-float-none', c:'c-teal' },
      { href:'../megasplit.html',              t:'MegaSplit',         i:'ti-cut', c:'c-red' },
      { href:'../file-toolkit.html',           t:'ملفات',             i:'ti-file', c:'c-blue' },
      { href:'../pro-image-editor.html',       t:'محرر صور',          i:'ti-edit', c:'c-gold' },
      { href:'../kdp-tools.html',              t:'أدوات KDP',         i:'ti-book', c:'c-purple' },
      { href:'../base64-tool.html',            t:'Base64',            i:'ti-database', c:'c-teal' },
      { href:'../github-cdn.html',             t:'GitHub CDN',        i:'ti-brand-github', c:'c-green' },
      { href:'../useful-links.html',           t:'روابط مهمة',        i:'ti-link', c:'c-blue' },
      { href:'../qr-generator.html',           t:'QR Generator',      i:'ti-qrcode', c:'c-green' },
      { href:'../password-generator.html',     t:'مولد كلمات مرور',   i:'ti-lock', c:'c-red' },
      { href:'../webp-converter.html',         t:'WebP imgscr',         i:'ti-photo', c:'c-teal' },
      { href:'../smart-image-compressor.html', t:'ضغط ذكي للصور',     i:'ti-brackets-contain', c:'c-purple' },
      { href:'../css-optimizer.html',          t:'تحسين CSS',         i:'ti-brush', c:'c-blue' },
      { href:'../text-case-converter.html',    t:'تحويل النصوص',      i:'ti-case-toggle', c:'c-gold' },
      { href:'../translator.html',             t:'مترجم',             i:'ti-language', c:'c-teal' },
      { href:'../calendar.html',               t:'آلة حاسبة',         i:'ti-calculator', c:'c-red' },
      { href:'../todo.html',                   t:'مهام',              i:'ti-list-check', c:'c-green' },
      { href:'../dev-tools.html',              t:'Dev Tools',         i:'ti-tool', c:'c-purple' }
    ];

    const mainLinks = [
      { href:'../index.html',     t:'الصفحة الرئيسية', i:'ti-home', c:'c-blue' },
      { href:'../works.html',     t:'أعمالي',           i:'ti-briefcase', c:'c-gold' },
      { href:'../contact.html',   t:'تواصل معي',        i:'ti-mail', c:'c-teal' },
      { href:'../index.html',        t:'كل الأدوات',       i:'ti-grid-dots', c:'c-purple' }
    ];

    const socialLinks = [
      { href:'https://wa.me/201002241591',              t:'واتساب',     i:'ti-brand-whatsapp', c:'c-green' },
      { href:'https://www.instagram.com/salla1zid/',    t:'إنستجرام',   i:'ti-brand-instagram', c:'c-purple' },
      { href:'https://t.me/cssfree1',                    t:'تيليجرام',   i:'ti-brand-telegram', c:'c-blue' },
      { href:'https://www.behance.net/3lwaaa1',          t:'بيهانس',     i:'ti-brand-behance', c:'c-blue' }
    ];

    const card = (d, dash) => `
      <div class="home-card ${d.c}" onclick="${dash ? `toggleById('${d.id}')` : `window.open('${d.href}','_blank')`}" title="${d.t}" ${dash ? 'style="cursor:pointer"' : ''}>
        <div class="home-card-ic"><i class="ti ${d.i}" aria-hidden="true"></i></div>
        <div><div class="home-card-t">${escHtml(d.t)}</div><div class="home-card-s">${escHtml(d.s||'')}</div></div>
      </div>`;

    const dashHtml = dashCards.map(d => card(d, true)).join('');
    const toolsHtml = toolLinks.map(d => card(d, false)).join('');
    const mainHtml = mainLinks.map(d => card(d, false)).join('');
    const socialHtml = socialLinks.map(d => card(d, false)).join('');

    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-EG', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    const h = now.getHours();
    const greet = h < 12 ? 'صباح الخير' : (h < 18 ? 'مساء الخير' : 'مساءً سعيدًا');

    const latestHtml = latest.length ? `
      <div class="home-title"><i class="ti ti-sparkles" aria-hidden="true"></i> أحدث الأكواد <span class="hln">${latest.length} عنصر</span></div>
      <div class="home-grid">
        ${latest.map(s=>`
          <div class="home-card c-gold" onclick="goHomeTo('${s.id}')" title="${escHtml(s.title)}" style="cursor:pointer">
            <div class="home-card-ic"><i class="ti ti-code" aria-hidden="true"></i></div>
            <div><div class="home-card-t">${escHtml(s.title)}</div><div class="home-card-s">${s.codes.length} أكواد</div></div>
          </div>`).join('')}
      </div>` : '';

    document.getElementById('mainBody').innerHTML = `
      <div class="home-dash">
        <div class="home-banner">
          <div class="home-banner-ic"><i class="ti ti-home-2" aria-hidden="true"></i></div>
          <div class="home-banner-txt">
            <div class="home-banner-title">${greet} 👋 <span class="now-d">${escHtml(dateStr)}</span></div>
            <div class="home-banner-sub">ملّخصك والأدوات الأكثر استخدامًا — ولوحاتك الخاصة كلها في مكان واحد.</div>
          </div>
        </div>

        <div class="home-title"><i class="ti ti-home" aria-hidden="true"></i> لوحاتي <span class="hln">${dashCards.length} لوحة</span></div>
        <div class="home-grid">${dashHtml}</div>

        ${latestHtml}

        <div class="home-title"><i class="ti ti-layout-grid" aria-hidden="true"></i> أدواتي المفتوحة المصدر <span class="hln">${toolLinks.length} أداة</span></div>
        <div class="home-grid tools">${toolsHtml}</div>

        <div class="home-title"><i class="ti ti-link" aria-hidden="true"></i> روابط سريعة</div>
        <div class="home-grid">${mainHtml}</div>

<div class="home-title"><i class="ti ti-users" aria-hidden="true"></i> تواصل</div>
        <div class="home-grid">${socialHtml}</div>

        <div class="home-title" id="gsBox">
          <i class="ti ti-table" aria-hidden="true"></i> قاعدة البيانات
          <span class="hln" id="gsCountBadge">0 رابط</span>
          <button class="gs-refresh" onclick="loadSheetLinks(true)" title="تحديث من جوجل شيت">
            <i class="ti ti-refresh" aria-hidden="true"></i> تحديث
          </button>
        </div>
        <div class="home-grid" id="gsGrid"></div>
        <div class="gs-live-notice"><i class="ti ti-database" aria-hidden="true"></i> مرتبط بجوجل شيت — أضف رابطًا في الشيت ثم اضغط "تحديث" (كاش 6 ساعات محليًا)</div>

        <div class="home-note"><b>نصيحة:</b> اضغط "الكل" أعلى الفلتر للعودة لقائمة الأكواد, أو "الرئيسية" في أي وقت للرجوع لهذه الصفحة. بحثك الحالي: ${q ? '<b style="color:var(--text-1)">'+escHtml(q)+'</b>' : '<b style="color:var(--text-1)">بدون بحث</b>'}.</div>
      </div>`;
    loadSheetLinks(false);
  }

  function toggleById(id){
    const fn = { cssDashBtn:toggleCssDash, sbDashBtn:toggleScrollbarDash,
      edDashBtn:toggleEdDash, devDashBtn:toggleDevDash,
      b64DashBtn:toggleB64Dash, qrDashBtn:toggleQrDash, cpDashBtn:toggleCpDash,
      rtDashBtn:toggleRtDash }[id];
    if (fn) fn();
  }

  function goHomeTo(id){
    showHomeDash = false;
    const b = document.getElementById('homeBtn');
    if (b) b.classList.remove('home-active');
    activeTag = 'all';
    document.querySelectorAll('.filter-tag').forEach(x=>x.classList.remove('active'));
    openIds = new Set(openIds).add(id);
    const allBtn = document.querySelector('.filter-tag[data-tag="all"]');
    if (allBtn) allBtn.classList.add('active');
    renderAll();
  }

  // ── GOOGLE SHEETS LINKS (قاعدة البيانات) ──
  const GS_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzi1VPP6FIaBhLTdytoevyC2ByxyaZYSd-xJoyeaKLZU5nOYnjn-x2VXs_A95Srf7d4/exec';
  const GS_CACHE_KEY = 'csman_gs_links_v1';
  const GS_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 ساعات

  function gsCacheGet(){
    try {
      const raw = localStorage.getItem(GS_CACHE_KEY);
      if(!raw) return null;
      const c = JSON.parse(raw);
      if(!c || !Array.isArray(c.links)) return null;
      if(Date.now() - (c.t || 0) > GS_CACHE_TTL) return null;
      return c.links;
    } catch(e){ return null; }
  }
  function gsCacheSet(links){
    try { localStorage.setItem(GS_CACHE_KEY, JSON.stringify({ t: Date.now(), links: links })); } catch(e){}
  }
  function gsIconHtml(icon){
    icon = String(icon || '').trim();
    if(!icon) return '<i class="ti ti-link" aria-hidden="true"></i>';
    if(/^ti/i.test(icon)) return `<i class="${escHtml(icon)}" aria-hidden="true"></i>`;
    if(/^https?:\/\//i.test(icon)) return `<img src="${escHtml(icon)}" alt="" class="gs-img-ic" loading="lazy">`;
    return `<span class="gs-emoji">${escHtml(icon)}</span>`;
  }
  function gsCardHtml(d){
    const colorClass = (d.color && ['c-blue','c-teal','c-green','c-gold','c-purple','c-red'].includes('c-' + String(d.color))) ? 'c-' + d.color : 'c-blue';
    return `<a class="home-card ${colorClass}" href="${escHtml(d.url)}" target="_blank" rel="noopener" title="${escHtml(d.title)}">
      <div class="home-card-ic">${gsIconHtml(d.icon || d.icon_url || d.emoji)}</div>
      <div><div class="home-card-t">${escHtml(d.title)}</div><div class="home-card-s">${escHtml(d.group || d.type || 'رابط')}</div></div>
    </a>`;
  }
  function renderGSLinks(links){
    const wrap = document.getElementById('gsGrid');
    if(!wrap) return;
    wrap.innerHTML = links.length
      ? links.map(gsCardHtml).join('')
      : '<div class="home-note"><b>لا توجد روابط</b> — أضف صفوفًا في جوجل شيت ثم حدّث.</div>';
    const badge = document.getElementById('gsCountBadge');
    if(badge) badge.textContent = links.length ? links.length + ' رابط' : 'لا توجد روابط';
    const box = document.getElementById('gsBox');
    if(box) box.style.display = '';
  }
  function loadSheetLinks(force){
    const cached = force ? null : gsCacheGet();
    if(cached && cached.length){
      renderGSLinks(cached);
    } else {
      renderGSLinks([]);
    }
    const url = GS_SHEET_URL + (force ? '?v=' + Date.now() : '');
    fetch(url).then(r => r.text()).then(raw => {
        const j = JSON.parse(raw);
        const links = Array.isArray(j) ? j : (Array.isArray(j.links) ? j.links : null);
        if(!links){ throw new Error(j.error || 'بنية غير صحيحة'); }
        gsCacheSet(links);
        renderGSLinks(links);
      })
      .catch(err => gsHandleError(err, force));
  }
  function gsHandleError(err, force){
    // fallback: JSONP (يعمل حتى من file:// ومن أي أصل)
    try {
      const cb = 'gsCallback' + Date.now();
      window[cb] = function(j){
        delete window[cb];
        const links = Array.isArray(j) ? j : (Array.isArray(j.links) ? j.links : null);
        if(!links){ gsFail(err); return; }
        gsCacheSet(links);
        renderGSLinks(links);
      };
      const s = document.createElement('script');
      s.src = GS_SHEET_URL + '?callback=' + cb + (force ? '&v=' + Date.now() : '');
      s.onerror = function(){ delete window[cb]; gsFail(err); };
      document.head.appendChild(s);
    } catch(e2){ gsFail(err); }
  }
  function gsFail(err){
    const stale = gsCacheGet();
    if(stale && stale.length){ renderGSLinks(stale); }
    else {
      renderGSLinks([]);
      const wrap = document.getElementById('gsGrid');
      if(wrap && !wrap.querySelector('.home-card')){
        wrap.innerHTML = '<div class="home-note"><b>تعذّر الاتصال بقاعدة البيانات.</b><br>تحقق من نشر التطبيق كـ "أي شخص", ومن الرابط, ومن الاتصال بالإنترنت.<br><span style="font-size:10.5px;color:var(--text-3)">' + escHtml(String(err && err.message)) + '</span></div>';
      }
      const box = document.getElementById('gsBox');
      if(box) box.style.display = '';
    }
  }

