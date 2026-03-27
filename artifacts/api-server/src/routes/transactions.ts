import { Router, type IRouter } from "express";

const router: IRouter = Router();

const TRANSACTIONS = [
  { id: "txn001", userId: "u1", userName: "Arjun Mehta", type: "purchase", amount: 50000, status: "success", paymentMethod: "UPI", referenceId: "upi_ref_001", description: "Gold ETF Purchase", createdAt: "2024-12-27T09:15:00Z", updatedAt: "2024-12-27T09:15:30Z", failureReason: "" },
  { id: "txn002", userId: "u3", userName: "Infosys Ltd", type: "gift", amount: 250000, status: "success", paymentMethod: "NEFT", referenceId: "neft_ref_002", description: "Diwali Campaign Gifting", createdAt: "2024-12-27T08:30:00Z", updatedAt: "2024-12-27T08:31:00Z", failureReason: "" },
  { id: "txn003", userId: "u7", userName: "Vikram Nair", type: "purchase", amount: 10000, status: "failed", paymentMethod: "Debit Card", referenceId: "card_ref_003", description: "Nifty Index Fund", createdAt: "2024-12-27T07:45:00Z", updatedAt: "2024-12-27T07:45:15Z", failureReason: "Insufficient funds" },
  { id: "txn004", userId: "u5", userName: "Deepika Patel", type: "refund", amount: 25000, status: "pending", paymentMethod: "UPI", referenceId: "upi_ref_004", description: "Refund for cancelled order", createdAt: "2024-12-26T14:20:00Z", updatedAt: "2024-12-26T14:20:00Z", failureReason: "" },
  { id: "txn005", userId: "u6", userName: "TCS Foundation", type: "settlement", amount: 1200000, status: "success", paymentMethod: "RTGS", referenceId: "rtgs_ref_005", description: "Monthly Settlement", createdAt: "2024-12-25T16:00:00Z", updatedAt: "2024-12-25T16:02:00Z", failureReason: "" },
  { id: "txn006", userId: "u2", userName: "Priya Sharma", type: "purchase", amount: 5000, status: "failed", paymentMethod: "Credit Card", referenceId: "card_ref_006", description: "Silver ETF Purchase", createdAt: "2024-12-25T11:30:00Z", updatedAt: "2024-12-25T11:30:10Z", failureReason: "Payment gateway timeout" },
  { id: "txn007", userId: "u8", userName: "Ananya Gupta", type: "purchase", amount: 100000, status: "success", paymentMethod: "Net Banking", referenceId: "nb_ref_007", description: "Sovereign Gold Bond", createdAt: "2024-12-24T10:00:00Z", updatedAt: "2024-12-24T10:01:00Z", failureReason: "" },
  { id: "txn008", userId: "u9", userName: "Wipro HR", type: "gift", amount: 75000, status: "success", paymentMethod: "NEFT", referenceId: "neft_ref_008", description: "Year-End Recognition Gifts", createdAt: "2024-12-23T09:00:00Z", updatedAt: "2024-12-23T09:01:30Z", failureReason: "" },
  { id: "txn009", userId: "u4", userName: "Ravi Krishnan", type: "purchase", amount: 2500, status: "failed", paymentMethod: "UPI", referenceId: "upi_ref_009", description: "Mutual Fund SIP", createdAt: "2024-12-22T13:45:00Z", updatedAt: "2024-12-22T13:45:05Z", failureReason: "KYC not verified" },
  { id: "txn010", userId: "u1", userName: "Arjun Mehta", type: "purchase", amount: 75000, status: "success", paymentMethod: "UPI", referenceId: "upi_ref_010", description: "Nifty 50 ETF", createdAt: "2024-12-21T11:00:00Z", updatedAt: "2024-12-21T11:00:45Z", failureReason: "" },
];

router.get("/transactions", (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;
  const type = req.query.type as string;
  const search = (req.query.search as string || "").toLowerCase();

  let filtered = [...TRANSACTIONS];

  if (status && status !== "all") {
    filtered = filtered.filter((t) => t.status === status);
  }
  if (type && type !== "all") {
    filtered = filtered.filter((t) => t.type === type);
  }
  if (search) {
    filtered = filtered.filter(
      (t) =>
        t.userName.toLowerCase().includes(search) ||
        t.id.toLowerCase().includes(search) ||
        t.referenceId.toLowerCase().includes(search)
    );
  }

  const total = filtered.length;
  const transactions = filtered.slice((page - 1) * limit, page * limit);

  res.json({ transactions, total, page, limit });
});

router.get("/transactions/:txnId", (req, res) => {
  const txn = TRANSACTIONS.find((t) => t.id === req.params.txnId) || TRANSACTIONS[0];
  res.json(txn);
});

router.post("/transactions/:txnId/retry", (req, res) => {
  const txn = TRANSACTIONS.find((t) => t.id === req.params.txnId) || TRANSACTIONS[0];
  res.json({ ...txn, status: "pending" });
});

router.post("/transactions/:txnId/refund", (req, res) => {
  const txn = TRANSACTIONS.find((t) => t.id === req.params.txnId) || TRANSACTIONS[0];
  res.json({ ...txn, status: "refunded", type: "refund" });
});

export default router;
