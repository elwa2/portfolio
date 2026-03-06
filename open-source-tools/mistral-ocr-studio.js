const hasPdfLib = typeof window.pdfjsLib !== "undefined";
const hasMarked = typeof window.marked !== "undefined";
if (hasPdfLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

const state = {
  apiKey: localStorage.getItem("mistral_api_key") || "",
  currentFile: null,
  pdfDoc: null,
  currentPage: 1,
  totalPages: 1,
  scale: 1,
  recentScans: JSON.parse(localStorage.getItem("recent_scans") || "[]"),
};

const $ = (id) => document.getElementById(id);
let toastTimer = null;

function showToast(message, isError) {
  const t = $("toast");
  t.textContent = message;
  t.style.background = isError ? "#dc2626" : "var(--ocr-primary)";
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2000);
}

function logDebug(message) {
  const box = $("debugLog");
  if (!box) return;
  box.style.display = "block";
  box.textContent = message;
}

function updateApiStatus() {
  $("apiStatus").textContent = state.apiKey ? "API Key: مضبوط" : "API Key: غير مضبوط";
}

function openApiModal() {
  $("apiKeyInput").value = state.apiKey;
  $("apiModal").classList.add("show");
}

function closeApiModal() {
  $("apiModal").classList.remove("show");
}

