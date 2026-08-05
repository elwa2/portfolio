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
        elif action == "extract_audio":
            return handle_extract_audio(request)
        elif action == "remove_audio":
            return handle_remove_audio(request)
        elif action == "workflow":
            return handle_workflow(request)
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
_VIDEO_FORMATS = {
    "webm": {"ext": "webm", "mime": "video/webm"},
    "mp4": {"ext": "mp4", "mime": "video/mp4"},
    "mkv": {"ext": "mkv", "mime": "video/x-matroska"},
    "avi": {"ext": "avi", "mime": "video/x-msvideo"},
    "mov": {"ext": "mov", "mime": "video/quicktime"},
    "mpeg": {"ext": "mpg", "mime": "video/mpeg"},
    "ogv": {"ext": "ogv", "mime": "video/ogg"},
}


def _video_codec_args(fmt: str, crf: str, preset: str) -> list[str]:
    """Return codec args for converting video to the given container format."""
    if fmt == "webm":
        return ["-c:v", "libvpx-vp9", "-crf", crf, "-b:v", "0", "-preset", preset,
                "-c:a", "libopus", "-b:a", "128k"]
    if fmt == "mp4":
        return ["-c:v", "libx264", "-crf", crf, "-preset", preset, "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart"]
    if fmt == "mkv":
        return ["-c:v", "libx264", "-crf", crf, "-preset", preset, "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "128k"]
    if fmt == "avi":
        return ["-c:v", "libx264", "-crf", crf, "-preset", preset, "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "128k"]
    if fmt == "mov":
        return ["-c:v", "libx264", "-crf", crf, "-preset", preset, "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart"]
    if fmt == "mpeg":
        return ["-c:v", "mpeg2video", "-q:v", "3", "-c:a", "mp2", "-b:a", "192k"]
    if fmt == "ogv":
        return ["-c:v", "libtheora", "-q:v", "7", "-c:a", "libvorbis", "-q:a", "5"]
    # fallback → webm
    return ["-c:v", "libvpx-vp9", "-crf", crf, "-b:v", "0", "-preset", preset,
            "-c:a", "libopus", "-b:a", "128k"]


def handle_convert(req):
    if not check_ffmpeg():
        return jsonify({"error": "ffmpeg غير مثبت. قم بتثبيته أولاً."}), 400

    f, name = get_uploaded_file(req)
    fmt = (req.form.get("format", "webm") or "webm").lower()
    cfg = _VIDEO_FORMATS.get(fmt, _VIDEO_FORMATS["webm"])

    tmp_input = save_temp_file(f)
    try:
        set_job("convert", name)
        out = _apply_operation(tmp_input, {
            "op": "convert",
            "format": fmt,
            "crf": req.form.get("crf", "23"),
            "preset": req.form.get("preset", "medium"),
            "scale": req.form.get("scale", "1"),
            "size": req.form.get("size", ""),
            "size_fit": req.form.get("size_fit", "fit"),
        })
        with open(out, "rb") as bf:
            data = bf.read()

        clear_job()
        return jsonify({
            "data": base64.b64encode(data).decode(),
            "mime": cfg["mime"],
            "name": out.name,
            "size": len(data),
        })
    finally:
        shutil.rmtree(tmp_input.parent, ignore_errors=True)


# ── Compress ───────────────────────────────────────────────────────────────
def handle_compress(req):
    if not check_ffmpeg():
        return jsonify({"error": "ffmpeg غير مثبت. قم بتثبيته أولاً."}), 400

    f, name = get_uploaded_file(req)
    fmt = (req.form.get("format", "webm") or "webm").lower()

    tmp_input = save_temp_file(f)
    try:
        set_job("compress", name)
        out = _apply_operation(tmp_input, {
            "op": "compress",
            "format": fmt,
            "target": req.form.get("target", "10"),
            "audio_bitrate": req.form.get("audio_bitrate", "128"),
            "remove_audio": req.form.get("remove_audio", "0"),
        })
        with open(out, "rb") as bf:
            data = bf.read()

        mime = "video/webm" if fmt == "webm" else "video/mp4"
        clear_job()
        return jsonify({"data": base64.b64encode(data).decode(), "mime": mime, "name": out.name, "size": len(data)})
    finally:
        shutil.rmtree(tmp_input.parent, ignore_errors=True)


# ── Extract Audio ──────────────────────────────────────────────────────────
_AUDIO_FORMATS = {
    "mp3": {"ext": "mp3", "mime": "audio/mpeg", "codec": ["-c:a", "libmp3lame"]},
    "m4a": {"ext": "m4a", "mime": "audio/mp4", "codec": ["-c:a", "aac"]},
    "ogg": {"ext": "ogg", "mime": "audio/ogg", "codec": ["-c:a", "libvorbis"]},
    "wav": {"ext": "wav", "mime": "audio/wav", "codec": ["-c:a", "pcm_s16le"]},
    "flac": {"ext": "flac", "mime": "audio/flac", "codec": ["-c:a", "flac"]},
}


def _mime_for_suffix(suffix: str) -> str:
    """Guess a MIME type from a file extension."""
    s = suffix.lower().lstrip(".")
    for cfg in _VIDEO_FORMATS.values():
        if cfg["ext"] == s:
            return cfg["mime"]
    for cfg in _AUDIO_FORMATS.values():
        if cfg["ext"] == s:
            return cfg["mime"]
    if s == "mp4":
        return "video/mp4"
    return "application/octet-stream"


def _apply_operation(tmp_input: Path, step: dict) -> Path:
    """Apply a single processing step to tmp_input and return the output path."""
    op = step.get("op", "")
    tmp_dir = tmp_input.parent
    stem = tmp_input.stem
    duration = get_video_duration(tmp_input)

    if op == "convert":
        fmt = (step.get("format") or "webm").lower()
        cfg = _VIDEO_FORMATS.get(fmt, _VIDEO_FORMATS["webm"])
        out = tmp_dir / f"{stem}.{cfg['ext']}"
        args = ["-i", str(tmp_input)] + _video_codec_args(
            fmt, str(step.get("crf", "23")), str(step.get("preset", "medium")))
        size = str(step.get("size", "") or "").strip().lower()
        scale = str(step.get("scale", "1"))
        if size and "x" in size:
            try:
                tw, th = (int(v) for v in size.split("x"))
                if tw % 2:
                    tw += 1
                if th % 2:
                    th += 1
                w, h = ffmpeg_probe_resolution(tmp_input)
                if w and h:
                    fit = str(step.get("size_fit", "fit")) in ("fit", "letterbox", "pad")
                    if fit:
                        s = min(tw / w, th / h)
                        nw = max(2, int(round(w * s)) & ~1)
                        nh = max(2, int(round(h * s)) & ~1)
                        args += ["-vf", f"scale={nw}:{nh},pad={tw}:{th}:(ow-iw)/2:(oh-ih)/2"]
                    else:
                        s = max(tw / w, th / h)
                        nw = max(2, int(round(w * s)) & ~1)
                        nh = max(2, int(round(h * s)) & ~1)
                        args += ["-vf", f"scale={nw}:{nh},crop={tw}:{th}:(iw-ow)/2:(ih-oh)/2"]
                    set_progress(0, f"الخطوة: تغيير المقاس إلى {tw}x{th}")
            except ValueError:
                pass
        elif scale != "1":
            w, h = ffmpeg_probe_resolution(tmp_input)
            new_w = int(w * float(scale))
            new_h = int(h * float(scale))
            if new_w % 2:
                new_w += 1
            if new_h % 2:
                new_h += 1
            args += ["-vf", f"scale={new_w}:{new_h}"]
        args += [str(out)]
        set_progress(0, f"الخطوة: تحويل إلى {cfg['ext'].upper()}")
        run_ffmpeg(args, duration)
        return out

    if op == "compress":
        fmt = (step.get("format") or "webm").lower()
        ext = "webm" if fmt == "webm" else "mp4"
        out = tmp_dir / f"{stem}.{ext}"
        target_mb = int(step.get("target", "10"))
        audio_bitrate = str(step.get("audio_bitrate", "128"))
        remove_audio = step.get("remove_audio", "0") in ("1", "true", "yes", "on")
        target_bits = target_mb * 8 * 1024 * 1024
        audio_bits = 0 if remove_audio else int(audio_bitrate) * 1000 * duration
        video_bitrate = max(50000, int((target_bits - audio_bits) / duration))
        vcodec = "libvpx-vp9" if fmt == "webm" else "libx264"
        args = [
            "-i", str(tmp_input),
            "-c:v", vcodec,
            "-b:v", str(video_bitrate),
            "-maxrate", str(int(video_bitrate * 1.5)),
            "-bufsize", str(video_bitrate * 2),
        ]
        if remove_audio:
            args += ["-an"]
        else:
            acodec = "libopus" if fmt == "webm" else "aac"
            args += ["-c:a", acodec, "-b:a", f"{audio_bitrate}k"]
        args += [str(out)]
        set_progress(0, "الخطوة: ضغط الفيديو")
        run_ffmpeg(args, duration)
        return out

    if op == "extract_audio":
        fmt = (step.get("format") or "mp3").lower()
        cfg = _AUDIO_FORMATS.get(fmt, _AUDIO_FORMATS["mp3"])
        audio_bitrate = str(step.get("audio_bitrate", "192"))
        out = tmp_dir / f"{stem}.{cfg['ext']}"
        args = ["-i", str(tmp_input), "-vn"] + cfg["codec"]
        if fmt != "wav":
            args += ["-b:a", f"{audio_bitrate}k"]
        args += [str(out)]
        set_progress(0, "الخطوة: استخراج الصوت")
        run_ffmpeg(args, duration)
        return out

    if op == "remove_audio":
        fmt = (step.get("format") or "mp4").lower()
        crf = str(step.get("crf", "23"))
        preset = str(step.get("preset", "medium"))
        if fmt == "webm":
            ext = "webm"
            vargs = ["-c:v", "libvpx-vp9", "-crf", crf, "-b:v", "0", "-preset", preset]
        else:
            ext = "mp4"
            vargs = ["-c:v", "libx264", "-crf", crf, "-preset", preset,
                     "-pix_fmt", "yuv420p", "-movflags", "+faststart"]
        out = tmp_dir / f"{stem}.{ext}"
        args = ["-i", str(tmp_input), "-an"] + vargs + [str(out)]
        set_progress(0, "الخطوة: إزالة الصوت")
        run_ffmpeg(args, duration)
        return out

    raise RuntimeError(f"عملية غير معروفة: {op}")


def handle_extract_audio(req):
    if not check_ffmpeg():
        return jsonify({"error": "ffmpeg غير مثبت. قم بتثبيته أولاً."}), 400

    f, name = get_uploaded_file(req)
    fmt = (req.form.get("format", "mp3") or "mp3").lower()
    cfg = _AUDIO_FORMATS.get(fmt, _AUDIO_FORMATS["mp3"])

    tmp_input = save_temp_file(f)
    try:
        set_job("extract_audio", name)
        out = _apply_operation(tmp_input, {
            "op": "extract_audio",
            "format": fmt,
            "audio_bitrate": req.form.get("audio_bitrate", "192"),
        })
        with open(out, "rb") as bf:
            data = bf.read()

        clear_job()
        return jsonify({
            "data": base64.b64encode(data).decode(),
            "mime": cfg["mime"],
            "name": out.name,
            "size": len(data),
        })
    finally:
        shutil.rmtree(tmp_input.parent, ignore_errors=True)


# ── Remove Audio ───────────────────────────────────────────────────────────
def handle_remove_audio(req):
    if not check_ffmpeg():
        return jsonify({"error": "ffmpeg غير مثبت. قم بتثبيته أولاً."}), 400

    f, name = get_uploaded_file(req)
    fmt = (req.form.get("format", "mp4") or "mp4").lower()

    tmp_input = save_temp_file(f)
    try:
        set_job("remove_audio", name)
        out = _apply_operation(tmp_input, {
            "op": "remove_audio",
            "format": fmt,
            "crf": req.form.get("crf", "23"),
            "preset": req.form.get("preset", "medium"),
        })
        with open(out, "rb") as bf:
            data = bf.read()

        mime = "video/webm" if fmt == "webm" else "video/mp4"
        clear_job()
        return jsonify({"data": base64.b64encode(data).decode(), "mime": mime, "name": out.name, "size": len(data)})
    finally:
        shutil.rmtree(tmp_input.parent, ignore_errors=True)


# ── Workflow (chain of steps + optional auto upload) ───────────────────────
def handle_workflow(req):
    if not check_ffmpeg():
        return jsonify({"error": "ffmpeg غير مثبت. قم بتثبيته أولاً."}), 400

    f, name = get_uploaded_file(req)

    try:
        steps = json.loads(req.form.get("steps", "[]") or "[]")
    except Exception:
        return jsonify({"error": "خطوات سير العمل غير صالحة"}), 400
    if not steps:
        return jsonify({"error": "لم يتم تحديد أي خطوات"}), 400

    auto_upload = req.form.get("auto_upload", "0") == "1"
    try:
        size_threshold = float(req.form.get("size_threshold", "10"))
    except ValueError:
        size_threshold = 10

    tmp_input = save_temp_file(f)
    try:
        stem = Path(name).stem
        set_job("workflow", name)
        set_progress(0, "جاري تنفيذ سير العمل...")

        current = tmp_input
        for i, step in enumerate(steps):
            in_name = tmp_input.parent / f"_wf_{i}{current.suffix}"
            if current != in_name:
                os.replace(current, in_name)
                current = in_name
            set_progress(5, f"خطوة {i + 1}/{len(steps)} جارية...")
            current = _apply_operation(current, step)

        final_path = tmp_input.parent / f"{stem}_workflow{current.suffix}"
        os.replace(current, final_path)

        with open(final_path, "rb") as bf:
            data = bf.read()

        result = {
            "data": base64.b64encode(data).decode(),
            "mime": _mime_for_suffix(final_path.suffix),
            "name": final_path.name,
            "size": len(data),
        }

        if auto_upload:
            if len(data) <= size_threshold * 1024 * 1024:
                set_progress(90, "الحجم ضمن الحد — جاري الرفع إلى GitHub...")
                try:
                    dest = unique_destination(ASSETS_DIR, final_path.name)
                    shutil.copyfile(final_path, dest)
                    url = push_file_to_git(dest)
                    result["url"] = url
                    result["uploaded"] = True
                    set_progress(100, "تم سير العمل والرفع!")
                except (subprocess.CalledProcessError, RuntimeError) as exc:
                    error_text = exc.stderr.strip() if isinstance(exc, subprocess.CalledProcessError) else str(exc)
                    result["uploaded"] = False
                    result["upload_error"] = error_text or "فشل git"
            else:
                result["uploaded"] = False
                result["upload_skipped"] = True
        else:
            result["uploaded"] = False

        clear_job()
        return jsonify(result)
    finally:
        shutil.rmtree(tmp_input.parent, ignore_errors=True)


# ── Upload ─────────────────────────────────────────────────────────────────
def push_file_to_git(dest: Path) -> str:
    """Commit and push a file to the repo. Returns the public URL."""
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    rel_path = dest.relative_to(REPO_ROOT).as_posix()
    file_url = f"{BASE_URL}/{dest.name}"

    run_git(["add", rel_path], REPO_ROOT)
    try:
        run_git(["commit", "-m", f"Add video {dest.name}"], REPO_ROOT)
    except subprocess.CalledProcessError as exc:
        if "nothing to commit" not in (exc.stderr or "") and "nothing to commit" not in (exc.stdout or ""):
            raise

    try:
        run_git(["pull", "--rebase", "--autostash"], REPO_ROOT)
    except subprocess.CalledProcessError as exc:
        raise RuntimeError(f"Git pull failed: {exc.stderr}") from exc

    run_git(["push"], REPO_ROOT)
    return file_url


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
        file_url = push_file_to_git(dest)
        set_progress(100, "تم الرفع!")
    except subprocess.CalledProcessError as exc:
        error_text = exc.stderr.strip() or exc.stdout.strip() or "فشل git"
        logger.error("Git error: %s", error_text)
        return jsonify({"error": error_text}), 500
    except RuntimeError as exc:
        logger.error("Git error: %s", exc)
        return jsonify({"error": str(exc)}), 500

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
