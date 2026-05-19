# Qitaa

Production-oriented Expo React Native scaffold for a B2B ordering app.

## Structure

- `app/` - Expo Router routes and protected role groups.
- `app/(auth)/` - mock login flow.
- `app/(customer)/` - customer-only screens guarded by role.
- `app/(merchant)/` - merchant-only screens guarded by role.
- `src/features/auth/` - auth business logic, mock auth service, and centralized Zustand store.
- `src/features/products/` - product mock data, selectors, form validation, UI, and mutations.
- `src/features/cart/` - local mock cart state, totals, and cart item UI.
- `src/shared/components/` - reusable NativeWind UI primitives.
- `src/shared/lib/` - app services such as TanStack Query and Supabase client setup.
- `src/shared/types/` - typed auth and ordering models.
- `src/styles/global.css` - NativeWind CSS entry.

## Auth

Auth state is centralized in `useAuthStore`. The current implementation uses mock role login and stores the mobile session with `expo-secure-store`; web development uses an in-memory fallback because SecureStore is a native mobile API. Route-group layouts guard access by reading the centralized user role, not by trusting the navigation path.

## Supabase

`src/shared/lib/supabase.ts` is ready for `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Replace the mock service in `src/features/auth/services/mockAuthService.ts` when backend auth is introduced.

Database design lives in `supabase/migrations/20260519112000_initial_qitaa_schema.sql`. The app is not connected to Supabase yet.

### Schema Overview

- `profiles` maps one row to each `auth.users` account and stores the app role: `customer` or `merchant`.
- `merchants` stores merchant business records and links each merchant to its owner profile.
- `categories` stores shared catalog categories.
- `products` stores merchant-owned catalog items with category, price, unit, image URL, and active state.
- `orders` stores customer orders assigned to one merchant with status, notes, subtotal, and timestamps.
- `order_items` stores order line snapshots. A trigger validates the product and copies product name, brand, price, and unit at insert time. Another trigger recalculates order subtotal from line items.

### RLS Overview

RLS is enabled on all app tables. Customers can read and update only their own profile, read categories and active products, create their own orders, and read their own orders and order items. Merchant owners can read and update their merchant record, manage products for their own merchant, read orders assigned to their merchant, and update only the `status` column on those orders.

Order status transitions are enforced by a database trigger:

- `pending -> processing`
- `processing -> on_the_way`
- `on_the_way -> delivered`
- `pending -> cancelled`

Delivered and cancelled orders cannot be changed. The migration also uses column-level grants so authenticated clients cannot update protected fields such as profile role, order subtotal, order ownership, or order item snapshots.

### Mock App Mapping

- `useAuthStore` maps to `profiles` plus Supabase Auth.
- `useProductStore` maps to `categories` and `products`.
- `useCartStore` stays local at first; it becomes the client-side draft used to create `orders` and `order_items`.
- `useOrderStore` maps to `orders` and `order_items`.

### Future Connection Order

Connect authentication and profile loading first, then merchant/profile role routing, then categories/products reads, then merchant product mutations, and finally order creation/status updates. Cart can remain local until the order creation API is wired.

## Products

Products use mock data in `src/features/products/data/mockProducts.ts` and mock mutations in `src/features/products/store/useProductStore.ts`. Customer screens read active products through selectors. Merchant screens filter products by the authenticated user id from `useAuthStore`, not by route params.

## Cart

The cart is customer-only and local/mock for now. `src/features/cart/store/useCartStore.ts` owns item mutations, and selectors calculate totals. Product details add items by looking up products from the product store, preventing inactive products from being added and merging duplicate products by increasing quantity.
