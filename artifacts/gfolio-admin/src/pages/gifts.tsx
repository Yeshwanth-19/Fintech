import * as React from "react";
import { Layout } from "@/components/layout";
import { Card, Badge, Button, Input } from "@/components/ui";
import { Search, RotateCw, XCircle, Eye } from "lucide-react";
import { useListGifts, useResendGift, useCancelGift } from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const MOCK_GIFTS = {
  gifts: [
    { id: "GFT-1001", senderName: "Acme Corp", recipientName: "John Doe", amount: 5000, assetType: "24K Gold", status: "pending", type: "digital", createdAt: "2024-02-21T10:00:00Z", expiresAt: "2024-03-21T10:00:00Z" },
    { id: "GFT-1002", senderName: "Rahul Sharma", recipientName: "Priya Patel", amount: 15000, assetType: "24K Gold", status: "redeemed", type: "digital", createdAt: "2024-02-18T10:00:00Z", expiresAt: "2024-03-18T10:00:00Z" },
    { id: "GFT-1003", senderName: "TechFlow Inc", recipientName: "Mike Smith", amount: 2000, assetType: "Silver", status: "expired", type: "physical", createdAt: "2024-01-10T10:00:00Z", expiresAt: "2024-02-10T10:00:00Z" },
  ],
  total: 3, page: 1, limit: 10
};

export default function GiftsList() {
  const [activeTab, setActiveTab] = React.useState("all");
  const { data: giftsData, isError } = useListGifts({ status: activeTab !== 'all' ? activeTab as any : undefined });
  const { mutate: resendGift } = useResendGift();
  const { mutate: cancelGift } = useCancelGift();

  const data = (giftsData && !isError) ? giftsData : MOCK_GIFTS;

  const tabs = ["all", "pending", "delivered", "redeemed", "expired", "cancelled"];

  const handleResend = (id: string) => {
    resendGift({ giftId: id });
    alert(`Resend initiated for ${id}`);
  };

  const handleCancel = (id: string) => {
    cancelGift({ giftId: id });
    alert(`Cancellation initiated for ${id}`);
  };

  return (
    <Layout title="Gifting Operations">
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? "bg-primary text-black" 
                : "bg-muted text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <Card>
        <div className="p-4 border-b border-border">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search gifts by ID, Sender, or Recipient..." className="pl-10" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted">
              <tr>
                <th className="px-6 py-4 font-medium">Gift ID</th>
                <th className="px-6 py-4 font-medium">Sender</th>
                <th className="px-6 py-4 font-medium">Recipient</th>
                <th className="px-6 py-4 font-medium">Amount / Asset</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.gifts.map((gift) => (
                <tr key={gift.id} className="border-b border-border hover:bg-muted transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-primary">{gift.id}</td>
                  <td className="px-6 py-4 font-medium text-foreground">{gift.senderName}</td>
                  <td className="px-6 py-4 font-medium text-foreground">{gift.recipientName}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-foreground">{formatCurrency(gift.amount)}</p>
                    <p className="text-xs text-muted-foreground">{gift.assetType}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      gift.status === 'redeemed' || gift.status === 'delivered' ? 'success' : 
                      gift.status === 'pending' ? 'warning' : 'destructive'
                    } className="capitalize">
                      {gift.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-foreground">{formatDate(gift.createdAt)}</p>
                    <p className="text-xs text-muted-foreground">Exp: {formatDate(gift.expiresAt)}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" title="View Details">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {gift.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="icon" title="Resend" onClick={() => handleResend(gift.id)}>
                            <RotateCw className="w-4 h-4 text-amber-500" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Cancel" onClick={() => handleCancel(gift.id)}>
                            <XCircle className="w-4 h-4 text-red-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Layout>
  );
}
