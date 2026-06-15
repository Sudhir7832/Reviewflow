import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error("[STRIPE_WEBHOOK_ERROR]", error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Needs service role to bypass RLS in webhook
  );

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    ) as any;

    if (!session?.metadata?.userId) {
      return new NextResponse("User ID missing from session metadata", { status: 400 });
    }

    const currentPeriodEnd = subscription.current_period_end 
      ? new Date(subscription.current_period_end * 1000).toISOString() 
      : undefined;

    await supabase.from("subscriptions").upsert({
      user_id: session.metadata.userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      plan_id: subscription.items?.data?.[0]?.price?.id,
      status: subscription.status,
      ...(currentPeriodEnd && { current_period_end: currentPeriodEnd }),
    });
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as any;
    const userId = subscription.metadata?.userId;

    if (userId) {
      const currentPeriodEnd = subscription.current_period_end 
        ? new Date(subscription.current_period_end * 1000).toISOString() 
        : undefined;

      await supabase.from("subscriptions").update({
        plan_id: subscription.items?.data?.[0]?.price?.id,
        status: subscription.status,
        ...(currentPeriodEnd && { current_period_end: currentPeriodEnd }),
      }).eq("user_id", userId);
    }
  }

  return new NextResponse(null, { status: 200 });
}
