/**
 * 🖼️ عارض Portfolio المخصص
 * =========================
 * عارض صور متقدم يدعم Zoom و Pan و Scroll
 */

(function () {
  "use strict";

  // ═══════════════════════════════════════════════════════════════
  // المتغيرات العامة
  // ═══════════════════════════════════════════════════════════════

  let currentImages = [];
  let currentIndex = 0;
  let currentZoom = 1;
  const zoomLevels = [1, 1.5, 2, 3];
  let isOpen = false;

  // ═══════════════════════════════════════════════════════════════
  // إنشاء عناصر العارض
  // ═══════════════════════════════════════════════════════════════

  function createViewer() {
    // التحقق إذا كان العارض موجود
    if (document.getElementById("portfolio-viewer")) return;

    const html = `
      <div id="portfolio-viewer" class="portfolio-viewer-overlay">
        <!-- شريط الأدوات -->
        <div class="viewer-toolbar">
          <button class="viewer-btn close-btn" id="viewer-close" title="إغلاق">
            <i class="fas fa-times"></i>
          </button>
          <span class="viewer-title" id="viewer-title"></span>
          <div class="viewer-controls">
            <button class="viewer-btn" id="viewer-zoom-out" title="تصغير">
              <i class="fas fa-minus"></i>
            </button>
            <button class="viewer-btn" id="viewer-zoom-in" title="تكبير">
              <i class="fas fa-plus"></i>
            </button>
            <button class="viewer-btn" id="viewer-fit" title="ملء الشاشة">
              <i class="fas fa-expand"></i>
            </button>
          </div>
        </div>
        
        <!-- أزرار التنقل -->
        <div class="viewer-nav prev">
          <button class="viewer-nav-btn" id="viewer-prev" title="السابق">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        <div class="viewer-nav next">
          <button class="viewer-nav-btn" id="viewer-next" title="التالي">
            <i class="fas fa-chevron-left"></i>
          </button>
        </div>
        
        <!-- حاوية الصورة -->
        <div class="viewer-container" id="viewer-container">
          <div class="viewer-image-wrapper" id="viewer-wrapper">
            <div class="viewer-loading" id="viewer-loading">
              <i class="fas fa-spinner"></i>
            </div>
            <img src="" alt="" class="viewer-image" id="viewer-image">
          </div>
        </div>
        
        <!-- شريط الزوم -->
        <div class="viewer-zoom-bar">
          <button class="viewer-btn" id="viewer-zoom-out-2">
            <i class="fas fa-search-minus"></i>
          </button>
          <span class="zoom-level" id="viewer-zoom-level">100%</span>
          <button class="viewer-btn" id="viewer-zoom-in-2">
            <i class="fas fa-search-plus"></i>
          </button>
        </div>
        
        <!-- رقم الصورة -->
        <div class="viewer-counter" id="viewer-counter"></div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", html);
    if (window.SvgIcons && typeof window.SvgIcons.convert === "function") {
      window.SvgIcons.convert();
    }
    attachEvents();
  }

  // ═══════════════════════════════════════════════════════════════
  // ربط الأحداث
  // ═══════════════════════════════════════════════════════════════

  function attachEvents() {
    const viewer = document.getElementById("portfolio-viewer");
    const closeBtn = document.getElementById("viewer-close");
    const prevBtn = document.getElementById("viewer-prev");
    const nextBtn = document.getElementById("viewer-next");
    const zoomInBtn = document.getElementById("viewer-zoom-in");
    const zoomOutBtn = document.getElementById("viewer-zoom-out");
    const zoomInBtn2 = document.getElementById("viewer-zoom-in-2");
    const zoomOutBtn2 = document.getElementById("viewer-zoom-out-2");
    const fitBtn = document.getElementById("viewer-fit");
    const image = document.getElementById("viewer-image");
    const container = document.getElementById("viewer-container");

    // إغلاق
    closeBtn.addEventListener("click", closeViewer);
    viewer.addEventListener("click", function (e) {
      if (e.target === viewer || e.target === container) {
        closeViewer();
      }
    });

    // التنقل
    prevBtn.addEventListener("click", showPrev);
    nextBtn.addEventListener("click", showNext);

    // الزوم
    zoomInBtn.addEventListener("click", zoomIn);
    zoomOutBtn.addEventListener("click", zoomOut);
    zoomInBtn2.addEventListener("click", zoomIn);
    zoomOutBtn2.addEventListener("click", zoomOut);
    fitBtn.addEventListener("click", toggleFit);

    // Double-click للزوم
    image.addEventListener("dblclick", function (e) {
      if (currentZoom >= 2) {
        resetZoom();
      } else {
        setZoom(2);
      }
    });

    // لوحة المفاتيح
    document.addEventListener("keydown", function (e) {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          closeViewer();
          break;
        case "ArrowLeft":
          showNext(); // RTL
          break;
        case "ArrowRight":
          showPrev(); // RTL
          break;
        case "+":
        case "=":
          zoomIn();
          break;
        case "-":
          zoomOut();
          break;
      }
    });

    // Wheel للزوم
    container.addEventListener(
      "wheel",
      function (e) {
        if (e.ctrlKey) {
          e.preventDefault();
          if (e.deltaY < 0) {
            zoomIn();
          } else {
            zoomOut();
          }
        }
      },
      { passive: false }
    );

    // Touch للموبايل (Pinch to zoom)
    let initialDistance = 0;
    container.addEventListener("touchstart", function (e) {
      if (e.touches.length === 2) {
        initialDistance = getDistance(e.touches[0], e.touches[1]);
      }
    });

    container.addEventListener(
      "touchmove",
      function (e) {
        if (e.touches.length === 2) {
          e.preventDefault();
          const currentDistance = getDistance(e.touches[0], e.touches[1]);
          if (initialDistance > 0) {
            const scale = currentDistance / initialDistance;
            if (scale > 1.1) {
              zoomIn();
              initialDistance = currentDistance;
            } else if (scale < 0.9) {
              zoomOut();
              initialDistance = currentDistance;
            }
          }
        }
      },
      { passive: false }
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // وظائف العارض
  // ═══════════════════════════════════════════════════════════════

  function openViewer(images, startIndex) {
    createViewer();
    currentImages = images;
    currentIndex = startIndex || 0;
    isOpen = true;
    resetZoom();
    showImage(currentIndex);

    document.getElementById("portfolio-viewer").classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeViewer() {
    isOpen = false;
    document.getElementById("portfolio-viewer").classList.remove("active");
    document.body.style.overflow = "";
  }

  function showImage(index) {
    const image = document.getElementById("viewer-image");
    const loading = document.getElementById("viewer-loading");
    const title = document.getElementById("viewer-title");
    const counter = document.getElementById("viewer-counter");

    // إظهار التحميل
    loading.style.display = "block";
    image.style.opacity = "0";

    // تحميل الصورة
    image.onload = function () {
      loading.style.display = "none";
      image.style.opacity = "1";
    };

    image.src = currentImages[index].src;
    title.textContent = currentImages[index].title || "";
    counter.textContent = `${index + 1} / ${currentImages.length}`;

    // تحديث أزرار التنقل
    document.getElementById("viewer-prev").parentElement.style.display =
      currentImages.length > 1 ? "block" : "none";
    document.getElementById("viewer-next").parentElement.style.display =
      currentImages.length > 1 ? "block" : "none";
  }

  function showPrev() {
    currentIndex =
      (currentIndex - 1 + currentImages.length) % currentImages.length;
    resetZoom();
    showImage(currentIndex);
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % currentImages.length;
    resetZoom();
    showImage(currentIndex);
  }

  // ═══════════════════════════════════════════════════════════════
  // وظائف الزوم
  // ═══════════════════════════════════════════════════════════════

  function setZoom(level) {
    currentZoom = Math.max(0.5, Math.min(4, level));
    const image = document.getElementById("viewer-image");
    const zoomDisplay = document.getElementById("viewer-zoom-level");

    image.style.transform = `scale(${currentZoom})`;
    image.style.transformOrigin = "center top";
    zoomDisplay.textContent = `${Math.round(currentZoom * 100)}%`;

    if (currentZoom > 1) {
      image.classList.add("zoomed");
    } else {
      image.classList.remove("zoomed");
    }
  }

  function zoomIn() {
    setZoom(currentZoom + 0.25);
  }

  function zoomOut() {
    setZoom(currentZoom - 0.25);
  }

  function resetZoom() {
    setZoom(1);
  }

  function toggleFit() {
    if (currentZoom === 1) {
      // Fit to width
      const image = document.getElementById("viewer-image");
      const container = document.getElementById("viewer-container");
      const ratio = container.clientWidth / image.naturalWidth;
      setZoom(Math.min(ratio, 2));
    } else {
      resetZoom();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // دوال مساعدة
  // ═══════════════════════════════════════════════════════════════

  function getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ═══════════════════════════════════════════════════════════════
  // التهيئة التلقائية
  // ═══════════════════════════════════════════════════════════════

  function init() {
    // Find all elements with data-lightbox attribute
    const lightboxGroups = {};
    const items = document.querySelectorAll("[data-lightbox]");

    items.forEach((item) => {
      const groupName = item.getAttribute("data-lightbox");
      if (!lightboxGroups[groupName]) {
        lightboxGroups[groupName] = [];
      }

      const imageInfo = {
        src: item.href || item.getAttribute("data-src"),
        title: item.getAttribute("data-title") || "",
      };

      lightboxGroups[groupName].push(imageInfo);
      const indexInGroup = lightboxGroups[groupName].length - 1;

      // Handle click
      item.addEventListener("click", function (e) {
        e.preventDefault();
        openViewer(lightboxGroups[groupName], indexInGroup);
      });
    });
  }

  // تشغيل عند تحميل الصفحة
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // تصدير للاستخدام الخارجي
  window.PortfolioViewer = {
    open: openViewer,
    close: closeViewer,
  };
})();
