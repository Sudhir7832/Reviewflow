import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Store, QrCode, BarChart, Settings } from "lucide-react";

export function Sidebar() {
  const routes = [
    { name: "Overview", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Locations", href: "/dashboard/locations", icon: <Store className="w-5 h-5" /> },
    { name: "QR Codes", href: "/dashboard/qr", icon: <QrCode className="w-5 h-5" /> },
    { name: "Analytics", href: "/dashboard/analytics", icon: <BarChart className="w-5 h-5" /> },
    { name: "Settings", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-background border-r flex flex-col h-screen sticky top-0 hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b gap-3">
        <div className="relative w-8 h-8 rounded-md overflow-hidden bg-white shadow-sm flex items-center justify-center">
          <Image src="/logo-v2.png" alt="ReviewFlow Logo" fill className="object-contain" />
        </div>
        <span className="font-bold text-xl tracking-tighter text-slate-900">ReviewFlow</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {routes.map((route) => (
          <Link
            key={route.name}
            href={route.href}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
          >
            {route.icon}
            {route.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
