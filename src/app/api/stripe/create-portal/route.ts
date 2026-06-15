import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (!subscription || !subscription.stripe_customer_id) {
      return new NextResponse("No active subscription found", { status: 404 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/settings?tab=billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("[STRIPE_PORTAL]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
