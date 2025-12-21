/**
 * SPA Router for Portfolio Website
 * Handles hash-based navigation and section visibility
 */

class SPARouter {
  constructor() {
    this.pages = document.querySelectorAll(".spa-page");
    this.navLinks = document.querySelectorAll(
      ".nav-links a, .footer-links a, .logo a"
    );
    this.init();
  }

  init() {
    // Handle initial load based on hash
    window.addEventListener("load", () => this.handleRoute());

    // Handle hash changes
    window.addEventListener("hashchange", () => this.handleRoute());

    // Intercept clicks on internal links
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (link && link.getAttribute("href")?.startsWith("#")) {
        // Internal hash link - standard behavior (let hashchange handle it)
      } else if (link && this.isInternalPageLink(link)) {
        e.preventDefault();
        const targetId = this.extractIdFromLink(link);
        window.location.hash = targetId;
      }
    });
  }

  isInternalPageLink(link) {
    const href = link.getAttribute("href");
    if (!href) return false;

    // Check if it matches existing page names or just the root
    const pages = [
      "index.html",
      "about.html",
      "services.html",
      "portfolio.html",
      "payment.html",
      "salla-discounts.html",
      "contact.html",
    ];
    return (
      pages.some((p) => href.includes(p)) ||
      href === "index.html" ||
      href === "/"
    );
  }

  extractIdFromLink(link) {
    const href = link.getAttribute("href");
    if (href === "index.html" || href === "/" || href === "") return "home";

    // Remove .html and extract the name
    return href.replace(".html", "").replace("./", "").replace("/", "");
  }

  handleRoute() {
    const hash = window.location.hash.replace("#", "") || "home";
    this.navigateTo(hash);
  }

  navigateTo(pageId) {
    // Verify section exists
    const targetPage = document.getElementById(pageId);
    if (!targetPage) {
      if (pageId !== "home") {
        console.warn(`Page #${pageId} not found, defaulting to home.`);
        window.location.hash = "home";
      }
      return;
    }

    // 1. Hide all pages
    this.pages.forEach((page) => {
      page.classList.remove("active");
      page.style.display = "none";
    });

    // 2. Show target page
    targetPage.style.display = "block";
    // Force reflow for animation
    targetPage.offsetHeight;
    targetPage.classList.add("active");

    // 3. Update navigation links status
    this.updateNavLinks(pageId);

    // 4. Scroll to top with a slight delay to allow rendering
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);

    // 5. Close mobile menu if open
    const nav = document.querySelector(".nav");
    if (nav && nav.classList.contains("active")) {
      nav.classList.remove("active");
    }
  }

  updateNavLinks(activeId) {
    this.navLinks.forEach((link) => {
      const linkId = this.extractIdFromLink(link);
      if (linkId === activeId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }
}

// Initialize Router when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.AppRouter = new SPARouter();
});
