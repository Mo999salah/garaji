export function createClientId(prefix = 'id') {
 if (typeof globalThis.crypto?.randomUUID === 'function') {
 return globalThis.crypto.randomUUID();
 }

 return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
