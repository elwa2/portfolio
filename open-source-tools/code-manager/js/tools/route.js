  // ── ROUTE CONTROL PANEL DASHBOARD ──
  let rtConfig = {
    route: 'body:not(.index)',
    pos: 'afterbegin',
    sel: '',
    vars: {
      '--1':'#023202', '--2':'#023202', '--2-2':'#02320240', '--3':'#edf5ff',
      '--4':'#3b3b39', '--4-4':'#3131309c', '--4-4-4':'#20201f', '--00':'#2d2d2d',
      '--bg':'#fff3ce', '--ff':'#ffffff'
    }
  };
  const RT_VARS = [
    ['--1','الأساسي'], ['--2','الثانوي'], ['--2-2','ثانوي شفاف'],
    ['--3','نص عكسي'], ['--4','داكن'], ['--4-4','داكن شفاف'],
    ['--4-4-4','الأغمق'], ['--00','رمادي غامق'], ['--bg','الخلفية'], ['--ff','أبيض نقي']
  ];
  const RT_PRESETS = [
    ['body:not(.index)','كل الصفحات ما عدا الرئيسية'],
    ['body.index','الصفحة الرئيسية'],
    ['body.product-single','صفحة المنتج'],
    ['body.cart','صفحة السلة'],
    ['body.checkout','صفحة الدفع'],
    [':root','عام — كل الصفحات']
  ];

  function toggleRtDash(){
    showRtDash = !showRtDash;
    document.getElementById('rtDashBtn').classList.toggle('rt-active', showRtDash);
    if(showRtDash){
      document.querySelectorAll('.filter-tag:not(#rtDashBtn)').forEach(b=>b.classList.remove('active'));
      showHomeDash=false;
      const __hb=document.getElementById('homeBtn');
      if(__hb) __hb.classList.remove('home-active');
      showScrollbarDash=false;
      showCssDash=false;
      showEdDash=false; showDevDash=false; showB64Dash=false; showQrDash=false; showCpDash=false;
      [['sbDashBtn','scrollbar-active'],['cssDashBtn','css-active'],
       ['edDashBtn','ed-active'],['devDashBtn','dev-active'],
       ['b64DashBtn','b64-active'],['qrDashBtn','qr-active'],['cpDashBtn','cp-active']
      ].forEach(p => { const el=document.getElementById(p[0]); if(el) el.classList.remove(p[1]); });
    }
    renderAll();
  }

  function rtToPickerVal(v){
    v = String(v||'').trim();
    if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
    if (/^#[0-9a-fA-F]{8}$/.test(v)) return v.slice(0,7);
    if (/^#[0-9a-fA-F]{3}$/.test(v)) return '#' + v[1]+v[1]+v[2]+v[2]+v[3]+v[3];
    return '#000000';
  }

  function rtSet(key, value){ rtConfig[key] = value; rtRefresh(); }

  function rtSetVar(name, value, fromPicker){
    rtConfig.vars[name] = value;
    const sw = document.getElementById('rtSw_' + name);
    if (sw) sw.style.background = value || 'transparent';
    if (fromPicker){
      const txt = document.getElementById('rtTxt_' + name);
      if (txt) txt.value = value;
    }
    rtRefresh();
  }

  function rtGenerateCSS(){
    const v = rtConfig.vars;
    const r = (rtConfig.route || '').trim() || 'body:not(.index)';
    return r + ' {\n'
      + '  /* Base Palette - الألوان الأساسية */\n'
      + '  --1:' + v['--1'] + ';\n'
      + '  --2:' + v['--2'] + ';\n'
      + '  --2-2:' + v['--2-2'] + ';\n'
      + '  --3:' + v['--3'] + ';\n'
      + '  --4:' + v['--4'] + ';\n'
      + '  --4-4:' + v['--4-4'] + ';\n'
      + '  --4-4-4:' + v['--4-4-4'] + ';\n'
      + '  --00:' + v['--00'] + ';\n'
      + '  --bg:' + v['--bg'] + ';\n'
      + '  --ff:' + v['--ff'] + ';\n'
      + '\n  /* Semantic Variables - المتغيرات الوظيفية */\n'
      + '  --color-primary:var(--1);\n'
      + '  --color-primary-dark:var(--4);\n'
      + '  --color-primary-light:var(--2-2);\n'
      + '  --color-main:var(--1);\n'
      + '  --color-primary-reverse:var(--3);\n'
      + '\n  /* Gradients & Shadows - التدرجات والظلال */\n'
      + '  --gr:linear-gradient(45deg,var(--color-primary) 0%,var(--color-primary) 39%,var(--color-primary-dark) 100%);\n'
      + '  --gr2:linear-gradient(45deg,var(--1) 0%,var(--2) 100%);\n'
      + '  --sh:-8px 10px 15px -3px rgba(0,0,0,.1);\n'
      + '}';
  }

  function rtHtmlValue(){
    const ta = document.getElementById('rtHtmlCode');
    return ta ? ta.value : '';
  }

  function rtGenerateJS(){
    const html   = rtHtmlValue().trim();
    const route  = (rtConfig.route || ':root').trim();
    const sel    = (rtConfig.sel || '').trim();
    const target = sel || 'body';
    const pos    = rtConfig.pos === 'beforeend' ? 'beforeend' : 'afterbegin';
    const lit    = html
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .split('\n').join('\\n\\\n');
    return "<!-- ضع هذا الكود في حقول أكواد JS المخصصة بالمتجر -->\n<script>\n"
      + "(function () {\n"
      + "  var ROUTE    = '" + route + "';\n"
      + "  var TARGET   = '" + target + "';\n"
      + "  var POSITION = '" + pos + "';\n"
      + "  var HTML     = '" + lit + "';\n\n"
      + "  function run() {\n"
      + "    try {\n"
      + "      if (!document.querySelector(ROUTE)) return;\n"
      + "      var host = document.querySelector(TARGET);\n"
      + "      if (!host) return;\n"
      + "      host.insertAdjacentHTML(POSITION, HTML);\n"
      + "    } catch (e) {}\n"
      + "  }\n\n"
      + "  if (document.readyState === 'loading') {\n"
      + "    document.addEventListener('DOMContentLoaded', run);\n"
      + "  } else { run(); }\n"
      + "})();\n<\/script>";
  }

  function rtHL(css){
    let s = escHtml(css);
    s = s.replace(/(\/\*[\s\S]*?\*\/)/g, m => '<span class="cmt">' + m + '</span>');
    s = s.replace(/^([^\{\n][^\{\n]*)(\{)/gm, (m, a) => '<span class="sel">' + a + '</span>{');
    s = s.replace(/(linear-gradient\([^)]*\)|rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}|var\([^)]*\))/g, m => '<span class="val">' + m + '</span>');
    s = s.replace(/(--[\w-]+)(\s*:)/g, '<span class="var">$1</span>$2');
    return s;
  }

  function rtRefresh(){
    const cssEl = document.getElementById('rtCssPreview');
    if (cssEl) cssEl.innerHTML = rtHL(rtGenerateCSS());
    const jsEl = document.getElementById('rtJsPreview');
    if (jsEl) jsEl.innerHTML = escHtml(rtGenerateJS());
    const routeOut = document.getElementById('rtRouteEcho');
    if (routeOut) routeOut.textContent = (rtConfig.route || '').trim() || 'body:not(.index)';
  }

  function rtCopy(btn, kind){
    const text = kind === 'js' ? rtGenerateJS() : rtGenerateCSS();
    navigator.clipboard.writeText(text).then(() => {
      btn.classList.add('copied');
      btn.innerHTML = '<i class="ti ti-check"></i> تم النسخ';
      showToast(kind === 'js' ? 'تم نسخ كود الـHTML!' : 'تم نسخ كود البالتة!');
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = '<i class="ti ti-copy"></i> نسخ الكود';
      }, 2000);
    }).catch(() => showToast('تعذّر النسخ'));
  }

  function rtSavePalette(){
    const nameEl = document.getElementById('rtName');
    const name = nameEl && nameEl.value.trim() ? nameEl.value.trim() : 'بالتة الثيم - ' + rtConfig.route;
    DATA.unshift({
      id: 'rt_' + Date.now(),
      title: name,
      desc: 'لوحة متغيرات الثيم على روت مخصص (' + rtConfig.route + ')',
      tags: ['variables','palette','css','brand'],
      codes: [{ lang: 'CSS', code: rtGenerateCSS() }]
    });
    if (typeof saveUserOverlay === 'function') saveUserOverlay();
    showToast('تم حفظ البالتة في المكتبة!');
  }

  function rtSaveHtml(){
    const html = rtHtmlValue().trim();
    if (!html){ showToast('الصق كود الـHTML أولاً'); return; }
    const nameEl = document.getElementById('rtName');
    const name = nameEl && nameEl.value.trim() ? nameEl.value.trim() : 'HTML بروت مخصص - ' + rtConfig.route;
    DATA.unshift({
      id: 'rt_' + Date.now(),
      title: name,
      desc: 'حقن HTML على روت مخصص (' + rtConfig.route + ')',
      tags: ['html','javascript','route','salla'],
      codes: [
        { lang: 'HTML', code: html },
        { lang: 'JS', code: rtGenerateJS() }
      ]
    });
    openIds.add(DATA[0].id);
    if (typeof saveUserOverlay === 'function') saveUserOverlay();
    showToast('تم حفظ كود الـHTML في المكتبة!');
  }

  function renderRtDash(){
    document.getElementById('countBadge').textContent = 'لوحة التحكم';

    const varRows = RT_VARS.map(v => {
      const key = v[0], label = v[1];
      const val = rtConfig.vars[key];
      return `<div class="rt-var-row">
        <span class="rt-swatch" id="rtSw_${key}" style="background:${escHtml(val)}"></span>
        <span class="rt-var-name" title="${label}">${key}</span>
        <input type="color" class="rt-input" id="rtPick_${key}" value="${rtToPickerVal(val)}"
          oninput="rtSetVar('${key}', this.value, true)">
        <input type="text" class="rt-input" id="rtTxt_${key}" value="${escHtml(val)}" style="max-width:98px"
          oninput="rtSetVar('${key}', this.value)">
      </div>`;
    }).join('');

    const presetChips = RT_PRESETS.map(p =>
      `<button class="rt-chip" onclick="rtSet('route','${p[0]}'); document.getElementById('rtRoute').value='${p[0]}'">${escHtml(p[0])} · ${p[1]}</button>`
    ).join('');

    document.getElementById('mainBody').innerHTML = `<div class="has-dash">${designHero('rt')}<div class="rt-builder">
      <div class="rt-builder-title"><i class="ti ti-adjustments-horizontal"></i> لوحة التحكم
        <span>عدّل باقة الثيم واختر الروت المخصص — ثم انسخ الكود أو احفظه في المكتبة</span>
      </div>

      <div class="form-group" style="max-width:420px">
        <label class="form-label" for="rtName">اسم المقطع عند الحفظ (اختياري)</label>
        <input class="form-input" id="rtName" type="text" placeholder="مثال: ثيم الصفحات الداخلية">
      </div>

      <div class="rt-section-title"><i class="ti ti-route" style="color:#ec4899"></i> الروت المخصص <span>— المحدد الذي تُطبَّق عليه الأكواد</span></div>
      <input class="rt-input" id="rtRoute" style="max-width:420px" value="${escHtml(rtConfig.route)}"
        placeholder="body:not(.index)" oninput="rtSet('route', this.value)">
      <div class="rt-chips">${presetChips}</div>

      <div class="rt-section-title"><i class="ti ti-palette" style="color:#ec4899"></i> ألوان البالتة <span>— عدّل أي لون ويتحدّث الكود فوراً</span></div>
      <div class="rt-palette-grid">${varRows}</div>

      <div class="rt-preview-wrap">
        <div class="rt-preview-label">
          <span>كود CSS النهائي — <span id="rtRouteEcho" style="direction:ltr;color:#ec4899">${escHtml(rtConfig.route)}</span></span>
          <button class="copy-btn" id="rtCopyCssBtn" onclick="rtCopy(this,'css')" style="font-size:10px;padding:3px 10px"><i class="ti ti-copy"></i> نسخ الكود</button>
        </div>
        <pre class="rt-preview" id="rtCssPreview"></pre>
      </div>

      <div class="rt-actions">
        <button class="btn-primary" onclick="rtSavePalette()"><i class="ti ti-device-floppy"></i> حفظ البالتة في المكتبة</button>
      </div>

      <div class="rt-section-title"><i class="ti ti-code" style="color:#ec4899"></i> إضافة HTML بروت مخصص <span>— يُحقن الكود فقط في الصفحات المطابقة للروت</span></div>

      <div class="rt-grid2">
        <div>
          <textarea class="rt-textarea" id="rtHtmlCode" placeholder="&lt;div class=&quot;my-banner&quot;&gt;...&lt;/div&gt;" oninput="rtRefresh()"></textarea>
          <div class="rt-grid2" style="margin-top:10px">
            <div class="form-group" style="margin-bottom:0">
              <label class="form-label">موضع الحقن</label>
              <select class="form-select" id="rtPos" onchange="rtSet('pos', this.value)">
                <option value="afterbegin">بداية الصفحة — بعد body</option>
                <option value="beforeend">نهاية الصفحة — قبل إغلاق body</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom:0">
              <label class="form-label">مستضيف مخصص <code style="font-size:10px">اختياري</code></label>
              <input class="rt-input" id="rtSel" value="" placeholder="footer.store-footer" oninput="rtSet('sel', this.value)">
            </div>
          </div>
          <div class="rt-actions">
            <button class="btn-primary" onclick="rtSaveHtml()"><i class="ti ti-device-floppy"></i> حفظ في المكتبة</button>
            <button class="btn-cancel" onclick="document.getElementById('rtHtmlCode').value=''; rtRefresh()">تفريغ</button>
          </div>
        </div>
        <div>
          <div class="rt-preview-wrap" style="margin-top:0">
            <div class="rt-preview-label">
              <span>كود JS الجاهز — يضمن ظهور الـHTML في الروت فقط</span>
              <button class="copy-btn" id="rtCopyJsBtn" onclick="rtCopy(this,'js')" style="font-size:10px;padding:3px 10px"><i class="ti ti-copy"></i> نسخ الكود</button>
            </div>
            <pre class="rt-preview" id="rtJsPreview"></pre>
          </div>
        </div>
      </div>
    </div></div>`;

    rtRefresh();
    document.querySelectorAll('.code-pre').forEach(el => el.classList.toggle('wrap', wrapMode));
  }

