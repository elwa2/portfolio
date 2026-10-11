  // ── DEV TOOLS DASHBOARD ──
  let showDevDash = false;
  let dtActiveTool = 'css';
  let dtSvgQuotes = 'double';
  let dtSvgColor = '#062458';
  let dtSvgColor2 = '#38bdf8';
  let dtSvgColor3 = '#facc15';
  let dtSvgMode = 'solid';
  let dtSvgModeTouched = false;
  let dtSvgPalette = [];
  let dtSvgOpacity = 1;
  let dtSvgType = 'linear';
  let dtSvgAngle = 90;
  let dtSvgGradSize = 100;

  function toggleDevDash(){
    showDevDash = !showDevDash;
    document.getElementById('devDashBtn').classList.toggle('dev-active', showDevDash);
    if(showDevDash){
      document.querySelectorAll('.filter-tag:not(#devDashBtn)').forEach(b => b.classList.remove('active'));
      showCssDash = false;
      document.getElementById('cssDashBtn').classList.remove('css-active');
      showHomeDash = false;
      const __hb = document.getElementById('homeBtn');
      if (__hb) __hb.classList.remove('home-active');

      showScrollbarDash = false;


      showEdDash = false;
      showB64Dash = false;
      showQrDash = false;
      showCpDash = false;
      showRtDash = false;

      document.getElementById('sbDashBtn').classList.remove('scrollbar-active');


      document.getElementById('edDashBtn').classList.remove('ed-active');
      document.getElementById('b64DashBtn').classList.remove('b64-active');
      document.getElementById('qrDashBtn').classList.remove('qr-active');
      document.getElementById('cpDashBtn').classList.remove('cp-active');
      document.getElementById('rtDashBtn').classList.remove('rt-active');
    }
    renderAll();
  }

  function dtShow(tool){
    dtActiveTool = tool;
    const map = { css:'dtCss', jsmin:'dtJsMin', jsenc:'dtJsEnc', svg:'dtSvg' };
    const btns = { css:'dtTabCss', jsmin:'dtTabJsMin', jsenc:'dtTabJsEnc', svg:'dtTabSvg' };
    Object.keys(map).forEach(k => {
      const p = document.getElementById(map[k]);
      if (p) p.classList.toggle('dt-hidden', k !== tool);
      const b = document.getElementById(btns[k]);
      if (b) b.classList.toggle('active', k === tool);
    });
    persistDashState();
    if (tool === 'svg') dtSvgUpdate();
  }

  function renderDevDash(){
    const badge = document.getElementById('countBadge');
    if (badge) badge.textContent = 'أدوات المطورين';
    const valid = { css:1, jsmin:1, jsenc:1, svg:1 };
    const active = valid[dtActiveTool] ? dtActiveTool : 'css';
    const tabCls = t => t === active ? 'dt-tab active' : 'dt-tab';

    document.getElementById('mainBody').innerHTML = `<div class="has-dash">
      <div class="dt-builder">
        <div class="dt-builder-title"><i class="ti ti-tools"></i> مجموعة أدوات المطورين
          <span>ضغط CSS و JavaScript، تعمية JS، وتحويل SVG إلى URL — بضغطة واحدة</span>
        </div>

        <div class="dt-tabs">
          <button class="${tabCls('css')}" id="dtTabCss" onclick="dtShow('css')"><i class="ti ti-file-css"></i> ضاغط CSS</button>
          <button class="${tabCls('jsmin')}" id="dtTabJsMin" onclick="dtShow('jsmin')"><i class="ti ti-brand-javascript"></i> ضاغط JS</button>
          <button class="${tabCls('jsenc')}" id="dtTabJsEnc" onclick="dtShow('jsenc')"><i class="ti ti-lock"></i> تعمية JS</button>
          <button class="${tabCls('svg')}" id="dtTabSvg" onclick="dtShow('svg')"><i class="ti ti-vector-triangle"></i> تشفير SVG</button>
        </div>

        <div class="dt-panel${active === 'css' ? '' : ' dt-hidden'}" id="dtCss">
          <div class="dt-head"><i class="ti ti-file-css" style="color:#8b5cf6"></i> الصق كود CSS هنا</div>
          <textarea class="dt-textarea" id="dtCssInput" spellcheck="false" placeholder="/* مثال */
body {
  color: #333;
  font-size: 16px;
}"></textarea>

          <div class="dt-options">
            <label class="dt-option"><input type="checkbox" id="dtCssStripAll" checked> إزالة كل التعليقات</label>
            <label class="dt-option"><input type="checkbox" id="dtCssStripCustom" checked> إزالة تعليقات الكود المخصصة</label>
            <label class="dt-option"><input type="checkbox" id="dtCssSuperCompact" checked> ضغط مدمج للغاية</label>
            <label class="dt-option"><input type="checkbox" id="dtCssIndent"> الحفاظ على المسافة البادئة</label>
            <label class="dt-option"><input type="checkbox" id="dtCssNoLastSemi" checked> إزالة الفاصلة المنقوطة الأخيرة</label>
          </div>

          <div class="dt-actions">
            <button class="btn-primary" onclick="dtCompressCSS()"><i class="ti ti-compress"></i> ضغط CSS</button>
            <button class="btn-cancel" onclick="dtClearCss()"><i class="ti ti-eraser"></i> مسح</button>
            <button class="btn-cancel" onclick="dtCopy('dtCssOutput')"><i class="ti ti-copy"></i> نسخ النتيجة</button>
          </div>

          <div class="dt-head"><i class="ti ti-file-css" style="color:#8b5cf6"></i> كود CSS المضغوط</div>
          <textarea class="dt-textarea" id="dtCssOutput" spellcheck="false" readonly onclick="dtCopy('dtCssOutput')" placeholder="النتيجة المضغوطة ستظهر هنا..."></textarea>
        </div>

        <div class="dt-panel${active === 'jsmin' ? '' : ' dt-hidden'}" id="dtJsMin">
          <div class="dt-head"><i class="ti ti-brand-javascript" style="color:#e7c23b"></i> الصق كود JavaScript هنا</div>
          <textarea class="dt-textarea" id="dtJsMinInput" spellcheck="false" placeholder="// مثال
function greet(name) {
  console.log('Hello ' + name);
}
greet('Ali');"></textarea>

          <div class="dt-options">
            <label class="dt-option"><input type="checkbox" id="dtJsKeepComments" checked> الحفاظ على التعليقات</label>
            <label class="dt-option"><input type="checkbox" id="dtJsDropConsole" checked> إزالة console.log</label>
            <label class="dt-option"><input type="checkbox" id="dtJsDropDebugger" checked> إزالة debugger</label>
            <label class="dt-option"><input type="checkbox" id="dtJsMangle" checked> اختصار أسماء المتغيرات</label>
            <label class="dt-option"><input type="checkbox" id="dtJsSuperCompact" checked> ضغط إضافي (passes)</label>
          </div>

          <div class="dt-actions">
            <button class="btn-primary" onclick="dtMinifyJS()"><i class="ti ti-compress"></i> ضغط JS</button>
            <button class="btn-cancel" onclick="dtClear('dtJsMinInput','dtJsMinOutput')"><i class="ti ti-eraser"></i> مسح</button>
            <button class="btn-cancel" onclick="dtCopy('dtJsMinOutput')"><i class="ti ti-copy"></i> نسخ النتيجة</button>
          </div>

          <div class="dt-head"><i class="ti ti-brand-javascript" style="color:#e7c23b"></i> كود JavaScript المضغوط</div>
          <textarea class="dt-textarea" id="dtJsMinOutput" spellcheck="false" readonly onclick="dtCopy('dtJsMinOutput')" placeholder="النتيجة المضغوطة ستظهر هنا..."></textarea>
        </div>

        <div class="dt-panel${active === 'jsenc' ? '' : ' dt-hidden'}" id="dtJsEnc">
          <div class="dt-head"><i class="ti ti-lock" style="color:#8b5cf6"></i> تعمية / فك تعمية JavaScript</div>
          <div class="dt-mode">
            <button class="dt-mode-btn active" id="dtModeEncodeBtn" onclick="dtSwitchJsMode('encode')"><i class="ti ti-lock"></i> تعمية</button>
            <button class="dt-mode-btn" id="dtModeDecodeBtn" onclick="dtSwitchJsMode('decode')"><i class="ti ti-unlock"></i> فك التعمية</button>
          </div>

          <div id="dtJsEncodeMode">
            <div class="dt-head"><i class="ti ti-code" style="color:#8b5cf6"></i> أدخل كود JavaScript للتعمية</div>
            <textarea class="dt-textarea" id="dtJsEncodeInput" spellcheck="false" placeholder="// اكتب كودك هنا...
function hello() {
  console.log('Hello, World!');
}"></textarea>
            <div class="dt-actions">
              <button class="btn-primary" onclick="dtEncodeJS()"><i class="ti ti-lock"></i> تعمية الكود</button>
              <button class="btn-cancel" onclick="dtClear('dtJsEncodeInput','dtJsEncodeOutput')"><i class="ti ti-eraser"></i> مسح</button>
            </div>
            <div class="dt-head"><i class="ti ti-code" style="color:#8b5cf6"></i> النتيجة المعماة</div>
            <textarea class="dt-textarea" id="dtJsEncodeOutput" spellcheck="false" readonly onclick="dtCopy('dtJsEncodeOutput')" placeholder="النتيجة ستظهر هنا..."></textarea>
          </div>

          <div id="dtJsDecodeMode" class="dt-hidden">
            <div class="dt-head"><i class="ti ti-unlock" style="color:#4ade80"></i> أدخل الكود المعمّى لفك تعميته</div>
            <textarea class="dt-textarea" id="dtJsDecodeInput" spellcheck="false" placeholder='eval(decodeURIComponent(escape(atob("..."))));'></textarea>
            <div class="dt-actions">
              <button class="btn-primary" onclick="dtDecodeJS()" style="background:var(--success)"><i class="ti ti-unlock"></i> فك تعمية الكود</button>
              <button class="btn-cancel" onclick="dtClear('dtJsDecodeInput','dtJsDecodeOutput')"><i class="ti ti-eraser"></i> مسح</button>
            </div>
            <div class="dt-head"><i class="ti ti-unlock" style="color:#4ade80"></i> الكود الأصلي المسترجع</div>
            <textarea class="dt-textarea" id="dtJsDecodeOutput" spellcheck="false" readonly onclick="dtCopy('dtJsDecodeOutput')" placeholder="النتيجة ستظهر هنا..."></textarea>
          </div>
        </div>

        <div class="dt-panel${active === 'svg' ? '' : ' dt-hidden'}" id="dtSvg">
          <div class="dt-head"><i class="ti ti-vector-triangle" style="color:#38bdf8"></i> تحويل SVG إلى URL جاهز للاستخدام في CSS</div>

          <div class="dt-svg-modes">
            <button class="dt-mode-btn active" id="dtSvgModeSolid" onclick="dtSvgSetMode('solid')"><i class="ti ti-palette"></i> لون واحد</button>
            <button class="dt-mode-btn" id="dtSvgModeGradient" onclick="dtSvgSetMode('gradient')"><i class="ti ti-adjustments"></i> تدرج لوني</button>
            <button class="dt-mode-btn" id="dtSvgModeOriginal" onclick="dtSvgSetMode('original')"><i class="ti ti-stack-2"></i> شعار متعدد الألوان</button>
          </div>

          <div class="dt-quotes">
            <span>علامات التنصيص:</span>
            <label><input type="radio" name="dtSvgQuotes" value="single"> 'Single'</label>
            <label><input type="radio" name="dtSvgQuotes" value="double" checked> "Double"</label>
          </div>

          <div class="dt-svg-ctrls" id="dtSvgColorRow">
            <label id="dtSvgSolidColorWrap"><i class="ti ti-palette" style="color:#38bdf8"></i> اللون:
              <input type="color" id="dtSvgColorPick" value="#062458">
            </label>
            <label id="dtSvgColor2Wrap" style="display:none">→
              <input type="color" id="dtSvgColor2Pick" value="#38bdf8">
            </label>
            <label id="dtSvgColor3Wrap" style="display:none">→
              <input type="color" id="dtSvgColor3Pick" value="#facc15">
            </label>
            <div class="dt-svg-ctrl-sep"></div>
            <label><i class="ti ti-eye" style="color:#38bdf8"></i> الشفافية:
              <input type="range" id="dtSvgOpacity" min="0" max="1" step="0.05" value="1">
              <span class="dt-svg-opacity-val" id="dtSvgOpacityVal">1</span>
            </label>
          </div>

          <div class="dt-svg-palette dt-hidden" id="dtSvgPalette">
            <div class="dt-svg-pal-head">
              <i class="ti ti-stack-2"></i> ألوان الشعار المكتشفة
              <span class="dt-svg-pal-count" id="dtSvgPalCount">0 لون</span>
              <button class="btn-cancel" onclick="dtSvgPaletteResetAll()"><i class="ti ti-restore"></i> استرجاع الألوان الأصلية</button>
            </div>
            <div class="dt-svg-pal-list" id="dtSvgPalList"></div>
          </div>

          <div class="dt-svg-grad-opts" id="dtSvgGradOpts" style="display:none">
            <label><i class="ti ti-adjustments" style="color:#38bdf8"></i> النوع:
              <select id="dtSvgTypePick">
                <option value="linear" selected>خطى</option>
                <option value="radial">دائرى</option>
              </select>
            </label>
            <label id="dtSvgAngleWrap">الزاوية:
              <input type="range" id="dtSvgAngle" min="0" max="360" step="1" value="90">
              <span class="dt-svg-opacity-val" id="dtSvgAngleVal">90°</span>
            </label>
            <label>الحجم:
              <input type="range" id="dtSvgGradSize" min="10" max="200" step="5" value="100">
              <span class="dt-svg-opacity-val" id="dtSvgGradSizeVal">100%</span>
            </label>
          </div>

          <div class="dt-grid2">
            <div>
              <div class="dt-head"><i class="ti ti-paste" style="color:#38bdf8"></i> أدخل كود SVG
                <div style="display:flex;gap:6px;margin-inline-start:auto">
                  <button class="btn-cancel" onclick="dtSvgExample()" style="padding:2px 10px;font-size:11px">مثال</button>
                  <button class="btn-cancel" onclick="dtSvgExampleMulti()" style="padding:2px 10px;font-size:11px"><i class="ti ti-stack-2"></i> مثال متعدد الألوان</button>
                </div>
              </div>
              <textarea class="dt-textarea" id="dtSvgInput" spellcheck="false" placeholder="<svg width='100' height='100' ...></svg>"></textarea>
            </div>
            <div>
              <div class="dt-head"><i class="ti ti-eye" style="color:#38bdf8"></i> معاينة</div>
              <div class="dt-demo" id="dtSvgDemo" style="background:#fff"><div class="dt-demo-bg" id="dtSvgDemoBg"></div></div>
              <div class="dt-contrast">الخلفية:
                <button class="dt-contrast-btn current" data-color="white" style="background:#fff" title="أبيض"></button>
                <button class="dt-contrast-btn" data-color="silver" style="background:#c0c0c0" title="فضي"></button>
                <button class="dt-contrast-btn" data-color="black" style="background:#000" title="أسود"></button>
              </div>
            </div>
          </div>

          <div class="dt-grid2" style="margin-top:14px">
            <div>
              <div class="dt-head"><i class="ti ti-link" style="color:#38bdf8"></i> النتيجة (Encoded URL)
                <a id="dtSvgOpenTab" href="#" target="_blank" style="margin-inline-start:auto;font-size:11px;color:#38bdf8;text-decoration:none;display:none" onclick="return dtSvgOpenLink(event)"><i class="ti ti-external-link"></i> فتح فى تبويب</a>
              </div>
              <textarea class="dt-textarea" id="dtSvgResult" spellcheck="false" readonly onclick="dtCopy('dtSvgResult')"></textarea>
            </div>
            <div>
              <div class="dt-head"><i class="ti ti-file-css" style="color:#38bdf8"></i> كود CSS جاهز</div>
              <textarea class="dt-textarea" id="dtSvgCss" spellcheck="false" readonly onclick="dtCopy('dtSvgCss')"></textarea>
            </div>
          </div>
          <div style="margin-top:14px">
            <div class="dt-head"><i class="ti ti-braces" style="color:#38bdf8"></i> متغير CSS جاهز (:root)
              <div style="display:flex;align-items:center;gap:6px;margin-inline-start:auto">
                <span style="font-size:11px;color:var(--text-3)">--</span>
                <input type="text" id="dtSvgVarName" value="logo" class="dt-textarea" style="width:120px;min-height:0;height:28px;padding:2px 8px;font-size:12px" spellcheck="false" oninput="dtSvgUpdate()">
              </div>
            </div>
            <textarea class="dt-textarea" id="dtSvgVar" spellcheck="false" readonly onclick="dtCopy('dtSvgVar')"></textarea>
          </div>
        </div>
      </div>
    </div>`;

    const svgInput = document.getElementById('dtSvgInput');
    if (svgInput) {
      svgInput.addEventListener('input', dtSvgOnInput);
      document.querySelectorAll('input[name="dtSvgQuotes"]').forEach(r => {
        r.addEventListener('change', () => { dtSvgQuotes = r.value === 'double' ? 'double' : 'single'; dtSvgUpdate(); });
      });
      document.querySelectorAll('.dt-contrast-btn').forEach(b => {
        b.addEventListener('click', () => {
          document.querySelectorAll('.dt-contrast-btn').forEach(x => x.classList.remove('current'));
          b.classList.add('current');
          const demo = document.getElementById('dtSvgDemo');
          if (demo) demo.style.background = b.dataset.color;
        });
      });
      const svgColorPick = document.getElementById('dtSvgColorPick');
      const svgColor2Pick = document.getElementById('dtSvgColor2Pick');
      const svgOpacity = document.getElementById('dtSvgOpacity');
      const svgOpacityVal = document.getElementById('dtSvgOpacityVal');
      if (svgColorPick) svgColorPick.addEventListener('input', () => { dtSvgColor = svgColorPick.value; dtSvgUpdate(); });
      if (svgColor2Pick) svgColor2Pick.addEventListener('input', () => { dtSvgColor2 = svgColor2Pick.value; dtSvgUpdate(); });
      const svgColor3Pick = document.getElementById('dtSvgColor3Pick');
      if (svgColor3Pick) svgColor3Pick.addEventListener('input', () => { dtSvgColor3 = svgColor3Pick.value; dtSvgUpdate(); });
      const svgTypePick = document.getElementById('dtSvgTypePick');
      if (svgTypePick) svgTypePick.addEventListener('change', () => { dtSvgType = svgTypePick.value; dtSvgSyncControls(); dtSvgUpdate(); });
      const svgAngle = document.getElementById('dtSvgAngle');
      const svgAngleVal = document.getElementById('dtSvgAngleVal');
      if (svgAngle) svgAngle.addEventListener('input', () => { dtSvgAngle = parseInt(svgAngle.value, 10); if (svgAngleVal) svgAngleVal.textContent = dtSvgAngle + '°'; dtSvgUpdate(); });
      const svgGradSize = document.getElementById('dtSvgGradSize');
      const svgGradSizeVal = document.getElementById('dtSvgGradSizeVal');
      if (svgGradSize) svgGradSize.addEventListener('input', () => { dtSvgGradSize = parseInt(svgGradSize.value, 10); if (svgGradSizeVal) svgGradSizeVal.textContent = dtSvgGradSize + '%'; dtSvgUpdate(); });
      if (svgOpacity) svgOpacity.addEventListener('input', () => { dtSvgOpacity = parseFloat(svgOpacity.value); if (svgOpacityVal) svgOpacityVal.textContent = dtSvgOpacity; dtSvgUpdate(); });
      dtSvgRestore();
    }
  }

  function dtCopy(id){
    const el = document.getElementById(id);
    if (!el || !el.value || !el.value.trim()) { showToast('لا يوجد شيء لنسخه'); return; }
    navigator.clipboard.writeText(el.value).then(() => showToast('تم النسخ!')).catch(() => showToast('تعذّر النسخ'));
  }

  function dtClear(inId, outId){
    const i = document.getElementById(inId);
    if (i) i.value = '';
    const o = document.getElementById(outId);
    if (o) o.value = '';
  }

  function dtClearCss(){
    dtClear('dtCssInput', 'dtCssOutput');
  }

  // ── CSS Minifier ──
  function dtCompressCSS(){
    const input = document.getElementById('dtCssInput');
    const output = document.getElementById('dtCssOutput');
    if (!input || !output || !input.value.trim()) return;
    let n = input.value;
    const stripCustom = document.getElementById('dtCssStripCustom').checked;
    const stripAll = document.getElementById('dtCssStripAll').checked;
    const superCompact = document.getElementById('dtCssSuperCompact').checked;
    const betterIndentation = document.getElementById('dtCssIndent').checked;
    const removeLastSemi = document.getElementById('dtCssNoLastSemi').checked;

    if (stripCustom) n = n.replace(/\/\*\/\/\*[\s\S]*?\/\*\/\//g, '');
    if (stripAll || superCompact) n = n.replace(/\/\*[\w\W]*?\*\//gm, '');
    else n = n.replace(/(\n+)?(\/\*[\w\W]*?\*\/)(\n+)?/gm, '\n$2\n');
    n = n.replace(/([\n\r\t\s ]+)?([,\:;\{\}]+?)([\n\r\t\s ]+)?/g, '$2');
    if (!superCompact) n = n.replace(/\}(?!\})/g, '}\n');
    const mediaKeyframesRegex = /@(media|-w|-m|-o|keyframes|page)(.*?)\{([\s\S]+?)?\}\}/gi;
    if (betterIndentation) {
      n = n.replace(mediaKeyframesRegex, (e) => e.replace(/\n+/g, '\n  '));
      if (!superCompact) {
        n = n.replace(/\}\}/g, '}\n}');
        n = n.replace(/@(media|-w|-m|-o|keyframes)(.*?)\{/g, '@$1$2{\n  ');
      }
    } else {
      n = n.replace(mediaKeyframesRegex, (e) => e.replace(/\n+/g, ''));
    }
    if (removeLastSemi) n = n.replace(/;\}/g, '}');
    else n = n.replace(/\}/g, ';}').replace(/;+\}/g, ';}').replace(/\};\}/g, '}}');
    n = n.replace(/\:0(px|em|pt)/gi, ':0').replace(/ 0(px|em|pt)/gi, ' 0');
    n = n.replace(/\s+\!important/gi, '!important').replace(/(^\n+|\n+$)/, '');
    output.value = n;
    showToast('تم ضغط CSS');
  }

  // ── JS Minifier ──
  function dtFallbackMinifyJS(code, keepComments){
    let minified = code;
    if (!keepComments) {
      minified = minified
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:])\/\/.*$/gm, '$1');
    }
    return minified
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}();,:=<>+\-*\/])\s*/g, '$1')
      .trim();
  }

  async function dtMinifyJS(){
    const input = document.getElementById('dtJsMinInput');
    const output = document.getElementById('dtJsMinOutput');
    if (!input || !output || !input.value.trim()) return;

    const keepComments = document.getElementById('dtJsKeepComments').checked;
    const dropConsole = document.getElementById('dtJsDropConsole').checked;
    const dropDebugger = document.getElementById('dtJsDropDebugger').checked;
    const mangleNames = document.getElementById('dtJsMangle').checked;
    const superCompact = document.getElementById('dtJsSuperCompact').checked;

    const minifyOptions = {
      compress: { drop_console: !!dropConsole, drop_debugger: !!dropDebugger, passes: superCompact ? 2 : 1 },
      mangle: !!mangleNames,
      format: { comments: keepComments ? 'some' : false }
    };

    try {
      if (window.Terser && typeof window.Terser.minify === 'function') {
        const result = await window.Terser.minify(input.value, minifyOptions);
        if (result.error) throw result.error;
        output.value = result.code || '';
      } else {
        output.value = dtFallbackMinifyJS(input.value, !!keepComments);
        showToast('تم الضغط ببساطة — مكتبة الضغط غير متاحة');
        return;
      }
      showToast('تم ضغط JS');
    } catch (err) {
      console.error('JS minify failed:', err);
      showToast('حدث خطأ — تأكد من صحة الكود');
    }
  }

  // ── JS Encoder/Decoder ──
  function dtSwitchJsMode(mode){
    const enc = document.getElementById('dtJsEncodeMode');
    const dec = document.getElementById('dtJsDecodeMode');
    const encBtn = document.getElementById('dtModeEncodeBtn');
    const decBtn = document.getElementById('dtModeDecodeBtn');
    if (!enc || !dec) return;
    enc.classList.toggle('dt-hidden', mode !== 'encode');
    dec.classList.toggle('dt-hidden', mode !== 'decode');
    encBtn.classList.toggle('active', mode === 'encode');
    decBtn.classList.toggle('active', mode === 'decode');
  }

  function dtEncodeJS(){
    const input = document.getElementById('dtJsEncodeInput');
    const output = document.getElementById('dtJsEncodeOutput');
    if (!input.value.trim()) return;
    try {
      let encoded = btoa(unescape(encodeURIComponent(input.value)));
      output.value = 'eval(decodeURIComponent(escape(atob("' + encoded + '"))));';
      showToast('تمت التعمية');
    } catch (e) {
      console.error(e);
      showToast('خطأ في عملية التعمية');
    }
  }

  function dtDecodeJS(){
    const input = document.getElementById('dtJsDecodeInput');
    const output = document.getElementById('dtJsDecodeOutput');
    if (!input.value.trim()) return;
    try {
      const match = input.value.match(/atob\("(.+?)"\)/);
      if (match && match[1]) {
        output.value = decodeURIComponent(escape(atob(match[1])));
        showToast('تم فك التعمية');
      } else {
        showToast('لم يتم العثور على نمط تعمية متوافق (atob)');
      }
    } catch (e) {
      console.error(e);
      showToast('خطأ في فك التعمية');
    }
  }

  // ── SVG Encoder ──
  const DT_SVG_KEY = 'csm_svg_state';
  const DT_SVG_TTL = 24 * 60 * 60 * 1000;

  function dtSvgSave(){
    const input = document.getElementById('dtSvgInput');
    if (!input || !input.value.trim()) return;
    try {
      localStorage.setItem(DT_SVG_KEY, JSON.stringify({
        savedAt: Date.now(),
        input: input.value,
        color: dtSvgColor,
        color2: dtSvgColor2,
        color3: dtSvgColor3,
        mode: dtSvgMode,
        palette: dtSvgPalette,
        opacity: dtSvgOpacity,
        type: dtSvgType,
        angle: dtSvgAngle,
        gradSize: dtSvgGradSize,
        quotes: dtSvgQuotes
      }));
    } catch (e) {}
  }

  function dtSvgSetMode(mode){
    if (mode !== 'solid' && mode !== 'gradient' && mode !== 'original') return;
    dtSvgMode = mode;
    dtSvgModeTouched = true;
    dtSvgSyncControls();
    dtSvgRenderPalette();
    dtSvgUpdate();
  }

  function dtSvgSyncControls(){
    const colorPick = document.getElementById('dtSvgColorPick');
    if (colorPick) colorPick.value = dtSvgColor;
    const color2Pick = document.getElementById('dtSvgColor2Pick');
    if (color2Pick) color2Pick.value = dtSvgColor2;
    const color3Pick = document.getElementById('dtSvgColor3Pick');
    if (color3Pick) color3Pick.value = dtSvgColor3;
    const isOriginal = dtSvgMode === 'original';
    ['solid', 'gradient', 'original'].forEach(function(m){
      const b = document.getElementById('dtSvgMode' + m.charAt(0).toUpperCase() + m.slice(1));
      if (b) b.classList.toggle('active', m === dtSvgMode);
    });
    const solidWrap = document.getElementById('dtSvgSolidColorWrap');
    if (solidWrap) solidWrap.style.display = isOriginal ? 'none' : '';
    const gradWrap = document.getElementById('dtSvgColor2Wrap');
    if (gradWrap) gradWrap.style.display = dtSvgMode === 'gradient' ? '' : 'none';
    const gradWrap3 = document.getElementById('dtSvgColor3Wrap');
    if (gradWrap3) gradWrap3.style.display = dtSvgMode === 'gradient' ? '' : 'none';
    const palette = document.getElementById('dtSvgPalette');
    if (palette) palette.classList.toggle('dt-hidden', !isOriginal);
    const gradOpts = document.getElementById('dtSvgGradOpts');
    if (gradOpts) gradOpts.style.display = dtSvgMode === 'gradient' ? '' : 'none';
    const typePick = document.getElementById('dtSvgTypePick');
    if (typePick && typePick.value !== dtSvgType) typePick.value = dtSvgType;
    const angleWrap = document.getElementById('dtSvgAngleWrap');
    if (angleWrap) angleWrap.style.display = dtSvgType === 'radial' ? 'none' : '';
    const angle = document.getElementById('dtSvgAngle');
    if (angle) angle.value = dtSvgAngle;
    const angleVal = document.getElementById('dtSvgAngleVal');
    if (angleVal) angleVal.textContent = dtSvgAngle + '°';
    const gradSize = document.getElementById('dtSvgGradSize');
    if (gradSize) gradSize.value = dtSvgGradSize;
    const gradSizeVal = document.getElementById('dtSvgGradSizeVal');
    if (gradSizeVal) gradSizeVal.textContent = dtSvgGradSize + '%';
    const op = document.getElementById('dtSvgOpacity');
    if (op) op.value = dtSvgOpacity;
    const opVal = document.getElementById('dtSvgOpacityVal');
    if (opVal) opVal.textContent = dtSvgOpacity;
    document.querySelectorAll('input[name="dtSvgQuotes"]').forEach(r => { r.checked = r.value === dtSvgQuotes; });
  }

  function dtSvgExtractColors(svg){
    const out = [];
    const re = /\b(?:fill|stroke|stop-color|flood-color)\s*[:=]\s*["']?(#[0-9a-fA-F]{3,8})/g;
    let m;
    while ((m = re.exec(svg)) !== null) {
      const raw = m[1].toLowerCase();
      let hex = raw;
      if (hex.length === 4 || hex.length === 5) hex = '#' + hex.slice(1).split('').map(c => c + c).join('');
      else if (hex.length === 8 && hex.slice(7) === 'ff') hex = hex.slice(0, 7);
      else if (hex.length === 9) hex = '#' + hex.slice(1).split('').map(c => c + c).join('');
      if (out.indexOf(hex) < 0) out.push(hex);
    }
    return out;
  }

  function dtSvgSyncPalette(colors){
    const prev = {};
    dtSvgPalette.forEach(function(p){ if (p && p.from) prev[p.from.toLowerCase()] = p.to || p.from; });
    dtSvgPalette = colors.map(function(c){
      return { from: c, to: prev[c] || c };
    });
  }

  function dtSvgColorVariants(hex){
    const list = [hex.toLowerCase()];
    if (hex.length === 4) list.push('#' + hex.slice(1).split('').map(c => c + c).join(''));
    if (hex.length === 9) {
      const full = '#' + hex.slice(1).split('').map(c => c + c).join('');
      if (full.slice(7) === 'ff') list.push(full.slice(0, 7));
    }
    return list.sort((a, b) => b.length - a.length);
  }

  function dtSvgApplyPalette(s){
    let out = s;
    dtSvgPalette.forEach(function(p){
      if (!p || !p.from || !p.to) return;
      if (p.from.toLowerCase() === p.to.toLowerCase()) return;
      dtSvgColorVariants(p.from).forEach(function(v){
        const re = new RegExp('([\\s"\'=:,(])(' + v + ')([\\s"\';),])', 'gi');
        out = out.replace(re, (m, a, c, b) => a + p.to + b);
      });
    });
    return out;
  }

  function dtSvgRenderPalette(){
    const list = document.getElementById('dtSvgPalList');
    const count = document.getElementById('dtSvgPalCount');
    if (!list) return;
    if (!dtSvgPalette.length) {
      list.innerHTML = '<div class="dt-svg-pal-empty">لم يتم العثور على ألوان داخل الـ SVG — الصق شعاراً ملوناً أو استخدم وضع «لون واحد».</div>';
      if (count) count.textContent = '0 لون';
      return;
    }
    if (count) count.textContent = dtSvgPalette.length > 2 ? dtSvgPalette.length + ' ألوان' : dtSvgPalette.length + ' لون';
    list.innerHTML = dtSvgPalette.map(function(p, i){
      const changed = p.from.toLowerCase() !== p.to.toLowerCase();
      return '<div class="dt-svg-pal-row">'
        + '<span class="dt-svg-pal-chip" style="background:' + p.from + '"></span>'
        + '<span class="dt-svg-pal-hex">' + p.from + '</span>'
        + '<i class="ti ti-arrow-left"></i>'
        + '<input type="color" value="' + p.to + '" data-dtpal="' + i + '">'
        + '<span class="dt-svg-pal-hex" id="dtSvgPalHex' + i + '">' + p.to + '</span>'
        + '<button class="dt-svg-pal-reset" onclick="dtSvgPaletteReset(' + i + ')" title="استرجاع اللون الأصلي"' + (changed ? '' : ' style="display:none"') + '><i class="ti ti-restore"></i></button>'
        + '</div>';
    }).join('');
    list.querySelectorAll('input[data-dtpal]').forEach(function(inp){
      inp.addEventListener('input', function(){
        const i = parseInt(inp.dataset.dtpal, 10);
        if (!dtSvgPalette[i]) return;
        dtSvgPalette[i].to = inp.value;
        const hexEl = document.getElementById('dtSvgPalHex' + i);
        if (hexEl) hexEl.textContent = inp.value;
        const row = inp.parentNode;
        const btn = row.querySelector('.dt-svg-pal-reset');
        if (btn) btn.style.display = inp.value.toLowerCase() === dtSvgPalette[i].from.toLowerCase() ? 'none' : '';
        dtSvgUpdate();
      });
    });
  }

  function dtSvgPaletteReset(i){
    const p = dtSvgPalette[i];
    if (!p) return;
    p.to = p.from;
    dtSvgRenderPalette();
    dtSvgUpdate();
  }

  function dtSvgPaletteResetAll(){
    dtSvgPalette.forEach(function(p){ if (p) p.to = p.from; });
    dtSvgRenderPalette();
    dtSvgUpdate();
  }

  function dtSvgDetectColors(){
    const input = document.getElementById('dtSvgInput');
    if (!input) return;
    const svg = input.value;
    if (!svg.trim()) return;
    const colors = dtSvgExtractColors(svg);
    dtSvgSyncPalette(colors);
    const gradEl = svg.match(/<(linear|radial)Gradient\b([^>]*)>([\s\S]*?)<\/\1Gradient>/i);
    if (gradEl) {
      dtSvgType = gradEl[1].toLowerCase() === 'radial' ? 'radial' : 'linear';
      const attrs = gradEl[2];
      const stopColors = [];
      (gradEl[3].match(/<stop\b[^>]*>/gi) || []).forEach(function(st){
        const m = st.match(/stop-color\s*[:=]\s*["']?(#[0-9a-fA-F]{3,8})/);
        if (m) stopColors.push(m[1]);
      });
      if (stopColors.length) {
        dtSvgColor = stopColors[0];
        dtSvgColor2 = stopColors[stopColors.length - 1];
        dtSvgColor3 = stopColors.length >= 3 ? stopColors[1] : stopColors[0];
        if (dtSvgType === 'radial') {
          const rm = attrs.match(/\br\s*=\s*["']?([0-9.]+)/);
          if (rm) {
            let r = parseFloat(rm[1]);
            if (r <= 1) r = r * 100;
            dtSvgGradSize = Math.round(Math.max(10, Math.min(200, r * 2)));
          }
        } else {
          const get = function(name){
            const m = attrs.match(new RegExp('\\b' + name + '\\s*=\\s*["\']?(-?[0-9.]+)'));
            return m ? parseFloat(m[1]) : 50;
          };
          const x1 = get('x1'), y1 = get('y1'), x2 = get('x2'), y2 = get('y2');
          const maxAbs = Math.max(Math.abs(x1), Math.abs(y1), Math.abs(x2), Math.abs(y2), 1);
          const scale = maxAbs <= 1 ? 100 : 1;
          let dx = (x2 - x1) * scale, dy = (y2 - y1) * scale;
          let ang = Math.round(Math.atan2(dy, dx) * 180 / Math.PI);
          if (ang < 0) ang += 360;
          dtSvgAngle = ang;
          const len = Math.sqrt(dx * dx + dy * dy);
          dtSvgGradSize = Math.round(Math.max(10, Math.min(200, len)));
        }
        if (!dtSvgModeTouched) dtSvgMode = colors.length > 1 ? 'original' : 'gradient';
        dtSvgSyncControls();
        dtSvgRenderPalette();
        return;
      }
    }
    if (colors.length) {
      dtSvgColor = colors[0];
      if (!dtSvgModeTouched) dtSvgMode = colors.length > 1 ? 'original' : 'solid';
    } else if (!dtSvgModeTouched) {
      dtSvgMode = 'solid';
    }
    dtSvgSyncControls();
    dtSvgRenderPalette();
  }

  function dtSvgOnInput(){
    dtSvgDetectColors();
    dtSvgUpdate();
  }

  function dtSvgRestore(){
    let state = null;
    try { state = JSON.parse(localStorage.getItem(DT_SVG_KEY) || 'null'); } catch (e) {}
    if (!state || !state.input) return;
    if ((Date.now() - (state.savedAt || 0)) > DT_SVG_TTL) {
      try { localStorage.removeItem(DT_SVG_KEY); } catch (e) {}
      return;
    }
    const input = document.getElementById('dtSvgInput');
    if (!input) return;
    if (typeof state.color === 'string') dtSvgColor = state.color;
    if (typeof state.color2 === 'string') dtSvgColor2 = state.color2;
    if (typeof state.color3 === 'string') dtSvgColor3 = state.color3;
    if (state.mode === 'solid' || state.mode === 'gradient' || state.mode === 'original') { dtSvgMode = state.mode; dtSvgModeTouched = true; }
    else if (typeof state.gradient === 'boolean' && state.gradient) dtSvgMode = 'gradient';
    if (Array.isArray(state.palette)) {
      dtSvgPalette = state.palette.filter(p => p && typeof p.from === 'string').map(p => ({ from: p.from, to: typeof p.to === 'string' ? p.to : p.from }));
    }
    if (typeof state.opacity === 'number') dtSvgOpacity = state.opacity;
    if (state.type === 'linear' || state.type === 'radial') dtSvgType = state.type;
    if (typeof state.angle === 'number') dtSvgAngle = state.angle;
    if (typeof state.gradSize === 'number') dtSvgGradSize = state.gradSize;
    if (state.quotes === 'single' || state.quotes === 'double') dtSvgQuotes = state.quotes;
    input.value = state.input;
    dtSvgSyncControls();
    dtSvgRenderPalette();
    dtSvgUpdate();
  }

  function dtSvgExample(){
    const input = document.getElementById('dtSvgInput');
    if (!input) return;
    input.value = '<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\n  <circle cx="50" cy="50" r="40" fill="#8b5cf6" />\n</svg>';
    dtSvgModeTouched = false;
    dtSvgOnInput();
  }

  function dtSvgExampleMulti(){
    const input = document.getElementById('dtSvgInput');
    if (!input) return;
    input.value = '<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">\n'
      + '  <path d="M60 8 106 38v44L60 112 14 82V38z" fill="#0f172a"/>\n'
      + '  <path d="M60 22 96 45v30L60 98 24 75V45z" fill="#38bdf8"/>\n'
      + '  <circle cx="60" cy="60" r="16" fill="#facc15"/>\n'
      + '  <path d="M14 38 60 8l46 30-12 8-34-22-34 22z" fill="#ef4444"/>\n'
      + '</svg>';
    dtSvgModeTouched = false;
    dtSvgOnInput();
  }

  function dtSvgQuotesObj(){
    return {
      level1: dtSvgQuotes === 'double' ? '"' : "'",
      level2: dtSvgQuotes === 'double' ? "'" : '"'
    };
  }

  function dtSvgOpenLink(e){
    e.preventDefault();
    const val = document.getElementById('dtSvgResult');
    if (!val || !val.value.trim()) { showToast('لا يوجد رابط لفتحه'); return false; }
    try {
      const svg = decodeURIComponent(val.value.replace(/^data:image\/svg\+xml,/, ''));
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(function(){ URL.revokeObjectURL(url); }, 30000);
    } catch (err) {
      showToast('تعذّر فتح الصورة');
    }
    return false;
  }

  function dtSvgBuildGradient(color, color2, color3){
    const stops = '<stop offset="0%" stop-color="' + color + '"/><stop offset="50%" stop-color="' + color3 + '"/><stop offset="100%" stop-color="' + color2 + '"/>';
    if (dtSvgType === 'radial') {
      const r = dtSvgGradSize / 2;
      return '<radialGradient id="svgGrad" cx="50%" cy="50%" r="' + r + '%">' + stops + '</radialGradient>';
    }
    const a = dtSvgAngle * Math.PI / 180;
    const ext = dtSvgGradSize / 100;
    const p = function(v){ return Math.round(v * 10) / 10; };
    const x1 = p(50 - 50 * ext * Math.cos(a));
    const y1 = p(50 - 50 * ext * Math.sin(a));
    const x2 = p(50 + 50 * ext * Math.cos(a));
    const y2 = p(50 + 50 * ext * Math.sin(a));
    return '<linearGradient id="svgGrad" x1="' + x1 + '%" y1="' + y1 + '%" x2="' + x2 + '%" y2="' + y2 + '%">' + stops + '</linearGradient>';
  }

  function dtSvgModifySvg(svg, mode, opacity){
    let s = svg;
    if (opacity < 1) {
      if (/\bopacity\s*=/.test(s)) {
        s = s.replace(/\bopacity\s*=\s*["'][^"']*["']/, 'opacity="' + opacity + '"');
      } else {
        s = s.replace(/<svg\b/, '<svg opacity="' + opacity + '"');
      }
    }
    if (mode === 'original') return dtSvgApplyPalette(s);
    const color = dtSvgColor;
    if (mode === 'gradient') {
      const gradId = 'svgGrad';
      const gradDef = dtSvgBuildGradient(dtSvgColor, dtSvgColor2, dtSvgColor3);
      if (s.indexOf('id="' + gradId + '"') < 0 && s.indexOf("id='" + gradId + "'") < 0) {
        const defsBlock = '<defs>' + gradDef + '</defs>';
        s = s.replace(/<svg\b[^>]*>/, function(m){ return m + defsBlock; });
      } else {
        const gradAttr = 'id=["\\\']' + gradId + '["\\\']';
        let reGrad = new RegExp('<linearGradient\\b[^>]*' + gradAttr + '[^>]*>[\\s\\S]*?</linearGradient>', 'i');
        if (!reGrad.test(s)) reGrad = new RegExp('<radialGradient\\b[^>]*' + gradAttr + '[^>]*>[\\s\\S]*?</radialGradient>', 'i');
        s = s.replace(reGrad, gradDef);
      }
      s = s.replace(/\bfill\s*=\s*["'](?:#[0-9a-fA-F]{3,8}|url\([^"']*\))["']/g, 'fill="url(#' + gradId + ')"');
      s = s.replace(/\bfill\s*:\s*(?:#[0-9a-fA-F]{3,8}|url\([^)]*\))/g, 'fill:url(#' + gradId + ')');
    } else {
      s = s.replace(/\bfill\s*=\s*["']url\([^"']*\)["']/g, 'fill="' + color + '"');
      s = s.replace(/\bfill\s*=\s*["']#[0-9a-fA-F]{3,8}["']/g, 'fill="' + color + '"');
      s = s.replace(/\bfill\s*:\s*(?:#[0-9a-fA-F]+|url\([^)]*\))/g, 'fill:' + color);
    }
    return s;
  }

  function dtSvgUpdate(){
    const input = document.getElementById('dtSvgInput');
    const result = document.getElementById('dtSvgResult');
    const cssOut = document.getElementById('dtSvgCss');
    const varOut = document.getElementById('dtSvgVar');
    const demo = document.getElementById('dtSvgDemoBg');
    if (!input || !result || !cssOut || !demo) return;
    if (!input.value.trim()) {
      result.value = cssOut.value = '';
      if (varOut) varOut.value = '';
      const openTab = document.getElementById('dtSvgOpenTab');
      if (openTab) openTab.style.display = 'none';
      demo.style.backgroundImage = '';
      return;
    }
    let data = input.value;
    data = dtSvgModifySvg(data, dtSvgMode, dtSvgOpacity);
    const q = dtSvgQuotesObj();
    if (data.indexOf('http://www.w3.org/2000/svg') < 0) {
      data = data.replace(/<svg/g, '<svg xmlns=' + q.level2 + 'http://www.w3.org/2000/svg' + q.level2);
    }
    const symbols = /[\r\n%#()<>?\[\\\]^`{|}]/g;
    if (dtSvgQuotes === 'double') data = data.replace(/"/g, "'");
    else data = data.replace(/'/g, '"');
    data = data.replace(/>\s{1,}</g, '><').replace(/\s{2,}/g, ' ');
    const escaped = data.replace(symbols, encodeURIComponent);
    const dataUri = 'data:image/svg+xml,' + escaped;
    result.value = dataUri;
    const openTab = document.getElementById('dtSvgOpenTab');
    if (openTab) openTab.style.display = '';
    cssOut.value = 'background-image: url(' + q.level1 + dataUri + q.level1 + ');';
    if (varOut) {
      const varName = (document.getElementById('dtSvgVarName').value || 'logo').trim();
      varOut.value = ':root {\n  --' + varName + ': url(' + q.level1 + dataUri + q.level1 + ');\n}';
    }
    demo.style.backgroundImage = 'url("' + dataUri + '")';
    dtSvgSave();
  }

