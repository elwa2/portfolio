/**
 * 🎮 Gaming System - XP & Rewards
 * نظام نقاط الخبرة والمكافآت
 */

(function () {
  "use strict";

  // ============================================
  // Configuration - إعدادات النظام
  // ============================================
  const CONFIG = {
    XP_PER_PAGE_VISIT: 10,
    XP_PER_PROJECT_VIEW: 5,
    XP_PER_COUPON_COPY: 15,
    XP_DAILY_BONUS: 25,
    XP_PER_LIKE: 3,
    XP_PER_CONTACT: 50,

    // مستويات XP
    LEVELS: [
      { level: 1, name: "مبتدئ", minXP: 0, maxXP: 50 },
      { level: 2, name: "متصفح", minXP: 50, maxXP: 150 },
      { level: 3, name: "نشيط", minXP: 150, maxXP: 300 },
      { level: 4, name: "خبير", minXP: 300, maxXP: 500 },
      { level: 5, name: "VIP", minXP: 500, maxXP: Infinity },
    ],

    // المكافآت المتاحة (من صفحة الكوبونات الموجودة)
    REWARDS: [
      {
        id: "salla-package",
        name: "خصم باقات سلة",
        code: "F-AFN5N48K",
        xpCost: 100,
        icon: "🎁",
      },
      {
        id: "theme-celia",
        name: "خصم ثيم سيليا",
        code: "F-PSDOIDV4",
        xpCost: 80,
        icon: "🎨",
      },
      {
        id: "theme-fakhama",
        name: "خصم ثيم فخامة",
        code: "NEW-CODE-1",
        xpCost: 80,
        icon: "✨",
      },
      {
        id: "theme-malak",
        name: "خصم ثيم ملاك",
        code: "F-YLKSA1DX",
        xpCost: 80,
        icon: "👼",
      },
      {
        id: "theme-zaher",
        name: "خصم ثيم زاهر",
        code: "NEW-CODE-2",
        xpCost: 80,
        icon: "🌸",
      },
      {
        id: "theme-prestige",
        name: "خصم ثيم بريستيج",
        code: "F-DCAJSVCA",
        xpCost: 100,
        icon: "👑",
      },
      {
        id: "theme-yafa",
        name: "خصم ثيم يافا",
        code: "F-FQARWHFY",
        xpCost: 80,
        icon: "🏛️",
      },
    ],

    // شارات الإنجاز
    ACHIEVEMENTS: [
      {
        id: "explorer",
        name: "المستكشف",
        desc: "زيارة 5 صفحات",
        icon: "🌟",
        condition: (stats) => stats.pagesVisited >= 5,
        xp: 50,
      },
      {
        id: "art_lover",
        name: "عاشق الفن",
        desc: "مشاهدة 10 مشاريع",
        icon: "🎨",
        condition: (stats) => stats.projectsViewed >= 10,
        xp: 75,
      },
      {
        id: "saver",
        name: "الموفر",
        desc: "نسخ 5 أكواد خصم",
        icon: "💰",
        condition: (stats) => stats.couponsCopied >= 5,
        xp: 100,
      },
      {
        id: "daily_player",
        name: "اللاعب اليومي",
        desc: "زيارة 7 أيام متتالية",
        icon: "🔥",
        condition: (stats) => stats.consecutiveDays >= 7,
        xp: 150,
      },
      {
        id: "vip",
        name: "VIP",
        desc: "جمع 500 نقطة XP",
        icon: "👑",
        condition: (stats) => stats.totalXP >= 500,
        xp: 200,
      },
    ],

    STORAGE_KEY: "portfolio_gaming_data",
  };

  // ============================================
  // State Management - إدارة الحالة
  // ============================================
  let gameState = {
    xp: 0,
    level: 1,
    pagesVisited: 0,
    projectsViewed: 0,
    couponsCopied: 0,
    likes: [],
    unlockedAchievements: [],
    claimedRewards: [],
    lastVisit: null,
    consecutiveDays: 0,
    dailyBonusClaimed: false,
    visitedPages: [],
  };

  // ============================================
  // Storage Functions - وظائف التخزين
  // ============================================
  function loadState() {
    try {
      const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        gameState = { ...gameState, ...parsed };

        // التحقق من اليوم الجديد
        checkDailyReset();
      }
    } catch (e) {
      console.warn("Could not load game state:", e);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(gameState));
    } catch (e) {
      console.warn("Could not save game state:", e);
    }
  }

  function checkDailyReset() {
    const today = new Date().toDateString();
    const lastVisit = gameState.lastVisit;

    if (lastVisit !== today) {
      // يوم جديد
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastVisit === yesterday.toDateString()) {
        gameState.consecutiveDays++;
      } else if (lastVisit !== null) {
        gameState.consecutiveDays = 1;
      } else {
        gameState.consecutiveDays = 1;
      }

      gameState.dailyBonusClaimed = false;
      gameState.lastVisit = today;
      saveState();

      // عرض المكافأة اليومية
      setTimeout(() => showDailyBonus(), 1500);
    }
  }

  // ============================================
  // XP Functions - وظائف نقاط الخبرة
  // ============================================
  function addXP(amount, reason) {
    gameState.xp += amount;
    checkLevelUp();
    saveState();
    updateUI();
    showXPGain(amount, reason);
    checkAchievements();
  }

  function getCurrentLevel() {
    for (let i = CONFIG.LEVELS.length - 1; i >= 0; i--) {
      if (gameState.xp >= CONFIG.LEVELS[i].minXP) {
        return CONFIG.LEVELS[i];
      }
    }
    return CONFIG.LEVELS[0];
  }

  function checkLevelUp() {
    const newLevel = getCurrentLevel();
    if (newLevel.level > gameState.level) {
      gameState.level = newLevel.level;
      showLevelUp(newLevel);
    }
  }

  function getXPProgress() {
    const level = getCurrentLevel();
    if (level.maxXP === Infinity) return 100;
    const progress =
      ((gameState.xp - level.minXP) / (level.maxXP - level.minXP)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }

  // ============================================
  // Achievement Functions - وظائف الإنجازات
  // ============================================
  function checkAchievements() {
    CONFIG.ACHIEVEMENTS.forEach((achievement) => {
      if (!gameState.unlockedAchievements.includes(achievement.id)) {
        if (achievement.condition(gameState)) {
          unlockAchievement(achievement);
        }
      }
    });
  }

  function unlockAchievement(achievement) {
    gameState.unlockedAchievements.push(achievement.id);
    gameState.xp += achievement.xp;
    saveState();
    showAchievementNotification(achievement);
  }

  // ============================================
  // Reward Functions - وظائف المكافآت
  // ============================================
  function canClaimReward(reward) {
    return (
      gameState.xp >= reward.xpCost &&
      !gameState.claimedRewards.includes(reward.id)
    );
  }

  function claimReward(rewardId) {
    const reward = CONFIG.REWARDS.find((r) => r.id === rewardId);
    if (reward && canClaimReward(reward)) {
      gameState.xp -= reward.xpCost;
      gameState.claimedRewards.push(reward.id);
      saveState();
      updateUI();
      showRewardClaimed(reward);
      return true;
    }
    return false;
  }

  // ============================================
  // UI Creation - إنشاء واجهة المستخدم
  // ============================================
  function createXPBar() {
    const bar = document.createElement("div");
    bar.className = "xp-bar-container";
    bar.innerHTML = '<div class="xp-bar-fill"></div>';
    document.body.prepend(bar);
  }

  function createXPWidget() {
    const widget = document.createElement("div");
    widget.className = "xp-widget";
    widget.id = "xp-widget";
    widget.innerHTML = `
      <div class="xp-widget-header">
        <div class="xp-level-badge" id="level-badge">1</div>
        <div class="xp-info">
          <span class="xp-level-text" id="level-name">مبتدئ</span>
          <span class="xp-points">
            <i class="fas fa-star xp-icon"></i>
            <span id="xp-amount">0</span> XP
          </span>
        </div>
      </div>
      <div class="xp-widget-progress">
        <div class="xp-widget-progress-fill" id="xp-progress-fill"></div>
      </div>
    `;
    widget.onclick = () => openRewardsPanel();
    document.body.appendChild(widget);
  }

  function updateUI() {
    const level = getCurrentLevel();
    const progress = getXPProgress();

    // تحديث شريط XP العلوي
    const xpBarFill = document.querySelector(".xp-bar-fill");
    if (xpBarFill) {
      xpBarFill.style.width = `${Math.min((gameState.xp / 500) * 100, 100)}%`;
    }

    // تحديث widget
    const levelBadge = document.getElementById("level-badge");
    const levelName = document.getElementById("level-name");
    const xpAmount = document.getElementById("xp-amount");
    const progressFill = document.getElementById("xp-progress-fill");

    if (levelBadge) levelBadge.textContent = level.level;
    if (levelName) levelName.textContent = level.name;
    if (xpAmount) xpAmount.textContent = gameState.xp;
    if (progressFill) progressFill.style.width = `${progress}%`;
  }

  // ============================================
  // Notification Functions - الإشعارات
  // ============================================
  function showXPGain(amount, reason) {
    const popup = document.createElement("div");
    popup.className = "xp-gain-popup";
    popup.innerHTML = `
      <div class="xp-amount">
        <i class="fas fa-star"></i>
        +${amount} XP
      </div>
      <div class="xp-message">${reason || ""}</div>
    `;
    document.body.appendChild(popup);

    setTimeout(() => {
      popup.style.opacity = "0";
      popup.style.transform =
        "translate(-50%, -50%) scale(0.8) translateY(-20px)";
      setTimeout(() => popup.remove(), 300);
    }, 1500);
  }

  function showAchievementNotification(achievement) {
    const notification = document.createElement("div");
    notification.className = "achievement-notification";
    notification.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-title">🏆 إنجاز جديد!</div>
      <div class="achievement-name" style="color: white; font-size: 1.1rem; margin: 5px 0;">${achievement.name}</div>
      <div class="achievement-desc">${achievement.desc}</div>
      <div class="achievement-xp">+${achievement.xp} XP</div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(-50%) translateY(-20px)";
      setTimeout(() => notification.remove(), 300);
    }, 3500);
  }

  function showLevelUp(level) {
    const popup = document.createElement("div");
    popup.className = "achievement-notification";
    popup.style.borderColor = "#22c55e";
    popup.innerHTML = `
      <div class="achievement-icon">🎉</div>
      <div class="achievement-title" style="color: #22c55e;">ارتقاء المستوى!</div>
      <div style="color: white; font-size: 1.5rem; margin: 10px 0;">المستوى ${level.level}</div>
      <div class="achievement-desc">${level.name}</div>
    `;
    document.body.appendChild(popup);

    setTimeout(() => {
      popup.style.opacity = "0";
      setTimeout(() => popup.remove(), 300);
    }, 3000);
  }

  function showDailyBonus() {
    if (gameState.dailyBonusClaimed) return;

    const modal = document.createElement("div");
    modal.className = "daily-bonus-modal";
    modal.id = "daily-bonus-modal";
    modal.innerHTML = `
      <div class="daily-bonus-content">
        <div class="daily-bonus-icon">🎁</div>
        <div class="daily-bonus-title">مكافأة يومية!</div>
        <div class="daily-bonus-desc">مرحباً بعودتك! هذه مكافأتك اليومية</div>
        <div class="daily-bonus-reward">
          <i class="fas fa-star"></i> +${CONFIG.XP_DAILY_BONUS} XP
        </div>
        ${
          gameState.consecutiveDays > 1
            ? `<div style="color: #4dd4ac; margin-bottom: 15px;">🔥 ${gameState.consecutiveDays} أيام متتالية!</div>`
            : ""
        }
        <button class="daily-bonus-claim" onclick="window.GamingSystem.claimDailyBonus()">
          استلام المكافأة
        </button>
      </div>
    `;
    document.body.appendChild(modal);

    setTimeout(() => modal.classList.add("active"), 100);
  }

  function showRewardClaimed(reward) {
    // إظهار الكونفيتي
    createConfetti();

    // إظهار الكود
    const popup = document.createElement("div");
    popup.className = "achievement-notification";
    popup.style.borderColor = "#22c55e";
    popup.innerHTML = `
      <div class="achievement-icon">${reward.icon}</div>
      <div class="achievement-title" style="color: #22c55e;">تم فتح المكافأة!</div>
      <div class="achievement-desc">${reward.name}</div>
      <div style="background: rgba(34, 197, 94, 0.2); padding: 15px; border-radius: 10px; margin-top: 15px;">
        <div style="color: #4dd4ac; font-size: 0.8rem; margin-bottom: 5px;">كود الخصم:</div>
        <div style="color: white; font-size: 1.3rem; font-weight: bold; letter-spacing: 2px;">${reward.code}</div>
      </div>
      <button onclick="navigator.clipboard.writeText('${reward.code}'); this.textContent='تم النسخ! ✓';" 
              style="margin-top: 15px; padding: 10px 25px; background: var(--gaming-gradient); border: none; border-radius: 25px; color: white; cursor: pointer; font-family: 'Tajawal', sans-serif;">
        نسخ الكود
      </button>
    `;
    document.body.appendChild(popup);

    setTimeout(() => {
      popup.style.opacity = "0";
      setTimeout(() => popup.remove(), 300);
    }, 6000);
  }

  function createConfetti() {
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div");
      confetti.className = `confetti confetti-${(i % 4) + 1}`;
      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.animationDuration = Math.random() * 2 + 2 + "s";
      confetti.style.animationDelay = Math.random() * 0.5 + "s";
      confetti.style.animation = `confettiFall ${
        Math.random() * 2 + 2
      }s linear forwards`;
      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 4000);
    }
  }

  // ============================================
  // Rewards Panel - لوحة المكافآت
  // ============================================
  function openRewardsPanel() {
    const existing = document.getElementById("rewards-panel");
    if (existing) {
      existing.remove();
      return;
    }

    const level = getCurrentLevel();
    const nextLevel = CONFIG.LEVELS.find((l) => l.level === level.level + 1);

    const panel = document.createElement("div");
    panel.id = "rewards-panel";
    panel.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(15, 15, 36, 0.95);
      z-index: 10000;
      overflow-y: auto;
      padding: 20px;
    `;

    let rewardsHTML = CONFIG.REWARDS.map((reward) => {
      const canClaim = canClaimReward(reward);
      const claimed = gameState.claimedRewards.includes(reward.id);

      return `
        <div class="reward-card ${
          !canClaim && !claimed ? "locked" : ""
        }" style="background: var(--gaming-bg-dark); border: 2px solid ${
        claimed
          ? "#22c55e"
          : canClaim
          ? "var(--gaming-secondary)"
          : "var(--gaming-card-border)"
      }; border-radius: 15px; padding: 25px; position: relative;">
          <div class="reward-xp-cost" style="position: absolute; top: 15px; left: 15px; background: var(--gaming-gradient-gold); color: #1a1a3e; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold;">
            ${reward.xpCost} XP
          </div>
          <div style="font-size: 3rem; text-align: center; margin-bottom: 15px;">${
            reward.icon
          }</div>
          <div style="color: white; font-size: 1.1rem; font-weight: bold; text-align: center; margin-bottom: 10px;">${
            reward.name
          }</div>
          <div style="color: rgba(255,255,255,0.7); font-size: 0.85rem; text-align: center; margin-bottom: 15px;">
            ${claimed ? `كود: ${reward.code}` : "افتح للحصول على الكود"}
          </div>
          <button onclick="window.GamingSystem.claimReward('${reward.id}')" 
                  ${!canClaim || claimed ? "disabled" : ""}
                  style="width: 100%; padding: 12px; background: ${
                    claimed
                      ? "#22c55e"
                      : canClaim
                      ? "var(--gaming-gradient)"
                      : "rgba(255,255,255,0.1)"
                  }; border: none; border-radius: 10px; color: white; font-weight: bold; cursor: ${
        canClaim && !claimed ? "pointer" : "not-allowed"
      }; font-family: 'Tajawal', sans-serif;">
            ${
              claimed
                ? "✓ تم الفتح"
                : canClaim
                ? "فتح المكافأة"
                : `يلزم ${reward.xpCost} XP`
            }
          </button>
        </div>
      `;
    }).join("");

    let achievementsHTML = CONFIG.ACHIEVEMENTS.map((achievement) => {
      const unlocked = gameState.unlockedAchievements.includes(achievement.id);
      return `
        <div style="background: var(--gaming-bg-dark); border: 2px solid ${
          unlocked ? "#fbbf24" : "var(--gaming-card-border)"
        }; border-radius: 15px; padding: 20px; text-align: center; ${
        !unlocked ? "opacity: 0.5; filter: grayscale(50%);" : ""
      }">
          <div style="font-size: 2.5rem; margin-bottom: 10px;">${
            achievement.icon
          }</div>
          <div style="color: ${
            unlocked ? "#fbbf24" : "white"
          }; font-weight: bold;">${achievement.name}</div>
          <div style="color: rgba(255,255,255,0.6); font-size: 0.85rem; margin-top: 5px;">${
            achievement.desc
          }</div>
          <div style="color: #4dd4ac; font-size: 0.8rem; margin-top: 8px;">+${
            achievement.xp
          } XP</div>
        </div>
      `;
    }).join("");

    panel.innerHTML = `
      <div style="max-width: 1200px; margin: 0 auto;">
        <button onclick="document.getElementById('rewards-panel').remove()" 
                style="position: fixed; top: 20px; right: 20px; background: var(--gaming-primary); border: none; width: 50px; height: 50px; border-radius: 50%; color: white; font-size: 1.5rem; cursor: pointer; z-index: 10001;">
          ✕
        </button>
        
        <div style="text-align: center; margin-bottom: 40px; padding-top: 20px;">
          <h1 style="color: white; font-size: 2rem; margin-bottom: 10px;">🎮 مركز المكافآت</h1>
          <p style="color: var(--gaming-secondary);">اجمع النقاط واستبدلها بأكواد خصم!</p>
        </div>
        
        <!-- معلومات المستوى -->
        <div class="level-progress-section" style="background: var(--gaming-bg-dark); border: 2px solid var(--gaming-card-border); border-radius: 20px; padding: 30px; margin-bottom: 30px;">
          <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px;">
            <div style="width: 80px; height: 80px; background: var(--gaming-gradient); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold; color: white; box-shadow: var(--gaming-glow-primary);">
              ${level.level}
            </div>
            <div>
              <h3 style="color: white; font-size: 1.3rem; margin: 0 0 5px 0;">${
                level.name
              }</h3>
              <p style="color: var(--gaming-secondary); margin: 0;">${
                gameState.xp
              } XP ${
      nextLevel ? `/ ${nextLevel.minXP} XP` : "(الحد الأقصى)"
    }</p>
            </div>
          </div>
          <div style="width: 100%; height: 12px; background: rgba(255,255,255,0.1); border-radius: 6px; overflow: hidden;">
            <div style="height: 100%; width: ${getXPProgress()}%; background: var(--gaming-gradient); border-radius: 6px;"></div>
          </div>
        </div>
        
        <!-- المكافآت -->
        <h2 style="color: white; font-size: 1.5rem; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
          <i class="fas fa-gift" style="color: var(--gaming-gold);"></i> المكافآت المتاحة
        </h2>
        <div class="rewards-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px; margin-bottom: 40px;">
          ${rewardsHTML}
        </div>
        
        <!-- الإنجازات -->
        <h2 style="color: white; font-size: 1.5rem; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
          <i class="fas fa-trophy" style="color: var(--gaming-gold);"></i> الإنجازات
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px; margin-bottom: 40px;">
          ${achievementsHTML}
        </div>
        
        <!-- الإحصائيات -->
        <h2 style="color: white; font-size: 1.5rem; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
          <i class="fas fa-chart-bar" style="color: var(--gaming-gold);"></i> إحصائياتك
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px;">
          <div style="background: var(--gaming-bg-dark); border-radius: 15px; padding: 20px; text-align: center;">
            <div style="font-size: 2rem; color: var(--gaming-gold);">${
              gameState.pagesVisited
            }</div>
            <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">صفحات زُرتها</div>
          </div>
          <div style="background: var(--gaming-bg-dark); border-radius: 15px; padding: 20px; text-align: center;">
            <div style="font-size: 2rem; color: var(--gaming-gold);">${
              gameState.projectsViewed
            }</div>
            <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">مشاريع شاهدتها</div>
          </div>
          <div style="background: var(--gaming-bg-dark); border-radius: 15px; padding: 20px; text-align: center;">
            <div style="font-size: 2rem; color: var(--gaming-gold);">${
              gameState.couponsCopied
            }</div>
            <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">أكواد نسختها</div>
          </div>
          <div style="background: var(--gaming-bg-dark); border-radius: 15px; padding: 20px; text-align: center;">
            <div style="font-size: 2rem; color: var(--gaming-gold);">${
              gameState.consecutiveDays
            }</div>
            <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">أيام متتالية</div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);
  }

  // ============================================
  // Tracking Functions - وظائف التتبع
  // ============================================
  function trackPageVisit() {
    const currentPage = window.location.pathname;
    if (!gameState.visitedPages.includes(currentPage)) {
      gameState.visitedPages.push(currentPage);
      gameState.pagesVisited++;
      addXP(CONFIG.XP_PER_PAGE_VISIT, "زيارة صفحة جديدة");
    }
  }

  function trackProjectView(projectId) {
    gameState.projectsViewed++;
    addXP(CONFIG.XP_PER_PROJECT_VIEW, "مشاهدة مشروع");
  }

  function trackCouponCopy() {
    gameState.couponsCopied++;
    addXP(CONFIG.XP_PER_COUPON_COPY, "نسخ كود خصم");
  }

  function trackLike(itemId) {
    if (!gameState.likes.includes(itemId)) {
      gameState.likes.push(itemId);
      addXP(CONFIG.XP_PER_LIKE, "إعجاب");
    }
  }

  // ============================================
  // Public API - الواجهة العامة
  // ============================================
  window.GamingSystem = {
    addXP: addXP,
    trackProjectView: trackProjectView,
    trackCouponCopy: trackCouponCopy,
    trackLike: trackLike,
    claimReward: function (rewardId) {
      if (claimReward(rewardId)) {
        openRewardsPanel(); // إعادة فتح للتحديث
      }
    },
    claimDailyBonus: function () {
      if (!gameState.dailyBonusClaimed) {
        gameState.dailyBonusClaimed = true;
        addXP(CONFIG.XP_DAILY_BONUS, "مكافأة يومية");

        const modal = document.getElementById("daily-bonus-modal");
        if (modal) {
          modal.classList.remove("active");
          setTimeout(() => modal.remove(), 300);
        }
      }
    },
    openRewards: openRewardsPanel,
    getState: () => ({ ...gameState }),
    getLevel: getCurrentLevel,
  };

  // ============================================
  // Initialization - التهيئة
  // ============================================
  function init() {
    loadState();

    // إنشاء عناصر UI
    createXPBar();
    createXPWidget();

    // تتبع زيارة الصفحة
    trackPageVisit();

    // تحديث UI
    updateUI();

    // ربط أحداث نسخ الكوبونات
    document.addEventListener("click", function (e) {
      if (
        e.target.closest(".copy-btn") ||
        e.target.closest('[onclick*="copyToClipboard"]')
      ) {
        setTimeout(() => trackCouponCopy(), 100);
      }
    });

    // ربط أحداث معرض الأعمال
    document
      .querySelectorAll(".portfolio-item, [data-lightbox]")
      .forEach((item) => {
        item.addEventListener("click", () => trackProjectView());
      });

    console.log("🎮 Gaming System initialized!", gameState);
  }

  // تشغيل عند تحميل الصفحة
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
