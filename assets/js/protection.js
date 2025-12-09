/**
 * 🔐 نظام حماية الموقع - Multi-Layer Protection System
 * =====================================================
 * هذا الملف يحمي الموقع من النسخ والاستخدام غير المصرح به
 *
 * الطبقات:
 * 1. التحقق من الدومين (Domain Lock)
 * 2. إزالة المحتوى (Content Destruction)
 * 3. منع أدوات المطور (Anti-DevTools)
 * 4. منع النسخ والتحديد (Anti-Copy)
 * 5. التشفير (Obfuscation)
 */

(function () {
  "use strict";

  // ═══════════════════════════════════════════════════════════════
  // الطبقة 1: الدومينات المسموحة (مشفرة Base64)
  // ═══════════════════════════════════════════════════════════════

  // الدومينات المشفرة: elwa2.github.io, localhost, 127.0.0.1
  const _0x4a7f = [
    "ZWx3YTIuZ2l0aHViLmlv", // elwa2.github.io
    "bG9jYWxob3N0", // localhost
    "MTI3LjAuMC4x", // 127.0.0.1
  ];

  // دالة فك التشفير
  const _0xd = function (s) {
    try {
      return atob(s);
    } catch (e) {
      return "";
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // الطبقة 2: التحقق والإزالة
  // ═══════════════════════════════════════════════════════════════

  const _0xVerify = function () {
    const h = window.location.hostname.toLowerCase();
    const protocol = window.location.protocol;
    const allowed = _0x4a7f.map(_0xd);

    // السماح بفتح الملفات محلياً للتطوير (file://)
    if (protocol === "file:") {
      return true;
    }

    // السماح بالهوستات الفارغة (للتطوير المحلي)
    if (h === "" || h === null) {
      return true;
    }

    // التحقق من الدومين
    if (!allowed.includes(h)) {
      // إزالة كل المحتوى
      _0xDestroy();
      return false;
    }
    return true;
  };

  const _0xDestroy = function () {
    // إيقاف تحميل الصفحة
    if (window.stop) {
      window.stop();
    }

    // مسح المحتوى
    try {
      document.documentElement.innerHTML = "";
      document.head.innerHTML = "";
      document.body.innerHTML = "";
    } catch (e) {}

    // إعادة توجيه أو إظهار صفحة فارغة
    try {
      document.write("");
      document.close();
    } catch (e) {}

    // منع أي سكربتات أخرى
    throw new Error("🚫");
  };

  // ═══════════════════════════════════════════════════════════════
  // الطبقة 3: منع أدوات المطور
  // ═══════════════════════════════════════════════════════════════

  const _0xAntiDev = function () {
    // منع اختصارات لوحة المفاتيح
    document.addEventListener(
      "keydown",
      function (e) {
        // F12
        if (e.key === "F12" || e.keyCode === 123) {
          e.preventDefault();
          return false;
        }

        // Ctrl+Shift+I (Developer Tools)
        if (
          e.ctrlKey &&
          e.shiftKey &&
          (e.key === "I" || e.key === "i" || e.keyCode === 73)
        ) {
          e.preventDefault();
          return false;
        }

        // Ctrl+Shift+J (Console)
        if (
          e.ctrlKey &&
          e.shiftKey &&
          (e.key === "J" || e.key === "j" || e.keyCode === 74)
        ) {
          e.preventDefault();
          return false;
        }

        // Ctrl+U (View Source)
        if (e.ctrlKey && (e.key === "U" || e.key === "u" || e.keyCode === 85)) {
          e.preventDefault();
          return false;
        }

        // Ctrl+S (Save)
        if (e.ctrlKey && (e.key === "S" || e.key === "s" || e.keyCode === 83)) {
          e.preventDefault();
          return false;
        }
      },
      true
    );

    // اكتشاف DevTools عن طريق الحجم (طريقة احتياطية)
    let devToolsDetected = false;
    const threshold = 160;

    const checkDevTools = function () {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold =
        window.outerHeight - window.innerHeight > threshold;

      if ((widthThreshold || heightThreshold) && !devToolsDetected) {
        devToolsDetected = true;
        // يمكن إضافة إجراء هنا لو لزم الأمر
        console.clear();
      }
    };

    // فحص دوري كل ثانية
    setInterval(checkDevTools, 1000);
  };

  // ═══════════════════════════════════════════════════════════════
  // الطبقة 4: منع النسخ والتحديد
  // ═══════════════════════════════════════════════════════════════

  const _0xAntiCopy = function () {
    // منع Right-click
    document.addEventListener(
      "contextmenu",
      function (e) {
        e.preventDefault();
        return false;
      },
      true
    );

    // منع النسخ
    document.addEventListener(
      "copy",
      function (e) {
        e.preventDefault();
        return false;
      },
      true
    );

    // منع القص
    document.addEventListener(
      "cut",
      function (e) {
        e.preventDefault();
        return false;
      },
      true
    );

    // منع تحديد النص (اختياري - يمكن تعطيله)
    // document.addEventListener('selectstart', function(e) {
    //     e.preventDefault();
    //     return false;
    // }, true);

    // منع السحب
    document.addEventListener(
      "dragstart",
      function (e) {
        e.preventDefault();
        return false;
      },
      true
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // الطبقة 5: حماية إضافية
  // ═══════════════════════════════════════════════════════════════

  const _0xExtraProtection = function () {
    // تعطيل console.log (اختياري)
    // console.log = function() {};
    // console.warn = function() {};
    // console.error = function() {};

    // منع iframe embedding
    if (window.top !== window.self) {
      window.top.location = window.self.location;
    }

    // Watermark مخفي في الكونسول
    console.log(
      "%c🔐 Protected by Ali Ahmed",
      "color: #8a7ddb; font-size: 20px; font-weight: bold;"
    );
    console.log(
      "%c⚠️ This website is protected. Unauthorized use is prohibited.",
      "color: #ff6b6b; font-size: 14px;"
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // التنفيذ الفوري
  // ═══════════════════════════════════════════════════════════════

  // 1. التحقق من الدومين أولاً (الأهم)
  if (!_0xVerify()) {
    return; // الخروج فوراً لو الدومين غير مصرح
  }

  // 2. تفعيل باقي الحمايات عند تحميل DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      _0xAntiDev();
      _0xAntiCopy();
      _0xExtraProtection();
    });
  } else {
    _0xAntiDev();
    _0xAntiCopy();
    _0xExtraProtection();
  }

  // 3. فحص متكرر للدومين (للأمان)
  setInterval(function () {
    _0xVerify();
  }, 5000);
})();
