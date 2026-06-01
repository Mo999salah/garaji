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
    throw new AuthFlowError('Authentication is not configured yet.');
  }

  return supabase;
}

function createLocalAuthUser(credentials: {
  fullName?: string;
  phone?: string;
  role: UserRole;
  merchantName?: string;
}): AuthUser {
  const fullName = credentials.fullName?.trim() || (
    credentials.role === 'customer' ? 'Demo Customer' : 'Demo Merchant'
  );

  return {
    id: `mock-${credentials.role}-user`,
    role: credentials.role,
    fullName,
    phone: credentials.phone?.trim() || undefined,
    merchantId: credentials.role === 'merchant' ? 'mock-merchant-user' : undefined,
    merchantName:
      credentials.role === 'merchant'
        ? credentials.merchantName?.trim() || 'Qitaa Demo Supply'
        : undefined,
    createdAt: new Date().toISOString(),
  };
}

function getLocalUserForEmail(email: string): AuthUser {
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail.includes('merchant')) {
    return createLocalAuthUser({
      role: 'merchant',
      fullName: 'Demo Merchant',
      merchantName: 'Qitaa Demo Supply',
    });
  }

  return createLocalAuthUser({
    role: 'customer',
    fullName: 'Demo Customer',
  });
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
    return 'Sign up did not complete. Check your email and try again in a few minutes.';
  }

  const normalized = error.message?.toLowerCase() ?? '';
  const code = error.code?.toLowerCase();

  if (
    code === 'invalid_credentials' ||
    normalized.includes('invalid login') ||
    normalized.includes('invalid credentials')
  ) {
    return 'The email or password is incorrect.';
  }

  if (code === 'email_not_confirmed' || normalized.includes('email not confirmed')) {
    return 'Please confirm your email before signing in.';
  }

  if (
    code === 'user_already_exists' ||
    normalized.includes('user already registered') ||
    normalized.includes('already been registered')
  ) {
    return 'An account already exists for this email. Try signing in instead.';
  }

  if (
    error.status === 429 ||
    code === 'over_email_send_rate_limit' ||
    code === 'over_request_rate_limit' ||
    normalized.includes('rate limit') ||
    normalized.includes('too many requests')
  ) {
    return 'Too many signup attempts. Wait 15–60 minutes, or disable email confirmation in Supabase Auth settings while testing.';
  }

  if (
    code === 'validation_failed' ||
    code === 'email_address_invalid' ||
    normalized.includes('invalid format') ||
    normalized.includes('unable to validate email')
  ) {
    return 'Enter a valid email address (for example name@example.com).';
  }

  if (
    code === 'signup_disabled' ||
    normalized.includes('signups not allowed') ||
    normalized.includes('signups are disabled')
  ) {
    return 'New signups are disabled on this Supabase project. Enable signups in Authentication settings.';
  }

  if (
    normalized.includes('error sending confirmation') ||
    normalized.includes('confirmation email') ||
    normalized.includes('smtp')
  ) {
    return 'Could not send the confirmation email. Check Supabase Auth email settings or turn off “Confirm email” for local testing.';
  }

  if (normalized.includes('invalid signup role') || normalized.includes('invalid role')) {
    return 'Choose a valid account type and try again.';
  }

  if (normalized.includes('merchant_name is required')) {
    return 'Enter your merchant name to create a merchant account.';
  }

  if (normalized.includes('database error') || code === 'unexpected_failure') {
    return 'Account setup failed on the server. Ensure Supabase migrations are applied, then try again.';
  }

  if (code === 'weak_password' || normalized.includes('password')) {
    return 'Please choose a stronger password (at least 8 characters).';
  }

  logAuthError('unmapped auth error', error);
  return 'Authentication failed. Please try again.';
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
        error.message === 'Your account profile is not ready yet.' &&
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
    throw new AuthFlowError('We could not load your account profile.');
  }

  if (!profile) {
    throw new AuthFlowError('Your account profile is not ready yet.');
  }

  if (profile.role !== 'customer' && profile.role !== 'merchant') {
    throw new AuthFlowError('Your account role is not supported.');
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
      throw new AuthFlowError('We could not load your merchant account.');
    }

    if (!merchant?.id) {
      throw new AuthFlowError('Your merchant account is not ready yet.');
    }

    merchantId = merchant.id;
    merchantName = merchant.name;
  }

  return {
    id: profile.id,
    role: profile.role,
    fullName: profile.full_name ?? 'Qitaa user',
    phone: profile.phone ?? undefined,
    merchantId,
    merchantName,
    createdAt: profile.created_at,
  };
}

export async function requestPasswordReset(email: string) {
  if (!isSupabaseConfigured) {
    return;
  }

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
    throw new AuthFlowError('We could not restore your session.');
  }

  if (!data.session?.user.id) {
    return null;
  }

  return loadProfileUser(data.session.user.id);
}

export async function signInWithEmail({ email, password }: SignInCredentials) {
  if (!isSupabaseConfigured) {
    if (!password) {
      throw new AuthFlowError('Enter your password.');
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    return getLocalUserForEmail(email);
  }

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
  if (!isSupabaseConfigured) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      user: createLocalAuthUser(credentials),
      needsEmailConfirmation: false,
    };
  }

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
    throw new AuthFlowError('An account already exists for this email. Try signing in instead.');
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
  if (!isSupabaseConfigured) {
    return;
  }

  const client = getSupabaseClient();
  const { error } = await client.auth.signOut();

  if (error) {
    throw new AuthFlowError('We could not sign you out. Please try again.');
  }
}
