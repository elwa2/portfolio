  // ── SCROLLBAR DASHBOARD ──
  let showScrollbarDash = false;
  let sbConfig = {
    thumbColor: '#f59938',
    trackColor: '#6b22d1',
    thumbHoverColor: '#f59938b4',
    bgFallback: '#faf5f0',
    colorFallback: '#d8918f',
    width: '8px',
    radius: '5px'
  };

  function toggleScrollbarDash(){
    showScrollbarDash = !showScrollbarDash;
    document.getElementById('sbDashBtn').classList.toggle('scrollbar-active', showScrollbarDash);
    if(showScrollbarDash){
      document.querySelectorAll('.filter-tag:not(#sbDashBtn)').forEach(b=>b.classList.remove('active'));
      showHomeDash = false;
      document.getElementById('homeBtn').classList.remove('home-active');
      showCssDash = false;
      document.getElementById('cssDashBtn').classList.remove('css-active');
      showEdDash = false;
      document.getElementById('edDashBtn').classList.remove('ed-active');
      showDevDash = false;
      document.getElementById('devDashBtn').classList.remove('dev-active');
      showB64Dash = false;
      document.getElementById('b64DashBtn').classList.remove('b64-active');
      showQrDash = false;
      document.getElementById('qrDashBtn').classList.remove('qr-active');
      showFavDash = false;
      const __favSb = document.getElementById('favDashBtn');
      if(__favSb) __favSb.classList.remove('fav-active');
      showCpDash = false;
      document.getElementById('cpDashBtn').classList.remove('cp-active');
      showRtDash = false;
      document.getElementById('rtDashBtn').classList.remove('rt-active');
    }
    renderAll();
  }

  function updateSbConfig(key, value){
    sbConfig[key] = value;
    renderScrollbarPreview();
    applyLiveScrollbar();
  }

  function generateScrollbarCSS(){
    return `:root {
  --scrollbar-thumb-color: ${sbConfig.thumbColor};
  --scrollbar-track-color: ${sbConfig.trackColor};
  --scrollbar-thumb-hover-color: ${sbConfig.thumbHoverColor};
  --scrollbar-background-fallback: ${sbConfig.bgFallback};
  --scrollbar-color-fallback: ${sbConfig.colorFallback};
}

* {
  scrollbar-color: var(--scrollbar-color-fallback) var(--scrollbar-background-fallback);
  scrollbar-width: thin;
}

::-webkit-scrollbar {
  width: ${sbConfig.width};
}

::-webkit-scrollbar-track {
  background: var(--scrollbar-track-color);
}

::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb-color);
  border-radius: ${sbConfig.radius};
}

::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover-color);
}`;
  }

  function applyLiveScrollbar(){
    const box = document.getElementById('sbLiveBox');
    if(!box) return;
    const style = document.getElementById('sbLiveStyle') || (() => {
      const s = document.createElement('style');
      s.id = 'sbLiveStyle';
      document.head.appendChild(s);
      return s;
    })();
    style.textContent = `
      #sbLiveBox::-webkit-scrollbar { width: ${sbConfig.width}; }
      #sbLiveBox::-webkit-scrollbar-track { background: ${sbConfig.trackColor}; }
      #sbLiveBox::-webkit-scrollbar-thumb { background: ${sbConfig.thumbColor}; border-radius: ${sbConfig.radius}; }
      #sbLiveBox::-webkit-scrollbar-thumb:hover { background: ${sbConfig.thumbHoverColor}; }
      #sbLiveBox { scrollbar-color: ${sbConfig.colorFallback} ${sbConfig.bgFallback}; scrollbar-width: thin; }
    `;
  }

  function highlightScrollbarCSS(css){
    let s = escHtml(css);
    s = s.replace(/(\/\*[\s\S]*?\*\/|\/\/[^\n]*)/g, m => `<span class="sb-css-cmt">${m}</span>`);
    s = s.replace(/(--[\w-]+)/g, m => `<span class="sb-css-var">${m}</span>`);
    s = s.replace(/(:root|\*|::-webkit-scrollbar(?:-track|-thumb)?|:hover)/g, m => `<span class="sb-css-sel">${m}</span>`);
    s = s.replace(/(scrollbar-color|scrollbar-width|background|border-radius|width)\s*:/g, (m, p) => `<span class="sb-css-prop">${p}</span> :`);
    s = s.replace(/:\s*([^;{}\n]+)(?=[;}\n])/g, (m, val) => {
      if (val.includes('var(')) return ': ' + val.replace(/var\(\s*(--[\w-]+)\s*\)/g, (_, v) => `<span class="sb-css-var">var(${v})</span>`);
      if (val.trim().match(/^#[0-9a-fA-F]{3,8}$/) || val.trim().match(/^\d+px$/)) return `: <span class="sb-css-val">${val}</span>`;
      return m;
    });
    return s;
  }

  function renderScrollbarPreview(){
    const css = generateScrollbarCSS();
    const preview = document.getElementById('sbPreview');
    if(preview) preview.innerHTML = highlightScrollbarCSS(css);

    ['thumbColor','trackColor','thumbHoverColor','bgFallback','colorFallback'].forEach(key => {
      const swatch = document.getElementById('sbSwatch_' + key);
      if(swatch) swatch.style.background = sbConfig[key];
    });
  }

  function copyScrollbarCSS(){
    const css = generateScrollbarCSS();
    navigator.clipboard.writeText(css).then(() => {
      const btn = document.getElementById('sbCopyBtn');
      btn.innerHTML = '<i class="ti ti-check"></i> تم النسخ';
      btn.classList.add('copied');
      showToast('تم نسخ كود السكرول بار!');
      setTimeout(() => {
        btn.innerHTML = '<i class="ti ti-copy"></i> نسخ الكود';
        btn.classList.remove('copied');
      }, 2000);
    }).catch(() => showToast('تعذّر النسخ'));
  }

  function renderScrollbarDash(){
    document.getElementById('countBadge').textContent = 'Scrollbar Builder';

    const liveItems = Array.from({length: 12}, (_, i) => {
      const items = [
        { kw: '.navbar', str: '{ background: #1a1a1f; padding: 16px; }' },
        { kw: '.navbar a', str: '{ color: #f0ede8; text-decoration: none; margin: 0 12px; font-size: 14px; }' },
        { kw: '.navbar .logo', str: '{ font-size: 20px; font-weight: 800; color: #e8734a; }' },
        { kw: '.hero', str: '{ padding: 80px 24px; text-align: center; background: linear-gradient(135deg, #141417, #1a1a1f); }' },
        { kw: '.hero h1', str: '{ font-size: 2.5rem; font-weight: 700; color: #f0ede8; margin-bottom: 16px; }' },
        { kw: '.hero p', str: '{ font-size: 1.1rem; color: #9b9693; max-width: 600px; margin: 0 auto; }' },
        { kw: '.btn-primary', str: '{ background: #e8734a; color: #fff; padding: 12px 28px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; }' },
        { kw: '.features', str: '{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; padding: 48px 24px; }' },
        { kw: '.card', str: '{ background: #1a1a1f; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 24px; }' },
        { kw: '.card h3', str: '{ font-size: 18px; color: #f0ede8; margin-bottom: 8px; }' },
        { kw: '.card p', str: '{ font-size: 13px; color: #5c5855; line-height: 1.6; }' },
        { kw: '.footer', str: '{ padding: 24px; text-align: center; color: #5c5855; border-top: 1px solid rgba(255,255,255,0.06); }' }
      ];
      const item = items[i % items.length];
      return `<div class="sb-live-item"><span class="sb-live-sel">${item.kw}</span> <span class="sb-live-str">${item.str}</span></div>`;
    }).join('');

    document.getElementById('mainBody').innerHTML = `<div class="has-dash">${designHero('sb')}</div><div class="sb-builder">
      <div class="sb-builder-title"><i class="ti ti-scroll"></i> بناء سكرول بار مخصص</div>

      <div class="sb-live-wrap">
        <div class="sb-controls-col">
          <div class="sb-section-title" style="margin-top:0">
            <i class="ti ti-palette" style="color:#8b5cf6"></i>
            الألوان
          </div>

          <div class="sb-swatch-row">
            <span class="sb-swatch" id="sbSwatch_thumbColor" style="background:${sbConfig.thumbColor}"></span>
            <div class="sb-swatch-input">
              <label class="form-label" style="margin:0;min-width:100px">Thumb</label>
              <input class="sb-input" type="color" value="${sbConfig.thumbColor}" id="sbPick_thumbColor"
                oninput="updateSbConfig('thumbColor',this.value); document.getElementById('sbTxt_thumbColor').value=this.value">
              <input class="sb-input" type="text" value="${sbConfig.thumbColor}" style="max-width:90px"
                oninput="updateSbConfig('thumbColor',this.value); document.getElementById('sbPick_thumbColor').value=this.value"
                id="sbTxt_thumbColor">
            </div>
          </div>

          <div class="sb-swatch-row">
            <span class="sb-swatch" id="sbSwatch_trackColor" style="background:${sbConfig.trackColor}"></span>
            <div class="sb-swatch-input">
              <label class="form-label" style="margin:0;min-width:100px">Track</label>
              <input class="sb-input" type="color" value="${sbConfig.trackColor}" id="sbPick_trackColor"
                oninput="updateSbConfig('trackColor',this.value); document.getElementById('sbTxt_trackColor').value=this.value">
              <input class="sb-input" type="text" value="${sbConfig.trackColor}" style="max-width:90px"
                oninput="updateSbConfig('trackColor',this.value); document.getElementById('sbPick_trackColor').value=this.value"
                id="sbTxt_trackColor">
            </div>
          </div>

          <div class="sb-swatch-row">
            <span class="sb-swatch" id="sbSwatch_thumbHoverColor" style="background:${sbConfig.thumbHoverColor}"></span>
            <div class="sb-swatch-input">
              <label class="form-label" style="margin:0;min-width:100px">Hover</label>
              <input class="sb-input" type="color" value="${sbConfig.thumbHoverColor}" id="sbPick_thumbHoverColor"
                oninput="updateSbConfig('thumbHoverColor',this.value); document.getElementById('sbTxt_thumbHoverColor').value=this.value">
              <input class="sb-input" type="text" value="${sbConfig.thumbHoverColor}" style="max-width:90px"
                oninput="updateSbConfig('thumbHoverColor',this.value); document.getElementById('sbPick_thumbHoverColor').value=this.value"
                id="sbTxt_thumbHoverColor">
            </div>
          </div>

          <div class="sb-swatch-row">
            <span class="sb-swatch" id="sbSwatch_bgFallback" style="background:${sbConfig.bgFallback}"></span>
            <div class="sb-swatch-input">
              <label class="form-label" style="margin:0;min-width:100px">BG Fallback</label>
              <input class="sb-input" type="color" value="${sbConfig.bgFallback}" id="sbPick_bgFallback"
                oninput="updateSbConfig('bgFallback',this.value); document.getElementById('sbTxt_bgFallback').value=this.value">
              <input class="sb-input" type="text" value="${sbConfig.bgFallback}" style="max-width:90px"
                oninput="updateSbConfig('bgFallback',this.value); document.getElementById('sbPick_bgFallback').value=this.value"
                id="sbTxt_bgFallback">
            </div>
          </div>

          <div class="sb-swatch-row">
            <span class="sb-swatch" id="sbSwatch_colorFallback" style="background:${sbConfig.colorFallback}"></span>
            <div class="sb-swatch-input">
              <label class="form-label" style="margin:0;min-width:100px">Color Fallback</label>
              <input class="sb-input" type="color" value="${sbConfig.colorFallback}" id="sbPick_colorFallback"
                oninput="updateSbConfig('colorFallback',this.value); document.getElementById('sbTxt_colorFallback').value=this.value">
              <input class="sb-input" type="text" value="${sbConfig.colorFallback}" style="max-width:90px"
                oninput="updateSbConfig('colorFallback',this.value); document.getElementById('sbPick_colorFallback').value=this.value"
                id="sbTxt_colorFallback">
            </div>
          </div>

          <div class="sb-section-title">
            <i class="ti ti-ruler" style="color:var(--accent-warm)"></i>
            الأبعاد
          </div>

          <div class="sb-grid">
            <div class="form-group">
              <label class="form-label">العرض <code>width</code></label>
              <input class="sb-input" type="text" value="${sbConfig.width}"
                oninput="updateSbConfig('width',this.value)" placeholder="8px">
            </div>
            <div class="form-group">
              <label class="form-label">استدارة <code>border-radius</code></label>
              <input class="sb-input" type="text" value="${sbConfig.radius}"
                oninput="updateSbConfig('radius',this.value)" placeholder="5px">
            </div>
          </div>
        </div>

        <div class="sb-preview-col">
          <div class="sb-section-title" style="margin-top:0">
            <i class="ti ti-eye" style="color:var(--success)"></i>
            معاينة حية
          </div>
          <div class="sb-live-box" id="sbLiveBox">
            <div class="sb-live-box-title"><i class="ti ti-code"></i> Preview Content — اسحب لرؤية السكرول</div>
            ${liveItems}
          </div>
        </div>
      </div>

      <div class="sb-preview-wrap">
        <div class="sb-preview-label">
          <span>كود CSS النهائي</span>
          <button class="copy-btn" onclick="copyScrollbarCSS()" id="sbCopyBtn" style="font-size:10px;padding:3px 10px">
            <i class="ti ti-copy"></i> نسخ الكود
          </button>
        </div>
        <pre class="sb-preview" id="sbPreview">${highlightScrollbarCSS(generateScrollbarCSS())}</pre>
      </div>
    </div>`;

    applyLiveScrollbar();
    document.querySelectorAll('.code-pre').forEach(el => el.classList.toggle('wrap', wrapMode));
  }

