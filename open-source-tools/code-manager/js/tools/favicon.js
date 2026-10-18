// ── FAVICON STUDIO DASHBOARD (معرض تأثيرات Favicon المتحرك — Canvas فقط) ──
let showFavDash = false;
let favdCfg = { fx:'pulse', c1:'#2c1126', c2:'#f736b0', c3:'#95238d', c4:'#f6516f', ink:'#ffffff', letter:'عـ' };
let favdRaf = 0, favdLastUrl = '', favdLastTab = 0, favdTabLive = true;

const FAVD_FX = {
  pulse:{ar:'نبض',desc:'تدرج متحرك مع هالة نابضة'},
  glow:{ar:'توهج',desc:'قوس مضيء مع تدرج'},
  mono:{ar:'أحادي',desc:'خلفية صلبة وشريط سفلي'},
  spin:{ar:'دوران',desc:'حرف يدور مع حلقة'},
  bounce:{ar:'ارتداد',desc:'ارتداد مع ظل'},
  glitch:{ar:'خلل',desc:'تشويش RGB'},
  wave:{ar:'موجة',desc:'خطوط متموجة خلف الحرف'},
  neon:{ar:'نيون',desc:'إطار نيون وامض'},
  liquid:{ar:'سائل',desc:'فقاعات سائلة تتشكل'}
};

function toggleFavDash(){
  showFavDash = !showFavDash;
  const b = document.getElementById('favDashBtn');
  if(b) b.classList.toggle('fav-active', showFavDash);
  if(showFavDash){
    document.querySelectorAll('.filter-tag:not(#favDashBtn)').forEach(x=>x.classList.remove('active'));
    showCssDash = false;
    const cb = document.getElementById('cssDashBtn'); if(cb) cb.classList.remove('css-active');
    showHomeDash = false;
    const hb = document.getElementById('homeBtn'); if(hb) hb.classList.remove('home-active');
    showScrollbarDash = false; showEdDash = false; showDevDash = false;
    showB64Dash = false; showQrDash = false; showCpDash = false; showRtDash = false;
    ['sbDashBtn','edDashBtn','devDashBtn','b64DashBtn','qrDashBtn','cpDashBtn','rtDashBtn'].forEach(id=>{
      const el = document.getElementById(id);
      if(el) el.classList.remove('scrollbar-active','ed-active','dev-active','b64-active','qr-active','cp-active','rt-active');
    });
  } else { favdStopLoop(); }
  renderAll();
}

