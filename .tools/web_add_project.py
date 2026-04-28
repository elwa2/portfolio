#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
web_add_project.py — Portfolio Manager (Web UI)
================================================
Flask-based replacement for the old Tkinter add_project.py tool.
Opens automatically in the browser at http://localhost:5555

Usage:
    python web_add_project.py

Requirements:
    pip install flask playwright pillow beautifulsoup4
    playwright install chromium
"""

import os
import sys
import json
import re
import time
import shutil
import queue
import socket
import threading
import webbrowser
import urllib.request
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

# ── Dependency check ──────────────────────────────────────────────────────────
try:
    from flask import Flask, request, jsonify, Response, stream_with_context
except ImportError:
    print("❌ flask غير مثبت. نفّذ: pip install flask")
    sys.exit(1)

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR  = Path(__file__).parent.parent       # d:/programing/portfolio
TOOLS_DIR = Path(__file__).parent              # d:/programing/portfolio/.tools
JSON_PATH = TOOLS_DIR / "projects.json"
WORKS_HTML = BASE_DIR / "works.html"
PRT_DIR   = BASE_DIR / "assets" / "images" / "prt"
NO_DIR    = PRT_DIR / "n-o"

# ── Flask app ─────────────────────────────────────────────────────────────────
app = Flask(__name__)

# ── Helper functions ──────────────────────────────────────────────────────────

def load_projects():
    if JSON_PATH.exists():
        with open(JSON_PATH, encoding="utf-8") as f:
            return json.load(f)
    return {
        "projects": [],
        "metadata": {
            "created": str(date.today()),
            "version": "1.0",
            "description": "قائمة مشاريع Portfolio"
        }
    }


def save_projects(data):
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_next_image_number():
    nums = [int(f.stem) for f in PRT_DIR.glob("*.jpeg") if f.stem.isdigit()]
    return max(nums, default=0) + 1


def get_next_ba_folder():
    if not NO_DIR.exists():
        return 1
    existing = [int(d.name) for d in NO_DIR.iterdir()
                if d.is_dir() and d.name.isdigit()]
    return max(existing, default=0) + 1


def normalize_url(url: str) -> str:
    url = url.strip().rstrip("/").lower()
    if not url.startswith("http"):
        url = "https://" + url
    return url


def find_existing_project(url: str):
    """Return matching project dict or None."""
    norm = normalize_url(url)
    data = load_projects()
    for p in data["projects"]:
        if normalize_url(p.get("url", "")) == norm:
            return p
    return None


def get_domain(url: str) -> str:
    try:
        parsed = urlparse(url if url.startswith("http") else "https://" + url)
        return parsed.netloc.replace("www.", "")
    except Exception:
        return url


def get_page_title(url: str) -> str:
    try:
        from bs4 import BeautifulSoup
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 Chrome/120.0 Safari/537.36"
            )
        }
        full_url = url if url.startswith("http") else "https://" + url
        req = urllib.request.Request(full_url, headers=headers)
        with urllib.request.urlopen(req, timeout=12) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
        soup = BeautifulSoup(html, "html.parser")
        title_tag = soup.find("title")
        if title_tag and title_tag.text.strip():
            return title_tag.text.strip()[:80]
    except Exception:
        pass
    return get_domain(url)


def take_screenshot(url: str, output_path: Path, emit=None):
    """Take a full-page screenshot with Playwright and save as JPEG."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise RuntimeError("playwright غير مثبت. نفّذ: pip install playwright && playwright install chromium")

    from PIL import Image

    full_url = url if url.startswith("http") else "https://" + url
    tmp_png = str(output_path) + ".tmp.png"

    if emit:
        emit("تشغيل المتصفح المخفي...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            viewport={"width": 1280, "height": 900},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 Chrome/120.0 Safari/537.36"
            ),
        )
        page = ctx.new_page()

        if emit:
            emit(f"جاري تحميل الصفحة...")

        page.goto(full_url, timeout=45000, wait_until="networkidle")
        page.wait_for_timeout(1500)

        if emit:
            emit("تمرير الصفحة لتحميل الصور الكسولة...")

        # Lazy scroll
        total_height = page.evaluate("document.body.scrollHeight")
        current = 0
        step = 600
        while current < total_height:
            page.evaluate(f"window.scrollTo(0, {current})")
            page.wait_for_timeout(80)
            current += step
            total_height = page.evaluate("document.body.scrollHeight")

        page.evaluate("window.scrollTo(0, 0)")
        page.wait_for_timeout(600)

        if emit:
            emit("التقاط الصورة الكاملة...")

        page.screenshot(path=tmp_png, full_page=True)
        browser.close()

    if emit:
        emit("ضغط وتحسين الصورة...")

    img = Image.open(tmp_png)
    if img.width > 1200:
        ratio = 1200 / img.width
        img = img.resize((1200, int(img.height * ratio)), Image.LANCZOS)
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    img.save(str(output_path), "JPEG", quality=85, optimize=True)
    os.remove(tmp_png)


