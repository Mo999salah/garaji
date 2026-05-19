-- Optional local seed data for Qitaa.
-- Replace owner_id values after creating demo auth users/profiles.

insert into public.categories (id, name, sort_order)
values
  ('00000000-0000-0000-0000-000000000101', 'Brakes', 10),
  ('00000000-0000-0000-0000-000000000102', 'Filters', 20),
  ('00000000-0000-0000-0000-000000000103', 'Engine', 30),
  ('00000000-0000-0000-0000-000000000104', 'Electrical', 40),
  ('00000000-0000-0000-0000-000000000105', 'Suspension', 50)
on conflict (id) do nothing;

-- Example product seed. This is commented out because it requires a real merchant row.
-- insert into public.products (
--   merchant_id,
--   category_id,
--   name,
--   brand,
--   description,
--   price,
--   unit,
--   is_active
-- )
-- values (
--   '<merchant-id>',
--   '00000000-0000-0000-0000-000000000101',
--   'Ceramic Brake Pad Set',
--   'Akebono',
--   'Low-dust front axle brake pads for high-mileage fleet vehicles.',
--   42.50,
--   'set',
--   true
-- );
