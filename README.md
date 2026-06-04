<div align="center">
  <h1>🚗 Garaji (كراجي)</h1>
  <p><strong>A Premium, Enterprise-Grade Vehicle Service Booking & Management Platform</strong></p>

  <p>
    <a href="https://expo.dev"><img src="https://img.shields.io/badge/Expo-v54.0.0-000.svg?style=flat-square&logo=expo&logoColor=white" alt="Expo" /></a>
    <a href="https://reactnative.dev"><img src="https://img.shields.io/badge/React%20Native-0.81.5-61DAFB.svg?style=flat-square&logo=react&logoColor=black" alt="React Native" /></a>
    <a href="https://typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.9.2-3178C6.svg?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" /></a>
    <a href="https://jestjs.io"><img src="https://img.shields.io/badge/Jest-Tests%20Passed-C21325.svg?style=flat-square&logo=jest&logoColor=white" alt="Jest" /></a>
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
├── app/                      # Expo Router File-Based Routing
│   ├── (auth)/               # User Sign-in, Sign-up & Recovery
│   ├── (customer)/           # Client App Screens (Garage, Bookings, Timeline)
│   └── (merchant)/           # Staff App Screens (Requests, Branch & Service Configs)
├── src/                      # Application Source Code
│   ├── features/             # Isolated Domain Features
│   │   ├── auth/             # Session Listeners & Zustand Store
│   │   ├── vehicles/         # Virtual Garage Management & Validation Rules
│   │   ├── branches/         # Store Locations CRUD
│   │   ├── services/         # Service Directory & Pricing
│   │   └── requests/         # Booking Services & Status Timeline
│   └── shared/               # Shared Components & Utilities
│       ├── components/       # Reusable Atomic UI (Buttons, Cards, Inputs)
│       ├── lib/              # Supabase Client & React Query Configuration
│       └── types/            # TypeScript Schema Definitions
└── supabase/                 # Database Schema & Migrations
```

### Absolute Directory References:
*   [app/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/app) — Core app router and navigation hierarchies.
    *   [app/(auth)/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/app/\(auth\)) — Authentication and onboarding layouts.
    *   [app/(customer)/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/app/\(customer\)) — Customer-specific workspace.
    *   [app/(merchant)/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/app/\(merchant\)) — Operations and branch management portal.
*   [src/features/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/src/features) — Business logic directories grouped by features.
    *   [src/features/auth/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/src/features/auth) — Session state management.
    *   [src/features/vehicles/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/src/features/vehicles) — Car validations and details hooks.
    *   [src/features/branches/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/src/features/branches) — Geolocation store branch metadata.
    *   [src/features/services/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/src/features/services) — Services pricing and data layers.
    *   [src/features/requests/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/src/features/requests) — Order state transformations.
*   [src/shared/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/src/shared) — Shared libraries and reusable UI elements.
    *   [src/shared/components/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/src/shared/components) — Atomic UI components library.
    *   [src/shared/lib/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/src/shared/lib) — Database connection helper files.
    *   [src/shared/types/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/src/shared/types) — Core entity models.
*   [supabase/migrations/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/supabase/migrations) — SQL script histories.

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
*   **Testing Suite:** Jest & tsx compiler

---

## 🚀 Getting Started

### 1. Configure Local Environment
Copy the configuration template:
```bash
cp .env.example .env.local
```
Update [.env.local](file:///c:/Users/MoSalah/Documents/GitHub/garaji/.env.local) with your Supabase credentials:
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
| `npm run typecheck` | Validates code formatting and type safety. |
| `npm test` | Runs internal testing files. |
| `npm run doctor` | Performs diagnostic health checks on expo configs. |
| `npm run release:check` | Asserts production schema RLS status and client code logic. |
| `npm run quality:check` | Executes a complete quality build validation gate. |
| `npm run db:push` | Syncs local migration scripts to the remote Supabase database. |
| `npm run db:status` | Displays the deployment status of Supabase migrations. |

---

## 🔍 Quality Control & Automated Gates

The repository features automated checks to protect the build and data model structure before pushing edits or making releases:

*   **Unit Tests:** Unit tests are located in [tests/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/tests) which validate Zod schemas and request selectors.
*   **Automatic Quality Gates:** Running `npm run quality:check` executes type checks, unit tests, doctor audits, and schema release checks.

```bash
# Run unit tests
npm test

