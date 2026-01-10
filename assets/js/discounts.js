const discountCodes = [
  {
    theme: "كوبون خصم زد",
    code: "AliAHMED26",
    link: "https://web.zid.sa/pricing",
    color: "#a855f7",
  },
  {
    theme: "باقة سلة",
    code: "F-AFN5N48K",
    link: "https://mtjr.at/LfOztodFwz",
    color: "#3b82f6",
  },
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
    theme: "ثيم شوبنج",
    code: "F-AXDEMMC1",
    link: "https://mtjr.at/DCwN6mjweZ",
    color: "#f43f5e",
  },
  {
    theme: "ثيم يافا",
    code: "F-FQARWHFY",
    link: "https://mtjr.at/I8uJvRnXDo",
    color: "#10b981",
  },
  {
    theme: "ثيم بريستيج",
    code: "F-DCAJSVCA",
    link: "https://mtjr.at/eajOVO8rUS",
    color: "#06b6d4",
  },
  {
    theme: "ثيم علا",
    code: "F-ZOZAVB1N",
    link: "https://mtjr.at/E8CjtqUhXM",
    color: "#8b5cf6",
  },
  {
    theme: "ثيم جلامور",
    code: "F-3YKPR0NI",
    link: "https://mtjr.at/46caLXhw8d",
    color: "#d946ef",
  },
  {
    theme: "ثيم متجر",
    code: "F-IRCA4GHP",
    link: "https://mtjr.at/l7S7OmHhmF",
    color: "#f59e0b",
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
    color: "#f97316",
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
    theme: "ثيم مبدع",
    code: "F-Y0XZMKSJ",
    link: "https://mtjr.at/atgHNyKysx",
    color: "#14b8a6",
  },
  {
    theme: "ثيم ريس",
    code: "F-TAVWNANK",
    link: "https://mtjr.at/l2pPwPSNol",
    color: "#3b82f6",
  },
  {
    theme: "ثيم خطوة",
    code: "F-HNQVRRIL",
    link: "https://mtjr.at/vG_9GWx6VF",
    color: "#8b5cf6",
  },
  {
    theme: "ثيم قصص",
    code: "F-6PEEE4GS",
    link: "https://mtjr.at/lukWjppUpC",
    color: "#ec4899",
  },
  {
    theme: "ثيم كراون",
    code: "F-Q2H3AR05",
    link: "https://mtjr.at/eQhhTPx0n2",
    color: "#f43f5e",
  },
  {
    theme: "ثيم كيان",
    code: "F-BVDJDZTG",
    link: "https://mtjr.at/ILV-3hEyLC",
    color: "#10b981",
  },
  {
    theme: "ثيم لوفيزا",
    code: "F-NGWLVOZO",
    link: "https://mtjr.at/8GGj3qy3Gv",
    color: "#06b6d4",
  },
  {
    theme: "ثيم نماء",
    code: "F-DMY37POR",
    link: "https://mtjr.at/YzMFh_Yene",
    color: "#8b5cf6",
  },
  {
    theme: "ثيم سمارت",
    code: "F-DZV1TAXJ",
    link: "https://mtjr.at/wh9WG2hyt4",
    color: "#d946ef",
  },
  {
    theme: "ثيم ثمن",
    code: "NEW-CODE-5",
    link: "https://mtjr.at/T5TOhTMqrW",
    color: "#f59e0b",
  },
  {
    theme: "ثيم ساجي",
    code: "F-DW7G4WUY",
    link: "https://mtjr.at/tzXP8KqTJG",
    color: "#10b981",
  },
  {
    theme: "ثيم رناواي",
    code: "NEW-CODE-6",
    link: "https://mtjr.at/W3HcrNrP58",
    color: "#f97316",
  },
  {
    theme: "ثيم ( مرح )",
    code: "F-ZWKGCSRR",
    link: "https://mtjr.at/F4iqukEyOc",
    color: "#6366f1",
  },
  {
    theme: "ثيم (فريشمارت)",
    code: "NEW-CODE-7",
    link: "https://mtjr.at/v7PAVMa65L",
    color: "#ef4444",
  },
  {
    theme: "ثيم (غنا)",
    code: "F-2VKTT6YV",
    link: "https://mtjr.at/Qyj5z_o7YQ",
    color: "#14b8a6",
  },
  {
    theme: "ثيم (فاشون)",
    code: "F-WLIRPEKK",
    link: "https://mtjr.at/FGdNK9OqGo",
    color: "#3b82f6",
  },
  {
    theme: "ثيم (بليند)",
    code: "F-Y7GRCZFJ",
    link: "https://mtjr.at/9RA4fqMYDP",
    color: "#8b5cf6",
  },
  {
    theme: "ثيم (جولدن)",
    code: "NEW-CODE-8",
    link: "https://mtjr.at/UGaBQd7RW0",
    color: "#ec4899",
  },
  {
    theme: "ثيم (لمسة)",
    code: "F-FNXUIXID",
    link: "https://mtjr.at/Up4s0cuuRB",
    color: "#f43f5e",
  },
  {
    theme: "ثيم (جوتراد)",
    code: "NEW-CODE-9",
    link: "https://mtjr.at/JN-UWgC52t",
    color: "#10b981",
  },
  {
    theme: "ثيم (مواسم)",
    code: "NEW-CODE-10",
    link: "https://mtjr.at/k5hHStICXG",
    color: "#06b6d4",
  },
  {
    theme: "ثيم (chic)",
    code: "NEW-CODE-11",
    link: "https://mtjr.at/Q2bPuRFZjN",
    color: "#8b5cf6",
  },
  {
    theme: "ثيم (ليجو)",
    code: "F-BTLCZQXF",
    link: "https://mtjr.at/uRqapdbyMe",
    color: "#d946ef",
  },
  {
    theme: "ثيم (مسالم)",
    code: "NEW-CODE-12",
    link: "https://mtjr.at/paq26HeU1X",
    color: "#f59e0b",
  },
  {
    theme: "ثيم (ارتقاء)",
    code: "F-HD0G7G1Q",
    link: "https://mtjr.at/ho2Ecy67Fb",
    color: "#10b981",
  },
  {
    theme: "ثيم (بلور)",
    code: "F-0QVXDUGJ",
    link: "https://mtjr.at/iWxENL3uib",
    color: "#f97316",
  },
  {
    theme: "ثيم (ياسمين)",
    code: "F-TS0AAFSZ",
    link: "https://mtjr.at/UzTkMB_mSu",
    color: "#6366f1",
  },
  {
    theme: "ثيم (ستوريا)",
    code: "NEW-CODE-13",
    link: "https://mtjr.at/Gk1DPKp2iR",
    color: "#ef4444",
  },
  {
    theme: "ثيم (ايكو)",
    code: "F-BTLCZQXF",
    link: "https://mtjr.at/TVDgiJyg0W",
    color: "#14b8a6",
  },
  {
    theme: "ثيم (اكسترا)",
    code: "F-SLOEHK8L",
    link: "https://mtjr.at/m3kk66AAOC",
    color: "#3b82f6",
  },
  {
    theme: "ثيم (إلكترون)",
    code: "NEW-CODE-14",
    link: "https://mtjr.at/USim8F45Ud",
    color: "#8b5cf6",
  },
  {
    theme: "ثيم (سكري)",
    code: "F-DLVGMO2F",
    link: "https://mtjr.at/H4vt45kfUK",
    color: "#ec4899",
  },
  {
    theme: "ثيم (طيبة)",
    code: "NEW-CODE-15",
    link: "https://mtjr.at/yDiR3jNfBc",
    color: "#f43f5e",
  },
  {
    theme: "ثيم (ماكس)",
    code: "F-EK2SF6HV",
    link: "https://mtjr.at/ice9o5TwAB",
    color: "#10b981",
  },
  {
    theme: "ثيم (فلوريزا)",
    code: "NEW-CODE-16",
    link: "https://mtjr.at/smuQfITBXW",
    color: "#06b6d4",
  },
  {
    theme: "ثيم (ليما)",
    code: "F-OPLJFAE3",
    link: "https://mtjr.at/g7u4UaS9j9",
    color: "#8b5cf6",
  },
  {
    theme: "ثيم (رقي)",
    code: "NEW-CODE-17",
    link: "https://mtjr.at/4r3XisPatb",
    color: "#d946ef",
  },
];

