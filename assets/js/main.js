// ═══════════════════════════════════════════════════════════════
// دالة النسخ للحافظة (تعمل مع صفحة الدفع وأكواد الخصم)
// ═══════════════════════════════════════════════════════════════
function copyToClipboard(textOrId, button) {
  let textToCopy;
  let element = null;

  // التحقق إذا كان ID لعنصر input أو النص مباشرة
  if (typeof textOrId === "string" && document.getElementById(textOrId)) {
    element = document.getElementById(textOrId);
    textToCopy = element.value || element.innerText || element.textContent;
  } else {
    textToCopy = textOrId;
  }

  // دالة إظهار النجاح
  const showSuccess = (btn) => {
    if (!btn) return;
    const originalHTML = btn.innerHTML;
    btn.innerHTML =
      '<svg class="svg-icon" viewBox="0 0 512 512"><use href="assets/images/icons.svg#icon-check"></use></svg>';
    btn.classList.add("copied");

    // إخفاء التولتيب القديم إذا كان موجوداً في الـ HTML
    const existingTooltip = btn.querySelector(".tooltip");
    if (existingTooltip) existingTooltip.style.opacity = "1";
    if (existingTooltip) existingTooltip.style.visibility = "visible";

    setTimeout(function () {
      btn.innerHTML = originalHTML;
      btn.classList.remove("copied");
      if (existingTooltip) existingTooltip.style.opacity = "";
      if (existingTooltip) existingTooltip.style.visibility = "";
    }, 2000);
  };

  // نسخ النص للحافظة
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        if (button) {
          showSuccess(button);
        } else if (element) {
          const copyBtn = element.parentElement?.querySelector(".copy-btn");
          if (copyBtn) showSuccess(copyBtn);
        }
      })
      .catch((err) => {
        console.error("فشل في النسخ: ", err);
        fallbackCopy(textToCopy, element, button);
      });
  } else {
    fallbackCopy(textToCopy, element, button);
  }

  function fallbackCopy(text, el, btn) {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      if (btn) {
        showSuccess(btn);
      } else if (el) {
        const copyBtn = el.parentElement?.querySelector(".copy-btn");
        if (copyBtn) showSuccess(copyBtn);
      }
    } catch (err) {
      console.error("Fallback failure: ", err);
    }
  }
}

// تحديث السنة في الفوتر
document.getElementById("currentYear").textContent = new Date().getFullYear();

// Helper to get correct assets path - IMPROVED VERSION
function getBasePath() {
  // استخدم URL API للكشف الموثوق عن المسار
  const url = new URL(window.location.href);
  const pathname = url.pathname;
  
  // إذا كنا في مجلد open-source-tools
  if (pathname.includes("/open-source-tools/")) {
    return "../";
  }
  
  // في جميع الحالات الأخرى
  return "";
}

// إدارة وضع الظلام (Dark Mode) - مع معالجة أفضل للأخطاء
function setTheme(themeName) {
  try {
    localStorage.setItem("theme", themeName);
    document.documentElement.setAttribute("data-theme", themeName);

    // تحديث أيقونة زر التبديل
    const themeToggleSvg = document.querySelector(".theme-toggle svg use");
    if (themeToggleSvg) {
      const basePath = getBasePath();
      const iconHref = themeName === "dark" 
        ? basePath + "assets/images/icons.svg#icon-sun"
        : basePath + "assets/images/icons.svg#icon-moon";
      
      themeToggleSvg.setAttribute("href", iconHref);
    }
    
    // تطلق حدث للمستمعين
    window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme: themeName } }));
  } catch (error) {
    console.error("خطأ في تعيين الثيم:", error);
  }
}

// تبديل الوضع المظلم
function toggleTheme() {
  const currentTheme = localStorage.getItem("theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  setTheme(newTheme);
  
  // تطلق حدث مخصص للمستمعين
  window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme: newTheme } }));
}

// التحقق من الوضع المفضل عند تحميل الصفحة
(function () {
  // التحقق من تفضيلات المستخدم المحفوظة
  if (localStorage.getItem("theme") === "dark") {
    setTheme("dark");
  } else if (localStorage.getItem("theme") === "light") {
    setTheme("light");
  } else {
    // التحقق من تفضيلات النظام
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }
})();

// التحكم في القائمة المتنقلة
const mobileToggle = document.querySelector(".mobile-toggle");
const nav = document.querySelector(".nav");

