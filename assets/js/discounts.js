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

  // Add grid styling class if not present
  container.className = "discounts-grid";

  discountCodes.forEach((item) => {
    const card = document.createElement("div");
    card.className = "discount-card";
    card.style.cssText = `
            background: var(--card-bg); 
            padding: 30px; 
            border-radius: 20px; 
            text-align: center; 
            border: 1px solid var(--border-color);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
            overflow: hidden;
        `;

    // Add hover effect
    card.onmouseover = function () {
      this.style.transform = "translateY(-5px)";
      this.style.boxShadow = "0 10px 20px rgba(0,0,0,0.1)";
    };
    card.onmouseout = function () {
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "none";
    };

    // Top color bar
    const colorBar = document.createElement("div");
    colorBar.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 5px;
            background: ${item.color};
        `;
    card.appendChild(colorBar);

    card.innerHTML += `
            <h2 style="color: ${item.color}; margin-bottom: 10px; font-size: 1.5rem;">${item.theme}</h2>
            <div style="background: rgba(0,0,0,0.03); padding: 10px; border-radius: 10px; margin: 15px 0;">
                <code style="font-size: 1.2rem; font-weight: bold; color: var(--text-color);">${item.code}</code>
            </div>
            <p style="margin-bottom: 20px; font-size: 0.9rem; color: var(--text-color-light);">خصم خاص وحصري</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="btn btn-sm" onclick="copyDiscountCode('${item.code}', this)" style="background: ${item.color}; flex: 1;">نسخ الكود</button>
                <a href="${item.link}" target="_blank" class="btn btn-outline btn-sm" style="border-color: ${item.color}; color: ${item.color}; flex: 1;">تفعيله الآن</a>
            </div>
        `;

    container.appendChild(card);
  });
}

function copyDiscountCode(code, btn) {
  navigator.clipboard.writeText(code).then(() => {
    const originalText = btn.innerHTML;
    btn.innerHTML = "✅ تم النسخ";
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 2000);
  });
}

document.addEventListener("DOMContentLoaded", renderDiscounts);
