import os
import sys
import tkinter as tk
from tkinter import ttk, filedialog, messagebox

def create_markdown_from_directory(directory_path, output_path="project_overview.md"):
    """
    Scans a directory and creates a single Markdown file containing the content
    of all text-based files found.

    Args:
        directory_path (str): The path to the directory to scan.
        output_path (str): The path where the output Markdown file will be saved.

    Returns:
        str: The path to the created Markdown file.
    """
    # Common directories and files to ignore
    ignore_list = {
        "__pycache__",
        ".git",
        ".idea",
        ".vscode",
        "node_modules",
        "venv",
        ".env",
    }
    # Common file extensions to treat as text
    text_extensions = {
        ".py", ".pyw", ".txt", ".md", ".json", ".html", ".css", ".js", ".ts",
        ".xml", ".yaml", ".yml", ".ini", ".cfg", ".sh", ".bat",
    }

    with open(output_path, "w", encoding="utf-8", errors="ignore") as md_file:
        md_file.write(f"# Project Overview: {os.path.basename(directory_path)}\n\n")

        for root, dirs, files in os.walk(directory_path):
            # Exclude ignored directories
            dirs[:] = [d for d in dirs if d not in ignore_list]

            for file_name in files:
                # Check if the file has one of the desired extensions
                if any(file_name.lower().endswith(ext) for ext in text_extensions):
                    file_path = os.path.join(root, file_name)
                    
                    # Skip this script itself
                    if os.path.abspath(file_path) == os.path.abspath(__file__):
                        continue

                    relative_path = os.path.relpath(file_path, directory_path)
                    
                    # Use forward slashes for consistency in the markdown file
                    display_path = str(relative_path).replace('\\', '/')

                    md_file.write(f"## File: `{display_path}`\n\n")
                    
                    # Determine language for syntax highlighting
                    lang = file_name.split('.')[-1]
                    if lang == 'py' or lang == 'pyw':
                        lang = 'python'

                    md_file.write(f"```{lang}\n")
                    try:
                        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                            md_file.write(f.read())
                    except Exception:
                        # If reading fails, write a placeholder
                        md_file.write(f"--- Could not read file content ---")
                    md_file.write("\n```\n\n")

    return output_path

def get_desktop_path():
    return os.path.join(os.path.expanduser("~"), "Desktop")


class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Code to Markdown - GUI")
        self.geometry("640x240")

        self.input_path = tk.StringVar()
        self.output_path = tk.StringVar()

        # Input row
        frame_in = ttk.Frame(self)
        frame_in.pack(fill="x", padx=12, pady=(12, 6))

        ttk.Label(frame_in, text="مسار المشروع:").pack(side="left")
        self.entry_in = ttk.Entry(frame_in, textvariable=self.input_path, width=56)
        self.entry_in.pack(side="left", padx=8)
        ttk.Button(frame_in, text="اختيار...", command=self.browse_input).pack(side="left")

        # Output row
        frame_out = ttk.Frame(self)
        frame_out.pack(fill="x", padx=12, pady=(6, 6))

        ttk.Label(frame_out, text="حفظ الملف إلى:").pack(side="left")
        self.entry_out = ttk.Entry(frame_out, textvariable=self.output_path, width=48)
        self.entry_out.pack(side="left", padx=8)
        ttk.Button(frame_out, text="تحديد...", command=self.browse_output).pack(side="left")

        # Buttons
        frame_btn = ttk.Frame(self)
        frame_btn.pack(fill="x", padx=12, pady=(12, 8))

        ttk.Button(frame_btn, text="تشغيل", command=self.run).pack(side="left")
        ttk.Button(frame_btn, text="إغلاق", command=self.destroy).pack(side="right")

        # الوضع الافتراضي لمسار الحفظ = سطح المكتب
        default_out = os.path.join(get_desktop_path(), "project_overview.md")
        self.output_path.set(default_out)

    def browse_input(self):
        path = filedialog.askdirectory(title="اختر مجلد المشروع")
        if path:
            self.input_path.set(path)

    def browse_output(self):
        initialdir = get_desktop_path()
        filename = filedialog.asksaveasfilename(
            title="اختر ملف الحفظ",
            defaultextension=".md",
            filetypes=[("Markdown files", "*.md"), ("All files", "*.*")],
            initialdir=initialdir,
            initialfile="project_overview.md",
        )
        if filename:
            self.output_path.set(filename)

    def run(self):
        start = self.input_path.get().strip()
        out = self.output_path.get().strip()

        if not start:
            messagebox.showwarning("Missing", "من فضلك اختر مجلد المشروع (Project folder).")
            return

        if not os.path.isdir(start):
            messagebox.showerror("Invalid path", "المسار المدخل ليس مجلداً صالحاً.")
            return

        # إذا لم يُدخل المستخدم مسار حفظ، استخدم سطح المكتب
        if not out:
            out = os.path.join(get_desktop_path(), "project_overview.md")

        try:
            created = create_markdown_from_directory(start, output_path=out)
            messagebox.showinfo("Done", f"تم إنشاء الملف:\n{created}")
        except Exception as e:
            messagebox.showerror("Error", f"حدث خطأ أثناء الإنشاء:\n{e}")


def main():
    app = App()
    app.mainloop()


if __name__ == '__main__':
    main()