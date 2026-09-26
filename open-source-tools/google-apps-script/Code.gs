/**
 * ============================================================================
 *  متتبع العادات 2026 — Google Apps Script Backend
 *  Habit Tracker 2026 — Google Sheets backend
 * ============================================================================
 *
 *  MAIN FUNCTIONS:
 *    setupSheets()    -> Creates / repairs ALL required sheets + headers
 *    onOpen()         -> Adds a "⚙️ متتبع العادات" menu inside the Sheet
 *    doGet(e)         -> Web API: read data (JSON)
 *    doPost(e)        -> Web API: write data (JSON)
 *
 *  SPREADSHEET ID:
 *    Option 1 (bound script):   leave SPREADSHEET_ID empty, it uses the open Sheet.
 *    Option 2 (standalone):     paste the ID below and deploy as a Web App.
 * ============================================================================
 */

// >>>>>>>>>>>>>>>>>>>>> PASTE YOUR SPREADSHEET ID HERE <<<<<<<<<<<<<<<<<<<<
// Example: 1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789abcdefg
var SPREADSHEET_ID = '';

// Data schema version (for future migrations)
var SCHEMA_VERSION = 1;

// Sheet (table) names
var SH = {
  HABITS: 'Habits',
  DAILY: 'Daily',
  META: 'Meta',
  DASH: 'لوحة التحكم'
};

// Cabeceras de cada tabla
var HEADERS = {
  HABITS: ['id', 'name', 'icon', 'sort', 'active', 'createdAt'],
  DAILY: ['habitId', 'month', 'day', 'done', 'updatedAt'],
  META: ['key', 'value']
};

// Nombres de Months en árabe (índice 0 = enero)
var MONTH_NAMES = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

// ============================================================================
//  0. HELPERS
// ============================================================================

/** Devuelve el Spreadsheet open (bound) o el del ID configurado. */
function getSS_() {
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('No spreadsheet. Set SPREADSHEET_ID or run from the Sheet.');
  return ss;
}

