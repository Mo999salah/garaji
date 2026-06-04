-- Base catalog categories required for merchant product creation.

insert into public.categories (id, name, sort_order)
values
  ('00000000-0000-0000-0000-000000000101', 'Brakes', 10),
  ('00000000-0000-0000-0000-000000000102', 'Filters', 20),
  ('00000000-0000-0000-0000-000000000103', 'Engine', 30),
  ('00000000-0000-0000-0000-000000000104', 'Electrical', 40),
  ('00000000-0000-0000-0000-000000000105', 'Suspension', 50)
on conflict (id) do update
set
  name = excluded.name,
  sort_order = excluded.sort_order;
