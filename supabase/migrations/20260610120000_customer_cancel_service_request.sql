-- Customer-initiated cancellation for own service requests (pending / confirmed only).

create or replace function public.cancel_service_request(
  p_request_id uuid,
  p_note        text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.service_requests%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into v_request
  from public.service_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Service request not found';
  end if;

  if v_request.customer_id <> auth.uid() then
    raise exception 'Only the request owner can cancel this request';
  end if;

  if v_request.status not in ('pending', 'confirmed') then
    raise exception 'This request cannot be cancelled';
  end if;

  update public.service_requests
  set status = 'cancelled'
  where id = p_request_id;

  insert into public.service_request_events (request_id, status, note)
  values (
    p_request_id,
    'cancelled',
    nullif(btrim(coalesce(p_note, '')), '')
  );

  return p_request_id;
end;
$$;

comment on function public.cancel_service_request is
  'Customer-only: cancels an owned service request while it is still pending or confirmed.';

grant execute on function public.cancel_service_request to authenticated;
