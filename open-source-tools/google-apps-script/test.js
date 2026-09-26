// STRICT fake Google Apps Script environment.
// Any method not in the real API surface throws, so bugs like
// dash.mergeCells() are caught locally instead of in production.
//
//   node test.js      ->  prints PASS/FAIL for every check
//
// The allow-lists below come from the official reference:
//   Sheet  -> https://developers.google.com/apps-script/reference/spreadsheet/sheet
//   Range  -> https://developers.google.com/apps-script/reference/spreadsheet/range
const fs = require("fs");
const path = require("path");

const CODE = path.join(__dirname, "Code.gs");

const SHEET_METHODS = new Set(["appendRow","clear","clearContent","clearFormat","getActiveRange",
  "getDataRange","getLastColumn","getLastRow","getMaxColumns","getMaxRows","getName","getParent",
  "getRange","getSheetId","getSheetName","insertColumnAfter","insertRowAfter","insertRows",
  "setActiveSelection","setColumnWidth","setFrozenColumns","setFrozenRows","setName","setTabColor",
  "setNotes","sort","setRowHeight","autoResizeColumns","hideSheet","showSheet","isSheetHidden"]);

const RANGE_METHODS = new Set(["setValue","setValues","getValue","getValues","setFormula","getFormula",
  "setFontSize","setFontWeight","setFontColor","setFontFamily","setFontStyle","setFontBold",
  "setBackground","setBackgroundColor","setNumberFormat","setNumberFormats","setWrap",
  "setHorizontalAlignment","setVerticalAlignment","setDataValidation","clearContent","clear",
  "merge","breakApart","getMergedRanges","setNote","setBorder","addBorder","setWrap"]);

function strictProxy(target, allowed, label) {
  return new Proxy(target, {
    get(t, prop) {
      if (prop in t) return t[prop];
      if (typeof prop === "symbol") return undefined;
      if (allowed.has(prop)) {
        return (...args) => {
          if (!t[prop]) throw new Error("stub missing: " + label + "." + prop);
          return t[prop](...args);
        };
      }
      throw new Error("TypeError: " + label + "." + String(prop) + " is not a function  [STRICT MOCK]");
    }
  });
}

function makeRange(sheet, row, col, numRows, numCols) {
  const r = {
    _sheet: sheet,
    getRow: () => row, getColumn: () => col,
    setValue(v) { sheet._set(row, col, v); return r; },
    getValue() { return sheet._get(row, col); },
    setValues(vals) {
      for (let i = 0; i < numRows; i++)
        for (let j = 0; j < numCols; j++)
          sheet._set(row + i, col + j, (vals[i] || [])[j]);
      return r;
    },
    getValues() {
      const out = [];
      for (let i = 0; i < numRows; i++) {
        const line = [];
        for (let j = 0; j < numCols; j++) line.push(sheet._get(row + i, col + j));
        out.push(line);
      }
      return out;
    },
    setFormula(f) { sheet._set(row, col, f); return r; },
    getFormula() { return sheet._get(row, col); },
  };
  ["setFontSize","setFontWeight","setFontColor","setFontFamily","setFontStyle","setFontBold",
   "setBackground","setBackgroundColor","setNumberFormat","setWrap","setHorizontalAlignment",
   "setVerticalAlignment","setDataValidation","merge","breakApart","setNote","setBorder",
   "addBorder","clearContent","clear","setNumberFormats","getMergedRanges"]
  .forEach(m => { r[m] = function () { return r; }; });
  return strictProxy(r, RANGE_METHODS, "Range");
}

