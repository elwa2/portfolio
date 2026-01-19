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
    return window.location.href.indexOf("open-source-tools") > -1 ? "../" : "";
  }

  // تحويل عنصر Font Awesome إلى SVG
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

    // إضافة class fa-spin للأيقونات المتحركة
    if (classes.includes("fa-spin")) {
      svg.classList.add("fa-spin");
    }

    // إنشاء عنصر use للإشارة إلى الرمز
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    const basePath = getBasePath();
    use.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "xlink:href",
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

  // تحميل ملف الأيقونات وإضافته للصفحة
  function loadIconSprite() {
    const basePath = getBasePath();
    const iconsPath = basePath + "assets/images/icons.svg";

    // تحميل ملف SVG
    fetch(iconsPath)
      .then((response) => {
        if (!response.ok) throw new Error(response.statusText);
        return response.text();
      })
      .then((data) => {
        // التحقق من أن البيانات هي SVG
        if (!data.includes("<svg")) return;

        // إضافة الأيقونات للصفحة (مخفية)
        // ملاحظة: تكرار ID قد يسبب مشاكل، لذا نتأكد أولاً
        if (!document.getElementById("svg-icon-sprite")) {
          const div = document.createElement("div");
          div.id = "svg-icon-sprite";
          div.style.display = "none";
          div.innerHTML = data;
          document.body.insertBefore(div, document.body.firstChild);
        }
      })
      .catch((err) =>
        console.warn("Could not load icons.svg from " + iconsPath, err),
      );
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
