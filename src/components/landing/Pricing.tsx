"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Building2 } from "lucide-react";

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Starter",
      icon: <Zap className="w-6 h-6 text-slate-600" />,
      price: isYearly ? "0" : "0",
      isCustom: false,
      description: "Perfect for single-location businesses.",
      features: [
        "1 Business Location",
        "Unlimited QR Scans",
        "Smart Review Gate (Limit: 5)",
        "Basic Analytics"
      ],
      cta: "Current Plan",
      popular: false,
      buttonVariant: "outline"
    },
    {
      name: "Pro",
      icon: <Crown className="w-7 h-7 text-emerald-600" />,
      price: isYearly ? "239" : "299",
      isCustom: false,
      description: "Supercharge your reviews with AI generation.",
      features: [
        "Up to 5 Business Locations",
        "Unlimited QR Scans",
        "Unlimited Smart Gate",
        "AI Review Generation",
        "Custom Branding"
      ],
      cta: "Upgrade to Pro",
      popular: true,
      buttonVariant: "default"
    },
    {
      name: "Enterprise",
      icon: <Building2 className="w-6 h-6 text-indigo-600" />,
      price: "Custom",
      isCustom: true,
      description: "For agencies managing multiple brands.",
      features: [
        "Unlimited Locations",
        "White-label Dashboard",
        "API Access",
        "Priority Support"
      ],
      cta: "Contact Sales",
      popular: false,
      buttonVariant: "outline"
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-[#F8FAFC]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-xl text-slate-600 mb-8 font-medium">Unlock powerful AI and manage unlimited locations.</p>
          
          <div className="flex items-center justify-center gap-4">
            <span className={`text-lg font-bold ${!isYearly ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
            
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="relative inline-flex h-8 w-16 items-center rounded-full bg-emerald-500 transition-colors focus:outline-none"
            >
              <span 
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isYearly ? 'translate-x-9' : 'translate-x-1'}`} 
              />
            </button>
            
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${isYearly ? 'text-slate-900' : 'text-slate-400'}`}>Yearly</span>
              <span className="bg-emerald-200/60 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">Save 20%</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-8">
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`relative flex flex-col bg-white rounded-[2rem] p-8 sm:p-10 ${
                plan.popular 
                  ? 'border-2 border-emerald-500 shadow-xl scale-105 z-10' 
                  : 'border border-slate-100 shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-5 py-1.5 text-xs font-black tracking-widest uppercase rounded-full shadow-md whitespace-nowrap">
                  MOST POPULAR
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                {plan.icon}
                <h3 className="text-2xl font-serif font-bold text-slate-900">{plan.name}</h3>
              </div>
              
              <p className="text-slate-500 min-h-[48px] mb-8 leading-relaxed">
                {plan.description}
              </p>
              
              <div className="mb-8">
                {plan.isCustom ? (
                  <span className="text-5xl font-serif font-bold text-slate-900">{plan.price}</span>
                ) : (
                  <div className="flex items-baseline text-slate-900">
                    <span className="text-6xl font-serif font-bold">₹{plan.price}</span>
                    <span className="text-slate-500 ml-1 font-medium">/mo</span>
                  </div>
                )}
              </div>
              
              <ul className="space-y-5 mb-10 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3 text-slate-700">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" strokeWidth={3} />
                    <span className="font-medium text-[15px]">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`w-full rounded-full py-6 text-lg font-bold transition-all ${
                  plan.buttonVariant === 'outline' 
                    ? 'bg-white text-slate-900 border-2 border-slate-200 hover:bg-slate-50' 
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
