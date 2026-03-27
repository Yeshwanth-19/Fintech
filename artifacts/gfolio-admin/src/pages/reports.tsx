import * as React from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { DownloadCloud, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { useGetDistributionReport, useGetRedemptionReport } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/utils";

const MOCK_DIST_REPORT = {
  totalGifts: 15420,
  totalValue: 125000000,
  byMonth: [
    { date: 'Sep', gifts: 1200 },
    { date: 'Oct', gifts: 2500 },
    { date: 'Nov', gifts: 5500 },
    { date: 'Dec', gifts: 3200 },
    { date: 'Jan', gifts: 1800 },
    { date: 'Feb', gifts: 1220 },
  ],
  byStatus: [],
  byAsset: []
};

export default function Reports() {
  const { data: distData, isError: distErr } = useGetDistributionReport();
  const { data: redData } = useGetRedemptionReport();

  const dist = (distData && !distErr) ? distData : MOCK_DIST_REPORT;

  return (
    <Layout title="Analytics & Reports">
      <div className="flex justify-end mb-6">
        <Button className="gap-2">
          <DownloadCloud className="w-4 h-4" /> Export CSV Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <TrendingUp className="w-6 h-6" />
              <h3 className="font-semibold">Total Value Distributed</h3>
            </div>
            <p className="text-4xl font-bold text-white tracking-tight">{formatCurrency(dist.totalValue)}</p>
            <p className="text-sm text-muted-foreground mt-2">Across {dist.totalGifts.toLocaleString()} gifts total</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-500/10 to-background border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4 text-emerald-500">
              <TrendingUp className="w-6 h-6" />
              <h3 className="font-semibold">Average Redemption Rate</h3>
            </div>
            <p className="text-4xl font-bold text-white tracking-tight">84.5%</p>
            <p className="text-sm text-muted-foreground mt-2">Time to redeem: ~2.4 days average</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gifting Volume by Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dist.byMonth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#ffffff50" tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff50" tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#151A21', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="gifts" name="Gifts Distributed" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