// دالة لفتح/إغلاق القائمة
function toggleMobileMenu() {
  if (nav) {
    nav.classList.toggle("active");
    updateMenuIcon();
  }
}

// دالة لإغلاق القائمة
function closeMobileMenu() {
  if (nav && nav.classList.contains("active")) {
    nav.classList.remove("active");
    updateMenuIcon();
  }
}

// تحديث أيقونة القائمة
function updateMenuIcon() {
  const iconUse = mobileToggle?.querySelector("svg use");
  if (iconUse) {
    const basePath = getBasePath();
    if (nav.classList.contains("active")) {
      iconUse.setAttribute(
        "href",
        basePath + "assets/images/icons.svg#icon-times",
      );
    } else {
      iconUse.setAttribute(
        "href",
        basePath + "assets/images/icons.svg#icon-bars",
      );
    }
  }
}

if (mobileToggle) {
  mobileToggle.addEventListener("click", toggleMobileMenu);
}

// إغلاق القائمة عند الضغط على أي رابط
let navLinksEventListeners = [];
if (nav) {
  nav.querySelectorAll("a").forEach((link) => {
    const listener = () => closeMobileMenu();
    link.addEventListener("click", listener);
    navLinksEventListeners.push({ element: link, listener });
  });

  // إغلاق القائمة عند الضغط على زر X (الـ ::before pseudo-element)
  const navClickListener = function (e) {
    // التحقق من الضغط في منطقة زر الإغلاق (أعلى يسار القائمة)
    const rect = nav.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // منطقة زر الإغلاق (أعلى يسار)
    if (clickX <= 70 && clickY <= 70 && clickX >= 10 && clickY >= 10) {
      closeMobileMenu();
    }
  };
  nav.addEventListener("click", navClickListener);
}

// إغلاق القائمة عند الضغط خارجها
let documentClickListener = function (e) {
  if (nav && nav.classList.contains("active")) {
    if (!nav.contains(e.target) && !mobileToggle?.contains(e.target)) {
      closeMobileMenu();
    }
  }
};
document.addEventListener("click", documentClickListener);

// دالة للتنظيف (Cleanup) - إزالة Event Listeners عند عدم الحاجة
window.cleanupEventListeners = function() {
  try {
    // حذف مستمعي روابط القائمة
    navLinksEventListeners.forEach(({ element, listener }) => {
      element.removeEventListener("click", listener);
    });
    navLinksEventListeners = [];

    // حذف مستمع الزر الرئيسي
    if (mobileToggle) {
      mobileToggle.removeEventListener("click", toggleMobileMenu);
    }

    // حذف مستمع الضغط الخارجي
    document.removeEventListener("click", documentClickListener);

    console.log("✓ Event listeners cleaned up successfully");
  } catch (error) {
    console.warn("Error during cleanup:", error);
  }
};

// تنظيف عند إغلاق الصفحة (page unload)
window.addEventListener("beforeunload", cleanupEventListeners);

// إضافة تأثير التمرير للقائمة العلوية
window.addEventListener("scroll", function () {
  const header = document.querySelector(".header");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// تم إلغاء إضافة الشركاء ديناميكيًا واستبدالها بشركاء ثابتين في ملف HTML

// معالجة نموذج الاتصال
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // هنا يمكنك إضافة كود لإرسال النموذج إلى الخادم

    // عرض رسالة نجاح
    alert("تم إرسال رسالتك بنجاح، سنتواصل معك قريباً");

    // إعادة تعيين النموذج
    this.reset();
  });
}

// إضافة تأثيرات التمرير للعناصر
document.addEventListener("DOMContentLoaded", function () {
  // تحديد جميع العناصر التي نريد إضافة تأثير لها
  const animatedElements = [
    ".service-card",
    ".portfolio-item",
    ".testimonial-card",
    ".partner-logo",
  ];

  // دالة للتحقق مما إذا كان العنصر مرئيًا في نافذة العرض
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // دالة لإضافة فئة التحريك للعناصر المرئية
  function handleScroll() {
    animatedElements.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        if (isElementInViewport(element)) {
          element.classList.add("animated");
        }
      });
    });
  }

  // إضافة مستمع للتمرير
  window.addEventListener("scroll", handleScroll);

  handleScroll();
});

// تم توحيد منطق التنقل في router.js لضمان عمل كافة الروابط بنقرة واحدة
document.addEventListener("DOMContentLoaded", function () {
  // يمكن إضافة أي منطق تهيئة إضافي هنا إذا لزم الأمر
});
