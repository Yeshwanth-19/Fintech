import { Router, type IRouter } from "express";

const router: IRouter = Router();

const GIFTS = [
  { id: "g1", senderId: "u3", senderName: "Infosys Ltd", recipientName: "Rahul Verma", recipientEmail: "rahul.v@email.com", recipientPhone: "+91 98765 11111", amount: 5000, assetType: "Gold ETF", status: "redeemed", type: "digital", message: "Happy Diwali!", createdAt: "2024-10-30T10:00:00Z", expiresAt: "2024-12-30T10:00:00Z", redeemedAt: "2024-11-02T14:30:00Z", campaignId: "c1" },
  { id: "g2", senderId: "u1", senderName: "Arjun Mehta", recipientName: "Priya Singh", recipientEmail: "priya.s@email.com", recipientPhone: "+91 87654 22222", amount: 10000, assetType: "Nifty Index Fund", status: "delivered", type: "digital", message: "Happy Birthday!", createdAt: "2024-12-15T10:00:00Z", expiresAt: "2025-03-15T10:00:00Z", redeemedAt: "", campaignId: "" },
  { id: "g3", senderId: "u6", senderName: "TCS Foundation", recipientName: "Amit Patel", recipientEmail: "amit.p@email.com", recipientPhone: "+91 76543 33333", amount: 2500, assetType: "Silver ETF", status: "pending", type: "digital", message: "Employee Appreciation", createdAt: "2024-12-20T10:00:00Z", expiresAt: "2025-03-20T10:00:00Z", redeemedAt: "", campaignId: "c2" },
  { id: "g4", senderId: "u5", senderName: "Deepika Patel", recipientName: "Kavya Nair", recipientEmail: "kavya.n@email.com", recipientPhone: "+91 65432 44444", amount: 7500, assetType: "Gold ETF", status: "expired", type: "digital", message: "Congratulations!", createdAt: "2024-09-01T10:00:00Z", expiresAt: "2024-12-01T10:00:00Z", redeemedAt: "", campaignId: "" },
  { id: "g5", senderId: "u9", senderName: "Wipro HR", recipientName: "Suresh Kumar", recipientEmail: "suresh.k@email.com", recipientPhone: "+91 54321 55555", amount: 3000, assetType: "Mutual Fund", status: "cancelled", type: "digital", message: "Work Anniversary", createdAt: "2024-12-10T10:00:00Z", expiresAt: "2025-03-10T10:00:00Z", redeemedAt: "", campaignId: "c3" },
  { id: "g6", senderId: "u3", senderName: "Infosys Ltd", recipientName: "Meera Rao", recipientEmail: "meera.r@email.com", recipientPhone: "+91 43210 66666", amount: 5000, assetType: "Gold ETF", status: "delivered", type: "digital", message: "New Year Gift", createdAt: "2024-12-25T10:00:00Z", expiresAt: "2025-03-25T10:00:00Z", redeemedAt: "", campaignId: "c1" },
  { id: "g7", senderId: "u8", senderName: "Ananya Gupta", recipientName: "Rohan Shah", recipientEmail: "rohan.s@email.com", recipientPhone: "+91 32109 77777", amount: 15000, assetType: "Nifty 50 ETF", status: "redeemed", type: "digital", message: "Wedding Gift", createdAt: "2024-11-20T10:00:00Z", expiresAt: "2025-02-20T10:00:00Z", redeemedAt: "2024-11-25T09:15:00Z", campaignId: "" },
];

router.get("/gifts", (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;
  const type = req.query.type as string;
  const search = (req.query.search as string || "").toLowerCase();

  let filtered = [...GIFTS];

  if (status && status !== "all") {
    filtered = filtered.filter((g) => g.status === status);
  }
  if (type && type !== "all") {
    filtered = filtered.filter((g) => g.type === type);
  }
  if (search) {
    filtered = filtered.filter(
      (g) =>
        g.recipientName.toLowerCase().includes(search) ||
        g.senderName.toLowerCase().includes(search) ||
        g.id.toLowerCase().includes(search)
    );
  }

  const total = filtered.length;
  const gifts = filtered.slice((page - 1) * limit, page * limit);

  res.json({ gifts, total, page, limit });
});

router.get("/gifts/:giftId", (req, res) => {
  const gift = GIFTS.find((g) => g.id === req.params.giftId) || GIFTS[0];
  res.json(gift);
});

router.post("/gifts/:giftId/resend", (req, res) => {
  const gift = GIFTS.find((g) => g.id === req.params.giftId) || GIFTS[0];
  res.json({ ...gift, status: "delivered" });
});

router.post("/gifts/:giftId/cancel", (req, res) => {
  const gift = GIFTS.find((g) => g.id === req.params.giftId) || GIFTS[0];
  res.json({ ...gift, status: "cancelled" });
});

export default router;
