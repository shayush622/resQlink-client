import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json({ message: 'Token and password are required' }, { status: 400 });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: await cookies() }
  );

  const { data: resetEntry, error } = await supabase
    .from('password_resets')
    .select('user_id, expires_at')
    .eq('token', token)
    .single();

  if (error || !resetEntry) {
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
  }

  if (new Date(resetEntry.expires_at) < new Date()) {
    return NextResponse.json({ message: 'Reset token has expired' }, { status: 400 });
  }
  const hashed = await bcrypt.hash(password, 10);

  const { error: updateError } = await supabase
    .from('users')
    .update({ password: hashed })
    .eq('id', resetEntry.user_id);

  if (updateError) {
    return NextResponse.json({ message: 'Failed to update password' }, { status: 500 });
  }

  await supabase.from('password_resets').delete().eq('token', token);

  return NextResponse.json({ message: 'Password reset successful' }, { status: 200 });
}
