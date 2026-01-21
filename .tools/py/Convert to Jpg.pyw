# احفظ هذا الملف بامتداد .pyw
from tkinter import *
from tkinter import filedialog, messagebox
from PIL import Image
import os
import uuid
import sys
import traceback

def log_error(error):
    """تسجيل الأخطاء في ملف"""
    with open("error_log.txt", "a", encoding="utf-8") as f:
        f.write(f"Error: {str(error)}\n")
        traceback.print_exc(file=f)

def process_files():
    try:
        main_folder = filedialog.askdirectory(title="اختر المجلد الرئيسي")
        if not main_folder:
            return
        
        output_folder = os.path.join(main_folder, "converted_jpg")
        os.makedirs(output_folder, exist_ok=True)
        
        # تحويل الصور إلى JPG
        converted_files = []
        for filename in os.listdir(main_folder):
            try:
                file_path = os.path.join(main_folder, filename)
                if filename.lower().endswith((".png", ".jpeg", ".bmp", ".gif")):
                    with Image.open(file_path) as img:
                        temp_name = f"temp_{uuid.uuid4().hex}.jpg"
                        save_path = os.path.join(output_folder, temp_name)
                        img.convert("RGB").save(save_path, "JPEG", quality=95)
                        converted_files.append(save_path)
            except Exception as e:
                log_error(e)
                messagebox.showerror("خطأ", f"فشل في معالجة الملف: {filename}")
        
        # إعادة تسمية الملفات المحولة
        for file_path in converted_files:
            try:
                new_name = f"{uuid.uuid4().hex}.jpg"
                new_path = os.path.join(output_folder, new_name)
                os.rename(file_path, new_path)
            except Exception as e:
                log_error(e)
                messagebox.showerror("خطأ", "فشل في إعادة التسمية")
        
        messagebox.showinfo("تم بنجاح", f"تم حفظ النتائج في:\n{output_folder}")
        window.destroy()
    
    except Exception as e:
        log_error(e)
        messagebox.showerror("خطأ فادح", "حدث خطأ غير متوقع!")
        window.destroy()

if __name__ == "__main__":
    try:
        window = Tk()
        window.withdraw()  # إخفاء النافذة الرئيسية مؤقتًا
        
        # التحقق من تثبيت المكتبات المطلوبة
        try:
            from PIL import Image
        except ImportError:
            messagebox.showerror("خطأ", "يجب تثبيت مكتبة Pillow أولاً!\nافتح cmd وأكتب:\npip install pillow")
            sys.exit()
        
        window.deiconify()  # إظهار النافذة الرئيسية
        window.title("محول الصور المتكامل")
        window.geometry("400x150")
        
        frame = Frame(window)
        frame.pack(pady=30)
        
        btn_style = {
            "font": ("Arial", 14),
            "bg": "#2196F3",
            "fg": "white",
            "width": 20,
            "height": 2
        }
        
        start_btn = Button(frame, text="بدء العملية", command=process_files, **btn_style)
        start_btn.pack()
        
        window.mainloop()
    
    except Exception as e:
        log_error(e)
        messagebox.showerror("خطء تشغيل", "تعذر تشغيل البرنامج!")