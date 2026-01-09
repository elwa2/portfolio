/**
 * Ultimate Rebirth Engine - 2026
 * Professional Architecture for Ultra-Premium Experience
 * Dual Language Support System (AR Primary)
 */

class RaedEngine {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetX = 0;
    this.targetY = 0;

    this.currentLang = localStorage.getItem("lang") || "ar";

    this.translations = {
      ar: {
        nav_works: "معرض الأعمال",
        nav_packages: "باقاتنا",
        hero_title: "المعماري<br />الرقمي",
        hero_subtitle:
          "هندسة الجمال الرقمي. نبني متاجر سلة وزد كقطع فنية خالدة.",
        btn_order: "اطلب الآن",
        btn_works: "معرض الأعمال",
        identity_title: "هويتنا المعمارية",
        identity_text:
          "أنا علي أحمد، معماري رقمي متخصص في تحويل المتاجر العادية إلى تجارب فخمة. نستخدم لغة الـ CSS والـ UI/UX لنصنع هوية بصرية تزيد مبيعاتك وتثبت علامتك في ذهن العميل.",
        val_innovation: "الابتكار",
        val_innovation_desc: "نصنع حلولاً برمجية وتصميمية لم يسبقنا إليها أحد.",
        val_quality: "الجودة",
        val_quality_desc: "كل بكسل في متجرك مرسوم بعناية معمارية فائقة.",
        val_transparency: "الشفافية",
        val_transparency_desc: "نعمل بوضوح مطلق من الطلب وحتى التسليم النهائي.",
        val_responsibility: "المسؤولية",
        val_responsibility_desc: "نتحمل مسؤولية نجاح متجرك كأننا شركاء فيه.",
        capabilities_title: "قدراتنا النخبوية",
        cap_web_design: "تصميم المواقع",
        cap_web_design_desc:
          "تصميمات مبتكرة باستخدام ووردبريس، إلمنتور، ودروبال.",
        cap_store_mgmt: "إدارة المتاجر",
        cap_store_mgmt_desc: "صيانة دورية، تحديثات مستمرة، ودعم فني متكامل.",
        cap_seo: "SEO & التحليلات",
        cap_seo_desc: "تحسين محركات البحث للظهور في الصفحات الأولى.",
        packages_title: "باقات النخبة",
        packages_subtitle: "باقات متكاملة تبدأ من الإنشاء وتنتهي بالنجاح.",
        pkg_creation: "باقة الإنشاء",
        pkg_creation_feat:
          "<li>تصميم متجر إلكتروني احترافي</li><li>واجهة مستخدم سهلة وجذابة</li><li>توافق مع جميع الأجهزة</li><li>ربط بوابات الدفع</li><li>تدريب على إدارة المتجر</li>",
        pkg_pro: "باقة رواد الأعمال",
        pkg_pro_feat:
          "<li>تصميم هوية بصرية كاملة</li><li>إنشاء متجر إلكتروني احترافي</li><li>استضافة لمدة سنة</li><li>إعداد وسائل التواصل الاجتماعي</li><li>دعم فني لمدة 3 أشهر</li>",
        pkg_full: "الباقة الكاملة",
        pkg_full_feat:
          "<li>جميع مميزات الباقات السابقة</li><li>استراتيجية تسويقية متكاملة</li><li>حملات إعلانية مدفوعة</li><li>تحسين محركات البحث SEO</li><li>تقارير أداء شهرية</li>",
        process_title: "العملية المعمارية",
        proc_discovery: "01. الاكتشاف",
        proc_discovery_desc: "نفهم رؤيتك، أهدافك، والجمهور المستهدف لمتجرك.",
        proc_blueprint: "02. المخطط",
        proc_blueprint_desc:
          "نرسم هيكلية المتجر ونحدد تجربة المستخدم (UX) المثالية.",
        proc_construction: "03. البناء",
        proc_construction_desc:
          "نقوم بكتابة أكواد الـ CSS المخصصة وتطوير واجهات المتجر.",
        proc_refinement: "04. التدقيق",
        proc_refinement_desc:
          "مرحلة اختبار الأداء، التوافق مع الجوال، وسرعة التصفح.",
        testimonials_title: "صوت العملاء",
        faq_title: "الأسئلة الشائعة",
        faq_q1: "ما هي المنصات التي تدعمونها؟",
        faq_a1: "نتخصص بشكل احترافي في منصات سلة (Salla) وزد (Zid).",
        faq_q2: "كم يستغرق تصميم المتجر؟",
        faq_a2: "تتراوح المدة بين 5 إلى 14 يوم عمل حسب حجم الباقة المطلوبة.",
        faq_q3: "هل تقدمون دعماً فنياً بعد التسليم؟",
        faq_a3: "نعم، نقدم دعماً فنياً شاملاً لضمان استقرار أداء متجرك.",
        detector_title: "QUEST: كاشف الثيمات",
        detector_desc:
          "أداة كاشف ثيمات سلة: اعرف الثيم اللي بيستخدمه منافسك بضغطة واحدة!",
        detector_chrome: "تحميل للكروم",
        detector_edge: "تحميل للإيدج",
        discounts_title: "خصومات سلة",
        copy_code: "نسخ الكود",
        connect_title: "لنتواصل الآن",
        connect_desc: "هل تريد متجراً مميزاً يزيد من مبيعاتك؟ تواصل معي الآن.",
        whatsapp_btn: "تحدث عبر واتساب",
        bank_transfer: "تحويل بنكي (بنك مصر)",
        vodafone_cash: "فودافون كاش / InstaPay",
        copy: "نسخ",
        lang_switch: "English",
        back_main: "العودة للرئيسية",
        selected_works: "أعمال مختارة",
        works_desc:
          "نظرة عميقة على المتاجر الإلكترونية والتجارب الرقمية التي صممناها بشغف وحرفية عالية.",
        share_title: "المشاركة الذكية",
        share_desc:
          "مشاهدة الأعمال أصبحت أسهل، يمكنك نسخ كافة الروابط أو إرسالها للعملاء بتنسيق فاخر.",
        copy_all: "📋 نسخ جميع الروابط",
        wa_share: "💬 مشاركة عبر واتساب",
      },
      en: {
        nav_works: "Portfolio",
        nav_packages: "Packages",
        hero_title: "THE DIGITAL<br />ARCHITECT",
        hero_subtitle:
          "Engineering Digital Beauty. Building Salla & Zid stores as timeless art pieces.",
        btn_order: "Order Now",
        btn_works: "Works",
        identity_title: "OUR IDENTITY",
        identity_text:
          "I am Ali Ahmed, a digital architect specialized in transforming ordinary stores into premium experiences. We use CSS and UI/UX to create a visual identity that boosts sales and fixes your brand in the customer's mind.",
        val_innovation: "Innovation",
        val_innovation_desc:
          "We create software and design solutions like no other.",
        val_quality: "Quality",
        val_quality_desc:
          "Every pixel in your store is drawn with extreme architectural care.",
        val_transparency: "Transparency",
        val_transparency_desc:
          "We work with absolute clarity from order to final delivery.",
        val_responsibility: "Responsibility",
        val_responsibility_desc:
          "We take responsibility for your store's success as partners.",
        capabilities_title: "ELITE CAPABILITIES",
        cap_web_design: "Web Design",
        cap_web_design_desc:
          "Innovative designs using WordPress, Elementor, and Drupal.",
        cap_store_mgmt: "Store Management",
        cap_store_mgmt_desc:
          "Regular maintenance, continuous updates, and full support.",
        cap_seo: "SEO & Analytics",
        cap_seo_desc:
          "Search engine optimization to appear on the first pages.",
        packages_title: "ELITE PACKAGES",
        packages_subtitle:
          "Integrated packages starting from creation to success.",
        pkg_creation: "Creation Package",
        pkg_creation_feat:
          "<li>Professional Store Design</li><li>Easy & Attractive UI</li><li>Responsive Design</li><li>Payment Gateway Integration</li><li>Management Training</li>",
        pkg_pro: "Entrepreneurs Package",
        pkg_pro_feat:
          "<li>Full Visual Identity</li><li>Professional Store Design</li><li>1 Year Hosting</li><li>Social Media Setup</li><li>3 Months Support</li>",
        pkg_full: "Ultimate Package",
        pkg_full_feat:
          "<li>All Previous Features</li><li>Full Marketing Strategy</li><li>Paid Ad Campaigns</li><li>SEO Optimization</li><li>Monthly Performance Reports</li>",
        process_title: "ARCHITECTURAL PROCESS",
        proc_discovery: "01. DISCOVERY",
        proc_discovery_desc:
          "We understand your vision, goals, and target audience.",
        proc_blueprint: "02. BLUEPRINT",
        proc_blueprint_desc:
          "We map the store structure and define the ideal UX.",
        proc_construction: "03. CONSTRUCTION",
        proc_construction_desc:
          "We write custom CSS and develop the store interfaces.",
        proc_refinement: "04. REFINEMENT",
        proc_refinement_desc:
          "Performance testing, mobile compatibility, and speed audit.",
        testimonials_title: "CLIENT VOICES",
        faq_title: "COMMON QUERIES",
        faq_q1: "Which platforms do you support?",
        faq_a1: "We specialize professionally in Salla and Zid platforms.",
        faq_q2: "How long does it take?",
        faq_a2:
          "It takes between 5 to 14 business days depending on the package.",
        faq_q3: "Do you offer support after delivery?",
        faq_a3:
          "Yes, we offer full technical support to ensure your store's stability.",
        detector_title: "QUEST: THEME DETECTOR",
        detector_desc:
          "Salla Theme Detector: Know your competitor's theme in one click!",
        detector_chrome: "Download for Chrome",
        detector_edge: "Download for Edge",
        discounts_title: "SALLA DISCOUNTS",
        copy_code: "Copy Code",
        connect_title: "LET'S CONNECT",
        connect_desc: "Want a unique store that boosts sales? Contact me now.",
        whatsapp_btn: "Chat on WhatsApp",
        bank_transfer: "Bank Transfer (Banque Misr)",
        vodafone_cash: "Vodafone Cash / InstaPay",
        copy: "Copy",
        lang_switch: "عربي",
        back_main: "Back to Main",
        selected_works: "SELECTED WORKS",
        works_desc:
          "A deep dive into the digital experiences and e-commerce stores we've designed with passion.",
        share_title: "SMART SHARE",
        share_desc:
          "Viewing works made easier, copy all links or send them to clients in premium format.",
        copy_all: "📋 Copy All Links",
        wa_share: "💬 WhatsApp Share",
      },
    };

