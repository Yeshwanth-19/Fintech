import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/dashboard/metrics", (_req, res) => {
  res.json({
    totalAum: 284750000,
    dailyTransactions: 1842,
    activeUsers: 52430,
    giftVolume: 3280000,
    revenue: 487200,
    pendingKyc: 127,
    failedTransactions: 34,
    unclaimedGifts: 892,
    settlementPending: 2340000,
    aumChange: 8.4,
    transactionChange: 12.1,
    userChange: 5.7,
    revenueChange: -2.3,
  });
});

router.get("/dashboard/alerts", (_req, res) => {
  res.json([
    {
      id: "a1",
      type: "high_value_transaction",
      message: "High-value transaction of ₹50,00,000 detected for user Rohit Sharma",
      severity: "critical",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      resolved: false,
    },
    {
      id: "a2",
      type: "failed_transaction",
      message: "34 transactions failed in the last hour due to payment gateway timeout",
      severity: "warning",
      timestamp: new Date(Date.now() - 23 * 60 * 1000).toISOString(),
      resolved: false,
    },
    {
      id: "a3",
      type: "kyc_pending",
      message: "127 KYC verifications pending for more than 48 hours",
      severity: "warning",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      resolved: false,
    },
    {
      id: "a4",
      type: "api_downtime",
      message: "Zerodha API integration experienced 2 minutes of downtime",
      severity: "info",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      resolved: true,
    },
    {
      id: "a5",
      type: "settlement_overdue",
      message: "Settlement of ₹23,40,000 is pending beyond SLA",
      severity: "critical",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      resolved: false,
    },
  ]);
});

router.get("/dashboard/transaction-trends", (req, res) => {
  const period = (req.query.period as string) || "30d";
  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;

  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split("T")[0],
      transactions: Math.floor(1200 + Math.random() * 1500),
      volume: Math.floor(5000000 + Math.random() * 10000000),
      gifts: Math.floor(200 + Math.random() * 600),
    });
  }

  res.json(data);
});

export default router;