/** Devuelve (y crea si hace falta) una hoja por nombre. */
function getSheet_(name) {
  var ss = getSS_();
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

/** Devuelve la fecha/hora actual en texto. */
function nowIso_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

/** Devuelve la fecha de hoy como YYYY-MM-DD. */
function todayStr_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

/** Responde JSON desde el Web App. */
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
//  1. SETUP — crea / actualiza TODAS las tablas
// ============================================================================

/**
 * Crea (o repara) todas las hojas con sus cabeceras y formato.
 * Es idempotente: puedes ejecutarla varias veces sin romper nada.
 */
function setupSheets() {
  var ss = getSS_();
  var created = [];

  // --- Hoja Habits ---
  var h = getSheet_(SH.HABITS);
  ensureHeaders_(h, HEADERS.HABITS);
  created.push(SH.HABITS);

  // --- Hoja Daily ---
  var d = getSheet_(SH.DAILY);
  ensureHeaders_(d, HEADERS.DAILY);
  created.push(SH.DAILY);

  // --- Hoja Meta ---
  var m = getSheet_(SH.META);
  ensureHeaders_(m, HEADERS.META);
  // escribe / actualiza el schema version
  var metaRange = m.getRange(1, 1, m.getMaxRows(), 2).getValues();
  var hasVersion = false;
  for (var i = 1; i < metaRange.length; i++) {
    if (metaRange[i][0] === 'schemaVersion') { m.getRange(i + 1, 2).setValue(SCHEMA_VERSION); hasVersion = true; }
  }
  if (!hasVersion) {
    m.appendRow(['schemaVersion', SCHEMA_VERSION]);
    m.appendRow(['sheetId', ss.getId()]);
    m.appendRow(['setupAt', nowIso_()]);
  }
  created.push(SH.META);

  // --- Formato bonito ---
  formatSheet_(h, [90, 220, 60, 50, 60, 160]);
  formatSheet_(d, [90, 70, 60, 60, 160]);
  formatSheet_(m, [160, 220]);

  // --- Dropdowns para que se pueda escribir a mano sin romper la base de datos ---
  applyValidations_(h, d);

  // --- Datos de ejemplo si la tabla Habits está vacía ---
  if (h.getLastRow() < 2) {
    seedHabits_(h);
  }

  // --- Registrar en Meta el ID real del spreadsheet ---
  setMeta_('sheetId', ss.getId());
  setMeta_('sheetTitle', ss.getName());

  // --- La "página nueva": una hoja Dashboard con fórmulas vivas ---
  // Envuelta en try/catch: el dashboard es un extra y NUNCA debe tumbar la
  // instalación principal ni ocultarle el Spreadsheet ID al usuario.
  var dashNote = '';
  try {
    buildDashboard_();
    created.push(SH.DASH);
  } catch (e) {
    dashNote = '\n⚠️ تعذّر بناء «لوحة التحكم»: ' + e.message;
  }

  return 'تم بنجاح. الأوراق جاهزة: ' + created.join(' , ') +
    '\nSpreadsheet ID: ' + ss.getId() +
    '\nSpreadsheet URL: ' + ss.getUrl() + dashNote;
}

/**
 * Listones de validación (dropdowns) para las columnas sensibles.
 * Así se puede escribir a mano en la tabla sin crear datos corruptos.
 */
function applyValidations_(h, d) {
  try {
    var yesNo = SpreadsheetApp.newDataValidation()
      .requireValueInList(['TRUE', 'FALSE', '✓', '✗'], true)
      .build();

    var months = [];
    for (var i = 0; i < 12; i++) months.push(String(i));   // 0..11
    var monthDv = SpreadsheetApp.newDataValidation()
      .requireValueInList(months, true)
      .setHelpText('اكتب رقم الشهر من 0 (يناير) إلى 11 (ديسمبر).')
      .build();

    h.getRange('E2:E' + Math.max(h.getMaxRows(), 500)).setDataValidation(yesNo);  // active
    d.getRange('B2:B' + Math.max(d.getMaxRows(), 2000)).setDataValidation(monthDv); // month
    d.getRange('D2:D' + Math.max(d.getMaxRows(), 2000)).setDataValidation(yesNo);  // done
  } catch (e) {
    // la validación es una comodidad; si falla no debe romper la instalación
  }
}

// ============================================================================
//  1b. PÁGINA NUEVA:  hoja "لوحة التحكم"
// ============================================================================

/**
 * Crea (o reconstruye) la hoja «لوحة التحكم» con resúmenes y fórmulas vivas.
 * Es la "صفحة جديدة" que se abre من el menú del Sheet.
 * @return {GoogleAppsScript.Spreadsheet.Sheet}
 */
function buildDashboard_() {
  var ss = getSS_();
  var dash = getSheet_(SH.DASH);
  var habits = readHabits_();
  var checks = readAllChecks_();
  var totalChecks = Object.keys(checks).length;

  dash.clear();

  // --- Título ---
  dash.getRange('A1').setValue('📊 لوحة تحكم متتبع العادات ' + ss.getName())
    .setFontSize(18).setFontWeight('bold');
  dash.getRange('A2').setValue('آخر تحديث: ' + nowIso_());
  dash.getRange('A1:F1').merge();   // merge() pertenece a Range, no a Sheet

  // --- بطاقات الملخص ---
  var yNow = new Date().getFullYear();
  var isLeap = (yNow % 4 === 0 && yNow % 100 !== 0) || yNow % 400 === 0;
  var daysInYear = isLeap ? 366 : 365;
  var totalSlots = habits.length * daysInYear;
  dash.getRange('A4').setValue('عدد العادات');
  dash.getRange('B4').setValue(habits.length);
  dash.getRange('A5').setValue('إجمالي العلامات ✓');
  dash.getRange('B5').setValue(totalChecks);
  dash.getRange('A6').setValue('نسبة الإنجاز الكلية');
  dash.getRange('B6').setValue(
    totalSlots ? Math.round(totalChecks / totalSlots * 100) / 100 : 0)
    .setNumberFormat('0.00%');

  // --- جدول per-habit con fórmulas COUNTIFS sobre Daily ---
  var head = ['العادة', 'الأيقونة', 'المعرّف', 'عدد الأيام ✓', 'هدف السنة', 'النسبة', 'أفضل سلسلة'];
  dash.getRange(8, 1, 1, head.length).setValues([head]);

  var rows = [];
  for (var i = 0; i < habits.length; i++) {
    rows.push([
      habits[i].name,
      habits[i].icon,
      habits[i].id,
      0,          // placeholder -> se reemplaza por fórmula
      daysInYear,
      0,          // placeholder -> se reemplaza por fórmula
      bestStreak_(habits[i].id, checks, yNow)   // mejor racha (valor real)
    ]);
  }
  if (rows.length) dash.getRange(9, 1, rows.length, 7).setValues(rows);

  // Fórmulas: cuentan TRUE en la tabla Daily para cada habit.
  var dailyRef = "'" + SH.DAILY + "'!";
  for (var r = 0; r < habits.length; r++) {
    var row = 9 + r;
    var idCell = '$C' + row;
    dash.getRange(row, 4).setFormula(
      '=COUNTIFS(' + dailyRef + '$A$2:$A$20000,' + idCell + ',' +
      dailyRef + '$D$2:$D$20000,TRUE)');
    dash.getRange(row, 6).setFormula('=IF($E' + row + '=0,0,$D' + row + '/$E' + row + ')')
      .setNumberFormat('0.0%');
  }

  // --- Guía de escritura manual ---
  var guideRow = 10 + habits.length;
  dash.getRange(guideRow, 1).setValue('✍️ كيف تكتب في هذه الجداول ويستوردها الموقع')
    .setFontWeight('bold').setFontSize(13);
  var guide = [
    '١) جدول Habits: اكتب اسم العادة في العمود name فقط (العمود id اختياري — لو تركته فارغًا هيتولّد تلقائيًا).',
    '٢) عمود active: TRUE للعادة المفعّلة، FALSE لإيقافها.',
    '٣) جدول Daily: اكتب اسم العادة (أو الـ id) في habitId، ورقم الشهر في month (0=يناير … 11=ديسمبر)، واليوم في day.',
    '٤) عمود done: TRUE أو ✓ (أو نعم / 1 / X) لتسجيل تنفيذ العادة.',
    '٥) بعد الكتابة: افتح الموقع واضغط «⬇️ استيراد من Google Sheets» (أو استورد من Excel بالنسخ واللصق).',
    '٦) تعديلاتك في الـ Sheet هي المصدر الحقيقي — يتم الاستيراد تلقائيًا عند فتح الموقع.',
    '',
    'الرابط المباشر للموقع: habit-tracker.html#den'
  ];
  dash.getRange(guideRow + 1, 1, guide.length, 1).setValues(guide.map(function (g) { return [g]; }));

  // --- Formato ---
  var headRange = dash.getRange(8, 1, 1, head.length);
  headRange.setFontWeight('bold')
    .setBackground('#4f6ef7')
    .setFontColor('#ffffff')
    .setVerticalAlignment('middle');
  dash.setFrozenRows(0);
  dash.setColumnWidth(1, 240);
  dash.setColumnWidth(2, 60);
  dash.setColumnWidth(3, 110);
  dash.setColumnWidth(4, 110);
  dash.setColumnWidth(5, 90);
  dash.setColumnWidth(6, 90);
  dash.getRange('A4:A6').setFontWeight('bold');
  dash.getRange(guideRow + 1, 1, guide.length, 1).setWrap(true);

  // Coloca la hoja al inicio para que sea la "página" principal.
  try {
    ss.setActiveSheet(dash);
    ss.moveActiveSheet(1);
  } catch (e) { /* no crítico */ }

  return dash;
}

/** Abre la hoja «لوحة التحكم» (من el menú del Sheet). */
function showDashboard() {
  var dash = buildDashboard_();
  var ss = getSS_();
  ss.setActiveSheet(dash);
  dash.setActiveSelection('A1');
}

/** Asegura que la fila 1 tenga exactamente esas cabeceras. */
function ensureHeaders_(sheet, headers) {
  var lastCol = Math.max(sheet.getLastColumn(), headers.length);
  var current = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var ok = headers.every(function (h, i) { return current[i] === h; });
  if (!ok) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  sheet.setFrozenRows(1);
}

/** Aplica formato: fondo de cabecera, negrita, ancho de columnas. */
function formatSheet_(sheet, widths) {
  var head = sheet.getRange(1, 1, 1, widths.length);
  head.setFontWeight('bold')
      .setBackground('#4f6ef7')
      .setFontColor('#ffffff')
      .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 28);
  for (var i = 0; i < widths.length; i++) {
    sheet.setColumnWidth(i + 1, widths[i]);
  }
}

