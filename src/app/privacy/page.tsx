import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-extrabold tracking-tight mb-8">Privacy Policy</h1>
        <div className="prose prose-slate max-w-none text-slate-700 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <h2 className="text-2xl font-bold mt-8">1. Information We Collect</h2>
          <p>We collect basic business information (name, address, Google URL) to generate your QR codes and dashboard.</p>
          <h2 className="text-2xl font-bold mt-8">2. How We Use Your Data</h2>
          <p>We use this data exclusively to provide the ReviewFlow service. We never sell your data to third parties.</p>
          <h2 className="text-2xl font-bold mt-8">3. Customer Feedback</h2>
          <p>Private feedback intercepted by our Smart Gate is stored securely and only accessible by the business owner via their dashboard.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
