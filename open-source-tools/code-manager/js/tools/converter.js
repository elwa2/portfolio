  // ── CODE CONVERTER DASHBOARD ──
  let cvImgs = [];
  let cvManual = [];
  let cvQuick = [{ old: '', new: '' }]; // صفوف الاستبدال السريع (قديمة → جديدة)
  let cvRuleNote = '';
  let cvTarget = 'all'; // all | mobile | desktop
  let cvHtmlText = '';
  let cvCssText = '';

  function uniqueKey(url){
    if(!url) return '';
    const s = (url || '').trim();
    if(!s) return '';
    // نظّف البروتوكول والكويري والهاش — واحتفظ بآخر جزء (اسم الملف بالامتداد)
    const clean = s.replace(/^https?:\/\//i,'').split('?')[0].split('#')[0];
    const parts = clean.split('/').filter(Boolean);
    let file = parts.length ? parts[parts.length - 1] : clean;
    try{ file = decodeURIComponent(file); }catch(e){}
    file = (file || '').trim();
    if(!file) return clean;
    // الاستهداف من الآخر: "/اسم-الملف.png" — بالامتداد لضمان عدم التكرار أبداً
    if(file.charAt(0) !== '/') file = '/' + file;
    return file;
  }

  // نواة المقارنة (بدون / وبدون امتداد) — للتوافق مع القواعد القديمة بدون امتداد
  function uniqueCore(key){
    if(!key) return '';
    let k = (key || '').trim().split('?')[0].split('#')[0];
    k = k.split('/').pop() || k;
    try{ k = decodeURIComponent(k); }catch(e){}
    k = k.replace(/\.[a-z0-9]{2,6}$/i,'');
    return k.toLowerCase();
  }

  function extractImgsFromHtml(html){
    const imgs = [];
    const re = /<img\b[^>]*>/gi;
    let m;
    while((m = re.exec(html)) !== null){
      const tag = m[0];
      const src = (tag.match(/\bsrc\s*=\s*["']([^"']*?)["']/i)||[])[1] || '';
      const dataSrc = (tag.match(/\bdata-src\s*=\s*["']([^"']*?)["']/i)||[])[1] || '';
      const alt = (tag.match(/\balt\s*=\s*(["'])(.*?)\1/i)||[])[2] || '';
      if(src || dataSrc) imgs.push({ src, dataSrc, alt, newUrl: '', enabled: true });
    }
    return imgs;
  }

  // يلتقط قواعد img حتى لو مغلفة داخل @media (عكس التقسيم الساذج بالأقواس)
  function parseCssRule(css){
    const out = [];
    const re = /img\[[^\]]+\][^{]*\{[^}]*content\s*:\s*url\(\s*["']?([^"')\s]*)["']?\s*\)[^}]*\}/gi;
    let m;
    while((m = re.exec(css)) !== null){
      const rule = m[0];
      const sel = rule.slice(0, rule.indexOf('{')).trim();
      const newUrl = m[1] || '';
      const srcM = sel.match(/img\[src\*=\s*["']([^"']*)["']\]/i);
      const dsM  = sel.match(/img\[data-src\*=\s*["']([^"']*)["']\]/i);
      if(srcM || dsM){
        out.push({ src: srcM ? srcM[1] : '', dataSrc: dsM ? dsM[1] : '', alt: '', newUrl, enabled: true });
      }
    }
    return out;
  }

  // ── هدف الجهاز (الكل / موبايل / كمبيوتر) ──
  function cvMediaOpen(){
    if(cvTarget === 'mobile') return '@media (max-width: 768px) {';
    if(cvTarget === 'desktop') return '@media (min-width: 769px) {';
    return '';
  }
  function cvWrapMedia(body){
    const open = cvMediaOpen();
    if(!open) return body;
    const indented = body.split('\n').map(l => l ? '  ' + l : l).join('\n');
    return open + '\n' + indented + '\n}';
  }
  function setCvTarget(t){
    cvSnapshotInputs();
    cvTarget = t;
    renderAll();
  }
  // لو المستخدم لصق CSS جاهز فيه @media نلتقط هدفه تلقائياً
  function cvDetectTarget(css){
    if(!css) return;
    if(/max-width/i.test(css)) cvTarget = 'mobile';
    else if(/min-width/i.test(css)) cvTarget = 'desktop';
  }

  function cvSnapshotInputs(){
    const h = document.getElementById('cvHtmlInput');
    const c = document.getElementById('cvCssInput');
    if(h) cvHtmlText = h.value;
    if(c) cvCssText = c.value;
  }

  function analyzeCv(){
    cvSnapshotInputs();
    const html = cvHtmlText;
    const css  = cvCssText;

    const htmlImgs = html.trim() ? extractImgsFromHtml(html) : [];
    const cssImgs  = css.trim()  ? parseCssRule(css) : [];
    if(css.trim()) cvDetectTarget(css);

    if(!htmlImgs.length && !cssImgs.length){
      showToast('لم يتم العثور على صور — تحقق من الكود');
      cvImgs = [];
      renderAll();
      return;
    }

    cvImgs = htmlImgs.length ? htmlImgs : cssImgs;
    if(htmlImgs.length && cssImgs.length){
      htmlImgs.forEach(im => {
        const k = uniqueKey(im.src || im.dataSrc);
        const kc = uniqueCore(k);
        const match = cssImgs.find(c => {
          const ck = uniqueKey(c.src || c.dataSrc);
          return ck === k || (kc && uniqueCore(ck) === kc);
        });
        if(match){
          if(!im.src && match.src) im.src = match.src;
          if(!im.dataSrc && match.dataSrc) im.dataSrc = match.dataSrc;
          if(match.newUrl) im.newUrl = match.newUrl;
        }
      });
    }
    cvReapplyManual();

    renderAll();
    showToast('تم استخراج ' + cvImgs.length + ' صورة');
  }

  // ── استبدال صورة سريعة (Old → New) ──
  function cvKeyFromInput(v){
    const s = (v || '').trim();
    if(!s) return '';
    const sel = s.match(/img\[(?:src|data-src)\*=\s*["']([^"']+)["']\]/i);
    if(sel) return sel[1].charAt(0) === '/' ? sel[1] : '/' + sel[1];
    if(/^https?:\/\//i.test(s) || s.indexOf('/') > -1) return uniqueKey(s);
    // مفتاح عادي بدون / — وحّده لصيغة الاستهداف من الآخر
    return s.charAt(0) === '/' ? s : '/' + s;
  }

  function cvMatchesKey(img, key){
    if(!key) return false;
    const k = uniqueKey(img.src || img.dataSrc);
    if(k && k === key) return true;
    // توافق مع القواعد القديمة (بدون / وبدون امتداد): قارن بالنواة
    if(k && uniqueCore(k) && uniqueCore(k) === uniqueCore(key)) return true;
    const normKey = key.charAt(0) === '/' ? key : '/' + key;
    if(img.src && (img.src.indexOf(key) > -1 || img.src.indexOf(normKey) > -1)) return true;
    if(img.dataSrc && (img.dataSrc.indexOf(key) > -1 || img.dataSrc.indexOf(normKey) > -1)) return true;
    // الصور المضافة يدوياً كمفتاح فقط
    if(img.key && (img.key === key || uniqueCore(img.key) === uniqueCore(key))) return true;
    return false;
  }

  function cvApplyRule(key, newUrl){
    let hits = 0;
    cvImgs.forEach(function(im){
      if(!cvMatchesKey(im, key)) return;
      im.newUrl = newUrl;
      im.enabled = true;
      hits++;
    });
    if(!hits) cvImgs.push({ src: key, dataSrc: '', alt: '', key: key, newUrl: newUrl, enabled: true });
    return hits;
  }

  function cvReapplyManual(){
    cvManual.forEach(r => cvApplyRule(r.key, r.newUrl));
  }

  function cvBuildRule(){
    const rules = [];
    cvQuick.forEach(function(row){
      const key = cvKeyFromInput(row.old);
      const nu = (row.new || '').trim();
      if(!key || !nu) return;
      rules.push('img[src*="' + key + '"] {\n  content: url("' + nu + '");\n}');
    });
    if(!rules.length) return '';
    return cvWrapMedia(rules.join('\n\n'));
  }

  function cvQuickBadge(){
    const keys = cvQuick.map(r => cvKeyFromInput(r.old)).filter(k => k);
    if(keys.length > 1) return keys.length + ' صور';
    return keys[0] || 'old → new';
  }

  function cvRulePreview(){
    const pre = document.getElementById('cvRulePreview');
    if(!pre) return;
    const rule = cvBuildRule();
    pre.textContent = rule || '/* املأ روابط الصور لعرض القواعد — وتقدر تلصق الـ selector جاهز */';
    pre.classList.toggle('idle', !rule);
    const badge = document.querySelector('.cv-replace-badge');
    if(badge) badge.textContent = cvQuickBadge();
  }

  function copyCvRule(){
    const rule = cvBuildRule();
    if(!rule){ showToast('املأ رابطي الصورة القديمة والجديدة أولاً'); return; }
    navigator.clipboard.writeText(rule).then(() => {
      const btn = document.getElementById('cvRuleCopyBtn');
      if(btn) btn.innerHTML = '<i class="ti ti-check"></i> تم النسخ';
      showToast('تم نسخ القاعدة!');
      setTimeout(() => {
        const b = document.getElementById('cvRuleCopyBtn');
        if(b) b.innerHTML = '<i class="ti ti-copy"></i> نسخ القاعدة';
      }, 2000);
    }).catch(() => showToast('تعذّر النسخ'));
  }

  function cvQuickPick(v, i){
    if(!v) return;
    cvQuick[i].old = v;
    const el = document.getElementById('cvQuickOld_' + i);
    if(el) el.value = v;
    cvRulePreview();
  }

  function cvQuickAdd(){
    cvSnapshotInputs();
    cvQuick.push({ old: '', new: '' });
    renderAll();
  }

  function cvQuickDel(i){
    if(cvQuick.length <= 1) cvQuick = [{ old: '', new: '' }];
    else cvQuick.splice(i, 1);
    cvRuleNote = '';
    renderAll();
  }

  function cvApplyReplace(){
    cvSnapshotInputs();
    let applied = 0, totalHits = 0;
    cvQuick.forEach(function(row){
      const key = cvKeyFromInput(row.old);
      const nu = (row.new || '').trim();
      if(!key || !nu) return;
      const existing = cvManual.findIndex(r => r.key === key);
      if(existing > -1) cvManual[existing].newUrl = nu;
      else cvManual.push({ key: key, newUrl: nu });
      totalHits += cvApplyRule(key, nu);
      applied++;
    });
    if(!applied){ showToast('املأ رابط صورة قديمة وجديدة أولاً'); return; }
    cvRuleNote = 'تم تطبيق ' + applied + ' قاعدة' + (totalHits ? ' — حدّثت ' + totalHits + ' صورة في القائمة' : ' — أُضيفت للقائمة');
    renderAll();
    showToast('تم تطبيق ' + applied + ' قاعدة');
  }

  function cvClearPick(){
    cvQuick = [{ old: '', new: '' }];
    cvRuleNote = '';
    renderAll();
  }

  function cvPickOptions(){
    const seen = [];
    const seenCore = [];
    function pushKey(k){
      if(!k) return;
      const c = uniqueCore(k);
      if(seen.indexOf(k) > -1) return;
      if(c && seenCore.indexOf(c) > -1) return;
      seen.push(k);
      if(c) seenCore.push(c);
    }
    cvImgs.forEach(function(im){
      pushKey(im.key || uniqueKey(im.src || im.dataSrc));
    });
    cvManual.forEach(function(r){
      pushKey(r.key);
    });
    return seen.map(function(k){
      const short = k.length > 46 ? '…' + k.slice(-44) : k;
      return '<option value="' + escHtml(k) + '">' + escHtml(short) + '</option>';
    }).join('');
  }

  function clearCv(){
    cvImgs = [];
    cvManual = [];
    cvQuick = [{ old: '', new: '' }];
    cvRuleNote = '';
    cvHtmlText = '';
    cvCssText = '';
    renderAll();
  }

  function generateCvCSS(){
    const rules = [];
    cvImgs.forEach((img, i) => {
      if(!img.enabled) return;
      let key = img.key || uniqueKey(img.src || img.dataSrc);
      if(!key) return;
      // توحيد الصيغة: "/اسم-الملف.png" — استهداف من الآخر بالامتداد
      if(key.charAt(0) !== '/') key = '/' + key;
      const newUrl = img.newUrl.trim() || 'NEW_IMAGE_URL';
      const sels = [];
      if(img.src) sels.push('img[src*="' + key + '"]');
      if(img.dataSrc) sels.push('img[data-src*="' + key + '"]');
      const sel = sels.length ? sels.join(',\n') : 'img[src*="' + key + '"]';
      rules.push('/* استبدال الصورة ' + (i + 1) + ' */\n' + sel + ' {\n  content: url("' + newUrl + '");\n}');
    });
    if(!rules.length) return '';
    const body = rules.join('\n\n');
    return cvWrapMedia(body);
  }

  function cvPreviewHtml(css){
    if(!css.trim()) return '<span class="sb-css-cmt">/* الصق كود HTML أو CSS واضغط "تحليل" — ثم أدخل روابط الصور الجديدة */</span>';
    return highlightCvCSS(css);
  }

  function highlightCvCSS(css){
    let s = escHtml(css);
    s = s.replace(/(\/\*[\s\S]*?\*\/)/g, m => '<span class="sb-css-cmt">' + m + '</span>');
    s = s.replace(/(@media[^{]*\{)/g, m => '<span style="color:#c084fc">' + m + '</span>');
    s = s.replace(/(img\[(?:src|data-src)\*=[^\n\]]*\](\s*,\s*\n\s*img\[(?:src|data-src)\*=[^\n\]]*\])*)/g, m => '<span class="sb-css-sel">' + m + '</span>');
    s = s.replace(/(content)\s*:/g, (m, p) => '<span class="sb-css-prop">' + p + '</span> :');
    s = s.replace(/:\s*([^;{}\n]+)(?=[;}\n])/g, (m, val) => {
      if(val.trim().match(/^url\(/)) return ': <span class="sb-css-val">' + val + '</span>';
      return m;
    });
    return s;
  }

  function renderCvPreview(){
    const pre = document.getElementById('cvPreview');
    if(pre) pre.innerHTML = cvPreviewHtml(generateCvCSS());
  }

  function copyCvCSS(){
    const css = generateCvCSS();
    if(!css.trim()){ showToast('لا يوجد كود بعد'); return; }
    navigator.clipboard.writeText(css).then(() => {
      const btn = document.getElementById('cvCopyBtn');
      btn.innerHTML = '<i class="ti ti-check"></i> تم النسخ';
      showToast('تم نسخ كود CSS!');
      setTimeout(() => { btn.innerHTML = '<i class="ti ti-copy"></i> نسخ الكود'; }, 2000);
    }).catch(() => showToast('تعذّر النسخ'));
  }

  function cvIsPreviewable(u){
    return /^(https?:\/\/|data:image\/|blob:|\/\/)/i.test((u || '').trim());
  }
  function cvThumbGo(e, i){
    const u = (cvImgs[i] && cvImgs[i].newUrl || '').trim();
    if(!cvIsPreviewable(u)){ e.preventDefault(); return false; }
    return true;
  }
  function cvUpdateNewPreview(i){
    const im = cvImgs[i];
    if(!im) return;
    const u = (im.newUrl || '').trim();
    const ok = cvIsPreviewable(u);
    const link = document.getElementById('cvNewLink_' + i);
    const imEl = document.getElementById('cvNewImg_' + i);
    const ph = document.getElementById('cvNewPh_' + i);
    if(!link) return;
    link.classList.toggle('is-empty', !ok);
    link.classList.remove('is-broken');
    if(ok){
      link.href = u;
      link.target = '_blank';
      link.rel = 'noopener';
      link.title = 'فتح الصورة الجديدة في صفحة جديدة';
      if(imEl){ imEl.src = u; imEl.hidden = false; }
      if(ph){ ph.hidden = true; }
    } else {
      link.removeAttribute('href');
      link.removeAttribute('target');
      link.title = u ? 'رابط غير صالح للمعاينة' : 'الصقي رابط الصورة الجديدة لعرض معاينتها';
      if(imEl){ imEl.removeAttribute('src'); imEl.hidden = true; }
      if(ph){ ph.hidden = false; }
    }
  }

  function renderCvDash(targetId){
    if(!targetId) document.getElementById('countBadge').textContent = 'imgscr الأكواد';

    let resultsHtml = '';
    if(cvImgs.length){
      resultsHtml = '<div class="cv-results">' + cvImgs.map((img, i) => {
        const src = img.src || img.dataSrc;
        const short = src ? src.replace(/^https?:\/\//i, '') : '—';
        const oldUrl = (src && cvIsPreviewable(src)) ? src.trim() : '';
        const newUrl = (img.newUrl || '').trim();
        const newOk = cvIsPreviewable(newUrl);
        const alt = (img.alt || '').trim();
        const altHtml = alt
          ? `<span class="cv-alt" dir="auto" title="${escHtml(alt)}"><b>alt</b> ${escHtml(alt)}</span>`
          : `<span class="cv-alt is-none">بدون alt</span>`;
        const oldThumb = oldUrl
          ? `<a class="cv-thumb" href="${escHtml(oldUrl)}" target="_blank" rel="noopener" title="فتح الصورة القديمة في صفحة جديدة"><img src="${escHtml(oldUrl)}" alt="${escHtml(alt || ('الصورة القديمة ' + (i + 1)))}" loading="lazy" onerror="this.parentElement.classList.add('is-broken')"><i class="ti ti-photo-off cv-thumb-fb"></i><span class="cv-thumb-open"><i class="ti ti-external-link"></i></span></a>`
          : `<span class="cv-thumb is-empty" title="لا توجد معاينة — المفتاح نصي فقط"><i class="ti ti-photo-off"></i></span>`;
        const newThumb = `<a class="cv-thumb is-new${newOk ? '' : ' is-empty'}" id="cvNewLink_${i}"${newOk ? ` href="${escHtml(newUrl)}" target="_blank" rel="noopener" title="فتح الصورة الجديدة في صفحة جديدة"` : ' title="الصقي رابط الصورة الجديدة لعرض معاينتها"'} onclick="return cvThumbGo(event, ${i})"><img id="cvNewImg_${i}"${newOk ? ` src="${escHtml(newUrl)}"` : ''} alt="الصورة الجديدة ${i + 1}" loading="lazy"${newOk ? '' : ' hidden'} onerror="this.parentElement.classList.add('is-broken')"><i class="ti ti-photo-plus cv-thumb-ph" id="cvNewPh_${i}"${newOk ? ' hidden' : ''}></i><span class="cv-thumb-open"><i class="ti ti-external-link"></i></span></a>`;
        return `<div class="cv-item">
          <div class="cv-item-head">
            <input type="checkbox" class="cv-check" id="cvChk_${i}" ${img.enabled ? 'checked' : ''} onchange="cvImgs[${i}].enabled=this.checked; renderCvPreview()">
            <span>صورة ${i + 1}</span>
            <code title="${escHtml(src || '')}">${escHtml(short)}</code>
          </div>
          <div class="cv-item-main">
            <div class="cv-previews">
              <div class="cv-prev"><span class="cv-prev-t">القديمة</span>${oldThumb}${altHtml}</div>
              <span class="cv-prev-arrow"><i class="ti ti-arrow-left"></i></span>
              <div class="cv-prev"><span class="cv-prev-t">الجديدة</span>${newThumb}</div>
            </div>
            <div class="cv-item-row">
              <label>الصورة الجديدة</label>
              <input class="cv-input" type="text" value="${escHtml(img.newUrl)}" placeholder="https://cdn.salla.sa/.../new-image.jpg" dir="ltr" oninput="cvImgs[${i}].newUrl=this.value; cvUpdateNewPreview(${i}); renderCvPreview()">
            </div>
          </div>
        </div>`;
      }).join('') + '</div>';
    } else {
      resultsHtml = '<div class="cv-empty"><i class="ti ti-photo-off"></i><p>لم يتم استخراج أي صور بعد — الصق كود HTML أو CSS واضغط "تحليل"</p></div>';
    }

    const css = generateCvCSS();

    document.getElementById(targetId || 'mainBody').innerHTML = `<div class="has-dash">
      <div class="cv-builder">
        <div class="cv-title-box">
          <span class="cv-title-ic"><i class="ti ti-arrows-shuffle"></i></span>
          <div>
            <h3>imgscr HTML/CSS إلى كود صحيح — استبدال الصور</h3>
            <p>الصق كود الصفحة، ثم اربط كل صورة قديمة برابط الصورة الجديدة — والـ CSS يتولّد لوحده</p>
          </div>
          <code class="cv-title-code">img[src*="old.webp"]{content:url("new.webp")}</code>
        </div>

        <div class="cv-replace-card">
          <div class="cv-replace-head">
            <i class="ti ti-swap"></i> استبدال صورة سريعة
            <span class="cv-replace-badge">${escHtml(cvQuickBadge())}</span>
          </div>
          <div class="cv-quick-list">
            ${cvQuick.map((row, i) => `
            <div class="cv-quick-row">
              <label class="cv-field">
                <span><i class="ti ti-photo-off"></i> الصورة القديمة ${cvQuick.length > 1 ? (i + 1) : ''} — رابط كامل أو جزء منه</span>
                <input class="cv-input" id="cvQuickOld_${i}" dir="ltr" value="${escHtml(row.old)}" spellcheck="false"
                  placeholder='https://old.com/6-91e1-493e-94d5-7c55c2537ff1-original.webp'
                  oninput="cvQuick[${i}].old=this.value; cvRulePreview()">
                <select class="cv-pick-sel" onchange="cvQuickPick(this.value, ${i})">
                  <option value="">— اختر من الصور المستخرجة —</option>
                  ${cvPickOptions()}
                </select>
              </label>
              <label class="cv-field">
                <span><i class="ti ti-photo-plus"></i> الصورة الجديدة ${cvQuick.length > 1 ? (i + 1) : ''} — رابطها</span>
                <input class="cv-input" dir="ltr" value="${escHtml(row.new)}" spellcheck="false"
                  placeholder="https://cdn.files.salla.network/other/944338005/8d8541e1-6765-4b32-8fb0-b2025e15cf47-original.webp"
                  oninput="cvQuick[${i}].new=this.value; cvRulePreview()">
              </label>
              <button class="cv-row-del" title="حذف هذا السطر" onclick="cvQuickDel(${i})"><i class="ti ti-trash"></i></button>
            </div>`).join('')}
          </div>
          <div class="cv-replace-actions">
            <button class="btn-primary" onclick="cvApplyReplace()"><i class="ti ti-refresh"></i> تطبيق الاستبدال</button>
            <button class="btn-cancel" onclick="cvQuickAdd()"><i class="ti ti-plus"></i> إضافة صورة</button>
            <button class="btn-cancel" onclick="cvClearPick()"><i class="ti ti-eraser"></i> مسح الحقول</button>
            <span class="cv-replace-note${cvRuleNote ? ' ok' : ''}">${escHtml(cvRuleNote)}</span>
          </div>
          <div class="cv-rule-bar">
            <div class="cv-target-seg">
              <button class="cv-target-btn${cvTarget === 'all' ? ' on' : ''}" onclick="setCvTarget('all')"><i class="ti ti-devices"></i> الكل</button>
              <button class="cv-target-btn${cvTarget === 'mobile' ? ' on' : ''}" onclick="setCvTarget('mobile')"><i class="ti ti-device-mobile"></i> موبايل</button>
              <button class="cv-target-btn${cvTarget === 'desktop' ? ' on' : ''}" onclick="setCvTarget('desktop')"><i class="ti ti-device-desktop"></i> كمبيوتر</button>
            </div>
            <button class="copy-btn" id="cvRuleCopyBtn" onclick="copyCvRule()"><i class="ti ti-copy"></i> نسخ القاعدة</button>
          </div>
          <pre class="cv-rule-preview idle" id="cvRulePreview"></pre>
        </div>

        <div class="cv-grid">
          <div class="form-group">
            <label class="form-label" for="cvHtmlInput">كود HTML <code style="color:var(--accent-cool)">&lt;img&gt;</code></label>
            <textarea class="cv-input" id="cvHtmlInput" oninput="cvHtmlText=this.value" placeholder='<div slot="items"><a href="..."><img src="https://old-url.com/741fba3d-b989-4f4d-8cb2-3cf4ba290b6d-original.webp" data-src="..." alt="Banner"></a></div>'>${escHtml(cvHtmlText)}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label" for="cvCssInput">كود CSS موجود <code style="color:var(--accent-cool)">اختياري</code></label>
            <textarea class="cv-input" id="cvCssInput" oninput="cvCssText=this.value" placeholder='img[src*="741fba3d-b989-4f4d-8cb2-3cf4ba290b6d"] { content: url("https://cdn.salla.sa/.../new.jpg"); }'>${escHtml(cvCssText)}</textarea>
          </div>
        </div>

        <div class="has-actions">
          <button class="btn-primary" onclick="analyzeCv()"><i class="ti ti-wand"></i> تحليل واستخراج</button>
          <button class="btn-cancel" onclick="clearCv()"><i class="ti ti-trash"></i> مسح</button>
        </div>

        <div class="has-section-title">
          <i class="ti ti-photo" style="color:var(--accent-warm)"></i>
          الصور المستخرجة
          <span>(${cvImgs.length})</span>
        </div>
        ${resultsHtml}

        <div class="cv-target-row">
          <span class="cv-target-label"><i class="ti ti-devices"></i> يطبق على</span>
          <div class="cv-target-seg">
            <button class="cv-target-btn${cvTarget === 'all' ? ' on' : ''}" onclick="setCvTarget('all')"><i class="ti ti-devices"></i> الكل</button>
            <button class="cv-target-btn${cvTarget === 'mobile' ? ' on' : ''}" onclick="setCvTarget('mobile')"><i class="ti ti-device-mobile"></i> موبايل فقط</button>
            <button class="cv-target-btn${cvTarget === 'desktop' ? ' on' : ''}" onclick="setCvTarget('desktop')"><i class="ti ti-device-desktop"></i> كمبيوتر فقط</button>
          </div>
          <span class="cv-target-hint">${cvTarget === 'mobile' ? '@media (max-width: 768px)' : cvTarget === 'desktop' ? '@media (min-width: 769px)' : 'بدون @media — كل الأجهزة'}</span>
        </div>

        <div class="sb-preview-wrap">
          <div class="sb-preview-label">
            <span>كود CSS الناتج</span>
            <button class="copy-btn" onclick="copyCvCSS()" id="cvCopyBtn" style="font-size:10px;padding:3px 10px"><i class="ti ti-copy"></i> نسخ الكود</button>
          </div>
          <pre class="sb-preview" id="cvPreview">${cvPreviewHtml(css)}</pre>
        </div>
      </div>
    </div>`;

    cvRulePreview();
  }

