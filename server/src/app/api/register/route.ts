
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  console.log("📩 POST /api/register triggered");

  try {
    const body = await req.json();
    console.log('Received body:', body);
    
    const { email, password } = body;

    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

    console.log('Supabase env:', supabaseUrl, !!supabaseServiceKey);

    if (!supabaseUrl || !supabaseServiceKey) {
      console.log('Missing Supabase credentials');
      return NextResponse.json({ message: 'Server misconfiguration' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: allUsers, error: allErr } = await supabase.from('users').select('*');
console.log('Can I even read users table?', allUsers, allErr);

    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    console.log('Existing user:', existingUser, 'Error:', fetchError);

    if (fetchError) {
      return NextResponse.json({ message: 'Failed to check user' }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password:', hashedPassword);

    const { error: insertError } = await supabase.from('users').insert({
      email,
      password: hashedPassword,
      role: 'public',
    });

    console.log('Insert error:', insertError);

    if (insertError) {
      return NextResponse.json({ message: 'Failed to register user' }, { status: 500 });
    }

    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
