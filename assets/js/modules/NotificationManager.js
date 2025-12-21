/**
 * 🔔 NotificationManager - Professional UI feedback system
 * Handles "Social Proof" popups and gamification milestones.
 */

class NotificationManager {
  constructor() {
    this.container = this.createContainer();
    this.queue = [];
  }

  createContainer() {
    let container = document.getElementById("notification-hub");
    if (!container) {
      container = document.createElement("div");
      container.id = "notification-hub";
      container.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * Show a toast notification
   */
  show(options) {
    const {
      title = "تنبيه",
      message = "",
      type = "info", // info, success, achievement, reward
      duration = 5000,
      icon = "✨",
    } = options;

    const toast = document.createElement("div");
    toast.className = `app-notification type-${type}`;
    toast.innerHTML = `
            <div class="notif-icon">${icon}</div>
            <div class="notif-body">
                <div class="notif-title">${title}</div>
                <div class="notif-message">${message}</div>
            </div>
            <div class="notif-progress"></div>
        `;

    this.container.appendChild(toast);

    // Auto-remove
    setTimeout(() => {
      toast.classList.add("removing");
      toast.addEventListener("animationend", () => toast.remove());
    }, duration);
  }

  /**
   * Special Social Proof Achievement
   */
  socialProof(name, action) {
    this.show({
      title: name,
      message: action,
      type: "info",
      icon: "👤",
      duration: 4000,
    });
  }

  achievement(title, xp) {
    this.show({
      title: "🎉 إنجاز جديد!",
      message: `${title} (+${xp} XP)`,
      type: "achievement",
      icon: "🏆",
      duration: 6000,
    });
  }
}

export const notifications = new NotificationManager();
