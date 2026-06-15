import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-muted py-12 border-t">
      <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src="/logo-v2.png" alt="ReppulseAI Logo" className="h-14 w-auto rounded-md object-contain" />
          </div>
          <p className="text-muted-foreground text-sm">
            AI-powered review generation and QR code management for modern businesses.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="#features">Features</Link></li>
            <li><Link href="#pricing">Pricing</Link></li>
            <li><Link href="#demo">Demo</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} ReppulseAI. All rights reserved.
      </div>
    </footer>
  );
}
