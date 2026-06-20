# Engineering Pioneers — Frontend

واجهة المنصة مبنية بـ **React 19 + Vite + Tailwind CSS**.

## المتطلبات

- [Node.js](https://nodejs.org/) 18 أو أحدث
- npm
- **Backend شغال** على `http://localhost:3000` (راجع `../backend/README.md`)

## التشغيل السريع

### 1) إعداد البيئة

من مجلد `frontend`:

```bash
copy .env.example .env
```

الملف `.env` جاهز افتراضياً للتطوير المحلي — عدّل `VITE_API_URL` لو الباك على منفذ أو دومين مختلف.

### 2) تثبيت الحزم

```bash
npm install
```

### 3) تشغيل التطوير

```bash
npm run dev
```

الواجهة تفتح على: **http://localhost:5173**

## أوامر مفيدة

| الأمر | الوظيفة |
|--------|---------|
| `npm run dev` | سيرفر تطوير Vite |
| `npm run build` | بناء للإنتاج → `dist/` |
| `npm run preview` | معاينة نسخة الإنتاج محلياً |
| `npm run lint` | فحص ESLint |

## متغيرات البيئة (`.env`)

كل متغيرات Vite لازم تبدأ بـ `VITE_`.

| المتغير | مطلوب | الوصف |
|---------|--------|--------|
| `VITE_API_URL` | نعم | رابط الـ API (مثال: `http://localhost:3000/api/v1`) |
| `VITE_APP_NAME` | لا | اسم التطبيق |
| `VITE_DEFAULT_LOCALE` | لا | اللغة الافتراضية (`ar` أو `en`) |
| `VITE_CONTACT_EMAIL` | لا | بريد التواصل في الفوتر |
| `VITE_SUPPORT_PHONE` | لا | رقم الدعم |
| `VITE_SOCIAL_*_URL` | لا | روابط السوشيال ميديا |

> **ملاحظة:** بعد أي تعديل على `.env` أعد تشغيل `npm run dev`.

## تسجيل الدخول للتجربة

شغّل الباك واعمل seed أولاً، ثم استخدم:

- **Super Admin:** `superadmin@engineeringpioneers.com`
- **كلمة المرور:** `Password123!`

صفحة الدخول: `/login`  
لوحة الإدارة: `/admin/dashboard`

## هيكل المشروع (مختصر)

```
frontend/
├── public/assets/      # صور وشعارات
├── src/
│   ├── pages/          # صفحات التطبيق
│   ├── components/     # مكوّنات مشتركة
│   ├── features/       # منطق حسب الميزة (API + hooks)
│   ├── lib/api.js      # Axios client
│   └── i18n/           # ترجمة عربي / إنجليزي
└── .env                # إعدادات محلية (مش في Git)
```

## ربط الفرونت بالباك

1. شغّل الباك: `cd backend && npm run dev`
2. تأكد إن `VITE_API_URL` في `.env` يطابق عنوان الباك
3. تأكد إن منفذ الفرونت موجود في `ALLOWED_ORIGINS` عند الباك

## مشاكل شائعة

**الطلبات بتفشل / Network Error**
- تأكد إن الباك شغال على المنفذ الصحيح
- راجع `VITE_API_URL` في `.env`

**401 بعد تسجيل الدخول**
- تأكد إن `JWT_SECRET` و `JWT_REFRESH_SECRET` مضبوطين في `.env` بتاع الباك

**الصفحة فاضية بعد البناء**
- تأكد إن السيرفر بيخدم الملفات من `dist/` بشكل صحيح
