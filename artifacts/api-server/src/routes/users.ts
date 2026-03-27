import { Router, type IRouter } from "express";

const router: IRouter = Router();

const USERS = [
  { id: "u1", name: "Arjun Mehta", email: "arjun.mehta@email.com", phone: "+91 98765 43210", kycStatus: "verified", userType: "individual", totalInvested: 450000, joinedAt: "2023-03-15T10:00:00Z", lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
  { id: "u2", name: "Priya Sharma", email: "priya.sharma@email.com", phone: "+91 87654 32109", kycStatus: "pending", userType: "individual", totalInvested: 125000, joinedAt: "2024-01-20T10:00:00Z", lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: "u3", name: "Infosys Ltd", email: "finance@infosys.com", phone: "+91 80 4116 7000", kycStatus: "verified", userType: "corporate", totalInvested: 15000000, joinedAt: "2023-06-01T10:00:00Z", lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
  { id: "u4", name: "Ravi Krishnan", email: "ravi.k@gmail.com", phone: "+91 76543 21098", kycStatus: "rejected", userType: "individual", totalInvested: 0, joinedAt: "2024-02-14T10:00:00Z", lastActive: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "u5", name: "Deepika Patel", email: "deepika.patel@email.com", phone: "+91 65432 10987", kycStatus: "verified", userType: "individual", totalInvested: 320000, joinedAt: "2023-09-10T10:00:00Z", lastActive: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
  { id: "u6", name: "TCS Foundation", email: "gifting@tcs.com", phone: "+91 22 6778 9595", kycStatus: "verified", userType: "corporate", totalInvested: 8500000, joinedAt: "2023-04-20T10:00:00Z", lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  { id: "u7", name: "Vikram Nair", email: "vikram.nair@email.com", phone: "+91 54321 09876", kycStatus: "pending", userType: "individual", totalInvested: 75000, joinedAt: "2024-03-01T10:00:00Z", lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "u8", name: "Ananya Gupta", email: "ananya.gupta@email.com", phone: "+91 43210 98765", kycStatus: "verified", userType: "individual", totalInvested: 890000, joinedAt: "2023-07-22T10:00:00Z", lastActive: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
  { id: "u9", name: "Wipro HR", email: "hr.benefits@wipro.com", phone: "+91 80 2844 0011", kycStatus: "verified", userType: "corporate", totalInvested: 6200000, joinedAt: "2023-08-15T10:00:00Z", lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "u10", name: "Sanjay Kumar", email: "sanjay.kumar@email.com", phone: "+91 32109 87654", kycStatus: "pending", userType: "individual", totalInvested: 250000, joinedAt: "2024-02-28T10:00:00Z", lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
];

router.get("/users", (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const kycStatus = req.query.kycStatus as string;
  const userType = req.query.userType as string;
  const search = (req.query.search as string || "").toLowerCase();

  let filtered = [...USERS];

  if (kycStatus && kycStatus !== "all") {
    filtered = filtered.filter((u) => u.kycStatus === kycStatus);
  }
  if (userType && userType !== "all") {
    filtered = filtered.filter((u) => u.userType === userType);
  }
  if (search) {
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.phone.includes(search)
    );
  }

  const total = filtered.length;
  const users = filtered.slice((page - 1) * limit, page * limit);

  res.json({ users, total, page, limit });
});

router.get("/users/:userId", (req, res) => {
  const user = USERS.find((u) => u.id === req.params.userId) || USERS[0];
  res.json({
    ...user,
    kycDocuments: ["pan_card.pdf", "aadhaar_card.pdf"],
    portfolioValue: user.totalInvested * 1.14,
    giftsReceived: Math.floor(Math.random() * 10) + 1,
    giftsSent: Math.floor(Math.random() * 5),
    address: "123, MG Road, Bangalore, Karnataka - 560001",
    panNumber: "ABCDE1234F",
  });
});

router.patch("/users/:userId/kyc", (req, res) => {
  const user = USERS.find((u) => u.id === req.params.userId) || USERS[0];
  const updated = { ...user, kycStatus: req.body.status };
  res.json({
    ...updated,
    kycDocuments: ["pan_card.pdf", "aadhaar_card.pdf"],
    portfolioValue: updated.totalInvested * 1.14,
    giftsReceived: 5,
    giftsSent: 2,
    address: "123, MG Road, Bangalore, Karnataka - 560001",
    panNumber: "ABCDE1234F",
  });
});

export default router;
