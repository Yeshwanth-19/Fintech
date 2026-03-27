import { Router, type IRouter } from "express";

const router: IRouter = Router();

const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
const FY_MONTHS = [
  { month: "Apr 2024", fy: "2024-04" },
  { month: "May 2024", fy: "2024-05" },
  { month: "Jun 2024", fy: "2024-06" },
  { month: "Jul 2024", fy: "2024-07" },
  { month: "Aug 2024", fy: "2024-08" },
  { month: "Sep 2024", fy: "2024-09" },
  { month: "Oct 2024", fy: "2024-10" },
  { month: "Nov 2024", fy: "2024-11" },
  { month: "Dec 2024", fy: "2024-12" },
  { month: "Jan 2025", fy: "2025-01" },
  { month: "Feb 2025", fy: "2025-02" },
  { month: "Mar 2025", fy: "2025-03" },
];

router.get("/reports/distribution", (_req, res) => {
  const byMonth = MONTHS.map((m, i) => ({
    date: m,
    gifts: 300 + i * 80 + Math.floor(Math.random() * 120),
    volume: 3500000 + i * 600000 + Math.floor(Math.random() * 800000),
  }));
  res.json({
    totalGifts: 8420,
    totalValue: 42100000,
    byStatus: [
      { status: "redeemed", count: 4850, value: 24250000 },
      { status: "delivered", count: 1920, value: 9600000 },
      { status: "pending", count: 680, value: 3400000 },
      { status: "expired", count: 610, value: 3050000 },
      { status: "cancelled", count: 360, value: 1800000 },
    ],
    byAsset: [
      { asset: "Gold ETF", count: 3200, value: 16000000 },
      { asset: "Nifty Index Fund", count: 2100, value: 10500000 },
      { asset: "Silver ETF", count: 1450, value: 7250000 },
      { asset: "Sovereign Gold Bond", count: 980, value: 4900000 },
      { asset: "Mutual Fund", count: 690, value: 3450000 },
    ],
    byMonth,
  });
});

router.get("/reports/redemption", (_req, res) => {
  res.json({
    totalRedeemed: 4850,
    redemptionRate: 57.6,
    avgTimeToRedeem: 4.2,
  });
});

router.get("/reports/finance", (_req, res) => {
  const rows = FY_MONTHS.map(({ month, fy }, i) => {
    const txnVolume = 8500000 + i * 450000 + Math.floor(Math.random() * 500000);
    const platformFee = Math.floor(txnVolume * 0.015);
    const gatewayCost = Math.floor(platformFee * 0.22);
    const netRevenue = platformFee - gatewayCost;
    const margin = Math.round((netRevenue / platformFee) * 100 * 10) / 10;
    const txns = 620 + i * 35 + Math.floor(Math.random() * 80);
    return { month, fy, txnVolume, platformFee, gatewayCost, netRevenue, margin, txns };
  });

  const totals = rows.reduce(
    (acc, r) => ({
      txnVolume: acc.txnVolume + r.txnVolume,
      platformFee: acc.platformFee + r.platformFee,
      gatewayCost: acc.gatewayCost + r.gatewayCost,
      netRevenue: acc.netRevenue + r.netRevenue,
    }),
    { txnVolume: 0, platformFee: 0, gatewayCost: 0, netRevenue: 0 }
  );

  res.json({ rows, totals, fy: "2024-25" });
});

router.get("/reports/gst", (_req, res) => {
  const statuses = ["Filed", "Filed", "Filed", "Filed", "Filed", "Filed", "Filed", "Filed", "Filed", "Filed", "Pending", "Due"];
  const rows = FY_MONTHS.map(({ month, fy }, i) => {
    const taxableValue = 6500000 + i * 320000 + Math.floor(Math.random() * 400000);
    const isInterState = i % 3 === 0;
    const igst = isInterState ? Math.floor(taxableValue * 0.18) : 0;
    const cgst = !isInterState ? Math.floor(taxableValue * 0.09) : 0;
    const sgst = !isInterState ? Math.floor(taxableValue * 0.09) : 0;
    const totalTax = igst + cgst + sgst;
    const status = statuses[i];
    const gstr1Filed = i < 10;
    const gstr3bFiled = i < 10;
    return { month, fy, taxableValue, igst, cgst, sgst, totalTax, status, gstr1Filed, gstr3bFiled };
  });

  const totals = rows.reduce(
    (acc, r) => ({
      taxableValue: acc.taxableValue + r.taxableValue,
      igst: acc.igst + r.igst,
      cgst: acc.cgst + r.cgst,
      sgst: acc.sgst + r.sgst,
      totalTax: acc.totalTax + r.totalTax,
    }),
    { taxableValue: 0, igst: 0, cgst: 0, sgst: 0, totalTax: 0 }
  );

  res.json({ rows, totals, fy: "2024-25" });
});

export default router;
