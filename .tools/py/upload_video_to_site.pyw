import shutil
import subprocess
from datetime import datetime
from pathlib import Path
from tkinter import Tk, Text, ttk, filedialog, messagebox, StringVar
from urllib.parse import quote


REPO_ROOT = Path(__file__).resolve().parents[2]
ASSETS_DIR = REPO_ROOT / "assets" / "video" / "work"
BASE_URL = "https://elwa2.github.io/portfolio/assets/video/work"


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


def upload_video(status_var, log_box):
    src_path = filedialog.askopenfilename(
        title="اختيار ملف فيديو",
        filetypes=[
            ("Video files", "*.mp4;*.mov;*.mkv;*.webm;*.avi;*.wmv"),
            ("All files", "*.*"),
        ],
    )
    if not src_path:
        return

    src = Path(src_path)
    if not src.exists():
        messagebox.showerror("خطأ", "الملف غير موجود.")
        return

    try:
        ASSETS_DIR.mkdir(parents=True, exist_ok=True)
        dest = unique_destination(ASSETS_DIR, src.name)
        shutil.copy2(src, dest)

        rel_path = dest.relative_to(REPO_ROOT).as_posix()
        status_var.set("جارٍ رفع الملف إلى GitHub...")
        log_box.insert("end", f"تم نسخ الملف إلى: {dest}\n")

        run_git(["add", rel_path], REPO_ROOT)
        try:
            run_git(["commit", "-m", f"Add video {dest.name}"], REPO_ROOT)
        except subprocess.CalledProcessError as exc:
            if "nothing to commit" not in (exc.stderr or "") and "nothing to commit" not in (exc.stdout or ""):
                raise

        # Ensure we are up to date before pushing
        try:
            run_git(["pull", "--rebase"], REPO_ROOT)
        except subprocess.CalledProcessError as exc:
            error_text = exc.stderr.strip() or exc.stdout.strip() or "فشل git pull."
            log_box.insert("end", f"فشل git pull:\n{error_text}\n")
            status_var.set("فشل الرفع.")
            messagebox.showerror("خطأ Git", error_text)
            return

        run_git(["push"], REPO_ROOT)

        file_url = f"{BASE_URL}/{quote(dest.name)}"
        log_box.insert("end", f"تم الرفع بنجاح.\nالرابط: {file_url}\n")
        status_var.set("تم الرفع بنجاح.")
        messagebox.showinfo("تم", f"الرابط:\n{file_url}")
    except subprocess.CalledProcessError as exc:
        error_text = exc.stderr.strip() or exc.stdout.strip() or "خطأ غير معروف."
        log_box.insert("end", f"فشل أمر git:\n{error_text}\n")
        status_var.set("فشل الرفع.")
        messagebox.showerror("خطأ Git", error_text)
    except Exception as exc:
        log_box.insert("end", f"خطأ: {exc}\n")
        status_var.set("فشل الرفع.")
        messagebox.showerror("خطأ", str(exc))


def main():
    root = Tk()
    root.title("رفع فيديو للموقع")
    root.geometry("520x320")

    status_var = StringVar(value="جاهز.")

    frame = ttk.Frame(root, padding=12)
    frame.pack(fill="both", expand=True)

    ttk.Label(
        frame,
        text="اختر ملف الفيديو وسيتم نسخه إلى assets/video/work ثم رفعه إلى GitHub.",
        wraplength=480,
        justify="left",
    ).pack(anchor="w")

    ttk.Button(
        frame,
        text="اختيار فيديو ورفعه",
        command=lambda: upload_video(status_var, log_box),
    ).pack(pady=10, anchor="w")

    log_box = Text(frame, height=10)
    log_box.pack(fill="both", expand=True)

    ttk.Label(frame, textvariable=status_var).pack(anchor="w", pady=(8, 0))

    root.mainloop()


if __name__ == "__main__":
    main()
