import * as React from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ArrowUpRight, ArrowDownRight, Wallet, Users, ArrowRightLeft, Gift, AlertTriangle, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useGetDashboardMetrics, useGetTransactionTrends, useGetDashboardAlerts } from "@workspace/api-client-react";

// Mocks for demonstration when API fails
const MOCK_METRICS = {
  totalAum: 24500000,
  aumChange: 12.5,
  dailyTransactions: 842,
  transactionChange: 5.2,
  activeUsers: 12450,
  userChange: 8.1,
  giftVolume: 1250000,
  revenue: 450000,
  revenueChange: 15.4,
  pendingKyc: 45,
  failedTransactions: 12,
  unclaimedGifts: 89,
  settlementPending: 250000
};

const MOCK_ALERTS = [
  { id: "1", type: "high_value_transaction", message: "Large withdrawal request of ₹5,00,000 pending approval", severity: "warning", timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), resolved: false },
  { id: "2", type: "failed_transaction", message: "Payment gateway integration experienced 5 timeouts", severity: "critical", timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(), resolved: false },
  { id: "3", type: "kyc_pending", message: "127 KYC verifications pending for more than 48 hours", severity: "warning", timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), resolved: false },
  { id: "4", type: "settlement", message: "Settlement of ₹23,40,000 is pending beyond SLA", severity: "critical", timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), resolved: false },
];

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

const MOCK_TRENDS = [
  { date: 'Mon', transactions: 120, volume: 4000 },
  { date: 'Tue', transactions: 150, volume: 5500 },
  { date: 'Wed', transactions: 180, volume: 7000 },
  { date: 'Thu', transactions: 140, volume: 4800 },
  { date: 'Fri', transactions: 200, volume: 8500 },
  { date: 'Sat', transactions: 250, volume: 11000 },
  { date: 'Sun', transactions: 210, volume: 9200 },
];

const ASSET_SPLIT = [
  { name: 'Gold ETF', value: 45 },
  { name: 'Nifty Index', value: 25 },
  { name: 'Silver ETF', value: 18 },
  { name: 'Sov Gold Bond', value: 12 },
];
const COLORS = ['#F59E0B', '#16a34a', '#86efac', '#fcd34d'];

export default function Dashboard() {
  const { data: metricsData, isError: metricsError } = useGetDashboardMetrics();
  const { data: trendsData, isError: trendsError } = useGetTransactionTrends();
  const { data: alertsData, isError: alertsError } = useGetDashboardAlerts();

  const metrics = (metricsData && !metricsError) ? metricsData : MOCK_METRICS;
  const trends = (trendsData && !trendsError) ? trendsData : MOCK_TRENDS;
  const alerts = (alertsData && !alertsError) ? alertsData : MOCK_ALERTS;

  return (
    <Layout title="Dashboard Overview">
      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="mb-8 rounded-2xl border border-destructive/20 overflow-hidden bg-white shadow-sm">
          {alerts.map((alert, i) => {
            const isCritical = alert.severity === "critical";
            const actionLabel = ALERT_ACTIONS[alert.type] ?? "Take Action";
            const route = ALERT_ROUTES[alert.type] ?? "/";
            return (
              <div
                key={alert.id}
                className={`flex items-center gap-3 px-4 py-3 ${i < alerts.length - 1 ? "border-b border-destructive/10" : ""} ${isCritical ? "bg-red-50/60" : "bg-amber-50/50"} group`}
              >
                <AlertTriangle className={`w-4 h-4 shrink-0 ${isCritical ? "text-red-500" : "text-amber-500"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(alert.timestamp)}</p>
                </div>
                <a
                  href={route}
                  className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all whitespace-nowrap
                    ${isCritical
                      ? "text-red-600 border-red-200 bg-red-50 hover:bg-red-100"
                      : "text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100"
                    }`}
                >
                  {actionLabel} <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Total AUM" 
          value={formatCurrency(metrics.totalAum)} 
          change={metrics.aumChange} 
          icon={Wallet} 
        />
        <MetricCard 
          title="Active Users" 
          value={metrics.activeUsers.toLocaleString()} 
          change={metrics.userChange} 
          icon={Users} 
        />
        <MetricCard 
          title="Daily Transactions" 
          value={metrics.dailyTransactions.toLocaleString()} 
          change={metrics.transactionChange} 
          icon={ArrowRightLeft} 
        />
        <MetricCard 
          title="Revenue" 
          value={formatCurrency(metrics.revenue)} 
          change={metrics.revenueChange} 
          icon={Gift} 
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transaction Trends</CardTitle>
            <select className="bg-transparent border border-border rounded-lg text-sm px-2 py-1 text-foreground outline-none">
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    itemStyle={{ color: '#111827' }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#16a34a" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Split</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[300px]">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={ASSET_SPLIT}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {ASSET_SPLIT.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  itemStyle={{ color: '#111827' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-4">
              {ASSET_SPLIT.map((asset, i) => (
                <div key={asset.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-sm text-foreground">{asset.name} ({asset.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actionable Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ActionCard title="Pending KYC" value={metrics.pendingKyc} />
        <ActionCard title="Failed Txns" value={metrics.failedTransactions} />
        <ActionCard title="Unclaimed Gifts" value={metrics.unclaimedGifts} />
        <ActionCard title="Pending Settlement" value={formatCurrency(metrics.settlementPending)} />
      </div>
    </Layout>
  );
}

function MetricCard({ title, value, change, icon: Icon }: any) {
  const isPositive = change >= 0;
  return (
    <Card className="hover:border-primary/50 transition-colors duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Icon className="w-6 h-6" />
          </div>
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(change)}%
          </div>
        </div>
        <p className="text-muted-foreground text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-foreground tracking-tight">{value}</h3>
      </CardContent>
    </Card>
  );
}

function ActionCard({ title, value }: any) {
  return (
    <Card className="bg-gradient-to-br from-card to-background border-border">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary/10 hover:text-primary hover:border-primary/40 cursor-pointer transition-all text-muted-foreground">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </CardContent>
    </Card>
  );
}
