-- Notify customers through the send-status-notification Edge Function
-- whenever a service request status changes.

create extension if not exists pg_net with schema extensions;

create or replace function public.notify_service_request_status_change()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_function_url text;
  v_webhook_secret text;
  v_headers jsonb;
  v_payload jsonb;
begin
  v_function_url := coalesce(
    nullif(current_setting('app.settings.status_notification_function_url', true), ''),
    'http://localhost:54321/functions/v1/send-status-notification'
  );

  v_webhook_secret := nullif(
    current_setting('app.settings.status_notification_webhook_secret', true),
    ''
  );

  v_headers := jsonb_build_object(
    'Content-Type', 'application/json'
  );

  if v_webhook_secret is not null then
    v_headers := v_headers || jsonb_build_object(
      'x-webhook-secret', v_webhook_secret
    );
  end if;

  v_payload := jsonb_build_object(
    'type', 'UPDATE',
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', to_jsonb(NEW),
    'old_record', to_jsonb(OLD)
  );

  perform net.http_post(
    url := v_function_url,
    headers := v_headers,
    body := v_payload,
    timeout_milliseconds := 5000
  );

  return NEW;
exception
  when others then
    raise warning 'Failed to enqueue service request status notification for request %: %',
      NEW.id,
      SQLERRM;
    return NEW;
end;
$$;

comment on function public.notify_service_request_status_change()
is 'Enqueues a Supabase Edge Function call when service_requests.status changes.';

drop trigger if exists service_requests_status_notification on public.service_requests;

create trigger service_requests_status_notification
  after update on public.service_requests
  for each row
  when (OLD.status is distinct from NEW.status)
  execute function public.notify_service_request_status_change();