def _indent(text: str, spaces: int = 10) -> str:
    pad = " " * spaces
    return "\n".join(pad + line for line in text.splitlines())


def update_works_html(name: str, url: str, img_num: int,
                       package: str | None = None,
                       add_to_featured: bool = False):
    """Prepend work-card, store-link, and optionally featured site to works.html."""
    with open(WORKS_HTML, encoding="utf-8") as f:
        content = f.read()

    img_path = f"assets/images/prt/{img_num}.jpeg"
    domain = get_domain(url)

    # ── 1. Work card → prepend inside #page-1 ────────────────────────────────
    work_card = (
        '\n          <div class="work-card">\n'
        f'            <img src="{img_path}" alt="{name}" loading="lazy" />\n'
        '            <div class="work-card-overlay">\n'
        f'              <h3>{name}</h3>\n'
        '              <div class="work-card-actions">\n'
        f'                <a href="{url}" target="_blank">\n'
        '                  <svg\n'
        '                    class="svg-icon"\n'
        '                    viewBox="0 0 512 512"\n'
        '                    style="width: 14px; height: 14px; fill: currentColor"\n'
        '                  >\n'
        '                    <use\n'
        '                      xlink:href="assets/images/icons.svg#icon-external-link"\n'
        '                    ></use>\n'
        '                  </svg>\n'
        '                  زيارة المتجر\n'
        '                </a>\n'
        '                <button class="work-card-zoom" title="تكبير الصورة">\n'
        '                  <svg\n'
        '                    class="svg-icon"\n'
        '                    viewBox="0 0 512 512"\n'
        '                    style="width: 16px; height: 16px"\n'
        '                  >\n'
        '                    <use\n'
        '                      xlink:href="assets/images/icons.svg#icon-search-plus"\n'
        '                    ></use>\n'
        '                  </svg>\n'
        '                </button>\n'
        '              </div>\n'
        '            </div>\n'
        '          </div>'
    )

    page1_marker = '<div class="works-gallery works-page-content active" id="page-1">'
    if page1_marker not in content:
        raise ValueError("لم يتم العثور على علامة #page-1 في works.html")
    content = content.replace(page1_marker, page1_marker + work_card, 1)

    # ── 2. Store link → prepend inside .store-links-grid ─────────────────────
    store_link = (
        f'\n            <a href="{url}" target="_blank" rel="noopener" '
        f'class="store-link-item">{url}</a>'
    )
    store_marker = '<div class="store-links-grid">'
    if store_marker not in content:
        raise ValueError("لم يتم العثور على علامة .store-links-grid في works.html")
    content = content.replace(store_marker, store_marker + store_link, 1)

    # ── 3. Featured site → prepend inside #PACKAGE-sites .sites-grid ─────────
    if add_to_featured and package:
        site_card = (
            '\n              <a\n'
            f'                href="{url}"\n'
            '                target="_blank"\n'
            '                class="site-card"\n'
            '              >\n'
            '                <div class="site-icon">\n'
            '                  <svg\n'
            '                    class="svg-icon"\n'
            '                    viewBox="0 0 616 512"\n'
            '                    aria-hidden="true"\n'
            '                  >\n'
            '                    <use xlink:href="assets/images/icons.svg#icon-store"></use>\n'
            '                  </svg>\n'
            '                </div>\n'
            f'                <h3>{name}</h3>\n'
            f'                <span class="site-url">{domain}</span>\n'
            '              </a>'
        )
        pkg_marker = f'id="{package}-sites">'
        idx = content.find(pkg_marker)
        if idx != -1:
            grid_marker = '<div class="sites-grid">'
            idx2 = content.find(grid_marker, idx)
            if idx2 != -1:
                insert_pos = idx2 + len(grid_marker)
                content = content[:insert_pos] + site_card + content[insert_pos:]

    with open(WORKS_HTML, "w", encoding="utf-8") as f:
        f.write(content)


