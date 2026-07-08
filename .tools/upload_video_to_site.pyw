#!/usr/bin/env python3
"""
VideoToolkit Server
يخدم HTML واجهة تحويل/ضغط/رفع الفيديو، ويستخدم ffmpeg للمعالجة و Git للرفع.
"""

import base64
import io
import json
import logging
import os
import re
import shutil
import subprocess
import sys
import tempfile
import threading
import time
import webbrowser
from datetime import datetime
from pathlib import Path

import flask
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("video_toolkit")

# ── Paths ──────────────────────────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parents[1]
ASSETS_DIR = REPO_ROOT / "assets" / "video" / "work"
BASE_URL = "https://elwa2.github.io/portfolio/assets/video/work"
HTML_FILE = REPO_ROOT / "open-source-tools" / "video-toolkit.html"
PORT = int(os.environ.get("VIDEO_TOOLKIT_PORT", 8765))

# ── Progress State ─────────────────────────────────────────────────────────
_progress = {"percent": 0, "label": ""}
_progress_lock = threading.Lock()

_current_process = None
_job_state = {"active": False, "action": "", "file": "", "can_cancel": False}
_job_lock = threading.Lock()


def set_progress(pct: int, label: str = ""):
    with _progress_lock:
        _progress["percent"] = min(max(pct, 0), 100)
        if label:
            _progress["label"] = label


def get_progress():
    with _progress_lock:
        return dict(_progress)


def set_job(action: str, file: str = ""):
    with _job_lock:
        _job_state["active"] = True
        _job_state["action"] = action
        _job_state["file"] = file
        _job_state["can_cancel"] = True


def clear_job():
    with _job_lock:
        _job_state["active"] = False
        _job_state["action"] = ""
        _job_state["file"] = ""
        _job_state["can_cancel"] = False


def get_job():
    with _job_lock:
        return dict(_job_state)


# ── FFmpeg helpers ─────────────────────────────────────────────────────────
_FFMPEG_CANDIDATE_PATHS = [
    r"C:\ffmpeg\bin\ffmpeg.exe",
    r"C:\ffmpeg\ffmpeg.exe",
    r"C:\ffmpeg.exe",
]

def _find_ffmpeg() -> str | None:
    # 1) Try PATH
    which = shutil.which("ffmpeg")
    if which:
        return which
    # 2) Try common installation paths
    for p in _FFMPEG_CANDIDATE_PATHS:
        if os.path.isfile(p):
            return p
    return None


FFMPEG_BIN = _find_ffmpeg()


def check_ffmpeg() -> bool:
    return FFMPEG_BIN is not None


def ffmpeg_cmd() -> list[str]:
    """Return the command prefix for invoking ffmpeg."""
    return [FFMPEG_BIN] if FFMPEG_BIN else ["ffmpeg"]


def run_ffmpeg(args, duration_sec: float = None):
    """Run ffmpeg and parse progress from stderr. Supports cancellation."""
    global _current_process
    cmd = ffmpeg_cmd() + ["-y"] + args
    logger.info("Running: %s", " ".join(cmd))
    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    _current_process = proc
    prog_re = re.compile(r"time=(\d+):(\d+):(\d+\.\d+)")
    while True:
        with _job_lock:
            if _job_state.get("cancel_requested"):
                proc.kill()
                _current_process = None
                clear_job()
                raise RuntimeError("تم إلغاء التحويل")
        line = proc.stderr.readline()
        if not line and proc.poll() is not None:
            break
        m = prog_re.search(line)
        if m and duration_sec:
            h, m_, s = int(m.group(1)), int(m.group(2)), float(m.group(3))
            elapsed = h * 3600 + m_ * 60 + s
            pct = int(elapsed / duration_sec * 100)
            set_progress(min(pct, 99))
    rc = proc.wait()
    _current_process = None
    if rc != 0:
        err = proc.stderr.read()
        raise RuntimeError(f"ffmpeg failed (rc={rc}): {err[:500]}")
    set_progress(100)


