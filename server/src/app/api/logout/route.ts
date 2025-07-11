import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: await cookies(),
    }
  );

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }

  const response = NextResponse.redirect(new URL('/login', req.url));
  return response;
}
