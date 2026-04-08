import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: 'sb-therapist-auth-token',
        domain: 'localhost',
        path: '/',
        sameSite: 'lax',
        secure: false
      }
    }
  )
}
