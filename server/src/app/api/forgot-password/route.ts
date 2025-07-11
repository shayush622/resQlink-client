import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: await cookies() }
  );

  const { data: user, error } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (error || !user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // Generate a token
  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

  // Store token
  await supabase
    .from("password_resets")
    .insert({ user_id: user.id, token, expires_at: expiresAt.toISOString() })
    .select();

  // Simulate sending email by logging URL
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
  console.log(`[Reset Password] Token generated for ${email}: ${resetUrl}`);

  return NextResponse.json({ message: "Reset link sent" }, { status: 200 });
}
