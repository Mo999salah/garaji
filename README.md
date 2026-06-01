# Qitaa

Production-oriented Expo React Native app for B2B ordering.

## Structure

- `app/` - Expo Router routes and protected role groups.
- `app/(auth)/` - Supabase email/password auth, signup, and password reset.
- `app/(customer)/` - customer-only screens guarded by role.
- `app/(merchant)/` - merchant-only screens guarded by role.
- `src/features/auth/` - auth service, session listener, and centralized Zustand store.
- `src/features/products/` - catalog services, selectors, forms, and store.
- `src/features/cart/` - persisted local cart with single-merchant enforcement.
- `src/features/orders/` - order services, selectors, UI, and store.
- `src/shared/components/` - reusable NativeWind UI primitives.
- `src/shared/lib/` - Supabase client, query client, and session helpers.
- `src/shared/types/` - typed auth, catalog, order, and database models.
- `supabase/migrations/` - schema, RLS, profile bootstrap, and atomic order RPC.

## Auth

Auth state lives in `useAuthStore` and syncs with Supabase Auth:

- Sessions persist with `expo-secure-store` on native and AsyncStorage on web.
- `useAuthSessionListener` keeps the store aligned with token refresh and sign-out events.
- Sign-up metadata is trusted only by the database trigger in `20260520103000_auth_profile_bootstrap.sql`.
- Sign-out clears cart, catalog cache, and order cache via `resetSessionStores`.

Configure:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Apply migrations before testing signup:

```bash
supabase db push
```

## Catalog and orders

When Supabase env vars are present:

- Products and categories load from `products`, `categories`, and `merchants`.
- Products include part numbers, vehicle fitment, optional stock, and minimum order quantity.
- Customer checkout calls `create_order_with_items` for atomic order creation.
- Merchant and customer order lists load from `orders` + `order_items`.

Without Supabase configuration, the app falls back to local demo auth, in-memory catalog,
and in-memory orders for UI work. Use either email below with any non-empty password:

```text
customer@qitaa.local
merchant@qitaa.local
```

## Cart rules

- Cart items persist locally between app restarts.
- Only one merchant is allowed per cart; adding a product from another merchant is blocked at add time.
- Checkout still validates mixed merchants as a final guard.

## Database highlights

- `orders.customer_name` stores a customer display snapshot for merchant order views.
- `create_order_with_items` creates an order and its line items in one transaction.
- Direct client inserts into `orders` and `order_items` are revoked after the RPC migration.
- Base catalog categories are seeded by migration so product creation works after `db:push`.
- Order item snapshots preserve the product part number and enforce minimum order quantity.
- Merchants can cancel orders while status is `pending`, `processing`, or `on_the_way`.

## Scripts

```bash
npm start
npm run typecheck
npm run doctor
```

Optional Supabase type generation:

```bash
supabase gen types typescript --local > src/shared/types/supabase.generated.ts
```
