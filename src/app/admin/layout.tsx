"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Lock, LayoutDashboard, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Basic session persistence for the MVP admin gate
    const auth = sessionStorage.getItem("admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  if (!mounted) {
    return null; // Prevents hydration mismatch from browser extensions injecting attributes
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Using a simple hardcoded master password for the MVP
    if (password === "admin123") {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_auth", "true");
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-2">Admin Access</h1>
          <p className="text-slate-400 text-center text-sm mb-8">Enter the master password to access the platform controls.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 h-12"
              />
              {error && <p className="text-rose-400 text-sm mt-2">{error}</p>}
            </div>
            <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
              Authenticate
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const routes = [
    { name: "Overview", href: "/admin", icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "Owners & Businesses", href: "/admin/businesses", icon: <Users className="w-4 h-4" /> },
    { name: "Platform Settings", href: "/admin/settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="relative w-8 h-8 rounded-md overflow-hidden bg-white shadow-sm flex items-center justify-center">
            <Image src="/logo-v2.png" alt="ReviewFlow Logo" fill className="object-contain" />
          </div>
          <span className="font-bold text-xl tracking-tighter text-white">Super Admin</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          <div className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu</div>
          {routes.map((route) => {
            const isActive = pathname === route.href;
            return (
              <Link
                key={route.name}
                href={route.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                {route.icon}
                {route.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={() => {
              sessionStorage.removeItem("admin_auth");
              setIsAuthenticated(false);
            }}
          >
            <Lock className="w-4 h-4 mr-2" /> Lock Dashboard
          </Button>
        </div>
      </aside>

      {/* Admin Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center px-6 sticky top-0 z-10 md:hidden">
          <div className="font-bold text-xl text-white">Super Admin</div>
        </header>
        <main className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