def get_video_duration(file_path: Path) -> float:
    """Get video duration in seconds using ffprobe."""
    ffprobe = str(Path(FFMPEG_BIN).parent / "ffprobe.exe") if FFMPEG_BIN else "ffprobe"
    cmd = [
        ffprobe,
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(file_path),
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return float(result.stdout.strip())
    except Exception:
        return 60  # fallback


def ffmpeg_probe_resolution(file_path: Path) -> tuple:
    """Get (width, height) of video."""
    ffprobe = str(Path(FFMPEG_BIN).parent / "ffprobe.exe") if FFMPEG_BIN else "ffprobe"
    cmd = [
        ffprobe, "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height",
        "-of", "csv=p=0",
        str(file_path),
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        parts = result.stdout.strip().split(",")
        return int(parts[0]), int(parts[1])
    except Exception:
        return (1920, 1080)


# ── Flask App ──────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)


@app.route("/")
def index():
    if HTML_FILE.exists():
        return send_file(str(HTML_FILE))
    return "HTML file not found", 404


@app.route("/api/shutdown", methods=["POST"])
def api_shutdown():
    logger.info("Shutdown requested")
    cancel_current_process()
    set_progress(100, "جاري إيقاف السيرفر...")
    import threading
    threading.Thread(target=lambda: (time.sleep(1), os._exit(0))).start()
    return jsonify({"ok": True, "message": "تم إيقاف السيرفر"})


@app.route("/api/status")
def api_status():
    job = get_job()
    prog = get_progress()
    return jsonify({"job": job, "progress": prog})


@app.route("/api/cancel", methods=["POST"])
def api_cancel():
    logger.info("Cancel requested by user")
    cancel_current_process()
    return jsonify({"ok": True, "message": "تم إلغاء العملية"})


def cancel_current_process():
    global _current_process
    with _job_lock:
        _job_state["cancel_requested"] = True
    if _current_process:
        try:
            _current_process.kill()
        except Exception:
            pass
        _current_process = None
    clear_job()
    set_progress(0, "تم إلغاء العملية")


@app.route("/api/progress")
def api_progress():
    return jsonify(get_progress())


@app.route("/api/video", methods=["POST"])
def api_video():
    action = request.form.get("action", "")
    logger.info("API request: action=%s", action)

    try:
        if action == "convert":
            return handle_convert(request)
        elif action == "compress":
            return handle_compress(request)
        elif action == "upload":
            return handle_upload(request)
        elif action == "batch_upload":
            return handle_batch_upload(request)
        else:
            return jsonify({"error": f"Unknown action: {action}"}), 400
    except Exception as e:
        logger.exception("Error in %s", action)
        return jsonify({"error": str(e)}), 500


def get_uploaded_file(req) -> tuple:
    """Extract uploaded file and optional custom name from request."""
    f = req.files.get("file")
    if not f:
        raise ValueError("لم يتم إرسال ملف")
    name = req.form.get("name") or f.filename or "video"
    return f, name


def save_temp_file(f) -> Path:
    tmp = Path(tempfile.mkdtemp()) / f.filename
    f.save(str(tmp))
    return tmp


# ── Convert ────────────────────────────────────────────────────────────────
def handle_convert(req):
    if not check_ffmpeg():
        return jsonify({"error": "ffmpeg غير مثبت. قم بتثبيته أولاً."}), 400

    f, name = get_uploaded_file(req)
    crf = req.form.get("crf", "23")
    preset = req.form.get("preset", "medium")
    scale = req.form.get("scale", "1")

    tmp_input = save_temp_file(f)
    try:
        duration = get_video_duration(tmp_input)
        output_name = Path(name).stem + ".webm"
        tmp_output = tmp_input.parent / output_name

        args = ["-i", str(tmp_input), "-c:v", "libvpx-vp9", "-crf", crf, "-b:v", "0", "-preset", preset]

        if scale != "1":
            w, h = ffmpeg_probe_resolution(tmp_input)
            new_w = int(w * float(scale))
            new_h = int(h * float(scale))
            if new_w % 2:
                new_w += 1
            if new_h % 2:
                new_h += 1
            args += ["-vf", f"scale={new_w}:{new_h}"]

        args += ["-an", str(tmp_output)]

        set_job("convert", name)
        set_progress(0, "جاري التحويل إلى WebM...")
        run_ffmpeg(args, duration)

        with open(tmp_output, "rb") as bf:
            data = bf.read()
            b64 = base64.b64encode(data).decode()

        clear_job()
        return jsonify({
            "data": b64,
            "mime": "video/webm",
            "name": output_name,
            "size": len(data),
        })
    finally:
        shutil.rmtree(tmp_input.parent, ignore_errors=True)


# ── Compress ───────────────────────────────────────────────────────────────
def handle_compress(req):
    if not check_ffmpeg():
        return jsonify({"error": "ffmpeg غير مثبت. قم بتثبيته أولاً."}), 400

    f, name = get_uploaded_file(req)
    target_mb = int(req.form.get("target", "10"))
    fmt = req.form.get("format", "webm")
    audio_bitrate = req.form.get("audio_bitrate", "128")

    tmp_input = save_temp_file(f)
    try:
        duration = get_video_duration(tmp_input)
        ext = "webm" if fmt == "webm" else "mp4"
        output_name = Path(name).stem + f"_compressed.{ext}"
        tmp_output = tmp_input.parent / output_name

        target_bits = target_mb * 8 * 1024 * 1024
        audio_bits = int(audio_bitrate) * 1000 * duration
        video_bitrate = max(50000, int((target_bits - audio_bits) / duration))

        vcodec = "libvpx-vp9" if fmt == "webm" else "libx264"
        acodec = "libopus" if fmt == "webm" else "aac"

        args = [
            "-i", str(tmp_input),
            "-c:v", vcodec,
            "-b:v", str(video_bitrate),
            "-maxrate", str(int(video_bitrate * 1.5)),
            "-bufsize", str(video_bitrate * 2),
            "-c:a", acodec,
            "-b:a", f"{audio_bitrate}k",
            str(tmp_output),
        ]

        set_job("compress", name)
        set_progress(0, "جاري ضغط الفيديو...")
        run_ffmpeg(args, duration)

        with open(tmp_output, "rb") as bf:
            data = bf.read()
            b64 = base64.b64encode(data).decode()

        mime = "video/webm" if fmt == "webm" else "video/mp4"
        clear_job()
        return jsonify({"data": b64, "mime": mime, "name": output_name, "size": len(data)})
    finally:
        shutil.rmtree(tmp_input.parent, ignore_errors=True)


# ── Upload ─────────────────────────────────────────────────────────────────
def handle_upload(req):
    f, name = get_uploaded_file(req)

    set_progress(10, "جاري حفظ الملف...")
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    dest = unique_destination(ASSETS_DIR, name)
    f.save(str(dest))

    rel_path = dest.relative_to(REPO_ROOT).as_posix()
    file_url = f"{BASE_URL}/{dest.name}"

    logger.info("Saved to %s", dest)

    set_progress(40, "جاري رفع إلى GitHub...")

    try:
        run_git(["add", rel_path], REPO_ROOT)
        try:
            run_git(["commit", "-m", f"Add video {dest.name}"], REPO_ROOT)
        except subprocess.CalledProcessError as exc:
            if "nothing to commit" not in (exc.stderr or "") and "nothing to commit" not in (exc.stdout or ""):
                raise

        try:
            run_git(["pull", "--rebase", "--autostash"], REPO_ROOT)
            set_progress(70)
        except subprocess.CalledProcessError as exc:
            return jsonify({"error": f"Git pull failed: {exc.stderr}"}), 500

        run_git(["push"], REPO_ROOT)
        set_progress(100, "تم الرفع!")
    except subprocess.CalledProcessError as exc:
        error_text = exc.stderr.strip() or exc.stdout.strip() or "فشل git"
        logger.error("Git error: %s", error_text)
        return jsonify({"error": error_text}), 500

    logger.info("Uploaded: %s", file_url)
    return jsonify({"url": file_url, "path": rel_path})


# ── Git helpers ────────────────────────────────────────────────────────────
def run_git(args, cwd):
    return subprocess.run(
        ["git", *args],
        cwd=str(cwd),
        check=True,
        text=True,
        capture_output=True,
    )


def unique_destination(dest_dir, filename):
    dest = dest_dir / filename
    if not dest.exists():
        return dest
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    stem = dest.stem
    suffix = dest.suffix
    return dest_dir / f"{stem}_{stamp}{suffix}"


# ── Batch Upload ────────────────────────────────────────────────────────────
def handle_batch_upload(req):
    files = req.files.getlist("files[]")
    if not files:
        return jsonify({"error": "لم يتم إرسال ملفات"}), 400

    results = []
    total = len(files)
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    for i, f in enumerate(files):
        name = f.filename or f"video_{i+1}"
        set_progress(int((i / total) * 80), f"جاري رفع {i+1}/{total}: {name}")
        logger.info("Batch upload %d/%d: %s", i + 1, total, name)

        try:
            dest = unique_destination(ASSETS_DIR, name)
            f.save(str(dest))
            rel_path = dest.relative_to(REPO_ROOT).as_posix()
            file_url = f"{BASE_URL}/{dest.name}"

            run_git(["add", rel_path], REPO_ROOT)
            try:
                run_git(["commit", "-m", f"Add video {dest.name}"], REPO_ROOT)
            except subprocess.CalledProcessError as exc:
                if "nothing to commit" not in (exc.stderr or "") and "nothing to commit" not in (exc.stdout or ""):
                    raise

            results.append({"name": name, "url": file_url, "path": rel_path, "success": True})
            logger.info("Uploaded: %s", file_url)
        except Exception as e:
            results.append({"name": name, "error": str(e), "success": False})
            logger.error("Failed to upload %s: %s", name, str(e))

    set_progress(90, "جاري Pull و Push...")
    try:
        run_git(["pull", "--rebase", "--autostash"], REPO_ROOT)
        run_git(["push"], REPO_ROOT)
        set_progress(100, "تم رفع جميع الملفات!")
    except subprocess.CalledProcessError as exc:
        error_text = exc.stderr.strip() or exc.stdout.strip() or "فشل git"
        logger.error("Git error: %s", error_text)
        for r in results:
            if r["success"]:
                r["git_push_error"] = error_text

    success_count = sum(1 for r in results if r["success"])
    return jsonify({
        "results": results,
        "total": total,
        "success": success_count,
        "failed": total - success_count,
    })


# ── Main ───────────────────────────────────────────────────────────────────
def main():
    if not HTML_FILE.exists():
        print(f"❌ HTML file not found: {HTML_FILE}")
        sys.exit(1)

    if not check_ffmpeg():
        print("⚠️  ffmpeg غير مثبت على النظام.")
        print("   سيتم تعطيل خاصية التحويل والضغط.")
        print("   قم بتثبيت ffmpeg من: https://ffmpeg.org/download.html")
        print()

    print(f"🚀 VideoToolkit Server")
    print(f"   الرابط: http://localhost:{PORT}")
    print("   اضغط Ctrl+C للإيقاف")
    print()

    # Open browser
    threading.Timer(1.5, lambda: webbrowser.open(f"http://localhost:{PORT}")).start()

    try:
        app.run(host="127.0.0.1", port=PORT, debug=False)
    except KeyboardInterrupt:
        print("\n👋 إيقاف...")
    except OSError as e:
        print(f"❌ فشل تشغيل السيرفر: {e}")
        print(f"   قد يكون هناك برنامج آخر يستخدم المنفذ {PORT}")


if __name__ == "__main__":
    main()