function renderDiscounts() {
  const container = document.getElementById("discounts-grid");
  if (!container) return;

  container.innerHTML = "";

  // 1. Inject CSS Styles for Premium Animation & Layout
  const styleId = "discount-premium-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
        /* Premium Row Layout */
        .premium-row {
            grid-column: 1 / -1;
            display: flex;
            gap: 25px;
            margin-bottom: 20px;
        }
        @media (max-width: 768px) {
            .premium-row {
                flex-direction: column;
            }
        }

        /* Animated Border Card */
        .animated-border-card {
            position: relative;
            background: #0b0b12; /* Inner bg */
            border-radius: 20px;
            z-index: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 2px; /* Border thickness */
        }
        
        /* The Moving Gradient */
        .animated-border-card::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: conic-gradient(transparent, transparent, transparent, var(--card-color));
            animation: rotateBorder 4s linear infinite;
            z-index: -2;
        }

        /* Inner Content Mask */
        .animated-border-card .card-content {
            background: #0b0b12;
            width: 100%;
            height: 100%;
            border-radius: 18px;
            padding: 30px 20px;
            position: relative;
            z-index: -1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        @keyframes rotateBorder {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Shine Effect overlay */
        .card-shine {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(to bottom, rgba(255,255,255,0.05), transparent);
            pointer-events: none;
            z-index: 0;
        }
    `;
    document.head.appendChild(style);
  }

  // Grid styling for main container
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(auto-fill, minmax(300px, 1fr))";
  container.style.gap = "25px";

  // 2. Create Premium Row Container
  const premiumRow = document.createElement("div");
  premiumRow.className = "premium-row";
  container.appendChild(premiumRow);

  discountCodes.forEach((item, index) => {
    const isSpecial = index < 2;

    if (isSpecial) {
      // --- Premium Card (First 2) ---
      const card = document.createElement("div");
      card.className = "discount-card animated-border-card";
      card.style.flex = "1"; // Share width equally in flex container
      card.style.setProperty("--card-color", item.color);

      // Hover effects
      card.onmouseover = function () {
        this.querySelector(
          ".animated-border-card::before"
        ).style.animationDuration = "2s";
      };
      card.onmouseout = function () {
        this.querySelector(
          ".animated-border-card::before"
        ).style.animationDuration = "4s";
      };

      card.innerHTML = `
            <div class="card-content">
                <div class="card-shine"></div>
                <h2 style="color: ${item.color}; margin-bottom: 25px; font-size: 2.2rem; font-weight: 800; letter-spacing: -1px; text-shadow: 0 0 40px ${item.color}60;">${item.theme}</h2>
                
                <div style="margin-bottom: 35px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 900; color: #fff; letter-spacing: 2px; font-family: monospace; text-shadow: 0 2px 5px rgba(0,0,0,0.5);">${item.code}</div>
                    <div style="color: #888; font-size: 0.95rem; margin-top: 12px; font-weight: 500;">خصم خاص وحصري</div>
                </div>
                
                <div style="display: flex; gap: 20px; width: 100%; max-width: 400px; z-index: 1;">
                     <button class="btn-copy" onclick="copyDiscountCode('${item.code}', this, '${item.color}')" style="
                        flex: 1;
                        padding: 16px;
                        border-radius: 12px;
                        background: ${item.color};
                        color: #fff;
                        border: none;
                        font-weight: 700;
                        font-size: 1.1rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0 10px 25px ${item.color}40;
                    ">نسخ الكود</button>

                     <a href="${item.link}" target="_blank" style="
                        flex: 1;
                        padding: 16px;
                        border-radius: 12px;
                        background: rgba(255,255,255,0.03);
                        color: #fff;
                        text-decoration: none;
                        font-weight: 600;
                        font-size: 1.1rem;
                        border: 1px solid rgba(255,255,255,0.1);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.borderColor='${item.color}'; this.style.color='${item.color}'; this.style.background='${item.color}10'" onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.color='#fff'; this.style.background='rgba(255,255,255,0.03)'">تفعيله الآن</a>
                </div>
            </div>
      `;
      premiumRow.appendChild(card);
    } else {
      // --- Standard Theme Card (Rest) ---
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

      // Standard Hover Effect
      card.onmouseover = function () {
        this.style.transform = "translateY(-10px)";
        this.style.boxShadow = `0 15px 40px -10px ${item.color}40`;
        this.style.borderColor = `${item.color}40`;
      };
      card.onmouseout = function () {
        this.style.transform = "translateY(0)";
        this.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
        this.style.borderColor = "rgba(255,255,255,0.05)";
      };

      // Glow element
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
                    background: ${item.color}20;
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
                    color: #fff;
                    border: none;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 0.9rem;
                    box-shadow: 0 5px 15px ${item.color}60;
                ">نسخ الكود</button>
            </div>
      `;
      container.appendChild(card);
    }
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