# Run full quality check gate
npm run quality:check
```

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
├── app/                      # مسارات الموجه لـ Expo Router
│   ├── (auth)/               # تسجيل الدخول، التسجيل واسترجاع الحساب
│   ├── (customer)/           # شاشات العميل (المرآب، الحجز، التتبع)
│   └── (merchant)/           # شاشات مزود الخدمة (الطلبات، الفروع والخدمات)
├── src/                      # الكود المصدري للتطبيق
│   ├── features/             # منطق العمل مقسم حسب المهام
│   │   ├── auth/             # مستمع الجلسات ومخزن حالة المستخدم (Zustand)
│   │   ├── vehicles/         # نظام التحقق من سلامة بيانات المركبات
│   │   ├── branches/         # بيانات مواقع الفروع الجغرافية
│   │   ├── services/         # دليل الخدمات، التفاصيل والأسعار
│   │   └── requests/         # معالجة طلبات الحجز ومراحل الانتقال
│   └── shared/               # المكتبات والمكونات المشتركة
│       ├── components/       # مكونات واجهة المستخدم الأساسية القابلة لإعادة الاستخدام
│       ├── lib/              # تهيئة روابط قاعدة البيانات و React Query
│       └── types/            # تعريف أنواع البيانات لبيئة العمل (Types)
└── supabase/                 # جداول وهجرات قاعدة البيانات
```

### روابط الوصول المباشر للمجلدات:
*   [app/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/app) — هيكل المسارات العام.
    *   [app/(auth)/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/app/\(auth\)) — مسارات التحقق والهوية.
    *   [app/(customer)/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/app/\(customer\)) — واجهة العميل.
    *   [app/(merchant)/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/app/\(merchant\)) — بوابة الإدارة.
*   [src/features/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/src/features) — منطق العمل البرمجي.
    *   [src/features/auth/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/src/features/auth) — التحقق والمصادقة.
    *   [src/features/vehicles/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/src/features/vehicles) — شروط المركبة.
    *   [src/features/branches/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/src/features/branches) — الفروع الجغرافية.
    *   [src/features/services/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/src/features/services) — إدارة الخدمات والأسعار.
    *   [src/features/requests/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/src/features/requests) — الحجوزات والخطوط الزمنية للطلب.
*   [src/shared/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/src/shared) — الخدمات والواجهات المشتركة.
    *   [src/shared/components/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/src/shared/components) — مكتبة مكونات الواجهات.
    *   [src/shared/lib/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/src/shared/lib) — ملفات الاتصال وإدارة الجلسات.
    *   [src/shared/types/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/src/shared/types) — نماذج البيانات المشتركة.
*   [supabase/migrations/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/supabase/migrations) — ملفات هجرات قاعدة البيانات.

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
*   **بيئة الفحص:** Jest و tsx compiler

---

## 🚀 دليل التشغيل والتهيئة

### 1. تهيئة ملف المتغيرات البيئية
قم بنسخ نموذج الإعداد:
```bash
cp .env.example .env.local
```
قم بتهيئة المتغيرات في ملف [.env.local](file:///c:/Users/MoSalah/Documents/GitHub/garaji/.env.local) مستعينًا ببيانات مشروع Supabase الخاص بك:
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
| `npm test` | لتشغيل ملفات الاختبار البرمجية. |
| `npm run doctor` | لفحص سلامة إعدادات التطبيق وتكامل مسارات الحزم. |
| `npm run release:check` | للتحقق من أمان قاعدة البيانات وتطابق الجداول للإنتاج الفعلي. |
| `npm run quality:check` | لتشغيل البوابة الشاملة للجودة (فحص الأنواع والاختبارات وتجهيز البناء للويب). |
| `npm run db:push` | لمزامنة ملفات الهجرة المحلية ورفعها لقاعدة البيانات السحابية. |
| `npm run db:status` | للتحقق من حالة مزامنة هجرات جداول قاعدة البيانات. |

---

## 🔍 ضمان الجودة والاختبارات التلقائية

يتبع المستودع معايير تحقق صارمة تضمن استقرار الكود وحمايته من التعديلات الخاطئة قبل عملية النشر الفعلي:

*   **اختبارات الوحدة:** متوفرة داخل المجلد [tests/](file:///c:/Users/MoSalah/Documents/GitHub/garaji/tests) لضمان صحة كينونات Zod ومنطق تتبع الحالات لآلة الحالة.
*   **بوابات الجودة التلقائية:** عند تشغيل `npm run quality:check` ستقوم الأداة تلقائياً بفحص سلامة الأنواع، اختبارات الوحدة، وفحص حالة أمان قاعدة البيانات وجودة روابط الموجه.

```bash
# تشغيل اختبارات الوحدة البرمجية
npm test

# تشغيل بوابة الجودة الشاملة للمشروع
npm run quality:check
```
