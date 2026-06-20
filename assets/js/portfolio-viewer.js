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
            <svg class="svg-icon" aria-hidden="true"><use xlink:href="assets/images/icons.svg#icon-times"></use></svg>
          </button>
          <span class="viewer-title" id="viewer-title"></span>
          <div class="viewer-controls">
            <button class="viewer-btn" id="viewer-zoom-out" title="تصغير">
               <svg class="svg-icon" aria-hidden="true"><use xlink:href="assets/images/icons.svg#icon-minus"></use></svg>
            </button>
            <button class="viewer-btn" id="viewer-zoom-in" title="تكبير">
               <svg class="svg-icon" aria-hidden="true"><use xlink:href="assets/images/icons.svg#icon-plus"></use></svg>
            </button>
            <button class="viewer-btn" id="viewer-fit" title="ملء الشاشة">
               <svg class="svg-icon" aria-hidden="true"><use xlink:href="assets/images/icons.svg#icon-expand"></use></svg>
            </button>
            <a href="#" target="_blank" class="viewer-btn store-link-btn" id="viewer-store-link" title="زيارة المتجر">
               <svg class="svg-icon" aria-hidden="true"><use xlink:href="assets/images/icons.svg#icon-external-link-alt"></use></svg>
            </a>
          </div>
        </div>
        
        <!-- أزرار التنقل -->
        <div class="viewer-nav prev">
          <button class="viewer-nav-btn" id="viewer-prev" title="السابق">
             <svg class="svg-icon" aria-hidden="true"><use xlink:href="assets/images/icons.svg#icon-chevron-right"></use></svg>
          </button>
        </div>
        <div class="viewer-nav next">
          <button class="viewer-nav-btn" id="viewer-next" title="التالي">
             <svg class="svg-icon" aria-hidden="true"><use xlink:href="assets/images/icons.svg#icon-chevron-left"></use></svg>
          </button>
        </div>
        
        <!-- حاوية الصورة -->
        <div class="viewer-container" id="viewer-container">
          <div class="viewer-image-wrapper" id="viewer-wrapper">
            <div class="viewer-loading" id="viewer-loading">
               <svg class="svg-icon" aria-hidden="true"><use xlink:href="assets/images/icons.svg#icon-spinner"></use></svg>
            </div>
            <img src="" alt="" class="viewer-image" id="viewer-image">
          </div>
        </div>
        
        <!-- شريط الزوم -->
        <div class="viewer-zoom-bar">
          <button class="viewer-btn" id="viewer-zoom-out-2">
             <svg class="svg-icon" aria-hidden="true"><use xlink:href="assets/images/icons.svg#icon-minus"></use></svg>
          </button>
          <span class="zoom-level" id="viewer-zoom-level">100%</span>
          <button class="viewer-btn" id="viewer-zoom-in-2">
             <svg class="svg-icon" aria-hidden="true"><use xlink:href="assets/images/icons.svg#icon-plus"></use></svg>
          </button>
        </div>
        
        <!-- رقم الصورة -->
        <div class="viewer-counter" id="viewer-counter"></div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", html);
    // if (window.SvgIcons && typeof window.SvgIcons.convert === "function") {
    //   window.SvgIcons.convert();
    // }
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
    if (closeBtn) closeBtn.addEventListener("click", closeViewer);
    if (viewer)
      viewer.addEventListener("click", function (e) {
        if (e.target === viewer || e.target === container) {
          closeViewer();
        }
      });

    // التنقل
    if (prevBtn) prevBtn.addEventListener("click", showPrev);
    if (nextBtn) nextBtn.addEventListener("click", showNext);

    // الزوم
    if (zoomInBtn) zoomInBtn.addEventListener("click", zoomIn);
    if (zoomOutBtn) zoomOutBtn.addEventListener("click", zoomOut);
    if (zoomInBtn2) zoomInBtn2.addEventListener("click", zoomIn);
    if (zoomOutBtn2) zoomOutBtn2.addEventListener("click", zoomOut);
    if (fitBtn) fitBtn.addEventListener("click", toggleFit);

    // Double-click للزوم
    if (image)
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
    if (container)
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
    if (container) {
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

    const viewer = document.getElementById("portfolio-viewer");
    if (viewer) {
      viewer.classList.add("active");
      // Ensure display block is set before opacity transition
      // handled by CSS

      // Fix for first time load
      setTimeout(() => {
        viewer.style.opacity = "1";
      }, 10);
    }
    document.body.style.overflow = "hidden";
  }

  function closeViewer() {
    isOpen = false;
    const viewer = document.getElementById("portfolio-viewer");
    if (viewer) viewer.classList.remove("active");
    document.body.style.overflow = "";
  }

  function showImage(index) {
    const image = document.getElementById("viewer-image");
    const loading = document.getElementById("viewer-loading");
    const title = document.getElementById("viewer-title");
    const counter = document.getElementById("viewer-counter");
    const storeLink = document.getElementById("viewer-store-link");

    if (!image) return;

    // إظهر/إخفاء رابط المتجر
    if (storeLink) {
      if (currentImages[index].link) {
        storeLink.href = currentImages[index].link;
        storeLink.style.display = "flex";
      } else {
        storeLink.style.display = "none";
      }
    }

    // إظهار التحميل
    if (loading) loading.style.display = "block";
    image.style.opacity = "0";
    image.style.transform = "scale(0.9)"; // subtle scale in effect

    // تحميل الصورة
    image.onload = function () {
      if (loading) loading.style.display = "none";
      image.style.opacity = "1";
      image.style.transform = `scale(${currentZoom})`;
    };

    image.src = currentImages[index].src;
    if (title) title.textContent = currentImages[index].title || "";
    if (counter) counter.textContent = `${index + 1} / ${currentImages.length}`;

    // تحديث أزرار التنقل
    const prevWrapper = document.getElementById("viewer-prev");
    const nextWrapper = document.getElementById("viewer-next");

    if (prevWrapper && prevWrapper.parentElement)
      prevWrapper.parentElement.style.display =
        currentImages.length > 1 ? "block" : "none";

    if (nextWrapper && nextWrapper.parentElement)
      nextWrapper.parentElement.style.display =
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

    if (!image) return;

    image.style.transform = `scale(${currentZoom})`;
    image.style.transformOrigin = "center top";
    if (zoomDisplay)
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
      if (!image || !container) return;

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
  // فتح المعاينة بالشاشة الكاملة
  // ═══════════════════════════════════════════════════════════════

  function openPreview(imgSrc) {
    const previewWindow = window.open("", "_blank");
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>معاينة</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body {
              width: 100%; height: 100%;
              background: #000;
              overflow: hidden;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <img src="${imgSrc}" alt="معاينة" />
        </body>
        </html>
      `);
      previewWindow.document.close();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // التهيئة التلقائية
  // ═══════════════════════════════════════════════════════════════

  function init() {
    // Collect all portfolio images from .work-card elements
    const workItems = document.querySelectorAll(".work-card img");
    const galleryGroup = [];

    // First pass: Build the gallery array
    workItems.forEach((img, index) => {
      // Find title from sibling overlay
      let title = "";
      const card = img.closest(".work-card");
      if (card) {
        const heading = card.querySelector("h3");
        if (heading) title = heading.textContent;
        const overlay = card.querySelector(".work-card-overlay");

        // Inject zoom button if missing
        let zoomBtn = card.querySelector(".work-card-zoom");
        if (!zoomBtn && overlay) {
            let actions = overlay.querySelector(".work-card-actions");
            if (!actions) {
              // Create actions wrapper if missing (wrapping existing links)
              actions = document.createElement("div");
              actions.className = "work-card-actions";
              const existingLinks = overlay.querySelectorAll("a");
              existingLinks.forEach((link) => actions.appendChild(link));
              overlay.appendChild(actions);
            }

            zoomBtn = document.createElement("button");
            zoomBtn.className = "work-card-zoom";
            zoomBtn.title = "تكبير الصورة";
            zoomBtn.innerHTML = `
              <svg class="svg-icon" viewBox="0 0 512 512" style="width: 16px; height: 16px;">
                <use xlink:href="assets/images/icons.svg#icon-search-plus"></use>
              </svg>
            `;
            actions.appendChild(zoomBtn);
        }

        // Inject preview button if missing
        let previewBtn = card.querySelector(".work-card-preview");
        if (!previewBtn && overlay) {
            let actions = overlay.querySelector(".work-card-actions");
            if (!actions) {
              actions = document.createElement("div");
              actions.className = "work-card-actions";
              const existingLinks = overlay.querySelectorAll("a");
              existingLinks.forEach((link) => actions.appendChild(link));
              overlay.appendChild(actions);
            }

            const imgSrc = img.getAttribute("src") || img.src;
            previewBtn = document.createElement("button");
            previewBtn.className = "work-card-preview";
            previewBtn.title = "معاينة الصورة بالحجم الكامل";
            previewBtn.innerHTML = `
              <svg class="svg-icon" viewBox="0 0 576 512" style="width: 14px; height: 14px; fill: currentColor;">
                <use xlink:href="assets/images/icons.svg#icon-eye"></use>
              </svg>
              معاينة
            `;
            previewBtn.addEventListener("click", function (e) {
              e.preventDefault();
              e.stopPropagation();
              openPreview(imgSrc);
            });
            actions.insertBefore(previewBtn, zoomBtn);
        }

        // Add click listener to the ZOOM BUTTON
        if (zoomBtn) {
          zoomBtn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent card click
            openViewer(galleryGroup, index);
          });
        }
      }

      galleryGroup.push({
        src: img.src,
        title: title || img.alt || `Work ${index + 1}`,
        link: card.querySelector("a") ? card.querySelector("a").href : null,
      });
    });

    // Also support legacy data-lightbox if present anywhere else
    const items = document.querySelectorAll("[data-lightbox]");
    if (items.length > 0) {
      const lightboxGroups = {};
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

        item.addEventListener("click", function (e) {
          e.preventDefault();
          openViewer(lightboxGroups[groupName], indexInGroup);
        });
      });
    }
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
