/**
 * 🔗 Core - Application Orchestrator
 * Bootstraps all modules and manages global logic flows.
 */

import { storage } from "./StorageManager.js";
import { gameState } from "./GameState.js";
import { notifications } from "./NotificationManager.js";
import { appShell } from "./AppShell.js";

class Core {
  constructor() {
    this.version = "2026.1.0";
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    console.log(`🚀 Ali Ahmed Portfolio ${this.version} - Initializing...`);

    try {
      // 1. Init Storage
      await storage.init();

      // 2. Init Game State
      await gameState.init();

      // 3. Init App Shell UI
      appShell.init();

      // 4. Register Global Events
      this.registerEvents();

      // 4. Social Proof Simulation (Psychological Trigger)
      this.startSocialProofSimulation();

      this.initialized = true;

      // Expose to global window for non-module integration (like legacy scripts)
      window.gameState = gameState;
      window.notifications = notifications;

      console.log("✅ Core successfully initialized.");
    } catch (error) {
      console.error("❌ Core initialization failed:", error);
    }
  }

  registerEvents() {
    // Track clicks for XP
    document.addEventListener("click", (e) => {
      const rewardable = e.target.closest("[data-xp]");
      if (rewardable) {
        const amount = parseInt(rewardable.dataset.xp) || 5;
        const reason = rewardable.dataset.reason || "تفاعل نشط";
        gameState.addXp(amount, reason);
      }
    });

    // Listen for level ups
    gameState.subscribe((state, event) => {
      if (event.leveledUp) {
        notifications.show({
          title: `المستوى ${state.level}`,
          message: "تهانينا! لقد ارتفعت رتبتك كتاجر محترف!",
          type: "reward",
          icon: "🚀",
          duration: 8000,
        });
      }
    });
  }

  startSocialProofSimulation() {
    const names = [
      "أحمد",
      "نورة",
      "محمد",
      "سارة",
      "عبدالله",
      "ليلى",
      "خالد",
      "مريم",
    ];
    const actions = [
      "قام بتحميل كاشف الثيمات الآن",
      "حصل على كود خصم سلة",
      "بدأ مشروعاً جديداً معنا",
      "استخدم باقة سلة المتكاملة",
      "تم ترقيته للمستوى الاحترافي",
    ];

    const trigger = () => {
      if (Math.random() > 0.7) {
        const name = names[Math.floor(Math.random() * names.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        notifications.socialProof(name, action);
      }
      setTimeout(trigger, Math.random() * 20000 + 15000); // 15-35 seconds
    };

    setTimeout(trigger, 10000); // Start after 10s
  }
}

export const core = new Core();

// Auto-init on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => core.init());
} else {
  core.init();
}
