  // ── COLOR PALETTE TOOL ──
  let cpBase        = { h: 39, s: 0.67, v: 0.71 };
  let cpHarmonyMode = 'complementary';
  let cpGradType    = 'linear';
  let cpGradAngle   = 225;
  let cpGradStops   = [{ hex: '#B58A3B', pos: 0 }, { hex: '#D0AD6D', pos: 100 }];
  let cfSourceHex   = '#000000';
  let cfTargetHex   = '#E8734A';
  let cfPickMode    = false;
  let cfFilter      = null;
  let cfManual      = false;
  let cfLastRaw     = '';

  let cvgPrimary    = '#EF8015';
  let cvgDarkPct    = 30, cvgLightPct = 40, cvgRevPct = 60, cvgSecPct = 100;
  let cvgRevColor   = '#FF0000', cvgSecColor = '#00FFFF';
  let cvgVars       = [{ name: '3', color: '#FFFFFF', pct: 94 }, { name: '4', color: '#00FF00', pct: 50 }];
  let cvgShowBoxes  = true;

  function cpClamp(v, a, b){ return Math.min(b, Math.max(a, v)); }
  function cpWrapHue(h){ return ((h % 360) + 360) % 360; }
  function cpHexToRgb(hex){
    if (!hex) return null;
    let s = String(hex).trim().replace('#','');
    if (s.length === 3) s = s[0]+s[0]+s[1]+s[1]+s[2]+s[2];
    if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;
    return { r: parseInt(s.slice(0,2),16), g: parseInt(s.slice(2,4),16), b: parseInt(s.slice(4,6),16) };
  }
  function cpRgbToHex(r, g, b){
    return '#' + [r,g,b].map(v => cpClamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('').toUpperCase();
  }
  function cpHsvToRgb(h, s, v){
    h = cpWrapHue(h) / 60;
    const i = Math.floor(h), f = h - i;
    const p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - s * (1 - f));
    let r, g, b;
    switch(i % 6){
      case 0: r=v; g=t; b=p; break;
      case 1: r=q; g=v; b=p; break;
      case 2: r=p; g=v; b=t; break;
      case 3: r=p; g=q; b=v; break;
      case 4: r=t; g=p; b=v; break;
      default: r=v; g=p; b=q;
    }
    return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];
  }
  function cpRgbToHsv(r, g, b){
    r/=255; g/=255; b/=255;
    const mx = Math.max(r,g,b), mn = Math.min(r,g,b), d = mx - mn;
    let h = 0;
    if (d){
      if (mx === r) h = ((g - b) / d) % 6;
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    return { h, s: mx ? d / mx : 0, v: mx };
  }
  function cpHslToRgb(h, s, l){
    h = cpWrapHue(h);
    const c = (1 - Math.abs(2*l - 1)) * s;
    const x = c * (1 - Math.abs(((h/60) % 2) - 1));
    const m = l - c/2;
    let r=0, g=0, b=0;
    if (h < 60){ r=c; g=x; } else if (h < 120){ r=x; g=c; }
    else if (h < 180){ g=c; b=x; } else if (h < 240){ g=x; b=c; }
    else if (h < 300){ r=x; b=c; } else { r=c; b=x; }
    return [Math.round((r+m)*255), Math.round((g+m)*255), Math.round((b+m)*255)];
  }
  function cpRgbToHsl(r, g, b){
    r/=255; g/=255; b/=255;
    const mx = Math.max(r,g,b), mn = Math.min(r,g,b);
    const l = (mx + mn) / 2, d = mx - mn;
    let h = 0, s = 0;
    if (d){
      s = d / (1 - Math.abs(2*l - 1));
      if (mx === r) h = ((g - b) / d) % 6;
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    return { h, s, l };
  }
  function cpHsvToHex(base){
    const [r,g,b] = cpHsvToRgb(base.h, base.s, base.v);
    return cpRgbToHex(r,g,b);
  }
  function cpBaseHsl(){
    const [r,g,b] = cpHsvToRgb(cpBase.h, cpBase.s, cpBase.v);
    return cpRgbToHsl(r,g,b);
  }
  function cpHslItem(a){ const [r,g,b] = cpHslToRgb(a.c[0], a.c[1], a.c[2]); return { hex: cpRgbToHex(r,g,b), n: a.n || '' }; }

  function cpCopyText(text, msg){
    const done = () => showToast(msg || 'تم النسخ!');
    const fail = () => showToast('تعذّر النسخ');
    // Legacy path for non-secure contexts (file://) or rejected permissions —
    // without it the button dies silently when navigator.clipboard is missing.
    const legacy = () => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;top:-999px;left:-999px;opacity:0;';
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        if (ok) done(); else fail();
      } catch(e){ fail(); }
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(done, legacy);
      } else legacy();
    } catch(e){ legacy(); }
  }
  function cpCopyHex(hex){ cpCopyText(hex, 'تم نسخ ' + hex); }

  function cpSwatchHtml(item){
    return `<div class="cp-swatch" title="${item.hex}">
      <div class="cp-swatch-box" style="background:${item.hex}" onclick="cpCopyHex('${item.hex}')">
        <span class="cp-swatch-hex">${item.hex}</span>
        <span class="cp-swatch-add" title="أضف للتدرج" onclick="event.stopPropagation(); cpAddStopHex('${item.hex}')">+</span>
      </div>
      <span class="cp-swatch-name">${escHtml(item.n)}</span>
    </div>`;
  }
  function cpRenderRow(id, items){
    const el = document.getElementById(id);
    if (el) el.innerHTML = items.map(cpSwatchHtml).join('');
  }

  function cpHarmonyList(){
    const b = cpBaseHsl(), h = b.h, s = b.s, l = b.l;
    switch(cpHarmonyMode){
      case 'analogous': return [
        { c:[cpWrapHue(h-30), s, l] }, { c:[h, s, l] }, { c:[cpWrapHue(h+30), s, l] }
      ];
      case 'triadic': return [
        { c:[h, s, l] }, { c:[cpWrapHue(h+120), s, l], n:'+120°' }, { c:[cpWrapHue(h+240), s, l], n:'+240°' }
      ];
      case 'split': return [
        { c:[h, s, l] }, { c:[cpWrapHue(h+150), s, l], n:'+150°' }, { c:[cpWrapHue(h+210), s, l], n:'+210°' }
      ];
      case 'square': return [
        { c:[h, s, l] }, { c:[cpWrapHue(h+90), s, l], n:'+90°' },
        { c:[cpWrapHue(h+180), s, l], n:'+180°' }, { c:[cpWrapHue(h+270), s, l], n:'+270°' }
      ];
      case 'shades': return [
        { c:[h, s, cpClamp(l+0.28, 0, 0.92)], n:'فاتح جداً' },
        { c:[h, s, cpClamp(l+0.14, 0, 1)], n:'فاتح' },
        { c:[h, s, l], n:'أساسي' },
        { c:[h, s, cpClamp(l-0.14, 0, 1)], n:'غامق' },
        { c:[h, cpClamp(s*1.1, 0, 1), cpClamp(l-0.28, 0, 1)], n:'غامق جداً' }
      ];
      default: return [
        { c:[h, s, l] }, { c:[cpWrapHue(h+180), s, l], n:'مكمل' }
      ];
    }
  }
  function cpMainList(){
    const { h, s, l } = cpBaseHsl();
    return [
      { c:[h, s, l], n:'أساسي', v:'--primary' },
      { c:[h, s, cpClamp(l+0.15, 0, 1)], n:'فاتح +15', v:'--primary-light' },
      { c:[h, s, cpClamp(l-0.15, 0, 1)], n:'غامق -15', v:'--primary-dark' },
      { c:[h, s*0.35, cpClamp(l+0.24, 0, 1)], n:'شاحب', v:'--primary-pale' },
      { c:[h, cpClamp(s*1.45, 0, 1), cpClamp(l-0.06, 0, 1)], n:'مشبّع', v:'--primary-vivid' },
      { c:[cpWrapHue(h-14), s, l], n:'دافئ', v:'--primary-warm' },
      { c:[cpWrapHue(h+18), s, l], n:'بارد', v:'--primary-cool' }
    ];
  }
  function cpDarkList(){
    const { h, s, l } = cpBaseHsl();
    return [
      { c:[h, s*0.5, 0.03], n:'خلفية رئيسية', v:'--dm-bg' },
      { c:[h, s*0.55, 0.08], n:'خلفية ثانوية', v:'--dm-bg-alt' },
      { c:[h, s*0.6, 0.13], n:'كارد', v:'--dm-card' },
      { c:[h, s*0.65, 0.20], n:'حدود', v:'--dm-border' },
      { c:[h, s*0.9, cpClamp(l*0.72, 0, 1)], n:'أكسنت داكن', v:'--dm-accent-dark' },
      { c:[h, s, l], n:'أكسنت متوسط', v:'--dm-accent' },
      { c:[h, s*0.18, 0.58], n:'نص ثانوي', v:'--dm-text' },
      { c:[h, s*0.15, 0.38], n:'نص خافت', v:'--dm-text-muted' }
    ];
  }
  function cpLightList(){
    const { h, s, l } = cpBaseHsl();
    return [
      { c:[h, s*0.08, 0.97], n:'ورقي', v:'--lm-paper' },
      { c:[h, s*0.22, 0.95], n:'خلفية ثانوية', v:'--lm-bg-alt' },
      { c:[h, 0, 1], n:'بطاقة', v:'--lm-card' },
      { c:[h, s*0.32, 0.88], n:'حدود فاتحة', v:'--lm-border' },
      { c:[h, s, cpClamp(l+0.13, 0, 1)], n:'أكسنت فاتح', v:'--lm-accent-light' },
      { c:[h, s, l], n:'أكسنت متوسط', v:'--lm-accent' },
      { c:[h, s*0.25, 0.35], n:'نص ثانوي', v:'--lm-text' },
      { c:[h, s*0.14, 0.55], n:'نص خافت', v:'--lm-text-muted' }
    ];
  }

  function cpDrawWheel(){
    const cv = document.getElementById('cp-wheel');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const size = cv.width, R = size / 2;
    const img = ctx.createImageData(size, size), d = img.data;
    for (let y = 0; y < size; y++){
      for (let x = 0; x < size; x++){
        const dx = x - R + 0.5, dy = y - R + 0.5;
        const dist = Math.sqrt(dx*dx + dy*dy) / R;
        const i = (y*size + x) * 4;
        if (dist <= 1){
          let ang = Math.atan2(dy, dx) * 180 / Math.PI;
          if (ang < 0) ang += 360;
          const [r,g,b] = cpHsvToRgb(ang, Math.min(dist, 1), 1);
          d[i] = r; d[i+1] = g; d[i+2] = b; d[i+3] = 255;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    const mr = cpBase.s * (R - 6), ma = cpBase.h * Math.PI / 180;
    const mx = R + Math.cos(ma) * mr, my = R + Math.sin(ma) * mr;
    ctx.beginPath();
    ctx.arc(mx, my, 6, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.beginPath();
    ctx.arc(mx, my, 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.65)'; ctx.lineWidth = 1; ctx.stroke();
  }
  function cpWheelPick(e){
    const cv = document.getElementById('cp-wheel');
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (cv.width / rect.width) - cv.width/2;
    const y = (e.clientY - rect.top) * (cv.height / rect.height) - cv.height/2;
    let ang = Math.atan2(y, x) * 180 / Math.PI;
    if (ang < 0) ang += 360;
    cpBase.h = ang;
    cpBase.s = Math.min(Math.sqrt(x*x + y*y) / (cv.width/2), 1);
    cpRefresh();
  }

  function cpCurrentHex(){ return cpHsvToHex(cpBase); }
  function cpSetFromHex(hex){
    const rgb = cpHexToRgb(hex);
    if (!rgb) return false;
    cpBase = cpRgbToHsv(rgb.r, rgb.g, rgb.b);
    cpRefresh();
    return true;
  }
  function cpSyncInputs(hex){
    const dot = document.getElementById('cp-color-dot');
    if (dot) dot.style.background = hex;
    const picker = document.getElementById('cp-color-picker');
    if (picker && picker.value.toLowerCase() !== hex.toLowerCase()) picker.value = hex;
    const hexIn = document.getElementById('cp-hex-input');
    if (hexIn && document.activeElement !== hexIn) hexIn.value = hex;
  }
  function cpRefresh(){
    const hex = cpCurrentHex();
    cpSyncInputs(hex);
    cpDrawWheel();
    cpRenderRow('cp-harmony-swatches', cpHarmonyList().map(cpHslItem));
    cpRenderRow('cp-main-swatches', cpMainList().map(cpHslItem));
    cpRenderRow('cp-dark-swatches', cpDarkList().map(cpHslItem));
    cpRenderRow('cp-light-swatches', cpLightList().map(cpHslItem));
    cpRenderChips();
    cpRenderStops();
    cpRenderGradBar();
  }
  function cpRandom(){
    cpBase = { h: Math.random()*360, s: 0.4 + Math.random()*0.55, v: 0.55 + Math.random()*0.42 };
    cpRefresh();
  }
  function cpSetHarmony(mode, btn){
    cpHarmonyMode = mode;
    document.querySelectorAll('.cp-htab').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    cpRenderRow('cp-harmony-swatches', cpHarmonyList().map(cpHslItem));
  }

  function cpRenderChips(){
    const el = document.getElementById('cp-quick-add-chips');
    if (!el) return;
    const items = [...cpMainList().slice(1), ...cpHarmonyList().filter(x=>x.n==='مكمل'||x.n==='+120°'||x.n==='+150°').map(x=>({c:x.c,n:''}))].map(cpHslItem);
    const seen = new Set();
    const uniq = [];
    items.forEach(it => {
      const k = it.hex.toLowerCase();
      if (!seen.has(k)){ seen.add(k); uniq.push(it); }
    });
    el.innerHTML = uniq.map(it =>
      `<div class="cp-qac" style="background:${it.hex}" title="${it.hex}" data-hex="${it.hex}">
        <span class="cp-qac-label">${escHtml(it.n || it.hex)}</span>
      </div>`).join('');
    el.querySelectorAll('.cp-qac').forEach(chip => {
      chip.addEventListener('click', () => cpAddStopHex(chip.dataset.hex));
    });
  }

  function cpNextPos(){
    const ps = cpGradStops.map(s => s.pos).sort((a,b) => a - b);
    if (!ps.length) return 50;
    const bounds = [[0, ps[0]]];
    for (let i = 1; i < ps.length; i++) bounds.push([ps[i-1], ps[i]]);
    bounds.push([ps[ps.length-1], 100]);
    let bestGap = -1, bestPos = 50;
    bounds.forEach(([a, b]) => {
      const gap = b - a;
      if (gap > bestGap){ bestGap = gap; bestPos = Math.round((a+b)/2); }
    });
    return cpClamp(bestPos, 0, 100);
  }
  function cpAddStopHex(hex){
    if (cpGradStops.length >= 8){ showToast('الحد الأقصى 8 ألوان للتدرج'); return; }
    cpGradStops.push({ hex: hex.toUpperCase(), pos: cpNextPos() });
    cpRenderStops();
    cpRenderGradBar();
  }
  function cpStopColor(i, val){ cpGradStops[i].hex = val.toUpperCase(); cpRenderGradBar(); const box = event.target.closest('.cp-gs-color'); if (box) box.style.background = val; }
  function cpStopPos(i, val){
    cpGradStops[i].pos = Number(val);
    const lbl = event.target.nextElementSibling;
    if (lbl) lbl.textContent = val + '%';
    cpRenderGradBar();
  }
  function cpStopDel(i){
    if (cpGradStops.length <= 2) return;
    cpGradStops.splice(i, 1);
    cpRenderStops();
    cpRenderGradBar();
  }
  function cpRenderStops(){
    const w = document.getElementById('cp-grad-stops');
    if (!w) return;
    w.innerHTML = cpGradStops.map((s, i) => `
      <div class="cp-gs">
        <div class="cp-gs-color" style="background:${s.hex}" title="انقر لتغيير اللون">
          <input type="color" class="cp-gs-picker" value="${s.hex}" oninput="cpStopColor(${i}, this.value)">
        </div>
        <input type="range" class="cp-gs-slider" min="0" max="100" value="${s.pos}" oninput="cpStopPos(${i}, this.value)">
        <span class="cp-gs-label">${s.pos}%</span>
        <span class="cp-gs-remove" style="visibility:${cpGradStops.length <= 2 ? 'hidden' : 'visible'}" onclick="cpStopDel(${i})" title="حذف">×</span>
      </div>`).join('');
  }
  function cpGradValue(){
    const st = [...cpGradStops].sort((a,b) => a.pos - b.pos)
      .map(s => `${s.hex.toLowerCase()} ${s.pos}%`).join(', ');
    if (cpGradType === 'radial') return `radial-gradient(circle, ${st})`;
    if (cpGradType === 'conic') return `conic-gradient(from ${cpGradAngle}deg, ${st})`;
    return `linear-gradient(${cpGradAngle}deg, ${st})`;
  }
  function cpRenderGradBar(){
    const bar = document.getElementById('cp-gradient-bar');
    if (bar) bar.style.background = cpGradValue();
  }
  function cpCopyGradient(){
    cpCopyText(`background: ${cpGradValue()};`, 'تم نسخ كود التدرج!');
  }
  function cpCopyTextGrad(){
    const css = `background-image: ${cpGradValue()};\n-webkit-background-clip: text;\nbackground-clip: text;\n-webkit-text-fill-color: transparent;\ncolor: transparent;`;
    cpCopyText(css, 'تم نسخ تدرج النص!');
  }

  function cpBuildCss(){
    const L = ['/* Color Palette — generated by مدير الأكواد */', ':root {'];
    cpMainList().forEach(x => L.push(`  ${x.v}: ${cpHslItem(x).hex.toLowerCase()};`));
    L.push('');
    L.push('  /* Dark Mode */');
    cpDarkList().forEach(x => L.push(`  ${x.v}: ${cpHslItem(x).hex.toLowerCase()};`));
    L.push('');
    L.push('  /* Light Mode */');
    cpLightList().forEach(x => L.push(`  ${x.v}: ${cpHslItem(x).hex.toLowerCase()};`));
    L.push('}');
    L.push('');
    L.push(`/* Gradient */\n.gradient { background: ${cpGradValue()}; }`);
    return L.join('\n');
  }
  function cpExportCss(){ cpCopyText(cpBuildCss(), 'تم نسخ كود CSS الكامل!'); }
  function cpCopyAll(){
    const all = new Set();
    [...cpMainList(), ...cpDarkList(), ...cpLightList()].forEach(x => all.add(cpHslItem(x).hex.toUpperCase()));
    cpCopyText([...all].join(', '), `تم نسخ ${all.size} لون!`);
  }
  function cpPreviewCode(){
    const pre = document.getElementById('cp-css-preview');
    if (!pre) return;
    const show = !pre.classList.contains('show');
    if (show) pre.textContent = cpBuildCss();
    pre.classList.toggle('show', show);
    const btn = document.getElementById('cp-preview-css');
    if (btn) btn.textContent = show ? 'إخفاء الكود' : 'عرض الكود';
  }

  // ── CF core: exact model of how browsers chain CSS filter primitives ──
  // Each shorthand function is a separate primitive; its output is clamped
  // to [0,1] per channel before the next primitive runs. All math in sRGB.
  function cfClamp01(x){ return x < 0 ? 0 : x > 1 ? 1 : x; }
  function cfApplyPipe(raw, f){
    let r = raw.r/255, g = raw.g/255, b = raw.b/255;
    const iv = f.inv;
    r = cfClamp01(r*(1 - 2*iv) + iv); g = cfClamp01(g*(1 - 2*iv) + iv); b = cfClamp01(b*(1 - 2*iv) + iv);
    const sp = f.sep;
    if (sp > 0){
      const nr = cfClamp01((1-sp)*r + sp*(0.393*r + 0.769*g + 0.189*b));
      const ng = cfClamp01((1-sp)*g + sp*(0.349*r + 0.686*g + 0.168*b));
      const nb = cfClamp01((1-sp)*b + sp*(0.272*r + 0.534*g + 0.131*b));
      r = nr; g = ng; b = nb;
    }
    {
      const k = f.sat;
      const nr = cfClamp01((0.213+0.787*k)*r + (0.715-0.715*k)*g + (0.072-0.072*k)*b);
      const ng = cfClamp01((0.213-0.213*k)*r + (0.715+0.285*k)*g + (0.072-0.072*k)*b);
      const nb = cfClamp01((0.213-0.213*k)*r + (0.715-0.715*k)*g + (0.072+0.928*k)*b);
      r = nr; g = ng; b = nb;
    }
    {
      const th = f.hue * Math.PI / 180, co = Math.cos(th), si = Math.sin(th);
      const nr = cfClamp01((0.213+co*0.787-si*0.213)*r + (0.715-co*0.715-si*0.715)*g + (0.072-co*0.072+si*0.928)*b);
      const ng = cfClamp01((0.213-co*0.213+si*0.143)*r + (0.715+co*0.285+si*0.140)*g + (0.072-co*0.072-si*0.283)*b);
      const nb = cfClamp01((0.213-co*0.213-si*0.787)*r + (0.715-co*0.715+si*0.715)*g + (0.072+co*0.928+si*0.072)*b);
      r = nr; g = ng; b = nb;
    }
    r = cfClamp01(r*f.bri); g = cfClamp01(g*f.bri); b = cfClamp01(b*f.bri);
    const cc = f.con;
    r = cfClamp01(r*cc + 0.5*(1-cc)); g = cfClamp01(g*cc + 0.5*(1-cc)); b = cfClamp01(b*cc + 0.5*(1-cc));
    return { r: r*255, g: g*255, b: b*255 };
  }

  // ── Color science: sRGB → Lab (D65) and CIEDE2000 ──
  function cfQuant(c){ return { r: Math.round(c.r), g: Math.round(c.g), b: Math.round(c.b) }; }
  function cfLin(c){ c /= 255; return c <= 0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); }
  function cfLabF(t){ return t > 216/24389 ? Math.cbrt(t) : (24389/27*t + 16)/116; }
  function cfRgbToLab(r, g, b){
    const R = cfLin(r), G = cfLin(g), B = cfLin(b);
    const x = (0.4124564*R + 0.3575761*G + 0.1804375*B) * 100;
    const y = (0.2126729*R + 0.7151522*G + 0.0721750*B) * 100;
    const z = (0.0193339*R + 0.1191920*G + 0.9503041*B) * 100;
    const fx = cfLabF(x/95.047), fy = cfLabF(y/100), fz = cfLabF(z/108.883);
    return { L: 116*fy - 16, a: 500*(fx-fy), b: 200*(fy-fz) };
  }
  function cfDe2000(A, B){
    const rad = Math.PI/180;
    const C1 = Math.hypot(A.a, A.b), C2 = Math.hypot(B.a, B.b), Cb = (C1+C2)/2;
    const G = 0.5*(1 - Math.sqrt(Math.pow(Cb,7)/(Math.pow(Cb,7)+Math.pow(25,7))));
    const Ap1 = A.a*(1+G), Ap2 = B.a*(1+G);
    const Cp1 = Math.hypot(Ap1, A.b), Cp2 = Math.hypot(Ap2, B.b);
    const hp1 = Cp1 < 1e-9 ? 0 : (Math.atan2(A.b, Ap1)/rad + 360) % 360;
    const hp2 = Cp2 < 1e-9 ? 0 : (Math.atan2(B.b, Ap2)/rad + 360) % 360;
    const dL = B.L - A.L, dC = Cp2 - Cp1;
    let dhp = 0;
    if (Cp1*Cp2 !== 0){
      dhp = hp2 - hp1;
      if (dhp > 180) dhp -= 360; else if (dhp < -180) dhp += 360;
    }
    const dH = 2*Math.sqrt(Cp1*Cp2)*Math.sin(dhp/2*rad);
    const Lb = (A.L+B.L)/2, Cbp = (Cp1+Cp2)/2;
    let hb;
    if (Cp1*Cp2 === 0) hb = hp1 + hp2;
    else {
      hb = (hp1+hp2)/2;
      if (Math.abs(hp1-hp2) > 180) hb += (hp1+hp2 < 360 ? 180 : -180);
    }
    const T = 1 - 0.17*Math.cos((hb-30)*rad) + 0.24*Math.cos(2*hb*rad)
            + 0.32*Math.cos((3*hb+6)*rad) - 0.20*Math.cos((4*hb-63)*rad);
    const RT = -Math.sin(2*((30*Math.exp(-Math.pow((hb-275)/25,2)))*rad)) * 2*Math.sqrt(Math.pow(Cbp,7)/(Math.pow(Cbp,7)+Math.pow(25,7)));
    const SL = 1 + 0.015*Math.pow(Lb-50,2)/Math.sqrt(20+Math.pow(Lb-50,2));
    const SC = 1 + 0.045*Cbp;
    const SH = 1 + 0.015*Cbp*T;
    const tL = dL/SL, tC = dC/SC, tH = dH/SH;
    return Math.sqrt(tL*tL + tC*tC + tH*tH + RT*tC*tH);
  }

  // ── Deterministic bounded Nelder-Mead over [inv, sep, sat, hue, bri, con] ──
  function cfNM(evl, x0, steps, iters, bounds){
    const n = x0.length;
    const proj = x => x.map((v,i) => cpClamp(v, bounds[i][0], bounds[i][1]));
    const verts = [proj(x0.slice())];
    for (let i = 0; i < n; i++){ const x = x0.slice(); x[i] += steps[i]; verts.push(proj(x)); }
    let vals = verts.map(evl);
    for (let it = 0; it < iters; it++){
      const order = vals.map((l,i)=>i).sort((a,b)=>vals[a]-vals[b]);
      const V = order.map(i=>verts[i]), L = order.map(i=>vals[i]);
      if (L[n]-L[0] < 1e-8) break;
      const cen = new Array(n).fill(0);
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) cen[j] += V[i][j]/n;
      const W = V[n], wl = L[n];
      const refl = proj(cen.map((c,j)=>c+(c-W[j])));
      const rl = evl(refl);
      if (rl < L[0]){
        const exp = proj(cen.map((c,j)=>c+2*(c-W[j])));
        const el = evl(exp);
        verts[n] = el < rl ? exp : refl; vals[n] = Math.min(el, rl);
      } else if (rl < L[n-1]){
        verts[n] = refl; vals[n] = rl;
      } else {
        const src = rl < wl ? refl : W;
        const con = proj(cen.map((c,j)=>c+0.5*(src[j]-c)));
        const cl = evl(con);
        if (cl < (rl < wl ? rl : wl)){ verts[n] = con; vals[n] = cl; }
        else {
          for (let i = 1; i <= n; i++){
            verts[i] = proj(V[0].map((c,j)=>c+0.5*(V[i][j]-c)));
            vals[i] = evl(verts[i]);
          }
        }
      }
    }
    let bi = 0;
    vals.forEach((l,i)=>{ if (l < vals[bi]) bi = i; });
    return { x: verts[bi].slice(), l: vals[bi] };
  }

  // Snap to the exact integer percentages the string will display,
  // then hill-climb on that integer grid so WYSIWYG stays optimal.
  function cfCanonicalize(v){
    const pc = i => cpClamp(Math.round(v[i]*100), 0, i===2 ? 10000 : i===4||i===5 ? 1000 : 100)/100;
    let hue = Math.round(v[3]);
    hue = ((hue % 360) + 360) % 360;
    if (hue > 180) hue -= 360;
    return { inv: pc(0), sep: pc(1), sat: pc(2), hue, bri: pc(4), con: pc(5) };
  }
  // Multi-scale descent on the EXACT renderable (integer-snapped) objective.
  // Smooth optimizers stall on clamp cliffs; quantized coordinate descent
  // handles them natively because it only ever scores real outputs.
  function cfRefine(f, loss){
    const sched = {
      inv:[0.08, 0.03, 0.01], sep:[0.08, 0.03, 0.01],
      sat:[2, 0.7, 0.25, 0.08], hue:[24, 8, 3, 1],
      bri:[1.2, 0.4, 0.12, 0.04], con:[0.8, 0.3, 0.1, 0.03]
    };
    let cur = loss(f);
    for (const k of Object.keys(sched)){
      for (const st of sched[k]){
        let improved = true, guard = 0;
        while (improved && guard++ < 24){
          improved = false;
          for (const s of [st, -st]){
            const cand = { ...f, [k]: f[k] + s };
            if ((k === 'inv' || k === 'sep') && (cand[k] < 0 || cand[k] > 1)) continue;
            if (cand[k] < 0) continue;
            const l = loss(cand);
            if (l < cur - 1e-9){ cur = l; Object.assign(f, cand); improved = true; }
          }
        }
      }
    }
    return cur;
  }
  // Memoized wrapper — renderAll() re-renders often; never re-solve a pair twice.
  const cfSolveCache = new Map();
  function cfSolveCached(srcHex, dstHex){
    const key = srcHex + '|' + dstHex;
    if (cfSolveCache.has(key)) return cfSolveCache.get(key);
    const sol = cfSolve(srcHex, dstHex);
    if (sol && !cfManual){
      if (cfSolveCache.size > 80) cfSolveCache.delete(cfSolveCache.keys().next().value);
      cfSolveCache.set(key, sol);
    }
    return sol;
  }
  function cfSolve(srcHex, dstHex){
    const S = cpHexToRgb(srcHex), T = cpHexToRgb(dstHex);
    if (!S || !T) return null;
    const tLab = cfRgbToLab(T.r, T.g, T.b);
    // Quantized loss for final scoring/refinement (matches what renders),
    // smooth loss for the optimizer (rounding plateaus stall Nelder-Mead).
    const objLoss = f => {
      const o = cfQuant(cfApplyPipe(S, f));
      return cfDe2000(cfRgbToLab(o.r, o.g, o.b), tLab);
    };
    const smoothLoss = f => {
      const o = cfApplyPipe(S, f);
      return cfDe2000(cfRgbToLab(o.r, o.g, o.b), tLab);
    };
    const vecLoss = v => smoothLoss({ inv:v[0], sep:v[1], sat:v[2], hue:v[3], bri:v[4], con:v[5] });
    const tv = cpRgbToHsv(T.r, T.g, T.b);
    const sepWhite = cfQuant(cfApplyPipe({r:255,g:255,b:255}, {inv:0, sep:1, sat:1, hue:0, bri:1, con:1}));
    const sepHue = cpRgbToHsv(sepWhite.r, sepWhite.g, sepWhite.b).h;
    const hOff = (((tv.h - sepHue) % 360) + 540) % 360 - 180;

    // Deterministic per-target RNG so results never change between runs.
    let lcg = ((T.r << 16) ^ (T.g << 8) ^ T.b ^ Math.round(tv.h * 7919) ^ 0x9E3779B9) >>> 0;
    const rnd = () => ((lcg = (Math.imul(lcg, 1664525) + 1013904223) >>> 0) / 4294967296);
    const logU = (a, b) => Math.exp(Math.log(a) + rnd() * (Math.log(b) - Math.log(a)));
    const bounds = [[0,1],[0,1],[0,100],[-180,180],[0,10],[0,10]];
    const proj = v => v.map((x,i) => cpClamp(x, bounds[i][0], bounds[i][1]));

    // ── Stage 0: broad cheap screening, then focused densification ──
    // Vivid/dark hues hide in narrow low-sepia basins hand-picked seeds
    // never visit. Screen thousands of candidates with a fast RGB proxy,
    // jitter-densify around the winners, THEN promote to the real loss.
    const cheap = v => {
      const o = cfApplyPipe(S, { inv:v[0], sep:v[1], sat:v[2], hue:v[3], bri:v[4], con:v[5] });
      const dr = o.r - T.r, dg = o.g - T.g, db = o.b - T.b;
      return dr*dr + dg*dg + db*db;
    };
    const scored = [];
    const pushSeed = v => { const p = proj(v); scored.push({ v: p, l: cheap(p) }); };
    for (let i = 0; i < 6000; i++){
      pushSeed([rnd(), rnd(), logU(0.15,100), rnd()*360-180, logU(0.08,9), logU(0.15,6)]);
    }
    pushSeed([0,0,1,0,1,1]);
    pushSeed([1,0,1,0,1,1]);
    pushSeed([0,1,1,hOff,Math.max(0.15,tv.v/0.94),1]);
    for (const p of [0.08, 0.18, 0.32, 0.5, 0.68, 0.85]){
      const w = cfQuant(cfApplyPipe({r:255,g:255,b:255}, {inv:p, sep:1, sat:1, hue:0, bri:1, con:1}));
      const wv = cpRgbToHsv(w.r, w.g, w.b);
      pushSeed([p, 1, cpClamp(tv.s/Math.max(wv.s,0.03), 0.2, 90), hOff,
                cpClamp(tv.v/Math.max(wv.v,0.04), 0.1, 9), 1]);
    }
    if (tv.s > 0.8){
      for (const [p, sk] of [[0.05,12],[0.09,28],[0.14,55],[0.2,90]]){
        pushSeed([p, 1, sk, hOff, cpClamp(tv.v/(p*1.35), 0.2, 9), 1]);
      }
    }
    // ratio-derived low-sepia grid — the recurring blind spot for purples/blues
    for (const p of [0.05, 0.1, 0.16, 0.24]){
      for (const sp of [0.08, 0.16, 0.26]){
        const w = cfQuant(cfApplyPipe({r:255,g:255,b:255}, {inv:p, sep:sp, sat:1, hue:0, bri:1, con:1}));
        const wv = cpRgbToHsv(w.r, w.g, w.b);
        pushSeed([p, sp, cpClamp(tv.s/Math.max(wv.s,0.02), 0.2, 100), hOff,
                  cpClamp(tv.v/Math.max(wv.v,0.03), 0.1, 10), 1]);
      }
    }
    // systematic hue-offset sweep: valleys are hue-aligned, give every
    // starting angle a chance instead of trusting hOff alone
    for (let hd = -160; hd <= 160; hd += 20){
      pushSeed([0.09, 0.15, 8 + tv.s*45, hOff + hd, cpClamp(tv.v/0.75, 0.2, 8), 1.1]);
    }
    // Deterministic lattice over (inv × sep × sat-decade × hue-offset ×
    // contrast-family) with brightness pre-calibrated from white — narrow
    // 6-D valleys have ~1e-6 chance of being hit by random search alone;
    // this guarantees every coarse cell gets sampled regardless of RNG
    // luck. Hue variants span ±85° because real winners keep landing
    // 20-70° away from hOff; contrast spans below/above 1 because exact
    // solutions repeatedly need con < 1 (#996633 → 0.61).
    for (const iv of [0.04, 0.08, 0.12, 0.22, 0.34, 0.5, 0.7]){
      for (const sp of [0.08, 0.2, 0.36, 0.56, 0.78, 0.92]){
        for (const sk of [0.4, 1.2, 3.5, 10, 26, 40, 55, 90]){
          const w = cfQuant(cfApplyPipe({r:255,g:255,b:255}, {inv:iv, sep:sp, sat:sk, hue:0, bri:1, con:1}));
          const wv = cpRgbToHsv(w.r, w.g, w.b);
          const bri0 = cpClamp(tv.v/Math.max(wv.v,0.02), 0.05, 10);
          const HUES = [
            [hOff, bri0], [hOff-25, bri0*1.06], [hOff+25, bri0*0.94],
            [hOff-50, bri0*1.08], [hOff+50, bri0*0.92],
            [hOff-85, bri0], [hOff+85, bri0]
          ];
          for (const [hh, bb] of HUES){
            pushSeed([iv, sp, sk, hh, bb, 1]);
            pushSeed([iv, sp, sk, hh, bb*0.9, 0.65]);
            pushSeed([iv, sp, sk, hh, bb*1.08, 1.35]);
          }
        }
      }
    }
    scored.sort((a,b) => a.l - b.l);

    // jitter-densify around the 50 cheapest points (log-scale on gains)
    const jitters = [
      x => x + (rnd()*2-1)*0.05,
      x => x + (rnd()*2-1)*0.08,
      x => Math.max(0.05, x * Math.exp((rnd()*2-1)*0.7)),
      x => x + (rnd()*2-1)*22,
      x => Math.max(0.02, x * Math.exp((rnd()*2-1)*0.6)),
      x => Math.max(0.02, x * Math.exp((rnd()*2-1)*0.6))
    ];
    const base = scored.slice(0, 50);
    for (let b = 0; b < base.length && scored.length < 7500; b++){
      for (let k = 0; k < 26; k++) pushSeed(base[b].v.map((x,i) => jitters[i](x)));
    }
    scored.sort((a,b) => a.l - b.l);

    // promote the shortlist to the perceptual loss
    const shortlist = scored.slice(0, 80).map(s => ({ v: s.v, l: vecLoss(s.v) }));
    shortlist.sort((a,b) => a.l - b.l);

    // ── Stage 1: Nelder-Mead from the most promising distinct basins ──
    const steps = [0.25, 0.4, 5, 90, 1.0, 0.7];
    const gaps  = [0.06, 0.06, 0.6, 18, 0.25, 0.2];
    const results = [], seen = [];
    for (const sd of shortlist){
      if (results.length >= 8) break;
      if (seen.some(sv => sv.every((x,i) => Math.abs(x - sd.v[i]) < gaps[i]))) continue;
      seen.push(sd.v.slice());
      results.push(cfNM(vecLoss, sd.v, steps, 240, bounds));
      if (results.some(r => r.l < 1e-4)) break;
    }
    results.sort((a,b) => a.l - b.l);

    // ── Stage 2: polish the best basins with tighter steps ──
    const ps = [0.1, 0.15, 2, 35, 0.4, 0.3];
    for (const r of results.slice(0, 2)){
      if (r.l < 1e-4) break;
      const p2 = cfNM(vecLoss, r.x, ps, 180, bounds);
      if (p2.l < r.l) results.push(p2);
    }
    results.sort((a,b) => a.l - b.l);
    if (results[0].l >= 0.002){
      const p3 = cfNM(vecLoss, results[0].x, [0.04, 0.06, 0.8, 12, 0.15, 0.12], 140, bounds);
      if (p3.l < results[0].l){ results.push(p3); results.sort((a,b) => a.l - b.l); }
    }
    // Round the top candidates and run multi-scale exact-objective descent
    // from each distinct basin — the smooth proxy can misrank clamp-cliff
    // winners, so let the true renderable objective pick the final answer.
    const pickBest = () => {
      let bf = null, bd = Infinity;
      const seenB = new Set();
      for (const r of results.slice(0, 12)){
        const cand = cfCanonicalize(r.x);
        const key = ['inv','sep','sat','hue','bri','con'].map(k => Math.round(cand[k]*100)).join(',');
        if (seenB.has(key)) continue;
        seenB.add(key);
        const d = cfRefine(cand, objLoss);
        if (d < bd){ bd = d; bf = cand; }
        if (bd < 0.02) break;
      }
      return { f: bf, de: bd };
    };
    let out = pickBest();

    // Independent global second opinion: fresh RNG salt, smaller screen,
    // a few NM runs — catches basins the first pass never sampled.
    // Fired only when the TRUE quantized result is still mediocre; the
    // smooth proxy alone would misjudge clamp-cliff cases like #996633.
    if (out.de > 1.2){
      lcg = (lcg ^ 0xB5297A4D) >>> 0;
      const retry = [];
      const pushRetry = v => { const p = proj(v); retry.push({ v: p, l: cheap(p) }); };
      for (let i = 0; i < 5000; i++){
        pushRetry([rnd(), rnd(), logU(0.15,100), rnd()*360-180, logU(0.08,9), logU(0.15,6)]);
      }
      for (let hd = -160; hd <= 160; hd += 40){
        pushRetry([rnd(), rnd()*0.3 + 0.05, 4 + tv.s*60, hOff + hd, cpClamp(tv.v/0.7, 0.15, 9), 1]);
      }
      retry.sort((a,b) => a.l - b.l);
      const sl2 = retry.slice(0, 30).map(s => ({ v: s.v, l: vecLoss(s.v) }));
      sl2.sort((a,b) => a.l - b.l);
      for (const sd of sl2.slice(0, 4)){
        const r2 = cfNM(vecLoss, sd.v, steps, 180, bounds);
        if (r2.l < results[0].l) results.push(r2);
        if (results.some(r => r.l < 1e-4)) break;
      }
      results.sort((a,b) => a.l - b.l);
      out = pickBest();
    }
    return out;
  }
  function cfBuildRaw(f){
    const pc = v => Math.round(v*100);
    return `invert(${pc(f.inv)}%) sepia(${pc(f.sep)}%) saturate(${pc(f.sat)}%) hue-rotate(${Math.round(f.hue)}deg) brightness(${pc(f.bri)}%) contrast(${pc(f.con)}%)`;
  }
  function cfBuildString(f){ return 'filter: ' + cfBuildRaw(f) + ';'; }
  // Ground truth: render through the real engine and read the pixel back.
  function cfVerify(raw, srcHex){
    try {
      const c1 = document.createElement('canvas'); c1.width = c1.height = 1;
      const x1 = c1.getContext('2d'); x1.fillStyle = srcHex; x1.fillRect(0,0,1,1);
      const c2 = document.createElement('canvas'); c2.width = c2.height = 1;
      const x2 = c2.getContext('2d');
      if (typeof x2.filter !== 'string') return null;
      x2.filter = raw; x2.drawImage(c1, 0, 0);
      const d = x2.getImageData(0,0,1,1).data;
      return { r: d[0], g: d[1], b: d[2] };
    } catch(e){ return null; }
  }
  function cfUpdate(){
    const out = document.getElementById('cf-filter-output');
    if (!out) return;
    const S = cpHexToRgb(cfSourceHex), T = cpHexToRgb(cfTargetHex);
    if (!S || !T) return;
    const same = S.r === T.r && S.g === T.g && S.b === T.b;
    if (!cfManual || !cfFilter){
      if (same){ cfFilter = { inv:0, sep:0, sat:1, hue:0, bri:1, con:1 }; }
      else {
        const sol = cfSolveCached(cfSourceHex, cfTargetHex);
        if (!sol) return;
        cfFilter = sol.f;
      }
    }
    const raw = same ? 'none' : cfBuildRaw(cfFilter);
    const str = same ? 'filter: none;' : cfBuildString(cfFilter);
    cfLastRaw = raw;
    out.textContent = str;

    // WYSIWYG: evaluate the exact integer params that appear in the string,
    // then confirm against the real engine via canvas ctx.filter.
    const mathO = cfQuant(cfApplyPipe(S, cfFilter));
    const ver = same ? { r:T.r, g:T.g, b:T.b } : cfVerify(raw, cfSourceHex);
    const ach = ver || mathO;
    const de = same ? 0 : cfDe2000(cfRgbToLab(ach.r, ach.g, ach.b), cfRgbToLab(T.r, T.g, T.b));

    const hex = cpRgbToHex(ach.r, ach.g, ach.b);
    const dot = document.getElementById('cf-target-result-dot');
    const hexEl = document.getElementById('cf-target-result-hex');
    if (dot) dot.style.background = hex;
    if (hexEl) hexEl.textContent = hex;

    const badge = document.getElementById('cf-de-badge');
    if (badge){
      let cls = 'good', txt = 'تطابق مثالي';
      if (de > 10){ cls = 'bad'; txt = 'يحتاج ضبط'; }
      else if (de > 5){ cls = 'mid'; txt = 'مقبول'; }
      else if (de > 2){ cls = 'ok'; txt = 'قريب جداً'; }
      badge.className = 'cf-de-badge ' + cls;
      badge.textContent = '\u0394E ' + de.toFixed(1) + ' \u00b7 ' + txt + (ver ? '' : ' \u00b7 حسابياً');
    }

    // live preview rendered by the actual CSS engine
    const prev = document.getElementById('cf-preview-filtered');
    if (prev && prev.src) prev.style.filter = raw === 'none' ? '' : raw;

    // sliders mirror the active solution (without fighting an active drag)
    [['inv', Math.round(cfFilter.inv*100)], ['sep', Math.round(cfFilter.sep*100)],
     ['sat', Math.round(cfFilter.sat*100)], ['hue', Math.round(cfFilter.hue)],
     ['bri', Math.round(cfFilter.bri*100)], ['con', Math.round(cfFilter.con*100)]]
      .forEach(([k, v]) => {
        const inp = document.getElementById('cf-s-' + k);
        const lab = document.getElementById('cf-v-' + k);
        if (inp && document.activeElement !== inp) inp.value = k === 'hue' ? cpClamp(v, -180, 180) : v;
        if (lab) lab.textContent = k === 'hue' ? v + '\u00b0' : v + '%';
      });
  }
  function cfSetSource(hex){
    const rgb = cpHexToRgb(hex);
    if (!rgb) return;
    cfSourceHex = cpRgbToHex(rgb.r, rgb.g, rgb.b);
    const dot = document.getElementById('cf-image-color');
    const hexEl = document.getElementById('cf-image-hex');
    if (dot) dot.style.background = cfSourceHex;
    if (hexEl) hexEl.textContent = cfSourceHex;
    if (cfPickMode){
      cfPickMode = false;
      const b = document.getElementById('cf-dropper-btn');
      if (b) b.classList.remove('picking');
      cfLoupeHide();
    }
    cfManual = false;
    cfUpdate();
  }
  function cfLoupeMove(e){
    if (!cfPickMode) return;
    const cv = document.getElementById('cf-image-canvas'), lp = document.getElementById('cf-loupe');
    if (!cv || !lp) return;
    const rect = cv.getBoundingClientRect();
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
    const px = cx * (cv.width / rect.width), py = cy * (cv.height / rect.height);
    if (cx < 0 || cy < 0 || cx >= rect.width || cy >= rect.height){ lp.style.display = 'none'; return; }
    lp.style.display = 'block';
    lp.style.left = cpClamp(cx - 46, 0, rect.width - 92) + 'px';
    lp.style.top = (cy < 96 ? cy + 18 : cy - 110) + 'px';
    const ctx = lp.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 92, 92);
    ctx.drawImage(cv, px - 7, py - 7, 14, 14, 0, 0, 84, 84);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(38.5, 38.5, 15, 15);
    ctx.strokeStyle = '#000'; ctx.strokeRect(40, 40, 12, 12);
  }
  function cfLoupeHide(){
    const lp = document.getElementById('cf-loupe');
    if (lp) lp.style.display = 'none';
  }
  function cfToggleDropper(){
    if (window.EyeDropper){
      try { new EyeDropper().open().then(r => cfSetSource(r.sRGBHex)).catch(() => showToast('تم إلغاء الالتقاط')); return; } catch(e){}
    }
    cfPickMode = !cfPickMode;
    const b = document.getElementById('cf-dropper-btn');
    if (b) b.classList.toggle('picking', cfPickMode);
    if (!cfPickMode) cfLoupeHide();
    showToast(cfPickMode ? 'انقر على الصورة لالتقاط لون' : 'تم إلغاء وضع الالتقاط');
  }
  function cfCanvasClick(e){
    if (!cfPickMode) return;
    const cv = document.getElementById('cf-image-canvas');
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (cv.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (cv.height / rect.height));
    try {
      const d = cv.getContext('2d').getImageData(cpClamp(x,0,cv.width-1), cpClamp(y,0,cv.height-1), 1, 1).data;
      cfSetSource(cpRgbToHex(d[0], d[1], d[2]));
    } catch(err){}
  }
  function cfLoadFile(file){
    if (!file || !file.type || !file.type.startsWith('image/')){ showToast('اختر ملف صورة صالح'); return; }
    const rd = new FileReader();
    rd.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const cv = document.getElementById('cf-image-canvas');
        if (!cv) return;
        const scale = Math.min(1, 520 / Math.max(img.width, img.height));
        cv.width = Math.max(1, Math.round(img.width * scale));
        cv.height = Math.max(1, Math.round(img.height * scale));
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        const prev = document.getElementById('cf-preview-filtered');
        if (prev){
          prev.src = ev.target.result;
          prev.style.display = 'block';
          prev.style.filter = '';
        }
        const dz = document.getElementById('cf-drop-zone');
        const ic = document.getElementById('cf-image-container');
        if (dz) dz.style.display = 'none';
        if (ic) ic.style.display = 'flex';
        cfUpdate();
      };
      img.onerror = () => showToast('تعذّر تحميل الصورة');
      img.src = ev.target.result;
    };
    rd.readAsDataURL(file);
  }
  function cfReset(){
    const dz = document.getElementById('cf-drop-zone');
    const ic = document.getElementById('cf-image-container');
    if (dz) dz.style.display = 'flex';
    if (ic) ic.style.display = 'none';
    const fi = document.getElementById('cf-file-input');
    if (fi) fi.value = '';
    const prev = document.getElementById('cf-preview-filtered');
    if (prev){ prev.removeAttribute('src'); prev.style.filter = ''; }
    cfPickMode = false;
    cfLoupeHide();
    const b = document.getElementById('cf-dropper-btn');
    if (b) b.classList.remove('picking');
    cfUpdate();
  }

  function cvgMix(base, second, pct){
    const m = mixColors(base, second, pct);
    return m ? m.toUpperCase() : base;
  }
  function cvgCss(){
    const L = ['\u200B'];
    L[L.length-1] = ':root {';
    L.push(`    --1: ${cvgPrimary.toLowerCase()};`);
    L.push('    --color-primary: var(--1);');
    L.push(`    --color-primary-dark: color-mix(in srgb, var(--1), black ${cvgDarkPct}%);`);
    L.push(`    --color-primary-light: color-mix(in srgb, var(--1), white ${cvgLightPct}%);`);
    L.push(`    --color-primary-reverse: color-mix(in srgb, var(--1), ${cvgRevColor.toLowerCase()} ${cvgRevPct}%);`);
    L.push(`    --2: color-mix(in srgb, var(--1), ${cvgSecColor.toLowerCase()} ${cvgSecPct}%);`);
    cvgVars.forEach(v => {
      const nm = String(v.name || '').trim().replace(/^--+/, '').replace(/\s+/g, '-') || ('var' + (cvgVars.indexOf(v) + 3));
      L.push(`    --${nm}: color-mix(in srgb, var(--1), ${v.color.toLowerCase()} ${v.pct}%);`);
    });
    L.push('}');
    return L.join('\n');
  }
  function cvgRefresh(){
    const out = document.getElementById('cvg-css-output');
    if (out) out.textContent = cvgCss();
    const pd = document.getElementById('cvg-primary-dot');
    const pi = document.getElementById('cvg-primary-input');
    if (pd) pd.style.background = cvgPrimary;
    if (pi && pi.value.toLowerCase() !== cvgPrimary.toLowerCase()) pi.value = cvgPrimary;
    const map = {
      'cvg-preview-primary': cvgPrimary,
      'cvg-preview-dark': cvgMix(cvgPrimary, '#000000', cvgDarkPct),
      'cvg-preview-light': cvgMix(cvgPrimary, '#FFFFFF', cvgLightPct),
      'cvg-preview-reverse': cvgMix(cvgPrimary, cvgRevColor, cvgRevPct),
      'cvg-preview-secondary': cvgMix(cvgPrimary, cvgSecColor, cvgSecPct)
    };
    Object.keys(map).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.background = map[id];
    });
    const rd = document.getElementById('cvg-reverse-dot');
    const ri = document.getElementById('cvg-reverse-color');
    if (rd) rd.style.background = cvgRevColor;
    if (ri && ri.value.toLowerCase() !== cvgRevColor.toLowerCase()) ri.value = cvgRevColor;
    const sd = document.getElementById('cvg-secondary-dot');
    const si2 = document.getElementById('cvg-secondary-color');
    if (sd) sd.style.background = cvgSecColor;
    if (si2 && si2.value.toLowerCase() !== cvgSecColor.toLowerCase()) si2.value = cvgSecColor;
  }
  function cvgRenderVars(){
    const wrap = document.getElementById('cvg-dynamic-vars');
    if (!wrap) return;
    if (!cvgVars.length){
      wrap.innerHTML = '<div style="font-size:9px;color:var(--text-tertiary);padding:4px 0;">لا توجد متغيرات — اضغط "+ إضافة"</div>';
      return;
    }
    wrap.innerHTML = cvgVars.map((v, i) => `
      <div class="cvg-var-row">
        <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text-tertiary);direction:ltr;">--</span>
        <input class="cvg-var-name" value="${escHtml(v.name)}" placeholder="اسم المتغير" oninput="cvgVarName(${i}, this.value)">
        <div class="cp-gs-color" style="background:${v.color};width:22px;height:22px;border-radius:6px;" title="لون الخلط">
          <input type="color" class="cp-gs-picker" value="${v.color}" oninput="cvgVarColor(${i}, this.value); this.parentNode.style.background=this.value;">
        </div>
        <input type="range" min="0" max="100" value="${v.pct}" style="width:64px;accent-color:var(--accent-primary);" oninput="cvgVarPct(${i}, this.value); this.nextElementSibling.textContent=this.value+'%'">
        <span class="cp-gs-label" style="min-width:26px;">${v.pct}%</span>
        <span class="cvg-var-del" onclick="cvgVarDel(${i})" title="حذف">×</span>
      </div>`).join('');
  }
  function cvgAddVar(){
    if (cvgVars.length >= 10){ showToast('الحد الأقصى 10 متغيرات'); return; }
    cvgVars.push({ name: String(cvgVars.length + 3), color: '#FFFFFF', pct: 50 });
    cvgRenderVars();
    cvgRefresh();
  }
  function cvgVarName(i, val){ cvgVars[i].name = val; cvgRefresh(); }
  function cvgVarColor(i, val){ cvgVars[i].color = val.toUpperCase(); cvgRefresh(); }
  function cvgVarPct(i, val){ cvgVars[i].pct = Number(val); cvgRefresh(); }
  function cvgVarDel(i){ cvgVars.splice(i, 1); cvgRenderVars(); cvgRefresh(); }
  function cvgCopyAll(){ cpCopyText(cvgCss(), 'تم نسخ متغيرات CSS!'); }
  function cvgToggleBoxes(){
    cvgShowBoxes = !cvgShowBoxes;
    const row = document.getElementById('cvg-preview-panel');
    if (row) row.style.display = cvgShowBoxes ? 'flex' : 'none';
    const btn = document.getElementById('cvg-toggle-preview');
    if (btn) btn.textContent = cvgShowBoxes ? 'إخفاء المعينات' : 'إظهار المعينات';
  }

  function renderCpDash(){
    const badge = document.getElementById('countBadge');
    if (badge) badge.textContent = 'أداة الألوان';

    document.getElementById('mainBody').innerHTML = `<div class="has-dash">${designHero('cp')}<div class="dt-builder cp">
      <div class="dt-builder-title"><i class="ti ti-palette"></i> مولّد لوحة الألوان
        <span>عجلة ألوان، تناسقات، وضع داكن/فاتح، محرر تدرجات، سحب لون من صورة مع فلتر CSS، ومولد متغيرات CSS</span>
      </div>

      <div style="font-size:10px;color:var(--text-secondary);margin-bottom:12px;">مُولّد لوحة الألوان — انقر على العجلة لاختيار لون</div>

      <div class="cp-section">
        <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:12px;">
          <div style="flex-shrink:0;">
            <canvas id="cp-wheel" width="180" height="180" style="cursor:crosshair;border-radius:50%;border:1px solid var(--border-subtle);display:block;"></canvas>
          </div>
          <div style="flex:1;min-width:220px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
              <div style="position:relative;">
                <div style="width:32px;height:32px;border-radius:8px;background:var(--border-subtle);cursor:pointer;overflow:hidden;border:1px solid var(--border-subtle);" onclick="cpOpenPicker('cp-color-picker')" title="اختيار لون">
                  <div style="width:100%;height:100%;background:${cpCurrentHex()};border-radius:6px;" id="cp-color-dot"></div>
                </div>
                <input type="color" id="cp-color-picker" value="${cpCurrentHex()}" style="position:absolute;width:1px;height:1px;opacity:0;">
              </div>
              <input type="text" id="cp-hex-input" value="${cpCurrentHex()}" maxlength="7" style="flex:1;min-width:90px;padding:6px 8px;border:1px solid var(--border-subtle);border-radius:8px;background:var(--canvas-raised);color:var(--text-primary);font-family:'JetBrains Mono',monospace;font-size:12px;text-align:center;direction:ltr;outline:none;" spellcheck="false">
              <button id="cp-generate-btn" style="padding:6px 14px;background:var(--accent-primary);color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-family:inherit;font-size:11px;white-space:nowrap;">توليد</button>
              <button id="cp-pick-btn" title="اخذ لون من الصفحة" style="width:32px;height:32px;border:1px solid var(--border-subtle);border-radius:8px;background:var(--glass-moderate);color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M2 22l1-1h3l9-9M7 21l3-3"/><path d="M16.5 7.5l-5-5L9 5l1 1 1 1-2 2-1-1L7 7l-2 2 1 1 1 1-2 2-1-1-1 1 5 5"/><path d="M19 2l3 3-2 2-3-3z"/></svg>
              </button>
            </div>
            <div id="cp-htabs" style="display:flex;gap:4px;flex-wrap:wrap;">
              <button class="cp-htab${cpHarmonyMode==='complementary'?' active':''}" data-h="complementary" onclick="cpSetHarmony('complementary', this)">متكاملة</button>
              <button class="cp-htab${cpHarmonyMode==='analogous'?' active':''}" data-h="analogous" onclick="cpSetHarmony('analogous', this)">متجاورة</button>
              <button class="cp-htab${cpHarmonyMode==='triadic'?' active':''}" data-h="triadic" onclick="cpSetHarmony('triadic', this)">ثلاثية</button>
              <button class="cp-htab${cpHarmonyMode==='split'?' active':''}" data-h="split" onclick="cpSetHarmony('split', this)">Split</button>
              <button class="cp-htab${cpHarmonyMode==='square'?' active':''}" data-h="square" onclick="cpSetHarmony('square', this)">مربعة</button>
              <button class="cp-htab${cpHarmonyMode==='shades'?' active':''}" data-h="shades" onclick="cpSetHarmony('shades', this)">تدرجات</button>
            </div>
            <div class="cp-swatch-row" id="cp-harmony-swatches" style="margin-top:8px;"></div>
          </div>
        </div>
      </div>

      <div class="cp-section">
        <div class="cp-section-header">
          <div class="cp-section-dot" style="background:var(--accent-primary);"></div>
          <span class="cp-section-title">الألوان الأساسية</span>
        </div>
        <div class="cp-swatch-row" id="cp-main-swatches"></div>
      </div>

      <div class="cp-section">
        <div class="cp-section-header">
          <div class="cp-section-dot" style="background:#3a3a4a;"></div>
          <span class="cp-section-title">وضع داكن — Dark Mode</span>
        </div>
        <div class="cp-swatch-row" id="cp-dark-swatches"></div>
      </div>

      <div class="cp-section">
        <div class="cp-section-header">
          <div class="cp-section-dot" style="background:#e8e4dc;"></div>
          <span class="cp-section-title">وضع فاتح — Light Mode</span>
        </div>
        <div class="cp-swatch-row" id="cp-light-swatches"></div>
      </div>

      <div class="cp-section">
        <div class="cp-section-header">
          <div class="cp-section-dot" style="background:linear-gradient(90deg,var(--accent-primary),var(--accent-warm));"></div>
          <span class="cp-section-title">محرر التدرج اللوني</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px;">
          <select id="cp-grad-type" style="padding:3px 8px;border:1px solid var(--border-subtle);border-radius:6px;background:var(--canvas-raised);color:var(--text-primary);font-family:inherit;font-size:10px;cursor:pointer;">
            <option value="linear"${cpGradType==='linear'?' selected':''}>Linear</option>
            <option value="radial"${cpGradType==='radial'?' selected':''}>Radial</option>
            <option value="conic"${cpGradType==='conic'?' selected':''}>Conic</option>
          </select>
          <div id="cp-grad-angle-wrap" style="display:flex;align-items:center;gap:6px;${cpGradType==='radial'?'display:none;':''}">
            <span style="font-size:9px;color:var(--text-tertiary);">Angle:</span>
            <input type="range" id="cp-grad-angle" min="0" max="360" value="${cpGradAngle}" style="width:80px;accent-color:var(--accent-primary);">
            <span id="cp-grad-angle-label" style="font-size:9px;color:var(--text-tertiary);min-width:30px;">${cpGradAngle}°</span>
          </div>
          <button id="cp-grad-add" style="margin-inline-start:auto;padding:3px 8px;background:var(--accent-primary);color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:10px;font-family:inherit;font-weight:600;">+ أضف لون</button>
        </div>
        <div class="cp-grad-stops" id="cp-grad-stops"></div>
        <div class="cp-qac-row" id="cp-quick-add-chips"></div>
        <div class="cp-gradient-bar" id="cp-gradient-bar" title="اضغط لنسخ تدرج النص" style="margin-top:8px;"></div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">
          <button class="cp-export-btn" id="cp-copy-gradient">نسخ التدرج CSS</button>
          <button class="cp-export-btn" id="cp-copy-text-grad">تدرج النص</button>
        </div>
      </div>

      <div style="display:flex;gap:6px;flex-wrap:wrap;padding-top:4px;margin-bottom:12px;">
        <button class="cp-export-btn" id="cp-export-css">تصدير CSS</button>
        <button class="cp-export-btn" id="cp-copy-all">نسخ كل HEX</button>
        <button class="cp-export-btn" id="cp-preview-css">عرض الكود</button>
      </div>
      <pre id="cp-css-preview"></pre>

      <div class="cp-section">
        <div class="cp-section-header">
          <div class="cp-section-dot" style="background:linear-gradient(135deg,#f87171,#fb923c);"></div>
          <span class="cp-section-title">سحب لون من صورة + CSS Filter</span>
        </div>
        <div id="cf-drop-zone" class="cf-drop-zone">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28" style="opacity:0.4;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <span style="font-size:10px;color:var(--text-tertiary);">اسحب صورة هنا أو انقر للاختيار</span>
          <input type="file" id="cf-file-input" accept="image/*" style="display:none;">
        </div>
        <div id="cf-image-container" class="cf-image-container" style="display:none;">
          <div class="cf-image-box">
            <div class="cf-image-label">الأصلية</div>
            <div class="cf-canvas-wrap">
              <canvas id="cf-image-canvas" class="cf-image-canvas" width="240" height="140"></canvas>
              <button id="cf-dropper-btn" class="cf-dropper-btn" title="التقاط لون من الشاشة، أو تفعيل وضع النقر على الصورة">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M2 22l1-1h3l9-9M7 21l3-3"/><path d="M16.5 7.5l-5-5L9 5l1 1 1 1-2 2-1-1L7 7l-2 2 1 1 1 1-2 2-1-1-1 1 5 5"/><path d="M19 2l3 3-2 2-3-3z"/></svg>
              </button>
              <canvas id="cf-loupe" class="cf-loupe" width="92" height="92"></canvas>
            </div>
          </div>
          <div class="cf-image-box">
            <div class="cf-image-label">بعد الفلتر — معاينة حقيقية</div>
            <img id="cf-preview-filtered" class="cf-preview-filtered cf-checker" alt="">
          </div>
        </div>
        <div class="cf-target-result-bar" style="margin-top:10px;">
          <div class="cf-target-result-dot" id="cf-target-result-dot"></div>
          <span class="cf-target-result-hex" id="cf-target-result-hex"></span>
          <span class="cf-de-badge good" id="cf-de-badge">&Delta;E 0.0 &middot; تطابق مثالي</span>
        </div>
        <div class="cf-colors-row">
          <div class="cf-color-card">
            <div class="cf-color-dot" id="cf-image-color" style="background:${cfSourceHex};"></div>
            <div>
              <div class="cf-color-label">لون الصورة</div>
              <div class="cf-color-hex" id="cf-image-hex">${cfSourceHex}</div>
            </div>
            <button class="cf-copy-btn" id="cf-copy-preview" title="نسخ">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
          </div>
          <div style="display:flex;align-items:center;font-size:14px;color:var(--text-tertiary);">&larr;</div>
          <div class="cf-color-card">
            <div class="cf-color-dot" id="cf-target-color" style="background:${cfTargetHex};"></div>
            <div>
              <div class="cf-color-label">اللون المطلوب</div>
              <input type="color" id="cf-target-input" value="${cfTargetHex}" class="cf-target-picker">
            </div>
            <button class="cp-export-btn" id="cf-apply-color" style="font-size:8px;padding:2px 6px;">من العجلة</button>
          </div>
        </div>
        <div class="cf-tune">
          <div class="cf-tune-head">
            <span class="cf-tune-title">ضبط يدوي — يعاد الحل تلقائياً عند تغيير اللون</span>
            <button class="cp-export-btn" id="cf-solve-btn" style="font-size:8px;padding:2px 8px;">حل تلقائي</button>
          </div>
          <div class="cf-tune-row"><span class="cf-tune-name">invert()</span><input type="range" id="cf-s-inv" min="0" max="100" value="0"><b class="cf-tune-val" id="cf-v-inv">0%</b></div>
          <div class="cf-tune-row"><span class="cf-tune-name">sepia()</span><input type="range" id="cf-s-sep" min="0" max="100" value="0"><b class="cf-tune-val" id="cf-v-sep">0%</b></div>
          <div class="cf-tune-row"><span class="cf-tune-name">saturate()</span><input type="range" id="cf-s-sat" min="0" max="10000" step="5" value="100"><b class="cf-tune-val" id="cf-v-sat">100%</b></div>
          <div class="cf-tune-row"><span class="cf-tune-name">hue-rotate()</span><input type="range" id="cf-s-hue" min="-180" max="180" value="0"><b class="cf-tune-val" id="cf-v-hue">0&deg;</b></div>
          <div class="cf-tune-row"><span class="cf-tune-name">brightness()</span><input type="range" id="cf-s-bri" min="0" max="1000" value="100"><b class="cf-tune-val" id="cf-v-bri">100%</b></div>
          <div class="cf-tune-row"><span class="cf-tune-name">contrast()</span><input type="range" id="cf-s-con" min="0" max="1000" value="100"><b class="cf-tune-val" id="cf-v-con">100%</b></div>
        </div>
        <div class="cf-filter-row">
          <pre class="cf-filter-output" id="cf-filter-output"></pre>
          <button class="cf-copy-btn" id="cf-copy-filter" title="نسخ Filter">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
        <div style="display:flex;gap:6px;margin-top:6px;">
          <button class="cp-export-btn" id="cf-reset">إعادة تعيين</button>
        </div>
      </div>

      <div class="cp-section">
        <div class="cp-section-header">
          <div class="cp-section-dot" style="background:linear-gradient(135deg,#818cf8,#c084fc);"></div>
          <span class="cp-section-title">مولّد متغيرات CSS</span>
        </div>
        <div class="cvg-primary-row">
          <div class="cvg-primary-dot" id="cvg-primary-dot" style="background:${cvgPrimary};" onclick="cpOpenPicker('cvg-primary-input')" title="تغيير اللون الأساسي"></div>
          <input type="color" id="cvg-primary-input" value="${cvgPrimary}" class="cvg-primary-picker">
          <span style="font-size:10px;color:var(--text-tertiary);flex:1;">اللون الأساسي</span>
          <button class="cf-copy-btn" id="cvg-copy-primary" title="نسخ">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
        <div class="cvg-preview-row" id="cvg-preview-panel"${cvgShowBoxes?'':' style="display:none;"'}>
          <div class="cvg-preview-box" id="cvg-preview-primary" style="background:${cvgPrimary};" title="أساسي"></div>
          <div class="cvg-preview-box" id="cvg-preview-dark" title="غامق"></div>
          <div class="cvg-preview-box" id="cvg-preview-light" title="فاتح"></div>
          <div class="cvg-preview-box" id="cvg-preview-reverse" title="معكوس"></div>
          <div class="cvg-preview-box" id="cvg-preview-secondary" title="ثانوي"></div>
        </div>
        <div class="cvg-slider-row">
          <span class="cvg-slider-label">غامق</span>
          <input type="range" id="cvg-dark" min="0" max="100" value="${cvgDarkPct}" class="cvg-slider">
          <span class="cvg-slider-val" id="cvg-dark-val">${cvgDarkPct}%</span>
        </div>
        <div class="cvg-slider-row">
          <span class="cvg-slider-label">فاتح</span>
          <input type="range" id="cvg-light" min="0" max="100" value="${cvgLightPct}" class="cvg-slider">
          <span class="cvg-slider-val" id="cvg-light-val">${cvgLightPct}%</span>
        </div>
        <div class="cvg-slider-row">
          <span class="cvg-slider-label">معكوس</span>
          <input type="range" id="cvg-reverse" min="0" max="100" value="${cvgRevPct}" class="cvg-slider">
          <span class="cvg-slider-val" id="cvg-reverse-val">${cvgRevPct}%</span>
          <div class="cvg-mix-color">
            <div class="cvg-mix-dot" id="cvg-reverse-dot" style="background:${cvgRevColor};" onclick="cpOpenPicker('cvg-reverse-color')" title="لون الخلط"></div>
            <input type="color" id="cvg-reverse-color" value="${cvgRevColor}" class="cvg-mix-picker">
          </div>
        </div>
        <div class="cvg-slider-row">
          <span class="cvg-slider-label">ثانوي</span>
          <input type="range" id="cvg-secondary" min="0" max="100" value="${cvgSecPct}" class="cvg-slider">
          <span class="cvg-slider-val" id="cvg-secondary-val">${cvgSecPct}%</span>
          <div class="cvg-mix-color">
            <div class="cvg-mix-dot" id="cvg-secondary-dot" style="background:${cvgSecColor};" onclick="cpOpenPicker('cvg-secondary-color')" title="لون الخلط"></div>
            <input type="color" id="cvg-secondary-color" value="${cvgSecColor}" class="cvg-mix-picker">
          </div>
        </div>
        <div class="cvg-dynamic-section">
          <div class="cvg-dynamic-header">
            <span style="font-size:9px;font-weight:600;color:var(--text-tertiary);">متغيرات مخصصة</span>
            <button class="cp-export-btn" id="cvg-add-var" style="font-size:8px;padding:2px 8px;">+ إضافة</button>
          </div>
          <div id="cvg-dynamic-vars" class="cvg-dynamic-vars"></div>
        </div>
        <div class="cvg-output-section">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;gap:6px;flex-wrap:wrap;">
            <span style="font-size:9px;font-weight:600;color:var(--text-tertiary);">الكود المُولّد</span>
            <div style="display:flex;gap:4px;">
              <button class="cp-export-btn" id="cvg-toggle-preview" style="font-size:8px;padding:2px 6px;">إخفاء المعينات</button>
              <button class="cp-export-btn" id="cvg-copy-all" style="font-size:8px;padding:2px 6px;">نسخ الكل</button>
            </div>
          </div>
          <pre class="cvg-css-output" id="cvg-css-output"></pre>
        </div>
      </div>
    </div></div>`;

    const $ = id => document.getElementById(id);

    $('cp-color-picker').addEventListener('input', e => cpSetFromHex(e.target.value));
    $('cp-hex-input').addEventListener('change', e => {
      if (!cpSetFromHex(e.target.value)) { e.target.value = cpCurrentHex(); showToast('كود HEX غير صالح'); }
    });
    $('cp-generate-btn').addEventListener('click', cpRandom);
    $('cp-pick-btn').addEventListener('click', async () => {
      if (window.EyeDropper){
        try { const r = await new EyeDropper().open(); cpSetFromHex(r.sRGBHex); } catch(e){}
      } else {
        showToast('متصفحك لا يدعم سحب اللون من الصفحة');
      }
    });

    let cpDragging = false;
    const wheel = $('cp-wheel');
    wheel.addEventListener('pointerdown', e => { cpDragging = true; wheel.setPointerCapture(e.pointerId); cpWheelPick(e); });
    wheel.addEventListener('pointermove', e => { if (cpDragging) cpWheelPick(e); });
    wheel.addEventListener('pointerup', () => { cpDragging = false; });

    $('cp-grad-type').addEventListener('change', e => {
      cpGradType = e.target.value;
      $('cp-grad-angle-wrap').style.display = cpGradType === 'radial' ? 'none' : 'flex';
      cpRenderGradBar();
    });
    $('cp-grad-angle').addEventListener('input', e => {
      cpGradAngle = Number(e.target.value);
      $('cp-grad-angle-label').textContent = cpGradAngle + '°';
      cpRenderGradBar();
    });
    $('cp-grad-add').addEventListener('click', () => cpAddStopHex(cpCurrentHex()));
    $('cp-gradient-bar').addEventListener('click', cpCopyGradient);
    $('cp-copy-gradient').addEventListener('click', cpCopyGradient);
    $('cp-copy-text-grad').addEventListener('click', cpCopyTextGrad);

    $('cp-export-css').addEventListener('click', cpExportCss);
    $('cp-copy-all').addEventListener('click', cpCopyAll);
    $('cp-preview-css').addEventListener('click', cpPreviewCode);

    const dz = $('cf-drop-zone'), fi = $('cf-file-input');
    dz.addEventListener('click', () => fi.click());
    fi.addEventListener('change', e => cfLoadFile(e.target.files[0]));
    ['dragenter','dragover'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('drag'); }));
    ['dragleave','drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('drag'); }));
    dz.addEventListener('drop', e => cfLoadFile(e.dataTransfer.files[0]));
    $('cf-dropper-btn').addEventListener('click', cfToggleDropper);
    const cfCv = $('cf-image-canvas');
    cfCv.addEventListener('click', cfCanvasClick);
    cfCv.addEventListener('pointermove', cfLoupeMove);
    cfCv.addEventListener('pointerleave', cfLoupeHide);
    $('cf-target-input').addEventListener('input', e => {
      cfTargetHex = e.target.value.toUpperCase();
      $('cf-target-color').style.background = cfTargetHex;
      cfManual = false;
      cfUpdate();
    });
    $('cf-apply-color').addEventListener('click', () => {
      cfTargetHex = cpCurrentHex();
      $('cf-target-color').style.background = cfTargetHex;
      $('cf-target-input').value = cfTargetHex;
      cfManual = false;
      cfUpdate();
    });
    $('cf-copy-preview').addEventListener('click', () => cpCopyText(cfSourceHex, 'تم نسخ ' + cfSourceHex));
    $('cf-copy-filter').addEventListener('click', () => {
      const txt = (cfLastRaw && cfLastRaw !== 'none' ? 'filter: ' + cfLastRaw + ';' : ($('cf-filter-output').textContent || '').trim());
      if (txt) cpCopyText(txt, 'تم نسخ الفلتر!');
    });
    $('cf-solve-btn').addEventListener('click', () => { cfManual = false; cfUpdate(); showToast('تم الحل التلقائي'); });
    [['inv',0.01],['sep',0.01],['sat',0.01],['hue',1],['bri',0.01],['con',0.01]].forEach(([k, scale]) => {
      const el = $('cf-s-' + k);
      if (!el) return;
      el.addEventListener('input', () => {
        cfManual = true;
        cfFilter = { ...(cfFilter || { inv:0, sep:0, sat:1, hue:0, bri:1, con:1 }), [k]: Number(el.value) * scale };
        cfUpdate();
      });
    });
    $('cf-reset').addEventListener('click', cfReset);

    $('cvg-primary-input').addEventListener('input', e => { cvgPrimary = e.target.value.toUpperCase(); cvgRefresh(); });
    $('cvg-copy-primary').addEventListener('click', () => cpCopyText(cvgPrimary, 'تم نسخ ' + cvgPrimary));
    [['cvg-dark','cvgDarkPct','cvg-dark-val'],['cvg-light','cvgLightPct','cvg-light-val'],
     ['cvg-reverse','cvgRevPct','cvg-reverse-val'],['cvg-secondary','cvgSecPct','cvg-secondary-val']]
      .forEach(([id, prop, out]) => {
        $(id).addEventListener('input', e => {
          if (prop === 'cvgDarkPct') cvgDarkPct = Number(e.target.value);
          else if (prop === 'cvgLightPct') cvgLightPct = Number(e.target.value);
          else if (prop === 'cvgRevPct') cvgRevPct = Number(e.target.value);
          else cvgSecPct = Number(e.target.value);
          $(out).textContent = e.target.value + '%';
          cvgRefresh();
        });
      });
    $('cvg-reverse-color').addEventListener('input', e => { cvgRevColor = e.target.value.toUpperCase(); cvgRefresh(); });
    $('cvg-secondary-color').addEventListener('input', e => { cvgSecColor = e.target.value.toUpperCase(); cvgRefresh(); });
    $('cvg-add-var').addEventListener('click', cvgAddVar);
    $('cvg-copy-all').addEventListener('click', cvgCopyAll);
    $('cvg-toggle-preview').addEventListener('click', cvgToggleBoxes);

    cvgRefresh();
    cvgRenderVars();
    cfUpdate();
    cpRefresh();
  }

  function cpOpenPicker(id){
    const el = document.getElementById(id);
    if (!el) return;
    if (typeof el.showPicker === 'function'){
      try { el.showPicker(); return; } catch(e){}
    }
    el.click();
  }

  function b64Show(tab){
    b64ActiveTab = tab;
    const panels = { encode:'b64EncodePanel', decode:'b64DecodePanel', image:'b64ImagePanel' };
    const btns   = { encode:'b64TabEncode',  decode:'b64TabDecode',  image:'b64TabImage' };
    Object.keys(panels).forEach(k => {
      const p = document.getElementById(panels[k]);
      if (p) p.classList.toggle('dt-hidden', k !== tab);
      const b = document.getElementById(btns[k]);
      if (b) b.classList.toggle('active', k === tab);
    });
    persistDashState();
  }

  function renderB64Dash(){
    const badge = document.getElementById('countBadge');
    if (badge) badge.textContent = 'أداة Base64';
    const valid = { encode:1, decode:1, image:1 };
    const active = valid[b64ActiveTab] ? b64ActiveTab : 'encode';
    const tabCls = t => t === active ? 'dt-tab active' : 'dt-tab';

    document.getElementById('mainBody').innerHTML = `<div class="has-dash">
      <div class="dt-builder b64">
        <div class="dt-builder-title"><i class="ti ti-binary"></i> أداة Base64
          <span>ترميز النصوص والملفات، فك الترميز، وتحويل الصور إلى Base64 جاهز للاستخدام</span>
        </div>

        <div class="dt-tabs">
          <button class="${tabCls('encode')}" id="b64TabEncode" onclick="b64Show('encode')"><i class="ti ti-lock"></i> Encode</button>
          <button class="${tabCls('decode')}" id="b64TabDecode" onclick="b64Show('decode')"><i class="ti ti-unlock"></i> Decode</button>
          <button class="${tabCls('image')}" id="b64TabImage" onclick="b64Show('image')"><i class="ti ti-photo"></i> صورة إلى Base64</button>
        </div>

        <div class="dt-panel${active === 'encode' ? '' : ' dt-hidden'}" id="b64EncodePanel">
          <div class="dt-head"><i class="ti ti-keyboard" style="color:#10b981"></i> النص للترميز</div>
          <textarea class="dt-textarea" id="b64EncodeInput" spellcheck="false" placeholder="اكتب أو الصق النص هنا..."></textarea>
          <div class="b64-live">
            <label class="b64-switch"><input type="checkbox" id="b64EncodeLive"><span class="b64-slider"></span></label>
            <span><i class="ti ti-bolt"></i> ترميز مباشر أثناء الكتابة</span>
          </div>

          <div class="dt-options">
            <label class="dt-option"><span>Chart:</span>
              <select class="b64-select" id="b64EncodeCharset">
                <optgroup label="Popular">
                  <option value="UTF-8" selected>UTF-8</option>
                  <option value="ASCII">ASCII</option>
                  <option value="ISO-8859-1">ISO-8859-1</option>
                  <option value="Windows-1252">Windows-1252</option>
                </optgroup>
              </select>
            </label>
            <label class="dt-option"><span>فاصل الأسطر:</span>
              <select class="b64-select" id="b64EncodeSep">
                <option value="lf">LF (Unix)</option>
                <option value="crlf">CRLF (Windows)</option>
              </select>
            </label>
            <label class="dt-option"><input type="checkbox" id="b64EncodeSplit"> تقسيم الأسطر (76 حرفًا - MIME)</label>
            <label class="dt-option"><input type="checkbox" id="b64EncodeUrlSafe"> ترميز آمن للروابط (Base64URL)</label>
          </div>

          <div class="b64-upload" id="b64EncodeUpload">
            <i class="ti ti-cloud-upload"></i>
            <p><strong>اضغط للرفع</strong> أو اسحب وأفلت ملفًا</p>
            <p>يدعم الصور والمستندات وأي ملفات ثنائية</p>
            <input type="file" id="b64EncodeFileInput" style="display:none">
          </div>
          <div class="b64-fileinfo" id="b64EncodeFileInfo">
            <i class="ti ti-file"></i>
            <div>
              <div class="name" id="b64EncodeFileName">-</div>
              <div class="size" id="b64EncodeFileSize">-</div>
            </div>
            <button class="b64-mini danger clear" onclick="b64ClearEncodeFile()"><i class="ti ti-x"></i></button>
          </div>

          <div class="dt-actions">
            <button class="btn-primary" onclick="b64Encode()"><i class="ti ti-lock"></i> ترميز</button>
            <button class="btn-cancel" onclick="dtCopy('b64EncodeOutput')"><i class="ti ti-copy"></i> نسخ النتيجة</button>
            <button class="btn-cancel" onclick="b64ClearEncode()"><i class="ti ti-eraser"></i> مسح</button>
          </div>

          <div class="dt-head"><i class="ti ti-file-code" style="color:#10b981"></i> النتيجة المشفرة</div>
          <textarea class="dt-textarea" id="b64EncodeOutput" spellcheck="false" readonly onclick="dtCopy('b64EncodeOutput')" placeholder="ستظهر النتيجة المشفرة هنا..."></textarea>
          <img class="b64-preview" id="b64EncodePreview" alt="معاينة">
        </div>

        <div class="dt-panel${active === 'decode' ? '' : ' dt-hidden'}" id="b64DecodePanel">
          <div class="dt-head"><i class="ti ti-file-code" style="color:#10b981"></i> النص المشفر لفك ترميزه</div>
          <textarea class="dt-textarea" id="b64DecodeInput" spellcheck="false" placeholder="الصق النص المشفر هنا..."></textarea>
          <div class="b64-live">
            <label class="b64-switch"><input type="checkbox" id="b64DecodeLive"><span class="b64-slider"></span></label>
            <span><i class="ti ti-bolt"></i> فك ترميز مباشر أثناء الكتابة</span>
          </div>

          <div class="dt-options">
            <label class="dt-option"><span>Chart:</span>
              <select class="b64-select" id="b64DecodeCharset">
                <optgroup label="Popular">
                  <option value="UTF-8" selected>UTF-8</option>
                  <option value="ASCII">ASCII</option>
                  <option value="ISO-8859-1">ISO-8859-1</option>
                  <option value="Windows-1252">Windows-1252</option>
                </optgroup>
              </select>
            </label>
            <label class="dt-option"><input type="checkbox" id="b64DecodeUrlSafe"> الإدخال آمن للروابط (Base64URL)</label>
          </div>

          <div class="dt-actions">
            <button class="btn-primary" onclick="b64Decode()"><i class="ti ti-unlock"></i> فك الترميز</button>
            <button class="btn-cancel" onclick="dtCopy('b64DecodeOutput')"><i class="ti ti-copy"></i> نسخ النتيجة</button>
            <button class="btn-cancel" onclick="b64DownloadDecoded()"><i class="ti ti-download"></i> تنزيل كملف</button>
            <button class="btn-cancel" onclick="b64ClearDecode()"><i class="ti ti-eraser"></i> مسح</button>
          </div>

          <div class="dt-head"><i class="ti ti-file-text" style="color:#10b981"></i> النتيجة بعد فك الترميز</div>
          <textarea class="dt-textarea" id="b64DecodeOutput" spellcheck="false" readonly onclick="dtCopy('b64DecodeOutput')" placeholder="ستظهر النتيجة هنا..."></textarea>
          <img class="b64-preview" id="b64DecodePreview" alt="معاينة">
        </div>

        <div class="dt-panel${active === 'image' ? '' : ' dt-hidden'}" id="b64ImagePanel">
          <div class="dt-head"><i class="ti ti-photo" style="color:#10b981"></i> تحويل الصور إلى Base64 لاستخدامها في HTML و CSS والبريد الإلكتروني</div>

          <div class="b64-dropzone" id="b64ImageDropzone">
            <i class="ti ti-cloud-upload"></i>
            <h4>اسحب وأفلت صورك هنا</h4>
            <p>أو اضغط لاختيار الملفات</p>
            <div class="b64-badges">
              <span class="b64-badge">JPG</span>
              <span class="b64-badge">PNG</span>
              <span class="b64-badge">GIF</span>
              <span class="b64-badge">WebP</span>
              <span class="b64-badge">SVG</span>
              <span class="b64-badge">BMP</span>
            </div>
            <p>الحد الأقصى 10 ملفات، 5MB لكل ملف</p>
            <input type="file" id="b64ImageFileInput" style="display:none" multiple accept=".jpg,.jpeg,.png,.gif,.bmp,.svg,.webp,image/*">
          </div>

          <div class="b64-results" id="b64ResultsContainer">
            <div class="b64-results-head">
              <h4><i class="ti ti-file-code"></i> نتائج الترميز</h4>
              <span class="b64-stat"><i class="ti ti-check"></i> <span id="b64CompletedCount">0</span> ملف محوّل</span>
            </div>
            <div id="b64ImageResultsList"></div>
            <div class="dt-actions">
              <button class="btn-cancel" onclick="b64ClearAllImages()"><i class="ti ti-trash"></i> مسح الكل</button>
              <button class="btn-primary" onclick="document.getElementById('b64ImageFileInput').click()"><i class="ti ti-plus"></i> إضافة المزيد من الصور</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;

    const encInput = document.getElementById('b64EncodeInput');
    const encLive = document.getElementById('b64EncodeLive');
    if (encInput && encLive) {
      encInput.addEventListener('input', () => { if (encLive.checked) b64Encode(); });
      const encUpload = document.getElementById('b64EncodeUpload');
      const encFileInput = document.getElementById('b64EncodeFileInput');
      if (encUpload && encFileInput) {
        encUpload.addEventListener('click', () => encFileInput.click());
        encFileInput.addEventListener('change', e => { if (e.target.files[0]) b64SetEncodeFile(e.target.files[0]); });
        encUpload.addEventListener('dragover', e => { e.preventDefault(); encUpload.classList.add('drag'); });
        encUpload.addEventListener('dragleave', () => encUpload.classList.remove('drag'));
        encUpload.addEventListener('drop', e => {
          e.preventDefault();
          encUpload.classList.remove('drag');
          if (e.dataTransfer.files.length) b64SetEncodeFile(e.dataTransfer.files[0]);
        });
      }
    }
    const decInput = document.getElementById('b64DecodeInput');
    const decLive = document.getElementById('b64DecodeLive');
    if (decInput && decLive) {
      decInput.addEventListener('input', () => { if (decLive.checked) b64Decode(); });
    }
    const imgDrop = document.getElementById('b64ImageDropzone');
    const imgInput = document.getElementById('b64ImageFileInput');
    if (imgDrop && imgInput) {
      imgDrop.addEventListener('click', () => imgInput.click());
      imgInput.addEventListener('change', e => b64HandleImageFiles(e.target.files));
      imgDrop.addEventListener('dragover', e => { e.preventDefault(); imgDrop.classList.add('drag'); });
      imgDrop.addEventListener('dragleave', () => imgDrop.classList.remove('drag'));
      imgDrop.addEventListener('drop', e => {
        e.preventDefault();
        imgDrop.classList.remove('drag');
        b64HandleImageFiles(e.dataTransfer.files);
      });
    }
  }

  function b64FormatBytes(bytes, decimals = 2){
    if (!+bytes) return '0 Bytes';
    const k = 1024, dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes','KB','MB','GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  function b64ChunkString(str, length, sep){
    if (!length) return str;
    const regex = new RegExp('.{1,' + length + '}', 'g');
    return (str.match(regex) || []).join(sep);
  }

  function b64EncodeBase64(input, urlSafe){
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      let binary = '';
      for (let i = 0; i < data.length; i++) binary += String.fromCharCode(data[i]);
      let encoded = btoa(binary);
      if (urlSafe) encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      return encoded;
    } catch (e) { return 'Error encoding data'; }
  }

  function b64DecodeBase64(input, urlSafe){
    try {
      let str = input.trim();
      if (urlSafe) str = str.replace(/-/g, '+').replace(/_/g, '/');
      while (str.length % 4) str += '=';
      const binary = atob(str);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const decoder = new TextDecoder();
      return decoder.decode(bytes);
    } catch (e) { return 'Error decoding data - Invalid Base64'; }
  }

  function b64IsImageBase64(str){
    try {
      const decoded = atob(str.substring(0, 20));
      return decoded.indexOf('\x89PNG') === 0 || decoded.indexOf('\xFF\xD8\xFF') === 0 || decoded.indexOf('GIF8') === 0;
    } catch (e) { return false; }
  }

  function b64SetEncodeFile(file){
    if (!file) return;
    b64EncodeFile = file;
    document.getElementById('b64EncodeFileName').textContent = file.name;
    document.getElementById('b64EncodeFileSize').textContent = b64FormatBytes(file.size) + (file.type ? ' - ' + file.type : '');
    document.getElementById('b64EncodeFileInfo').classList.add('show');
  }

  function b64Encode(){
    const urlSafe = document.getElementById('b64EncodeUrlSafe').checked;
    const splitLines = document.getElementById('b64EncodeSplit').checked;
    const separator = document.getElementById('b64EncodeSep').value === 'crlf' ? '\r\n' : '\n';
    const output = document.getElementById('b64EncodeOutput');
    const preview = document.getElementById('b64EncodePreview');
    if (!output || !preview) return;
    const file = b64EncodeFile;
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e){
        let base64 = e.target.result.split(',')[1];
        if (urlSafe) base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        if (splitLines) base64 = b64ChunkString(base64, 76, separator);
        output.value = base64;
        if (file.type && file.type.indexOf('image/') === 0) {
          preview.src = e.target.result;
          preview.classList.add('show');
        } else {
          preview.classList.remove('show');
        }
        showToast('تم الترميز');
      };
      reader.onerror = function(){ showToast('فشل قراءة الملف'); };
      reader.readAsDataURL(file);
    } else {
      const text = document.getElementById('b64EncodeInput').value;
      let result = b64EncodeBase64(text, urlSafe);
      if (splitLines) result = b64ChunkString(result, 76, separator);
      output.value = result;
      preview.classList.remove('show');
      showToast('تم الترميز');
    }
  }

  function b64ClearEncode(){
    document.getElementById('b64EncodeInput').value = '';
    document.getElementById('b64EncodeOutput').value = '';
    b64ClearEncodeFile();
  }

  function b64ClearEncodeFile(){
    b64EncodeFile = null;
    document.getElementById('b64EncodeFileInfo').classList.remove('show');
    const fileInput = document.getElementById('b64EncodeFileInput');
    if (fileInput) fileInput.value = '';
    const preview = document.getElementById('b64EncodePreview');
    if (preview) preview.classList.remove('show');
  }

  function b64Decode(){
    const input = document.getElementById('b64DecodeInput');
    const output = document.getElementById('b64DecodeOutput');
    const preview = document.getElementById('b64DecodePreview');
    if (!input || !output || !preview) return;
    const urlSafe = document.getElementById('b64DecodeUrlSafe').checked;
    output.value = b64DecodeBase64(input.value, urlSafe);
    try {
      const trimmed = input.value.trim();
      if (trimmed.indexOf('data:image') === 0 || b64IsImageBase64(trimmed)) {
        const src = trimmed.indexOf('data:') === 0 ? trimmed : 'data:image/png;base64,' + trimmed;
        preview.src = src;
        preview.classList.add('show');
      } else {
        preview.classList.remove('show');
      }
    } catch (e) { preview.classList.remove('show'); }
    showToast('تم فك الترميز');
  }

  function b64ClearDecode(){
    document.getElementById('b64DecodeInput').value = '';
    document.getElementById('b64DecodeOutput').value = '';
    document.getElementById('b64DecodePreview').classList.remove('show');
  }

  function b64DownloadDecoded(){
    const content = document.getElementById('b64DecodeOutput').value;
    if (!content) { showToast('لا يوجد شيء لتنزيله'); return; }
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'decoded_file.txt';
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  }

  function b64HandleImageFiles(files){
    const validFiles = Array.prototype.slice.call(files).filter(file => {
      if (!(file.type && file.type.indexOf('image/') === 0) && !file.name.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i)) {
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('الملف "' + file.name + '" كبير جدًا (الحد الأقصى 5MB)');
        return false;
      }
      return true;
    });
    if (validFiles.length + b64ImageFiles.length > 10) {
      showToast('الحد الأقصى 10 ملفات');
      return;
    }
    validFiles.forEach(file => b64ProcessImageFile(file));
    b64UpdateImageStats();
  }

  function b64ProcessImageFile(file){
    const reader = new FileReader();
    const fileId = ++b64ImageCounter;
    b64ImageFiles.push({ id: fileId, file: file, status: 'processing', detailsRendered: false });
    const container = document.getElementById('b64ResultsContainer');
    const list = document.getElementById('b64ImageResultsList');
    if (container) container.classList.add('show');
    if (list) list.insertAdjacentHTML('beforeend', b64CreateImageResultItem(fileId, file.name, b64FormatBytes(file.size)));

    reader.onload = function(e){
      const base64Data = e.target.result;
      const base64Only = base64Data.split(',')[1];
      const encodedSize = b64FormatBytes(base64Only.length);
      const img = new Image();
      img.onload = function(){
        const dims = img.width + '×' + img.height;
        const fileIndex = b64ImageFiles.findIndex(f => f.id === fileId);
        if (fileIndex !== -1) {
          b64ImageFiles[fileIndex].status = 'success';
          b64ImageFiles[fileIndex].base64 = base64Data;
          b64ImageFiles[fileIndex].base64Only = base64Only;
          b64ImageFiles[fileIndex].encodedSize = encodedSize;
          b64ImageFiles[fileIndex].dimensions = dims;
        }
        b64UpdateImageResultItem(fileId, file.name, b64FormatBytes(file.size), encodedSize, dims, base64Data);
        b64UpdateImageStats();
      };
      img.onerror = function(){ b64MarkImageError(fileId); };
      img.src = base64Data;
    };
    reader.onerror = function(){ b64MarkImageError(fileId); };
    reader.readAsDataURL(file);
  }

  function b64MarkImageError(fileId){
    const fileIndex = b64ImageFiles.findIndex(f => f.id === fileId);
    if (fileIndex !== -1) b64ImageFiles[fileIndex].status = 'error';
    b64UpdateImageResultItemError(fileId);
    b64UpdateImageStats();
  }

  function b64CreateImageResultItem(id, name, size){
    return `
      <div class="b64-item" id="b64ImageResult-${id}">
        <div class="b64-item-head" onclick="b64ToggleImageDetails(${id})">
          <div class="b64-item-num">${b64ImageFiles.findIndex(f => f.id === id) + 1}</div>
          <div class="b64-item-info">
            <div class="b64-item-name">${escHtml(name)}</div>
            <div class="b64-item-meta"><span><i class="ti ti-hdd"></i> ${size}</span><span><i class="ti ti-refresh ti-spin"></i> جارٍ التحويل...</span></div>
          </div>
          <div class="b64-item-actions"><span class="b64-mini processing"><i class="ti ti-refresh ti-spin"></i> جارٍ التحويل</span></div>
        </div>
        <div class="b64-details" id="b64ImageDetails-${id}"></div>
      </div>`;
  }

  function b64UpdateImageResultItem(id, name, size, encodedSize, dimensions){
    const item = document.getElementById('b64ImageResult-' + id);
    if (!item) return;
    item.innerHTML = `
      <div class="b64-item-head" onclick="b64ToggleImageDetails(${id})">
        <div class="b64-item-num">${b64ImageFiles.findIndex(f => f.id === id) + 1}</div>
        <div class="b64-item-info">
          <div class="b64-item-name">${escHtml(name)}</div>
          <div class="b64-item-meta">
            <span><i class="ti ti-hdd"></i> ${size}</span>
            <span><i class="ti ti-arrow-big-left"></i> ${encodedSize}</span>
            <span><i class="ti ti-maximize"></i> ${dimensions}</span>
          </div>
        </div>
        <div class="b64-item-actions">
          <button class="b64-mini" onclick="event.stopPropagation(); b64ToggleImageDetails(${id})"><i class="ti ti-code"></i> الكود</button>
          <button class="b64-mini primary" onclick="event.stopPropagation(); b64CopyImageCode(${id}, 'data')"><i class="ti ti-copy"></i> نسخ</button>
          <button class="b64-mini danger" onclick="event.stopPropagation(); b64RemoveImageItem(${id})" title="حذف"><i class="ti ti-x"></i></button>
        </div>
      </div>
      <div class="b64-details" id="b64ImageDetails-${id}"></div>`;
  }

  function b64UpdateImageResultItemError(id){
    const item = document.getElementById('b64ImageResult-' + id);
    if (!item) return;
    const actions = item.querySelector('.b64-item-actions');
    if (actions) {
      actions.innerHTML = '<span class="b64-mini error"><i class="ti ti-alert-circle"></i> فشل القراءة</span>';
    }
  }

  function b64ToggleImageDetails(id){
    const details = document.getElementById('b64ImageDetails-' + id);
    if (!details) return;
    if (!details.dataset.rendered) b64RenderImageDetails(id);
    details.classList.toggle('show');
  }

  function b64RenderImageDetails(id){
    const file = b64ImageFiles.find(f => f.id === id);
    const details = document.getElementById('b64ImageDetails-' + id);
    if (!file || !details || file.status !== 'success' || file.detailsRendered) return;
    details.innerHTML = `
      <div class="b64-thumbwrap">
        <img src="${file.base64}" alt="${escHtml(file.file.name)}" class="b64-thumb">
        <div class="b64-codepanels">
          <div class="b64-codepanel">
            <div class="b64-codepanel-head"><i class="ti ti-code"></i> لوسم &lt;img&gt;
              <span class="spacer"></span>
              <button class="b64-mini" onclick="b64SelectCodeText(this)"><i class="ti ti-select-all"></i> تحديد</button>
              <button class="b64-mini primary" onclick="b64CopyImageCode(${id}, 'data')"><i class="ti ti-copy"></i> نسخ</button>
            </div>
            <div class="b64-codearea" id="b64CodeData-${id}">${escHtml(file.base64)}</div>
          </div>
          <div class="b64-codepanel">
            <div class="b64-codepanel-head"><i class="ti ti-palette"></i> لخلفية CSS
              <span class="spacer"></span>
              <button class="b64-mini" onclick="b64SelectCodeText(this)"><i class="ti ti-select-all"></i> تحديد</button>
              <button class="b64-mini primary" onclick="b64CopyImageCode(${id}, 'css')"><i class="ti ti-copy"></i> نسخ</button>
            </div>
            <div class="b64-codearea" id="b64CodeCss-${id}">background-image: url(${escHtml(file.base64)});</div>
          </div>
        </div>
      </div>`;
    details.dataset.rendered = 'true';
    file.detailsRendered = true;
  }

  function b64CopyImageCode(id, type){
    const file = b64ImageFiles.find(f => f.id === id);
    if (!file || file.status !== 'success') return;
    const text = type === 'css' ? 'background-image: url(' + file.base64 + ');' : file.base64;
    navigator.clipboard.writeText(text).then(() => showToast('تم النسخ!')).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('تم النسخ!');
    });
  }

  function b64SelectCodeText(btn){
    const area = btn.closest('.b64-codepanel').querySelector('.b64-codearea');
    if (area) {
      const range = document.createRange();
      range.selectNodeContents(area);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  function b64RemoveImageItem(id){
    const index = b64ImageFiles.findIndex(f => f.id === id);
    if (index !== -1) b64ImageFiles.splice(index, 1);
    const item = document.getElementById('b64ImageResult-' + id);
    if (item) item.remove();
    b64UpdateImageStats();
    document.querySelectorAll('.b64-item').forEach((el, idx) => {
      const num = el.querySelector('.b64-item-num');
      if (num) num.textContent = idx + 1;
    });
    if (!b64ImageFiles.length) {
      const container = document.getElementById('b64ResultsContainer');
      if (container) container.classList.remove('show');
    }
  }

  function b64ClearAllImages(){
    b64ImageFiles = [];
    const list = document.getElementById('b64ImageResultsList');
    if (list) list.innerHTML = '';
    const container = document.getElementById('b64ResultsContainer');
    if (container) container.classList.remove('show');
    const input = document.getElementById('b64ImageFileInput');
    if (input) input.value = '';
    b64UpdateImageStats();
  }

  function b64UpdateImageStats(){
    const completed = b64ImageFiles.filter(f => f.status === 'success').length;
    const el = document.getElementById('b64CompletedCount');
    if (el) el.textContent = completed;
  }

