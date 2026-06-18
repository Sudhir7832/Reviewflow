"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Star, ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden bg-white">
      {/* SaaS Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      {/* Primary Glowing Orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-[120px] -z-10" />

      <div className="container relative mx-auto px-4 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold shadow-sm">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="uppercase tracking-wider">AI-Powered Google Reviews</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-sm font-bold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="uppercase tracking-wider">100% Google Policy Compliant</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Turn happy customers into{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70 drop-shadow-sm">
              5-star reviews
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Generate branded QR codes for your storefront. Customers scan, AI writes the perfect review, and your Google ranking skyrockets.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/signup">
              <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:-translate-y-1">
                Start for free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/dashboard/qr">
              <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all hover:-translate-y-1">
                View Live Demo
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