/** Inserta las 7 hábitos iniciales si la tabla está vacía. */
function seedHabits_(sheet) {
  var defaults = [
    ['h1', 'استيقاظ 5:00', '⏰', 1, 'TRUE', nowIso_()],
    ['h2', 'دوش بارد', '🚿', 2, 'TRUE', nowIso_()],
    ['h3', 'صلاة 5 مرات', '🕌', 3, 'TRUE', nowIso_()],
    ['h4', 'قرآن 5 صفحات', '📖', 4, 'TRUE', nowIso_()],
    ['h5', 'جيم ساعة', '🏋️', 5, 'TRUE', nowIso_()],
    ['h6', 'قراءة 10 صفحات', '📚', 6, 'TRUE', nowIso_()],
    ['h7', 'العمل على المشروع', '💻', 7, 'TRUE', nowIso_()]
  ];
  sheet.getRange(2, 1, defaults.length, 6).setValues(defaults);
}

/** Escribe (o actualiza) una clave en la tabla Meta. */
function setMeta_(key, value) {
  var m = getSheet_(SH.META);
  var values = m.getRange(1, 1, m.getMaxRows(), 2).getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === key) {
      m.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  m.appendRow([key, value]);
}

// ============================================================================
//  2. API — doGet (leer)  &  doPost (escribir)
// ============================================================================

