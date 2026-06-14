"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Menu, User, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

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
    <header className="h-16 bg-background border-b flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden">
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
    </header>
  );
}
