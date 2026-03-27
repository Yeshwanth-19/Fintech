import * as React from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, Users, Gift, ArrowRightLeft, 
  Briefcase, Bell, BarChart3, Settings, LogOut, Leaf
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="w-64 h-screen bg-white border-r border-border flex flex-col fixed left-0 top-0 z-40 shadow-sm">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-border">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, hsl(152,69%,35%), hsl(152,55%,50%))" }}>
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">
          Gfolio<span style={{ color: "hsl(38,92%,45%)" }}>.</span>
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.subItems && item.subItems.some(sub => location.startsWith(sub.href)));
          
          return (
            <div key={item.label}>
              <Link 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive 
                    ? "sidebar-active font-semibold" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-4.5 h-4.5 flex-shrink-0",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )} style={{ width: "1.1rem", height: "1.1rem" }} />
                {item.label}
              </Link>
              
              {item.subItems && isActive && (
                <div className="ml-9 mt-1 mb-2 space-y-0.5 border-l-2 pl-3"
                  style={{ borderColor: "hsl(152,69%,35%,0.25)" }}>
                  {item.subItems.map(sub => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={cn(
                        "block px-3 py-1.5 rounded-lg text-sm transition-colors",
                        location === sub.href
                          ? "text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
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

      <div className="p-3 mt-auto border-t border-border space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        
        <div className="flex items-center gap-3 p-3 bg-muted rounded-xl border border-border">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, hsl(152,69%,35%), hsl(38,92%,50%))" }}>
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">Admin User</p>
            <p className="text-xs font-medium truncate" style={{ color: "hsl(152,69%,35%)" }}>Super Admin</p>
          </div>
          <button className="text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Header({ title }: { title: string }) {
  return (
    <header className="h-16 bg-white/90 backdrop-blur-xl border-b border-border sticky top-0 z-30 px-8 flex items-center justify-between shadow-sm">
      <h1 className="text-xl font-bold text-foreground tracking-tight">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-muted">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: "hsl(38,92%,50%)" }} />
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