/**
 *doGet: punto de entrada para lecturas.
 *  ?action=getAll              -> { habits, checks, meta }
 *  ?action=getHabits           -> { habits }
 *  ?action=getMonth&month=8    -> { month, checks }
 *  ?action=info                -> { sheetId, sheetTitle, counts }
 *  ?action=setup               -> ejecuta setupSheets()
 */
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || 'getAll';
    switch (action) {
      case 'setup':
        var msg = setupSheets();
        return json_({ ok: true, message: msg, info: getInfo_() });
      case 'getHabits':
        return json_({ ok: true, habits: readHabits_() });
      case 'getMonth': {
        var month = parseInt((e.parameter && e.parameter.month) || '0', 10);
        return json_({ ok: true, month: month, checks: readMonth_(month) });
      }
      case 'info':
        return json_({ ok: true, info: getInfo_() });
      default:
        return json_({ ok: true, habits: readHabits_(), checks: readAllChecks_(), meta: readMeta_(), info: getInfo_() });
    }
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

/**
 * doPost: punto de entrada para escrituras Y lecturas.
 *
 * Se aceptan lecturas por POST a propósito: una petición POST con
 * "Content-Type: text/plain" es una "simple request" que NO dispara
 * preflight CORS, así que funciona de forma fiable desde el navegador
 * (incluido desde file://), mientras que GET depende de la redirección
 * 302 de Apps Script.
 *
 * Body JSON: { action, habits?, checks?, month? }
 *   action=saveAll     -> guarda hábitos + marcas (sincronización completa)
 *   action=saveHabits  -> guarda la lista de hábitos
 *   action=saveChecks  -> guarda las marcas (✓/✗)
 *   action=clearChecks -> borra todas las marcas
 *   action=getAll      -> devuelve hábitos + marcas + meta   (lectura)
 *   action=getMonth    -> devuelve las marcas de un mes      (lectura)
 *   action=info        -> información del spreadsheet        (lectura)
 *   action=setup       -> ejecuta setupSheets()             (escritura)
 *   action=import      -> lee todo + resumen de lo escrito  (lectura)
 *   action=dashboard   -> (re)construye la hoja "لوحة التحكم"
 */