# ── SSE task system ───────────────────────────────────────────────────────────
_tasks: dict[str, queue.Queue] = {}


def run_add_task(task_id: str, params: dict):
    q = _tasks[task_id]

    def emit(msg: str, status: str = "progress"):
        q.put({"status": status, "message": msg})

    try:
        raw_url = params.get("url", "").strip()
        if not raw_url:
            emit("الرابط فارغ!", "error")
            q.put({"status": "error", "message": "الرابط فارغ"})
            return

        url = raw_url if raw_url.startswith("http") else "https://" + raw_url

        name          = params.get("name", "").strip() or get_domain(url)
        package       = params.get("package", "plus")
        add_featured  = bool(params.get("add_to_featured", False))
        add_ba        = bool(params.get("add_to_ba", False))
        mode          = params.get("mode", "new")   # "new" | "after"

        existing = find_existing_project(url)

        # ── MODE: add "after" image ───────────────────────────────────────────
        if mode == "after":
            if not existing:
                emit("هذا الرابط غير موجود في المشاريع. أضفه أولاً كمشروع جديد.", "error")
                q.put({"status": "error", "message": "الرابط غير موجود"})
                return
            ba_folder = existing.get("ba_folder")
            if not ba_folder:
                emit("لم يتم تسجيل مجلد قبل/بعد لهذا المشروع.", "error")
                q.put({"status": "error", "message": "لا يوجد مجلد ba_folder"})
                return

            after_dir = NO_DIR / str(ba_folder)
            after_dir.mkdir(parents=True, exist_ok=True)
            after_path = after_dir / "2.jpeg"

            emit(f"أخذ لقطة شاشة لـ {url} (صورة البعد)...")
            take_screenshot(url, after_path, emit)

            result = f"✓ تم حفظ صورة البعد في:\nn-o/{ba_folder}/2.jpeg"
            emit(result, "success")
            q.put({"status": "done", "message": result})
            return

        # ── MODE: new project ─────────────────────────────────────────────────
        img_num  = get_next_image_number()
        img_path = PRT_DIR / f"{img_num}.jpeg"

        emit(f"أخذ لقطة شاشة للموقع: {url}")
        take_screenshot(url, img_path, emit)

        emit("تحديث works.html...")
        update_works_html(
            name=name,
            url=url,
            img_num=img_num,
            package=package if add_featured else None,
            add_to_featured=add_featured,
        )
        emit("✓ تم تحديث works.html")

        ba_folder_num = None
        if add_ba:
            ba_folder_num = get_next_ba_folder()
            ba_dir = NO_DIR / str(ba_folder_num)
            ba_dir.mkdir(parents=True, exist_ok=True)
            ba_path = ba_dir / "1.jpeg"
            shutil.copy2(str(img_path), str(ba_path))
            emit(f"✓ تم حفظ صورة القبل في n-o/{ba_folder_num}/1.jpeg")

        emit("تحديث projects.json...")
        data = load_projects()
        entry = {
            "name": name,
            "url": url,
            "image": f"assets/images/prt/{img_num}.jpeg",
            "category": (
                "salla" if "salla" in url.lower()
                else "zid" if "zid" in url.lower()
                else "website"
            ),
            "addedDate": str(date.today()),
        }
        if ba_folder_num:
            entry["ba_folder"] = ba_folder_num
        data["projects"].append(entry)
        save_projects(data)
        emit("✓ تم تحديث projects.json")

        lines = [
            "✅ تم إضافة المشروع بنجاح!",
            f"• الاسم: {name}",
            f"• الصورة: assets/images/prt/{img_num}.jpeg",
        ]
        if add_ba:
            lines.append(f"• صورة القبل: n-o/{ba_folder_num}/1.jpeg")
        if add_featured:
            lines.append(f"• أضيف للمواقع المميزة - باقة {package}")

        result = "\n".join(lines)
        emit(result, "success")
        q.put({"status": "done", "message": result})

    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        emit(f"خطأ غير متوقع: {e}", "error")
        q.put({"status": "error", "message": str(e), "traceback": tb})


