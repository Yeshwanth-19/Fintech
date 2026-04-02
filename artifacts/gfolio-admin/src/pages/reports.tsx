import * as React from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import {
  DownloadCloud, TrendingUp, Receipt, FileText,
  IndianRupee, Percent, ArrowUpRight, CheckCircle2, Clock, AlertCircle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  LineChart, Line,
} from "recharts";
import { useGetDistributionReport } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/utils";
import { buildReportsApiUrl } from "@/lib/api-config";

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
  itemStyle: { color: "#111827" },
};

const MOCK_DIST: any = {
  totalGifts: 8420, totalValue: 42100000,
  byMonth: [
    { date: "Apr", gifts: 310 }, { date: "May", gifts: 420 }, { date: "Jun", gifts: 540 },
    { date: "Jul", gifts: 600 }, { date: "Aug", gifts: 680 }, { date: "Sep", gifts: 750 },
    { date: "Oct", gifts: 850 }, { date: "Nov", gifts: 1100 }, { date: "Dec", gifts: 900 },
    { date: "Jan", gifts: 720 }, { date: "Feb", gifts: 680 }, { date: "Mar", gifts: 870 },
  ],
};

function useFetch<T>(url: string) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    fetch(buildReportsApiUrl(url), { credentials: "include" })
      .then(r => r.json()).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [url]);
  return { data, loading };
}

const TABS = ["Overview", "Finance Report", "GST Filings"] as const;
type Tab = typeof TABS[number];

// ─── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  if (status === "Filed")
    return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3" />{status}</span>;
  if (status === "Pending")
    return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" />{status}</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200"><AlertCircle className="w-3 h-3" />{status}</span>;
}

