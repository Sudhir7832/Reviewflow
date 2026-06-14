"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Menu, User, LogOut, X, LayoutDashboard, Store, QrCode, BarChart, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export function Header() {
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const supabase = createClient();

  const routes = [
    { name: "Overview", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Locations", href: "/dashboard/locations", icon: <Store className="w-5 h-5" /> },
    { name: "QR Codes", href: "/dashboard/qr", icon: <QrCode className="w-5 h-5" /> },
    { name: "Analytics", href: "/dashboard/analytics", icon: <BarChart className="w-5 h-5" /> },
    { name: "Settings", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUser(user);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };
  return (
    <header className="h-16 bg-background border-b flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2 md:hidden">
          <img src="/logo-v2.png" alt="ReviewFlow Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-xl tracking-tighter text-slate-900">ReviewFlow</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" />
        </Button>
        
        {user ? (
          <div className="flex items-center gap-3">
            {user.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Profile" 
                className="w-8 h-8 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Log Out" className="text-muted-foreground hover:text-rose-500">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="icon" className="rounded-full bg-muted">
            <User className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden flex flex-col">
          <div className="h-16 flex items-center justify-between px-6 border-b">
            <div className="flex items-center gap-2">
              <img src="/logo-v2.png" alt="ReviewFlow Logo" className="w-8 h-8 object-contain" />
              <span className="font-bold text-xl tracking-tighter text-slate-900">ReviewFlow</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="w-6 h-6" />
            </Button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {routes.map((route) => (
              <Link
                key={route.name}
                href={route.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-4 rounded-md text-base font-medium hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
              >
                {route.icon}
                {route.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
