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
    "fa-times": "icon-close",
    "fas fa-times": "icon-close",

    // Contact
    "fa-map-marker-alt": "icon-location",
    "fas fa-map-marker-alt": "icon-location",
    "fa-map-marker": "icon-location",
    "fas fa-map-marker": "icon-location",
    "fa-phone": "icon-phone",
    "fas fa-phone": "icon-phone",
    "fa-envelope": "icon-email",
    "fas fa-envelope": "icon-email",

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
    "fa-download": "icon-download",
    "fas fa-download": "icon-download",
    "fa-eye": "icon-eye",
    "fas fa-eye": "icon-eye",
    "fa-heart": "icon-heart",
    "fas fa-heart": "icon-heart",
    "fa-lock": "icon-lock",
    "fas fa-lock": "icon-lock",
    "fa-play": "icon-play",
    "fas fa-play": "icon-play",
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
