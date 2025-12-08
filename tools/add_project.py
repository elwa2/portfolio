#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
أداة إضافة مشاريع جديدة للـ Portfolio
=====================================
تقوم هذه الأداة بـ:
1. التقاط screenshot كامل للموقع
2. حفظ الصورة في مجلد الصور
3. تحديث ملفات HTML تلقائياً
"""

import os
import sys
import json
import re
from datetime import datetime
from pathlib import Path

# محاولة استيراد المكتبات المطلوبة
try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("⚠️  تحذير: مكتبة playwright غير مثبتة")
    print("   قم بتثبيتها باستخدام: pip install playwright")
    print("   ثم: playwright install chromium")

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("⚠️  تحذير: مكتبة Pillow غير مثبتة")
    print("   قم بتثبيتها باستخدام: pip install Pillow")

try:
    from bs4 import BeautifulSoup
    BS4_AVAILABLE = True
except ImportError:
    BS4_AVAILABLE = False
    print("⚠️  تحذير: مكتبة beautifulsoup4 غير مثبتة")
    print("   قم بتثبيتها باستخدام: pip install beautifulsoup4")


# المسارات
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
IMAGES_DIR = PROJECT_ROOT / "assets" / "images" / "prt"
PROJECTS_FILE = SCRIPT_DIR / "projects.json"
INDEX_HTML = PROJECT_ROOT / "index.html"
PORTFOLIO_HTML = PROJECT_ROOT / "portfolio.html"


def load_projects():
    """تحميل بيانات المشاريع من ملف JSON"""
    if PROJECTS_FILE.exists():
        with open(PROJECTS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"projects": []}


def save_projects(data):
    """حفظ بيانات المشاريع في ملف JSON"""
    with open(PROJECTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_next_image_number():
    """الحصول على رقم الصورة التالي"""
    existing_images = list(IMAGES_DIR.glob("*.jpeg")) + list(IMAGES_DIR.glob("*.jpg")) + list(IMAGES_DIR.glob("*.png"))
    
    max_num = 0
    for img in existing_images:
        # استخراج الرقم من اسم الملف
        match = re.match(r'(\d+)\.', img.name)
        if match:
            num = int(match.group(1))
            if num > max_num:
                max_num = num
    
    return max_num + 1


def capture_screenshot(url, output_path):
    """التقاط screenshot كامل للموقع"""
    if not PLAYWRIGHT_AVAILABLE:
        print("❌ لا يمكن التقاط screenshot بدون مكتبة playwright")
        return False
    
    print(f"📸 جاري التقاط screenshot لـ: {url}")
    
    try:
        with sync_playwright() as p:
            # تشغيل المتصفح
            browser = p.chromium.launch(headless=True)
            
            # إنشاء صفحة جديدة بحجم مناسب
            page = browser.new_page(
                viewport={"width": 1920, "height": 1080}
            )
            
            # الذهاب للموقع
            page.goto(url, wait_until="networkidle", timeout=60000)
            
            # انتظار تحميل الصفحة
            page.wait_for_timeout(3000)
            
            # التقاط screenshot كامل للصفحة
            page.screenshot(path=str(output_path), full_page=True)
            
            browser.close()
            
        print(f"✅ تم حفظ Screenshot في: {output_path}")
        return True
        
    except Exception as e:
        print(f"❌ خطأ في التقاط Screenshot: {e}")
        return False


def optimize_image(image_path, max_width=1200):
    """تحسين وضغط الصورة"""
    if not PIL_AVAILABLE:
        print("⚠️  تخطي تحسين الصورة (Pillow غير مثبت)")
        return
    
    try:
        img = Image.open(image_path)
        
        # تغيير حجم الصورة إذا كانت كبيرة جداً
        if img.width > max_width:
            ratio = max_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
        # تحويل إلى RGB إذا لزم الأمر
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        
        # حفظ بجودة مناسبة
        img.save(image_path, 'JPEG', quality=85, optimize=True)
        
        print(f"✅ تم تحسين الصورة")
        
    except Exception as e:
        print(f"⚠️  خطأ في تحسين الصورة: {e}")


def update_html_files(project_data, image_filename):
    """تحديث ملفات HTML بالمشروع الجديد"""
    if not BS4_AVAILABLE:
        print("⚠️  تخطي تحديث HTML (beautifulsoup4 غير مثبت)")
        return
    
    image_path = f"assets/images/prt/{image_filename}"
    
    # تحديث index.html - إضافة في السلايدر
    try:
        with open(INDEX_HTML, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # البحث عن آخر عنصر في السلايدر الأول
        new_item = f'''            <a href="{project_data['url']}" target="_blank" class="portfolio-slider-item">
              <img src="{image_path}" alt="{project_data['name']}" />
            </a>
'''
        
        # إضافة العنصر الجديد قبل نهاية السلايدر الأول
        pattern = r'(<!-- الصف الأول.*?)(</div>\s*\n\s*<!-- الصف الثاني)'
        
        def add_item(match):
            return match.group(1) + new_item + match.group(2)
        
        content = re.sub(pattern, add_item, content, flags=re.DOTALL)
        
        with open(INDEX_HTML, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ تم تحديث index.html")
        
    except Exception as e:
        print(f"⚠️  خطأ في تحديث index.html: {e}")
    
    # تحديث portfolio.html
    try:
        with open(PORTFOLIO_HTML, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # إضافة عنصر جديد في grid الأعمال
        category = project_data.get('category', 'all')
        new_portfolio_item = f'''
            <a href="{image_path}" data-lightbox="portfolio" data-title="{project_data['name']}" 
               class="portfolio-item" data-category="{category}">
                <div class="portfolio-image">
                    <img src="{image_path}" alt="{project_data['name']}" loading="lazy" />
                </div>
            </a>
'''
        
        # البحث عن نهاية grid الأعمال
        pattern = r'(class="portfolio-grid"[^>]*>)'
        
        def add_portfolio_item(match):
            return match.group(1) + new_portfolio_item
        
        content = re.sub(pattern, add_portfolio_item, content, count=1)
        
        with open(PORTFOLIO_HTML, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ تم تحديث portfolio.html")
        
    except Exception as e:
        print(f"⚠️  خطأ في تحديث portfolio.html: {e}")


def add_project():
    """إضافة مشروع جديد"""
    print("\n" + "="*50)
    print("🚀 أداة إضافة مشروع جديد للـ Portfolio")
    print("="*50 + "\n")
    
    # إدخال بيانات المشروع
    name = input("📝 اسم المشروع/الموقع: ").strip()
    if not name:
        print("❌ اسم المشروع مطلوب")
        return
    
    url = input("🔗 رابط الموقع (https://...): ").strip()
    if not url:
        print("❌ رابط الموقع مطلوب")
        return
    
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    print("\n📂 الفئات المتاحة:")
    print("   1. salla - متاجر سلة")
    print("   2. zid - متاجر زد")
    print("   3. website - مواقع عامة")
    print("   4. other - أخرى")
    
    category_choice = input("🏷️  اختر رقم الفئة [1]: ").strip() or "1"
    categories = {"1": "salla", "2": "zid", "3": "website", "4": "other"}
    category = categories.get(category_choice, "salla")
    
    # إنشاء مجلد الصور إذا لم يكن موجوداً
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    
    # تحديد اسم ملف الصورة
    image_num = get_next_image_number()
    image_filename = f"{image_num}.jpeg"
    image_path = IMAGES_DIR / image_filename
    
    # التقاط Screenshot
    print("\n")
    success = capture_screenshot(url, image_path)
    
    if success:
        # تحسين الصورة
        optimize_image(image_path)
    else:
        # السماح بإضافة صورة يدوياً
        manual = input("\n❓ هل تريد إضافة صورة يدوياً؟ (y/n): ").strip().lower()
        if manual != 'y':
            return
        
        print(f"📁 قم بإضافة الصورة في: {image_path}")
        input("   اضغط Enter بعد إضافة الصورة...")
        
        if not image_path.exists():
            print("❌ لم يتم العثور على الصورة")
            return
    
    # إنشاء بيانات المشروع
    project_data = {
        "name": name,
        "url": url,
        "image": f"assets/images/prt/{image_filename}",
        "category": category,
        "addedDate": datetime.now().strftime("%Y-%m-%d")
    }
    
    # حفظ في ملف JSON
    projects = load_projects()
    projects["projects"].append(project_data)
    save_projects(projects)
    print(f"✅ تم حفظ بيانات المشروع في projects.json")
    
    # تحديث ملفات HTML
    update_html_files(project_data, image_filename)
    
    print("\n" + "="*50)
    print("✅ تم إضافة المشروع بنجاح!")
    print("="*50)
    print(f"   📛 الاسم: {name}")
    print(f"   🔗 الرابط: {url}")
    print(f"   📁 الصورة: {image_path}")
    print(f"   🏷️  الفئة: {category}")
    print("="*50 + "\n")


def list_projects():
    """عرض قائمة المشاريع"""
    projects = load_projects()
    
    if not projects["projects"]:
        print("📭 لا توجد مشاريع مسجلة")
        return
    
    print("\n" + "="*50)
    print("📋 قائمة المشاريع")
    print("="*50)
    
    for i, project in enumerate(projects["projects"], 1):
        print(f"\n{i}. {project['name']}")
        print(f"   🔗 {project['url']}")
        print(f"   📁 {project['image']}")
        print(f"   🏷️  {project['category']}")
        print(f"   📅 {project.get('addedDate', 'غير محدد')}")
    
    print("\n" + "="*50 + "\n")


def show_help():
    """عرض المساعدة"""
    print("""
أداة إدارة مشاريع Portfolio
===========================

الاستخدام:
  python add_project.py [أمر]

الأوامر:
  add      إضافة مشروع جديد (الافتراضي)
  list     عرض قائمة المشاريع
  help     عرض هذه المساعدة

المتطلبات:
  pip install playwright beautifulsoup4 Pillow
  playwright install chromium

أمثلة:
  python add_project.py
  python add_project.py add
  python add_project.py list
""")


def main():
    """الدالة الرئيسية"""
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "add":
            add_project()
        elif command == "list":
            list_projects()
        elif command in ("help", "-h", "--help"):
            show_help()
        else:
            print(f"❌ أمر غير معروف: {command}")
            show_help()
    else:
        add_project()


if __name__ == "__main__":
    main()
