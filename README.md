# كراجي — منصة خدمات سيارات

تطبيق Expo React Native للحجوزات وخدمات السيارات (single-tenant MVP)، مُستوحى من تطبيق زيتي.

## البنية

- `app/` - مسارات Expo Router ومجموعات الأدوار المحمية.
- `app/(auth)/` - تسجيل الدخول وإنشاء الحساب وإعادة تعيين كلمة المرور عبر Supabase.
- `app/(customer)/` - شاشات العملاء: الجراج، الحجوزات، سجل الطلبات.
- `app/(merchant)/` - شاشات الإدارة/الطاقم: الطلبات، الفروع، الخدمات.
- `src/features/auth/` - خدمة المصادقة، مستمع الجلسة، ومخزن Zustand المركزي.
- `src/features/vehicles/` - خدمة مركبات العميل (جراج)، Zustand store، React Query hooks.
- `src/features/branches/` - خدمة الفروع مع RLS، BranchCard، BranchForm.
- `src/features/services/` - الخدمات المتاحة (فرع / موقع / كلاهما)، ServiceCard، ServiceForm.
- `src/features/requests/` - خدمة الطلبات، سيلكتورات انتقال الحالة، RequestCard، RequestTimeline.
- `src/shared/components/` - مكونات UI أساسية (AppButton, AppCard, AppInput, EmptyState…).
- `src/shared/lib/` - عميل Supabase، React Query، ومساعدات الجلسة.
- `src/shared/types/` - نماذج مكتوبة للمصادقة وقاعدة البيانات.
- `supabase/migrations/` - schema، RLS، bootstrap الملفات الشخصية، وRPCs ذرية.

## المصادقة

مستخدمون من نوعين (الأدوار محفوظة في جدول `profiles`):

| الدور | الوصول |
|---|---|
| `customer` | حجز خدمات، إدارة المركبات، متابعة الطلبات |
| `merchant` | إدارة الطلبات والفروع والخدمات |

## الخدمات والحجوزات

### أنواع الخدمات

| النوع | الوصف |
|---|---|
| `branch` | الخدمة في الفرع فقط (مثل الصيانة الدورية) |
| `mobile` | الخدمة بالموقع فقط (مثل تغيير الزيت في المنزل) |
| `both` | متاحة بكلا الطريقتين |

### حالات الطلب

```
pending → confirmed → in_progress → completed
    ↘           ↘
  cancelled  cancelled
```

| الحالة | العرض |
|---|---|
| `pending` | بانتظار التأكيد |
| `confirmed` | مؤكد |
| `in_progress` | جارٍ التنفيذ |
| `completed` | مكتمل |
| `cancelled` | ملغى |

## نموذج البيانات

```
profiles → vehicles          (جراج العميل)
profiles → service_requests  (الحجوزات)
vehicles → service_requests
services → service_requests
branches → service_requests  (اختياري للخدمات المنزلية)
service_requests → service_request_events  (الخط الزمني)
```

## RLS والأمان

- **vehicles**: العميل يقرأ/يكتب مركباته فقط؛ الطاقم يقرأ الجميع.
- **services / branches**: قراءة لجميع المستخدمين المُسجَّلين؛ تعديل لدور `merchant` فقط.
- **service_requests**: العميل ينشئ ويقرأ طلباته؛ الطاقم يقرأ ويحدّث حالة جميع الطلبات.
- إدراج الطلبات مُلزَم عبر RPC `create_service_request` (التحقق من ملكية المركبة + نشاط الخدمة).
- تغيير الحالة مُلزَم عبر RPC `update_service_request_status` (التحقق من التسلسل الصحيح).

## شاشات العملاء

| المسار | الوصف |
|---|---|
| `/home` | لوحة: ملخص المركبات، إجراءات سريعة، الطلبات النشطة |
| `/vehicles` | قائمة جراج السيارات |
| `/vehicles/new` | إضافة سيارة جديدة |
| `/vehicles/[id]/edit` | تعديل بيانات السيارة |
| `/services` | استعراض الخدمات المتاحة |
| `/branches` | استعراض الفروع |
| `/book/branch` | حجز موعد في فرع |
| `/book/mobile` | طلب خدمة بالموقع |
| `/requests` | سجل الطلبات (نشطة / مكتملة / ملغاة) |
| `/requests/[id]` | تفاصيل الطلب والخط الزمني |

## شاشات الإدارة (merchant)

| المسار | الوصف |
|---|---|
| `/home` | لوحة الطلبات الواردة حسب الحالة |
| `/requests` | جميع الطلبات مع فلاتر الحالة |
| `/requests/[id]` | تفاصيل الطلب + تغيير الحالة |
| `/services` | قائمة الخدمات |
| `/services/new` | إضافة خدمة |
| `/services/[id]/edit` | تعديل خدمة |
| `/branches` | قائمة الفروع |
| `/branches/new` | إضافة فرع |
| `/branches/[id]/edit` | تعديل فرع |

## إعداد البيئة

انسخ `.env.example` إلى `.env.local` وأضف قيم مشروع Supabase:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## الأوامر

```bash
npm install          # تثبيت التبعيات
npm start            # تشغيل خادم Metro
npm run typecheck    # فحص أنواع TypeScript
npm test             # تشغيل الاختبارات
npm run release:check  # فحص جاهزية الإصدار (23 فحص)
npm run quality:check  # بوابة الجودة الكاملة
```

## الاختبارات

```bash
npm test
```

الاختبارات تغطي:
- انتقالات حالة الطلب (`requestSelectors`)
- التحقق من نموذج المركبة (`vehicleSchema`)

## الهجرات

تسلسل هجرات Supabase:
1. `initial_garaji_schema` — جداول profiles وmerchants.
2. `auth_profile_bootstrap` — trigger إنشاء الملف الشخصي.
3. `car_services_schema` — جداول vehicles/branches/services/service_requests/events مع RLS وRPCs.
