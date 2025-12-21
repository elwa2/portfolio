/**
 * AppShell.js
 * Manages the main application layout, sidebar, header, and navigation.
 */
class AppShell {
  constructor() {
    this.elements = {
      app: null, // Will bind to #app-shell
      sidebar: null,
      topBar: null,
      contentArea: null,
      themeToggle: null,
      navLinks: null,
    };
    this.state = {
      isSidebarCollapsed: false,
      theme: "dark", // Default to dark for "professional/gaming" feel
      activeView: "home",
    };
  }

  async init() {
    this.bindElements();

    // Restore state from Storage
    const savedTheme = await window.storageManager.getPref("theme");
    if (savedTheme) this.state.theme = savedTheme;

    const savedSidebar = await window.storageManager.getPref(
      "sidebarCollapsed"
    );
    if (savedSidebar !== null) this.state.isSidebarCollapsed = savedSidebar;

    this.applyTheme();
    this.applySidebarState();
    this.setupEventListeners();

    // Initial route handling
    this.handleInitialRoute();

    // Load XP
    this.updateXPDisplay();

    console.log("AppShell: Initialized");
  }

  async updateXPDisplay() {
    const xp = await window.storageManager.getGameState("userXP", 0);
    const xpDisplay = document.getElementById("user-xp");
    if (xpDisplay) xpDisplay.textContent = xp;
  }

  bindElements() {
    this.elements.app = document.getElementById("app-shell");
    this.elements.sidebar = document.getElementById("app-sidebar");
    this.elements.sidebarToggle = document.getElementById("sidebar-toggle");
    this.elements.themeToggle = document.getElementById("theme-toggle-btn");
    this.elements.contentArea = document.getElementById("main-content");

    // Navigation links within sidebar
    this.elements.navLinks = document.querySelectorAll(".app-nav-link");
  }

  setupEventListeners() {
    // Sidebar Toggle
    if (this.elements.sidebarToggle) {
      this.elements.sidebarToggle.addEventListener("click", () => {
        this.toggleSidebar();
      });
    }

    // Theme Toggle
    if (this.elements.themeToggle) {
      this.elements.themeToggle.addEventListener("click", () => {
        this.toggleTheme();
      });
    }

    // Navigation
    this.elements.navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href").substring(1);
        this.navigateTo(targetId);

        // Mobile: Auto-close sidebar on navigate
        if (window.innerWidth <= 768) {
          this.setSidebar(true);
        }
      });
    });

    // Handle Resize for responsive sidebar
    window.addEventListener("resize", () => {
      if (window.innerWidth <= 768 && !this.state.isSidebarCollapsed) {
        this.setSidebar(true);
      }
    });
  }

  handleInitialRoute() {
    const hash = window.location.hash.substring(1);
    this.navigateTo(hash || "home");
  }

  // --- Sidebar Logic ---
  toggleSidebar() {
    this.setSidebar(!this.state.isSidebarCollapsed);
  }

  setSidebar(collapsed) {
    this.state.isSidebarCollapsed = collapsed;
    this.applySidebarState();
    window.storageManager.setPref("sidebarCollapsed", collapsed);
  }

  applySidebarState() {
    if (this.state.isSidebarCollapsed) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }
  }

  // --- Theme Logic ---
  toggleTheme() {
    const newTheme = this.state.theme === "dark" ? "light" : "dark";
    this.setTheme(newTheme);
  }

  setTheme(theme) {
    this.state.theme = theme;
    this.applyTheme();
    window.storageManager.setPref("theme", theme);
  }

  applyTheme() {
    document.documentElement.setAttribute("data-theme", this.state.theme);
    // You might want to update an icon here too
    const icon = this.elements.themeToggle?.querySelector("use");
    if (icon) {
      icon.setAttribute(
        "xlink:href",
        `assets/images/icons.svg#icon-${
          this.state.theme === "dark" ? "sun" : "moon"
        }`
      );
    }
  }

  // --- Navigation Logic ---
  navigateTo(viewId) {
    // Hide all views
    const views = document.querySelectorAll(".spa-page");
    views.forEach((v) => v.classList.remove("active"));

    // Show target view
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add("active");
      this.state.activeView = viewId;

      // Update active link styling
      this.elements.navLinks.forEach((l) => {
        if (l.getAttribute("href") === `#${viewId}`) {
          l.classList.add("active");
        } else {
          l.classList.remove("active");
        }
      });

      // Update URL hash without scroll
      history.replaceState(null, null, `#${viewId}`);
    }
  }
}

// Initialize on load
window.addEventListener("DOMContentLoaded", () => {
  window.appShell = new AppShell();

  // Init storage first, then app shell
  if (window.storageManager) {
    window.storageManager.init().then(() => {
      window.appShell.init();
    });
  }
});
