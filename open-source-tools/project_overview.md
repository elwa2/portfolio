# Project Overview: financial-calculator

## File: `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Financial Calculator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <style>
      /* Custom toggle switch styles */
      .toggle-checkbox:checked {
        transform: translateX(100%);
        background-color: white;
        border-color: #4f46e5; /* indigo-600 */
      }
      .toggle-checkbox:checked + .toggle-label {
        background-color: #4f46e5; /* indigo-600 */
      }
    </style>
  <script type="importmap">
{
  "imports": {
    "react-dom/": "https://aistudiocdn.com/react-dom@^19.2.0/",
    "react/": "https://aistudiocdn.com/react@^19.2.0/",
    "react": "https://aistudiocdn.com/react@^19.2.0",
    "react-image-crop": "https://aistudiocdn.com/react-image-crop@^11.0.10"
  }
}
</script>
<link rel="stylesheet" href="/index.css">
</head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
```

## File: `metadata.json`

```json
{
  "name": "Financial Calculator",
  "description": "A simple calculator to determine final values based on a work value, with a configurable additional amount.",
  "requestFramePermissions": []
}
```

## File: `package.json`

```json
{
  "name": "financial-calculator",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react-dom": "^19.2.0",
    "react": "^19.2.0",
    "react-image-crop": "^11.0.10"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
}

```

## File: `README.md`

```md
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1MDrh4_kGfBe87u9ByriI5FnxfoPZPpB_

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

```

## File: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "skipLibCheck": true,
    "types": [
      "node"
    ],
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
```

## File: `types.ts`

```ts
export interface UploadedFile {
  id: string;
  name: string;
  file: File;
  arrayBuffer: ArrayBuffer | null;
  previewUrl?: string;
  rotation?: number;
}

export interface OutputPdf {
  id: string;
  name: string;
  blob: Blob;
}

```

## File: `vite.config.ts`

```ts
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

```

## File: `translations/index.ts`