// ── محرك الرسم (نفس تأثيرات الملف الأصلي — يدعم أي مقاس) ──
function favdPaint(x, F, t, s){
  s = s || 32;
  const pulse = (Math.sin(t*0.003)+1)/2;
  x.clearRect(0,0,s,s);
  const R = s*0.21875;
  const rr = (X,Y,W,H,Rr)=>{ if(x.roundRect){ x.beginPath(); x.roundRect(X,Y,W,H,Rr); } else { x.beginPath(); x.moveTo(X+Rr,Y); x.arcTo(X+W,Y,X+W,Y+H,Rr); x.arcTo(X+W,Y+H,X,Y+H,Rr); x.arcTo(X,Y+H,X,Y,Rr); x.arcTo(X,Y,X+W,Y,Rr); x.closePath(); } };
  const ct = ()=>{ x.textAlign='center'; x.textBaseline='middle'; };
  const L = (F.letter || 'عـ').slice(0,3);
  if(F.fx==='glow'){
    const bg=x.createLinearGradient(0,0,s,s); bg.addColorStop(0,F.c1); bg.addColorStop(1,F.c3); x.fillStyle=bg; x.beginPath(); rr(0,0,s,s,R); x.fill();
    x.save(); x.shadowColor=F.c2; x.shadowBlur=s*0.3125; x.strokeStyle=F.c4; x.lineWidth=s*0.09375; x.beginPath(); x.arc(s/2,s/2,s*0.28125+pulse*s*0.0625,0,Math.PI*2); x.stroke(); x.restore();
    x.fillStyle=F.ink; x.font='bold '+s*0.46875+'px Cairo, sans-serif'; ct(); x.fillText(L,s/2,s/2+s*0.03);
  } else if(F.fx==='mono'){
    x.fillStyle=F.c1; x.beginPath(); rr(0,0,s,s,R); x.fill(); x.fillStyle=F.c4; x.fillRect(s*0.25,s*0.71875,s*0.5,s*0.09375);
    x.fillStyle=F.c2; x.font='bold '+s*0.53125+'px Cairo, sans-serif'; ct(); x.fillText(L,s/2,s*0.4375);
  } else if(F.fx==='pulse'){
    const g=x.createLinearGradient(0,0,s,s); g.addColorStop(0,F.c1); g.addColorStop(0.5,pulse>0.5?F.c2:F.c3); g.addColorStop(1,F.c4); x.fillStyle=g; x.beginPath(); rr(0,0,s,s,R); x.fill();
    x.fillStyle='rgba(255,255,255,'+(0.12+pulse*0.18)+')'; x.beginPath(); x.arc(s/2,s/2,s*0.25+pulse*s*0.125,0,Math.PI*2); x.fill();
    x.fillStyle=F.ink; x.font='bold '+s*0.625+'px Cairo, sans-serif'; ct(); x.shadowColor='rgba(0,0,0,0.5)'; x.shadowBlur=s*0.125; x.fillText(L,s/2,s/2+s*0.03); x.shadowBlur=0;
  } else if(F.fx==='spin'){
    const g=x.createLinearGradient(0,0,s,s); g.addColorStop(0,F.c1); g.addColorStop(1,F.c3); x.fillStyle=g; x.beginPath(); rr(0,0,s,s,R); x.fill();
    x.save(); x.translate(s/2,s/2); x.rotate(t*0.003); x.strokeStyle=F.c2; x.lineWidth=s*0.0625; x.beginPath(); x.arc(0,0,s*0.34375,0,Math.PI*1.5); x.stroke(); x.restore();
    x.save(); x.translate(s/2,s/2); x.rotate(t*0.0025); x.fillStyle=F.ink; x.font='bold '+s*0.6+'px Cairo, sans-serif'; ct(); x.fillText(L,0,s*0.02); x.restore();
  } else if(F.fx==='bounce'){
    const g=x.createLinearGradient(0,0,s,s); g.addColorStop(0,F.c1); g.addColorStop(1,F.c3); x.fillStyle=g; x.beginPath(); rr(0,0,s,s,R); x.fill();
    const yo=(1-Math.abs(Math.sin(t*0.004)))*s*0.18;
    x.fillStyle='rgba(0,0,0,0.35)'; x.beginPath(); x.ellipse(s/2,s*0.8125,s*0.1875,s*0.0625,0,0,Math.PI*2); x.fill();
    x.save(); x.translate(0,-yo); x.fillStyle=F.ink; x.font='bold '+s*0.625+'px Cairo, sans-serif'; ct(); x.fillText(L,s/2,s*0.53); x.restore();
  } else if(F.fx==='glitch'){
    x.fillStyle=F.c1; x.beginPath(); rr(0,0,s,s,R); x.fill();
    const gl=Math.random()<0.12||Math.sin(t*0.02)>0.82; const off=gl?(Math.random()*s*0.08):0;
    ct(); x.font='bold '+s*0.6+'px Cairo, sans-serif';
    if(gl){
      x.fillStyle=F.c2; x.fillText(L,s/2+off,s/2);
      x.fillStyle=F.c4; x.fillText(L,s/2-off,s/2+s*0.02);
      x.fillStyle=F.ink; x.fillText(L,s/2,s/2);
      x.fillStyle='rgba(255,255,255,0.08)'; for(let i=0;i<s;i+=s*0.125){ x.fillRect(0,i,s,s*0.02); }
    } else { x.fillStyle=F.ink; x.fillText(L,s/2,s/2); }
  } else if(F.fx==='wave'){
    x.save(); x.beginPath(); rr(0,0,s,s,R); x.clip(); x.fillStyle=F.c1; x.fillRect(0,0,s,s);
    const cols=[F.c2,F.c3,F.c4];
    for(let j=0;j<3;j++){
      x.strokeStyle=cols[j]; x.lineWidth=Math.max(1,s*0.04); x.beginPath();
      for(let X=0;X<=s;X+=1){
        const Y=s*0.5+Math.sin(X*0.1+t*0.005+j)*s*0.12+j*s*0.08-s*0.1;
        if(X===0) x.moveTo(X,Y); else x.lineTo(X,Y);
      } x.stroke();
    } x.restore();
    x.fillStyle=F.ink; x.font='bold '+s*0.6+'px Cairo, sans-serif'; ct(); x.shadowColor='rgba(0,0,0,0.4)'; x.shadowBlur=s*0.08; x.fillText(L,s/2,s/2); x.shadowBlur=0;
  } else if(F.fx==='neon'){
    x.fillStyle='#0e0e1a'; x.beginPath(); rr(0,0,s,s,R); x.fill();
    const flick=0.7+Math.sin(t*0.01)*0.15+Math.sin(t*0.023)*0.15;
    x.save(); x.shadowColor=F.c2; x.shadowBlur=s*0.25*flick; x.strokeStyle=F.c2; x.lineWidth=Math.max(1,s*0.06); x.globalAlpha=Math.max(0.2,Math.min(1,flick));
    x.beginPath(); rr(s*0.078,s*0.078,s-s*0.156,s-s*0.156,R*0.7); x.stroke(); x.restore();
    x.fillStyle=F.ink; x.font='bold '+s*0.6+'px Cairo, sans-serif'; ct(); x.shadowColor=F.c2; x.shadowBlur=s*0.15; x.fillText(L,s/2,s/2+s*0.02); x.shadowBlur=0;
  } else if(F.fx==='liquid'){
    x.fillStyle=F.c1; x.beginPath(); rr(0,0,s,s,R); x.fill();
    const cx=s/2, cy=s/2;
    const blobs=[{col:F.c2,amp:s*0.1875,sp:0.002,p:0},{col:F.c3,amp:s*0.14,sp:0.003,p:2},{col:F.c4,amp:s*0.12,sp:0.0025,p:4}];
    for(const b of blobs){
      x.fillStyle=b.col; x.globalAlpha=0.85; x.beginPath();
      for(let a=0;a<Math.PI*2;a+=0.22){
        const rad=b.amp+Math.sin(a*3+t*b.sp+b.p)*s*0.06;
        const X=cx+Math.cos(a)*rad, Y=cy+Math.sin(a)*rad;
        if(a===0) x.moveTo(X,Y); else x.lineTo(X,Y);
      } x.closePath(); x.fill();
    } x.globalAlpha=1;
    x.fillStyle=F.ink; x.font='bold '+s*0.62+'px Cairo, sans-serif'; ct(); x.fillText(L,s/2,s/2+s*0.03);
  }
}