# ── Flask routes ──────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return HTML_PAGE


@app.route("/api/check-url", methods=["POST"])
def api_check_url():
    data = request.get_json(silent=True) or {}
    url  = data.get("url", "").strip()
    if not url:
        return jsonify({"exists": False})
    existing = find_existing_project(url)
    if existing:
        return jsonify({
            "exists": True,
            "project": existing,
            "has_ba": bool(existing.get("ba_folder")),
        })
    return jsonify({"exists": False})


@app.route("/api/get-title", methods=["POST"])
def api_get_title():
    data = request.get_json(silent=True) or {}
    url  = data.get("url", "").strip()
    if not url:
        return jsonify({"title": ""})
    title = get_page_title(url)
    return jsonify({"title": title})


@app.route("/api/projects")
def api_projects():
    data = load_projects()
    return jsonify(data.get("projects", []))


@app.route("/api/add", methods=["POST"])
def api_add():
    import uuid
    params  = request.get_json(silent=True) or {}
    task_id = str(uuid.uuid4())
    _tasks[task_id] = queue.Queue()
    t = threading.Thread(
        target=run_add_task,
        args=(task_id, params),
        daemon=True,
    )
    t.start()
    return jsonify({"task_id": task_id})


@app.route("/api/events/<task_id>")
def api_events(task_id: str):
    q = _tasks.get(task_id)
    if q is None:
        return "task not found", 404

    def generate():
        while True:
            try:
                item = q.get(timeout=120)
                yield f"data: {json.dumps(item, ensure_ascii=False)}\n\n"
                if item.get("status") in ("done", "error"):
                    _tasks.pop(task_id, None)
                    break
            except queue.Empty:
                yield 'data: {"status":"ping"}\n\n'

    return Response(
        stream_with_context(generate()),
        content_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


# ── Inline HTML UI ────────────────────────────────────────────────────────────
HTML_PAGE = r"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Portfolio Manager</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
<style>
  :root {
    --primary: #8b5cf6;
    --primary-dark: #7c3aed;
    --primary-light: #a78bfa;
    --bg: #0f0e17;
    --bg2: #1a1828;
    --bg3: #242236;
    --card: #1e1c2e;
    --border: rgba(139,92,246,0.18);
    --text: #e4e1f5;
    --text-muted: #9993b8;
    --green: #22c55e;
    --red: #ef4444;
    --yellow: #f59e0b;
    --radius: 16px;
    --shadow: 0 8px 32px rgba(0,0,0,.45);
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Tajawal', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    padding: 24px 16px 60px;
  }

  /* ── Header ── */
  .hdr {
    text-align: center;
    margin-bottom: 36px;
  }
  .hdr h1 {
    font-size: 2rem;
    font-weight: 900;
    background: linear-gradient(135deg, var(--primary-light), var(--primary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hdr p { color: var(--text-muted); margin-top: 6px; font-size: .95rem; }

  /* ── Card wrapper ── */
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 28px 28px 24px;
    max-width: 700px;
    margin: 0 auto 24px;
    box-shadow: var(--shadow);
  }
  .card-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--primary-light);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* ── Form elements ── */
  .field { margin-bottom: 18px; }
  label {
    display: block;
    font-size: .875rem;
    font-weight: 600;
    color: var(--text-muted);
    margin-bottom: 7px;
  }
  input[type="url"],
  input[type="text"],
  select {
    width: 100%;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 11px 14px;
    color: var(--text);
    font-family: inherit;
    font-size: .95rem;
    outline: none;
    transition: border-color .2s;
    direction: ltr;
    text-align: left;
  }
  input[type="url"]:focus,
  input[type="text"]:focus,
  select:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(139,92,246,.18);
  }
  input[type="text"].rtl-input {
    direction: rtl;
    text-align: right;
  }

  /* ── URL row with check button ── */
  .url-row { display: flex; gap: 8px; }
  .url-row input { flex: 1; }
  .btn-sm {
    white-space: nowrap;
    background: var(--bg3);
    border: 1px solid var(--border);
    color: var(--text-muted);
    border-radius: 10px;
    padding: 0 16px;
    font-family: inherit;
    font-size: .85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all .2s;
  }
  .btn-sm:hover { border-color: var(--primary); color: var(--primary-light); }

  /* ── Mode tabs ── */
  .mode-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 6px;
  }
  .mode-tab {
    flex: 1;
    padding: 9px 12px;
    border-radius: 8px;
    text-align: center;
    font-size: .875rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-family: inherit;
    transition: all .2s;
  }
  .mode-tab.active {
    background: var(--primary);
    color: #fff;
    box-shadow: 0 4px 14px rgba(139,92,246,.4);
  }

  /* ── Badge ── */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: .78rem;
    font-weight: 700;
  }
  .badge-green { background: rgba(34,197,94,.15); color: var(--green); }
  .badge-red   { background: rgba(239,68,68,.15);  color: var(--red);  }
  .badge-purple { background: rgba(139,92,246,.15); color: var(--primary-light); }

  /* ── URL status ── */
  #url-status {
    margin-top: 8px;
    font-size: .83rem;
    min-height: 22px;
    transition: all .2s;
  }

  /* ── Checkbox row ── */
  .check-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    cursor: pointer;
    user-select: none;
  }
  .check-row input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: var(--primary);
    cursor: pointer;
    flex-shrink: 0;
  }
  .check-row span { font-size: .92rem; font-weight: 600; }

  /* ── Package selector ── */
  #pkg-wrapper {
    margin-top: 12px;
    display: none;
  }
  .pkg-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .pkg-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: var(--bg2);
    border: 2px solid var(--border);
    border-radius: 10px;
    cursor: pointer;
    font-family: inherit;
    font-size: .875rem;
    color: var(--text-muted);
    transition: all .2s;
    font-weight: 600;
  }
  .pkg-option:hover { border-color: var(--primary-light); color: var(--text); }
  .pkg-option.selected {
    border-color: var(--primary);
    background: rgba(139,92,246,.12);
    color: var(--primary-light);
  }
  .pkg-option .pkg-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }

  /* ── Submit button ── */
  .btn-primary {
    width: 100%;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: #fff;
    border: none;
    border-radius: 12px;
    padding: 14px 20px;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all .25s;
    box-shadow: 0 5px 20px rgba(139,92,246,.35);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(139,92,246,.5);
  }
  .btn-primary:disabled {
    opacity: .5;
    cursor: not-allowed;
    transform: none;
  }

  /* ── Progress log ── */
  #progress-card { display: none; }
  #log {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 16px;
    font-size: .875rem;
    font-family: 'Courier New', monospace;
    line-height: 1.8;
    max-height: 280px;
    overflow-y: auto;
    direction: rtl;
    text-align: right;
  }
  .log-line { display: flex; gap: 8px; align-items: flex-start; }
  .log-line .icon { flex-shrink: 0; }
  .log-ok   { color: var(--green); }
  .log-err  { color: var(--red);   }
  .log-info { color: var(--text-muted); }

  /* ── Spinner ── */
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(255,255,255,.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin .7s linear infinite;
    flex-shrink: 0;
  }

  /* ── Result box ── */
  #result-box {
    display: none;
    margin-top: 16px;
    padding: 14px 16px;
    border-radius: 12px;
    font-size: .9rem;
    line-height: 1.7;
    white-space: pre-line;
    direction: rtl;
    text-align: right;
  }
  #result-box.success {
    background: rgba(34,197,94,.1);
    border: 1px solid rgba(34,197,94,.3);
    color: #86efac;
  }
  #result-box.error {
    background: rgba(239,68,68,.1);
    border: 1px solid rgba(239,68,68,.3);
    color: #fca5a5;
  }

  /* ── Projects list ── */
  #projects-card { display: none; }
  .proj-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
    font-size: .875rem;
  }
  .proj-item:last-child { border-bottom: none; }
  .proj-name { font-weight: 700; flex: 1; }
  .proj-url  { color: var(--text-muted); font-size: .8rem; font-family: monospace; direction: ltr; }
  .show-projects-btn {
    background: none;
    border: 1px solid var(--border);
    color: var(--text-muted);
    border-radius: 8px;
    padding: 6px 14px;
    font-family: inherit;
    font-size: .82rem;
    cursor: pointer;
    transition: all .2s;
    display: block;
    margin: 0 auto;
  }
  .show-projects-btn:hover { border-color: var(--primary-light); color: var(--primary-light); }
