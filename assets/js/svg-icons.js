/**
 * تحويل أيقونات Font Awesome إلى SVG
 * يتم استبدال جميع عناصر <i> التي تحتوي على classes Font Awesome بـ SVG
 */
(function () {
  "use strict";

  // خريطة تحويل classes Font Awesome إلى أسماء الأيقونات
  const iconMap = {
    // Solid Icons
    "fa-moon": "moon",
    "fa-sun": "sun",
    "fa-bars": "bars",
    "fa-times": "times",
    "fa-check": "check",
    "fa-star": "star",
    "fa-code": "code",
    "fa-eye": "eye",
    "fa-bullseye": "bullseye",
    "fa-lightbulb": "lightbulb",
    "fa-gem": "gem",
    "fa-handshake": "handshake",
    "fa-shield-alt": "shield-alt",
    "fa-comments": "comments",
    "fa-map-marker-alt": "map-marker-alt",
    "fa-phone": "phone",
    "fa-envelope": "envelope",
    "fa-store": "store",
    "fa-rocket": "rocket",
    "fa-hashtag": "hashtag",
    "fa-crown": "crown",
    "fa-minus": "minus",
    "fa-plus": "plus",
    "fa-expand": "expand",
    "fa-chevron-right": "chevron-right",
    "fa-chevron-left": "chevron-left",
    "fa-spinner": "spinner",
    "fa-search-minus": "search-minus",
    "fa-search-plus": "search-plus",
    "fa-copy": "copy",
    "fa-desktop": "desktop",
    "fa-mobile": "mobile",
    "fa-mobile-alt": "mobile",
    "fa-arrow-right": "arrow-right",
    "fa-external-link-alt": "external-link-alt",
    "fa-tag": "tag",
    "fa-paint-brush": "paint-brush",
    // Brand Icons
    "fa-whatsapp": "whatsapp",
    "fa-instagram": "instagram",
    "fa-twitter": "twitter",
    "fa-telegram": "telegram",
    "fa-telegram-plane": "telegram",
    "fa-youtube": "youtube",
    "fa-pinterest": "pinterest",
    "fa-behance": "behance",
    "fa-chrome": "chrome",
    "fa-edge": "edge",
    "fa-cogs": "cogs",
    "fa-search": "search",
    "fa-palette": "palette",
    "fa-users": "users",
    "fa-calendar-alt": "calendar-alt",
    // Payment & Contact Icons
    "fa-paypal": "paypal",
    "fa-university": "university",
    "fa-wallet": "wallet",
    "fa-bolt": "bolt",
    "fa-qrcode": "qrcode",
    "fa-clock": "clock",
    "fa-check-circle": "check-circle",
    "fa-map-marker-alt": "map-marker-alt",
    // Tools Icons
    "fa-tools": "cogs", // Fallback to cogs if tools missing
    "fa-expand-arrows-alt": "expand",
    "fa-key": "shield-alt", // Fallback to shield-alt
    "fa-file-image": "images", // Fallback to images
    "fa-th-large": "th", // Fallback to th or grid
    "fa-paint-brush": "paint-brush",
  };

  function getBasePath() {
    // استخدم URL API للكشف الموثوق عن المسار
    try {
      const url = new URL(window.location.href);
      const pathname = url.pathname;
      
      // إذا كنا في مجلد open-source-tools
      if (pathname.includes("/open-source-tools/")) {
        return "../";
      }
      
      // في جميع الحالات الأخرى
      return "";
    } catch (error) {
      console.warn("Error determining base path:", error);
      return "";
    }
  }

  // تحويل عنصر Font Awesome إلى SVG - مع تحسينات Accessibility
  function convertToSvg(element) {
    const classes = Array.from(element.classList);
    let iconName = null;
    let extraClasses = [];

    // البحث عن اسم الأيقونة
    for (const cls of classes) {
      if (iconMap[cls]) {
        iconName = iconMap[cls];
      } else if (!cls.startsWith("fa") || cls === "fa") {
        extraClasses.push(cls);
      }
    }

    if (!iconName) return;

    // إنشاء عنصر SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "svg-icon " + extraClasses.join(" "));
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false"); // تحسين Accessibility
    svg.setAttribute("role", "img");

    // إضافة class fa-spin للأيقونات المتحركة
    if (classes.includes("fa-spin")) {
      svg.classList.add("fa-spin");
    }

    // إنشاء عنصر use للإشارة إلى الرمز
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    const basePath = getBasePath();
    // استخدم href بدلاً من xlink:href (SVG 2.0 standard)
    use.setAttribute(
      "href",
      basePath + "assets/images/icons.svg#icon-" + iconName,
    );

    svg.appendChild(use);
    element.parentNode.replaceChild(svg, element);
  }

  // تحويل جميع أيقونات Font Awesome في الصفحة
  function convertAllIcons() {
    const icons = document.querySelectorAll("i.fas, i.far, i.fab, i.fa");
    icons.forEach(convertToSvg);
  }

  // متغير لتتبع حالة التحميل
  let iconsLoaded = false;
  let loadRetries = 0;
  const MAX_RETRIES = 3;

  // تحميل ملف الأيقونات وإضافته للصفحة - مع معالجة أفضل للأخطاء
  function loadIconSprite() {
    if (iconsLoaded) return; // تجنب التحميل المتكرر
    
    const basePath = getBasePath();
    const iconsPath = basePath + "assets/images/icons.svg";

    // تحميل ملف SVG
    fetch(iconsPath, { cache: 'no-cache' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load SVG: ${response.status} ${response.statusText}`);
        }
        return response.text();
      })
      .then((data) => {
        // التحقق من أن البيانات هي SVG
        if (!data || !data.includes("<svg")) {
          throw new Error("Invalid SVG data received");
        }

        // إضافة الأيقونات للصفحة (مخفية)
        if (!document.getElementById("svg-icon-sprite")) {
          const div = document.createElement("div");
          div.id = "svg-icon-sprite";
          div.style.display = "none";
          div.setAttribute("aria-hidden", "true");
          div.innerHTML = data;
          document.body.insertBefore(div, document.body.firstChild);
          
          iconsLoaded = true;
          console.log("✓ SVG icons loaded successfully");
        }
      })
      .catch((err) => {
        console.error("✗ Error loading icons.svg from " + iconsPath, err);
        
        // محاولة إعادة التحميل
        if (loadRetries < MAX_RETRIES) {
          loadRetries++;
          console.warn(`Retrying to load icons (${loadRetries}/${MAX_RETRIES})...`);
          
          setTimeout(() => {
            loadIconSprite();
          }, 2000 * loadRetries); // تأخير متزايد
        } else {
          console.error("Failed to load icons after " + MAX_RETRIES + " attempts");
        }
      });
  }

  // التنفيذ عند تحميل الصفحة
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      loadIconSprite();
      convertAllIcons();
    });
  } else {
    loadIconSprite();
    convertAllIcons();
  }

  // تصدير للاستخدام الخارجي
  window.SvgIcons = {
    convert: convertAllIcons,
    convertElement: convertToSvg,
  };
})();
