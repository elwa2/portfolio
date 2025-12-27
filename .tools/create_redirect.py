import os
import sys
import tkinter as tk
from tkinter import messagebox

def create_redirect(target_url, filename, title="جارى تحويلك...", message="مشاهدة أعمالنا بتصميم رهيب"):
    """
    Generates a professional redirect HTML page in the 'form/' directory.
    """
    try:
        # Ensure the 'form' directory exists
        form_dir = os.path.join(os.getcwd(), 'form')
        if not os.path.exists(form_dir):
            os.makedirs(form_dir)

        # Sanitize filename
        if not filename.endswith('.html'):
            filename += '.html'
        
        filepath = os.path.join(form_dir, filename)

        # HTML Template
        template = f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        :root {{
            --primary-color: #5e3bee;
            --primary-light: #7d56f9;
            --bg-color: #0f0f1a;
            --card-bg: rgba(26, 26, 46, 0.8);
            --text-color: #ffffff;
            --transition: all 0.3s ease;
        }}

        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Tajawal', sans-serif;
        }}

        body {{
            background-color: var(--bg-color);
            color: var(--text-color);
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            position: relative;
        }}

        .blobs {{
            position: absolute;
            width: 100%;
            height: 100%;
            z-index: 0;
            overflow: hidden;
        }}

        .blob {{
            position: absolute;
            width: 300px;
            height: 300px;
            background: var(--primary-color);
            filter: blur(80px);
            border-radius: 50%;
            opacity: 0.3;
            animation: float 10s infinite alternate;
        }}

        .blob:nth-child(1) {{ top: -100px; left: -100px; background: #7d56f9; }}
        .blob:nth-child(2) {{ bottom: -100px; right: -100px; background: #5e3bee; animation-delay: -5s; }}

        @keyframes float {{
            from {{ transform: translate(0, 0) scale(1); }}
            to {{ transform: translate(50px, 50px) scale(1.2); }}
        }}

        .card {{
            background: var(--card-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            z-index: 1;
            width: 90%;
            max-width: 500px;
            animation: fadeIn 0.8s ease-out;
        }}

        @keyframes fadeIn {{
            from {{ opacity: 0; transform: translateY(20px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}

        .logo {{
            width: 80px;
            margin-bottom: 25px;
            animation: pulse 2s infinite;
        }}

        @keyframes pulse {{
            0% {{ transform: scale(1); opacity: 0.8; }}
            50% {{ transform: scale(1.05); opacity: 1; }}
            100% {{ transform: scale(1); opacity: 0.8; }}
        }}

        h1 {{
            font-size: 1.8rem;
            margin-bottom: 15px;
            background: linear-gradient(135deg, #fff 0%, #a78bfa 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}

        p {{
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 30px;
            font-size: 1.1rem;
        }}

        .progress-container {{
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            margin-bottom: 20px;
            overflow: hidden;
        }}

        .progress-bar {{
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
            border-radius: 10px;
            animation: load 3s linear forwards;
        }}

        @keyframes load {{
            to {{ width: 100%; }}
        }}

        .footer-text {
            font-size: 0.95rem;
            color: rgba(255, 255, 255, 0.6);
            margin-top: 25px;
            line-height: 1.6;
        }

        .manual-link-wrapper {
            margin-top: 15px;
            padding: 10px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            display: inline-block;
            word-break: break-all;
        }

        .manual-link {
            color: var(--primary-light);
            text-decoration: none;
            font-weight: 500;
            transition: var(--transition);
            border-bottom: 1px dashed var(--primary-light);
        }

        .manual-link:hover {
            color: #fff;
            border-bottom-style: solid;
        }

        .portfolio-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-top: 15px;
            color: var(--text-color);
            background: rgba(255, 255, 255, 0.1);
            padding: 8px 15px;
            border-radius: 50px;
            font-size: 0.9rem;
            text-decoration: none;
            transition: var(--transition);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .portfolio-link:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="blobs">
        <div class="blob"></div>
        <div class="blob"></div>
    </div>

    <div class="card">
        <svg class="logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" stroke-width="2"/>
            <path d="M12 6V12L16 14" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
        
        <h1>{title}</h1>
        <p>{message}</p>

        <a href="../index.html" class="portfolio-link">
            <span>🏠 العودة للرئيسية ومشاهدة الأعمال</span>
        </a>
        
        <div class="progress-container" style="margin-top: 30px;">
            <div class="progress-bar"></div>
        </div>
        
        <div class="footer-text">
            إذا لم يتم تحويلك تلقائياً خلال ثوانٍ، يرجى الضغط على الرابط التالي:
            <div class="manual-link-wrapper">
                <a href="{target_url}" class="manual-link">{target_url}</a>
            </div>
        </div>
    </div>

    <script>
        setTimeout(function() {{
            window.location.href = "{target_url}";
        }}, 3000);
    </script>
</body>
</html>"""

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(template)
        
        return filepath
    except Exception as e:
        return str(e)

def run_gui():
    root = tk.Tk()
    root.title("أداة إنشاء روابط التحويل")
    root.geometry("500x550")
    root.configure(bg="#0f0f1a")
    root.resizable(False, False)

    # Styling colors
    primary = "#5e3bee"
    white = "#ffffff"
    bg_dark = "#1a1a2e"

    title_font = ("Tajawal", 16, "bold")
    label_font = ("Tajawal", 10)

    # Top Margin
    tk.Label(root, text="", bg="#0f0f1a").pack(pady=5)

    tk.Label(root, text="إنشاء صفحة تحويل احترافية", font=title_font, fg=white, bg="#0f0f1a").pack(pady=10)

    # Input Frame
    frame = tk.Frame(root, bg="#0f0f1a")
    frame.pack(padx=30, pady=5, fill="x")

    def create_label_entry(parent, label_text, default_text=""):
        tk.Label(parent, text=label_text, fg="#a78bfa", bg="#0f0f1a", font=label_font, anchor="e").pack(fill="x", pady=(8, 0))
        entry = tk.Entry(parent, font=("Tajawal", 11), bg=bg_dark, fg=white, insertbackground=white, borderwidth=0)
        entry.insert(0, default_text)
        entry.pack(fill="x", ipady=6)
        # Fake border/bottom line
        line = tk.Frame(parent, height=2, bg=primary)
        line.pack(fill="x")
        return entry

    url_entry = create_label_entry(frame, "رابط الموقع (Target URL):", "https://")
    name_entry = create_label_entry(frame, "اسم الملف (Filename):", "redirect")
    title_input = create_label_entry(frame, "عنوان الصفحة (Page Title):", "جارى تحويلك...")
    msg_input = create_label_entry(frame, "رسالة التحويل (Message):", "شاهد أعمالنا بتصميم رهيب")

    def on_submit():
        url = url_entry.get().strip()
        name = name_entry.get().strip()
        t = title_input.get().strip()
        m = msg_input.get().strip()

        if not url or url == "https://":
            messagebox.showerror("خطأ", "يرجى إدخال رابط الموقع")
            return
        if not name:
            messagebox.showerror("خطأ", "يرجى إدخال اسم الملف")
            return

        res = create_redirect(url, name, t, m)
        if res.endswith(".html"):
            messagebox.showinfo("تم بنجاح", f"تم إنشاء الصفحة بنجاح في:\n{res}")
        else:
            messagebox.showerror("خطأ", f"حدث خطأ: {res}")

    # Submit Button Container for proper padding
    btn_frame = tk.Frame(root, bg="#0f0f1a")
    btn_frame.pack(pady=20)

    btn = tk.Button(btn_frame, text="إنشاء الصفحة الآن", font=("Tajawal", 12, "bold"), bg=primary, fg=white, 
                    activebackground="#7d56f9", activeforeground=white, bd=0, cursor="hand2", padx=20, pady=5, command=on_submit)
    btn.pack(ipadx=40, ipady=8)

    root.mainloop()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # CLI Mode
        if len(sys.argv) < 3:
            print("Usage: python create_redirect.py <URL> <FILENAME> [TITLE] [MESSAGE]")
        else:
            url = sys.argv[1]
            name = sys.argv[2]
            title = sys.argv[3] if len(sys.argv) > 3 else "جارى تحويلك..."
            msg = sys.argv[4] if len(sys.argv) > 4 else "مشاهدة أعمالنا بتصميم رهيب"
            result = create_redirect(url, name, title, msg)
            if result.endswith(".html"):
                print(f"✅ Success! Created at: {result}")
            else:
                print(f"❌ Error: {result}")
    else:
        # GUI Mode
        run_gui()