function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var action = body.action || 'saveAll';

    /* ---------- lecturas (por POST, más fiable que GET) ---------- */
    if (action === 'getAll') {
      return json_({
        ok: true,
        habits: readHabits_(),
        checks: readAllChecks_(),
        meta: readMeta_(),
        info: getInfo_()
      });
    }
    if (action === 'getMonth') {
      var rm = parseInt(body.month || 0, 10);
      return json_({ ok: true, month: rm, checks: readMonth_(rm) });
    }
    if (action === 'info') {
      return json_({ ok: true, info: getInfo_() });
    }
    if (action === 'setup') {
      var setupMsg = setupSheets();
      return json_({ ok: true, message: setupMsg, info: getInfo_() });
    }
    if (action === 'dashboard') {
      buildDashboard_();
      return json_({ ok: true, dashboard: true, info: getInfo_() });
    }
    /**
     * import: نفس getAll لكن يرجع أيضًا ملخصًا عن المزامنة،
     * عشان الواجهة تقدر تقول للمستخدم "اتجابت عندي 3 عادات و 12 علامة".
     */
    if (action === 'import') {
      var ih = readHabits_();
      var ic = readAllChecks_();
      return json_({
        ok: true,
        habits: ih,
        checks: ic,
        meta: readMeta_(),
        info: getInfo_(),
        summary: {
          habits: ih.length,
          checks: Object.keys(ic).length,
          daysWritten: countDays_(ic),
          serverDate: todayStr_()
        }
      });
    }

    /* ---------- escrituras ---------- */
    if (action === 'saveHabits') {
      return json_({ ok: true, saved: 'habits', count: saveHabits_(body.habits || []) });
    }

    if (action === 'saveChecks') {
      return json_({ ok: true, saved: 'checks', count: saveChecks_(body.checks || {}) });
    }

    if (action === 'clearChecks') {
      clearChecks_();
      return json_({ ok: true, cleared: true });
    }

    // saveAll (por defecto)
    var nH = 0, nC = 0;
    if (body.habits) nH = saveHabits_(body.habits);
    if (body.checks) nC = saveChecks_(body.checks);
    return json_({ ok: true, saved: 'all', habits: nH, checks: nC, at: nowIso_() });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

// ============================================================================
//  3. LECTURA  (tolerante a la escritura manual: el Sheet es una BD de verdad)
// ============================================================================

/** Convierte un texto en un id seguro: sin espacios ni acentos. */
function slugify_(txt) {
  return String(txt === null || txt === undefined ? '' : txt)
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0640]/g, '')   // quitar el tashkeel árabe
    .replace(/[^\p{L}\p{N}]+/gu, '-')        // todo lo no alfanumérico -> guion
    .replace(/^-+|-+$/g, '')
    .substring(0, 40);
}

/**
 * Interpreta un valor como "marcado".
 * Acepta lo que una persona escribiría a mano: ✓ / نعم / TRUE / 1 / X / تم
 */
function isTrue_(v) {
  var t = String(v === null || v === undefined ? '' : v).trim().toLowerCase();
  if (t === '') return false;
  return ['true', '1', 'yes', 'y', 'x', '✓', '✔', '☑', 'نعم', 'صح', 'تم', 'ok', 'done'].indexOf(t) !== -1;
}

/** Interpreta un valor como "مفعّلة" (por defecto sí, salvo que diga FALSE/لا). */
function isActive_(v) {
  var t = String(v === null || v === undefined ? '' : v).trim().toLowerCase();
  if (t === '') return true;                                    // vacío = مفعّلة
  if (['false', '0', 'no', 'n', '✗', 'لا', 'off'].indexOf(t) !== -1) return false;
  return true;
}

var MONTH_ALIASES_ = {
  'يناير': 0, 'كانون الثاني': 0, 'jan': 0, 'january': 0,
  'فبراير': 1, 'شباط': 1, 'feb': 1, 'february': 1,
  'مارس': 2, 'اذار': 2, 'mar': 2, 'march': 2,
  'ابريل': 3, 'أبريل': 3, 'apr': 3, 'april': 3,
  'مايو': 4, 'mai': 4, 'may': 4,
  'يونيو': 5, 'يونية': 5, 'jun': 5, 'june': 5,
  'يوليو': 6, 'يوليه': 6, 'jul': 6, 'july': 6,
  'اغسطس': 7, 'أغسطس': 7, 'aug': 7, 'august': 7,
  'سبتمبر': 8, 'sept': 8, 'september': 8, 'sep': 8,
  'اكتوبر': 9, 'أكتوبر': 9, 'oct': 9, 'october': 9,
  'نوفمبر': 10, 'nov': 10, 'november': 10,
  'ديسمبر': 11, 'dec': 11, 'december': 11
};

/**
 * Normaliza el mes a 0..11.
 *
 * Convention: 0 = يناير … 11 = ديسمبر (نفس ترتيب الموقع، وهو اللي بيكتبه الموقع نفسه).
 * Mistake:    لو كتبت 12 معناها ديسمبر.
 * كما يقبل اسم الشهر بالعربية أو بالإنجليزية.
 */
