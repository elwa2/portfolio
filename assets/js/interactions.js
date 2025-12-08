/**
 * Professional Interactions & Animations
 * تفاعلات واحترافية متقدمة
 */

(function () {
  "use strict";

  // Wait for DOM to be ready
  document.addEventListener("DOMContentLoaded", function () {
    initScrollReveal();
    initSmoothInteractions();
    initParallaxEffects();
    initCounterAnimations();
    initLazyLoading();
  });

  /**
   * Scroll Reveal Animation
   * إظهار العناصر عند التمرير
   */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right"
    );

    // Also add reveal class to common elements
    const elementsToAnimate = document.querySelectorAll(
      ".service-card, .portfolio-item, .stat-card, .testimonial-card, " +
        ".card-pro, .service-card-pro, .portfolio-card-pro, .stat-card-pro"
    );

    elementsToAnimate.forEach((el, index) => {
      if (!el.classList.contains("reveal")) {
        el.classList.add("reveal");
        el.style.transitionDelay = `${index * 0.1}s`;
      }
    });

    const allRevealElements = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right"
    );

    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -100px 0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          // Optionally unobserve after animation
          // observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    allRevealElements.forEach((el) => observer.observe(el));
  }

  /**
   * Smooth Hover Interactions
   * تفاعلات التحويم السلسة
   */
  function initSmoothInteractions() {
    // Enhanced card hover with perspective
    const cards = document.querySelectorAll(
      ".service-card, .portfolio-item, .card-pro"
    );

    cards.forEach((card) => {
      card.addEventListener("mousemove", function (e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
      });

      card.addEventListener("mouseleave", function () {
        this.style.transform =
          "perspective(1000px) rotateX(0) rotateY(0) translateY(0)";
      });
    });

    // Ripple effect on buttons
    const buttons = document.querySelectorAll(".btn, .btn-pro, .hero-btn");

    buttons.forEach((button) => {
      button.addEventListener("click", function (e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement("span");
        ripple.className = "ripple-effect";
        ripple.style.cssText = `
          position: absolute;
          left: ${x}px;
          top: ${y}px;
          width: 0;
          height: 0;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: ripple-animation 0.6s ease-out;
          pointer-events: none;
        `;

        this.style.position = "relative";
        this.style.overflow = "hidden";
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      });
    });

    // Add ripple animation CSS
    if (!document.querySelector("#ripple-styles")) {
      const style = document.createElement("style");
      style.id = "ripple-styles";
      style.textContent = `
        @keyframes ripple-animation {
          to {
            width: 300px;
            height: 300px;
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Parallax Effects
   * تأثيرات المنظر المتحرك
   */
  function initParallaxEffects() {
    const parallaxElements = document.querySelectorAll(
      ".hero-section, [data-parallax]"
    );

    if (parallaxElements.length === 0) return;

    let ticking = false;

    window.addEventListener("scroll", function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          parallaxElements.forEach((el) => {
            const scrolled = window.pageYOffset;
            const rate = el.dataset.parallaxRate || 0.3;

            if (el.classList.contains("hero-section")) {
              const heroContent = el.querySelector(".hero-content");
              if (heroContent) {
                heroContent.style.transform = `translateY(${
                  scrolled * rate
                }px)`;
                heroContent.style.opacity = 1 - scrolled / 600;
              }
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /**
   * Counter Animation for Statistics
   * تحريك الأرقام للإحصائيات
   */
  function initCounterAnimations() {
    const counters = document.querySelectorAll(
      "[data-counter], .stat-number, .counter-number"
    );

    const observerOptions = {
      threshold: 0.5,
    };

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (
          entry.isIntersecting &&
          !entry.target.classList.contains("counted")
        ) {
          animateCounter(entry.target);
          entry.target.classList.add("counted");
        }
      });
    }, observerOptions);

    counters.forEach((counter) => counterObserver.observe(counter));
  }

  function animateCounter(element) {
    const text = element.textContent;
    const target = parseInt(text.replace(/\D/g, ""), 10);

    if (isNaN(target)) return;

    const suffix = text.replace(/[\d,]/g, "");
    const duration = 2000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target.toLocaleString("ar-EG") + suffix;
        clearInterval(timer);
      } else {
        element.textContent =
          Math.floor(current).toLocaleString("ar-EG") + suffix;
      }
    }, 16);
  }

  /**
   * Lazy Loading for Images
   * التحميل الكسول للصور
   */
  function initLazyLoading() {
    const images = document.querySelectorAll(
      "img[data-src], img:not([loading])"
    );

    // Add native lazy loading to images that don't have it
    images.forEach((img) => {
      if (!img.hasAttribute("loading")) {
        img.setAttribute("loading", "lazy");
      }
    });

    // For browsers that don't support native lazy loading
    if ("IntersectionObserver" in window) {
      const lazyImages = document.querySelectorAll("img[data-src]");

      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
            imageObserver.unobserve(img);
          }
        });
      });

      lazyImages.forEach((img) => imageObserver.observe(img));
    }
  }

  /**
   * Smooth Page Transitions
   * انتقالات الصفحة السلسة
   */
  window.addEventListener("beforeunload", function () {
    document.body.classList.add("page-transitioning");
  });

  // Add page transition styles
  if (!document.querySelector("#page-transition-styles")) {
    const style = document.createElement("style");
    style.id = "page-transition-styles";
    style.textContent = `
      .page-transitioning {
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      body {
        opacity: 1;
        transition: opacity 0.3s ease;
      }
    `;
    document.head.appendChild(style);
  }
})();
