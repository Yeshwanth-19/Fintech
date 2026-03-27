import { Router, type IRouter } from "express";

const router: IRouter = Router();

const CAMPAIGNS = [
  { id: "c1", name: "Diwali 2024 - Employee Gifts", description: "Annual Diwali celebration gifts for all employees", status: "completed", totalBudget: 2500000, spent: 2480000, totalRecipients: 500, deliveredCount: 497, redeemedCount: 423, giftAmount: 5000, assetType: "Gold ETF", scheduledAt: "2024-10-30T09:00:00Z", createdAt: "2024-10-20T10:00:00Z", completedAt: "2024-10-31T18:00:00Z", department: "All", customMessage: "Wishing you a sparkling Diwali! 🪔 This gold gift is our token of appreciation." },
  { id: "c2", name: "Q3 Performance Recognition", description: "Gifts for top performers in Q3", status: "active", totalBudget: 750000, spent: 325000, totalRecipients: 150, deliveredCount: 130, redeemedCount: 67, giftAmount: 5000, assetType: "Nifty Index Fund", scheduledAt: "2024-12-15T09:00:00Z", createdAt: "2024-12-10T10:00:00Z", completedAt: "", department: "Engineering", customMessage: "Your exceptional performance in Q3 is truly remarkable. This gift is a small token of our appreciation." },
  { id: "c3", name: "New Year 2025 - Team Gifts", description: "New Year gifts for all team members", status: "scheduled", totalBudget: 1000000, spent: 0, totalRecipients: 200, deliveredCount: 0, redeemedCount: 0, giftAmount: 5000, assetType: "Sovereign Gold Bond", scheduledAt: "2025-01-01T09:00:00Z", createdAt: "2024-12-22T10:00:00Z", completedAt: "", department: "All", customMessage: "Wishing you a prosperous New Year 2025!" },
  { id: "c4", name: "Work Anniversary - Dec 2024", description: "Celebrating work anniversaries this month", status: "active", totalBudget: 300000, spent: 180000, totalRecipients: 60, deliveredCount: 58, redeemedCount: 42, giftAmount: 5000, assetType: "Silver ETF", scheduledAt: "2024-12-01T09:00:00Z", createdAt: "2024-11-28T10:00:00Z", completedAt: "", department: "HR", customMessage: "Thank you for your dedication and commitment. Here's to many more years together!" },
  { id: "c5", name: "Onboarding Batch - Nov 2024", description: "Welcome gifts for new joiners", status: "completed", totalBudget: 500000, spent: 495000, totalRecipients: 99, deliveredCount: 99, redeemedCount: 85, giftAmount: 5000, assetType: "Gold ETF", scheduledAt: "2024-11-01T09:00:00Z", createdAt: "2024-10-28T10:00:00Z", completedAt: "2024-11-05T18:00:00Z", department: "All", customMessage: "Welcome to the team! We're thrilled to have you onboard." },
];

router.get("/campaigns", (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;

  let filtered = [...CAMPAIGNS];

  if (status && status !== "all") {
    filtered = filtered.filter((c) => c.status === status);
  }

  const total = filtered.length;
  const campaigns = filtered.slice((page - 1) * limit, page * limit);

  res.json({ campaigns, total, page, limit });
});

router.post("/campaigns", (req, res) => {
  const newCampaign = {
    id: `c${Date.now()}`,
    ...req.body,
    status: "draft",
    spent: 0,
    totalRecipients: 0,
    deliveredCount: 0,
    redeemedCount: 0,
    createdAt: new Date().toISOString(),
    completedAt: "",
  };
  res.status(201).json(newCampaign);
});

router.get("/campaigns/:campaignId", (req, res) => {
  const campaign = CAMPAIGNS.find((c) => c.id === req.params.campaignId) || CAMPAIGNS[0];
  res.json(campaign);
});

export default router;
