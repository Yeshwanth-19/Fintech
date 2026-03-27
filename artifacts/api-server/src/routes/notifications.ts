import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/notifications", (_req, res) => {
  res.json([
    { id: "nt1", name: "Gift Delivery Confirmation", trigger: "gift_delivered", channel: "email", subject: "Your Gfolio Gift has been delivered!", body: "Dear {{recipient_name}}, your gift of {{amount}} in {{asset_type}} has been delivered.", active: true, createdAt: "2023-06-01T10:00:00Z" },
    { id: "nt2", name: "Gift Delivery SMS", trigger: "gift_delivered", channel: "sms", subject: "", body: "Your Gfolio gift of ₹{{amount}} is ready to redeem! Click: {{redemption_link}}", active: true, createdAt: "2023-06-01T10:00:00Z" },
    { id: "nt3", name: "KYC Approved Email", trigger: "kyc_verified", channel: "email", subject: "KYC Verification Complete - Gfolio", body: "Dear {{user_name}}, your KYC has been successfully verified. You can now invest and receive gifts.", active: true, createdAt: "2023-06-01T10:00:00Z" },
    { id: "nt4", name: "KYC Rejected Email", trigger: "kyc_rejected", channel: "email", subject: "KYC Verification Failed - Action Required", body: "Dear {{user_name}}, your KYC verification was rejected. Reason: {{rejection_reason}}. Please resubmit.", active: true, createdAt: "2023-06-01T10:00:00Z" },
    { id: "nt5", name: "Transaction Success Push", trigger: "transaction_success", channel: "push", subject: "Transaction Successful", body: "Your investment of ₹{{amount}} in {{asset_type}} was successful.", active: true, createdAt: "2023-07-15T10:00:00Z" },
    { id: "nt6", name: "Transaction Failed SMS", trigger: "transaction_failed", channel: "sms", subject: "", body: "Your transaction of ₹{{amount}} failed. Reason: {{failure_reason}}. Please retry.", active: false, createdAt: "2023-07-15T10:00:00Z" },
    { id: "nt7", name: "Gift Expiry Reminder", trigger: "gift_expiring_soon", channel: "whatsapp", subject: "", body: "⚠️ Your Gfolio gift of ₹{{amount}} expires in {{days_remaining}} days. Redeem now!", active: true, createdAt: "2023-08-01T10:00:00Z" },
    { id: "nt8", name: "Campaign Launch Email", trigger: "campaign_launched", channel: "email", subject: "You've received a gift from {{company_name}}!", body: "Dear {{recipient_name}}, {{company_name}} has sent you a Gfolio gift worth ₹{{amount}}!", active: true, createdAt: "2023-09-01T10:00:00Z" },
  ]);
});

router.get("/notifications/logs", (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const logs = [
    { id: "nl1", templateId: "nt1", templateName: "Gift Delivery Confirmation", recipient: "rahul.v@email.com", channel: "email", status: "delivered", sentAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), deliveredAt: new Date(Date.now() - 28 * 60 * 1000).toISOString() },
    { id: "nl2", templateId: "nt2", templateName: "Gift Delivery SMS", recipient: "+91 98765 11111", channel: "sms", status: "delivered", sentAt: new Date(Date.now() - 31 * 60 * 1000).toISOString(), deliveredAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    { id: "nl3", templateId: "nt5", templateName: "Transaction Success Push", recipient: "user_device_arjun", channel: "push", status: "delivered", sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: "nl4", templateId: "nt3", templateName: "KYC Approved Email", recipient: "deepika.patel@email.com", channel: "email", status: "delivered", sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), deliveredAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
    { id: "nl5", templateId: "nt6", templateName: "Transaction Failed SMS", recipient: "+91 76543 33333", channel: "sms", status: "failed", sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), deliveredAt: "" },
    { id: "nl6", templateId: "nt7", templateName: "Gift Expiry Reminder", recipient: "+91 65432 44444", channel: "whatsapp", status: "delivered", sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), deliveredAt: new Date(Date.now() - 5 * 60 * 60 * 1000 + 2000).toISOString() },
    { id: "nl7", templateId: "nt8", templateName: "Campaign Launch Email", recipient: "suresh.k@email.com", channel: "email", status: "pending", sentAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), deliveredAt: "" },
    { id: "nl8", templateId: "nt4", templateName: "KYC Rejected Email", recipient: "ravi.k@gmail.com", channel: "email", status: "delivered", sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), deliveredAt: new Date(Date.now() - 6 * 60 * 60 * 1000 + 5000).toISOString() },
  ];

  const total = logs.length;
  const paged = logs.slice((page - 1) * limit, page * limit);

  res.json({ logs: paged, total, page, limit });
});

export default router;
