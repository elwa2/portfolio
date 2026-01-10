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
    code: "S4U",
    link: "https://mtjr.at/LfOztodFwz",
    color: "#3b82f6",
  },
];

function renderDiscounts() {
  const container = document.getElementById("discounts-grid");
  if (!container) return;

  container.innerHTML = "";

  // Grid styling
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(auto-fill, minmax(300px, 1fr))";
  container.style.gap = "25px";

  discountCodes.forEach((item) => {
    const card = document.createElement("div");
    card.className = "discount-card";
    card.style.cssText = `
            background: #151521; 
            padding: 35px 25px; 
            border-radius: 20px; 
            text-align: center; 
            border: 1px solid rgba(255,255,255,0.05);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        `;

    // Add hover effect
    card.onmouseover = function () {
      this.style.transform = "translateY(-10px)";
      this.style.boxShadow = `0 15px 40px -10px ${item.color}40`; // 40 is hex opacity
      this.style.borderColor = `${item.color}40`;
    };
    card.onmouseout = function () {
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
      this.style.borderColor = "rgba(255,255,255,0.05)";
    };

    // Glow element at top
    const glowPoints = document.createElement("div");
    glowPoints.style.cssText = `
            position: absolute;
            top: -50px;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 100px;
            background: ${item.color};
            filter: blur(60px);
            opacity: 0.2;
            pointer-events: none;
        `;
    card.appendChild(glowPoints);

    card.innerHTML += `
            <h2 style="color: ${item.color}; margin-bottom: 20px; font-size: 1.6rem; text-shadow: 0 0 20px ${item.color}40;">${item.theme}</h2>
            
            <div style="margin: 20px 0;">
                <code style="font-size: 1.4rem; font-weight: 800; letter-spacing: 1px; color: #fff;">${item.code}</code>
            </div>
            
            <p style="margin-bottom: 30px; font-size: 0.9rem; color: #888;">خصم خاص وحصري</p>
            
            <div style="display: flex; gap: 15px; justify-content: center;">
                 <a href="${item.link}" target="_blank" class="btn-activate" style="
                    flex: 1;
                    padding: 12px;
                    border-radius: 50px;
                    background: ${item.color}20; /* Low opacity bg */
                    color: ${item.color};
                    text-decoration: none;
                    font-weight: bold;
                    transition: all 0.3s ease;
                    border: 1px solid ${item.color}40;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">تفعيله الآن</a>

                <button class="btn-copy" onclick="copyDiscountCode('${item.code}', this, '${item.color}')" style="
                    flex: 1;
                    padding: 12px;
                    border-radius: 50px;
                    background: ${item.color};
                    color: #fff; /* White text on colored bg */
                    border: none;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 0.9rem;
                    box-shadow: 0 5px 15px ${item.color}60;
                ">نسخ الكود</button>
            </div>
        `;

    // Inject hover styles for buttons specifically for this card using closure isn't easy with inline styles.
    // We will handle generic button hovers or rely on the card hover.
    // Actually, let's keep it simple inline for now or add a style block.

    container.appendChild(card);
  });
}

function copyDiscountCode(code, btn, color) {
  navigator.clipboard.writeText(code).then(() => {
    const originalText = btn.innerHTML;
    const originalBg = btn.style.background;

    btn.innerHTML = "✅ تم النسخ";
    // Keep contrast
    btn.style.background = "#10B981"; // Success green
    btn.style.boxShadow = "0 5px 15px rgba(16, 185, 129, 0.4)";

    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.background = color || originalBg;
      btn.style.boxShadow = `0 5px 15px ${color}60`;
      btn.disabled = false;
    }, 2000);
  });
}

document.addEventListener("DOMContentLoaded", renderDiscounts);
