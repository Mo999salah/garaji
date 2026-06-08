<div align="center">
  <h1>🚗 Garaji (كراجي)</h1>
  <p><strong>A Premium, Enterprise-Grade Vehicle Service Booking & Management Platform</strong></p>

  <p>
    <a href="https://expo.dev"><img src="https://img.shields.io/badge/Expo-v54.0.0-000.svg?style=flat-square&logo=expo&logoColor=white" alt="Expo" /></a>
    <a href="https://reactnative.dev"><img src="https://img.shields.io/badge/React%20Native-0.81.5-61DAFB.svg?style=flat-square&logo=react&logoColor=black" alt="React Native" /></a>
    <a href="https://typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.9.2-3178C6.svg?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" /></a>
    <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Tests-node%3Atest-339933.svg?style=flat-square&logo=node.js&logoColor=white" alt="Tests" /></a>
  </p>

  <h4>
    <a href="#english-version">English Version</a> | <a href="#النسخة-العربية">النسخة العربية</a>
  </h4>
</div>

---

# English Version

## 📖 Table of Contents
*   [Overview](#overview)
*   [Key Features](#key-features)
*   [System Architecture](#system-architecture)
*   [Database & Security Model](#database--security-model)
*   [State Machine Lifecycle](#state-machine-lifecycle)
*   [Tech Stack](#tech-stack)
*   [Getting Started](#getting-started)
*   [Available Scripts](#available-scripts)
*   [Quality Control & Automated Gates](#quality-control--automated-gates)
*   [Deployment Checklist](#deployment-checklist)

---

## 🌟 Overview

**Garaji** is a modern, production-ready mobile platform engineered for comprehensive vehicle service management. Designed for both customer bookings and merchant operations, the system enforces a strict, secure, and bulletproof database-level transactional model using row-level policies and database functions.

---

## ⚡ Key Features

<table>
  <tr>
    <td width="50%">
      <h3>👤 Customer Experience</h3>
      <ul>
        <li><strong>Virtual Garage:</strong> Track and manage multiple vehicles with client-side & database-level validation (e.g., model year boundaries and plate number format checks).</li>
        <li><strong>Services Directory:</strong> Browse automotive services (mechanical, electrical, detailing) with filterable delivery types.</li>
        <li><strong>Secure Bookings:</strong> Prevent manipulation using server-side vehicle verification and live price snapshotting.</li>
        <li><strong>Real-time Tracking:</strong> Monitor request progress through a detailed historical timeline.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🏢 Merchant Operations</h3>
      <ul>
        <li><strong>Control Dashboard:</strong> View and search bookings categorized dynamically by their operational status.</li>
        <li><strong>Status Management:</strong> Transition jobs safely through administrative action using validated states.</li>
        <li><strong>Inventory & Services:</strong> Admin-only CRUD operations for physical branches, service details, and pricing.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🛠️ System Architecture

The codebase follows a modular feature-driven architecture that isolates domains and maintains a clean separation of concerns:

```
garaji/
├── app/                      # Expo Router routes
│   ├── (tabs)/               # Customer home, orders, vehicles
│   ├── (admin)/              # Merchant dashboard, CRUD, analytics
│   ├── login.tsx             # Auth (public, redirects if signed in)
│   ├── book-service.tsx      # Mobile service booking + map
│   └── order-details.tsx     # Shared request detail / operations
├── src/
│   ├── features/
│   │   ├── auth/             # Session, RoleGate, AuthPublicGate
│   │   ├── vehicles/         # Customer garage
│   │   ├── branches/         # Branch catalog
│   │   ├── services/         # Service catalog
│   │   ├── requests/         # Bookings & status timeline
│   │   └── operations/       # Technicians, maintenance plans, ops panel
│   └── shared/               # UI kit, Supabase, React Query, hooks
├── supabase/migrations/      # RLS, RPCs, seed data
└── tests/                    # Unit tests (selectors, schemas)
```

Design HTML exports under `.stitch/` are **gitignored** reference material only — not part of the runtime app.

**Maps:** `book-service` uses `react-native-maps` on iOS/Android. On web, coordinates are entered manually or via browser geolocation (`AppMap.web.tsx` placeholder).

---

## 🛡️ Database & Security Model

To prevent client-side manipulation and secure user records, data integrity is guaranteed directly at the database engine level:

### 🔒 Row-Level Security (RLS)
*   `vehicles`: Users have full access to their own vehicle profiles. Service staff are granted read-only access to all profiles for booking identification.
*   `services` & `branches`: Logged-in accounts read all services and branches. Create, update, and delete access is strictly limited to the `merchant` role.
*   `service_requests`: Direct client-side `INSERT` and `UPDATE` capabilities are **revoked**. All modifications must bypass direct table writes and use RPC triggers.

### ⚙️ Secure Database RPC Triggers
*   **Booking Integrity (`create_service_request`):** Verifies vehicle ownership before committing, checks if the service delivery type aligns (e.g., prevents booking mobile-only services at a physical branch), and captures a snapshot of the current service price to block malicious price injection.
*   **Workflow Verification (`update_service_request_status`):** Ensures only authenticated personnel can transition states, validating the request lifecycle step-by-step.

---

## 📊 State Machine Lifecycle

Booking states transition in a strictly controlled manner via database constraints:

```
    [ pending ] ──────► [ confirmed ] ──────► [ in_progress ] ──────► [ completed ]
         │                     │
         ▼                     ▼
    [ cancelled ]         [ cancelled ]
```

*   `pending`: Default state after creation. Can be cancelled by the user.
*   `confirmed`: Approved by staff. Preparations are initiated.
*   `in_progress`: Mechanics or mobile vans are executing the task.
*   `completed`: Work completed and closed.
*   `cancelled`: Terminated from either *pending* or *confirmed* state.

---

## 💻 Tech Stack

*   **Mobile Core:** Expo SDK 54, React Native 0.81.5, React 19, TypeScript
*   **Navigation:** Expo Router v6 (typed, file-based layouts)
*   **State & Cache:** Zustand v4, TanStack React Query v5
*   **Backend Support:** Supabase (Auth, Postgres DB, Storage buckets)
*   **Interface Styling:** NativeWind v4, Tailwind CSS v3
*   **Validation Core:** React Hook Form & Zod
*   **Testing & Lint:** Node.js test runner (`tsx --test`), ESLint (`expo lint`)

---

## 🚀 Getting Started

### 1. Configure Local Environment
Copy the configuration template:
```bash
cp .env.example .env.local
```
Update `.env.local` with your Supabase credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### 2. Launch Development Servers
```bash
npm install     # Install dependencies
npm start       # Start Expo bundler
```

---

## ⚙️ Available Scripts

Manage your workspace using the standard package scripts:

| Script | Purpose |
|:---|:---|
| `npm start` | Launches the Expo Metro bundler server. |
| `npm run android` | Boots the application inside an Android Emulator. |
| `npm run ios` | Boots the application inside an iOS Simulator. |
| `npm run web` | Serves the project as a progressive web application. |
| `npm run typecheck` | Validates TypeScript types. |
| `npm run lint` | Runs ESLint via Expo. |
| `npm test` | Runs unit tests in `tests/`. |
| `npm run test:e2e` | Runs Playwright web smoke tests (starts or reuses `npm run web`). |
| `npm run doctor` | Performs diagnostic health checks on expo configs. |
| `npm run release:check` | Asserts production schema RLS status and client code logic. |
| `npm run quality:check` | Executes a complete quality build validation gate. |
| `npm run db:push` | Syncs local migration scripts to the remote Supabase database. |
| `npm run db:status` | Displays the deployment status of Supabase migrations. |

---

## 🔍 Quality Control & Automated Gates

The repository features automated checks to protect the build and data model structure before pushing edits or making releases:

*   **Unit Tests:** Located in `tests/` — Zod schemas, request selectors, analytics helpers, auth routing.
*   **Web Smoke (E2E):** `e2e/web-smoke.spec.ts` — login screen and guest redirect via Playwright.
*   **Automatic Quality Gates:** Running `npm run quality:check` executes type checks, lint, unit tests, doctor audits, and schema release checks.

```bash
# Run unit tests
npm test

# Run web smoke tests (requires Chromium — npx playwright install chromium)
npm run test:e2e

# Run full quality check gate
npm run quality:check
```

---

## 🚢 Deployment Checklist

Before promoting a build to production:

1. **Database:** Run `npm run db:status` — all local migrations must be applied on the remote (`npm run db:push` if needed).
2. **Environment:** Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in EAS/hosting secrets — never commit `.env.local`.
3. **Quality gate:** `npm run quality:check` must pass (typecheck, lint, unit tests, release checks, web export).
4. **Smoke test:** `npm run test:e2e` against the web build on your target port (`EXPO_DEV_SERVER_URL` if not 8081).
5. **Mobile builds:** Use [EAS Build](https://docs.expo.dev/build/introduction/) for iOS/Android store binaries; maps require native `react-native-maps` (not the web coordinate fallback).

---
---

# النسخة العربية

## 📖 جدول المحتويات
*   [نظرة عامة](#نظرة-عامة)
*   [الميزات الرئيسية](#الميزات-الرئيسية)
*   [الهيكل البرمجي وبنية الملفات](#الهيكل-البرمجي-وبنية-الملفات)
*   [هندسة الأمان وقاعدة البيانات](#هندسة-الأمان-وقاعدة-البيانات)
*   [دورة حياة الحجوزات (آلة الحالة)](#دورة-حياة-الحجوزات-آلة-الحالة)
*   [التقنيات المستخدمة](#التقنيات-المستخدمة)
*   [دليل التشغيل والتهيئة](#دليل-التشغيل-والتهيئة)
*   [أوامر بيئة العمل المتاحة](#أوامر-بيئة-العمل-المتاحة)
*   [ضمان الجودة والاختبارات التلقائية](#ضمان-الجودة-والاختبارات-التلقائية)
*   [قائمة التحقق قبل النشر](#قائمة-التحقق-قبل-النشر)

---

## 🌟 نظرة عامة

**كراجي (Garaji)** هي منصة برمجية متكاملة لطلب وإدارة خدمات صيانة ورعاية المركبات. تم تصميم وتطوير التطبيق لخدمة مالكي السيارات ومقدمي الخدمة على حد سواء، مع تطبيق سياسات أمان صارمة ومتقدمة على مستوى قاعدة البيانات لمنع أي تلاعب وتأمين كافة تعاملات المستخدمين.

---

## ⚡ الميزات الرئيسية

<table>
  <tr>
    <td width="50%">
      <h3>👤 تجربة العميل</h3>
      <ul>
        <li><strong>المرآب الافتراضي:</strong> إدارة بيانات مركبات متعددة مع ميزة التحقق التلقائي من توافق سنة الصنع وتنسيق لوحة السيارة.</li>
        <li><strong>دليل الخدمات:</strong> تصفح ومطابقة الخدمات الفنية والجمالية بناءً على طريقة التقديم (موقع العميل أو داخل الفروع).</li>
        <li><strong>حجز فوري آمن:</strong> حماية الحجز من التلاعب بالأسعار عبر تثبيت سعر الخدمة فوريًا لحظة الحجز والتثبت من ملكية السيارة.</li>
        <li><strong>تتبع خط الحالة:</strong> متابعة تفصيلية لتغير مراحل الطلب من البداية وحتى التسليم.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🏢 إدارة مزود الخدمة</h3>
      <ul>
        <li><strong>لوحة تحكم تفاعلية:</strong> رصد وتصفية الحجوزات الواردة بسهولة حسب مراحل التنفيذ.</li>
        <li><strong>إدارة سير العمل:</strong> ترقية حالة الطلبات بشكل متتابع وآمن حسب ضوابط العمل.</li>
        <li><strong>إدارة الفروع والخدمات:</strong> صلاحيات كاملة لإضافة وتحديث بيانات الخدمات، الأسعار، ومواقع الفروع الجغرافية.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🛠️ الهيكل البرمجي وبنية الملفات

يتبع المشروع أسلوباً برمجياً مبنياً على تقسيم الخدمات كـ (Features) لضمان عزل البيانات وسهولة التحديث:

```
garaji/
├── app/
│   ├── (tabs)/               # الرئيسية، الطلبات، سياراتي
│   ├── (admin)/              # لوحة التاجر، الفروع، الفنيين، التحليلات
│   ├── login.tsx             # دخول (يُعاد توجيه المسجّل)
│   ├── book-service.tsx      # حجز خدمة بالموقع + خريطة
│   └── order-details.tsx     # تفاصيل الطلب والعمليات
├── src/features/             # auth, vehicles, requests, operations, ...
├── supabase/migrations/
└── tests/
```

ملفات التصميم في `.stitch/` **مستثناة من Git** — مرجع تصميم فقط وليست جزءاً من التطبيق.

**الخرائط:** تفاعلية على iOS/Android عبر `react-native-maps`. على الويب يُدخل المستخدم الإحداثيات يدوياً أو يستخدم الموقع الحالي.

---

## 🛡️ هندسة الأمان وقاعدة البيانات

تم تأمين بيانات المستخدمين والعمليات الحساسة عبر تطبيق قواعد أمان متقدمة وصارمة ومحكمة مباشرة في محرك قاعدة البيانات السحابي:

### 🔒 سياسات أمان مستوى الصف (RLS)
*   `vehicles`: يحق للعميل إدارة وتعديل مركباته الشخصية فقط، بينما يملك المشرفون ومقدمو الخدمة صلاحية القراءة فقط لمطابقة المركبة مع الحجز.
*   `services` و `branches`: تُتاح إمكانية القراءة للجميع، وصلاحيات الإضافة والتعديل محصورة حصراً بحسابات المشرفين (`merchant`).
*   `service_requests`: تم **إلغاء** صلاحيات الكتابة المباشرة (`INSERT`) والتحديث (`UPDATE`) تماماً لمنع العميل من تعديل الجداول بدون قيود أو تغيير أسعار الخدمات.

### ⚙️ الإجراءات المخزنة والآمنة (RPCs)
*   **إنشاء وحفظ الحجوزات (`create_service_request`):** تتولى الدالة التأكد من امتلاك المستخدم للمركبة قبل الحجز، وتطابق طبيعة الخدمة مع طريقة تقديمها (على سبيل المثال، منع حجز خدمة فروع للتسليم المنزلي)، وتثبيت سعر الخدمة الحالي فورًا في حقل منفصل لضمان حماية التكلفة.
*   **ترقية حالة الطلب (`update_service_request_status`):** تحكم هذه الدالة انتقال المراحل وتمنع تقدم حالة الطلب بطرق عشوائية أو عن طريق مستخدمين غير مخولين.

---

## 📊 دورة حياة الحجوزات (آلة الحالة)

تتحرك الحجوزات ضمن مسار صارم على مستوى قاعدة البيانات لضمان عدم حدوث أخطاء تشغيلية:

```
    [ قيد الانتظار ] ──────► [ مؤكّـد ] ──────► [ قيد التنفيذ ] ──────► [ مكتمل ]
           │                    │
           ▼                    ▼
       [ ملغي ]             [ ملغي ]
```

*   `pending` (قيد الانتظار): حجز تم إنشاؤه وبانتظار المراجعة. يمكن إلغاؤه من طرف العميل.
*   `confirmed` (مؤكد): تمت الموافقة عليه وتحديد الموعد.
*   `in_progress` (قيد التنفيذ): العمل جارٍ الآن على خدمة المركبة.
*   `completed` (مكتمل): انتهى العمل وسُلمت المركبة بنجاح.
*   `cancelled` (ملغي): أُلغي الطلب من حالتي (الانتظار) أو (التأكيد) فقط.

---

## 💻 التقنيات المستخدمة

*   **بيئة العمل الأساسية:** Expo SDK 54, React Native 0.81.5, React 19, TypeScript
*   **الملاحة والتنقل:** Expo Router v6 (نظام ملاحة قائم على هيكل المجلدات)
*   **إدارة الحالة والكاش:** Zustand v4, TanStack React Query v5
*   **قاعدة البيانات:** Supabase (نظام التحقق، جداول Postgres السحابية، سحابة التخزين)
*   **التصميم والتنسيق:** NativeWind v4, Tailwind CSS v3
*   **إدارة النماذج والتحقق:** React Hook Form و Zod
*   **الفحص والجودة:** `tsx --test` و ESLint (`expo lint`)

---

## 🚀 دليل التشغيل والتهيئة

### 1. تهيئة ملف المتغيرات البيئية
قم بنسخ نموذج الإعداد:
```bash
cp .env.example .env.local
```
قم بتهيئة المتغيرات في ملف `.env.local` مستعينًا ببيانات مشروع Supabase الخاص بك:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### 2. تشغيل بيئة التطوير
```bash
npm install     # تثبيت التبعيات والمكتبات
npm start       # تشغيل خادم الحزم Metro
```

---

## ⚙️ أوامر بيئة العمل المتاحة

أدِر مهام مشروعك بسلاسة وسرعة عبر منفذ الأوامر (Terminal):

| الأمر | المهمة |
|:---|:---|
| `npm start` | لتشغيل خادم Metro المترجم لتطبيق Expo. |
| `npm run android` | لتشغيل خادم المترو وبدء التطبيق داخل محاكي الأندرويد. |
| `npm run ios` | لتشغيل خادم المترو وبدء التطبيق داخل محاكي الآيفون. |
| `npm run web` | لتشغيل وبدء التطبيق كنسخة ويب تفاعلية على المتصفح. |
| `npm run typecheck` | للتأكد من خلو ملفات التطبيق البرمجية من أخطاء TypeScript. |
| `npm run lint` | لتشغيل ESLint عبر Expo. |
| `npm test` | لتشغيل اختبارات الوحدة في `tests/`. |
| `npm run test:e2e` | لتشغيل اختبارات smoke للويب عبر Playwright. |
| `npm run doctor` | لفحص سلامة إعدادات التطبيق وتكامل مسارات الحزم. |
| `npm run release:check` | للتحقق من أمان قاعدة البيانات وتطابق الجداول للإنتاج الفعلي. |
| `npm run quality:check` | لتشغيل البوابة الشاملة للجودة (فحص الأنواع والاختبارات وتجهيز البناء للويب). |
| `npm run db:push` | لمزامنة ملفات الهجرة المحلية ورفعها لقاعدة البيانات السحابية. |
| `npm run db:status` | للتحقق من حالة مزامنة هجرات جداول قاعدة البيانات. |

---

## 🔍 ضمان الجودة والاختبارات التلقائية

يتبع المستودع معايير تحقق صارمة تضمن استقرار الكود وحمايته من التعديلات الخاطئة قبل عملية النشر الفعلي:

*   **اختبارات الوحدة:** في `tests/` — مخططات Zod، محددات الطلبات، توجيه الأدوار، ومساعدات خطط الصيانة.
*   **اختبارات smoke للويب:** `e2e/web-smoke.spec.ts` — شاشة الدخول وإعادة توجيه الضيف.
*   **بوابات الجودة التلقائية:** عند تشغيل `npm run quality:check` ستقوم الأداة بفحص الأنواع، ESLint، اختبارات الوحدة، وفحص أمان قاعدة البيانات.

```bash
# تشغيل اختبارات الوحدة البرمجية
npm test

# تشغيل smoke للويب (يتطلب Chromium: npx playwright install chromium)
npm run test:e2e

# تشغيل بوابة الجودة الشاملة للمشروع
npm run quality:check
```

---

## 🚢 قائمة التحقق قبل النشر

قبل رفع نسخة إنتاجية:

1. **قاعدة البيانات:** `npm run db:status` — يجب تطبيق كل الهجرات على السيرفر البعيد (`npm run db:push` عند الحاجة).
2. **المتغيرات:** ضع مفاتيح Supabase في أسرار EAS/الاستضافة — لا ترفع `.env.local`.
3. **بوابة الجودة:** `npm run quality:check` يجب أن ينجح.
4. **Smoke للويب:** `npm run test:e2e` على المنفذ المحدد (`EXPO_DEV_SERVER_URL` إن لم يكن 8081).
5. **الجوال:** استخدم EAS Build لملفات iOS/Android؛ الخرائط تتطلب `react-native-maps` الأصلي وليس بديل الويب.
