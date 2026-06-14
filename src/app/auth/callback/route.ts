import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch (error) {
              // Ignore in Server Components
            }
          },
        },
      }
    );
    
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Handle Ngrok forwarding headers to prevent localhost redirect issues
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost ? forwardedHost : requestUrl.host;
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const protocol = forwardedProto ? `${forwardedProto}:` : requestUrl.protocol;
  const origin = `${protocol}//${host}`;

  return NextResponse.redirect(`${origin}${next}`);
}
