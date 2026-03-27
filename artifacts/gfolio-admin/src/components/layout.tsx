import * as React from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, Users, Gift, ArrowRightLeft, 
  Briefcase, Wallet, Bell, BarChart3, Settings, LogOut, Hexagon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "User Management", href: "/users" },
  { icon: Gift, label: "Gifting Operations", href: "/gifts" },
  { icon: ArrowRightLeft, label: "Transactions", href: "/transactions" },
  { 
    icon: Briefcase, label: "Corporate Admin", href: "/corporate/campaigns",
    subItems: [
      { label: "Campaigns", href: "/corporate/campaigns" },
      { label: "Wallet & Budget", href: "/corporate/wallet" },
    ]
  },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 h-screen bg-[#0A0A0A] border-r border-white/5 flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
          <Hexagon className="w-5 h-5 fill-primary" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">Gfolio<span className="text-primary">.</span></span>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.subItems && item.subItems.some(sub => location.startsWith(sub.href)));
          
          return (
            <div key={item.label}>
              <Link 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-white")} />
                {item.label}
              </Link>
              
              {item.subItems && isActive && (
                <div className="ml-9 mt-1 mb-2 space-y-1 border-l border-white/10 pl-2">
                  {item.subItems.map(sub => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={cn(
                        "block px-3 py-2 rounded-lg text-sm transition-colors",
                        location === sub.href ? "text-primary font-medium" : "text-muted-foreground hover:text-white"
                      )}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-white/5 hover:text-white transition-colors cursor-pointer mb-2">
          <Settings className="w-5 h-5" />
          Settings
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-white/5">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin User</p>
            <p className="text-xs text-primary truncate">Super Admin</p>
          </div>
          <button className="text-muted-foreground hover:text-white">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Header({ title }: { title: string }) {
  return (
    <header className="h-20 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30 px-8 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-muted-foreground hover:text-white transition-colors rounded-full hover:bg-white/5">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
        </button>
      </div>
    </header>
  );
}

export function Layout({ children, title }: { children: React.ReactNode, title: string }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header title={title} />
        <main className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
