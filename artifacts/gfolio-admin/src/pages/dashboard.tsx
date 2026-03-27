import * as React from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ArrowUpRight, ArrowDownRight, Wallet, Users, ArrowRightLeft, Gift, AlertTriangle } from "lucide-react";
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
  { id: "1", type: "high_value_transaction", message: "Large withdrawal request of ₹5,00,000 pending approval", severity: "warning", timestamp: "10 mins ago", resolved: false },
  { id: "2", type: "failed_transaction", message: "Payment gateway integration experienced 5 timeouts", severity: "critical", timestamp: "1 hour ago", resolved: false },
];

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
  { name: 'Gold', value: 65 },
  { name: 'Silver', value: 35 },
];
const COLORS = ['#F59E0B', '#9CA3AF'];

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
        <div className="mb-8 space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive-foreground">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{alert.message}</p>
                <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
              </div>
            </div>
          ))}
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
            <select className="bg-transparent border border-white/10 rounded-lg text-sm px-2 py-1 text-white outline-none">
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
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="date" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#151A21', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
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
                  contentStyle={{ backgroundColor: '#151A21', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-4">
              {ASSET_SPLIT.map((asset, i) => (
                <div key={asset.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-sm text-white">{asset.name} ({asset.value}%)</span>
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
          <div className="p-3 rounded-xl bg-white/5 text-primary">
            <Icon className="w-6 h-6" />
          </div>
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(change)}%
          </div>
        </div>
        <p className="text-muted-foreground text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
      </CardContent>
    </Card>
  );
}

function ActionCard({ title, value }: any) {
  return (
    <Card className="bg-gradient-to-br from-card to-background border-white/5">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-xl font-bold text-white">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:text-primary hover:border-primary/50 cursor-pointer transition-all">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </CardContent>
    </Card>
  );
}
