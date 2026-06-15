"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Crown, Zap, Building2, HelpCircle, User, Settings2, CreditCard, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [userEmail, setUserEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
      if (user?.user_metadata?.first_name) setFirstName(user.user_metadata.first_name);
      if (user?.user_metadata?.last_name) setLastName(user.user_metadata.last_name);

      if (user) {
        const { data: sub } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).single();
        if (sub) setSubscription(sub);
      }
    };
    fetchUser();
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await supabase.auth.updateUser({
      data: { first_name: firstName, last_name: lastName }
    });
    setIsSaving(false);
  };

  const handleCheckout = async (priceId: string) => {
    try {
      setIsCheckoutLoading(true);
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handlePortal = async () => {
    try {
      setIsPortalLoading(true);
      const res = await fetch("/api/stripe/create-portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
    } finally {
      setIsPortalLoading(false);
    }
  };

  const [isYearly, setIsYearly] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab) setActiveTab(tab);
  }, []);

  const tabs = [
    { id: "profile", label: "My Profile", icon: <User className="w-4 h-4" /> },
    { id: "defaults", label: "Global Defaults", icon: <Settings2 className="w-4 h-4" /> },
    { id: "billing", label: "Billing & Invoices", icon: <CreditCard className="w-4 h-4" /> },
    { id: "upgrade", label: "Upgrade Plan", icon: <Sparkles className="w-4 h-4" /> },
  ];

  const plans = [
    {
      name: "Starter",
      description: "Perfect for single-location businesses.",
      price: isYearly ? "0" : "0",
      icon: <Zap className="w-5 h-5 text-muted-foreground" />,
      features: ["1 Business Location", "Unlimited QR Scans", "Smart Review Gate (Limit: 5)", "Basic Analytics"],
      cta: "Current Plan",
      popular: false,
      buttonVariant: "outline"
    },
    {
      name: "Pro",
      description: "Supercharge your reviews with AI generation.",
      price: isYearly ? 249 : 299,
      priceId: isYearly ? process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID : process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
      icon: <Crown className="w-5 h-5 text-primary" />,
      features: ["Up to 5 Business Locations", "Unlimited QR Scans", "Unlimited Smart Gate", "AI Review Generation", "Custom Branding"],
      cta: subscription?.status === "active" ? "Current Plan" : "Upgrade to Pro",
      popular: true,
      buttonVariant: "default"
    },
    {
      name: "Enterprise",
      description: "For agencies managing multiple brands.",
      price: "Custom",
      icon: <Building2 className="w-5 h-5 text-indigo-500" />,
      features: ["Unlimited Locations", "White-label Dashboard", "API Access", "Priority Support"],
      cta: "Contact Sales",
      popular: false,
      buttonVariant: "outline"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          Account Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage your profile, preferences, and subscription.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
              }`}
            >
              <div className={`${activeTab === tab.id ? "text-primary" : "text-muted-foreground/70"}`}>
                {tab.icon}
              </div>
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          
          {/* PROFILE SECTION */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <Card className="shadow-sm border-border">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details and contact info.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input type="email" placeholder="Loading..." value={userEmail} disabled className="bg-muted/50" />
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 border-t border-border/50 rounded-b-xl py-4 flex justify-end">
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* DEFAULTS SECTION */}
          {activeTab === "defaults" && (
            <div className="space-y-6">
              <Card className="shadow-sm border-border">
                <CardHeader>
                  <CardTitle>Global Defaults</CardTitle>
                  <CardDescription>Set the default settings for any new locations you create.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4 bg-muted/30 p-5 rounded-xl border border-border/50">
                    <div>
                      <Label className="text-base font-semibold">Default Interception Threshold</Label>
                      <p className="text-xs text-muted-foreground mb-3">Automatically intercept reviews with this many stars or less.</p>
                      <select className="flex h-10 w-full md:w-1/2 rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        <option value="1">1 Star</option>
                        <option value="2">2 Stars and below</option>
                        <option value="3" selected>3 Stars and below</option>
                        <option value="4">4 Stars and below</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4 bg-muted/30 p-5 rounded-xl border border-border/50">
                    <div>
                      <Label className="text-base font-semibold">Default Brand Color</Label>
                      <p className="text-xs text-muted-foreground mb-3">The default color theme for your mobile scan pages.</p>
                      <div className="flex gap-4 items-center">
                        <div className="relative overflow-hidden rounded-full w-12 h-12 shadow-inner border-2 border-border cursor-pointer">
                          <Input type="color" defaultValue="#10b981" className="absolute inset-0 w-20 h-20 -top-4 -left-4 cursor-pointer p-0 border-0" />
                        </div>
                        <span className="font-mono text-sm uppercase text-muted-foreground">#10B981</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 border-t border-border/50 rounded-b-xl py-4 flex justify-end">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">Save Defaults</Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* BILLING SECTION */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <Card className="shadow-sm border-border">
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>Manage your subscription and billing details.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-6 bg-muted/30 rounded-xl border border-border/50 mb-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-foreground">{subscription?.status === "active" ? "Pro Plan" : "Starter Plan"}</h3>
                        <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full">Active</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{subscription?.status === "active" ? "Premium AI features unlocked." : "Free forever. 1 Location limit."}</p>
                    </div>
                    {subscription?.status === "active" ? (
                      <Button onClick={handlePortal} disabled={isPortalLoading} variant="outline">
                        {isPortalLoading ? "Loading..." : "Manage Billing"}
                      </Button>
                    ) : (
                      <Button onClick={() => setActiveTab("upgrade")} className="bg-emerald-600 hover:bg-emerald-700">
                        Upgrade
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Payment Methods</h4>
                    <div className="p-4 border border-border border-dashed rounded-xl text-center text-sm text-muted-foreground">
                      No payment methods on file. Upgrade to a paid plan to add a card.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* UPGRADE SECTION (Pricing) */}
          {activeTab === "upgrade" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h2 className="text-3xl font-black tracking-tight text-foreground">
                  Upgrade your reputation.
                </h2>
                <p className="text-sm text-muted-foreground font-medium">
                  Unlock powerful AI and manage unlimited locations.
                </p>
              </div>

              <div className="flex justify-center items-center gap-3">
                <span className={`text-sm font-semibold ${!isYearly ? "text-foreground" : "text-muted-foreground/70"}`}>Monthly</span>
                <button 
                  onClick={() => setIsYearly(!isYearly)}
                  className="relative inline-flex h-8 w-16 items-center rounded-full bg-emerald-500 transition-colors focus:outline-none"
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-card transition-transform shadow-sm ${isYearly ? "translate-x-9" : "translate-x-1"}`} />
                </button>
                <span className={`text-sm font-semibold flex items-center gap-1.5 ${isYearly ? "text-foreground" : "text-muted-foreground/70"}`}>
                  Yearly 
                  <span className="inline-flex items-center rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">Save 20%</span>
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan, index) => (
                  <motion.div 
                    key={plan.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative flex flex-col rounded-3xl bg-card border-2 shadow-sm ${plan.popular ? "border-emerald-500 shadow-xl shadow-emerald-500/10 scale-105 z-10" : "border-border"}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-0 right-0 flex justify-center">
                        <span className="bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-md">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="p-6 pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        {plan.icon}
                        <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground h-8">{plan.description}</p>
                      
                      <div className="mt-4 flex items-baseline gap-1 h-10">
                        {plan.price === "Custom" ? (
                          <span className="text-3xl font-black text-foreground">Custom</span>
                        ) : (
                          <>
                            <span className="text-3xl font-black text-foreground">₹{plan.price}</span>
                            <span className="text-xs text-muted-foreground font-medium">/mo</span>
                          </>
                        )}
                      </div>
                      {isYearly && plan.price !== "0" && plan.price !== "Custom" && <p className="text-[10px] text-primary font-semibold mt-1">Billed ₹{plan.price === 249 ? 2999 : (plan.price as number) * 12} yearly</p>}
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <ul className="space-y-3 mb-6 flex-1">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span className="text-xs font-medium text-foreground/90">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className="w-full h-12 text-base font-bold" 
                        variant={plan.buttonVariant as any}
                        disabled={isCheckoutLoading || plan.name === "Starter" || plan.cta === "Contact Sales" || subscription?.status === "active"}
                        onClick={() => {
                          if (plan.name === "Pro" && plan.priceId) {
                            handleCheckout(plan.priceId);
                          }
                        }}
                      >
                        {isCheckoutLoading && plan.name === "Pro" ? "Redirecting..." : plan.cta}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