function normMonth_(v) {
  if (v === null || v === undefined || v === '') return NaN;
  if (typeof v === 'number' || /^-?\d+(\.\d+)?$/.test(String(v).trim())) {
    var n = Math.floor(Number(v));
    if (n >= 0 && n <= 11) return n;   // 0..11 هي العينة القياسية
    if (n === 12) return 11;           // 12 = ديسمبر (خطأ شائع)
    return NaN;
  }
  var key = String(v).trim().toLowerCase().replace(/[\u064B-\u0652\u0640]/g, '');
  if (MONTH_ALIASES_.hasOwnProperty(key)) return MONTH_ALIASES_[key];
  return NaN;
}

/** Normaliza el día a 1..31 (o NaN si no es válido). */
function normDay_(v) {
  var d = Math.floor(Number(v));
  return (isNaN(d) || d < 1 || d > 31) ? NaN : d;
}

/**
 * Lee la tabla Habits -> array de {id,name,icon,sort,active}.
 * Tolera filas escritas a mano: si no hay id pero sí hay nombre, se genera uno.
 */
function readHabits_() {
  var s = getSheet_(SH.HABITS);
  if (s.getLastRow() < 2) return [];
  var rows = s.getRange(2, 1, s.getLastRow() - 1, 6).getValues();
  var out = [], used = {};

  rows.forEach(function (r, i) {
    var idRaw = String(r[0] === null || r[0] === undefined ? '' : r[0]).trim();
    var name = String(r[1] === null || r[1] === undefined ? '' : r[1]).trim();
    if (!idRaw && !name) return;                 // fila vacía -> se ignora

    var id = idRaw || slugify_(name);            // id escrito, o generado del nombre
    if (!id) return;                             // sin id y sin nombre usable

    if (used[id]) {                              // evitar ids duplicados
      var k = 2;
      while (used[id + '-' + k]) k++;
      id = id + '-' + k;
    }
    used[id] = true;

    var rawSort = r[3];
    var sort = (rawSort === '' || rawSort === null || rawSort === undefined || isNaN(Number(rawSort)))
      ? i                                       // sin sort -> ترتيب الصف
      : Number(rawSort);

    var rawIcon = r[2];
    out.push({
      id: id,
      name: name || id,
      icon: String(rawIcon === null || rawIcon === undefined || rawIcon === '' ? '🎯' : rawIcon).trim(),
      sort: sort,
      active: isActive_(r[4])
    });
  });

  out.sort(function (a, b) { return a.sort - b.sort; });
  return out;
}

/**
 * Mapa de resolución para la tabla Daily: acepta el id O el nombre de la habit.
 *   { "h1": "h1", "hábito de lectura": "h1" }
 */
function habitIdMap_() {
  var map = {};
  readHabits_().forEach(function (h) {
    map[h.id] = h.id;
    if (h.name) {
      map[h.name] = h.id;
      map[h.name.toLowerCase()] = h.id;
    }
  });
  return map;
}

/** Resuelve id o nombre de habit -> id (o '' si no existe). */
function resolveHabit_(map, v) {
  var raw = String(v === null || v === undefined ? '' : v).trim();
  if (!raw) return '';
  if (map[raw] !== undefined) return map[raw];
  var low = raw.toLowerCase();
  if (map[low] !== undefined) return map[low];
  var slug = slugify_(raw);
  if (map[slug] !== undefined) return map[slug];
  return '';
}

/** Convierte filas de la tabla Daily -> objeto { "habitId|m|d": 1 }. */
function parseCheckRows_(rows) {
  var map = habitIdMap_();
  var out = {};
  rows.forEach(function (r) {
    var id = resolveHabit_(map, r[0]);
    if (!id) return;                              // habit desconocida -> se ignora
    var m = normMonth_(r[1]);
    var d = normDay_(r[2]);
    if (isNaN(m) || isNaN(d)) return;             // mes/día inválido -> se ignora
    if (isTrue_(r[3])) out[id + '|' + m + '|' + d] = 1;
  });
  return out;
}

/** Lee TODAS las marcas -> objeto { "habitId|m|d": 1 }. */
function readAllChecks_() {
  var s = getSheet_(SH.DAILY);
  if (s.getLastRow() < 2) return {};
  return parseCheckRows_(s.getRange(2, 1, s.getLastRow() - 1, 4).getValues());
}

