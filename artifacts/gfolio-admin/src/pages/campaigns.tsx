import * as React from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, Badge, Button, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, Input } from "@/components/ui";
import { Plus, Users, Gift, Building2, Target } from "lucide-react";
import { useListCampaigns, useCreateCampaign } from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const MOCK_CAMPAIGNS = {
  campaigns: [
    { id: "C-001", name: "Diwali Bonus 2024", department: "All Employees", status: "active", totalBudget: 5000000, spent: 4800000, totalRecipients: 500, deliveredCount: 480, redeemedCount: 450, giftAmount: 10000, assetType: "24K Gold", createdAt: "2024-01-15T00:00:00Z" },
    { id: "C-002", name: "Q1 Sales Performers", department: "Sales", status: "scheduled", totalBudget: 500000, spent: 0, totalRecipients: 50, deliveredCount: 0, redeemedCount: 0, giftAmount: 10000, assetType: "24K Gold", createdAt: "2024-02-10T00:00:00Z" },
  ],
  total: 2, page: 1, limit: 10
};

export default function CampaignsList() {
  const { data: campaignData, isError } = useListCampaigns();
  const { mutate: createCampaign, isPending } = useCreateCampaign();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const data = (campaignData && !isError) ? campaignData : MOCK_CAMPAIGNS;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    createCampaign({
      data: {
        name: fd.get("name") as string,
        department: fd.get("dept") as string,
        giftAmount: Number(fd.get("amount")),
        assetType: "24K Gold",
        totalBudget: Number(fd.get("amount")) * 100 // Example
      }
    }, {
      onSuccess: () => setIsModalOpen(false)
    });
    setIsModalOpen(false); // Optimistic close
  };

  return (
    <Layout title="Corporate Campaigns">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Manage and track bulk corporate gifting campaigns.</p>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Campaign Name</label>
                  <Input name="name" required placeholder="e.g. Diwali Bonus 2024" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Department</label>
                  <Input name="dept" placeholder="e.g. Sales, HR, All" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Gift Amount per Person (₹)</label>
                  <Input name="amount" type="number" required placeholder="10000" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Asset Type</label>
                  <select className="w-full h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <option>24K Digital Gold</option>
                    <option>Digital Silver</option>
                  </select>
                </div>
              </div>

              <div className="p-4 border border-primary/20 bg-primary/5 rounded-xl flex items-start gap-4">
                <Target className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-white">Next Steps after creation:</h4>
                  <p className="text-sm text-muted-foreground mt-1">You will be prompted to upload a CSV file with recipient details (Name, Email, Phone) on the campaign details page.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isPending}>{isPending ? 'Creating...' : 'Create Draft'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.campaigns.map(campaign => {
          const redemptionRate = (campaign.redeemedCount / campaign.totalRecipients) * 100 || 0;
          return (
            <Card key={campaign.id} className="flex flex-col hover:border-primary/30 transition-all duration-300 group">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant={campaign.status === 'active' ? 'success' : 'default'} className="capitalize">
                    {campaign.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">{campaign.id}</span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{campaign.name}</h3>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                  <Building2 className="w-4 h-4" /> {campaign.department}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white/5 rounded-xl border border-white/5">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Budget</p>
                    <p className="font-bold text-white">{formatCurrency(campaign.totalBudget)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Gift Amount</p>
                    <p className="font-bold text-white">{formatCurrency(campaign.giftAmount)}</p>
                  </div>
                </div>

                <div className="mt-auto space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1"><Users className="w-4 h-4" /> Recipients</span>
                    <span className="font-medium text-white">{campaign.redeemedCount} / {campaign.totalRecipients} Redeemed</span>
                  </div>
                  <div className="w-full h-2 bg-black rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-amber-300 transition-all duration-1000" 
                      style={{ width: `${redemptionRate}%` }}
                    />
                  </div>
                </div>
              </CardContent>
              <div className="p-4 border-t border-white/5 bg-white/[0.02] flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Created {formatDate(campaign.createdAt)}</span>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">Manage</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </Layout>
  );
}
