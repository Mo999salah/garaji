import { isSupabaseConfigured, supabase } from '@/shared/lib/supabase';
import type { AuthUser, UserRole } from '@/shared/types/auth';

interface ProfileRow {
 id: string;
 full_name: string | null;
 phone: string | null;
 role: UserRole;
 created_at: string;
}

interface MerchantRow {
 id: string;
 name: string;
}

export interface SignInCredentials {
 email: string;
 password: string;
}

export interface SignUpCredentials extends SignInCredentials {
 fullName: string;
 phone?: string;
 role: UserRole;
 merchantName?: string;
 region?: string;
}

export interface SignUpResult {
 user: AuthUser | null;
 needsEmailConfirmation: boolean;
}

export class AuthFlowError extends Error {
 constructor(message: string) {
 super(message);
 this.name = 'AuthFlowError';
 }
}

function getSupabaseClient() {
 if (!isSupabaseConfigured || !supabase) {
 throw new AuthFlowError('لم يتم إعداد المصادقة بعد.');
 }

 return supabase;
}

interface SupabaseAuthErrorDetails {
 code?: string;
 message?: string;
 status?: number;
}

function logAuthError(context: string, error?: SupabaseAuthErrorDetails | null) {
 if (!__DEV__ || !error) {
 return;
 }

 console.warn(`[auth] ${context}`, {
 code: error.code,
 message: error.message,
 status: error.status,
 });
}

function getSafeAuthErrorMessage(error?: SupabaseAuthErrorDetails | null) {
 if (!error) {
 return 'لم يكتمل إنشاء الحساب. تحقق من بريدك وحاول مرة أخرى بعد قليل.';
 }

 const normalized = error.message?.toLowerCase() ?? '';
 const code = error.code?.toLowerCase();

 if (
 code === 'invalid_credentials' ||
 normalized.includes('invalid login') ||
 normalized.includes('invalid credentials')
 ) {
 return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
 }

 if (code === 'email_not_confirmed' || normalized.includes('email not confirmed')) {
 return 'يرجى تأكيد البريد الإلكتروني قبل تسجيل الدخول.';
 }

 if (
 code === 'user_already_exists' ||
 normalized.includes('user already registered') ||
 normalized.includes('already been registered')
 ) {
 return 'يوجد حساب بهذا البريد. جرّب تسجيل الدخول بدلاً من ذلك.';
 }

 if (
 error.status === 429 ||
 code === 'over_email_send_rate_limit' ||
 code === 'over_request_rate_limit' ||
 normalized.includes('rate limit') ||
 normalized.includes('too many requests')
 ) {
 return 'هناك محاولات كثيرة. انتظر من 15 إلى 60 دقيقة ثم حاول مرة أخرى.';
 }

 if (
 code === 'validation_failed' ||
 code === 'email_address_invalid' ||
 normalized.includes('invalid format') ||
 normalized.includes('unable to validate email')
 ) {
 return 'أدخل بريداً إلكترونياً صحيحاً مثل name@example.com.';
 }

 if (
 code === 'signup_disabled' ||
 normalized.includes('signups not allowed') ||
 normalized.includes('signups are disabled')
 ) {
 return 'إنشاء الحسابات متوقف حالياً في إعدادات Supabase.';
 }

 if (
 normalized.includes('error sending confirmation') ||
 normalized.includes('confirmation email') ||
 normalized.includes('smtp')
 ) {
 return 'تعذّر إرسال رسالة التأكيد. تحقق من إعدادات البريد في Supabase.';
 }

 if (normalized.includes('invalid signup role') || normalized.includes('invalid role')) {
 return 'اختر نوع حساب صحيحاً ثم حاول مرة أخرى.';
 }

 if (normalized.includes('merchant_name is required')) {
 return 'أدخل اسم المنشأة لإنشاء حساب تاجر.';
 }

 if (normalized.includes('database error') || code === 'unexpected_failure') {
 return 'تعذّر إعداد الحساب في الخادم. تأكد من تطبيق هجرات Supabase ثم حاول مرة أخرى.';
 }

 if (code === 'weak_password' || normalized.includes('password')) {
 return 'اختر كلمة مرور أقوى، 8 أحرف على الأقل.';
 }

 logAuthError('unmapped auth error', error);
 return 'تعذّرت المصادقة. حاول مرة أخرى.';
}

function isDuplicateSignupUser(user: { identities?: unknown[] | null } | null) {
 return Boolean(user && Array.isArray(user.identities) && user.identities.length === 0);
}

