/**
 * 🎨 SVG Icons System
 * نظام الأيقونات SVG - استبدال Font Awesome
 */

(function () {
  "use strict";

  // خريطة تحويل أيقونات Font Awesome إلى SVG
  const ICON_MAP = {
    // Social Media
    "fa-whatsapp": "icon-whatsapp",
    "fab fa-whatsapp": "icon-whatsapp",
    "fa-instagram": "icon-instagram",
    "fab fa-instagram": "icon-instagram",
    "fa-twitter": "icon-twitter",
    "fab fa-twitter": "icon-twitter",
    "fa-telegram": "icon-telegram",
    "fab fa-telegram": "icon-telegram",
    "fa-youtube": "icon-youtube",
    "fab fa-youtube": "icon-youtube",
    "fa-pinterest": "icon-pinterest",
    "fab fa-pinterest": "icon-pinterest",
    "fa-behance": "icon-behance",
    "fab fa-behance": "icon-behance",

    // UI Icons
    "fa-moon": "icon-moon",
    "fas fa-moon": "icon-moon",
    "fa-sun": "icon-sun",
    "fas fa-sun": "icon-sun",
    "fa-bars": "icon-menu",
    "fas fa-bars": "icon-menu",
    "fa-check": "icon-check",
    "fas fa-check": "icon-check",
    "fa-copy": "icon-copy",
    "far fa-copy": "icon-copy",
    "fas fa-copy": "icon-copy",
    "fa-times": "icon-close",
    "fas fa-times": "icon-close",
    "fa-xmark": "icon-close",
    "fas fa-xmark": "icon-close",

    // Contact
    "fa-map-marker-alt": "icon-location",
    "fas fa-map-marker-alt": "icon-location",
    "fa-map-marker": "icon-location",
    "fas fa-map-marker": "icon-location",
    "fa-location-dot": "icon-location",
    "fas fa-location-dot": "icon-location",
    "fa-phone": "icon-phone",
    "fas fa-phone": "icon-phone",
    "fa-envelope": "icon-email",
    "fas fa-envelope": "icon-email",
    "far fa-envelope": "icon-email",

    // Services
    "fa-store": "icon-store",
    "fas fa-store": "icon-store",
    "fa-rocket": "icon-rocket",
    "fas fa-rocket": "icon-rocket",
    "fa-hashtag": "icon-hashtag",
    "fas fa-hashtag": "icon-hashtag",
    "fa-crown": "icon-crown",
    "fas fa-crown": "icon-crown",
    "fa-comments": "icon-comments",
    "fas fa-comments": "icon-comments",

    // Gaming System
    "fa-star": "icon-star",
    "fas fa-star": "icon-star",
    "far fa-star": "icon-star",
    "fa-gift": "icon-gift",
    "fas fa-gift": "icon-gift",
    "fa-trophy": "icon-trophy",
    "fas fa-trophy": "icon-trophy",
    "fa-chart-bar": "icon-chart",
    "fas fa-chart-bar": "icon-chart",

    // Actions
    "fa-arrow-right": "icon-arrow-right",
    "fas fa-arrow-right": "icon-arrow-right",
    "fa-external-link": "icon-external",
    "fas fa-external-link": "icon-external",
    "fa-external-link-alt": "icon-external",
    "fas fa-external-link-alt": "icon-external",
    "fa-download": "icon-download",
    "fas fa-download": "icon-download",
    "fa-eye": "icon-eye",
    "fas fa-eye": "icon-eye",
    "fa-heart": "icon-heart",
    "fas fa-heart": "icon-heart",
    "far fa-heart": "icon-heart",
    "fa-lock": "icon-lock",
    "fas fa-lock": "icon-lock",
    "fa-play": "icon-play",
    "fas fa-play": "icon-play",

    // Devices
    "fa-desktop": "icon-desktop",
    "fas fa-desktop": "icon-desktop",
    "fa-desktop-alt": "icon-desktop",
    "fas fa-desktop-alt": "icon-desktop",
    "fa-mobile": "icon-mobile",
    "fas fa-mobile": "icon-mobile",
    "fa-mobile-alt": "icon-mobile",
    "fas fa-mobile-alt": "icon-mobile",

    // Design
    "fa-palette": "icon-palette",
    "fas fa-palette": "icon-palette",
    "fa-paint-brush": "icon-palette",
    "fas fa-paint-brush": "icon-palette",
    "fa-code": "icon-code",
    "fas fa-code": "icon-code",
    "fa-image": "icon-image",
    "fas fa-image": "icon-image",
    "far fa-image": "icon-image",
    "fa-video": "icon-video",
    "fas fa-video": "icon-video",

    // Shopping
    "fa-shopping-cart": "icon-cart",
    "fas fa-shopping-cart": "icon-cart",
    "fa-cart-shopping": "icon-cart",
    "fas fa-cart-shopping": "icon-cart",
    "fa-shopping-bag": "icon-bag",
    "fas fa-shopping-bag": "icon-bag",
    "fa-bag-shopping": "icon-bag",
    "fas fa-bag-shopping": "icon-bag",

    // People
    "fa-users": "icon-users",
    "fas fa-users": "icon-users",
    "fa-user": "icon-user",
    "fas fa-user": "icon-user",
    "far fa-user": "icon-user",

    // Settings & Tech
    "fa-cog": "icon-cog",
    "fas fa-cog": "icon-cog",
    "fa-gear": "icon-cog",
    "fas fa-gear": "icon-cog",
    "fa-globe": "icon-globe",
    "fas fa-globe": "icon-globe",
    "fa-link": "icon-link",
    "fas fa-link": "icon-link",

    // Tags & Labels
    "fa-tag": "icon-tag",
    "fas fa-tag": "icon-tag",
    "fa-percent": "icon-percentage",
    "fas fa-percent": "icon-percentage",
    "fa-percentage": "icon-percentage",
    "fas fa-percentage": "icon-percentage",

    // Time
    "fa-clock": "icon-clock",
    "fas fa-clock": "icon-clock",
    "far fa-clock": "icon-clock",
    "fa-calendar": "icon-calendar",
    "fas fa-calendar": "icon-calendar",
    "far fa-calendar": "icon-calendar",
    "fa-calendar-alt": "icon-calendar",
    "fas fa-calendar-alt": "icon-calendar",

    // Info & Help
    "fa-info-circle": "icon-info",
    "fas fa-info-circle": "icon-info",
    "fa-circle-info": "icon-info",
    "fas fa-circle-info": "icon-info",
    "fa-question-circle": "icon-question",
    "fas fa-question-circle": "icon-question",
    "fa-circle-question": "icon-question",
    "fas fa-circle-question": "icon-question",
    "fa-exclamation-triangle": "icon-warning",
    "fas fa-exclamation-triangle": "icon-warning",
    "fa-triangle-exclamation": "icon-warning",
    "fas fa-triangle-exclamation": "icon-warning",

    // Navigation
    "fa-chevron-down": "icon-chevron-down",
    "fas fa-chevron-down": "icon-chevron-down",
    "fa-chevron-up": "icon-chevron-up",
    "fas fa-chevron-up": "icon-chevron-up",
    "fa-chevron-left": "icon-chevron-left",
    "fas fa-chevron-left": "icon-chevron-left",
    "fa-chevron-right": "icon-chevron-right",
    "fas fa-chevron-right": "icon-chevron-right",
    "fa-angle-down": "icon-chevron-down",
    "fas fa-angle-down": "icon-chevron-down",
    "fa-angle-up": "icon-chevron-up",
    "fas fa-angle-up": "icon-chevron-up",
    "fa-angle-left": "icon-chevron-left",
    "fas fa-angle-left": "icon-chevron-left",
    "fa-angle-right": "icon-chevron-right",
    "fas fa-angle-right": "icon-chevron-right",

    // Common
    "fa-plus": "icon-plus",
    "fas fa-plus": "icon-plus",
    "fa-minus": "icon-minus",
    "fas fa-minus": "icon-minus",
    "fa-search": "icon-search",
    "fas fa-search": "icon-search",
    "fa-magnifying-glass": "icon-search",
    "fas fa-magnifying-glass": "icon-search",
    "fa-home": "icon-home",
    "fas fa-home": "icon-home",
    "fa-house": "icon-home",
    "fas fa-house": "icon-home",
    "fa-share": "icon-share",
    "fas fa-share": "icon-share",
    "fa-share-alt": "icon-share",
    "fas fa-share-alt": "icon-share",
  };

  // تحميل ملف الأيقونات SVG
  function loadSVGSprite() {
    fetch("/assets/icons/icons.svg")
      .then((response) => response.text())
      .then((svgContent) => {
        const div = document.createElement("div");
        div.style.display = "none";
        div.innerHTML = svgContent;
        document.body.insertBefore(div, document.body.firstChild);

        // تحويل الأيقونات بعد تحميل السبرايت
        convertIcons();
      })
      .catch((err) => {
        console.warn("Could not load SVG sprite:", err);
      });
  }

  // تحويل أيقونات Font Awesome إلى SVG
  function convertIcons() {
    // البحث عن جميع عناصر <i> التي تحتوي على أيقونات Font Awesome
    const icons = document.querySelectorAll('i[class*="fa-"]');

    icons.forEach((icon) => {
      const classList = Array.from(icon.classList);
      let svgId = null;

      // البحث عن الأيقونة المناسبة
      for (const className of classList) {
        if (ICON_MAP[className]) {
          svgId = ICON_MAP[className];
          break;
        }
        // تجربة مع البادئة الكاملة
        const fullClass = classList.filter((c) => c.startsWith("fa")).join(" ");
        if (ICON_MAP[fullClass]) {
          svgId = ICON_MAP[fullClass];
          break;
        }
      }

      if (svgId) {
        // إنشاء عنصر SVG
        const svg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        svg.classList.add("svg-icon");

        // نقل الكلاسات الإضافية (غير الخاصة بـ Font Awesome)
        classList.forEach((cls) => {
          if (
            !cls.startsWith("fa") &&
            !cls.startsWith("fab") &&
            !cls.startsWith("fas") &&
            !cls.startsWith("far")
          ) {
            svg.classList.add(cls);
          }
        });

        // إضافة use
        const use = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "use"
        );
        use.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "xlink:href",
          `#${svgId}`
        );
        svg.appendChild(use);

        // استبدال العنصر
        icon.parentNode.replaceChild(svg, icon);
      }
    });
  }

  // دالة عامة لإنشاء أيقونة SVG
  window.createSVGIcon = function (iconName, className = "") {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("svg-icon");
    if (className) {
      className.split(" ").forEach((cls) => svg.classList.add(cls));
    }

    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "xlink:href",
      `#icon-${iconName}`
    );
    svg.appendChild(use);

    return svg;
  };

  // دالة للحصول على HTML للأيقونة
  window.getSVGIconHTML = function (iconName, className = "") {
    return `<svg class="svg-icon ${className}"><use xlink:href="#icon-${iconName}"></use></svg>`;
  };

  // تشغيل عند تحميل الصفحة
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadSVGSprite);
  } else {
    loadSVGSprite();
  }

  console.log("🎨 SVG Icons System initialized");
})();
