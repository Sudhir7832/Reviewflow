import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-extrabold tracking-tight mb-8">About ReviewFlow</h1>
        <div className="prose prose-slate max-w-none text-slate-700">
          <p className="text-lg leading-relaxed mb-6">
            ReviewFlow was built to help small and medium businesses take control of their online reputation. We believe that getting 5-star reviews shouldn't be a struggle, and dealing with negative feedback shouldn't happen in public.
          </p>
          <p className="text-lg leading-relaxed mb-6">
            Our mission is simple: intercept bad reviews before they hit Google, and automatically generate glowing AI reviews for your happy customers.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
