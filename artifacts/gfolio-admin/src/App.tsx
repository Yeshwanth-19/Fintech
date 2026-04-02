import * as React from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider } from "@/context/role";
import { useRole } from "@/context/role";
import { AuthProvider, useAuth } from "@/context/auth";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/dashboard";
import CorporateDashboard from "@/pages/corporate-dashboard";
import Login from "@/pages/login";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import UsersList from "@/pages/users";
import UserDetail from "@/pages/user-detail";
import GiftsList from "@/pages/gifts";
import TransactionsList from "@/pages/transactions";
import CampaignsList from "@/pages/campaigns";
import CorporateWallet from "@/pages/wallet";
import NotificationsList from "@/pages/notifications";
import Reports from "@/pages/reports";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  React.useEffect(() => {
    if (!isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/users" component={() => <ProtectedRoute component={UsersList} />} />
      <Route path="/users/:id" component={() => <ProtectedRoute component={UserDetail} />} />
      <Route path="/gifts" component={() => <ProtectedRoute component={GiftsList} />} />
      <Route path="/transactions" component={() => <ProtectedRoute component={TransactionsList} />} />
      <Route path="/corporate" component={() => <ProtectedRoute component={CorporateDashboard} />} />
      <Route path="/corporate/campaigns" component={() => <ProtectedRoute component={CampaignsList} />} />
      <Route path="/corporate/wallet" component={() => <ProtectedRoute component={CorporateWallet} />} />
      <Route path="/notifications" component={() => <ProtectedRoute component={NotificationsList} />} />
      <Route path="/reports" component={() => <ProtectedRoute component={Reports} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function UnauthorizedHandler() {
  const { logout } = useAuth();
  const { unlockRole } = useRole();
  const [, navigate] = useLocation();

  React.useEffect(() => {
    const handleUnauthorized = () => {
      try {
        sessionStorage.removeItem("gfolio-admin:selected-user");
      } catch {}
      unlockRole();
      logout();
      navigate("/login", { replace: true });
    };

    window.addEventListener("gfolio:unauthorized", handleUnauthorized as EventListener);
    return () =>
      window.removeEventListener("gfolio:unauthorized", handleUnauthorized as EventListener);
  }, [logout, navigate, unlockRole]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <RoleProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <UnauthorizedHandler />
              <Router />
            </WouterRouter>
          </RoleProvider>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
