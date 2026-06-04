import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.106.2';

type ServiceRequestStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

interface ServiceRequestRecord {
  id: string;
  customer_id: string;
  status: ServiceRequestStatus;
}

interface DatabaseWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema?: string;
  record?: Partial<ServiceRequestRecord> | null;
  old_record?: Partial<ServiceRequestRecord> | null;
}

interface ExpoPushResponse {
  data?: unknown;
  errors?: Array<{
    code?: string;
    message?: string;
  }>;
}

const STATUS_MESSAGES: Partial<
  Record<ServiceRequestStatus, { title: string; body: string }>
> = {
  confirmed: {
    title: 'تم تأكيد حجزك 🛠️',
    body: 'يسعدنا إبلاغك بأن مركز الصيانة قد وافق على طلبك وجاهز لاستقبالك.',
  },
  in_progress: {
    title: 'بدأت صيانة سيارتك 👨‍🔧',
    body: 'فريقنا الفني بدأ العمل على سيارتك الآن، وسنوافيك بالتطورات.',
  },
  completed: {
    title: 'سيارتك جاهزة! 🎉',
    body: 'تم الانتهاء من جميع أعمال الصيانة المطلوبة بنجاح. سيارتك جاهزة للاستلام الآن.',
  },
  cancelled: {
    title: 'تم إلغاء الطلب ❌',
    body: 'نعتذر منك، تم إلغاء طلب الصيانة الخاص بك. تواصل مع الدعم للمزيد من التفاصيل.',
  },
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function isServiceRequestStatus(value: unknown): value is ServiceRequestStatus {
  return (
    value === 'pending' ||
    value === 'confirmed' ||
    value === 'in_progress' ||
    value === 'completed' ||
    value === 'cancelled'
  );
}

function readRequiredEnv(name: string): string {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function validateWebhookSecret(request: Request): boolean {
  const configuredSecret = Deno.env.get('STATUS_NOTIFICATION_WEBHOOK_SECRET');

  if (!configuredSecret) {
    return true;
  }

  return request.headers.get('x-webhook-secret') === configuredSecret;
}

serve(async (request) => {
  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Method not allowed' }, 405);
  }

  if (!validateWebhookSecret(request)) {
    return jsonResponse({ ok: false, error: 'Unauthorized webhook request' }, 401);
  }

  try {
    const payload = (await request.json()) as DatabaseWebhookPayload;

    if (payload.type !== 'UPDATE' || payload.table !== 'service_requests') {
      return jsonResponse({
        ok: true,
        skipped: true,
        reason: 'Webhook event is not a service_requests UPDATE.',
      });
    }

    const record = payload.record;

    if (!record?.id || !record.customer_id || !isServiceRequestStatus(record.status)) {
      return jsonResponse(
        {
          ok: false,
          error: 'Webhook payload is missing id, customer_id, or a valid status.',
        },
        400,
      );
    }

    const message = STATUS_MESSAGES[record.status];

    if (!message) {
      console.log(`No notification template for status "${record.status}".`);
      return jsonResponse({
        ok: true,
        skipped: true,
        reason: `No notification template for status "${record.status}".`,
      });
    }

    const supabaseUrl = readRequiredEnv('SUPABASE_URL');
    const serviceRoleKey = readRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('id', record.customer_id)
      .maybeSingle<{ push_token: string | null }>();

    if (profileError) {
      console.error('Failed to load profile push token.', profileError);
      return jsonResponse(
        {
          ok: false,
          error: 'Failed to load profile push token.',
        },
        500,
      );
    }

    if (!profile?.push_token) {
      console.log(`No push token found for customer ${record.customer_id}.`);
      return jsonResponse({
        ok: true,
        skipped: true,
        reason: 'No push token found for customer.',
      });
    }

    const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: profile.push_token,
        title: message.title,
        body: message.body,
        sound: 'default',
        data: {
          requestId: record.id,
        },
      }),
    });

    const expoResult = (await expoResponse.json().catch(() => null)) as
      | ExpoPushResponse
      | null;

    if (!expoResponse.ok || expoResult?.errors?.length) {
      console.error('Expo push request failed.', {
        status: expoResponse.status,
        result: expoResult,
      });
      return jsonResponse(
        {
          ok: false,
          error: 'Expo push request failed.',
          expoStatus: expoResponse.status,
          expoResult,
        },
        502,
      );
    }

    return jsonResponse({
      ok: true,
      requestId: record.id,
      customerId: record.customer_id,
      status: record.status,
      expoResult,
    });
  } catch (error) {
    console.error('Unhandled status notification error.', error);
    return jsonResponse(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unexpected notification error.',
      },
      500,
    );
  }
});