</style>
</head>
<body>

<div class="hdr">
  <h1>🗂️ Portfolio Manager</h1>
  <p>أداة إدارة أعمال البورتفوليو — إضافة مشاريع جديدة بشكل تلقائي</p>
</div>

<!-- Main Form Card -->
<div class="card">
  <div class="card-title">
    ➕ إضافة مشروع
  </div>

  <!-- Mode tabs -->
  <div class="mode-tabs">
    <button class="mode-tab active" data-mode="new" onclick="setMode('new')">
      🆕 مشروع جديد
    </button>
    <button class="mode-tab" data-mode="after" onclick="setMode('after')">
      🔄 إضافة صورة بعد (قبل/بعد)
    </button>
  </div>

  <!-- URL field -->
  <div class="field">
    <label>رابط الموقع *</label>
    <div class="url-row">
      <input type="url" id="url-input" placeholder="https://example.com" autocomplete="off" />
      <button class="btn-sm" onclick="checkUrl()">🔍 فحص</button>
      <button class="btn-sm" onclick="fetchTitle()">📄 عنوان</button>
    </div>
    <div id="url-status"></div>
  </div>

  <!-- Name field (hidden in "after" mode) -->
  <div class="field" id="name-field">
    <label>اسم المشروع</label>
    <input type="text" id="name-input" class="rtl-input" placeholder="يُستخرج تلقائياً من عنوان الصفحة" />
  </div>

  <!-- New project options (hidden in "after" mode) -->
  <div id="new-options">
    <!-- Add to before/after section -->
    <label class="check-row">
      <input type="checkbox" id="chk-ba" />
      <span>📸 حفظ صورة "القبل" لقسم قبل/بعد</span>
    </label>

    <!-- Add to featured sites -->
    <label class="check-row">
      <input type="checkbox" id="chk-featured" onchange="togglePkg()" />
      <span>⭐ إضافة للمواقع المميزة</span>
    </label>

    <!-- Package selection -->
    <div id="pkg-wrapper">
      <label>الباقة</label>
      <div class="pkg-grid">
        <button class="pkg-option selected" data-pkg="plus" onclick="selectPkg(this)">
          <span class="pkg-dot"></span> بلس - سلة
        </button>
        <button class="pkg-option" data-pkg="pro" onclick="selectPkg(this)">
          <span class="pkg-dot"></span> برو - سلة
        </button>
        <button class="pkg-option" data-pkg="basic-zid" onclick="selectPkg(this)">
          <span class="pkg-dot"></span> أساسية - زد
        </button>
        <button class="pkg-option" data-pkg="growth-zid" onclick="selectPkg(this)">
          <span class="pkg-dot"></span> نمو - زد
        </button>
      </div>
    </div>
  </div>

  <!-- Submit -->
  <div style="margin-top: 24px;">
    <button class="btn-primary" id="submit-btn" onclick="submitForm()">
      <span id="btn-spinner" class="spinner" style="display:none;"></span>
      <span id="btn-text">🚀 إضافة المشروع</span>
    </button>
  </div>
