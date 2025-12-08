# Ali Ahmed Portfolio | مصمم منصة زد وسلة

<div align="center">

![Portfolio Logo](assets/images/logo.svg)

**موقع Portfolio احترافي لعرض أعمال تصميم متاجر سلة وزد**

[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue?style=for-the-badge&logo=github)](https://elwa2.github.io/portfolio)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

</div>

---

## 📋 نظرة عامة

موقع Portfolio احترافي لعرض أعمال تصميم وتطوير متاجر منصتي **سلة** و**زد**. يتميز الموقع بـ:

- ✅ تصميم عصري ومتجاوب
- ✅ دعم الوضع الداكن والفاتح
- ✅ مكونات موحدة (Header/Footer)
- ✅ تأثيرات حركة احترافية
- ✅ أداة Python لإضافة مشاريع جديدة

## 🚀 المميزات

| الميزة               | الوصف                               |
| -------------------- | ----------------------------------- |
| 🎨 **تصميم احترافي** | تصميم عصري مع تأثيرات Glassmorphism |
| 📱 **متجاوب**        | يعمل على جميع الأجهزة               |
| 🌙 **الوضع الداكن**  | دعم كامل للوضع الداكن               |
| ⚡ **سريع**          | تحسين الأداء وتحميل الصور           |
| 🛠️ **قابل للتخصيص**  | مكونات موحدة سهلة التعديل           |

## 📁 هيكل المشروع

```
portfolio/
├── index.html              # الصفحة الرئيسية
├── about.html              # من نحن
├── services.html           # الخدمات
├── portfolio.html          # الأعمال
├── contact.html            # تواصل معنا
├── payment.html            # الدفع
├── salla-discounts.html    # أكواد الخصم
├── components/             # المكونات الموحدة
│   ├── header.html         # الهيدر
│   └── footer.html         # الفوتر
├── assets/
│   ├── css/               # ملفات CSS
│   │   ├── style.css      # الأنماط الرئيسية
│   │   └── animations.css # تأثيرات الحركة
│   ├── js/                # ملفات JavaScript
│   │   ├── main.js        # السكريبت الرئيسي
│   │   └── load-components.js  # تحميل المكونات
│   └── images/            # الصور
│       └── prt/           # صور الأعمال
└── tools/                 # أدوات Python
    ├── add_project.py     # أداة إضافة المشاريع
    ├── requirements.txt   # متطلبات Python
    └── projects.json      # بيانات المشاريع
```

## 🛠️ التثبيت والتشغيل

### تشغيل الموقع محلياً

1. **استنساخ المستودع**

   ```bash
   git clone https://github.com/elwa2/portfolio.git
   cd portfolio
   ```

2. **تشغيل Server محلي**

   ```bash
   # Python 3
   python -m http.server 8000

   # أو باستخدام Node.js
   npx serve
   ```

3. **فتح في المتصفح**
   ```
   http://localhost:8000
   ```

### استخدام أداة إضافة المشاريع

1. **تثبيت المتطلبات**

   ```bash
   cd tools
   pip install -r requirements.txt
   playwright install chromium
   ```

2. **إضافة مشروع جديد**

   ```bash
   python add_project.py
   ```

3. **عرض قائمة المشاريع**
   ```bash
   python add_project.py list
   ```

## 🌐 النشر على GitHub Pages

1. **رفع الملفات إلى GitHub**

   ```bash
   git add .
   git commit -m "Update portfolio"
   git push origin main
   ```

2. **تفعيل GitHub Pages**

   - اذهب إلى Settings > Pages
   - اختر Branch: main
   - اختر Folder: / (root)
   - اضغط Save

3. **الوصول للموقع**
   ```
   https://[username].github.io/portfolio
   ```

## 📞 التواصل

- 📧 **البريد**: salla1zid@gmail.com
- 📱 **واتساب**: +20 100 224 1591
- 🌐 **الموقع**: [elwa2.github.io/portfolio](https://elwa2.github.io/portfolio)

## 📄 الترخيص

جميع الحقوق محفوظة © 2024 Ali Ahmed | مصمم منصة زد وسلة

---

<div align="center">
  <sub>Built with ❤️ by Ali Ahmed</sub>
</div>
