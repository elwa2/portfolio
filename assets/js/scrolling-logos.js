$(document).ready(function() {
    // تهيئة حركة الشعارات المتحركة
    function setupScrollingLogos() {
        var $scrollingLogos = $('.scrolling-logos');

        // حساب العرض الإجمالي للشعارات
        var totalWidth = 0;
        $('.logo-item').each(function() {
            totalWidth += $(this).outerWidth(true);
        });

        // تعيين عرض الحاوية
        $scrollingLogos.css('width', totalWidth + 'px');
    }

    // تنفيذ عند تحميل الصفحة
    setupScrollingLogos();

    // إعادة الحساب عند تغيير حجم النافذة
    $(window).on('resize', function() {
        setupScrollingLogos();
    });
});