    this.init();
  }

  init() {
    this.initThree();
    this.initCursor();
    this.initAnimations();
    this.addEventListeners();
    this.updateUI();
  }

  updateUI() {
    const lang = this.currentLang;
    const isRtl = lang === "ar";

    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = lang;

    // Apply font variables
    if (isRtl) {
      document.body.style.fontFamily = "var(--font-ar)";
    } else {
      document.body.style.fontFamily = "var(--font-main)";
    }

    // Update all i18n elements
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (this.translations[lang][key]) {
        el.innerHTML = this.translations[lang][key];
      }
    });

    // Handle works page re-render if function exists
    if (typeof renderWorks === "function") {
      renderWorks();
    }

    localStorage.setItem("lang", lang);
  }

  toggleLanguage() {
    this.currentLang = this.currentLang === "ar" ? "en" : "ar";
    this.updateUI();
    // Restart animations to reflect direction change if needed
    this.initAnimations();
  }

  initThree() {
    const container = document.getElementById("canvas-container");
    if (!container) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    const geo = new THREE.BufferGeometry();
    const count = 4000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 20;
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.008,
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);

    this.animate();
  }

  initCursor() {
    const cursor = document.querySelector(".custom-cursor");
    const cursorDot = document.querySelector(".cursor-dot");

    gsap.set([cursor, cursorDot], { opacity: 0 });

    const moveCursor = (e) => {
      const { clientX: x, clientY: y } = e;

      gsap.to(cursor, {
        x: x,
        y: y,
        duration: 0.6,
        ease: "power3.out",
        xPercent: -50,
        yPercent: -50,
      });

      gsap.to(cursorDot, {
        x: x,
        y: y,
        duration: 0.1,
        ease: "power2.out",
        xPercent: -50,
        yPercent: -50,
      });

      if (cursor.style.opacity === "0") {
        gsap.to([cursor, cursorDot], { opacity: 1, duration: 0.5 });
      }
    };

    window.addEventListener("mousemove", moveCursor);

    document
      .querySelectorAll("a, button, .pkg-card, .pay-card, .testi-card")
      .forEach((el) => {
        el.addEventListener("mouseenter", () => {
          gsap.to(cursor, {
            scale: 1.5,
            backgroundColor: "rgba(94, 59, 238, 0.05)",
            borderColor: "rgba(255,255,255,0.5)",
            duration: 0.4,
          });
          gsap.to(cursorDot, { scale: 0.5, duration: 0.4 });
        });
        el.addEventListener("mouseleave", () => {
          gsap.to(cursor, {
            scale: 1,
            backgroundColor: "transparent",
            borderColor: "#5e3bee",
            duration: 0.4,
          });
          gsap.to(cursorDot, { scale: 1, duration: 0.4 });
        });
      });
  }

  initAnimations() {
    gsap.from(".hero-content h1", {
      letterSpacing: "50px",
      opacity: 0,
      duration: 2,
      ease: "power4.out",
    });

    gsap.from(".hero-content p", {
      y: 30,
      opacity: 0,
      duration: 1.5,
      delay: 1,
      ease: "power3.out",
    });
  }

  addEventListeners() {
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener("mousemove", (e) => {
      this.targetX = (e.clientX - window.innerWidth / 2) * 0.0005;
      this.targetY = (e.clientY - window.innerHeight / 2) * 0.0005;
    });

    // Language Switcher Click Event
    const btn = document.getElementById("lang-switch-btn");
    if (btn) {
      btn.addEventListener("click", () => this.toggleLanguage());
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.mouseX += (this.targetX - this.mouseX) * 0.05;
    this.mouseY += (this.targetY - this.mouseY) * 0.05;

    this.particles.rotation.y += 0.0005;
    this.particles.rotation.x = this.mouseY;
    this.particles.rotation.y = this.mouseX;

    this.renderer.render(this.scene, this.camera);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.Engine = new RaedEngine();
});