function saveApiKey() {
  const key = $("apiKeyInput").value.trim();
  if (!key) {
    showToast("اكتب مفتاح API صحيح", true);
    return;
  }
  state.apiKey = key;
  localStorage.setItem("mistral_api_key", key);
  updateApiStatus();
  closeApiModal();
  if ($("apiKeyInline")) {
    $("apiKeyInline").value = key;
  }
  showToast("تم حفظ المفتاح");
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function handleFile(file) {
  const valid = ["application/pdf", "image/png", "image/jpeg", "image/webp", "image/bmp", "image/tiff"];
  if (!valid.includes(file.type)) {
    return showToast("نوع الملف غير مدعوم. استخدم PDF أو صور", true);
  }
  if (file.size > 50 * 1024 * 1024) {
    return showToast("حجم الملف أكبر من 50MB", true);
  }
  if (!state.apiKey) {
    showToast("اضبط API Key أولاً", true);
    return openApiModal();
  }
  state.currentFile = file;
  const input = $("fileInput");
  if (input) input.value = "";
  processOCR(file);
}

async function processOCR(file) {
  const proc = $("processing");
  const res = $("results");
  const bar = $("progressFill");

  proc.classList.add("active");
  res.classList.remove("active");
  bar.className = "progress-fill";
  bar.style.width = "";

  try {
    const base64 = await fileToBase64(file);
    const isPdf = file.type === "application/pdf";
    const doc = isPdf ? { type: "document_url", document_url: base64 } : { type: "image_url", image_url: base64 };

    const response = await fetch("https://api.mistral.ai/v1/ocr", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${state.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral-ocr-latest",
        document: doc,
        include_image_base64: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`API error: ${response.status} ${errText || ""}`.trim());
    }

    const data = await response.json();
    bar.className = "progress-fill done";

    await renderPreview(file);
    showResults(data);
    saveToRecent(file.name, data);
    showToast("تمت المعالجة بنجاح");
  } catch (e) {
    showToast(e.message || "حدث خطأ أثناء OCR", true);
    logDebug(e.message || String(e));
  } finally {
    setTimeout(() => proc.classList.remove("active"), 1200);
  }
}

async function renderPreview(file) {
  const container = $("previewContainer");
  container.innerHTML = "";
  state.currentPage = 1;
  state.scale = 1;

  if (file.type === "application/pdf") {
    if (!hasPdfLib) {
      showToast("مكتبة PDF.js لم تُحمّل. تأكد من الاتصال بالإنترنت.", true);
      return;
    }
    const buf = await file.arrayBuffer();
    state.pdfDoc = await pdfjsLib.getDocument({ data: buf }).promise;
    state.totalPages = state.pdfDoc.numPages;
    await renderPdfPage(state.currentPage);
  } else {
    state.pdfDoc = null;
    state.totalPages = 1;
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.alt = file.name;
    container.appendChild(img);
  }
  updatePageCounter();
}

async function renderPdfPage(num) {
  const container = $("previewContainer");
  container.innerHTML = "";
  const page = await state.pdfDoc.getPage(num);
  const vp = page.getViewport({ scale: state.scale * 1.5 });
  const canvas = document.createElement("canvas");
  canvas.width = vp.width;
  canvas.height = vp.height;
  await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
  container.appendChild(canvas);
}

function updatePageCounter() {
  $("pageCounter").textContent = `${state.currentPage} / ${state.totalPages}`;
}

function prevPage() {
  if (!state.pdfDoc || state.currentPage <= 1) return;
  state.currentPage--;
  renderPdfPage(state.currentPage);
  updatePageCounter();
}

function nextPage() {
  if (!state.pdfDoc || state.currentPage >= state.totalPages) return;
  state.currentPage++;
  renderPdfPage(state.currentPage);
  updatePageCounter();
}

function zoomPreview() {
  state.scale = state.scale >= 2 ? 0.75 : state.scale + 0.25;
  if (state.pdfDoc) {
    renderPdfPage(state.currentPage);
  } else {
    const img = document.querySelector("#previewContainer img");
    if (img) img.style.transform = `scale(${state.scale})`;
  }
}

function showResults(data) {
  const editor = $("editor");
  const section = $("results");
  let md = "";
  if (data.pages && data.pages.length > 0) {
    md = data.pages.map((p) => p.markdown || "").join("\n\n---\n\n");
  }
  if (hasMarked) {
    editor.innerHTML = marked.parse(md);
  } else {
    editor.textContent = md;
  }
  section.classList.add("active");
  updateWordCount();
}

function updateWordCount() {
  const text = $("editor").innerText || "";
  const stripped = text.trim();
  const count = stripped ? stripped.split(/\s+/).length : 0;
  $("wordCount").textContent = `${count} كلمة`;
}

function downloadText() {
  const text = $("editor").innerText || "";
  const name = (state.currentFile ? state.currentFile.name.replace(/\.[^.]+$/, "") : "ocr-result") + ".txt";
  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

function printEditor() {
  const content = $("editor").innerHTML;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(
    `<html><head><title>Print</title><style>body{font-family:Cairo,sans-serif;padding:40px;line-height:1.7;color:#1a1a2e}table{border-collapse:collapse;width:100%}td,th{border:1px solid #e0e4e8;padding:8px}</style></head><body>${content}</body></html>`
  );
  w.document.close();
  w.print();
}

function copyEditorText() {
  const text = $("editor").innerText || "";
  if (!text.trim()) return showToast("لا يوجد نص للنسخ", true);
  navigator.clipboard.writeText(text).then(
    () => showToast("تم نسخ النص"),
    () => showToast("تعذر النسخ", true)
  );
}

function saveToRecent(name, data) {
  const preview = data.pages && data.pages[0] ? data.pages[0].markdown.substring(0, 100) : "";
  const scan = { name, date: new Date().toLocaleDateString(), preview, pages: data.pages ? data.pages.length : 0 };
  state.recentScans.unshift(scan);
  if (state.recentScans.length > 10) state.recentScans.pop();
  localStorage.setItem("recent_scans", JSON.stringify(state.recentScans));
  renderRecentScans();
}

function renderRecentScans() {
  const list = $("recentList");
  if (!state.recentScans.length) {
    list.innerHTML = "";
    return;
  }
  list.innerHTML = state.recentScans
    .map(
      (s) =>
        `<div class="recent-item" title="${(s.preview || "").replace(/"/g, "&quot;")}"><div class="title">${s.name}</div><div class="meta">${s.date} · ${s.pages} صفحة</div></div>`
    )
    .join("");
}

function bindEvents() {
  $("settingsBtn").addEventListener("click", openApiModal);
  $("cancelApiBtn").addEventListener("click", closeApiModal);
  $("saveApiBtn").addEventListener("click", saveApiKey);

  if ($("saveApiInline")) {
    $("saveApiInline").addEventListener("click", () => {
      const key = $("apiKeyInline").value.trim();
      if (!key) return showToast("اكتب مفتاح API صحيح", true);
      state.apiKey = key;
      localStorage.setItem("mistral_api_key", key);
      updateApiStatus();
      showToast("تم حفظ المفتاح");
    });
  }

  $("apiModal").addEventListener("click", (e) => {
    if (e.target === $("apiModal")) closeApiModal();
  });

  $("uploadZone").addEventListener("click", () => $("fileInput").click());
  $("cameraBtn").addEventListener("click", () => $("cameraInput").click());

  $("fileInput").addEventListener("change", (e) => {
    if (e.target.files.length) handleFile(e.target.files[0]);
  });
  $("cameraInput").addEventListener("change", (e) => {
    if (e.target.files.length) handleFile(e.target.files[0]);
  });

  $("uploadZone").addEventListener("dragover", (e) => {
    e.preventDefault();
    $("uploadZone").classList.add("dragover");
  });
  $("uploadZone").addEventListener("dragleave", () => $("uploadZone").classList.remove("dragover"));
  $("uploadZone").addEventListener("drop", (e) => {
    e.preventDefault();
    $("uploadZone").classList.remove("dragover");
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });

  $("editor").addEventListener("input", updateWordCount);

  document.querySelectorAll("[data-cmd]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.execCommand(btn.dataset.cmd, false, null);
      $("editor").focus();
    });
  });

  $("copyBtn").addEventListener("click", copyEditorText);
  $("downloadBtn").addEventListener("click", downloadText);
  $("printBtn").addEventListener("click", printEditor);

  $("prevPageBtn").addEventListener("click", prevPage);
  $("nextPageBtn").addEventListener("click", nextPage);
  $("zoomBtn").addEventListener("click", zoomPreview);
}

document.addEventListener("DOMContentLoaded", () => {
  updateApiStatus();
  if ($("apiKeyInline")) {
    $("apiKeyInline").value = state.apiKey || "";
  }
  renderRecentScans();
  bindEvents();
  if (!state.apiKey) {
    setTimeout(() => {
      openApiModal();
      showToast("من فضلك أضف مفتاح Mistral API للبدء", true);
    }, 500);
  }
});

window.addEventListener("error", (e) => {
  logDebug(`JS Error: ${e.message}`);
});

window.addEventListener("unhandledrejection", (e) => {
  logDebug(`Promise Error: ${e.reason?.message || e.reason}`);
});
