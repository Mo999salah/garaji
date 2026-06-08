-- Allow merchant staff to create and update maintenance plans for customer vehicles.

create policy "maintenance_plans_insert_staff" on public.vehicle_maintenance_plans
  for insert to authenticated
  with check (
    public.is_staff()
    and exists (
      select 1
      from public.vehicles v
      where v.id = vehicle_id
        and v.owner_id = customer_id
    )
  );

create policy "maintenance_plans_update_staff" on public.vehicle_maintenance_plans
  for update to authenticated
  using (public.is_staff())
  with check (
    public.is_staff()
    and exists (
      select 1
      from public.vehicles v
      where v.id = vehicle_id
        and v.owner_id = customer_id
    )
  );
