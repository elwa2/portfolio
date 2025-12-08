/**
 * Component Loader - تحميل المكونات الموحدة
 * يقوم بتحميل Header و Footer في جميع الصفحات
 */

(function () {
  "use strict";

  // تحديد المسار الأساسي بناءً على موقع الصفحة
  const getBasePath = () => {
    const path = window.location.pathname;
    // إذا كانت الصفحة في مجلد فرعي
    if (path.includes("/pages/") || path.includes("/tools/")) {
      return "../";
    }
    return "";
  };

  const basePath = getBasePath();

  /**
   * تحميل مكون HTML من ملف خارجي
   * @param {string} componentPath - مسار ملف المكون
   * @param {string} placeholderId - معرف العنصر الذي سيتم وضع المكون فيه
   * @param {Function} callback - دالة تنفذ بعد تحميل المكون
   */
  async function loadComponent(componentPath, placeholderId, callback) {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) {
      console.warn(`Placeholder ${placeholderId} not found`);
      return;
    }

    try {
      const response = await fetch(basePath + componentPath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const html = await response.text();
      placeholder.innerHTML = html;

      if (callback && typeof callback === "function") {
        callback();
      }
    } catch (error) {
      console.error(`Error loading component ${componentPath}:`, error);
    }
  }

  /**
   * تحديد الصفحة النشطة في القائمة
   */
  function setActivePage() {
    const currentPage =
      window.location.pathname.split("/").pop().replace(".html", "") || "index";

    // تحديث روابط سطح المكتب
    document
      .querySelectorAll(".nav-links a, .mobile-nav-links a")
      .forEach((link) => {
        const pageName = link.getAttribute("data-page");
        if (pageName === currentPage) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      });
  }

  /**
   * تحديث السنة الحالية في الفوتر
   */
  function updateCurrentYear() {
    const yearElement = document.getElementById("currentYear");
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  /**
   * تهيئة قائمة الجوال
   */
  function initMobileMenu() {
    const mobileToggle = document.querySelector(".mobile-toggle");
    const mobileMenu = document.querySelector(".mobile-menu");
    const mobileOverlay = document.querySelector(".mobile-menu-overlay");
    const mobileClose = document.querySelector(".mobile-menu-close");

    if (mobileToggle && mobileMenu) {
      mobileToggle.addEventListener("click", () => {
        mobileMenu.classList.add("active");
        mobileOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
      });
    }

    if (mobileClose) {
      mobileClose.addEventListener("click", closeMobileMenu);
    }

    if (mobileOverlay) {
      mobileOverlay.addEventListener("click", closeMobileMenu);
    }

    // إغلاق القائمة عند الضغط على رابط
    document.querySelectorAll(".mobile-nav-links a").forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });
  }

  function closeMobileMenu() {
    const mobileMenu = document.querySelector(".mobile-menu");
    const mobileOverlay = document.querySelector(".mobile-menu-overlay");

    if (mobileMenu) mobileMenu.classList.remove("active");
    if (mobileOverlay) mobileOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  /**
   * تهيئة Header Scroll Effect
   */
  function initHeaderScroll() {
    const header = document.querySelector(".header");
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener("scroll", () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 100) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }

      lastScroll = currentScroll;
    });
  }

  /**
   * تحميل جميع المكونات عند تحميل الصفحة
   */
  function loadAllComponents() {
    // تحميل Header
    loadComponent("components/header.html", "header-placeholder", () => {
      setActivePage();
      initMobileMenu();
      initHeaderScroll();

      // تهيئة وظيفة تبديل الثيم إذا كانت موجودة
      if (typeof initThemeToggle === "function") {
        initThemeToggle();
      }
    });

    // تحميل Footer
    loadComponent("components/footer.html", "footer-placeholder", () => {
      updateCurrentYear();
    });
  }

  // تحميل المكونات عند جاهزية DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadAllComponents);
  } else {
    loadAllComponents();
  }

  // تصدير الدوال للاستخدام الخارجي
  window.ComponentLoader = {
    loadComponent,
    setActivePage,
    updateCurrentYear,
    initMobileMenu,
    initHeaderScroll,
  };
})();
