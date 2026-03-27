import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/wallet", (_req, res) => {
  res.json({
    balance: 4250000,
    totalAdded: 10000000,
    totalSpent: 5750000,
    pendingAmount: 325000,
    departmentAllocations: [
      { department: "Engineering", allocated: 1500000, spent: 1280000 },
      { department: "Sales", allocated: 1000000, spent: 980000 },
      { department: "HR", allocated: 800000, spent: 620000 },
      { department: "Marketing", allocated: 600000, spent: 510000 },
      { department: "Operations", allocated: 500000, spent: 385000 },
      { department: "Finance", allocated: 400000, spent: 320000 },
    ],
  });
});

router.get("/wallet/transactions", (_req, res) => {
  res.json([
    { id: "wt1", type: "credit", amount: 2000000, description: "Added funds via NEFT", balance: 4250000, createdAt: "2024-12-20T10:00:00Z" },
    { id: "wt2", type: "debit", amount: 2500000, description: "Diwali 2024 campaign", balance: 2250000, createdAt: "2024-10-30T09:00:00Z" },
    { id: "wt3", type: "credit", amount: 5000000, description: "Annual budget allocation", balance: 4750000, createdAt: "2024-04-01T09:00:00Z" },
    { id: "wt4", type: "debit", amount: 750000, description: "Q3 Performance campaign", balance: -250000, createdAt: "2024-12-15T09:00:00Z" },
    { id: "wt5", type: "credit", amount: 3000000, description: "Additional allocation Q4", balance: 3250000, createdAt: "2024-10-01T10:00:00Z" },
    { id: "wt6", type: "debit", amount: 495000, description: "Onboarding Nov 2024 campaign", balance: 2755000, createdAt: "2024-11-01T09:00:00Z" },
  ]);
});

export default router;
