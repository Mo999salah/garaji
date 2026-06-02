import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const checks = [];

function readText(path) {
  return readFileSync(join(root, path), 'utf8');
}

function pass(name) {
  checks.push({ name, ok: true });
}

function fail(name, detail) {
  checks.push({ name, ok: false, detail });
}

function assertFile(path) {
  if (existsSync(join(root, path))) {
    pass(`${path} exists`);
    return true;
  }

  fail(`${path} exists`, 'Required release file is missing.');
  return false;
}

function assertContains(path, pattern, name) {
  const text = readText(path);
  const ok = pattern instanceof RegExp ? pattern.test(text) : text.includes(pattern);

  if (ok) {
    pass(name);
    return;
  }

  fail(name, `${path} does not contain ${String(pattern)}.`);
}

function assertPackageScript(scriptName) {
  const packageJson = JSON.parse(readText('package.json'));

  if (packageJson.scripts?.[scriptName]) {
    pass(`package script ${scriptName}`);
    return;
  }

  fail(`package script ${scriptName}`, `Missing npm script: ${scriptName}.`);
}

function assertEnvExample() {
  if (!assertFile('.env.example')) {
    return;
  }

  const text = readText('.env.example');
  const requiredKeys = ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY'];

  for (const key of requiredKeys) {
    if (new RegExp(`^${key}=\\s*$`, 'm').test(text)) {
      pass(`.env.example documents ${key}`);
    } else {
      fail(`.env.example documents ${key}`, 'Keep public Supabase keys documented but empty.');
    }
  }
}

function assertMigrations() {
  const migrationsDir = join(root, 'supabase', 'migrations');

  if (!existsSync(migrationsDir)) {
    fail('supabase migrations exist', 'supabase/migrations is missing.');
    return;
  }

  const migrations = readdirSync(migrationsDir).filter((name) => name.endsWith('.sql')).sort();

  if (migrations.length >= 3) {
    pass('supabase migrations are present');
  } else {
    fail('supabase migrations are present', 'Expected the base schema plus car-services migrations.');
  }

  const migrationText = migrations
    .map((name) => readText(join('supabase', 'migrations', name)))
    .join('\n');

  const requiredPatterns = [
    [/alter table public\.profiles\s+enable row level security/i, 'profiles RLS is enabled'],
    [/alter table public\.vehicles\s+enable row level security/i, 'vehicles RLS is enabled'],
    [/alter table public\.service_requests\s+enable row level security/i, 'service_requests RLS is enabled'],
    [/alter table public\.services\s+enable row level security/i, 'services RLS is enabled'],
    [/alter table public\.branches\s+enable row level security/i, 'branches RLS is enabled'],
    [/create or replace function public\.create_service_request/i, 'create_service_request RPC exists'],
    [/create or replace function public\.update_service_request_status/i, 'update_service_request_status RPC exists'],
    [/revoke insert on public\.service_requests from authenticated/i, 'direct service_request inserts are revoked'],
    [/create or replace function public\.is_staff/i, 'is_staff helper function exists'],
    [/grant execute on function public\.create_service_request/i, 'create_service_request execution is granted'],
    [/grant execute on function public\.update_service_request_status/i, 'update_service_request_status execution is granted'],
  ];

  for (const [pattern, name] of requiredPatterns) {
    if (pattern.test(migrationText)) {
      pass(name);
    } else {
      fail(name, `Missing migration pattern: ${pattern}.`);
    }
  }
}

function assertExpoConfig() {
  if (!assertFile('app.json')) {
    return;
  }

  assertContains('app.json', /"scheme":\s*"qitaa"/, 'deep link scheme is configured');
  assertContains('app.json', /"expo-router"/, 'expo-router plugin is configured');
  assertContains('app.json', /"expo-secure-store"/, 'secure-store plugin is configured');
}

assertEnvExample();
assertMigrations();
assertExpoConfig();
assertPackageScript('typecheck');
assertPackageScript('test');
assertPackageScript('doctor');
assertPackageScript('quality:check');

for (const check of checks) {
  const prefix = check.ok ? 'PASS' : 'FAIL';
  console.log(`${prefix} ${check.name}`);

  if (!check.ok && check.detail) {
    console.log(`  ${check.detail}`);
  }
}

const failures = checks.filter((check) => !check.ok);

if (failures.length) {
  console.error(`Release readiness failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log(`Release readiness passed with ${checks.length} checks.`);
