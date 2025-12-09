#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
أداة إضافة مشاريع جديدة للـ Portfolio
=====================================
نسخة واجهة رسومية (GUI)
"""

import os
import sys
import json
import re
import threading
import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

# محاولة استيراد المكتبات المطلوبة
try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

try:
    from bs4 import BeautifulSoup
    BS4_AVAILABLE = True
except ImportError:
    BS4_AVAILABLE = False


# المسارات
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
IMAGES_DIR = PROJECT_ROOT / "assets" / "images" / "prt"
PROJECTS_FILE = SCRIPT_DIR / "projects.json"
INDEX_HTML = PROJECT_ROOT / "index.html"
PORTFOLIO_HTML = PROJECT_ROOT / "portfolio.html"


class PortfolioManager:
    """كلاس لإدارة العمليات المنطقية"""
    
    @staticmethod
    def load_projects():
        if PROJECTS_FILE.exists():
            with open(PROJECTS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {"projects": []}

    @staticmethod
    def save_projects(data):
        with open(PROJECTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    @staticmethod
    def get_next_image_number():
        existing_images = list(IMAGES_DIR.glob("*.jpeg")) + list(IMAGES_DIR.glob("*.jpg")) + list(IMAGES_DIR.glob("*.png"))
        max_num = 0
        for img in existing_images:
            match = re.match(r'(\d+)\.', img.name)
            if match:
                num = int(match.group(1))
                if num > max_num:
                    max_num = num
        return max_num + 1

    @staticmethod
    def optimize_image(image_path, max_width=1200):
        if not PIL_AVAILABLE:
            return
        try:
            img = Image.open(image_path)
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
                
            img.save(image_path, 'JPEG', quality=85, optimize=True)
        except Exception as e:
            print(f"Error optimizing image: {e}")

    @staticmethod
    def update_html(project_data, image_filename):
        if not BS4_AVAILABLE:
            return False, "مكتبة Beautiful Soup غير مثبتة"
            
        image_path = f"assets/images/prt/{image_filename}"
        
        # 1. Update index.html
        try:
            with open(INDEX_HTML, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_item = f'''            <a href="{project_data['url']}" target="_blank" class="portfolio-slider-item">
              <img src="{image_path}" alt="{project_data['name']}" />
            </a>
'''
            pattern = r'(<!-- الصف الأول.*?)(</div>\s*\n\s*<!-- الصف الثاني)'
            content = re.sub(pattern, lambda m: m.group(1) + new_item + m.group(2), content, flags=re.DOTALL)
            
            with open(INDEX_HTML, 'w', encoding='utf-8') as f:
                f.write(content)
        except Exception as e:
            return False, f"خطأ في index.html: {e}"

        # 2. Update portfolio.html
        try:
            with open(PORTFOLIO_HTML, 'r', encoding='utf-8') as f:
                content = f.read()
            
            category = project_data.get('category', 'all')
            new_item = f'''
            <a href="{image_path}" data-lightbox="portfolio" data-title="{project_data['name']}" 
               class="portfolio-item" data-category="{category}">
                <div class="portfolio-image">
                    <img src="{image_path}" alt="{project_data['name']}" loading="lazy" />
                </div>
            </a>
'''
            pattern = r'(class="portfolio-grid"[^>]*>)'
            content = re.sub(pattern, lambda m: m.group(1) + new_item, content, count=1)
            
            with open(PORTFOLIO_HTML, 'w', encoding='utf-8') as f:
                f.write(content)
        except Exception as e:
            return False, f"خطأ في portfolio.html: {e}"
            
        return True, "تم التحديث بنجاح"


class AddProjectApp:
    def __init__(self, root):
        self.root = root
        self.root.title("إضافة مشروع جديد")
        self.root.geometry("600x450")
        self.root.resizable(False, False)
        
        # Style
        style = ttk.Style()
        style.configure("TButton", padding=6, font=('Segoe UI', 10))
        style.configure("TLabel", font=('Segoe UI', 11))
        style.configure("Header.TLabel", font=('Segoe UI', 14, 'bold'))
        
        # Main Frame
        main_frame = ttk.Frame(root, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Header
        header = ttk.Label(main_frame, text="إضافة مشروع للـ Portfolio", style="Header.TLabel")
        header.pack(pady=(0, 20))
        
        # URL Input
        input_frame = ttk.Frame(main_frame)
        input_frame.pack(fill=tk.X, pady=10)
        
        ttk.Label(input_frame, text="رابط الموقع:").pack(anchor='ne')
        self.url_var = tk.StringVar()
        self.url_entry = ttk.Entry(input_frame, textvariable=self.url_var, font=('Consolas', 10), justify='left')
        self.url_entry.pack(fill=tk.X, pady=5)
        self.url_entry.focus()
        
        # Options Frame (Read Only mainly)
        options_frame = ttk.LabelFrame(main_frame, text="معلومات", padding=10)
        options_frame.pack(fill=tk.X, pady=10)
        
        ttk.Label(options_frame, text="سيتم استخراج الاسم والفئة وتصوير الشاشة تلقائياً", foreground="gray").pack()
        
        # Progress
        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(main_frame, variable=self.progress_var, maximum=100)
        self.progress_bar.pack(fill=tk.X, pady=20)
        
        # Status Label
        self.status_var = tk.StringVar(value="جاهز للعمل...")
        self.status_label = ttk.Label(main_frame, textvariable=self.status_var, font=('Segoe UI', 9), foreground="#555")
        self.status_label.pack(pady=5)
        
        # Buttons
        btn_frame = ttk.Frame(main_frame)
        btn_frame.pack(fill=tk.X, pady=10)
        
        self.add_btn = ttk.Button(btn_frame, text="🚀 بدء الإضافة", command=self.start_process)
        self.add_btn.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        # Check libs
        self.check_libraries()

    def check_libraries(self):
        missing = []
        if not PLAYWRIGHT_AVAILABLE: missing.append("Playwright")
        if not PIL_AVAILABLE: missing.append("Pillow")
        if not BS4_AVAILABLE: missing.append("BeautifulSoup4")
        
        if missing:
            msg = "المكتبات التالية غير مثبتة:\n" + "\n".join(missing)
            messagebox.showwarning("تنبيه", msg)
            self.add_btn.state(['disabled'])

    def log(self, message, progress=None):
        self.status_var.set(message)
        if progress is not None:
            self.progress_var.set(progress)
        self.root.update_idletasks()

    def start_process(self):
        url = self.url_var.get().strip()
        if not url:
            messagebox.showerror("خطأ", "الرجاء إدخال الرابط")
            return
            
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
            self.url_var.set(url)

        self.add_btn.state(['disabled'])
        self.url_entry.state(['disabled'])
        self.progress_var.set(0)
        
        # Run in thread
        threading.Thread(target=self.process_thread, args=(url,), daemon=True).start()

    def process_thread(self, url):
        import subprocess
        
        try:
            self.log("جاري تشغيل المتصفح...", 10)
            
            def launch_browser(p):
                return p.chromium.launch(headless=True)

            with sync_playwright() as p:
                try:
                    browser = launch_browser(p)
                except Exception as e:
                    if "Executable doesn't exist" in str(e):
                        self.log("جاري تثبيت ملفات المتصفح (قد يستغرق وقتاً)...", 15)
                        # Auto-install chromium
                        try:
                            # Run the install command
                            subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], check=True)
                            self.log("تم تثبيت المتصفح! جاري المحاولة مرة أخرى...", 20)
                            browser = launch_browser(p)
                        except Exception as install_error:
                             raise Exception(f"فشل تثبيت المتصفح تلقائياً. حاول تشغيل 'playwright install chromium' يدوياً.\nالتفاصيل: {install_error}")
                    else:
                        raise e

                # Setup Context
                context = browser.new_context(viewport={"width": 1920, "height": 1080})
                page = context.new_page()
                
                self.log(f"جاري فتح: {url}", 30)
                try:
                    page.goto(url, wait_until="domcontentloaded", timeout=90000)
                    # انتظار إضافي لتحميل المحتوى
                    page.wait_for_timeout(3000)
                except Exception as nav_error:
                    print(f"Navigation warning: {nav_error}")
                    # المتابعة على أي حال - الصفحة قد تكون محملة جزئياً
                
                # 1. Extract Name
                self.log("جاري استخراج البيانات...", 50)
                page_title = page.title()
                
                project_name = page_title.strip()
                if not project_name:
                    parsed = urlparse(url)
                    project_name = parsed.netloc.replace('www.', '').split('.')[0].capitalize()
                
                # 2. Detect Category
                domain = urlparse(url).netloc
                if 'salla' in domain or 'salla' in url:
                    category = 'salla'
                elif 'zid' in domain or 'zid' in url:
                    category = 'zid'
                else:
                    category = 'website'
                
                self.log(f"تم العثور على: {project_name} ({category})", 60)
                
                # 3. Scroll down to load all products/images
                self.log("جاري التمرير لتحميل كل المحتوى...", 65)
                
                # Scroll down gradually to trigger lazy loading
                for i in range(5):
                    page.evaluate(f"window.scrollTo(0, document.body.scrollHeight * {(i+1)/5})")
                    page.wait_for_timeout(800)
                
                # Scroll back to top for screenshot
                page.evaluate("window.scrollTo(0, 0)")
                page.wait_for_timeout(500)
                
                # 4. Screenshot
                self.log("جاري التقاط الصورة...", 70)
                
                IMAGES_DIR.mkdir(parents=True, exist_ok=True)
                image_num = PortfolioManager.get_next_image_number()
                image_filename = f"{image_num}.jpeg"
                image_path = IMAGES_DIR / image_filename
                
                page.screenshot(path=str(image_path), full_page=True)
                browser.close()
                
                # 5. Optimize
                self.log("جاري تحسين الصورة...", 80)
                PortfolioManager.optimize_image(image_path)
                
                # 6. Save Data
                self.log("جاري حفظ البيانات...", 90)
                project_data = {
                    "name": project_name,
                    "url": url,
                    "image": f"assets/images/prt/{image_filename}",
                    "category": category,
                    "addedDate": datetime.now().strftime("%Y-%m-%d")
                }
                
                projects = PortfolioManager.load_projects()
                projects["projects"].append(project_data)
                PortfolioManager.save_projects(projects)
                
                # 7. Update HTML
                success, msg = PortfolioManager.update_html(project_data, image_filename)
                
                self.log("اكتملت العملية!", 100)
                
                self.root.after(0, lambda: self.on_success(project_name))

        except Exception as e:
            error_message = str(e)  # حفظ الرسالة في متغير لتجنب NameError
            self.root.after(0, lambda err=error_message: self.on_error(err))

    def on_success(self, name):
        messagebox.showinfo("تم بنجاح", f"تم إضافة المشروع:\n{name}")
        self.reset_ui()

    def on_error(self, error_msg):
        messagebox.showerror("خطأ", f"حدث خطأ أثناء العملية:\n{error_msg}")
        self.reset_ui()

    def reset_ui(self):
        self.add_btn.state(['!disabled'])
        self.url_entry.state(['!disabled'])
        self.progress_var.set(0)
        self.status_var.set("جاهز للعمل...")
        self.url_var.set("")


def main():
    root = tk.Tk()
    # Center window
    window_width = 600
    window_height = 450
    screen_width = root.winfo_screenwidth()
    screen_height = root.winfo_screenheight()
    center_x = int(screen_width/2 - window_width/2)
    center_y = int(screen_height/2 - window_height/2)
    root.geometry(f'{window_width}x{window_height}+{center_x}+{center_y}')
    
    app = AddProjectApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()