/** Lee las marcas de un mes -> objeto { "habitId|m|d": 1 }. */
function readMonth_(month) {
  var s = getSheet_(SH.DAILY);
  var m = normMonth_(month);
  if (s.getLastRow() < 2 || isNaN(m)) return {};
  var rows = s.getRange(2, 1, s.getLastRow() - 1, 4).getValues();
  return parseCheckRows_(rows.filter(function (r) { return normMonth_(r[1]) === m; }));
}

/** Cuenta كم يومًا مختلفًا فيه علامات (لعرض "يومان من 30"). */
function countDays_(checks) {
  var days = {};
  Object.keys(checks).forEach(function (k) {
    var p = k.split('|');            // habitId|month|day
    if (p.length === 3) days[p[1] + '|' + p[2]] = 1;
  });
  return Object.keys(days).length;
}

/**
 * Mejor racha consecutiva (días seguidos) de una hábito.
 * Cuenta días reales del calendario, así una racha que cruza de fin de mes
 * a inicio del siguiente sigue siendo una sola racha.
 */
function bestStreak_(habitId, checks, year) {
  var times = [];
  Object.keys(checks || {}).forEach(function (k) {
    if (checks[k] !== 1) return;
    var p = String(k).split('|');
    if (p[0] !== habitId) return;
    var m = Number(p[1]), d = Number(p[2]);
    if (!(m >= 0 && m <= 11) || !(d >= 1 && d <= 31)) return;
    times.push(new Date(year, m, d).getTime());
  });
  if (!times.length) return 0;
  times.sort(function (a, b) { return a - b; });
  var best = 1, run = 1;
  for (var i = 1; i < times.length; i++) {
    var diff = Math.round((times[i] - times[i - 1]) / 86400000);
    if (diff === 1) { run++; if (run > best) best = run; }
    else if (diff > 1) { run = 1; }
  }
  return best;
}

/** Lee la tabla Meta -> objeto. */
function readMeta_() {
  var s = getSheet_(SH.META);
  var out = {};
  if (s.getLastRow() < 2) return out;
  var rows = s.getRange(2, 1, s.getLastRow() - 1, 2).getValues();
  rows.forEach(function (r) { if (r[0]) out[String(r[0])] = r[1]; });
  return out;
}

/** Info del spreadsheet + conteo de filas. */
function getInfo_() {
  var ss = getSS_();
  var h = getSheet_(SH.HABITS);
  var d = getSheet_(SH.DAILY);
  return {
    sheetId: ss.getId(),
    sheetTitle: ss.getName(),
    url: ss.getUrl(),
    habits: Math.max(0, h.getLastRow() - 1),
    checks: Math.max(0, d.getLastRow() - 1),
    schemaVersion: SCHEMA_VERSION,
    serverDate: todayStr_()
  };
}

// ============================================================================
//  4. ESCRITURA
// ============================================================================

/**
 * Guarda la lista de hábitos (sobrescribe la tabla Habits).
 * @param {Array<{id,name,icon,sort,active}>} habits
 * @return {number} cantidad guardada
 */
function saveHabits_(habits) {
  var s = getSheet_(SH.HABITS);
  // limpia datos previos (deja la cabecera)
  if (s.getLastRow() > 1) s.getRange(2, 1, s.getLastRow() - 1, 6).clearContent();
  if (!habits.length) return 0;

  var rows = habits.map(function (h, i) {
    return [
      String(h.id),
      String(h.name || ''),
      String(h.icon || '🎯'),
      parseInt(h.sort != null ? h.sort : i + 1, 10),
      h.active === false ? 'FALSE' : 'TRUE',
      nowIso_()
    ];
  });
  s.getRange(2, 1, rows.length, 6).setValues(rows);
  return rows.length;
}

/**
 * Guarda las marcas. Las marcas vienen como objeto { "habitId|m|d": 1 }.
 * Rescribe la tabla Daily (deja solo las marcadas).
 * @param {Object} checks
 * @return {number} cantidad guardada
 */