```ts
export const translations = {
  en: {
    header: {
      fileToolkit: 'File Toolkit',
      integratedTools: 'Integrated File Tools',
    },
    sidenav: {
      imageTools: 'Image Tools',
      imageEditor: 'Image Editor',
      imageConverter: 'Image Converter',
      pdfTools: 'PDF Tools',
      pdfManager: 'PDF Manager',
      pdfConverter: 'PDF Converter',
      sidebarControl: 'Sidebar Control',
      expanded: 'Expanded',
      collapsed: 'Collapsed',
      expandOnHover: 'Expand on hover',
      toggleNavigation: 'Toggle navigation',
    },
    uploader: {
        uploadOrDropPdf: '<span class="font-semibold text-indigo-400">Click to upload PDFs</span>, drag & drop, or paste',
        uploadToEdit: '<span class="font-semibold text-indigo-400">Upload an image</span> to start editing.',
        uploadOrDropImage: '<span class="font-semibold text-indigo-400">Click to upload images</span>, drag & drop, or paste',
    },
    common: {
        download: 'Download',
        controls: 'Controls',
        left: 'Left',
        right: 'Right',
        apply: 'Apply',
        cancel: 'Cancel',
        reset: 'Reset',
        export: 'Export',
        notice: 'Notice',
    },
    status: {
        processing: 'Processing your file(s)...',
        converting: 'Converting...',
        outputFiles: 'Output Files',
    },
    errors: {
        errorTitle: 'Error',
        fileReadError: 'Failed to read file.',
        fileReadFail: 'Failed to read file',
        fileNotLoaded: 'File has not been loaded yet.',
    },
    pdfManager: {
        uploadedPdfs: 'Uploaded PDFs',
        merge: 'Merge',
        split: 'Split',
        rotate: 'Rotate',
        mergeDescription: 'Combine all uploaded PDFs into a single document. The order is based on the upload list.',
        mergeButton: 'Merge {count} Files',
        splitDescription: 'Split the selected PDF into multiple files based on page ranges.',
        splitExample: 'Example',
        splitPlaceholder: 'Enter page ranges...',
        splitButton: 'Split Selected PDF',
        rotateDescription: 'Rotate all pages of the selected PDF by a specified angle.',
        rotateButton: 'Rotate Selected PDF',
        errors: {
            mergeCount: 'Please upload at least two PDFs to merge.',
            mergeFailed: 'Failed to merge PDFs',
            invalidRange: 'Invalid range:',
            invalidPageNumber: 'Invalid page number:',
            selectSplit: 'Please select a PDF to split.',
            splitFailed: 'Failed to split PDF',
            selectRotate: 'Please select a PDF to rotate.',
            rotateFailed: 'Failed to rotate PDF',
        }
    },
    imageEditor: {
        transform: 'Transform',
        cropImage: 'Crop Image',
        filters: 'Filters',
        filterNames: {
            brightness: 'Brightness',
            contrast: 'Contrast',
            saturate: 'Saturate',
            grayscale: 'Grayscale',
        },
        pdfQuality: 'PDF Quality / Compression',
        convertAndDownload: 'Convert & Download PDF',
        errors: {
            canvasContext: 'Could not get canvas context',
            canvasEmpty: 'Canvas is empty',
            uploadToConvert: 'Please upload at least one image.',
            activeImageError: 'Active image is not loaded correctly.',
            canvasSupport: 'Canvas not supported',
            imageLoadError: 'Failed to load image for PDF conversion. The image source might be invalid or revoked.',
            pdfFailed: 'Failed to convert to PDF',
        }
    },
    imageConverter: {
        queue: 'Conversion Queue',
        options: 'Conversion Options',
        targetFormat: 'Target Format',
        quality: 'Quality',
        soon: 'Coming Soon',
        convertButton: 'Convert {count} Images',
        errors: {
            noImages: 'Please upload at least one image to convert.',
            someFailed: 'Some images could not be converted.',
            generic: 'An unexpected error occurred during conversion.',
        }
    },
    pdfConverter: {
        toPdf: 'To PDF',
        fromPdf: 'From PDF',
        imagesToPdf: 'Images to PDF',
        convertToPdfButton: 'Convert Images to PDF',
        fromPdfDescription: 'Select a PDF file and choose the format to convert it to.',
        advancedFeatureMessage: 'This advanced conversion requires a server-side component to process accurately and is currently for demonstration purposes only.',
        errors: {
            noImages: 'Please upload at least one image to convert.',
            conversionFailed: 'Failed to convert images to PDF'
        }
    }
  },
  ar: {
    header: {
      fileToolkit: 'أدوات الملفات',
      integratedTools: 'مجموعة أدوات ملفات متكاملة',
    },
    sidenav: {
      imageTools: 'أدوات الصور',
      imageEditor: 'محرر الصور',
      imageConverter: 'محول صيغ الصور',
      pdfTools: 'أدوات PDF',
      pdfManager: 'مدير PDF',
      pdfConverter: 'محول PDF',
      sidebarControl: 'التحكم في الشريط الجانبي',
      expanded: 'موسّع',
      collapsed: 'مطوي',
      expandOnHover: 'توسيع عند التمرير',
      toggleNavigation: 'تبديل التنقل',
    },
    uploader: {
        uploadOrDropPdf: '<span class="font-semibold text-indigo-400">اختر ملفات PDF</span>، أو اسحبها وأفلتها هنا، أو الصقها',
        uploadToEdit: '<span class="font-semibold text-indigo-400">ارفع صورة</span> لبدء التعديل.',
        uploadOrDropImage: '<span class="font-semibold text-indigo-400">اختر صورًا</span>، أو اسحبها وأفلتها هنا، أو الصقها',
    },
    common: {
        download: 'تنزيل',
        controls: 'أدوات التحكم',
        left: 'يسار',
        right: 'يمين',
        apply: 'تطبيق',
        cancel: 'إلغاء',
        reset: 'إعادة تعيين',
        export: 'تصدير',
        notice: 'ملاحظة',
    },
    status: {
        processing: 'جاري معالجة ملفاتك...',
        converting: 'جاري التحويل...',
        outputFiles: 'الملفات الناتجة',
    },
    errors: {
        errorTitle: 'خطأ',
        fileReadError: 'فشل في قراءة الملف.',
        fileReadFail: 'فشل في قراءة الملف',
        fileNotLoaded: 'لم يتم تحميل الملف بعد.',
    },
    pdfManager: {
        uploadedPdfs: 'ملفات PDF المرفوعة',
        merge: 'دمج',
        split: 'تقسيم',
        rotate: 'تدوير',
        mergeDescription: 'دمج جميع ملفات PDF المرفوعة في مستند واحد. يعتمد الترتيب على قائمة الرفع.',
        mergeButton: 'دمج {count} ملفات',
        splitDescription: 'تقسيم ملف PDF المحدد إلى عدة ملفات بناءً على نطاقات الصفحات.',
        splitExample: 'مثال',
        splitPlaceholder: 'أدخل نطاقات الصفحات...',
        splitButton: 'تقسيم الملف المحدد',
        rotateDescription: 'تدوير جميع صفحات ملف PDF المحدد بزاوية معينة.',
        rotateButton: 'تدوير الملف المحدد',
        errors: {
            mergeCount: 'يرجى رفع ملفي PDF على الأقل للدمج.',
            mergeFailed: 'فشل دمج ملفات PDF',
            invalidRange: 'نطاق غير صالح:',
            invalidPageNumber: 'رقم صفحة غير صالح:',
            selectSplit: 'يرجى تحديد ملف PDF لتقسيمه.',
            splitFailed: 'فشل تقسيم ملف PDF',
            selectRotate: 'يرجى تحديد ملف PDF لتدويره.',
            rotateFailed: 'فشل تدوير ملف PDF',
        }
    },
    imageEditor: {
        transform: 'تحويل',
        cropImage: 'قص الصورة',
        filters: 'الفلاتر',
        filterNames: {
            brightness: 'السطوع',
            contrast: 'التباين',
            saturate: 'التشبع',
            grayscale: 'تدرج الرمادي',
        },
        pdfQuality: 'جودة / ضغط ملف PDF',
        convertAndDownload: 'تحويل وتنزيل PDF',
        errors: {
            canvasContext: 'لا يمكن الحصول على سياق لوحة الرسم',
            canvasEmpty: 'لوحة الرسم فارغة',
            uploadToConvert: 'يرجى تحميل صورة واحدة على الأقل.',
            activeImageError: 'الصورة النشطة لم يتم تحميلها بشكل صحيح.',
            canvasSupport: 'لوحة الرسم غير مدعومة',
            imageLoadError: 'فشل تحميل الصورة لتحويلها إلى PDF. قد يكون مصدر الصورة غير صالح أو تم إبطاله.',
            pdfFailed: 'فشل التحويل إلى PDF',
        }
    },
    imageConverter: {
        queue: 'قائمة انتظار التحويل',
        options: 'خيارات التحويل',
        targetFormat: 'الصيغة المستهدفة',
        quality: 'الجودة',
        soon: 'قريباً',
        convertButton: 'تحويل {count} صور',
        errors: {
            noImages: 'يرجى تحميل صورة واحدة على الأقل للتحويل.',
            someFailed: 'تعذر تحويل بعض الصور.',
            generic: 'حدث خطأ غير متوقع أثناء التحويل.',
        }
    },
    pdfConverter: {
        toPdf: 'تحويل إلى PDF',
        fromPdf: 'تحويل من PDF',
        imagesToPdf: 'صور إلى PDF',
        convertToPdfButton: 'تحويل الصور إلى PDF',
        fromPdfDescription: 'اختر ملف PDF وحدد الصيغة التي تريد التحويل إليها.',
        advancedFeatureMessage: 'هذا التحويل المتقدم يتطلب مكونًا من جانب الخادم لمعالجته بدقة وهو متاح حاليًا لأغراض العرض التوضيحي فقط.',
        errors: {
            noImages: 'يرجى تحميل صورة واحدة على الأقل للتحويل.',
            conversionFailed: 'فشل تحويل الصور إلى PDF'
        }
    }
  }
};
```

