import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/reports/distribution", (_req, res) => {
  const byMonth = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    byMonth.push({
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`,
      transactions: Math.floor(800 + Math.random() * 1200),
      volume: Math.floor(3000000 + Math.random() * 8000000),
      gifts: Math.floor(150 + Math.random() * 450),
    });
  }

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
  const byMonth = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    byMonth.push({
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`,
      transactions: Math.floor(400 + Math.random() * 600),
      volume: Math.floor(2000000 + Math.random() * 5000000),
      gifts: Math.floor(100 + Math.random() * 300),
    });
  }

  res.json({
    totalRedeemed: 4850,
    redemptionRate: 57.6,
    avgTimeToRedeem: 4.2,
    byMonth,
  });
});

export default router;