function saveChecks_(checks) {
  var s = getSheet_(SH.DAILY);
  if (s.getLastRow() > 1) s.getRange(2, 1, s.getLastRow() - 1, 5).clearContent();

  var rows = [];
  var keys = Object.keys(checks || {});
  var ts = nowIso_();
  keys.forEach(function (k) {
    if (!checks[k]) return;                       // solo las marcadas (=1)
    var parts = k.split('|');
    if (parts.length !== 3) return;
    rows.push([parts[0], parseInt(parts[1], 10), parseInt(parts[2], 10), 'TRUE', ts]);
  });
  if (!rows.length) return 0;

  // setValues tiene límite de celdas; escribimos en bloques si es enorme
  var CHUNK = 20000;
  for (var i = 0; i < rows.length; i += CHUNK) {
    var slice = rows.slice(i, i + CHUNK);
    s.getRange(2 + i, 1, slice.length, 5).setValues(slice);
  }
  return rows.length;
}

/** Borra todas las marcas. */
function clearChecks_() {
  var s = getSheet_(SH.DAILY);
  if (s.getLastRow() > 1) s.getRange(2, 1, s.getLastRow() - 1, 5).clearContent();
}

// ============================================================================
//  5. MENÚ DENTRO DEL SPREADSHEET
// ============================================================================

/** Agrega un menú personalizado al Sheet (se ejecuta al abrir el archivo). */
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('⚙️ متتبع العادات')
      .addItem('📊 فتح لوحة التحكم', 'showDashboard')
      .addItem('🛠 تهيئة / إصلاح الجداول', 'setupSheets')
      .addItem('ℹ️ عرض معرّف السبيتش شيت', 'showSpreadsheetId')
      .addItem('📊 تقرير سريع', 'quickReport')
      .addItem('🗑 مسح كل العلامات', 'clearChecksPrompt')
      .addToUi();
  } catch (e) {
    // si se ejecuta como Web App no hay UI; no romper
  }
}

/** Muestra el ID del Spreadsheet (para pegarlo en la web). */
function showSpreadsheetId() {
  var ss = getSS_();
  var ui = SpreadsheetApp.getUi();
  var box = [
    '🆔 Spreadsheet ID:',
    ss.getId(),
    '',
    '🔗 URL:',
    ss.getUrl(),
    '',
    'Copia el ID y pégalo en la web (campo "Google Sheet ID").'
  ].join('\n');
  ui.alert('معرّف السبيتش شيت', box, ui.ButtonSet.OK);
}

/** Muestra un reporte rápido en un diálogo. */
function quickReport() {
  var habits = readHabits_();
  var checks = readAllChecks_();
  var total = Object.keys(checks).length;
  var daysInYear = 365;
  var lines = ['📊 تقرير سريع', ''];
  lines.push('عدد العادات: ' + habits.length);
  lines.push('إجمالي العلامات ✓: ' + total);
  if (habits.length) {
    lines.push('هدف السنة لكل عادة: ' + daysInYear);
    lines.push('نسبة الإنجاز الكلية: ' +
      Math.round(total / (habits.length * daysInYear) * 100) + '%');
    lines.push('');
    lines.push('أفضل عادة: ' + bestHabit_(habits, checks));
  }
  SpreadsheetApp.getUi().alert('تقرير متتبع العادات', lines.join('\n'),
    SpreadsheetApp.getUi().ButtonSet.OK);
}

function bestHabit_(habits, checks) {
  var best = null, bestN = -1;
  habits.forEach(function (h) {
    var n = 0;
    Object.keys(checks).forEach(function (k) {
      if (k.split('|')[0] === h.id) n++;
    });
    if (n > bestN) { bestN = n; best = h; }
  });
  return best ? best.icon + ' ' + best.name + ' (' + bestN + ' يوم)' : '—';
}

/** Pide confirmación y borra las marcas. */
function clearChecksPrompt() {
  var ui = SpreadsheetApp.getUi();
  var res = ui.alert('⚠️ مسح كل العلامات',
    'سيتم مسح جميع علامات (✓) من tabla Daily. هل تريد المتابعة؟',
    ui.ButtonSet.YES_NO);
  if (res === ui.ButtonSet.YES) {
    clearChecks_();
    ui.alert('✅ تم المسح', 'تم مسح جميع العلامات.', ui.ButtonSet.OK);
  }
}

// ============================================================================
//  6. PRUEBA RÁPIDA (ejecuta desde el editor para ver un log)
// ============================================================================

/** Ejecuta el setup y escribe un log en el Logger. Útil para probar. */
function testSetup() {
  var msg = setupSheets();
  Logger.log(msg);
  var info = getInfo_();
  Logger.log('Info: ' + JSON.stringify(info, null, 2));
  return msg;
}
