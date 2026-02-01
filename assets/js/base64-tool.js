// Base64 Encode/Decode Tool JS
// يدعم النصوص والملفات والصور مع خيارات متقدمة

function encodeBase64(input, urlSafe) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    let binary = '';
    for (let i = 0; i < data.length; i++) binary += String.fromCharCode(data[i]);
    let encoded = btoa(binary);
    if (urlSafe) encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return encoded;
  } catch (e) {
    return 'Error encoding data';
  }
}

function decodeBase64(input, urlSafe) {
  try {
    let str = input;
    if (urlSafe) str = str.replace(/-/g, '+').replace(/_/g, '/');
    // pad with =
    while (str.length % 4) str += '=';
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  } catch (e) {
    return 'Error decoding data';
  }
}

function chunkString(str, length, sep) {
  if (!length) return str;
  const regex = new RegExp('.{1,' + length + '}', 'g');
  return (str.match(regex) || []).join(sep);
}

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024, dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}


// عناصر تبويب النصوص
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const encodeBtn = document.getElementById('encodeBtn');
const decodeBtn = document.getElementById('decodeBtn');
const charset = document.getElementById('charset');
const separator = document.getElementById('separator');
const splitLines = document.getElementById('splitLines');
const urlSafe = document.getElementById('urlSafe');
const liveMode = document.getElementById('liveMode');

// عناصر تبويب الملفات
const fileBtn = document.getElementById('fileBtn');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileEncodeBtn = document.getElementById('fileEncodeBtn');
const fileDecodeBtn = document.getElementById('fileDecodeBtn');
const fileCharset = document.getElementById('fileCharset');
const fileSeparator = document.getElementById('fileSeparator');
const fileSplitLines = document.getElementById('fileSplitLines');
const fileUrlSafe = document.getElementById('fileUrlSafe');
const fileOutputText = document.getElementById('fileOutputText');
const imagePreview = document.getElementById('imagePreview');

let currentFile = null;

function updateImagePreview(base64, file) {
  if (file && file.type && file.type.startsWith('image/')) {
    imagePreview.src = 'data:' + file.type + ';base64,' + base64;
    imagePreview.style.display = 'block';
  } else {
    imagePreview.style.display = 'none';
  }
}

// نصوص
function handleEncode() {
  let text = inputText.value;
  let result = encodeBase64(text, urlSafe.checked);
  if (splitLines.checked) result = chunkString(result, 76, separator.value === 'crlf' ? '\r\n' : '\n');
  outputText.value = result;
}
function handleDecode() {
  let text = inputText.value;
  let result = decodeBase64(text, urlSafe.checked);
  outputText.value = result;
}
encodeBtn.onclick = handleEncode;
decodeBtn.onclick = handleDecode;
inputText.oninput = function() { if (liveMode.checked) handleEncode(); };

// ملفات
fileBtn.onclick = () => fileInput.click();
fileInput.onchange = function(e) {
  const file = e.target.files[0];
  if (!file) return;
  currentFile = file;
  fileInfo.textContent = `${file.name} (${formatBytes(file.size)}) - ${file.type}`;
  fileOutputText.value = '';
  updateImagePreview('', null);
};
fileEncodeBtn.onclick = function() {
  if (!currentFile) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    let base64 = e.target.result.split(',')[1];
    let result = base64;
    if (fileUrlSafe.checked) result = result.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    if (fileSplitLines.checked) result = chunkString(result, 76, fileSeparator.value === 'crlf' ? '\r\n' : '\n');
    fileOutputText.value = result;
    updateImagePreview(base64, currentFile);
  };
  reader.readAsDataURL(currentFile);
};
fileDecodeBtn.onclick = function() {
  // فك تشفير base64 إلى ملف (تنزيل)
  let b64 = fileOutputText.value.trim();
  if (!b64) return;
  let str = b64.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  try {
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: currentFile ? currentFile.type : 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile ? currentFile.name.replace(/\.[^.]+$/, '') + '_decoded' : 'decoded_file';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  } catch (e) {
    alert('Error decoding file!');
  }
};
