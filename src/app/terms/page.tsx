import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-extrabold tracking-tight mb-8">Terms of Service</h1>
        <div className="prose prose-slate max-w-none text-slate-700 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <h2 className="text-2xl font-bold mt-8">1. Acceptance of Terms</h2>
          <p>By using ReviewFlow, you agree to these terms. If you do not agree, please do not use our service.</p>
          <h2 className="text-2xl font-bold mt-8">2. Service Usage Limits</h2>
          <p>Free plans are strictly limited to the quotas defined on our pricing page. Any attempt to bypass these limits may result in account termination.</p>
          <h2 className="text-2xl font-bold mt-8">3. Content Responsibility</h2>
          <p>You are responsible for ensuring the Google Review URLs you provide are accurate and belong to your business.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
