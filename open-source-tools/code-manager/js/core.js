  // ── HELPERS ──
  function escHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function genId(s){ return s.id || s.title.replace(/[^a-z0-9]/gi,'_').substring(0,30) + '_' + Date.now(); }
  function isJS(c){ return /function|const |let |var |fetch\(|allowedDomains|\.log\(|=>/.test(c); }
  function detectTag(t){ if(isJS(t.c)) return 'javascript'; if(t.g.some(x=>['layout','responsive','media'].includes(x))) return 'responsive'; if(t.g.some(x=>['brand','logo'].includes(x))) return 'brand'; if(t.g.some(x=>['has'].includes(x))) return 'has'; if(t.g.some(x=>['salla','zid','cart','product','footer','button'].includes(x))) return 'salla'; return 'css'; }

  let DATA = SRC.map((s,i) => {
    const std = {
      id: 's' + i,
      title: s.t,
      tags: s.g,
      desc: s.t.split(' - ')[1] || s.t.split(' - ')[0] || 'مقطع كود'
    };
    if (s.p) return { ...std, patterns: s.p, selectedPattern: 0, codes: [{ lang: isJS(s.p[0].code) ? 'JS' : 'CSS', code: s.p[0].code }] };
    return { ...std, codes: [{ lang: isJS(s.c) ? 'JS' : 'CSS', code: s.c }] };
  });

  // ── PERSISTENCE (أكواد المستخدم + المحذوفات تبقى بعد التحديث) ──
  const USER_KEY = 'csman_v2_user_data_v1';
  const DEL_KEY  = 'csman_v2_deleted_v1';
  function loadUserOverlay(){
    try {
      const del = JSON.parse(localStorage.getItem(DEL_KEY) || '[]');
      if (Array.isArray(del) && del.length) {
        const gone = new Set(del);
        DATA = DATA.filter(s => !gone.has(s.id));
      }
    } catch(e){}
    try {
      const custom = JSON.parse(localStorage.getItem(USER_KEY) || '[]');
      if (Array.isArray(custom) && custom.length) {
        const ids = new Set(DATA.map(s => s.id));
        custom.forEach(s => {
          if (!s || !s.id || !s.title || !Array.isArray(s.codes) || !s.codes.length) return;
          if (ids.has(s.id)) return;
          ids.add(s.id);
          DATA.unshift(s);
        });
      }
    } catch(e){}
  }
  function saveUserOverlay(){
    try {
      const custom = DATA.filter(s => /^(sec_|imp_|has_|rt_|cv_)/.test(s.id));
      localStorage.setItem(USER_KEY, JSON.stringify(custom));
    } catch(e){}
  }
  function saveDeleted(id){
    try {
      const del = JSON.parse(localStorage.getItem(DEL_KEY) || '[]');
      if (!del.includes(id)) localStorage.setItem(DEL_KEY, JSON.stringify([...del, id]));
    } catch(e){}
  }
  loadUserOverlay();

  let openIds  = new Set();
  let activeTag = 'all';
  let wrapMode = true;
  let _deleteTargetId = null;
  let _deleteSnippetId = null;
  let _initDone = false;
  let varValues = new Map();
  let showHomeDash = false;
  let showEdDash = false;
  let showCpDash = false;
  let showRtDash = false;
  let collapsedGroups = new Set();

  // ── SYNTAX HIGHLIGHT ──
  function syntaxHL(code){
    let s = escHtml(code);
    s = s.replace(/(\/\*[\s\S]*?\*\/|\/\/[^\n]*)/g, m => `<span class="cmt">${m}</span>`);
    s = s.replace(/(&quot;[^&]*&quot;|&#39;[^&]*&#39;|url\([^)]*\))/g, m => `<span class="str">${m}</span>`);
    const kws = ['@media','@keyframes','@font-face','@import','@supports','!important','content','display','background','border','padding','margin','color','height','width','max-height','direction','box-sizing','font-family','border-radius','overflow','position','transform','transition','animation','flex','grid','gap','aspect-ratio','scroll-behavior','filter','backdrop-filter','accent-color'];
    kws.forEach(k => { s = s.replace(new RegExp(`\\b(${k})\\b`, 'g'), '<span class="kw">$1</span>'); });
    s = s.replace(/((?:[\.\#\:][a-zA-Z][^\{<\n]*|\*)\s*(?=\{))/g, m => `<span class="sel">${m}</span>`);
    return s;
  }

  function hlQuery(text, q){
    if(!q) return escHtml(text);
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
    return escHtml(text).replace(re, '<span class="hl">$1</span>');
  }

  // تلوين كلمات البحث داخل الكود بعد التظليل المبدئي (يحافظ على وسوم الـ span)
  function hlCode(html, words){
    if(!words || !words.length) return html;
    const kept = [];
    // حماية وسوم الـ span من التلوين داخل الوصفات
    html = html.replace(/(<span[^>]*>|<\/span>|\x00)/g, m => {
      kept.push(m);
      return '\x00';
    });
    const esc = w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    for(const w of words){
      if(!w || w.length < 2) continue;
      html = html.replace(new RegExp(esc(w), 'gi'), m => `<span class="code-hit">${m}</span>`);
    }
    let i = 0;
    return html.replace(/\x00/g, () => kept[i++]);
  }

  // ── COLOR HELPERS ──
  const colorNames = {
    black:'#000000', silver:'#c0c0c0', gray:'#808080', white:'#ffffff',
    maroon:'#800000', red:'#ff0000', purple:'#800080', fuchsia:'#ff00ff',
    green:'#008000', lime:'#00ff00', olive:'#808000', yellow:'#ffff00',
    navy:'#000080', blue:'#0000ff', teal:'#008080', aqua:'#00ffff',
    orange:'#ffa500', cyan:'#00ffff', pink:'#ffc0cb', brown:'#a52a2a'
  };

  function parseColor(str) {
    if (!str) return null;
    str = str.trim().toLowerCase();
    if (colorNames[str]) str = colorNames[str];
    const m = str.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/);
    if (!m) return null;
    let hex = m[1];
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    return { r: parseInt(hex.substring(0,2), 16), g: parseInt(hex.substring(2,4), 16), b: parseInt(hex.substring(4,6), 16) };
  }

  function mixColors(c1, c2, pct) {
    const a = parseColor(c1), b = parseColor(c2);
    if (!a || !b) return null;
    const f = Math.min(100, Math.max(0, Number(pct))) / 100;
    const r = Math.round(a.r + (b.r - a.r) * f);
    const g = Math.round(a.g + (b.g - a.g) * f);
    const b_ = Math.round(a.b + (b.b - a.b) * f);
    return '#' + [r,g,b_].map(v => v.toString(16).padStart(2,'0')).join('');
  }

  // ── VARIABLE DETECTION ──
  function detectVars(code){
    const vars = [];
    const seen = new Set();
    let urlIdx = 0, textIdx = 0, pctIdx = 0;

    const allDefRe = /(--[\w-]+)\s*:\s*([^;{]+);/g;
    let m;
    while ((m = allDefRe.exec(code)) !== null) {
      const key = m[1], val = m[2].trim();
      seen.add(key);
      const cmRe = /color-mix\(in\s+srgb,\s*var\((--\d+)\),\s*([^,)]+?)\s+(\d+)%\s*\)/;
      const cm = val.match(cmRe);
      if (cm) {
        pctIdx++;
        const pctKey = '__pct_' + pctIdx;
        const short = key.replace(/^--color-|^--/, '');
        vars.push({ key: pctKey, label: short + ' (' + cm[2].trim() + ' ' + cm[3] + '%)', value: cm[3], type: 'range', baseVar: cm[1], secondColor: cm[2].trim(), varName: key });
      } else if (/^--\d+$/.test(key) || /^#[0-9a-fA-F]{3,8}$/.test(val)) {
        vars.push({ key, label: key, value: val, type: /^#[0-9a-fA-F]{3,8}$/.test(val) ? 'color' : 'text' });
      }
    }

    const refRe = /var\(\s*(--[\w-]+)\s*\)/g;
    while ((m = refRe.exec(code)) !== null) {
      const key = m[1];
      if (!seen.has(key)) { seen.add(key); vars.push({ key, label: key, value: '', type: 'text' }); }
    }

    const urlRe = /(url\s*\()\s*["']?([^)"']*)["']?\s*(\))/g;
    while ((m = urlRe.exec(code)) !== null) {
      let inner = m[2].trim();
      const hasProto = /^https?:\/\//i.test(inner);
      if (!inner || /^(IMAGE|BANNER|LOGO|NEW_|YOUR)/i.test(inner) || hasProto) {
        urlIdx++;
        if (hasProto) inner = inner.replace(/^https?:\/\//i, '');
        const key = '__url_' + urlIdx;
        vars.push({ key, label: 'رابط ' + urlIdx, value: inner, type: 'url' });
      }
    }

    const txtRe = /(:\s*)["']([^"']{2,})["']/g;
    while ((m = txtRe.exec(code)) !== null) {
      const pre = m[1], val = m[2].trim();
      if (val && !/^(https?:\/\/|#|var\(|data:)/.test(val)) {
        textIdx++;
        const key = '__txt_' + textIdx;
        vars.push({ key, label: 'نص ' + textIdx, value: val, type: 'text' });
      }
    }

    // ── JS colors: '#rrggbb' داخل الأكواد (مثل كود الفافيكون) — كل لون يظهر له منتقي في لوحة التحكم ──
    const jsHexRe = /["'](#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3}))["']/g;
    const jsHexSeen = new Set();
    let jm;
    while ((jm = jsHexRe.exec(code)) !== null) {
      const hx = jm[1].toLowerCase();
      const before = code.slice(Math.max(0, jm.index - 34), jm.index);
      if (/--[\w-]+\s*:\s*["']?$/.test(before)) continue; // قيمة --var معالجة مسبقاً
      if (jsHexSeen.has(hx)) continue;
      jsHexSeen.add(hx);
      let lbl = 'لون ' + jsHexSeen.size;
      const nm = before.match(/([A-Za-z0-9_\u0600-\u06FF$-]+)\s*[:=]\s*["']?$/);
      if (nm) lbl = nm[1];
      vars.push({ key: '__c' + jsHexSeen.size, label: lbl, value: jm[1], type: 'color' });
    }
    return vars;
  }

  function getLiveCode(code, values){
    if (!values) return code;
    let r = code;
    const pctKeys = Object.keys(values).filter(k => k.startsWith('__pct_'));
    if (pctKeys.length) {
      let pi = 0;
      r = r.replace(/color-mix\(in\s+srgb,\s*var\((--\d+)\),\s*([^,)]+?)\s+(\d+)%\s*\)/g, (_m, baseVar, secondColor, pct) => {
        const val = pctKeys[pi] !== undefined ? values[pctKeys[pi]] : pct;
        pi++;
        return 'color-mix(in srgb, var(' + baseVar + '), ' + secondColor.trim() + ' ' + val + '%)';
      });
    }
    const urlKeys = Object.keys(values).filter(k => k.startsWith('__url_'));
    const textKeys = Object.keys(values).filter(k => k.startsWith('__txt_'));
    let ui = 0, ti = 0;

    r = r.replace(/(url\s*\()\s*["']?([^)"']*)["']?\s*(\))/g, (m, pre, inner, post) => {
      const trimmed = inner.trim();
      if (!trimmed || /^(IMAGE|BANNER|LOGO|NEW_|YOUR)/i.test(trimmed) || /^https?:\/\//i.test(trimmed)) {
        const val = urlKeys[ui] !== undefined ? values[urlKeys[ui]] : '';
        ui++;
        return 'url("' + (val ? (trimmed.match(/^https?:\/\//i) && !val.match(/^https?:\/\//i) ? 'https://' + val : val) : '') + '")';
      }
      return m;
    });

    r = r.replace(/:\s*["']([^"']+)["']/g, (m, inner) => {
      const trimmed = inner.trim();
      if (trimmed && !/^(https?:\/\/|#|var\()/.test(trimmed)) {
        const val = textKeys[ti] !== undefined ? values[textKeys[ti]] : trimmed;
        ti++;
        return ': "' + val + '"';
      }
      return m;
    });

    // ── JS colors: استبدال '#rrggbb' بالقيم المختارة من لوحة التحكم (نفس ترتيب detectVars) ──
    const __hexList = [];
    const __hexSeen = new Set();
    const __hexScan = /["'](#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3}))["']/g;
    let __hm;
    while ((__hm = __hexScan.exec(code)) !== null) {
      const __hx = __hm[1].toLowerCase();
      const __before = code.slice(Math.max(0, __hm.index - 34), __hm.index);
      if (/--[\w-]+\s*:\s*["']?$/.test(__before)) continue;
      if (!__hexSeen.has(__hx)) { __hexSeen.add(__hx); __hexList.push(__hx); }
    }
    __hexList.forEach((__hx, __i) => {
      const __k = '__c' + (__i + 1);
      if (values[__k] !== undefined) {
        const __esc = __hx.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        r = r.replace(new RegExp(__esc, 'gi'), values[__k]);
      }
    });

    for (const [key, val] of Object.entries(values)) {
      if (key.startsWith('__url_') || key.startsWith('__txt_') || key.startsWith('__c')) continue;
      const esc = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      r = r.replace(new RegExp('(' + esc + '\\s*:\\s*)[^;]+;', 'g'), (_, p) => p + val + ';');
      r = r.replace(new RegExp('var\\(\\s*' + esc + '\\s*\\)', 'g'), val);
    }
    return r;
  }

  function updateVar(sectionId, key, value){
    if (!varValues.has(sectionId)) varValues.set(sectionId, {});
    varValues.get(sectionId)[key] = value;
    const section = DATA.find(s => s.id === sectionId);
    if (!section) return;
    const values = varValues.get(sectionId) || {};
    const card = document.querySelector(`.section[data-id="${sectionId}"],.crow[data-id="${sectionId}"]`);
    if (!card) return;
    card.querySelectorAll('.code-block').forEach((block, i) => {
      const pre = block.querySelector('.code-pre');
      const btn = block.querySelector('.copy-btn');
      if (pre && i < section.codes.length) {
        const liveCode = getLiveCode(section.codes[i].code, values);
        pre.innerHTML = syntaxHL(liveCode);
        if(typeof addLn === 'function'){ try{ delete pre.dataset.ln; addLn(pre); }catch(e){} }
        if (btn) {
          btn.setAttribute('onclick', "copyCodeId(this,'" + sectionId + "'," + i + ")");
        }
      }
    });
    updateColorPreview(sectionId);
    if(typeof favAnimKick === 'function'){ try { favAnimKick(); } catch(e){} }
  }

  function updateColorPreview(sectionId) {
    const values = varValues.get(sectionId) || {};
    const section = DATA.find(s => s.id === sectionId);
    if (!section) return;
    const vars = detectVars(section.codes.map(c => c.code).join('\n'));
    const baseDef = vars.find(x => x.key === '--1');
    const baseColor = values['--1'] || (baseDef ? baseDef.value : null);

    const baseSwatch = document.getElementById('swatch_' + sectionId + '_base');
    if (baseSwatch && baseColor) baseSwatch.style.background = baseColor;

    const baseHex = baseSwatch && baseSwatch.parentElement ? baseSwatch.parentElement.querySelector('.base-hex') : null;
    if (baseHex && baseColor) baseHex.textContent = baseColor;

    vars.forEach(v => {
      if (v.type !== 'range') return;
      const swatch = document.getElementById('swatch_' + sectionId + '_' + v.key);
      if (!swatch) return;
      const pct = values[v.key] !== undefined ? values[v.key] : v.value;
      const c1 = baseColor || v.secondColor;
      const mixed = mixColors(c1, v.secondColor, pct);
      swatch.style.background = mixed || 'var(--bg-elevated)';
    });
  }

  // ── FAVICON STUDIO (معاينة حية + تأثيرات + توليد باليت متناسقة) ──
  const FAV_FX = [
    { id:'pulse',  name:'نبض',   desc:'تدرج متحرك مع هالة نابضة' },
    { id:'glow',   name:'توهج',  desc:'قوس مضيء نابض مع تدرج' },
    { id:'mono',   name:'أحادي', desc:'خلفية سادة وشريط سفلي' },
    { id:'spin',   name:'دوران', desc:'حرف يدور مع حلقة دوارة' },
    { id:'bounce', name:'ارتداد', desc:'الحرف يرتد مع ظل أرضي' },
    { id:'glitch', name:'خلل',   desc:'تشويش ألوان RGB متقطع' },
    { id:'wave',   name:'موجة',  desc:'خطوط متموجة خلف الحرف' },
    { id:'neon',   name:'نيون',  desc:'إطار نيون وامض' },
    { id:'liquid', name:'سائل',  desc:'فقاعات سائلة تتشكل' }
  ];
  const FAV_FXIDS = FAV_FX.map(f=>f.id);

  function favFxKey(id){
    const s = DATA.find(x=>x.id===id);
    if(!s) return null;
    const vars = detectVars(s.codes.map(c=>c.code).join('\n'));
    const stored = varValues.get(id) || {};
    const f = vars.find(v=>FAV_FXIDS.includes(stored[v.key]!==undefined?stored[v.key]:v.value));
    return f ? f.key : null;
  }

  function favCurrent(id){
    const s = DATA.find(x=>x.id===id);
    if(!s) return null;
    const vars = detectVars(s.codes.map(c=>c.code).join('\n'));
    const stored = varValues.get(id) || {};
    const F = { fx:'pulse', c1:'#064e3b', c2:'#10b981', c3:'#059669', c4:'#fbbf24', ink:'#ffffff', bg:'#0e0e1a', letter:'عـ' };
    const order = [];
    const got = {};
    vars.forEach(v=>{
      const val = stored[v.key]!==undefined ? stored[v.key] : v.value;
      if(v.key.indexOf('__t')===0){
        if(FAV_FXIDS.includes(val)) F.fx = val;
        else F.letter = val;
      }else if(v.key.indexOf('__c')===0){
        if(['c1','c2','c3','c4','ink','bg'].includes(v.label)){ F[v.label] = val; got[v.label] = 1; }
        else order.push(val);
      }
    });
    ['c1','c2','c3','c4'].forEach((f,i)=>{ if(!got[f] && order[i]) F[f] = order[i]; });
    return F;
  }

  function paintFav(x, F, fx, t){
    const pulse = (Math.sin(t*0.003)+1)/2;
    x.clearRect(0,0,32,32);
    const rr = (a,b,c,d,r)=>{ x.beginPath(); if(x.roundRect){ x.roundRect(a,b,c,d,r); }else{ x.rect(a,b,c,d); } };
    if(fx==='glow'){
      const bg = x.createLinearGradient(0,0,32,32);
      bg.addColorStop(0,F.c1); bg.addColorStop(1,F.c3);
      x.fillStyle = bg; rr(0,0,32,32,7); x.fill();
      x.save();
      x.shadowColor = F.c2; x.shadowBlur = 10;
      x.strokeStyle = F.c4; x.lineWidth = 3;
      x.beginPath(); x.arc(16,16,9+pulse*2,0,Math.PI*2); x.stroke();
      x.restore();
      x.fillStyle = F.ink; x.font = 'bold 15px Cairo, sans-serif';
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(F.letter,16,17);
    }else if(fx==='mono'){
      x.fillStyle = F.c1; rr(0,0,32,32,7); x.fill();
      x.fillStyle = F.c4; x.fillRect(8,23,16,3);
    x.fillStyle = F.c2; x.font = 'bold 17px Cairo, sans-serif';
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(F.letter,16,14);
    }else if(fx==='spin'){
      const g = x.createLinearGradient(0,0,32,32);
      g.addColorStop(0,F.c1); g.addColorStop(1,F.c3);
      x.fillStyle = g; rr(0,0,32,32,7); x.fill();
      x.save(); x.translate(16,16); x.rotate(t*0.003);
      x.strokeStyle = F.c2; x.lineWidth = 2;
      x.beginPath(); x.arc(0,0,11,0,Math.PI*1.5); x.stroke(); x.restore();
      x.save(); x.translate(16,16); x.rotate(t*0.0025);
      x.fillStyle = F.ink; x.font = 'bold 19px Cairo, sans-serif';
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(F.letter,0,1); x.restore();
    }else if(fx==='bounce'){
      const g = x.createLinearGradient(0,0,32,32);
      g.addColorStop(0,F.c1); g.addColorStop(1,F.c3);
      x.fillStyle = g; rr(0,0,32,32,7); x.fill();
      const yo = (1-Math.abs(Math.sin(t*0.004)))*6;
      x.fillStyle = 'rgba(0,0,0,0.35)';
      x.beginPath(); x.ellipse(16,26,6,2,0,0,Math.PI*2); x.fill();
      x.save(); x.translate(0,-yo);
      x.fillStyle = F.ink; x.font = 'bold 20px Cairo, sans-serif';
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(F.letter,16,17); x.restore();
    }else if(fx==='glitch'){
      x.fillStyle = F.c1; rr(0,0,32,32,7); x.fill();
      const gl = Math.random()<0.15 || Math.sin(t*0.02)>0.8;
      const off = gl ? (Math.random()*2.5) : 0;
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = 'bold 19px Cairo, sans-serif';
      if(gl){
        x.fillStyle = F.c2; x.fillText(F.letter,16+off,16);
        x.fillStyle = F.c4; x.fillText(F.letter,16-off,16.6);
        x.fillStyle = F.ink; x.fillText(F.letter,16,16);
        x.fillStyle = 'rgba(255,255,255,0.08)';
        for(let i=0;i<32;i+=4){ x.fillRect(0,i,32,1); }
      }else{
        x.fillStyle = F.ink; x.fillText(F.letter,16,16);
      }
    }else if(fx==='wave'){
      x.save(); x.beginPath(); rr(0,0,32,32,7); x.clip();
      x.fillStyle = F.c1; x.fillRect(0,0,32,32);
      const cols = [F.c2,F.c3,F.c4];
      for(let j=0;j<3;j++){
        x.strokeStyle = cols[j]; x.lineWidth = 1.3; x.beginPath();
        for(let X=0;X<=32;X+=1){
          const Y = 16+Math.sin(X*0.1+t*0.005+j)*3.8+j*2.5-3;
          if(X===0) x.moveTo(X,Y); else x.lineTo(X,Y);
        }
        x.stroke();
      }
      x.restore();
      x.fillStyle = F.ink; x.font = 'bold 19px Cairo, sans-serif';
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.shadowColor = 'rgba(0,0,0,0.4)'; x.shadowBlur = 3;
      x.fillText(F.letter,16,16); x.shadowBlur = 0;
    }else if(fx==='neon'){
      x.fillStyle = F.bg; rr(0,0,32,32,7); x.fill();
      const flick = 0.7+Math.sin(t*0.01)*0.15+Math.sin(t*0.023)*0.15;
      x.save();
      x.shadowColor = F.c2; x.shadowBlur = 8*flick;
      x.strokeStyle = F.c2; x.lineWidth = 1.8; x.globalAlpha = flick;
      x.beginPath(); rr(2.5,2.5,27,27,5); x.stroke();
      x.restore();
      x.fillStyle = F.ink; x.font = 'bold 19px Cairo, sans-serif';
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.shadowColor = F.c2; x.shadowBlur = 5;
      x.fillText(F.letter,16,16.5); x.shadowBlur = 0;
    }else if(fx==='liquid'){
      x.fillStyle = F.c1; rr(0,0,32,32,7); x.fill();
      const blobs = [{col:F.c2,amp:6,s:0.002,p:0},{col:F.c3,amp:4.5,s:0.003,p:2},{col:F.c4,amp:3.8,s:0.0025,p:4}];
      for(const b of blobs){
        x.fillStyle = b.col; x.globalAlpha = 0.85; x.beginPath();
        for(let a=0;a<Math.PI*2;a+=0.2){
          const rad = b.amp+Math.sin(a*3+t*b.s+b.p)*1.9;
          const X = 16+Math.cos(a)*rad, Y = 16+Math.sin(a)*rad;
          if(a===0) x.moveTo(X,Y); else x.lineTo(X,Y);
        }
        x.closePath(); x.fill();
      }
      x.globalAlpha = 1;
      x.fillStyle = F.ink; x.font = 'bold 20px Cairo, sans-serif';
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(F.letter,16,17);
    }else{
      const g = x.createLinearGradient(0,0,32,32);
      g.addColorStop(0,F.c1);
      g.addColorStop(0.5,pulse>0.5?F.c2:F.c3);
      g.addColorStop(1,F.c4);
      x.fillStyle = g; rr(0,0,32,32,7); x.fill();
      x.fillStyle = 'rgba(255,255,255,'+(0.12+pulse*0.18)+')';
      x.beginPath(); x.arc(16,16,8+pulse*4,0,Math.PI*2); x.fill();
      x.fillStyle = F.ink; x.font = 'bold 20px Cairo, sans-serif';
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.shadowColor = 'rgba(0,0,0,0.5)'; x.shadowBlur = 4;
      x.fillText(F.letter,16,17); x.shadowBlur = 0;
    }
  }

  let _favRaf = 0;
  function favAnimKick(){
    if(_favRaf) return;
    const step = (t)=>{
      _favRaf = 0;
      const cvs = document.querySelectorAll('canvas.fav-prev');
      if(!cvs.length) return;
      if(!document.hidden){
        cvs.forEach(cv=>{
          const F = favCurrent(cv.dataset.id);
          if(!F) return;
          const x = cv.getContext('2d');
          if(x) paintFav(x, F, F.fx, t||0);
        });
      }
      _favRaf = requestAnimationFrame(step);
    };
    _favRaf = requestAnimationFrame(step);
  }

  function hsl2hex(h,s,l){
    s/=100; l/=100;
    const k=n=>(n+h/30)%12;
    const a=s*Math.min(l,1-l);
    const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
    const to=x=>Math.round(255*x).toString(16).padStart(2,'0');
    return '#'+to(f(0))+to(f(8))+to(f(4));
  }

  function setFavFx(id, fx){
    const k = favFxKey(id);
    if(!k) return;
    if(!varValues.has(id)) varValues.set(id,{});
    varValues.get(id)[k] = fx;
    renderAll(); favAnimKick();
  }

  function favShuffle(id){
    const s = DATA.find(x=>x.id===id);
    if(!s) return;
    const vars = detectVars(s.codes.map(c=>c.code).join('\n'));
    if(!varValues.has(id)) varValues.set(id,{});
    const vals = varValues.get(id);
    const h = Math.floor(Math.random()*360);
    const R = (a,b)=>a+Math.floor(Math.random()*(b-a+1));
    const pal = {
      c1: hsl2hex(h, R(45,65), R(12,20)),
      c2: hsl2hex((h+8)%360, R(80,95), R(50,60)),
      c3: hsl2hex((h+350)%360, R(60,78), R(28,38)),
      c4: hsl2hex((h+35)%360, R(85,95), R(55,65))
    };
    Object.keys(pal).forEach(f=>{
      const v = vars.find(x=>x.label===f);
      if(v) vals[v.key] = pal[f];
    });
    renderAll(); favAnimKick();
    showToast('تم توليد باليت متناسقة');
  }

  function favStudioHtml(s){
    const F = favCurrent(s.id) || { fx:'pulse' };
    const btns = FAV_FX.map(f=>`<button class="fav-fx${F.fx===f.id?' on':''}" title="${f.desc}" onclick="setFavFx('${s.id}','${f.id}')">${f.name}</button>`).join('');
    return `<div class="fav-studio">
      <div class="fav-prev-wrap"><canvas class="fav-prev" data-id="${s.id}" width="32" height="32"></canvas><span>معاينة حية</span></div>
      <div class="fav-ctl"><div class="fav-fx-row">${btns}</div>
      <button class="fav-shuffle" onclick="favShuffle('${s.id}')">توليد ألوان متناسقة</button></div>
    </div>`;
  }

  function selectPattern(sectionId, idx){
    const section = DATA.find(s => s.id === sectionId);
    if (!section || !section.patterns) return;
    section.selectedPattern = idx;
    section.codes[0] = { lang: isJS(section.patterns[idx].code) ? 'JS' : 'CSS', code: section.patterns[idx].code };
    renderAll();
  }

  function showToast(msg){
    const t = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'), 2200);
  }

  // ── COPY (مع بديل يعمل على file:// والمتصفحات القديمة) ──
  function fallbackCopy(text){
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      document.execCommand('copy');
      ta.remove();
      return true;
    } catch(e){ return false; }
  }
  function writeText(text, ok, fail){
    if (navigator.clipboard && window.isSecureContext !== false && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok).catch(() => {
        if (fallbackCopy(text)) ok(); else if (fail) fail();
      });
    } else {
      if (fallbackCopy(text)) ok(); else if (fail) fail();
    }
  }
  function copyCode(btn, encodedCode){
    let code = '';
    try { code = decodeURIComponent(String(encodedCode).replace(/&#39;/g, "'")); }
    catch(e){ code = String(encodedCode || ''); }
    writeText(code, ()=>{
      btn.classList.add('copied');
      btn.innerHTML = '<i class="ti ti-check" aria-hidden="true"></i> تم النسخ';
      showToast('تم نسخ الكود!');
      setTimeout(()=>{
        btn.classList.remove('copied');
        btn.innerHTML = '<i class="ti ti-copy" aria-hidden="true"></i> نسخ';
      }, 2000);
    }, ()=>showToast('تعذّر النسخ'));
  }

  // ── COPY BY ID (بدون تمرير الكود في الـ attribute — آمن مع ' " < >) ──
  function getLiveCodeById(sectionId, codeIdx){
    const s = DATA.find(d => d.id === sectionId);
    if(!s || !s.codes.length) return '';
    const idx = Math.max(0, Math.min(codeIdx || 0, s.codes.length - 1));
    const values = varValues.get(sectionId) || {};
    const vars = detectVars(s.codes.map(c=>c.code).join('\n'));
    return vars.length ? getLiveCode(s.codes[idx].code, values) : s.codes[idx].code;
  }
  function copyCodeId(btn, sectionId, codeIdx){
    const code = getLiveCodeById(sectionId, codeIdx || 0);
    if(!code && code !== ''){ showToast('تعذّر النسخ'); return; }
    writeText(code, ()=>{
      btn.classList.add('copied');
      const old = btn.innerHTML;
      btn.innerHTML = '<i class="ti ti-check" aria-hidden="true"></i> تم النسخ';
      showToast('تم نسخ الكود!');
      setTimeout(()=>{
        btn.classList.remove('copied');
        btn.innerHTML = old.indexOf('نسخ') > -1 ? old : '<i class="ti ti-copy" aria-hidden="true"></i> نسخ';
      }, 2000);
    }, ()=>showToast('تعذّر النسخ'));
  }

  // ── TOGGLE + COPY ON OPEN (النسخ فقط عند الفتح — مش عند القفل) ──
  function toggleSection(id){
    const willOpen = !openIds.has(id);
    if(willOpen){
      const s = DATA.find(d => d.id === id);
      if(s && s.codes.length) {
        const values = varValues.get(id) || {};
        const vars = detectVars(s.codes.map(c=>c.code).join('\n'));
        const liveCode = vars.length ? getLiveCode(s.codes[0].code, values) : s.codes[0].code;
        writeText(liveCode, () => { showToast('تم نسخ الكود!'); }, () => {});
      }
      openIds.add(id);
    } else {
      openIds.delete(id);
    }
    renderAll();
  }

  // ── TOGGLE ALL ──
  function toggleAll(open = true){
    const list = getFiltered();
    list.forEach(s => {
      if(open) openIds.add(s.id); else openIds.delete(s.id);
    });
    renderAll();
  }

  // ── CODES VIEW (قائمة مدمجة / شبكة) ──
  const CODESVIEW_KEY = 'csman_v2_codesview_v1';
  function getCodesView(){ try { return localStorage.getItem(CODESVIEW_KEY) || 'list'; } catch(e){ return 'list'; } }
  function setCodesView(v){ try { localStorage.setItem(CODESVIEW_KEY, v); } catch(e){} renderAll(); }

  // ── نسخ سريع لأول كود في القسم (زر نسخ في وضع القائمة) ──
  function quickCopy(id, btn, e){
    if(e) e.stopPropagation();
    const s = DATA.find(d => d.id === id);
    if(!s || !s.codes.length) return;
    const values = varValues.get(id) || {};
    const vars = detectVars(s.codes.map(c=>c.code).join('\n'));
    const liveCode = vars.length ? getLiveCode(s.codes[0].code, values) : s.codes[0].code;
    writeText(liveCode, ()=>{
      showToast('تم نسخ الكود!');
      if(btn){
        const old = btn.innerHTML;
        btn.classList.add('copied');
        btn.innerHTML = '<i class="ti ti-check" aria-hidden="true"></i> تم';
        setTimeout(()=>{ btn.classList.remove('copied'); btn.innerHTML = old; }, 1500);
      }
    }, ()=>showToast('تعذّر النسخ'));
  }

  // ── أرقام الأسطر داخل مربعات الكود ──
  function collectLines(el){
    const lines = [[]];
    el.childNodes.forEach(ch => {
      if(ch.nodeType === 3){
        ch.textContent.split('\n').forEach((p,i)=>{
          if(i > 0) lines.push([]);
          if(p) lines[lines.length-1].push(document.createTextNode(p));
        });
      } else if(ch.nodeType === 1){
        if(ch.tagName === 'BR'){ lines.push([]); return; }
        collectLines(ch).forEach((seg,i)=>{
          if(i > 0) lines.push([]);
          if(seg.length){ const c = ch.cloneNode(false); seg.forEach(n=>c.appendChild(n)); lines[lines.length-1].push(c); }
        });
      }
    });
    return lines;
  }
  function addLn(pre){
    if(!pre || pre.dataset.ln) return;
    pre.dataset.ln = '1';
    const lines = collectLines(pre);
    if(lines.length > 1 && lines[lines.length-1].length === 0) lines.pop();
    pre.textContent = '';
    pre.classList.add('ln');
    const frag = document.createDocumentFragment();
    lines.forEach(nodes => {
      const s = document.createElement('span');
      s.className = 'cl';
      if(!nodes.length) s.textContent = '​';
      else nodes.forEach(n => s.appendChild(n));
      frag.appendChild(s);
    });
    pre.appendChild(frag);
  }

  // ── WRAP ──
  function toggleWrap(){
    wrapMode = !wrapMode;
    document.getElementById('wrapBtn').classList.toggle('active', wrapMode);
    document.querySelectorAll('.code-pre').forEach(el => el.classList.toggle('wrap', wrapMode));
  }

  // ── DELETE ──
  function confirmDelete(id, e){
    e.stopPropagation();
    _deleteTargetId = id;
    const sec = DATA.find(s=>s.id===id);
    document.getElementById('confirmText').textContent = 'هل أنت متأكد من حذف "' + (sec ? sec.title : '') + '"؟';
    document.getElementById('confirmOverlay').classList.add('open');
  }
  function executeDelete(){
    if(_deleteSnippetId !== null){
      doDeleteSnippet(_deleteSnippetId);
      _deleteSnippetId = null;
      closeConfirm();
      return;
    }
    if(_deleteTargetId !== null){
      DATA = DATA.filter(s => s.id !== _deleteTargetId);
      openIds.delete(_deleteTargetId);
      saveDeleted(_deleteTargetId);
      saveUserOverlay();
      _deleteTargetId = null;
      closeConfirm();
      renderAll();
      showToast('تم الحذف');
    }
  }
  function closeConfirm(){ document.getElementById('confirmOverlay').classList.remove('open'); _deleteTargetId = null; _deleteSnippetId = null; }
  function closeConfirmOutside(e){ if(e.target===document.getElementById('confirmOverlay')) closeConfirm(); }
  document.getElementById('confirmDeleteBtn').addEventListener('click', executeDelete);
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeConfirm(); });

  // ── FILTER ──
  function setTag(el){
    if(showHomeDash){
      showHomeDash = false;
      const hb = document.getElementById('homeBtn');
      if (hb) hb.classList.remove('home-active');
    }
    if(typeof showAlDash !== 'undefined' && showAlDash){
      showAlDash = false;
      const ab = document.getElementById('alDashBtn');
      if (ab) ab.classList.remove('al-active');
    }
    if(showScrollbarDash){
      showScrollbarDash = false;
      document.getElementById('sbDashBtn').classList.remove('scrollbar-active');
    }
    if(showEdDash){
      showEdDash = false;
      document.getElementById('edDashBtn').classList.remove('ed-active');
    }
    if(showDevDash){
      showDevDash = false;
      document.getElementById('devDashBtn').classList.remove('dev-active');
    }
    if(showB64Dash){
      showB64Dash = false;
      document.getElementById('b64DashBtn').classList.remove('b64-active');
    }
    if(showQrDash){
      showQrDash = false;
      document.getElementById('qrDashBtn').classList.remove('qr-active');
    }
    if(showCpDash){
      showCpDash = false;
      document.getElementById('cpDashBtn').classList.remove('cp-active');
    }
    if(showRtDash){
      showRtDash = false;
      document.getElementById('rtDashBtn').classList.remove('rt-active');
    }
    if(showCssDash){
      showCssDash = false;
      document.getElementById('cssDashBtn').classList.remove('css-active');
    }
    activeTag = el.dataset.tag;
    document.querySelectorAll('.filter-tag').forEach(b=>b.classList.remove('active'));
    el.classList.add('active');
    renderAll();
  }

function getFiltered(){
    const q = (document.getElementById('searchInput')||{}).value?.trim().toLowerCase()||'';
    const p = parseQuery(q);
    return DATA.filter(s=>{
      if(activeTag!=='all'){
        const g = (typeof sectionGroup === 'function') ? sectionGroup(s) : null;
        const rawHit = s.tags.some(x => String(x).toLowerCase() === String(activeTag).toLowerCase());
        if(g){ if(g !== activeTag && !rawHit) return false; }
        else if(!rawHit) return false;
      }
      if(!q) return true;
      // عمليات tag: و -
      if(p.tags.length && !p.tags.every(t => {
        const tl = String(t).toLowerCase();
        if(s.tags.some(x => String(x).toLowerCase().includes(tl))) return true;
        try { if(typeof sectionGroup === 'function' && sectionGroup(s) === tl) return true; } catch(e){}
        return false;
      })) return false;
      const hay = s.title.toLowerCase() + ' ' + s.desc.toLowerCase() + ' ' + s.tags.join(' ').toLowerCase() + ' ' + s.codes.map(c=>c.code.toLowerCase()).join('\n');
      if(p.excl.length && p.excl.some(e => hay.includes(e))) return false;
      if(!p.words.length) return true;
      return p.words.some(w => hay.includes(w.toLowerCase()))
        || fuzzyMatch(s.title, p.words.join(' ')) >= 60;
    });
  }

  // ── SMART SEARCH ──
  let _sugResults = [];   // آخر نتائج منبثقة للبحث
  let _sugSel = -1;       // العنصر المظلل في القائمة المنبثقة
  let _sugTimer = null;

  function parseQuery(q){
    const out = { words: [], tags: [], excl: [] };
    (q || '').split(/\s+/).filter(Boolean).forEach(tk => {
      tk = tk.trim();
      const low = tk.toLowerCase();
      if(low.startsWith('tag:')) out.tags.push(low.slice(4).trim());
      else if(low.startsWith('-')) out.excl.push(low.slice(1).trim());
      else out.words.push(tk);
    });
    return out;
  }

  function smartScore(s, p){
    const hay = s.title.toLowerCase() + ' ' + s.desc.toLowerCase() + ' ' + s.tags.join(' ').toLowerCase();
    const codeAll = s.codes.map(c => c.lang.toLowerCase() + '\n' + c.code.toLowerCase()).join('\n');
    let score = 0, fav = 0;
    for(const w of p.words){
      const wl = w.toLowerCase();
      if(s.title.toLowerCase().includes(wl)) score += 100;
      else if(fuzzyMatch(s.title, wl) >= 60) score += 55;
      if(s.tags.some(t => t.toLowerCase().includes(wl))) score += 35;
      if(s.desc.toLowerCase().includes(wl)) score += 20;
      const ci = codeAll.indexOf(wl);
      if(ci !== -1){ score += 25; if(!fav){ fav = findFavLine(s, wl); } }
    }
    // مطابقة fuzzy على العنوان حتى لو مش كلمة كاملة
    if(!p.words.length) score = 0;
    const max = p.words.length ? 100 : 1;
    return { score, max, fav, hay: hay + ' ' + codeAll };
  }

  function fuzzyMatch(str, q){
    str = str.toLowerCase();
    if(!q) return 0;
    if(str.includes(q)) return 100;
    if(q.length < 2) return str.includes(q) ? 40 : 0;
    let s = 0, j = 0;
    for(const ch of q){
      const k = str.indexOf(ch, j);
      if(k === -1) return 0;
      s += (k === j) ? 3 : 1;
      j = k + 1;
    }
    return Math.min(100, Math.round(s * 100 / (q.length * 3)));
  }

  function findFavLine(s, wl){
    for(const c of s.codes){
      const lines = c.code.split('\n');
      for(let i = 0; i < lines.length; i++){
        const L = lines[i].toLowerCase();
        if(L.includes(wl)) return { lang: c.lang, line: L.trim() };
      }
    }
    return null;
  }

  function smartSearch(){
    const q = (document.getElementById('searchInput')||{}).value?.trim().toLowerCase()||'';
    const p = parseQuery(q);
    const base = DATA.filter(s=>{
      if(activeTag!=='all'){
        const g = (typeof sectionGroup === 'function') ? sectionGroup(s) : null;
        const rawHit = s.tags.some(x => String(x).toLowerCase() === String(activeTag).toLowerCase());
        if(g){ if(g !== activeTag && !rawHit) return false; }
        else if(!rawHit) return false;
      }
      return true;
    });
    const rows = base.map(s => {
      const r = smartScore(s, p);
      return { s, ...r };
    }).filter(r => {
      // فلتر العمليات: tag: و -
      if(p.tags.length && !p.tags.every(t => {
        const tl = String(t).toLowerCase();
        if(r.s.tags.some(x => String(x).toLowerCase().includes(tl))) return true;
        try { if(typeof sectionGroup === 'function' && sectionGroup(r.s) === tl) return true; } catch(e){}
        return false;
      })) return false;
      if(p.excl.length && p.excl.some(e => r.hay.includes(e))) return false;
      return r.score >= (p.words.length ? 5 : 0);
    });
    rows.sort((a, b) => (b.score / b.max) - (a.score / a.max) || b.score - a.score);
    return { rows, p };
  }

  function renderSuggest(){
    const box = document.getElementById('searchSug');
    const si = document.getElementById('searchInput');
    if(!box || !si) return;
    const q = si.value.trim().toLowerCase();
    if(!q){ box.className = 'search-sug'; box.innerHTML = ''; _sugResults = []; _sugSel = -1; return; }
    const { rows } = smartSearch();
    _sugResults = rows.slice(0, 7);
    if(!_sugResults.length){
      box.className = 'search-sug open';
      box.innerHTML = '<div class="sug-empty"><i class="ti ti-search-off" aria-hidden="true"></i> لا توجد نتائج — جرّب كلمة أوسع أو أزل العملية tag:</div>';
      _sugSel = -1;
      return;
    }
    _sugSel = Math.min(_sugSel, _sugResults.length - 1);
    box.className = 'search-sug open';
    box.innerHTML = _sugResults.map((r, i) => {
      const titleH = hlQuery(r.s.title, q);
      const tagsH = r.s.tags.slice(0, 3).map(t => `<span class="sug-tag">${escHtml(t)}</span>`).join('');
      const prev = r.fav
        ? `<span class="sug-code" dir="ltr">${hlQuery(r.fav.line, q)}</span>`
        : '';
      return `<div class="sug-item${i === _sugSel ? ' active' : ''}" data-id="${r.s.id}"
        onmouseenter="sugHover(${i})" onclick="sugJump('${r.s.id}')">
        <span class="sug-ic"><i class="ti ti-file-code" aria-hidden="true"></i></span>
        <div class="sug-body">
          <div class="sug-title">${titleH}</div>
          <div class="sug-sub">${tagsH}${prev}</div>
        </div>
        <span class="sug-score">${r.score}</span>
      </div>`;
    }).join('') + `<div class="sug-foot">
      <span class="sug-kbd-row"><span class="sug-kbd">↑↓</span> تنقل</span>
      <span class="sug-kbd-row"><span class="sug-kbd">Enter</span> افتح</span>
      <span class="sug-kbd-row"><span class="sug-kbd">Esc</span> أغلق</span>
    </div>`;
  }

  function sugHover(i){
    _sugSel = i;
    document.querySelectorAll('#searchSug .sug-item').forEach((el, k) => el.classList.toggle('active', k === i));
  }

  function sugJump(id){
    const box = document.getElementById('searchSug');
    if(box) box.className = 'search-sug';
    const s = DATA.find(d => d.id === id);
    if(!s) return;
    if(!openIds.has(id)) openIds.add(id);
    // لو القسم مش ضمن الفلتر الحالي، بدّل "الكل" مؤقتًا عشان يظهر
    if(!getFiltered().some(d => d.id === id)){
      const allBtn = document.querySelector('.filter-tag[data-tag="all"]');
      if(allBtn) setTag(allBtn);
      else { activeTag = 'all'; renderAll(); }
    }
    renderAll();
    requestAnimationFrame(() => {
      const sec = document.querySelector('#mainBody [data-id="'+id+'"]');
      if(sec){
        sec.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        sec.classList.add('flash');
        setTimeout(() => sec.classList.remove('flash'), 1900);
      }
    });
  }

  function onSearchInput(){
    renderAll();
    if(_sugTimer) clearTimeout(_sugTimer);
    _sugTimer = setTimeout(renderSuggest, 120);
  }

  function clearSearch(){
    const si = document.getElementById('searchInput');
    if(si) si.value = '';
    activeTag = 'all';
    document.querySelectorAll('.filter-tag').forEach(b=>b.classList.toggle('active', b.dataset.tag === 'all'));
    renderAll();
  }

  /* ── QUICK INDEX: قفز فوري لأي كود ── */
  function idxJump(id){
    const s = DATA.find(d => d.id === id);
    if(!s) return;
    const g = sectionGroup(s);
    if(collapsedGroups.has(g)) collapsedGroups.delete(g);
    if(!openIds.has(id)) openIds.add(id);
    if(!getFiltered().some(d => d.id === id)){
      const allBtn = document.querySelector('.filter-tag[data-tag="all"]');
      if(allBtn) setTag(allBtn);
      else { activeTag = 'all'; }
    }
    renderAll();
    requestAnimationFrame(() => {
      const sec = document.querySelector('#mainBody [data-id="'+id+'"]');
      if(sec){
        sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        sec.classList.add('flash');
        setTimeout(() => sec.classList.remove('flash'), 1900);
      }
    });
  }
  /* خطوة للتالي/السابق حسب مكان السكرول الحالي */
  function idxStep(dir){
    const cards = [...document.querySelectorAll('#mainBody .section, #mainBody .crow')];
    if(!cards.length) return;
    let target = null;
    if(dir > 0){
      target = cards.find(c => c.getBoundingClientRect().top > 170) || cards[cards.length - 1];
    } else {
      const above = cards.filter(c => c.getBoundingClientRect().top < 100);
      target = above.length ? above[above.length - 1] : cards[0];
    }
    if(target && target.dataset.id) idxJump(target.dataset.id);
  }

  function closeSugIfOutside(ev){
    const box = document.getElementById('searchSug');
    const si = document.getElementById('searchInput');
    if(!box || !si) return;
    if(ev.target !== si && !box.contains(ev.target) && box.classList.contains('open')){
      box.className = 'search-sug';
    }
  }

  (function initSmartSearch(){
    const si = document.getElementById('searchInput');
    if(!si) return;
    si.addEventListener('keydown', e => {
      if(e.key === 'ArrowDown'){ e.preventDefault(); if(_sugSel < _sugResults.length - 1) sugHover(_sugSel + 1); }
      else if(e.key === 'ArrowUp'){ e.preventDefault(); if(_sugSel > 0) sugHover(_sugSel - 1); }
      else if(e.key === 'Enter'){
        if(_sugResults.length && _sugSel >= 0){
          e.preventDefault();
          sugJump(_sugResults[_sugSel].s.id);
        }
      }
      else if(e.key === 'Escape'){
        const box = document.getElementById('searchSug');
        if(box && box.classList.contains('open')){ box.className = 'search-sug'; e.preventDefault(); }
      }
    });
    document.addEventListener('click', e => closeSugIfOutside(e));
  })();

  // ── SECTION GROUPS ──
  const GROUP_LIST = [
    { key:'css',        label:'CSS',              icon:'ti-palette' },
    { key:'responsive', label:'Responsive',       icon:'ti-devices' },
    { key:'brand',      label:'Brand',            icon:'ti-swatch' },
    { key:'salla',      label:'Salla',            icon:'ti-shopping-bag' },
    { key:'has',        label:':has()',          icon:'ti-code' },
    { key:'javascript', label:'JavaScript',       icon:'ti-brand-javascript' }
  ];
  function sectionGroup(s){
    const tags = s.tags || [];
    if(tags.some(t=>['responsive','media','layout','respons'].includes(t.toLowerCase()))) return 'responsive';
    if(tags.some(t=>t.toLowerCase()==='javascript' || t.toLowerCase()==='js')) return 'javascript';
    if(tags.some(t=>['brand','logo','identity'].includes(t.toLowerCase()))) return 'brand';
    if(tags.some(t=>t.toLowerCase()==='has')) return 'has';
    if(tags.some(t=>['salla','zid','cart','product','footer','button','store'].includes(t.toLowerCase()))) return 'salla';
    if(tags.some(t=>t.toLowerCase()==='javascript' || t.toLowerCase()==='js')) return 'javascript';
    const code = (s.codes||[]).map(c=>c.code).join('\n');
    if(isJS(code)) return 'javascript';
    return 'css';
  }
  function toggleGroup(key, ev){
    if(ev){ ev.stopPropagation(); }
    if(collapsedGroups.has(key)) collapsedGroups.delete(key);
    else collapsedGroups.add(key);
    renderAll();
  }

  // ── RENDER ──
  function renderAll(){
    try { return renderAllInner(); }
    finally { alOverlaySync(); if(typeof syncToolsUI === 'function'){ try { syncToolsUI(); } catch(e){} } if(typeof navSync === 'function'){ try { navSync(); } catch(e){} } if(typeof favAnimKick === 'function'){ try { favAnimKick(); } catch(e){} } }
  }
  function renderAllInner(){
    alSyncDash();
    document.body.classList.toggle('editor-active', !!showEdDash);
    persistDashState();
    setDashHash(currentDashId());
    if(showHomeDash) return renderHomeDash();
    if(showAlDash) return renderAlDash();
    if(showScrollbarDash) return renderScrollbarDash();
    if(showCssDash) return renderCssDash();
    if(showEdDash) return renderEdDash();
    if(showDevDash) return renderDevDash();
    if(showB64Dash) return renderB64Dash();
    if(showQrDash) return renderQrDash();
    if(showCpDash) return renderCpDash();
    if(showRtDash) return renderRtDash();
    const body  = document.getElementById('mainBody');
    const badge = document.getElementById('countBadge');
    const q     = (document.getElementById('searchInput')||{}).value?.trim().toLowerCase()||'';
    const list  = getFiltered();

    const _searchWords = q ? parseQuery(q).words : [];
    window._smartWords = _searchWords;
    if(_searchWords.length && list.length > 1){
      const p = parseQuery(q);
      const scored = list.map(s => ({ s, sc: smartScore(s, p).score }));
      scored.sort((a,b) => b.sc - a.sc);
      scored.forEach((x, i) => { list[i] = x.s; });
    }

    badge.textContent = list.length + ' كود';

    if(!list.length){
      body.innerHTML = `<div class="empty-state"><i class="ti ti-mood-empty" aria-hidden="true"></i><p>لا توجد أكواد مطابقة</p>
        <button class="btn-cancel" style="margin-top:12px" onclick="clearSearch()">مسح البحث وعرض الكل</button></div>`;
      return;
    }

    function secBodyHtml(s, searchWords){
      if(!openIds.has(s.id)) return '';
      const vars = detectVars(s.codes.map(c=>c.code).join('\n'));
      const values = varValues.get(s.id) || {};
      const favStudio = (typeof favStudioHtml === 'function' && s.codes.some(c=>c.code.indexOf('const FAV =')!==-1)) ? favStudioHtml(s) : '';

      let varPanelHtml = '';
      if (vars.length) {
        const baseVarDef = vars.find(x => x.key === '--1');
        const baseVal = values['--1'] !== undefined ? values['--1'] : (baseVarDef ? baseVarDef.value : '');

        varPanelHtml = `<div class="var-panel">
          <div class="var-title"><i class="ti ti-adjustments" aria-hidden="true"></i> تعديل المتغيرات</div>`;

        if (baseVarDef) {
          varPanelHtml += `<div class="base-row">
            <span class="color-swatch-lg" id="swatch_${s.id}_base" style="background:${escHtml(baseVal)}"></span>
            <input class="var-input picker-lg" type="color" value="${escHtml(baseVal)}"
              oninput="updateVar('${s.id}','--1',this.value)">
            <span class="base-hex">${escHtml(baseVal)}</span>
          </div>`;
        }

        vars.forEach(v => {
          if (v.key === '--1') return;
          const val = values[v.key] !== undefined ? values[v.key] : v.value;
          if (v.type === 'range') {
            const baseSrc = baseVal || v.secondColor;
            const initMixed = mixColors(baseSrc, v.secondColor, val);
            varPanelHtml += `<div class="var-row">
              <span class="var-label" title="${escHtml(v.varName||'')}">${escHtml(v.label)}</span>
              <input type="range" min="0" max="100" value="${escHtml(val)}"
                oninput="updateVar('${s.id}','${v.key}',this.value); document.getElementById('pctVal_${s.id}_${v.key}').textContent=this.value+'%'">
              <span class="var-val" id="pctVal_${s.id}_${v.key}">${val}%</span>
              <span class="color-swatch" id="swatch_${s.id}_${v.key}" style="background:${initMixed||'var(--bg-elevated)'}"></span>
            </div>`;
          } else {
            varPanelHtml += `<div class="var-row${FAV_FXIDS.includes(val)?' fx-row':''}">
              <span class="var-label">${escHtml(v.label)}</span>
              <input class="var-input" type="${v.type === 'color' ? 'color' : 'text'}" value="${escHtml(val)}"
                placeholder="${v.type === 'url' ? 'https://...' : ''}"
                oninput="updateVar('${s.id}','${v.key}',this.value)" ${v.type === 'url' ? 'dir="ltr"' : ''}>
            </div>`;
          }
        });
        varPanelHtml += `</div>`;
      }

      const codesHtml = s.codes.map((c,i)=>{
        const liveCode = vars.length ? getLiveCode(c.code, values) : c.code;
        return `<div class="code-block">
          <div class="code-header">
            <span class="lang-badge ${c.lang.toLowerCase()}">${escHtml(c.lang)}</span>
            <div class="code-actions">
              <button class="copy-btn" onclick="copyCodeId(this,'${s.id}',${i})" title="نسخ الكود">
                <i class="ti ti-copy" aria-hidden="true"></i> نسخ
              </button>
            </div>
          </div>
          <pre class="code-pre${wrapMode?' wrap':''}">${hlCode(syntaxHL(liveCode), searchWords)}</pre>
        </div>`;
      }).join('');

      let patternBarHtml = '';
      if (s.patterns) {
        patternBarHtml = `<div class="pattern-bar">${
          s.patterns.map((p,i) =>
            `<button class="pattern-tab${i === (s.selectedPattern||0) ? ' active' : ''}" onclick="event.stopPropagation(); selectPattern('${s.id}',${i})">${escHtml(p.name)}</button>`
          ).join('')
        }</div>`;
      }
      return `<div class="section-body open">
        <p class="section-desc">${escHtml(s.desc)}</p>
        ${patternBarHtml}
        ${favStudio}
        ${varPanelHtml}
        ${codesHtml}
      </div>`;
    }

    function secHeadBtns(s){
      return `<div class="section-actions">
        <button class="delete-btn" onclick="confirmDelete('${s.id}',event)" title="حذف" aria-label="حذف ${escHtml(s.title)}">
          <i class="ti ti-trash" aria-hidden="true"></i>
        </button>
      </div>`;
    }

    function cardHtml(s, q, searchWords){
      const isOpen  = openIds.has(s.id);
      const tagsHtml = s.tags.map(t=>`<span class="stag">${escHtml(t)}</span>`).join('');
      const countLabel = s.codes.length > 1 ? `<span class="code-count">${s.codes.length} أكواد</span>` : '';
      return `<div class="section" data-id="${s.id}">
        <div class="section-head" onclick="toggleSection('${s.id}')">
          <i class="ti ti-chevron-left chevron${isOpen?' open':''}" aria-hidden="true"></i>
          <span class="section-title">${hlQuery(s.title, q)}</span>
          ${countLabel}
          <div class="section-tags">${tagsHtml}</div>
          ${secHeadBtns(s)}
        </div>
        ${secBodyHtml(s, searchWords)}
      </div>`;
    }

    function rowHtml(s, i, q, searchWords){
      const isOpen  = openIds.has(s.id);
      const tagsHtml = s.tags.map(t=>`<span class="stag">${escHtml(t)}</span>`).join('');
      const countLabel = s.codes.length > 1 ? `<span class="code-count">${s.codes.length} أكواد</span>` : '';
      const firstLang = (s.codes[0] && s.codes[0].lang) || '';
      return `<div class="crow${isOpen?' open':''}" data-id="${s.id}">
        <div class="crow-head" onclick="toggleSection('${s.id}')">
          <span class="crow-n">${i+1}</span>
          <span class="crow-title">${hlQuery(s.title, q)}</span>
          ${countLabel}
          <span class="lang-badge ${firstLang.toLowerCase()}">${escHtml(firstLang)}</span>
          <div class="crow-tags">${tagsHtml}</div>
          <div class="crow-actions">
            <button class="crow-copy" onclick="quickCopy('${s.id}',this,event)" title="نسخ سريع">
              <i class="ti ti-copy" aria-hidden="true"></i> نسخ
            </button>
            ${secHeadBtns(s)}
            <i class="ti ti-chevron-left chevron${isOpen?' open':''}" aria-hidden="true"></i>
          </div>
        </div>
        ${secBodyHtml(s, searchWords)}
      </div>`;
    }

    const cardsHtml = list.map(s=>cardHtml(s, q, _searchWords));
    const useFlat = !!q || _searchWords.length || parseQuery((document.getElementById('searchInput')||{}).value||'').tags.length || parseQuery((document.getElementById('searchInput')||{}).value||'').excl.length;
    const idxHtml = `<div class="idx-bar"><span class="idx-label"><i class="ti ti-list" aria-hidden="true"></i> فهرس ${list.length}</span><div class="idx-list">${
      list.map((s,i)=>`<button class="idx-chip" onclick="idxJump('${s.id}')" title="${escHtml(s.title)}"><span class="idx-n">${i+1}</span><span class="idx-t">${escHtml(s.title)}</span></button>`).join('')
    }</div><button class="idx-top" onclick="window.scrollTo({top:0,behavior:'smooth'})" title="أعلى الصفحة (Alt+↑ للتنقل بين الأكواد)"><i class="ti ti-arrow-up" aria-hidden="true"></i></button></div>`;
    const view = getCodesView();
    const segHtml = `<div class="cb-seg" title="طريقة العرض">
      <button class="cb-btn${view==='list'?' on':''}" onclick="setCodesView('list')"><i class="ti ti-list" aria-hidden="true"></i> قائمة</button>
      <button class="cb-btn${view==='grid'?' on':''}" onclick="setCodesView('grid')"><i class="ti ti-layout-grid" aria-hidden="true"></i> شبكة</button>
    </div>`;
    const foldHtml = `<button class="cb-mini" onclick="toggleAll(true)" title="فتح الكل"><i class="ti ti-arrows-maximize" aria-hidden="true"></i> فتح</button>
      <button class="cb-mini" onclick="toggleAll(false)" title="طي الكل"><i class="ti ti-arrows-minimize" aria-hidden="true"></i> طي</button>`;
    const barHtml = `<div class="codesbox-bar"><span class="cb-title"><i class="ti ti-box" aria-hidden="true"></i> ${useFlat ? 'نتائج البحث' : 'كل الأكواد'} <b>${list.length}</b></span>${segHtml}${foldHtml}</div>`;
    let body2 = '';
    if(view === 'list'){
      if(useFlat && list.length){
        body2 = idxHtml + barHtml + `<div class="codes-box">` + list.map((s,i)=>rowHtml(s,i,q,_searchWords)).join('') + `</div>`;
      } else {
        body2 = idxHtml + barHtml + `<div class="codes-box">` + GROUP_LIST.map(g=>{
          const items = list.map((s,i)=>[s,i]).filter(([s]) => sectionGroup(s)===g.key);
          if(!items.length) return '';
          const isOpen = !collapsedGroups.has(g.key);
          return `<div class="crow-group" onclick="toggleGroup('${g.key}', event)" title="طي/فتح المجموعة">
            <i class="ti ${g.icon}" aria-hidden="true"></i><span>${g.label}</span><b>${items.length}</b>
            <i class="ti ${isOpen?'ti-chevron-down':'ti-chevron-left'}" aria-hidden="true"></i>
          </div>` + (isOpen ? items.map(([s,i])=>rowHtml(s,i,q,_searchWords)).join('') : '');
        }).join('') + `</div>`;
      }
    } else {
      const groupsHtml = GROUP_LIST.map(g=>{
        const idxs = list.map((s,i) => [s,i]).filter(([s,i]) => sectionGroup(s) === g.key).map(([s,i]) => i);
        if(!idxs.length) return '';
        const itemsHtml = idxs.map(i => cardsHtml[i]).join('');
        const isOpen = !collapsedGroups.has(g.key);
        return `<div class="group-wrap">
          <div class="group-head g-${g.key}${isOpen ? ' open' : ''}" onclick="toggleGroup('${g.key}', event)">
            <i class="ti ${g.icon} group-ic" aria-hidden="true"></i>
            <span class="group-title">${g.label}</span>
            <span class="group-count">${idxs.length} كود</span>
            <i class="ti ti-chevron-right group-arrow" aria-hidden="true"></i>
          </div>
          <div class="group-body${isOpen ? ' open' : ''}">${itemsHtml}</div>
        </div>`;
      }).join('');
      body2 = useFlat && list.length
        ? idxHtml + barHtml + `<div class="flat-head"><i class="ti ti-sparkles" aria-hidden="true"></i> أفضل النتائج لعبارة «${escHtml((document.getElementById('searchInput')||{}).value.trim())}» — ${list.length} كود</div>` + cardsHtml.join('')
        : idxHtml + barHtml + groupsHtml;
    }
    body.innerHTML = body2 || `<div class="empty-state"><i class="ti ti-mood-empty" aria-hidden="true"></i><p>لا توجد أكواد مطابقة</p></div>`;
    body.querySelectorAll('.code-pre').forEach(addLn);
  }

  // ── MODAL ──
  function openModal(){
    document.getElementById('modalOverlay').classList.add('open');
    document.getElementById('inp-title').focus();
  }
  function closeModal(){
    document.getElementById('modalOverlay').classList.remove('open');
    ['inp-title','inp-desc','inp-tags','inp-code'].forEach(id=>{ document.getElementById(id).value=''; });
    document.getElementById('inp-lang').value = 'CSS';
  }
  function closeModalOutside(e){ if(e.target===document.getElementById('modalOverlay')) closeModal(); }
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });

  // ── FIND & REPLACE ──
  let frFindMatches = [];
  function openFindReplace(){
    document.getElementById('findReplaceOverlay').classList.add('open');
    document.getElementById('frSearch').focus();
    frFindMatches = [];
    document.getElementById('frResults').style.display = 'none';
  }
  function closeFindReplace(){
    document.getElementById('findReplaceOverlay').classList.remove('open');
    frFindMatches = [];
    document.getElementById('frResults').style.display = 'none';
  }
  document.addEventListener('keydown', e=>{ 
    if(e.key==='Escape' && document.getElementById('findReplaceOverlay').classList.contains('open')) closeFindReplace(); 
  });

  document.getElementById('frFindBtn')?.addEventListener('click', performFind);
  document.getElementById('frSearch')?.addEventListener('keydown', (e)=>{ if(e.key==='Enter') performFind(); });
  document.getElementById('frReplace')?.addEventListener('keydown', (e)=>{ if(e.key==='Enter') performReplace(); });

  function performFind(){
    const searchTerm = document.getElementById('frSearch').value.trim();
    const caseSensitive = document.getElementById('frCaseSensitive').checked;
    
    if(!searchTerm){ 
      showToast('ادخل نص للبحث'); 
      return; 
    }

    frFindMatches = [];
    let totalMatches = 0;
    let totalSections = 0;

    DATA.forEach(section => {
      let matchCount = 0;
      section.codes.forEach(codeObj => {
        const code = codeObj.code;
        const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), caseSensitive ? 'g' : 'gi');
        const matches = code.match(regex) || [];
        matchCount += matches.length;
      });

      if(matchCount > 0){
        frFindMatches.push({sectionId: section.id, title: section.title, matchCount});
        totalMatches += matchCount;
        totalSections++;
      }
    });

    const resultsDiv = document.getElementById('frResults');
    const resultsText = document.getElementById('frResultsText');
    
    if(frFindMatches.length > 0){
      resultsText.innerHTML = `✅ عثرت على <strong>${totalMatches}</strong> تطابق في <strong>${totalSections}</strong> أقسام`;
      resultsDiv.style.display = 'block';
    } else {
      resultsText.innerHTML = '❌ لم تجد أي نتائج';
      resultsDiv.style.display = 'block';
    }
  }

  function performReplace(){
    const searchTerm = document.getElementById('frSearch').value.trim();
    const replaceTerm = document.getElementById('frReplace').value.trim();
    const caseSensitive = document.getElementById('frCaseSensitive').checked;
    
    if(!searchTerm){ 
      showToast('ادخل نص للبحث'); 
      return; 
    }

    let totalReplaced = 0;

    DATA.forEach(section => {
      section.codes.forEach(codeObj => {
        const originalCode = codeObj.code;
        const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), caseSensitive ? 'g' : 'gi');
        const matches = originalCode.match(regex) || [];
        totalReplaced += matches.length;
        codeObj.code = originalCode.replace(regex, replaceTerm);
      });
    });

    if(totalReplaced > 0){
      const resultsDiv = document.getElementById('frResults');
      const resultsText = document.getElementById('frResultsText');
      resultsText.innerHTML = `✅ تم استبدال <strong>${totalReplaced}</strong> نصوص بنجاح!`;
      resultsDiv.style.display = 'block';

      saveUserOverlay();
      renderAll();
      showToast(`تم استبدال ${totalReplaced} نص!`);
      
      setTimeout(() => closeFindReplace(), 1500);
    } else {
      showToast('لم يتم العثور على نصوص للاستبدال');
    }
  }

  function addSection(){
    const title = document.getElementById('inp-title').value.trim();
    const desc  = document.getElementById('inp-desc').value.trim();
    const tagsRaw = document.getElementById('inp-tags').value.trim();
    const lang  = document.getElementById('inp-lang').value;
    const code  = document.getElementById('inp-code').value.trim();

    if(!title || !code){ showToast('العنوان والكود مطلوبان'); return; }

    const id = 'sec_' + Date.now();
    const tags = tagsRaw ? tagsRaw.split(',').map(t=>t.trim()).filter(Boolean) : ['css'];

    DATA.unshift({ id, title, desc: desc||'لا يوجد وصف', tags, codes:[{ lang, code }] });
    openIds.add(id);
    saveUserOverlay();
    closeModal();
    renderAll();
    if(wrapMode) document.querySelectorAll('.code-pre').forEach(el => el.classList.add('wrap'));
    showToast('تم إضافة الكود!');
  }

  // ── EXPORT / IMPORT ──
  function exportData(){
    const exportArr = DATA.map(s => ({ id:s.id, title:s.title, tags:s.tags, desc:s.desc, codes:s.codes, patterns:s.patterns, selectedPattern:s.selectedPattern }));
    const json = JSON.stringify(exportArr, null, 2);
    const blob = new Blob([json], { type:'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'code-manager-backup.json';
    a.click(); URL.revokeObjectURL(url);
    showToast('تم التصدير!');
  }

  function importData(e){
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const imported = JSON.parse(ev.target.result);
        if(!Array.isArray(imported)) throw new Error();
        imported.forEach(item => {
          if(!item || !item.title || !Array.isArray(item.codes) || !item.codes.length) return;
          if(!item.id) item.id = 'imp_' + Date.now() + Math.random().toString(36).slice(2,6);
          if(!Array.isArray(item.tags) || !item.tags.length) item.tags = ['css'];
          openIds.add(item.id);
        });
        DATA = imported.filter(x => x && x.title && Array.isArray(x.codes) && x.codes.length);
        try { localStorage.removeItem(DEL_KEY); } catch(e){}
        saveUserOverlay();
        renderAll();
        if(wrapMode) document.querySelectorAll('.code-pre').forEach(el => el.classList.add('wrap'));
        showToast('تم الاستيراد بنجاح!');
      } catch {
        showToast('ملف JSON غير صالح');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // ── ACTIVE DASHBOARD PERSISTENCE ──
  const DASH_KEY = 'csman_v2_dash_v1';
  const DASH_SUB_KEY = 'csman_v2_dash_sub_v1';

  function currentDashId(){
    if(showHomeDash) return 'home';
    if(showAlDash) return 'al';
    if(showScrollbarDash) return 'sb';
    if(showCssDash) return (typeof cssTab !== 'undefined' && cssTab === 'has') ? 'has' : 'cv';
    if(showEdDash) return 'ed';
    if(showDevDash) return 'dev';
    if(showB64Dash) return 'b64';
    if(showQrDash) return 'qr';
    if(showCpDash) return 'cp';
    if(showRtDash) return 'rt';
    return 'main';
  }

  function persistDashState(){
    try {
      localStorage.setItem(DASH_KEY, currentDashId());
      localStorage.setItem(DASH_SUB_KEY, JSON.stringify({ tool: dtActiveTool, b64: b64ActiveTab }));
    } catch (e) {}
  }

  function restoreDashState(){
    let id = 'home';
    try { id = localStorage.getItem(DASH_KEY) || 'home'; } catch (e) {}
    if (!['home','al','has','sb','css','cv','vd','ed','dev','b64','qr','cp','rt'].includes(id)) id = 'home';
    try {
      const sub = JSON.parse(localStorage.getItem(DASH_SUB_KEY) || 'null');
      if (sub && sub.tool) dtActiveTool = sub.tool;
      if (sub && sub.b64) b64ActiveTab = sub.b64;
    } catch (e) {}
    if(typeof cssTab !== 'undefined'){
      if(id === 'has') cssTab = 'has';
      else if(id === 'cv') cssTab = 'cv';
      // id === 'css' القديم: اترك cssTab المحفوظ في csman_v2_css_tab_v1 كما هو
    }
    showHomeDash = id === 'home';
    showAlDash = id === 'al';
    showScrollbarDash = id === 'sb';
    showCssDash = (id === 'css' || id === 'cv' || id === 'has');
    showEdDash = id === 'ed';
    showDevDash = id === 'dev';
    showB64Dash = id === 'b64';
    showQrDash = id === 'qr';
    showCpDash = id === 'cp';
    showRtDash = id === 'rt';
    const mark = (btnId, cls, on) => {
      const b = document.getElementById(btnId);
      if (b) b.classList.toggle(cls, on);
    };
    mark('homeBtn', 'home-active', showHomeDash);
    mark('alDashBtn', 'al-active', showAlDash);
    mark('sbDashBtn', 'scrollbar-active', showScrollbarDash);
    mark('cssDashBtn', 'css-active', showCssDash);
    mark('edDashBtn', 'ed-active', showEdDash);
    mark('devDashBtn', 'dev-active', showDevDash);
    mark('b64DashBtn', 'b64-active', showB64Dash);
    mark('qrDashBtn', 'qr-active', showQrDash);
    mark('cpDashBtn', 'cp-active', showCpDash);
    mark('rtDashBtn', 'rt-active', showRtDash);
  }

  // ── HASH DEEP-LINKS ──
  function currentHash(){
    try {
      return (typeof location !== 'undefined' && location.hash ? String(location.hash) : '').replace(/^#/, '').toLowerCase();
    } catch (e) { return ''; }
  }
  function clearDashFlags(){
    showHomeDash = false; showAlDash = false; showScrollbarDash = false; showCssDash = false;
    showEdDash = false; showDevDash = false; showB64Dash = false; showQrDash = false;
    showCpDash = false; showRtDash = false;
    const map = { homeBtn:'home-active', alDashBtn:'al-active', sbDashBtn:'scrollbar-active', cssDashBtn:'css-active',
      edDashBtn:'ed-active', devDashBtn:'dev-active',
      b64DashBtn:'b64-active', qrDashBtn:'qr-active', cpDashBtn:'cp-active', rtDashBtn:'rt-active' };
    Object.keys(map).forEach(id => {
      const b = document.getElementById(id);
      if (b) b.classList.remove(map[id]);
    });
    const tags = document.querySelectorAll('.filter-tag');
    if (tags && tags.forEach) tags.forEach(b => b.classList.remove('active'));
  }
  function setDashHash(id){
    try {
      const target = (id && id !== 'main' && id !== 'home') ? '#' + id : (id === 'home' ? '#home' : '#tool');
      const cur = (typeof location !== 'undefined' && location) ? location.hash : '';
      if (cur === target) return;
      if (typeof history !== 'undefined' && history.replaceState) {
        history.replaceState(null, '', target);
      } else if (typeof location !== 'undefined' && location) {
        location.hash = target;
      }
    } catch (e) {}
  }
  function hashGo(){
    const h = currentHash();
    const ids = ['home','al','sb','css','cv','has','ed','dev','b64','qr','cp','rt'];
    try {
      const sub = JSON.parse(localStorage.getItem(DASH_SUB_KEY) || 'null');
      if (sub && sub.tool) dtActiveTool = sub.tool;
      if (sub && sub.b64) b64ActiveTab = sub.b64;
    } catch (e) {}
    clearDashFlags();
    if (h && ids.includes(h)) {
      const map = { home:['homeBtn','home-active'], al:['alDashBtn','al-active'], sb:['sbDashBtn','scrollbar-active'], css:['cssDashBtn','css-active'],
        cv:['cssDashBtn','css-active'], has:['cssDashBtn','css-active'],
        ed:['edDashBtn','ed-active'], dev:['devDashBtn','dev-active'],
        b64:['b64DashBtn','b64-active'], qr:['qrDashBtn','qr-active'], cp:['cpDashBtn','cp-active'],
        rt:['rtDashBtn','rt-active'] };
      const btn = map[h];
      if (h === 'home') showHomeDash = true;
      else if (h === 'al') showAlDash = true;
      else if (h === 'sb') showScrollbarDash = true;
      else if (h === 'css') showCssDash = true;
      else if (h === 'cv'){ showCssDash = true; if(typeof cssTab !== 'undefined'){ cssTab = 'cv'; try{localStorage.setItem('csman_v2_css_tab_v1','cv');}catch(e){} } }
      else if (h === 'has'){ showCssDash = true; if(typeof cssTab !== 'undefined'){ cssTab = 'has'; try{localStorage.setItem('csman_v2_css_tab_v1','has');}catch(e){} } }
      else if (h === 'ed') showEdDash = true;
      else if (h === 'dev') showDevDash = true;
      else if (h === 'b64') showB64Dash = true;
      else if (h === 'qr') showQrDash = true;
      else if (h === 'cp') showCpDash = true;
      else if (h === 'rt') showRtDash = true;
      const b = document.getElementById(btn[0]);
      if (b) b.classList.add(btn[1]);
    }
    renderAll();
  }
  window.onhashchange = hashGo;

