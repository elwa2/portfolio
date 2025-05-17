document.addEventListener('DOMContentLoaded', function() {
  // التحقق من وجود نموذج الاتصال
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  // استرجاع البيانات المخزنة مسبقًا (إن وجدت)
  const savedName = localStorage.getItem('userName') || '';
  const savedEmail = localStorage.getItem('userEmail') || '';
  const savedWebsite = localStorage.getItem('userWebsite') || '';

  // ملء الحقول بالبيانات المحفوظة
  if (savedName) document.getElementById('contact-name').value = savedName;
  if (savedEmail) document.getElementById('contact-email').value = savedEmail;
  if (savedWebsite) document.getElementById('contact-website').value = savedWebsite;

  // معالجة تقديم النموذج
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // الحصول على قيم الحقول
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const website = document.getElementById('contact-website').value.trim();
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
      "💼 *نوع الخدمة*: " + encodeURIComponent(service) + "%0A" + 
      "💬 *الرسالة*: %0A" + encodeURIComponent(message);
    
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
    }, 1200);
  });

  // زر إعادة الاتصال
  const resetButton = document.getElementById('reset-form');
  if (resetButton) {
    resetButton.addEventListener('click', function() {
      document.getElementById('contact-form').style.display = 'flex';
      document.getElementById('success-message').style.display = 'none';
    });
  }
});
