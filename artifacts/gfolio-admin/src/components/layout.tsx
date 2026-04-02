import * as React from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  ArrowRightLeft,
  Bell,
  BarChart3,
  LogOut,
  Briefcase,
  Wallet,
  LayoutGrid,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { useRole, type Role } from "@/context/role";
import { useAuth } from "@/context/auth";
import { customFetch } from "@workspace/api-client-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const ADMIN_NAV = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "User Management", href: "/users" },
  { icon: ArrowRightLeft, label: "Transactions", href: "/transactions" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
];

const CORPORATE_NAV = [
  { icon: LayoutGrid, label: "Overview", href: "/corporate" },
  { icon: Briefcase, label: "Campaigns", href: "/corporate/campaigns" },
  { icon: Wallet, label: "Wallet & Budget", href: "/corporate/wallet" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
];

const ROLE_HOME: Record<Role, string> = {
  admin: "/",
  corporate: "/corporate",
};

const MOCK_ALERTS = [
  {
    id: "1",
    type: "high_value_transaction",
    message: "Large withdrawal request of Rs 5,00,000 pending approval",
    severity: "warning",
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    type: "failed_transaction",
    message: "Payment gateway integration experienced 5 timeouts",
    severity: "critical",
    timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    type: "kyc_pending",
    message: "127 KYC verifications pending for more than 48 hours",
    severity: "warning",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    type: "settlement",
    message: "Settlement of Rs 23,40,000 is pending beyond SLA",
    severity: "critical",
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
];

const ALERT_ACTIONS: Record<string, string> = {
  high_value_transaction: "Review Transaction",
  failed_transaction: "View Gateway Logs",
  kyc_pending: "Go to KYC Queue",
  settlement: "View Settlement",
};

const ALERT_ROUTES: Record<string, string> = {
  high_value_transaction: "/transactions",
  failed_transaction: "/transactions",
  kyc_pending: "/users",
  settlement: "/transactions",
};

function timeAgo(timestamp: string): string {
  const now = Date.now();
  const past = new Date(timestamp).getTime();
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

export function Sidebar() {
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const { role, unlockRole } = useRole();
  const { logout } = useAuth();

  const navItems = role === "admin" ? ADMIN_NAV : CORPORATE_NAV;

  const userLabel = role === "admin" ? "Super Admin" : "Corp. Admin";
  const userInitials = role === "admin" ? "SA" : "CA";
  const userAvatarStyle =
    role === "admin"
      ? { background: "linear-gradient(135deg, hsl(152,69%,35%), hsl(38,92%,50%))" }
      : { background: "linear-gradient(135deg, hsl(221,70%,50%), hsl(262,70%,55%))" };

  return (
    <div className="w-64 h-screen bg-white border-r border-border flex flex-col fixed left-0 top-0 z-40 shadow-sm">
      <Link href={ROLE_HOME[role]} className="px-6 py-3 flex items-center border-b border-border">
        <div className="h-8 flex items-center justify-start">
          <img src={logo} alt="Gfolio logo" className="h-full w-auto object-contain" />
        </div>
      </Link>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {role === "admin" ? "Admin Portal" : "Corporate Portal"}
        </p>
        {navItems.map((item) => {
          const isActive = item.href === "/" ? location === "/" : location.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive ? "sidebar-active font-semibold" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "flex-shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                )}
                style={{ width: "1.1rem", height: "1.1rem" }}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 mt-auto border-t border-border space-y-1">
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
          <button
            className="text-muted-foreground hover:text-destructive transition-colors"
            onClick={async () => {
              try {
                await customFetch("/auth/logout", { method: "POST" });
              } catch {}
              try {
                localStorage.removeItem("id");
                localStorage.removeItem("user");
              } catch {}
              unlockRole();
              logout();
              navigate("/login", { replace: true });
            }}
            type="button"
            aria-label="Log out"
          >
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
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
            role === "admin"
              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
              : "text-blue-700 bg-blue-50 border-blue-200",
          )}
        >
          {role === "admin" ? "Admin" : "Corporate"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-muted"
              type="button"
              aria-label="Show notifications"
            >
              <Bell className="w-5 h-5" />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: "hsl(38,92%,50%)" }}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[380px] overflow-hidden p-0">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">Mock Alerts</h3>
              <p className="text-xs text-muted-foreground">Recent notifications that need attention.</p>
            </div>
            <div className="max-h-[360px] overflow-y-auto">
              {MOCK_ALERTS.map((alert, index) => {
                const isCritical = alert.severity === "critical";
                const actionLabel = ALERT_ACTIONS[alert.type] ?? "Take Action";
                const route = ALERT_ROUTES[alert.type] ?? "/";

                return (
                  <div
                    key={alert.id}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3",
                      index < MOCK_ALERTS.length - 1 ? "border-b border-border" : "",
                      isCritical ? "bg-red-50/50" : "bg-amber-50/40",
                    )}
                  >
                    <AlertTriangle
                      className={cn("mt-0.5 h-4 w-4 shrink-0", isCritical ? "text-red-500" : "text-amber-500")}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{alert.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{timeAgo(alert.timestamp)}</p>
                    </div>
                    <Link
                      href={route}
                      className={cn(
                        "shrink-0 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap",
                        isCritical
                          ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                          : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
                      )}
                    >
                      {actionLabel} <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}

export function Layout({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <div className="flex-1 ml-64 min-w-0 overflow-x-hidden">
        <Header title={title} />
        <main className="p-5 overflow-x-hidden">
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