</div>

<!-- Progress Card -->
<div class="card" id="progress-card">
  <div class="card-title">⚙️ التقدم</div>
  <div id="log"></div>
  <div id="result-box"></div>
</div>

<!-- Projects list card -->
<div style="text-align:center; max-width:700px; margin:0 auto 12px;">
  <button class="show-projects-btn" id="toggle-projects-btn" onclick="toggleProjects()">
    📋 عرض المشاريع المسجلة
  </button>
</div>
<div class="card" id="projects-card">
  <div class="card-title">📋 المشاريع المسجلة</div>
  <div id="projects-list"><p style="color:var(--text-muted)">جاري التحميل...</p></div>
</div>

<script>
  let currentMode = 'new';
  let selectedPkg = 'plus';
  let isRunning   = false;

  // ── Mode ────────────────────────────────────────────────────────────────────
  function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.mode === mode);
    });
    document.getElementById('new-options').style.display = mode === 'new' ? 'block' : 'none';
    document.getElementById('name-field').style.display  = mode === 'new' ? 'block' : 'none';
    document.getElementById('btn-text').textContent =
      mode === 'new' ? '🚀 إضافة المشروع' : '📸 حفظ صورة البعد';
  }

  // ── Package ─────────────────────────────────────────────────────────────────
  function togglePkg() {
    const checked = document.getElementById('chk-featured').checked;
    document.getElementById('pkg-wrapper').style.display = checked ? 'block' : 'none';
  }
  function selectPkg(el) {
    document.querySelectorAll('.pkg-option').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
    selectedPkg = el.dataset.pkg;
  }

  // ── Check URL ───────────────────────────────────────────────────────────────
  async function checkUrl() {
    const url = document.getElementById('url-input').value.trim();
    if (!url) return;
    const statusEl = document.getElementById('url-status');
    statusEl.innerHTML = '<span style="color:var(--text-muted)">جاري الفحص...</span>';

    try {
      const res  = await fetch('/api/check-url', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({url})
      });
      const data = await res.json();
      if (data.exists) {
        const proj = data.project;
        let html = `<span class="badge badge-yellow">⚠️ الرابط موجود بالفعل</span>`;
        html += `&nbsp;<span style="color:var(--text-muted);font-size:.82rem">${proj.name || ''}</span>`;
        if (data.has_ba) {
          html += ` &nbsp;<span class="badge badge-green">✓ لديه مجلد قبل/بعد (n-o/${proj.ba_folder})</span>`;
          setMode('after');
        } else {
          html += ` &nbsp;<span class="badge badge-red">لا يوجد مجلد قبل/بعد</span>`;
        }
        statusEl.innerHTML = html;
        if (proj.name && !document.getElementById('name-input').value) {
          document.getElementById('name-input').value = proj.name;
        }
      } else {
        statusEl.innerHTML = '<span class="badge badge-green">✓ رابط جديد</span>';
        setMode('new');
      }
    } catch(e) {
      statusEl.innerHTML = '<span style="color:var(--red)">فشل الفحص</span>';
    }
  }

  // ── Fetch title ─────────────────────────────────────────────────────────────
  async function fetchTitle() {
    const url = document.getElementById('url-input').value.trim();
    if (!url) return;
    const nameEl = document.getElementById('name-input');
    nameEl.placeholder = 'جاري الجلب...';
    nameEl.disabled = true;
    try {
      const res  = await fetch('/api/get-title', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({url})
      });
      const data = await res.json();
      nameEl.value = data.title || '';
    } catch(e) {}
    nameEl.disabled = false;
    nameEl.placeholder = 'يُستخرج تلقائياً من عنوان الصفحة';
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function submitForm() {
    if (isRunning) return;
    const url = document.getElementById('url-input').value.trim();
    if (!url) { alert('أدخل رابط الموقع أولاً'); return; }

    isRunning = true;
    const submitBtn  = document.getElementById('submit-btn');
    const spinner    = document.getElementById('btn-spinner');
    const btnText    = document.getElementById('btn-text');
    const progCard   = document.getElementById('progress-card');
    const logEl      = document.getElementById('log');
    const resultEl   = document.getElementById('result-box');

    submitBtn.disabled = true;
    spinner.style.display = 'inline-block';
    btnText.textContent = 'جاري العمل...';

    progCard.style.display = 'block';
    logEl.innerHTML = '';
    resultEl.style.display = 'none';
    resultEl.className = '';
    resultEl.textContent = '';

    const payload = {
      url,
      name:           document.getElementById('name-input').value.trim(),
      mode:           currentMode,
      add_to_ba:      document.getElementById('chk-ba')?.checked || false,
      add_to_featured:document.getElementById('chk-featured')?.checked || false,
      package:        selectedPkg,
    };

    // Start task
    const startRes = await fetch('/api/add', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    const {task_id} = await startRes.json();

    // Listen to SSE
    const es = new EventSource(`/api/events/${task_id}`);
    es.onmessage = (e) => {
      const item = JSON.parse(e.data);
      if (item.status === 'ping') return;

      if (item.status === 'progress') {
        appendLog(logEl, '⚙️', item.message, 'log-info');
      } else if (item.status === 'success') {
        appendLog(logEl, '✅', item.message, 'log-ok');
      } else if (item.status === 'error') {
        appendLog(logEl, '❌', item.message, 'log-err');
      }

      if (item.status === 'done') {
        es.close();
        resultEl.className = 'success';
        resultEl.textContent = item.message;
        resultEl.style.display = 'block';
        resetBtn();
      } else if (item.status === 'error') {
        es.close();
        resultEl.className = 'error';
        resultEl.textContent = item.message;
        resultEl.style.display = 'block';
        resetBtn();
      }
    };
    es.onerror = () => {
      es.close();
      appendLog(logEl, '❌', 'انقطع الاتصال بالخادم', 'log-err');
      resetBtn();
    };
  }

  function appendLog(container, icon, msg, cls) {
    const div = document.createElement('div');
    div.className = `log-line ${cls}`;
    div.innerHTML = `<span class="icon">${icon}</span><span>${escHtml(msg)}</span>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
  }

  function resetBtn() {
    isRunning = false;
    const submitBtn = document.getElementById('submit-btn');
    const spinner   = document.getElementById('btn-spinner');
    const btnText   = document.getElementById('btn-text');
    submitBtn.disabled = false;
    spinner.style.display = 'none';
    btnText.textContent = currentMode === 'new' ? '🚀 إضافة المشروع' : '📸 حفظ صورة البعد';
  }

  // ── Projects list ───────────────────────────────────────────────────────────
  let projectsVisible = false;
  async function toggleProjects() {
    const card = document.getElementById('projects-card');
    const btn  = document.getElementById('toggle-projects-btn');
    projectsVisible = !projectsVisible;
    card.style.display = projectsVisible ? 'block' : 'none';
    btn.textContent    = projectsVisible ? '🔼 إخفاء المشاريع' : '📋 عرض المشاريع المسجلة';
    if (projectsVisible) {
      await loadProjects();
    }
  }
  async function loadProjects() {
    const listEl = document.getElementById('projects-list');
    try {
      const res  = await fetch('/api/projects');
      const data = await res.json();
      if (!data.length) {
        listEl.innerHTML = '<p style="color:var(--text-muted)">لا توجد مشاريع مسجلة</p>';
        return;
      }
      listEl.innerHTML = [...data].reverse().map(p => `
        <div class="proj-item">
          <div>
            <div class="proj-name">${escHtml(p.name || '—')}</div>
            <div class="proj-url" dir="ltr">${escHtml(p.url || '')}</div>
          </div>
          <div style="text-align:left; flex-shrink:0; font-size:.78rem; color:var(--text-muted)">
            ${p.addedDate || ''}
            ${p.ba_folder ? `<br><span class="badge badge-purple">n-o/${p.ba_folder}</span>` : ''}
          </div>
        </div>
      `).join('');
    } catch(e) {
      listEl.innerHTML = '<p style="color:var(--red)">فشل تحميل المشاريع</p>';
    }
  }

  // Init
  setMode('new');
</script>
</body>
</html>"""


# ── Startup ────────────────────────────────────────────────────────────────────
def find_free_port(start: int = 5555) -> int:
    for port in range(start, start + 50):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(("127.0.0.1", port)) != 0:
                return port
    return start


if __name__ == "__main__":
    port = find_free_port()
    url  = f"http://localhost:{port}"
    print(f"\n✅  Portfolio Manager")
    print(f"   {url}\n")
    # Open browser after short delay
    threading.Timer(1.2, lambda: webbrowser.open(url)).start()
    app.run(host="127.0.0.1", port=port, debug=False, threaded=True)
