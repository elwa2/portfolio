/**
 * 🎮 Theme Detector Game - JavaScript Module
 * Gamification & Reward System with Spin Wheel
 */

(function () {
  "use strict";

  // === Discount Codes Database ===
  // Using a subset for the wheel segments to keep it readable (8 segments)
  const discountCodes = [
    {
      theme: "ثيم سيليا",
      code: "F-PSDOIDV4",
      link: "https://mtjr.at/XqG7keYSfD",
      color: "#8b5cf6",
    },
    {
      theme: "ثيم ملاك",
      code: "F-YLKSA1DX",
      link: "https://mtjr.at/EraL4acka6",
      color: "#ec4899",
    },
    {
      theme: "ثيم بريستيج",
      code: "F-DCAJSVCA",
      link: "https://mtjr.at/eajOVO8rUS",
      color: "#06b6d4",
    },
    {
      theme: "ثيم رؤية",
      code: "F-SHOYW33Q",
      link: "https://mtjr.at/1YgwWVss7D",
      color: "#10b981",
    },
    {
      theme: "ثيم عالي",
      code: "F-NMHPXPOK",
      link: "https://mtjr.at/PKX1CuD1q3",
      color: "#f59e0b",
    },
    {
      theme: "ثيم بوتيك",
      code: "F-JKGJJPTZ",
      link: "https://mtjr.at/X5TWle8EUj",
      color: "#6366f1",
    },
    {
      theme: "ثيم بيلا",
      code: "F-U3YHN4Q3",
      link: "https://mtjr.at/eXlF5Fq4l3",
      color: "#ef4444",
    },
    {
      theme: "باقة سلة",
      code: "F-AFN5N48K",
      link: "https://mtjr.at/LfOztodFwz",
      color: "#3b82f6",
    },
  ];

  // === Download URLs ===
  const downloadUrls = {
    chrome:
      "https://chromewebstore.google.com/detail/gegmcpkdknaegpinpjioccdhidpkjpnh/",
    edge: "https://microsoftedge.microsoft.com/addons/detail/%D9%83%D8%A7%D8%B4%D9%81-%D8%AB%D9%8A%D9%85%D8%A7%D8%AA-%D9%85%D8%AA%D8%A7%D8%AC%D8%B1-%D8%B3%D9%84%D8%A9-sa/ogeapoamjpobcldlkjabjgmifgokplld",
  };

  // === State ===
  let currentRotation = 0;
  let isSpinning = false;
  let winnerIndex = -1;

  // === Initialize ===
  function init() {
    bindEvents();
    initLiveCounter();
    initCodesRemaining();
    animateProgressBar();
  }

  // === Bind Events ===
  function bindEvents() {
    // Chrome Button
    const chromeBtn = document.querySelector(".chrome-btn");
    if (chromeBtn) {
      chromeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        handleDownloadClick("chrome");
      });
    }

    // Edge Button
    const edgeBtn = document.querySelector(".edge-btn");
    if (edgeBtn) {
      edgeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        handleDownloadClick("edge");
      });
    }

    // Copy Reward Button
    const copyBtn = document.querySelector(".copy-reward-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", copyRewardCode);
    }

    // Close Modal Button
    const closeBtn = document.querySelector(".close-modal-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);
    }

    // Spin Button
    document.addEventListener("click", function (e) {
      if (e.target && e.target.id === "spinBtn") {
        spinWheel();
      }
    });

    // Close modal on backdrop click
    const modal = document.getElementById("rewardModal");
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          closeModal();
        }
      });
    }
  }

  // === Handle Download Click ===
  function handleDownloadClick(browser) {
    window.open(downloadUrls[browser], "_blank");

    setTimeout(() => {
      showRewardModal();
    }, 1500);
  }

  // === Show Reward Modal ===
  function showRewardModal() {
    const modal = document.getElementById("rewardModal");

    // Reset state
    currentRotation = 0;
    isSpinning = false;
    winnerIndex = -1;

    // Ensure wheel is visible and reset
    resetWheelUI();

    // Show modal
    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Initialize/Draw Wheel
    setTimeout(() => {
      drawWheel();
      playConfetti(); // Little welcome confetti
    }, 300);
  }

  function resetWheelUI() {
    const canvas = document.getElementById("wheelCanvas");
    const spinBtn = document.getElementById("spinBtn");
    const rewardInfo = document.querySelector(".reward-info-container");

    if (canvas) {
      canvas.style.transform = `rotate(0deg)`;
      canvas.style.opacity = "1";
      canvas.style.display = "block";
    }

    if (spinBtn) {
      spinBtn.disabled = false;
      spinBtn.textContent = "دِر العجلة! 🎡";
      spinBtn.style.display = "block";
    }

    if (rewardInfo) {
      rewardInfo.classList.remove("show");
    }

    // Hide pointer if it was hidden
    const pointer = document.querySelector(".wheel-pointer");
    if (pointer) pointer.style.display = "block";
  }

  // === Close Modal ===
  function closeModal() {
    const modal = document.getElementById("rewardModal");
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  // === Draw Wheel ===
  function drawWheel() {
    const canvas = document.getElementById("wheelCanvas");
    if (!canvas) return;

    const container = document.querySelector(".spin-wheel-container");
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2;
    const segments = discountCodes.length;
    const arcSize = (2 * Math.PI) / segments;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < segments; i++) {
      const angle = i * arcSize;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
      ctx.fillStyle = discountCodes[i].color;
      ctx.fill();
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arcSize / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px Tajawal";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 4;
      ctx.fillText(discountCodes[i].theme, radius - 20, 5);
      ctx.restore();
    }
  }

  // === Spin Logic ===
  function spinWheel() {
    if (isSpinning) return;

    isSpinning = true;
    const spinBtn = document.getElementById("spinBtn");
    if (spinBtn) spinBtn.disabled = true;

    // Determine winner randomly
    winnerIndex = Math.floor(Math.random() * discountCodes.length);

    // Calculate rotation
    // Segments are drawn clockwise from 0 (3 o'clock).
    // Pointer is at top (270deg or -90deg).
    // We need to rotate so that the winner segment ends up at the TOP.

    const segments = discountCodes.length;
    const arcSize = 360 / segments;

    // The winner index should be at 270 degrees.
    // rotation = spins + (270 - (winnerIndex * arcSize + arcSize/2))
    // Adding extra spins (5 full rotations)
    const extraSpins = 360 * 5;

    // Calculate target angle to align winner center with pointer (-90deg or 270deg)
    // Canvas 0 is at 3 o'clock.
    // Segment i starts at i * arcSize.
    // Center of segment i is i * arcSize + arcSize/2.
    // We want Center of segment i to be at 270deg (Top).
    // So we rotate backwards by (Center - 270).
    // But CSS rotate moves clockwise. So we rotate forward by (270 - Center).

    const winnerAngleCenter = winnerIndex * arcSize + arcSize / 2;
    const targetRotation = 270 - winnerAngleCenter;

    // Ensure positive rotation and multiple spins
    let finalRotation = extraSpins + targetRotation;

    // CSS Transition handles the animation
    const canvas = document.getElementById("wheelCanvas");
    canvas.style.transform = `rotate(${finalRotation}deg)`;

    // Wait for animation to finish (4s)
    setTimeout(() => {
      displayReward(winnerIndex);
    }, 4000);
  }

  function displayReward(index) {
    const reward = discountCodes[index];

    // Hide wheel elements slightly to focus on reward
    const canvas = document.getElementById("wheelCanvas");
    const spinBtn = document.getElementById("spinBtn");
    const pointer = document.querySelector(".wheel-pointer");

    if (canvas) canvas.style.opacity = "0.3";
    if (spinBtn) spinBtn.style.display = "none";
    if (pointer) pointer.style.display = "none";

    // Populate and show reward info
    const themeName = document.getElementById("rewardThemeName");
    const rewardCode = document.getElementById("rewardCode");
    const rewardInfo = document.querySelector(".reward-info-container");
    const goToThemeBtn = document.querySelector(".go-to-theme-btn");

    if (themeName) themeName.textContent = reward.theme;
    if (rewardCode) rewardCode.textContent = reward.code;
    if (goToThemeBtn) goToThemeBtn.href = reward.link;

    if (rewardInfo) rewardInfo.classList.add("show");

    // 🎮 Gamification Integration
    if (window.gameState) {
      window.gameState.addXp(150, `ربحت ${reward.theme}`);
      window.gameState.unlockAchievement(
        "lucky_spinner",
        "المحظوظ: استخدمت عجلة الحظ"
      );
    }

    playConfetti(); // Celebration confetti!
  }

  // === Copy Reward Code ===
  function copyRewardCode() {
    const codeEl = document.getElementById("rewardCode");
    if (!codeEl) return;

    const code = codeEl.textContent;

    navigator.clipboard.writeText(code).then(() => {
      const copyBtn = document.querySelector(".copy-reward-btn");
      copyBtn.classList.add("copied");
      copyBtn.innerHTML = "✅ تم النسخ!";

      setTimeout(() => {
        copyBtn.classList.remove("copied");
        copyBtn.innerHTML = "📋 نسخ الكود";
      }, 2000);
    });
  }

  // === Live Counter Animation ===
  function initLiveCounter() {
    const counterEl = document.querySelector(".live-counter span:last-child");
    if (!counterEl) return;

    let baseCount = 800;
    setInterval(() => {
      const change = Math.floor(Math.random() * 5) - 2;
      baseCount = Math.max(750, Math.min(950, baseCount + change));
      counterEl.textContent = `${baseCount} تاجر يستخدمها الآن`;
    }, 5000);
  }

  // === Codes Remaining Counter ===
  function initCodesRemaining() {
    const codesEl = document.getElementById("codes-remaining");
    if (!codesEl) return;

    let count = parseInt(codesEl.textContent);
    setInterval(() => {
      if (Math.random() > 0.7 && count > 10) {
        count--;
        codesEl.textContent = count;
        codesEl.style.animation = "none";
        codesEl.offsetHeight; // Trigger reflow
        codesEl.style.animation = "attention-pulse 0.5s ease";
      }
    }, 8000);
  }

  // === Animate Progress Bar ===
  function animateProgressBar() {
    const progressFill = document.querySelector(".progress-fill");
    if (!progressFill) return;
    setTimeout(() => {
      progressFill.style.width = "75%";
    }, 500);
  }

  // === Play Confetti ===
  function playConfetti() {
    const container = document.querySelector(".confetti-container");
    if (!container) return;

    const colors = [
      "#8b5cf6",
      "#ec4899",
      "#fbbf24",
      "#10b981",
      "#06b6d4",
      "#fff",
    ];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.cssText = `
        left: ${Math.random() * 100}%;
        top: -20px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        width: ${Math.random() * 10 + 5}px;
        height: ${Math.random() * 10 + 5}px;
        border-radius: ${Math.random() > 0.5 ? "50%" : "0"};
        animation: confetti-fall ${Math.random() * 2 + 2}s ease-out forwards;
        animation-delay: ${Math.random() * 0.5}s;
      `;
      container.appendChild(confetti);
      setTimeout(() => confetti.remove(), 4000);
    }
  }

  const confettiStyle = document.createElement("style");
  confettiStyle.textContent = `
    @keyframes confetti-fall {
      0% { opacity: 1; transform: translateY(0) rotate(0deg); }
      100% { opacity: 0; transform: translateY(500px) rotate(720deg); }
    }
  `;
  document.head.appendChild(confettiStyle);

  // === Initialize on DOM Ready ===
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
