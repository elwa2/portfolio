  // ── QR CODE DASHBOARD ──
  function renderQrDash(){
    const badge = document.getElementById('countBadge');
    if (badge) badge.textContent = 'أداة QR';

    document.getElementById('mainBody').innerHTML = `<div class="has-dash">
      <div class="dt-builder qr">
        <div class="dt-builder-title"><i class="ti ti-qrcode"></i> مولد رموز QR
          <span>حوّل الروابط والنصوص وأي بيانات إلى رمز QR احترافي بألوان وأحجام مخصصة</span>
        </div>

        <div class="qr-grid">
          <div class="qr-stage">
            <div class="qr-frame" id="qrFrame"></div>
            <p class="qr-hint" id="qrHint">أدخل نصاً أو رابطاً ثم اضغط "توليد الرمز"</p>
          </div>

          <div class="qr-controls">
            <div class="dt-head"><i class="ti ti-keyboard" style="color:#f97316"></i> المحتوى</div>
            <textarea class="dt-textarea" id="qrInput" spellcheck="false" placeholder="أدخل الرابط أو النص أو البيانات هنا..."></textarea>
            <div class="b64-live">
              <label class="b64-switch"><input type="checkbox" id="qrLive"><span class="b64-slider"></span></label>
              <span><i class="ti ti-bolt"></i> توليد مباشر أثناء الكتابة</span>
            </div>

            <div class="qr-options">
              <label class="qr-opt">
                <span>الحجم <output id="qrSizeOut">280</output>px</span>
                <input type="range" id="qrSizeRange" min="180" max="600" step="20" value="280">
              </label>
              <label class="qr-opt">
                <span>تصحيح الخطأ</span>
                <select class="qr-select" id="qrEcc">
                  <option value="L">L — منخفض</option>
                  <option value="M" selected>M — متوسط</option>
                  <option value="Q">Q — مرتفع</option>
                  <option value="H">H — أعلى</option>
                </select>
              </label>
              <label class="qr-opt">
                <span>لون الرمز</span>
                <input type="color" id="qrDark" value="#1a1a2e">
              </label>
              <label class="qr-opt">
                <span>لون الخلفية</span>
                <input type="color" id="qrLight" value="#ffffff">
              </label>
            </div>

            <div class="dt-actions">
              <button class="btn-primary" onclick="qrGenerate()"><i class="ti ti-qrcode"></i> توليد الرمز</button>
              <button class="btn-cancel" id="qrDownloadBtn" onclick="qrDownload()"><i class="ti ti-download"></i> تحميل PNG</button>
              <button class="btn-cancel" onclick="qrClear()"><i class="ti ti-eraser"></i> مسح</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;

    const inp = document.getElementById('qrInput');
    const live = document.getElementById('qrLive');
    if (inp && live) inp.addEventListener('input', () => { if (live.checked) qrGenerate(); });
    const size = document.getElementById('qrSizeRange');
    const sizeOut = document.getElementById('qrSizeOut');
    if (size && sizeOut) size.addEventListener('input', () => { sizeOut.textContent = size.value; });
    ['qrSizeRange','qrEcc','qrDark','qrLight'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', qrRefresh);
    });
    qrDownloadBtnState();
  }

  function qrCorrectLevel(level){
    if (typeof QRCode === 'undefined') return 0;
    const map = { L: QRCode.CorrectLevel.L, M: QRCode.CorrectLevel.M, Q: QRCode.CorrectLevel.Q, H: QRCode.CorrectLevel.H };
    return map[level] !== undefined ? map[level] : QRCode.CorrectLevel.M;
  }

  function qrDataUrlOf(qr, wrap){
    return new Promise(resolve => {
      const read = () => {
        try {
          if (qr && qr._oDrawing && qr._oDrawing._elImage && qr._oDrawing._elImage.src) { resolve(qr._oDrawing._elImage.src); return; }
          if (qr && qr._oDrawing && qr._oDrawing._elCanvas) {
            const u = qr._oDrawing._elCanvas.toDataURL('image/png');
            if (u) { resolve(u); return; }
          }
        } catch (e) {}
        if (wrap && typeof wrap.querySelector === 'function') {
          const img = wrap.querySelector('img');
          if (img && img.src) { resolve(img.src); return; }
          const cv = wrap.querySelector('canvas');
          if (cv) { try { const u = cv.toDataURL('image/png'); if (u) { resolve(u); return; } } catch (e) {} }
        }
        resolve(null);
      };
      setTimeout(read, 0);
    });
  }

  function qrGenerate(){
    const hint = document.getElementById('qrHint');
    const frame = document.getElementById('qrFrame');
    const inp = document.getElementById('qrInput');
    const text = (inp && inp.value) ? inp.value.trim() : '';
    if (!text) {
      qrCache = null;
      if (frame) frame.innerHTML = '';
      if (hint) { hint.textContent = 'أدخل نصاً أو رابطاً أولاً ثم اضغط توليد الرمز'; hint.classList.remove('hide'); }
      qrDownloadBtnState();
      return;
    }
    if (typeof QRCode === 'undefined') {
      qrCache = null;
      if (frame) frame.innerHTML = '';
      if (hint) { hint.textContent = 'تعذر تحميل مكتبة QRCode — تحقق من الاتصال بالإنترنت وأعد المحاولة'; hint.classList.remove('hide'); }
      qrDownloadBtnState();
      return;
    }
    const sizeEl = document.getElementById('qrSizeRange');
    const eccEl = document.getElementById('qrEcc');
    const darkEl = document.getElementById('qrDark');
    const lightEl = document.getElementById('qrLight');
    if (sizeEl) qrSize = parseInt(sizeEl.value, 10) || qrSize;
    if (eccEl) qrECC = eccEl.value;
    if (darkEl) qrDark = darkEl.value;
    if (lightEl) qrLight = lightEl.value;

    if (frame) frame.innerHTML = '';
    const wrap = document.createElement('div');
    if (frame) frame.appendChild(wrap);
    try {
      const qr = new QRCode(wrap, {
        text,
        width: qrSize,
        height: qrSize,
        colorDark: qrDark,
        colorLight: qrLight,
        correctLevel: qrCorrectLevel(qrECC)
      });
      qrDataUrlOf(qr, wrap).then(dataUrl => {
        if (dataUrl) {
          qrCache = { text, dataUrl, size: qrSize };
          if (hint) { hint.textContent = 'تم توليد الرمز بنجاح'; hint.classList.add('hide'); }
        } else {
          qrCache = null;
          if (hint) { hint.textContent = 'تعذر قراءة الرمز المُولّد — حاول مرة أخرى'; hint.classList.remove('hide'); }
        }
        qrDownloadBtnState();
      });
    } catch (e) {
      qrCache = null;
      if (hint) { hint.textContent = 'حدث خطأ أثناء التوليد: ' + e.message; hint.classList.remove('hide'); }
      qrDownloadBtnState();
    }
  }

  function qrRefresh(){
    const inp = document.getElementById('qrInput');
    if (qrCache && inp && !inp.value.trim()) inp.value = qrCache.text;
    qrGenerate();
  }

  function qrDownload(){
    if (!qrCache || !qrCache.dataUrl) return;
    const a = document.createElement('a');
    a.href = qrCache.dataUrl;
    a.download = 'qr-code.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function qrClear(){
    qrCache = null;
    const frame = document.getElementById('qrFrame');
    if (frame) frame.innerHTML = '';
    const hint = document.getElementById('qrHint');
    if (hint) { hint.textContent = 'أدخل نصاً أو رابطاً ثم اضغط "توليد الرمز"'; hint.classList.remove('hide'); }
    qrDownloadBtnState();
  }

  function qrDownloadBtnState(){
    const btn = document.getElementById('qrDownloadBtn');
    if (!btn) return;
    const has = !!(qrCache && qrCache.dataUrl);
    btn.disabled = !has;
    btn.style.opacity = has ? '' : '0.5';
  }