function favdStopLoop(){ if(favdRaf){ cancelAnimationFrame(favdRaf); favdRaf=0; } }

function favdLoop(ts){
  if(!showFavDash) return;
  const big = document.getElementById('favPrevBig');
  const mini = document.getElementById('favPrev32');
  if(big){ const c=big.getContext('2d'); if(c) favdPaint(c, favdCfg, ts||0, 128); }
  if(mini){ const c=mini.getContext('2d'); if(c) favdPaint(c, favdCfg, ts||0, 32); }
  if(favdTabLive && ts - favdLastTab > 500){
    favdLastTab = ts;
    try{
      const off = document.createElement('canvas'); off.width=32; off.height=32;
      const oc = off.getContext('2d'); favdPaint(oc, favdCfg, ts||0, 32);
      const url = off.toDataURL('image/png'); favdLastUrl = url;
      let link = document.querySelector('#favicon-live');
      if(!link){ link=document.createElement('link'); link.id='favicon-live'; link.rel='icon'; link.type='image/png'; document.head.appendChild(link); }
      link.href = url;
      const img = document.getElementById('favTabImg'); if(img) img.src = url;
    }catch(e){}
  }
  favdRaf = requestAnimationFrame(favdLoop);
}

function favdSet(key, val){
  favdCfg[key] = val;
  if(key==='letter'){ const inp=document.getElementById('favLetterEcho'); if(inp) inp.textContent=(val||'عـ').slice(0,3); }
  favdRefreshCode();
}
function favdSetFx(val){ favdCfg.fx = val; favdRefreshCode(); favdMarkFxBtns(); }
function favdMarkFxBtns(){
  document.querySelectorAll('.fav-fx-btn').forEach(b=>b.classList.toggle('on', b.dataset.fx===favdCfg.fx));
  const nm = document.getElementById('favFxName'); if(nm) nm.textContent = (FAVD_FX[favdCfg.fx]||{}).ar || favdCfg.fx;
  const ds = document.getElementById('favFxDesc'); if(ds) ds.textContent = (FAVD_FX[favdCfg.fx]||{}).desc || '';
}
function favdToggleTabLive(el){ favdTabLive = !!(el && el.checked); }
function favdResetTab(){
  try{ const l=document.querySelector('#favicon-live'); if(l) l.remove(); }catch(e){}
  const img = document.getElementById('favTabImg'); if(img) img.removeAttribute('src');
  showToast('رجعت فافيكون الصفحة الأصلي');
}
// ── كود التصدير الجاهز (نفس قالب الملف الأصلي self-contained) ──
function favdExportCode(){
  const e = favdCfg;
  const v = String(e.letter||'عـ').slice(0,3).replace(/\\/g,'\\\\').replace(/"/g,'\\"');
  const head = `<link id='favicon' rel='icon' type='image/png' href=''/>\n<canvas id='c' width='32' height='32' style='display:none'></canvas>\n<script>\n//<![CDATA[\nconst FAV = { fx: "${e.fx}", c1:"${e.c1}", c2:"${e.c2}", c3:"${e.c3}", c4:"${e.c4}", ink:"${e.ink}", letter: "${v}" };\nconst canvas = document.getElementById('c');\nconst ctx = canvas.getContext('2d');\nconst link = document.getElementById('favicon');\nfunction favPaint(x, F, t){\n  const s=32;\n  const pulse=(Math.sin(t*0.003)+1)/2;\n  x.clearRect(0,0,s,s);\n  const rr=(X,Y,W,H,R)=>{ if(x.roundRect){ x.roundRect(X,Y,W,H,R);} else { x.beginPath(); x.moveTo(X+R,Y); x.arcTo(X+W,Y,X+W,Y+H,R); x.arcTo(X+W,Y+H,X,Y+H,R); x.arcTo(X,Y+H,X,Y,R); x.arcTo(X,Y,X+W,Y,R); x.closePath(); } };\n  const ct=()=>{ x.textAlign='center'; x.textBaseline='middle'; };\n`;
  const p1 = `  if(F.fx==="glow"){\n    const bg=x.createLinearGradient(0,0,s,s); bg.addColorStop(0,F.c1); bg.addColorStop(1,F.c3); x.fillStyle=bg; x.beginPath(); rr(0,0,s,s,7); x.fill();\n    x.save(); x.shadowColor=F.c2; x.shadowBlur=10; x.strokeStyle=F.c4; x.lineWidth=3; x.beginPath(); x.arc(16,16,9+pulse*2,0,Math.PI*2); x.stroke(); x.restore();\n    x.fillStyle=F.ink; x.font='bold 15px Cairo, sans-serif'; ct(); x.fillText(F.letter,16,17);\n  }else if(F.fx==="mono"){\n    x.fillStyle=F.c1; x.beginPath(); rr(0,0,s,s,7); x.fill(); x.fillStyle=F.c4; x.fillRect(8,23,16,3);\n    x.fillStyle=F.c2; x.font='bold 17px Cairo, sans-serif'; ct(); x.fillText(F.letter,16,14);\n  }else if(F.fx==="pulse"){\n    const g=x.createLinearGradient(0,0,s,s); g.addColorStop(0,F.c1); g.addColorStop(0.5,pulse>0.5?F.c2:F.c3); g.addColorStop(1,F.c4); x.fillStyle=g; x.beginPath(); rr(0,0,s,s,7); x.fill();\n    x.fillStyle='rgba(255,255,255,'+(0.12+pulse*0.18)+')'; x.beginPath(); x.arc(16,16,8+pulse*4,0,Math.PI*2); x.fill();\n    x.fillStyle=F.ink; x.font='bold 20px Cairo, sans-serif'; ct(); x.shadowColor='rgba(0,0,0,0.5)'; x.shadowBlur=4; x.fillText(F.letter,16,17); x.shadowBlur=0;\n  }else if(F.fx==="spin"){\n    const g=x.createLinearGradient(0,0,s,s); g.addColorStop(0,F.c1); g.addColorStop(1,F.c3); x.fillStyle=g; x.beginPath(); rr(0,0,s,s,7); x.fill();\n    x.save(); x.translate(16,16); x.rotate(t*0.003); x.strokeStyle=F.c2; x.lineWidth=2; x.beginPath(); x.arc(0,0,11,0,Math.PI*1.5); x.stroke(); x.restore();\n    x.save(); x.translate(16,16); x.rotate(t*0.0025); x.fillStyle=F.ink; x.font='bold 19px Cairo, sans-serif'; ct(); x.fillText(F.letter,0,1); x.restore();\n  }else if(F.fx==="bounce"){\n    const g=x.createLinearGradient(0,0,s,s); g.addColorStop(0,F.c1); g.addColorStop(1,F.c3); x.fillStyle=g; x.beginPath(); rr(0,0,s,s,7); x.fill();\n    const b=Math.abs(Math.sin(t*0.004)); const yo=(1-b)*6;\n    x.fillStyle='rgba(0,0,0,0.35)'; x.beginPath(); x.ellipse(16,26,6,2,0,0,Math.PI*2); x.fill();\n    x.save(); x.translate(0,-yo); x.fillStyle=F.ink; x.font='bold 20px Cairo, sans-serif'; ct(); x.fillText(F.letter,16,17); x.restore();\n`;
  const p2 = `  }else if(F.fx==="glitch"){\n    x.fillStyle=F.c1; x.beginPath(); rr(0,0,s,s,7); x.fill();\n    const gl=Math.random()<0.15||Math.sin(t*0.02)>0.8; const off=gl?(Math.random()*2.5):0;\n    ct(); x.font='bold 19px Cairo, sans-serif';\n    if(gl){\n      x.fillStyle=F.c2; x.fillText(F.letter,16+off,16);\n      x.fillStyle=F.c4; x.fillText(F.letter,16-off,16.6);\n      x.fillStyle=F.ink; x.fillText(F.letter,16,16);\n      x.fillStyle='rgba(255,255,255,0.08)'; for(let i=0;i<s;i+=4){ x.fillRect(0,i,s,1); }\n    }else{ x.fillStyle=F.ink; x.fillText(F.letter,16,16); }\n  }else if(F.fx==="wave"){\n    x.save(); x.beginPath(); rr(0,0,s,s,7); x.clip(); x.fillStyle=F.c1; x.fillRect(0,0,s,s);\n    for(let j=0;j<3;j++){\n      const cols=[F.c2,F.c3,F.c4]; x.strokeStyle=cols[j]; x.lineWidth=1.3; x.beginPath();\n      for(let X=0;X<=s;X+=1){\n        const Y=s*0.5+Math.sin(X*0.1+t*0.005+j)*3.8+j*2.5-3;\n        if(X===0) x.moveTo(X,Y); else x.lineTo(X,Y);\n      } x.stroke();\n    } x.restore();\n    x.fillStyle=F.ink; x.font='bold 19px Cairo, sans-serif'; ct(); x.fillText(F.letter,16,16);\n`;
  const p3 = `  }else if(F.fx==="neon"){\n    x.fillStyle='#0e0e1a'; x.beginPath(); rr(0,0,s,s,7); x.fill();\n    const flick=0.7+Math.sin(t*0.01)*0.15+Math.sin(t*0.023)*0.15;\n    x.save(); x.shadowColor=F.c2; x.shadowBlur=8*flick; x.strokeStyle=F.c2; x.lineWidth=1.8; x.globalAlpha=flick; x.beginPath(); rr(2.5,2.5,27,27,5); x.stroke(); x.restore();\n    x.fillStyle=F.ink; x.font='bold 19px Cairo, sans-serif'; ct(); x.shadowColor=F.c2; x.shadowBlur=5; x.fillText(F.letter,16,16.5); x.shadowBlur=0;\n  }else if(F.fx==="liquid"){\n    x.fillStyle=F.c1; x.beginPath(); rr(0,0,s,s,7); x.fill();\n    const cx=16, cy=16;\n    const blobs=[{col:F.c2,amp:6,s:0.002,p:0},{col:F.c3,amp:4.5,s:0.003,p:2},{col:F.c4,amp:3.8,s:0.0025,p:4}];\n    for(const b of blobs){\n      x.fillStyle=b.col; x.globalAlpha=0.85; x.beginPath();\n      for(let a=0;a<Math.PI*2;a+=0.2){\n        const rad=b.amp+Math.sin(a*3+t*b.s+b.p)*1.9;\n        const X=cx+Math.cos(a)*rad, Y=cy+Math.sin(a)*rad;\n        if(a===0) x.moveTo(X,Y); else x.lineTo(X,Y);\n      } x.closePath(); x.fill();\n    } x.globalAlpha=1;\n    x.fillStyle=F.ink; x.font='bold 20px Cairo, sans-serif'; ct(); x.fillText(F.letter,16,17);\n  }\n}\n`;
  const tail = `if(link&&canvas&&ctx){\n  (function draw(t){\n    favPaint(ctx,FAV,t||0);\n    link.href = canvas.toDataURL('image/png');\n    setTimeout(function(){\n      if(!document.hidden) requestAnimationFrame(draw);\n      else setTimeout(function(){ requestAnimationFrame(draw); },1000);\n    },70);\n  })(0);\n  document.addEventListener('visibilitychange',function(){\n    if(!document.hidden) requestAnimationFrame(function(t){ favPaint(ctx,FAV,t); link.href = canvas.toDataURL('image/png'); });\n  });\n}\n//]]>\n<\\/script>`;
  return head + p1 + p2 + p3 + tail;
}
function favdRefreshCode(){
  const pre = document.getElementById('favCodePre');
  if(pre) pre.textContent = favdExportCode();
}
function favdCopy(btn){
  const txt = favdExportCode();
  const done = ()=>{ if(btn){ const o=btn.innerHTML; btn.innerHTML='<i class="ti ti-check"></i> تم النسخ'; setTimeout(()=>{ try{btn.innerHTML=o;}catch(e){} },1800);} showToast('تم نسخ كود الفافيكون'); };
  const legacy = ()=>{
    try{
      const ta=document.createElement('textarea'); ta.value=txt; ta.style.cssText='position:fixed;top:-999px;opacity:0;';
      document.body.appendChild(ta); ta.focus(); ta.select();
      const ok=document.execCommand('copy'); document.body.removeChild(ta);
      if(ok) done(); else showToast('تعذّر النسخ');
    }catch(e){ showToast('تعذّر النسخ'); }
  };
  try{
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, legacy);
    else legacy();
  }catch(e){ legacy(); }
}
function favdDownload(){
  try{
    const off=document.createElement('canvas'); off.width=32; off.height=32;
    favdPaint(off.getContext('2d'), favdCfg, performance.now(), 32);
    const a=document.createElement('a'); a.href=off.toDataURL('image/png');
    a.download='favicon-'+favdCfg.fx+'.png'; document.body.appendChild(a); a.click(); a.remove();
    showToast('تم تحميل الفافيكون PNG');
  }catch(e){ showToast('تعذّر التحميل'); }
}
function favdDownloadHtml(){
  try{
    const blob=new Blob([favdExportCode()],{type:'text/html;charset=utf-8'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download='favicon-'+favdCfg.fx+'.html'; document.body.appendChild(a); a.click();
    setTimeout(()=>{ try{URL.revokeObjectURL(a.href);}catch(e){} a.remove(); },500);
    showToast('تم تحميل ملف HTML');
  }catch(e){ showToast('تعذّر التحميل'); }
}

let favdPrimaryColor = '#f736b0';

const FAVD_PRESETS = [
  { name: 'نيون وردي', hex: '#f736b0' },
  { name: 'سايبر سيان', hex: '#06b6d4' },
  { name: 'زمردي فاخر', hex: '#10b981' },
  { name: 'بنفسجي ملكي', hex: '#8b5cf6' },
  { name: 'عنبر ناري', hex: '#f59e0b' },
  { name: 'أحمر قرمزي', hex: '#ef4444' },
  { name: 'أزرق كهربائي', hex: '#3b82f6' },
  { name: 'أخضر ليموني', hex: '#84cc16' }
];

function favdHexToRgb(hex){
  let s = String(hex || '').trim().replace('#', '');
  if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  if (!/^[0-9a-fA-F]{6}$/.test(s)) return { r: 247, g: 54, b: 176 };
  return {
    r: parseInt(s.slice(0, 2), 16),
    g: parseInt(s.slice(2, 4), 16),
    b: parseInt(s.slice(4, 6), 16)
  };
}

function favdRgbToHsl(r, g, b){
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s, l };
}

function favdHslToHex(h, s, l){
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  const toHex = v => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

function favdDerivePalette(baseHex){
  const rgb = favdHexToRgb(baseHex);
  const hsl = favdRgbToHsl(rgb.r, rgb.g, rgb.b);
  const c1 = favdHslToHex(hsl.h, Math.min(hsl.s, 0.40), 0.11);
  const c2 = baseHex.toLowerCase();
  const c3 = favdHslToHex(hsl.h - 22, Math.max(hsl.s, 0.65), 0.36);
  const c4 = favdHslToHex(hsl.h + 24, Math.max(hsl.s, 0.70), 0.65);
  const ink = '#ffffff';
  return { c1, c2, c3, c4, ink };
}

function favdUpdateColor(key, val){
  favdCfg[key] = val;
  const sw = document.getElementById('favSw_' + key);
  if(sw) sw.style.background = val;
  const inp = document.getElementById('favInp_' + key);
  if(inp) inp.value = val;
  const code = document.getElementById('favCode_' + key);
  if(code) code.textContent = val;
}

function favdOnColorChange(key, val){
  favdCfg[key] = val;
  const sw = document.getElementById('favSw_' + key);
  if(sw) sw.style.background = val;
  const code = document.getElementById('favCode_' + key);
  if(code) code.textContent = val;
  if(key === 'c2'){
    favdPrimaryColor = val;
    const pSw = document.getElementById('favPrimarySw');
    if(pSw) pSw.style.background = val;
    const pInp = document.getElementById('favPrimaryInput');
    if(pInp) pInp.value = val;
    const pCode = document.getElementById('favPrimaryCode');
    if(pCode) pCode.textContent = val;
  }
  favdRefreshCode();
}

function favdApplyPrimary(hex, notify){
  if(!hex) return;
  favdPrimaryColor = hex;
  const p = favdDerivePalette(hex);
  favdUpdateColor('c1', p.c1);
  favdUpdateColor('c2', p.c2);
  favdUpdateColor('c3', p.c3);
  favdUpdateColor('c4', p.c4);
  favdUpdateColor('ink', p.ink);

  const pSw = document.getElementById('favPrimarySw');
  if(pSw) pSw.style.background = hex;
  const pInp = document.getElementById('favPrimaryInput');
  if(pInp) pInp.value = hex;
  const pCode = document.getElementById('favPrimaryCode');
  if(pCode) pCode.textContent = hex;

  favdRefreshCode();
  if(notify && typeof showToast === 'function') showToast('تم توليد درجات اللون: ' + hex);
}

function favdRandomColor(){
  const h = Math.floor(Math.random() * 360);
  const s = 0.78 + Math.random() * 0.22;
  const l = 0.48 + Math.random() * 0.12;
  const randomHex = favdHslToHex(h, s, l);
  favdApplyPrimary(randomHex, true);
}

function favdSetPreset(hex){
  favdApplyPrimary(hex, true);
}

function renderFavDash(){
  const badge = document.getElementById('countBadge');
  if(badge) badge.textContent = 'استوديو الفافيكون';
  const fxBtns = Object.keys(FAVD_FX).map(k=>
    `<button class="fav-fx-btn${k===favdCfg.fx?' on':''}" data-fx="${k}" onclick="favdSetFx('${k}')" title="${FAVD_FX[k].desc}"><b>${FAVD_FX[k].ar}</b><small>${FAVD_FX[k].desc}</small></button>`
  ).join('');
  const colorRow = (key,label)=>
    `<label class="fav-color" id="favColWrap_${key}"><span class="fav-swatch" id="favSw_${key}" style="background:${favdCfg[key]}"></span><span class="fav-clabel">${label}</span><input type="color" id="favInp_${key}" value="${favdCfg[key]}" oninput="favdOnColorChange('${key}',this.value)"><code id="favCode_${key}" dir="ltr">${favdCfg[key]}</code></label>`;

  const presetsHtml = FAVD_PRESETS.map(p =>
    `<button type="button" class="fav-preset-chip" style="--preset-col:${p.hex}" onclick="favdSetPreset('${p.hex}')" title="${p.name}"><span class="fav-preset-dot"></span>${p.name}</button>`
  ).join('');

  document.getElementById('mainBody').innerHTML = `<div class="has-dash">
    <div class="dt-builder fav">
      <div class="dt-builder-title"><i class="ti ti-icons"></i> استوديو الفافيكون المتحرك
        <span>صمم فافيكون متحرك بـ Canvas فقط — بدون صور · معاينة حية في التاب + كود جاهز للنسخ</span>
      </div>
      <div class="fav-grid">
        <div class="fav-stage">
          <canvas id="favPrevBig" width="128" height="128" class="fav-big"></canvas>
          <div class="fav-tabmock">
            <img id="favTabImg" alt="favicon tab" class="fav-tabimg">
            <span class="fav-tabtitle">متجري — <b id="favLetterEcho">${(favdCfg.letter||'عـ').slice(0,3)}</b></span>
            <span class="fav-tablive"><span class="dot"></span>LIVE</span>
          </div>
          <canvas id="favPrev32" width="32" height="32" class="fav-mini" title="المقاس الحقيقي 32×32"></canvas>
          <div class="b64-live">
            <label class="b64-switch"><input type="checkbox" ${favdTabLive?'checked':''} onchange="favdToggleTabLive(this)"><span class="b64-slider"></span></label>
            <span><i class="ti ti-bolt"></i> معاينة حية في تاب المتصفح</span>
          </div>
        </div>
        <div class="fav-controls">
          <div class="dt-head"><i class="ti ti-letter-case" style="color:#f736b0"></i> الحرف / الرمز</div>
          <input class="dt-textarea fav-letter" id="favLetterInp" maxlength="3" spellcheck="false" value="${(favdCfg.letter||'').replace(/"/g,'&quot;')}" placeholder="عـ" oninput="favdSet('letter', this.value.slice(0,3))">
          <div class="dt-head" style="margin-top:14px"><i class="ti ti-sparkles" style="color:#f736b0"></i> التأثير — <b id="favFxName">${FAVD_FX[favdCfg.fx].ar}</b> <small id="favFxDesc" style="color:var(--text-3);font-weight:400">${FAVD_FX[favdCfg.fx].desc}</small></div>
          <div class="fav-fx-grid">${fxBtns}</div>
          <div class="dt-head" style="margin-top:14px"><i class="ti ti-palette" style="color:#f736b0"></i> الألوان والتدرجات</div>
          
          <div class="fav-palette-box">
            <div class="fav-palette-header">
              <div class="fav-primary-picker">
                <label class="fav-primary-label" title="اختر اللون الأساسي لتوليد درجات متناسقة تلقائياً">
                  <span class="fav-primary-swatch" id="favPrimarySw" style="background:${favdPrimaryColor}"></span>
                  <span class="fav-primary-text">اللون الأساسي:</span>
                  <input type="color" id="favPrimaryInput" value="${favdPrimaryColor}" oninput="favdApplyPrimary(this.value)">
                  <code id="favPrimaryCode" dir="ltr">${favdPrimaryColor}</code>
                </label>
              </div>
              <div class="fav-quick-actions">
                <button type="button" class="fav-btn-action primary" onclick="favdRandomColor()" title="توليد باليت متناسق عشوائياً بنقرة واحدة">
                  <i class="ti ti-arrows-shuffle"></i> لون عشوائي
                </button>
                <button type="button" class="fav-btn-action" onclick="favdApplyPrimary(favdPrimaryColor, true)" title="إعادة اشتقاق الدرجات من اللون الأساسي">
                  <i class="ti ti-wand"></i> اشتقاق الدرجات
                </button>
              </div>
            </div>
            <div class="fav-presets-bar">
              <span class="fav-presets-title">باليتات سريعة:</span>
              ${presetsHtml}
            </div>
          </div>

          <div class="fav-colors">
            ${colorRow('c1','خلفية داكنة')}
            ${colorRow('c2','لون 2')}
            ${colorRow('c3','لون 3')}
            ${colorRow('c4','لمسة')}
            ${colorRow('ink','الحبر')}
          </div>
          <div class="dt-actions">
            <button class="btn-primary" onclick="favdCopy(this)"><i class="ti ti-copy"></i> نسخ الكود</button>
            <button class="btn-cancel" onclick="favdDownload()"><i class="ti ti-download"></i> PNG</button>
            <button class="btn-cancel" onclick="favdDownloadHtml()"><i class="ti ti-file-code"></i> HTML</button>
            <button class="btn-cancel" onclick="favdResetTab()"><i class="ti ti-restore"></i> رجّع فافيكون الصفحة</button>
          </div>
        </div>
      </div>
      <div class="fav-code-wrap">
        <div class="fav-code-label"><span>الكود الجاهز — <code dir="ltr">&lt;link&gt; + &lt;canvas&gt; + &lt;script&gt;</code> بدون مكتبات</span><button class="copy-btn" onclick="favdCopy(this)"><i class="ti ti-copy"></i> نسخ</button></div>
        <pre class="fav-code" id="favCodePre" dir="ltr"></pre>
      </div>
    </div>
  </div>`;
  favdRefreshCode();
  favdMarkFxBtns();
  favdStopLoop();
  favdLastTab = 0;
  favdRaf = requestAnimationFrame(favdLoop);
}
