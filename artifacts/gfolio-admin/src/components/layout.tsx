import * as React from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, Gift, ArrowRightLeft,
  Bell, BarChart3, Settings, LogOut, Leaf,
  Briefcase, Wallet, LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole, type Role } from "@/context/role";

const ADMIN_NAV = [
  { icon: LayoutDashboard, label: "Dashboard",          href: "/" },
  { icon: Users,           label: "User Management",    href: "/users" },
  { icon: Gift,            label: "Gifting Operations", href: "/gifts" },
  { icon: ArrowRightLeft,  label: "Transactions",       href: "/transactions" },
  { icon: Bell,            label: "Notifications",      href: "/notifications" },
  { icon: BarChart3,       label: "Reports",            href: "/reports" },
];

const CORPORATE_NAV = [
  { icon: LayoutGrid,  label: "Overview",       href: "/corporate" },
  { icon: Briefcase,   label: "Campaigns",      href: "/corporate/campaigns" },
  { icon: Wallet,      label: "Wallet & Budget", href: "/corporate/wallet" },
  { icon: Bell,        label: "Notifications",  href: "/notifications" },
];

const ROLE_HOME: Record<Role, string> = {
  admin:     "/",
  corporate: "/corporate",
};

function RoleToggle() {
  const { role, setRole } = useRole();
  const [, navigate] = useLocation();

  function switchRole(r: Role) {
    setRole(r);
    navigate(ROLE_HOME[r]);
  }

  return (
    <div className="mx-3 mb-3 p-1 rounded-xl bg-muted border border-border flex text-xs font-semibold select-none">
      <button
        onClick={() => switchRole("admin")}
        className={cn(
          "flex-1 py-1.5 rounded-lg transition-all",
          role === "admin"
            ? "bg-white text-primary shadow-sm border border-border"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Admin
      </button>
      <button
        onClick={() => switchRole("corporate")}
        className={cn(
          "flex-1 py-1.5 rounded-lg transition-all",
          role === "corporate"
            ? "bg-white text-primary shadow-sm border border-border"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Corporate
      </button>
    </div>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const { role } = useRole();

  const navItems = role === "admin" ? ADMIN_NAV : CORPORATE_NAV;

  const userLabel  = role === "admin" ? "Super Admin" : "Corp. Admin";
  const userInitials = role === "admin" ? "SA" : "CA";
  const userAvatarStyle = role === "admin"
    ? { background: "linear-gradient(135deg, hsl(152,69%,35%), hsl(38,92%,50%))" }
    : { background: "linear-gradient(135deg, hsl(221,70%,50%), hsl(262,70%,55%))" };

  return (
    <div className="w-64 h-screen bg-white border-r border-border flex flex-col fixed left-0 top-0 z-40 shadow-sm">
      {/* Logo */}
      <div className="p-6 pb-4 flex items-center gap-3 border-b border-border">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, hsl(152,69%,35%), hsl(152,55%,50%))" }}>
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">
          Gfolio<span style={{ color: "hsl(38,92%,45%)" }}>.</span>
        </span>
      </div>

      {/* Role toggle */}
      <div className="pt-3">
        <p className="px-4 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Role
        </p>
        <RoleToggle />
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {role === "admin" ? "Admin Portal" : "Corporate Portal"}
        </p>
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? location === "/"
              : location.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "sidebar-active font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "flex-shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
                style={{ width: "1.1rem", height: "1.1rem" }}
              />
              {item.label}
            </Link>
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
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={userAvatarStyle}
          >
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {role === "admin" ? "Admin User" : "Corp User"}
            </p>
            <p className="text-xs font-medium truncate" style={{ color: "hsl(152,69%,35%)" }}>
              {userLabel}
            </p>
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
  const { role } = useRole();
  return (
    <header className="h-16 bg-white/90 backdrop-blur-xl border-b border-border sticky top-0 z-30 px-8 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-foreground tracking-tight">{title}</h1>
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
          role === "admin"
            ? "text-emerald-700 bg-emerald-50 border-emerald-200"
            : "text-blue-700 bg-blue-50 border-blue-200"
        )}>
          {role === "admin" ? "Admin" : "Corporate"}
        </span>
      </div>
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

export function Layout({ children, title }: { children: React.ReactNode; title: string }) {
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
