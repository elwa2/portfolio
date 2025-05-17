// تحديث السنة في الفوتر
document.getElementById('currentYear').textContent = new Date().getFullYear();

// إدارة وضع الظلام (Dark Mode)
function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    document.documentElement.setAttribute('data-theme', themeName);

    // تحديث أيقونة زر التبديل
    const themeToggleIcon = document.querySelector('.theme-toggle i');
    if (themeToggleIcon) {
        if (themeName === 'dark') {
            themeToggleIcon.classList.remove('fa-moon');
            themeToggleIcon.classList.add('fa-sun');
        } else {
            themeToggleIcon.classList.remove('fa-sun');
            themeToggleIcon.classList.add('fa-moon');
        }
    }
}

// تبديل الوضع المظلم
function toggleTheme() {
    if (localStorage.getItem('theme') === 'dark') {
        setTheme('light');
    } else {
        setTheme('dark');
    }
}

// التحقق من الوضع المفضل عند تحميل الصفحة
(function () {
    // التحقق من تفضيلات المستخدم المحفوظة
    if (localStorage.getItem('theme') === 'dark') {
        setTheme('dark');
    } else if (localStorage.getItem('theme') === 'light') {
        setTheme('light');
    } else {
        // التحقق من تفضيلات النظام
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    }
})();

// التحكم في القائمة المتنقلة
const mobileToggle = document.querySelector('.mobile-toggle');
const nav = document.querySelector('.nav');

if (mobileToggle) {
    mobileToggle.addEventListener('click', function() {
        nav.classList.toggle('active');

        // تغيير أيقونة القائمة
        const icon = this.querySelector('i');
        if (icon.classList.contains('fa-bars')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

// إضافة تأثير التمرير للقائمة العلوية
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// تم إلغاء إضافة الشركاء ديناميكيًا واستبدالها بشركاء ثابتين في ملف HTML

// معالجة نموذج الاتصال
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // هنا يمكنك إضافة كود لإرسال النموذج إلى الخادم

        // عرض رسالة نجاح
        alert('تم إرسال رسالتك بنجاح، سنتواصل معك قريباً');

        // إعادة تعيين النموذج
        this.reset();
    });
}

// إضافة تأثيرات التمرير للعناصر
document.addEventListener('DOMContentLoaded', function() {
    // تحديد جميع العناصر التي نريد إضافة تأثير لها
    const animatedElements = [
        '.service-card',
        '.portfolio-item',
        '.testimonial-card',
        '.partner-logo'
    ];

    // دالة للتحقق مما إذا كان العنصر مرئيًا في نافذة العرض
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // دالة لإضافة فئة التحريك للعناصر المرئية
    function handleScroll() {
        animatedElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (isElementInViewport(element)) {
                    element.classList.add('animated');
                }
            });
        });
    }

    // إضافة مستمع للتمرير
    window.addEventListener('scroll', handleScroll);

    // تشغيل الدالة مرة واحدة عند تحميل الصفحة
    handleScroll();
});
