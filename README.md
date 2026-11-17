# لوحة تحكم منصة نبراس الأزهرية (Nibras Admin Dashboard)

لوحة تحكم إدارية مركزية لإدارة منصة نبراس الأزهرية مبنية باستخدام **Next.js 14 (App Router)**، **Tailwind CSS**، و **Firebase**، مهيأة للتشغيل عبر الحاويات (Docker) ومنصات الاستضافة السحابية مثل **Coolify**.

---

## 🚀 النشر والتشغيل عبر Coolify

تم تضمين ملف `Dockerfile` متعدد المراحل (Multi-stage) مع ميزة `standalone` في Next.js لإنتاج صورة خفيفة وعالية الأداء.

### متغيرات البيئة (Coolify Environment Variables)
أضف المتغيرات التالية داخل قسم **Environment Variables** في Coolify:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
```

---

## 🛠️ خطوات الإضافة في Coolify:
1. في لوحة **Coolify**، اضغط: **+ New Resource** ⬅ **Application**.
2. اختر **Public Repository** أو **Private Repository**.
3. ضع رابط المستودع.
4. أضف متغيرات البيئة في قسم **Environment Variables** (تأكد من تحديد خيار **Available during build** لأن متغيرات `NEXT_PUBLIC_*` يحتاجها Next.js أثناء مرحلة الـ Build).
5. سيتعرف Coolify تلقائياً على ملف `Dockerfile` (المنفذ الافتراضي `3000`).
6. اضغط **Deploy**.
