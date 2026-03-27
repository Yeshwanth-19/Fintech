import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/dashboard";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/users" component={UsersList} />
      <Route path="/users/:id" component={UserDetail} />
      <Route path="/gifts" component={GiftsList} />
      <Route path="/transactions" component={TransactionsList} />
      <Route path="/corporate">{() => { window.location.replace("/corporate/campaigns"); return null; }}</Route>
      <Route path="/corporate/campaigns" component={CampaignsList} />
      <Route path="/corporate/wallet" component={CorporateWallet} />
      <Route path="/notifications" component={NotificationsList} />
      <Route path="/reports" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
