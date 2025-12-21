/**
 * 🛰️ AppShell.js - Layout Orchestrator
 * Manages the transition between a traditional website and a modern App Experience.
 */

class AppShell {
  constructor() {
    this.sidebar = null;
    this.content = null;
  }

  init() {
    this.sidebar = document.querySelector(".app-sidebar");
    this.content = document.querySelector("#spa-container");
    this.bindEvents();
    console.log("🛰️ AppShell initialized");
  }

  bindEvents() {
    // Toggle Sidebar on Mobile
    const toggle = document.querySelector(".mobile-toggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        document.body.classList.toggle("sidebar-open");
      });
    }

    // Close sidebar on link click (mobile)
    document.querySelectorAll(".sidebar-link").forEach((link) => {
      link.addEventListener("click", () => {
        document.body.classList.remove("sidebar-open");
      });
    });
  }
}

export const appShell = new AppShell();
