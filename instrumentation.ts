/**
 * Next.js Instrumentation Hook
 * This file is automatically loaded by Next.js when the server starts
 * See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[Instrumentation] Server started');
    console.log('[Instrumentation] Using event-driven Google Sheets sync (no polling)');
    console.log('[Instrumentation] Data will sync automatically when inserted/updated in MongoDB');
  }
}