async function loadProfileUserWithRetry(authUserId: string, attempts = 5): Promise<AuthUser> {
 let lastError: unknown;

 for (let attempt = 0; attempt < attempts; attempt += 1) {
 try {
 return await loadProfileUser(authUserId);
 } catch (error) {
 lastError = error;

 if (
 error instanceof AuthFlowError &&
 error.message === 'ملف الحساب غير جاهز بعد.' &&
 attempt < attempts - 1
 ) {
 await new Promise((resolve) => setTimeout(resolve, 400));
 continue;
 }

 throw error;
 }
 }

 throw lastError;
}

async function loadProfileUser(authUserId: string): Promise<AuthUser> {
 const client = getSupabaseClient();
 const { data: profile, error: profileError } = await client
 .from('profiles')
 .select('id, full_name, phone, role, created_at')
 .eq('id', authUserId)
 .maybeSingle<ProfileRow>();

 if (profileError) {
 throw new AuthFlowError('تعذّر تحميل ملف الحساب.');
 }

 if (!profile) {
 throw new AuthFlowError('ملف الحساب غير جاهز بعد.');
 }

 if (profile.role !== 'customer' && profile.role !== 'merchant') {
 throw new AuthFlowError('نوع الحساب غير مدعوم.');
 }

 let merchantId: string | undefined;
 let merchantName: string | undefined;

 if (profile.role === 'merchant') {
 const { data: merchant, error: merchantError } = await client
 .from('merchants')
 .select('id, name')
 .eq('owner_id', profile.id)
 .maybeSingle<MerchantRow>();

 if (merchantError) {
 throw new AuthFlowError('تعذّر تحميل حساب التاجر.');
 }

 if (!merchant?.id) {
 throw new AuthFlowError('حساب التاجر غير جاهز بعد.');
 }

 merchantId = merchant.id;
 merchantName = merchant.name;
 }

 return {
 id: profile.id,
 role: profile.role,
 fullName: profile.full_name ?? 'مستخدم قِطع',
 phone: profile.phone ?? undefined,
 merchantId,
 merchantName,
 createdAt: profile.created_at,
 };
}

export async function requestPasswordReset(email: string) {
 const client = getSupabaseClient();
 const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
 redirectTo: undefined,
 });

 if (error) {
 logAuthError('password reset', error);
 throw new AuthFlowError(getSafeAuthErrorMessage(error));
 }
}

export async function getCurrentAuthUser() {
 if (!isSupabaseConfigured) {
 return null;
 }

 const client = getSupabaseClient();
 const { data, error } = await client.auth.getSession();

 if (error) {
 throw new AuthFlowError('تعذّرت استعادة الجلسة.');
 }

 if (!data.session?.user.id) {
 return null;
 }

 return loadProfileUser(data.session.user.id);
}

export async function signInWithEmail({ email, password }: SignInCredentials) {
 const client = getSupabaseClient();
 const { data, error } = await client.auth.signInWithPassword({
 email: email.trim(),
 password,
 });

 if (error || !data.user?.id) {
 logAuthError('sign in', error);
 throw new AuthFlowError(getSafeAuthErrorMessage(error));
 }

 return loadProfileUserWithRetry(data.user.id);
}

export async function signUpWithEmail(credentials: SignUpCredentials): Promise<SignUpResult> {
 const client = getSupabaseClient();
 const { data, error } = await client.auth.signUp({
 email: credentials.email.trim(),
 password: credentials.password,
 options: {
 data: {
 full_name: credentials.fullName.trim(),
 phone: credentials.phone?.trim() || null,
 role: credentials.role,
 merchant_name:
 credentials.role === 'merchant' ? credentials.merchantName?.trim() || null : null,
 region: credentials.region?.trim() || null,
 },
 },
 });

 if (error) {
 logAuthError('sign up', error);
 throw new AuthFlowError(getSafeAuthErrorMessage(error));
 }

 if (!data.user?.id) {
 throw new AuthFlowError(getSafeAuthErrorMessage(null));
 }

 if (isDuplicateSignupUser(data.user)) {
 throw new AuthFlowError('يوجد حساب بهذا البريد. جرّب تسجيل الدخول بدلاً من ذلك.');
 }

 if (!data.session) {
 return {
 user: null,
 needsEmailConfirmation: true,
 };
 }

 return {
 user: await loadProfileUserWithRetry(data.user.id),
 needsEmailConfirmation: false,
 };
}

export async function signOutSupabase() {
 const client = getSupabaseClient();
 const { error } = await client.auth.signOut();

 if (error) {
 throw new AuthFlowError('تعذّر تسجيل الخروج. حاول مرة أخرى.');
 }
}

export async function saveProfilePushToken(userId: string, pushToken: string): Promise<void> {
 const client = getSupabaseClient();
 const { error } = await client
 .from('profiles')
 .update({
 push_token: pushToken,
 updated_at: new Date().toISOString(),
 })
 .eq('id', userId);

 if (error) {
 logAuthError('save push token', error);
 throw new AuthFlowError('تعذّر حفظ رمز التنبيهات.');
 }
}