function makeSheet(ss, name) {
  const data = new Map();
  const s = {
    _data: data, _ss: ss,
    getName: () => name,
    getSheetName: () => name,
    getSheetId: () => ss._sheets.indexOf(s) + 1,
    getParent: () => ss,
    getMaxRows: () => 1000,
    getMaxColumns: () => 26,
    getLastRow() {
      let max = 0;
      data.forEach((v, k) => { if (v !== "" && v !== null) max = Math.max(max, k.split(",")[0]); });
      return max;
    },
    getLastColumn() {
      let max = 0;
      data.forEach((v, k) => { if (v !== "" && v !== null) max = Math.max(max, Number(k.split(",")[1])); });
      return max;
    },
    _get(rw, cl) { const v = data.get(rw + "," + cl); return v === undefined ? "" : v; },
    _set(rw, cl, v) { data.set(rw + "," + cl, v); },
    getRange(a, b, c, d) {
      if (typeof a === "string") {
        const m = a.match(/^([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/);
        if (!m) throw new Error("Bad A1 notation: " + a);
        const colNum = s => s.split("").reduce((acc, ch) => acc * 26 + (ch.charCodeAt(0) - 64), 0);
        const c1 = colNum(m[1]), r1 = Number(m[2]);
        const c2 = m[3] ? colNum(m[3]) : c1, r2 = m[4] ? Number(m[4]) : r1;
        return makeRange(s, Math.min(r1, r2), Math.min(c1, c2), Math.abs(r2 - r1) + 1, Math.abs(c2 - c1) + 1);
      }
      return makeRange(s, a, b, c || 1, d || 1);
    },
    appendRow(vals) {
      const rw = s.getLastRow() + 1;
      vals.forEach((v, i) => s._set(rw, i + 1, v));
      return s;
    },
    clear() { data.clear(); return s; },
    clearContent() { data.clear(); return s; },
    clearFormat() { return s; },
    setFrozenRows() { return s; },
    setFrozenColumns() { return s; },
    setColumnWidth() { return s; },
    setRowHeight() { return s; },
    setName(n) { s._name = n; return s; },
    setTabColor() { return s; },
    setNotes() { return s; },
    sort() { return s; },
    autoResizeColumns() { return s; },
    setActiveSelection() { return s; },
    insertRowAfter() { return s; },
    insertRows() { return s; },
    insertColumnAfter() { return s; },
    hideSheet() { return s; },
    showSheet() { return s; },
    isSheetHidden: () => false,
    getDataRange() { return makeRange(s, 1, 1, Math.max(s.getLastRow(), 1), Math.max(s.getLastColumn(), 1)); },
    getActiveRange() { return makeRange(s, 1, 1, 1, 1); },
  };
  return strictProxy(s, SHEET_METHODS, "Sheet");
}

function makeSS() {
  const ss = {
    _sheets: [],
    getId: () => "FAKE_SHEET_ID_123",
    getName: () => "HabitTrackerDB",
    getUrl: () => "https://docs.google.com/spreadsheets/d/FAKE/edit",
    getSheets() { return ss._sheets; },
    getSheetByName(n) { return ss._sheets.find(x => x.getName() === n) || null; },
    insertSheet(n) {
      const sh = makeSheet(ss, n);
      ss._sheets.push(sh);
      return sh;
    },
    setActiveSheet(sh) { ss._active = sh; return sh; },
    moveActiveSheet(pos) {
      const i = ss._sheets.indexOf(ss._active);
      if (i > -1) { ss._sheets.splice(i, 1); ss._sheets.splice(pos, 0, ss._active); }
      return ss._active;
    },
  };
  return ss;
}

global.SpreadsheetApp = {
  getActiveSpreadsheet: () => global.__SS,
  openById: () => global.__SS,
  newDataValidation: () => ({
    requireValueInList() { return this; }, setHelpText() { return this; },
    requireCheckbox() { return this; }, build() { return { __dv: true }; }
  }),
  getUi: () => ({ alert() {}, ButtonSet: { OK: "OK", YES_NO: "YES_NO" } }),
  flush: () => {}
};
global.__SS = makeSS();
global.Utilities = { formatDate: d => d.toISOString(), sleep: () => {} };
global.Session = { getScriptTimeZone: () => "Africa/Cairo" };
global.ContentService = { MimeType: { JSON: "json" }, createTextOutput: t => ({ setContent() { return this; }, setMimeType() { return this; }, getContent: () => t }) };
global.Logger = { log: () => {} };

// --- load Code.gs ---
const code = fs.readFileSync(CODE, "utf8");
const fn = new Function(code + "\n; return {" +
  ["getSS_","setupSheets","buildDashboard_","showDashboard","readHabits_","readAllChecks_",
   "readMonth_","countDays_","bestStreak_","parseCheckRows_","normMonth_","isTrue_",
   "doGet","doPost","slugify_","isActive_","habitIdMap_","resolveHabit_","ensureHeaders_",
   "seedHabits_","setMeta_","readMeta_","applyValidations_","nowIso_","json_","onOpen"]
    .map(n => n + ":" + n).join(",") + "};");
const api = fn();

// ================= TESTS =================
let pass = 0, fail = 0;
function ck(name, cond, extra) {
  if (cond) { pass++; console.log("  PASS " + name); }
  else { fail++; console.log("  FAIL " + name + (extra ? "  -> " + extra : "")); }
}

console.log("=== 1. setupSheets() end-to-end (this is what threw mergeCells) ===");
let setupOut = null, setupErr = null;
try { setupOut = api.setupSheets(); } catch (e) { setupErr = e; }
ck("setupSheets_no_crash", !setupErr, setupErr && setupErr.message);
if (setupErr) {
  console.log("\n>>> STOP: " + setupErr.message);
  console.log(">>> stack: " + (setupErr.stack || "").split("\n").slice(1, 4).join("\n"));
  process.exit(1);
}
ck("setup_returns_id", /FAKE_SHEET_ID_123/.test(setupOut), setupOut);
ck("setup_no_dashboard_warning", !/تعذّر بناء/.test(setupOut), setupOut);

const names = global.__SS.getSheets().map(s => s.getName());
console.log("  sheets: " + names.join(", "));
ck("has_habits", names.indexOf("Habits") > -1);
ck("has_daily", names.indexOf("Daily") > -1);
ck("has_meta", names.indexOf("Meta") > -1);
ck("has_dashboard", names.indexOf("لوحة التحكم") > -1);
ck("dashboard_is_first", names[0] === "لوحة التحكم", names.join(","));

const dash = global.__SS.getSheetByName("لوحة التحكم");
ck("dash_title", /لوحة تحكم متتبع العادات/.test(String(dash._get(1, 1))), String(dash._get(1, 1)));
ck("dash_updated", /آخر تحديث/.test(String(dash._get(2, 1))));
ck("dash_habits_count", dash._get(4, 2) === 7, String(dash._get(4, 2)));
ck("dash_header_row8", String(dash._get(8, 1)) === "العادة", String(dash._get(8, 1)));
ck("dash_col_D_is_formula", /^=COUNTIFS/.test(String(dash._get(9, 4))), String(dash._get(9, 4)));
ck("dash_col_F_is_formula", /^=IF/.test(String(dash._get(9, 6))), String(dash._get(9, 6)));
ck("dash_streak_numeric", dash._get(9, 7) === 0, String(dash._get(9, 7)));
ck("dash_goal_365_or_366", [365, 366].indexOf(dash._get(9, 5)) > -1, String(dash._get(9, 5)));
ck("dash_guide_present", /كيف تكتب/.test(String(dash._get(17, 1))), String(dash._get(17, 1)));

console.log("\n=== 2. showDashboard() (menu item) ===");
let sdErr = null;
try { api.showDashboard(); } catch (e) { sdErr = e; }
ck("showDashboard_no_crash", !sdErr, sdErr && sdErr.message);

console.log("\n=== 3. bestStreak_() ===");
ck("streak_none", api.bestStreak_("h1", {}, 2026) === 0);
ck("streak_single", api.bestStreak_("h1", { "h1|8|26": 1 }, 2026) === 1);
ck("streak_3", api.bestStreak_("h1", { "h1|8|1": 1, "h1|8|2": 1, "h1|8|3": 1 }, 2026) === 3);
ck("streak_gap", api.bestStreak_("h1", { "h1|8|1": 1, "h1|8|2": 1, "h1|8|5": 1 }, 2026) === 2);
ck("streak_across_months", api.bestStreak_("h1", { "h1|8|29": 1, "h1|8|30": 1, "h1|9|1": 1 }, 2026) === 3,
   "racha cruza de agosto a septiembre");
ck("streak_across_year", api.bestStreak_("h1", { "h1|11|30": 1, "h1|11|31": 1, "h1|0|1": 1 }, 2026) === 3,
   "racha cruza de diciembre a enero");
ck("streak_rejects_aug31", api.bestStreak_("h1", { "h1|8|30": 1, "h1|8|31": 1, "h1|9|1": 1 }, 2026) === 2,
   "31 de agosto (imposible) se ignora, no desborda a septiembre");
ck("streak_rejects_feb30", api.bestStreak_("h1", { "h1|1|28": 1, "h1|1|30": 1, "h1|2|1": 1 }, 2026) === 2,
   "30 de febrero (imposible) se ignora");
ck("streak_ignores_other_habit",
   api.bestStreak_("h1", { "h1|8|1": 1, "h2|8|2": 1, "h2|8|3": 1 }, 2026) === 1);
ck("streak_unsorted_ok",
   api.bestStreak_("h1", { "h1|8|3": 1, "h1|8|1": 1, "h1|8|2": 1 }, 2026) === 3);
ck("streak_not_done_ignored",
   api.bestStreak_("h1", { "h1|8|1": 0, "h1|8|2": 1 }, 2026) === 1);
// leap-year / year-length correctness (regression: local-vs-UTC mixing)
ck("streak_2026_not_leap", api.bestStreak_("h1", { "h1|8|1": 1, "h1|8|2": 1 }, 2026) === 2);
ck("streak_2024_leap_feb29", api.bestStreak_("h1", { "h1|1|28": 1, "h1|1|29": 1, "h1|2|1": 1 }, 2024) === 3,
   "2024 es bisiesto: 28, 29 feb y 1 mar son 3 días seguidos");
ck("streak_2026_feb28_to_mar1", api.bestStreak_("h1", { "h1|1|28": 1, "h1|2|1": 1 }, 2026) === 2,
   "2026: 28 feb -> 1 mar son consecutivos");
ck("streak_2026_feb29_rejected", api.bestStreak_("h1", { "h1|1|29": 1, "h1|2|1": 1 }, 2026) === 1,
   "2026 no es bisiesto: 29 feb se ignora");
ck("streak_feb_mar_flow_together", api.bestStreak_("h1", (function () {
  var o = {}; for (var m = 0; m < 12; m++) for (var d = 1; d <= 28; d++) o["h1|" + m + "|" + d] = 1; return o;
})(), 2026) === 56,
   "feb 1-28 fluye directo a mar 1-28 (feb 2026 tiene 28 días) = 56");
ck("streak_full_year_2026", api.bestStreak_("h1", (function () {
  var o = {}, dim = [31,28,31,30,31,30,31,31,30,31,30,31];
  for (var m = 0; m < 12; m++) for (var d = 1; d <= dim[m]; d++) o["h1|" + m + "|" + d] = 1;
  return o;
})(), 2026) === 365, "año 2026 completo = 365");
ck("streak_full_year_2024", api.bestStreak_("h1", (function () {
  var o = {}, dim = [31,29,31,30,31,30,31,31,30,31,30,31];
  for (var m = 0; m < 12; m++) for (var d = 1; d <= dim[m]; d++) o["h1|" + m + "|" + d] = 1;
  return o;
})(), 2024) === 366, "año 2024 bisiesto completo = 366");

console.log("\n=== 4. dashboard reflects real data ===");
const daily = global.__SS.getSheetByName("Daily");
daily.appendRow(["h1", 8, 26, "TRUE"]);
daily.appendRow(["h1", 8, 25, "TRUE"]);
daily.appendRow(["h1", 8, 24, "TRUE"]);
api.buildDashboard_();
ck("dash_checks_3", dash._get(5, 2) === 3, String(dash._get(5, 2)));
ck("dash_streak_3", dash._get(9, 7) === 3, String(dash._get(9, 7)));

console.log("\n=== 5. re-running setup is idempotent (no crash, no dup sheets) ===");
let setup2 = null, err2 = null;
try { setup2 = api.setupSheets(); } catch (e) { err2 = e; }
ck("setup2_no_crash", !err2, err2 && err2.message);
ck("setup2_sheet_count_4", global.__SS.getSheets().length === 4,
   String(global.__SS.getSheets().length));

console.log("\n=== 6. read paths still fine ===");
ck("readHabits_7", api.readHabits_().length === 7, String(api.readHabits_().length));
ck("readAllChecks_keys", Object.keys(api.readAllChecks_()).length === 3,
   JSON.stringify(Object.keys(api.readAllChecks_())));
ck("normMonth_12_wraps", api.normMonth_(12) === 11, String(api.normMonth_(12)));
ck("isTrue_yes", api.isTrue_("نعم") === true);
ck("isTrue_blank", api.isTrue_("") === false);

console.log("\n=== 7. doPost / doGet ===");
let postErr = null, postOut = null;
try {
  postOut = api.doPost({ postData: { type: "text/plain", contents: JSON.stringify({ action: "import" }) } });
} catch (e) { postErr = e; }
ck("doPost_import", !postErr, postErr && postErr.message);

console.log("\n" + "=".repeat(46));
console.log("PASS=" + pass + "  FAIL=" + fail);
console.log("=".repeat(46));
process.exit(fail ? 1 : 0);
