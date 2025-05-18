document.addEventListener('DOMContentLoaded', function() {
  // التبديل بين التبويبات
  const generalFormBtn = document.getElementById('generalFormBtn');
  const pricingFormBtn = document.getElementById('pricingFormBtn');
  const generalFormPane = document.getElementById('generalFormPane');
  const pricingFormPane = document.getElementById('pricingFormPane');
  const generalContactForm = document.getElementById('generalContactForm');
  const pricingContactForm = document.getElementById('pricingContactForm');

  // تعيين الحالة الافتراضية عند تحميل الصفحة
  window.addEventListener('load', function() {
    // تعيين نموذج طلب التسعير كنموذج افتراضي
    if (pricingFormBtn && generalFormBtn && pricingFormPane && generalFormPane) {
      pricingFormBtn.classList.add('active');
      generalFormBtn.classList.remove('active');
      pricingFormPane.classList.add('active');
      generalFormPane.classList.remove('active');
      pricingFormPane.style.display = 'block';
      generalFormPane.style.display = 'none';
    }
  });

  // عند النقر على زر الاستفسار العام
  if (generalFormBtn) {
    generalFormBtn.addEventListener('click', function() {
      generalFormBtn.classList.add('active');
      pricingFormBtn.classList.remove('active');
      generalFormPane.classList.add('active');
      pricingFormPane.classList.remove('active');
      generalFormPane.style.display = 'block';
      pricingFormPane.style.display = 'none';
    });
  }

  // عند النقر على زر طلب تسعير الخدمة
  if (pricingFormBtn) {
    pricingFormBtn.addEventListener('click', function() {
      pricingFormBtn.classList.add('active');
      generalFormBtn.classList.remove('active');
      pricingFormPane.classList.add('active');
      generalFormPane.classList.remove('active');
      pricingFormPane.style.display = 'block';
      generalFormPane.style.display = 'none';
    });
  }

  // معالجة نموذج الاستفسار العام
  if (generalContactForm) {
    generalContactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // الحصول على قيم الحقول
      const name = document.getElementById('general-name').value.trim();
      const email = document.getElementById('general-email').value.trim();
      const phone = document.getElementById('general-phone').value.trim();
      const subject = document.getElementById('general-subject').value.trim();
      const message = document.getElementById('general-message').value.trim();

      // التحقق من صحة البيانات
      if (!name || !email || !message) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      // تنسيق الرسالة
      const fullMessage =
        "📝 *استفسار عام من الموقع* 📝%0A%0A" +
        "🔹 *الاسم*: " + encodeURIComponent(name) + "%0A" +
        "📧 *البريد الإلكتروني*: " + encodeURIComponent(email) + "%0A" +
        "📱 *رقم الهاتف*: " + encodeURIComponent(phone) + "%0A" +
        "📌 *الموضوع*: " + encodeURIComponent(subject) + "%0A" +
        "💬 *الرسالة*: %0A" + encodeURIComponent(message) + "%0A%0A" +
        "سنقوم بالرد على رسالتك في أقرب فرصة ممكنة بإذن الله. 🌹";

      // فتح رابط واتساب
      const whatsappURL = "https://wa.me/201002241591?text=" + fullMessage;
      window.open(whatsappURL, "_blank");

      // إظهار رسالة النجاح
      generalContactForm.style.display = 'none';
      generalFormPane.style.display = 'none';
      document.getElementById('success-message').style.display = 'flex';
    });
  }

  // التحقق من وجود نموذج طلب تسعير الخدمة
  const contactForm = document.getElementById('contact-form') || document.getElementById('pricingContactForm');
  if (!contactForm) return;

  // استرجاع البيانات المخزنة مسبقًا (إن وجدت)
  const savedName = localStorage.getItem('userName') || '';
  const savedEmail = localStorage.getItem('userEmail') || '';
  const savedWebsite = localStorage.getItem('userWebsite') || '';
  const savedStoreUrl = localStorage.getItem('userStoreUrl') || '';
  const savedPlatform = localStorage.getItem('userPlatform') || '';
  const savedPackage = localStorage.getItem('userPackage') || '';
  const savedDomain = localStorage.getItem('userDomain') || '';
  const savedLogo = localStorage.getItem('userLogo') || '';
  const savedCompetitor = localStorage.getItem('userCompetitor') || '';

  // ملء الحقول بالبيانات المحفوظة
  if (savedName) document.getElementById('contact-name').value = savedName;
  if (savedEmail) document.getElementById('contact-email').value = savedEmail;
  if (savedWebsite) document.getElementById('contact-website').value = savedWebsite;
  if (savedStoreUrl) document.getElementById('contact-store-url').value = savedStoreUrl;
  if (savedPlatform) document.getElementById('contact-platform').value = savedPlatform;
  if (savedPackage) document.getElementById('contact-package').value = savedPackage;
  if (savedDomain) document.getElementById('contact-domain').value = savedDomain;
  if (savedLogo) document.getElementById('contact-logo').value = savedLogo;
  if (savedCompetitor) document.getElementById('contact-competitor').value = savedCompetitor;

  // معالجة تقديم النموذج
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // الحصول على قيم الحقول
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const website = document.getElementById('contact-website').value.trim();
    const storeUrl = document.getElementById('contact-store-url').value.trim();
    const platform = document.getElementById('contact-platform').value;
    const packageType = document.getElementById('contact-package').value;
    const domain = document.getElementById('contact-domain').value;
    const logo = document.getElementById('contact-logo').value;
    const competitor = document.getElementById('contact-competitor').value.trim();
    const service = document.getElementById('contact-service').value;
    const message = document.getElementById('contact-message').value.trim();

    // التحقق من صحة البيانات
    if (!name || !email || !message) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // تغيير حالة الزر
    const button = document.getElementById('submit-button');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
    button.disabled = true;

    // تنسيق الرسالة
    const fullMessage =
      "🔹 *الاسم*: " + encodeURIComponent(name) + "%0A" +
      "📧 *البريد الإلكتروني*: " + encodeURIComponent(email) + "%0A" +
      "🌐 *الموقع*: " + encodeURIComponent(website) + "%0A" +
      "🌐 *رابط المتجر*: " + encodeURIComponent(storeUrl) + "%0A" +
      "🛍️ *نوع المنصة*: " + encodeURIComponent(platform) + "%0A" +
      "🛒 *نوع الباقة*: " + encodeURIComponent(packageType) + "%0A" +
      "🌐 *الدومين مدفوع*: " + encodeURIComponent(domain) + "%0A" +
      "🧩 *يوجد شعار أو هوية بصرية*: " + encodeURIComponent(logo) + "%0A" +
      "🏪 *متاجر منافسة*: " + encodeURIComponent(competitor) + "%0A" +
      "💼 *نوع الخدمة*: " + encodeURIComponent(service) + "%0A" +
      "💬 *الرسالة*: %0A" + encodeURIComponent(message) + "%0A%0A" +
      "سنقوم بالرد على رسالتك في أقرب فرصة ممكنة بإذن الله. 🌹";

    // محاكاة تأخير قصير قبل الفتح (للتأثير البصري فقط)
    setTimeout(() => {
      // إعادة الزر إلى حالته الأصلية
      button.innerHTML = originalText;
      button.disabled = false;

      // فتح رابط واتساب
      const whatsappURL = "https://wa.me/201002241591?text=" + fullMessage;
      window.open(whatsappURL, "_blank");

      // إظهار رسالة النجاح مع تأثير حركي
      document.getElementById('contact-form').style.display = 'none';
      document.getElementById('success-message').style.display = 'flex';

      // تخزين بيانات النموذج في التخزين المحلي للاستخدام المستقبلي
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userWebsite', website);
      localStorage.setItem('userStoreUrl', storeUrl);
      localStorage.setItem('userPlatform', platform);
      localStorage.setItem('userPackage', packageType);
      localStorage.setItem('userDomain', domain);
      localStorage.setItem('userLogo', logo);
      localStorage.setItem('userCompetitor', competitor);
    }, 1200);
  });

  // زر إعادة الاتصال
  const resetButton = document.getElementById('reset-form');
  if (resetButton) {
    resetButton.addEventListener('click', function() {
      // إعادة تعيين النموذج المناسب
      if (pricingFormPane) {
        pricingFormPane.style.display = 'block';
        if (pricingContactForm) pricingContactForm.style.display = 'flex';
      } else if (generalFormPane) {
        generalFormPane.style.display = 'block';
        if (generalContactForm) generalContactForm.style.display = 'flex';
      } else if (document.getElementById('contact-form')) {
        document.getElementById('contact-form').style.display = 'flex';
      }

      document.getElementById('success-message').style.display = 'none';
    });
  }
});