// ─── Summary KPI ─────────────────────────────────────────────────────────────
function KPI({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className={`text-2xl font-bold ${color ?? "text-foreground"}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────
function OverviewTab({ dist }: { dist: typeof MOCK_DIST }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <KPI label="Total Gifts Distributed" value={dist.totalGifts.toLocaleString()} sub="FY 2024-25" />
        <KPI label="Total Gift Value" value={formatCurrency(dist.totalValue)} sub="across all campaigns" />
        <KPI label="Avg. Redemption Rate" value="84.5%" sub="Platform avg: 79%" color="text-primary" />
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gifting Volume by Month (FY 2024-25)</CardTitle>
          <Button variant="outline" className="gap-1.5 text-xs h-8"><DownloadCloud className="w-3.5 h-3.5" />Export</Button>
        </CardHeader>
        <CardContent>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dist.byMonth} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="date" stroke="#9ca3af" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} fontSize={12} />
                <RechartsTooltip cursor={{ fill: "rgba(22,163,74,0.05)" }} {...TOOLTIP_STYLE} />
                <Bar dataKey="gifts" name="Gifts" fill="#16a34a" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// ─── Finance Report tab ───────────────────────────────────────────────────────
function FinanceTab() {
  const { data, loading } = useFetch<any>("/reports/finance");

  const fin = data ?? {
    fy: "2024-25",
    totals: { txnVolume: 118500000, platformFee: 1777500, gatewayCost: 391050, netRevenue: 1386450 },
    rows: MOCK_DIST.byMonth.map((m: any, i: number) => ({
      month: m.date + " 2024", txnVolume: 8500000 + i * 450000, platformFee: 127500 + i * 6750,
      gatewayCost: 28050 + i * 1485, netRevenue: 99450 + i * 5265, margin: 78.0, txns: 620 + i * 35,
    })),
  };

  const chartData = fin.rows.map((r: any) => ({
    month: r.month.split(" ")[0],
    "Platform Fee": Math.round(r.platformFee / 1000),
    "Net Revenue": Math.round(r.netRevenue / 1000),
    "Gateway Cost": Math.round(r.gatewayCost / 1000),
  }));

  const overallMargin = Math.round((fin.totals.netRevenue / fin.totals.platformFee) * 100 * 10) / 10;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KPI label="Gross Revenue" value={formatCurrency(fin.totals.platformFee)} sub={`FY ${fin.fy}`} />
        <KPI label="Gateway Costs" value={formatCurrency(fin.totals.gatewayCost)} sub="22% of gross" color="text-red-600" />
        <KPI label="Net Revenue" value={formatCurrency(fin.totals.netRevenue)} sub="after gateway" color="text-primary" />
        <KPI label="Platform Margin" value={`${overallMargin}%`} sub="net/gross" color="text-amber-600" />
      </div>

      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Revenue Trend (FY 2024-25) — ₹'000s</CardTitle>
          <Button variant="outline" className="gap-1.5 text-xs h-8"><DownloadCloud className="w-3.5 h-3.5" />Export P&L</Button>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" stroke="#9ca3af" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} fontSize={12} />
                <RechartsTooltip {...TOOLTIP_STYLE} />
                <Legend />
                <Line type="monotone" dataKey="Platform Fee" stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Net Revenue" stroke="#16a34a" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="Gateway Cost" stroke="#ef4444" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Monthly Finance Breakdown</CardTitle>
          <Button className="gap-1.5 text-xs h-8"><DownloadCloud className="w-3.5 h-3.5" />Download Report</Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Month", "Txn Volume", "# Txns", "Platform Fee (1.5%)", "Gateway Cost", "Net Revenue", "Margin"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fin.rows.map((r: any, i: number) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{r.month}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatCurrency(r.txnVolume)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.txns.toLocaleString()}</td>
                    <td className="px-4 py-3 font-medium text-amber-700">{formatCurrency(r.platformFee)}</td>
                    <td className="px-4 py-3 text-red-600">({formatCurrency(r.gatewayCost)})</td>
                    <td className="px-4 py-3 font-semibold text-primary">{formatCurrency(r.netRevenue)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${r.margin >= 75 ? "text-primary" : "text-amber-600"}`}>{r.margin}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/60 font-bold border-t-2 border-border">
                  <td className="px-4 py-3 text-foreground">FY Total</td>
                  <td className="px-4 py-3 text-foreground">{formatCurrency(fin.totals.txnVolume)}</td>
                  <td className="px-4 py-3 text-foreground">—</td>
                  <td className="px-4 py-3 text-amber-700">{formatCurrency(fin.totals.platformFee)}</td>
                  <td className="px-4 py-3 text-red-600">({formatCurrency(fin.totals.gatewayCost)})</td>
                  <td className="px-4 py-3 text-primary">{formatCurrency(fin.totals.netRevenue)}</td>
                  <td className="px-4 py-3 text-primary">{overallMargin}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// ─── GST Filings tab ──────────────────────────────────────────────────────────
const MOCK_GST_ROWS = [
  { month: "Apr 2024", taxableValue: 6520000, igst: 1173600, cgst: 0,      sgst: 0,      totalTax: 1173600, status: "Filed",   gstr1Filed: true,  gstr3bFiled: true  },
  { month: "May 2024", taxableValue: 6840000, igst: 0,       cgst: 615600, sgst: 615600, totalTax: 1231200, status: "Filed",   gstr1Filed: true,  gstr3bFiled: true  },
  { month: "Jun 2024", taxableValue: 7160000, igst: 0,       cgst: 644400, sgst: 644400, totalTax: 1288800, status: "Filed",   gstr1Filed: true,  gstr3bFiled: true  },
  { month: "Jul 2024", taxableValue: 7480000, igst: 1346400, cgst: 0,      sgst: 0,      totalTax: 1346400, status: "Filed",   gstr1Filed: true,  gstr3bFiled: true  },
  { month: "Aug 2024", taxableValue: 7800000, igst: 0,       cgst: 702000, sgst: 702000, totalTax: 1404000, status: "Filed",   gstr1Filed: true,  gstr3bFiled: true  },
  { month: "Sep 2024", taxableValue: 8120000, igst: 0,       cgst: 730800, sgst: 730800, totalTax: 1461600, status: "Filed",   gstr1Filed: true,  gstr3bFiled: true  },
  { month: "Oct 2024", taxableValue: 8440000, igst: 1519200, cgst: 0,      sgst: 0,      totalTax: 1519200, status: "Filed",   gstr1Filed: true,  gstr3bFiled: true  },
  { month: "Nov 2024", taxableValue: 9200000, igst: 0,       cgst: 828000, sgst: 828000, totalTax: 1656000, status: "Filed",   gstr1Filed: true,  gstr3bFiled: true  },
  { month: "Dec 2024", taxableValue: 8760000, igst: 0,       cgst: 788400, sgst: 788400, totalTax: 1576800, status: "Filed",   gstr1Filed: true,  gstr3bFiled: true  },
  { month: "Jan 2025", taxableValue: 8080000, igst: 1454400, cgst: 0,      sgst: 0,      totalTax: 1454400, status: "Filed",   gstr1Filed: true,  gstr3bFiled: true  },
  { month: "Feb 2025", taxableValue: 8400000, igst: 0,       cgst: 756000, sgst: 756000, totalTax: 1512000, status: "Pending", gstr1Filed: false, gstr3bFiled: false },
  { month: "Mar 2025", taxableValue: 8720000, igst: 0,       cgst: 784800, sgst: 784800, totalTax: 1569600, status: "Due",     gstr1Filed: false, gstr3bFiled: false },
];

function GSTTab() {
  const { data } = useFetch<any>("/reports/gst");
  const gst = data ?? {
    fy: "2024-25",
    rows: MOCK_GST_ROWS,
    totals: MOCK_GST_ROWS.reduce(
      (a, r) => ({ taxableValue: a.taxableValue + r.taxableValue, igst: a.igst + r.igst, cgst: a.cgst + r.cgst, sgst: a.sgst + r.sgst, totalTax: a.totalTax + r.totalTax }),
      { taxableValue: 0, igst: 0, cgst: 0, sgst: 0, totalTax: 0 }
    ),
  };

  const filed = gst.rows.filter((r: any) => r.status === "Filed").length;
  const pending = gst.rows.filter((r: any) => r.status !== "Filed").length;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <KPI label="Total Taxable Value" value={formatCurrency(gst.totals.taxableValue)} sub={`FY ${gst.fy}`} />
        <KPI label="IGST Collected" value={formatCurrency(gst.totals.igst)} sub="Inter-state supply" />
        <KPI label="CGST + SGST" value={formatCurrency(gst.totals.cgst + gst.totals.sgst)} sub="Intra-state supply" />
        <KPI label="Total Tax Liability" value={formatCurrency(gst.totals.totalTax)} sub={`${filed} filed · ${pending} pending`} color="text-primary" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-primary">{filed}</span> months filed,{" "}
            <span className="font-semibold text-amber-600">{pending}</span> pending
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5 text-xs h-8"><DownloadCloud className="w-3.5 h-3.5" />GSTR-1</Button>
          <Button className="gap-1.5 text-xs h-8"><DownloadCloud className="w-3.5 h-3.5" />GSTR-3B</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Month", "Taxable Value", "IGST (18%)", "CGST (9%)", "SGST (9%)", "Total Tax", "Filing Status", "GSTR-1", "GSTR-3B"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gst.rows.map((r: any, i: number) => (
                  <tr key={i} className={`border-b border-border last:border-0 transition-colors hover:bg-muted/30 ${r.status === "Due" ? "bg-red-50/40" : r.status === "Pending" ? "bg-amber-50/30" : ""}`}>
                    <td className="px-4 py-3 font-medium text-foreground">{r.month}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatCurrency(r.taxableValue)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.igst > 0 ? formatCurrency(r.igst) : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.cgst > 0 ? formatCurrency(r.cgst) : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.sgst > 0 ? formatCurrency(r.sgst) : "—"}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">{formatCurrency(r.totalTax)}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3">
                      {r.gstr1Filed
                        ? <span className="text-xs text-primary font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Filed</span>
                        : <button className="text-xs text-amber-700 underline underline-offset-2 font-medium">File Now</button>}
                    </td>
                    <td className="px-4 py-3">
                      {r.gstr3bFiled
                        ? <span className="text-xs text-primary font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Filed</span>
                        : <button className="text-xs text-amber-700 underline underline-offset-2 font-medium">File Now</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/60 font-bold border-t-2 border-border">
                  <td className="px-4 py-3 text-foreground">FY Total</td>
                  <td className="px-4 py-3">{formatCurrency(gst.totals.taxableValue)}</td>
                  <td className="px-4 py-3">{formatCurrency(gst.totals.igst)}</td>
                  <td className="px-4 py-3">{formatCurrency(gst.totals.cgst)}</td>
                  <td className="px-4 py-3">{formatCurrency(gst.totals.sgst)}</td>
                  <td className="px-4 py-3 text-primary">{formatCurrency(gst.totals.totalTax)}</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        GST applicable at 18% on platform service fees · GSTIN: 27AABCG1234F1Z5 · Registered: Maharashtra
      </p>
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Reports() {
  const [activeTab, setActiveTab] = React.useState<Tab>("Overview");
  const { data: distData, isError: distErr } = useGetDistributionReport();
  const dist = (distData && !distErr) ? distData : MOCK_DIST;

  return (
    <Layout title="Reports">
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-8 p-1 bg-muted rounded-xl w-fit border border-border">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab
                ? "bg-white text-primary shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "Overview"       && <TrendingUp className="w-3.5 h-3.5" />}
            {tab === "Finance Report" && <IndianRupee className="w-3.5 h-3.5" />}
            {tab === "GST Filings"    && <Receipt className="w-3.5 h-3.5" />}
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview"       && <OverviewTab dist={dist} />}
      {activeTab === "Finance Report" && <FinanceTab />}
      {activeTab === "GST Filings"    && <GSTTab />}
    </Layout>
  );
}
