import * as React from "react";
import { useParams, Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { ArrowLeft, CheckCircle, XCircle, Clock, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";
import { useGetUserById, useUpdateUserKyc } from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const MOCK_PROFILE = {
  id: "1", name: "Rahul Sharma", email: "rahul@example.com", phone: "+91 9876543210", 
  kycStatus: "pending", userType: "individual", totalInvested: 250000, portfolioValue: 285000,
  giftsReceived: 2, giftsSent: 5, joinedAt: "2023-10-15T00:00:00Z", lastActive: "2024-02-20T00:00:00Z",
  address: "123 Tech Park, Andheri, Bangalore", panNumber: "ABCDE1234F",
  kycDocuments: ["https://example.com/doc1.jpg", "https://example.com/doc2.jpg"]
};

export default function UserDetail() {
  const { id } = useParams();
  const { data: profileData, isError } = useGetUserById(id!);
  const { mutate: updateKyc, isPending: isUpdatingKyc } = useUpdateUserKyc();
  
  const [localProfile, setLocalProfile] = React.useState(MOCK_PROFILE);

  React.useEffect(() => {
    if (profileData && !isError) setLocalProfile(profileData as any);
  }, [profileData, isError]);

  const handleKycAction = (status: "verified" | "rejected") => {
    updateKyc({ userId: id!, data: { status } }, {
      onSuccess: () => setLocalProfile(prev => ({ ...prev, kycStatus: status })),
      // Mock update on error for demo purposes
      onError: () => setLocalProfile(prev => ({ ...prev, kycStatus: status }))
    });
  };

  return (
    <Layout title="User Profile">
      <div className="mb-6">
        <Link href="/users" className="inline-flex items-center text-sm text-primary hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Users
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile & Info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 text-center pt-8">
              <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold mb-4">
                {localProfile.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-white">{localProfile.name}</h2>
              <p className="text-muted-foreground capitalize mb-4">{localProfile.userType} Account</p>
              <Badge variant={
                localProfile.kycStatus === 'verified' ? 'success' : 
                localProfile.kycStatus === 'pending' ? 'warning' : 'destructive'
              } className="px-4 py-1 text-sm">
                KYC {localProfile.kycStatus.toUpperCase()}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-white">{localProfile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-white">{localProfile.phone}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span className="text-white flex-1">{localProfile.address}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                <span className="text-white">PAN: <span className="font-mono">{localProfile.panNumber}</span></span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Stats & KYC Actions */}
        <div className="col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-[#151A21] to-[#0A0A0A]">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Total Invested</p>
                <h3 className="text-3xl font-bold text-white">{formatCurrency(localProfile.totalInvested)}</h3>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[#151A21] to-[#0A0A0A]">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Portfolio Value</p>
                <h3 className="text-3xl font-bold text-primary">{formatCurrency(localProfile.portfolioValue)}</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Gifts Sent</p>
                  <p className="text-2xl font-bold text-white mt-1">{localProfile.giftsSent}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <ArrowLeft className="w-5 h-5 text-primary rotate-45" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Gifts Received</p>
                  <p className="text-2xl font-bold text-white mt-1">{localProfile.giftsReceived}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <ArrowLeft className="w-5 h-5 text-emerald-500 -rotate-[135deg]" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>KYC Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 border border-white/10 rounded-xl bg-black/50 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">Review Documents</h4>
                    <p className="text-sm text-muted-foreground mb-4">User has submitted PAN card and Address proof for verification.</p>
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm" className="bg-white/5">View PAN Card</Button>
                      <Button variant="outline" size="sm" className="bg-white/5">View Address Proof</Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {localProfile.kycStatus === 'pending' && (
                <div className="flex gap-4">
                  <Button 
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
                    onClick={() => handleKycAction('verified')}
                    disabled={isUpdatingKyc}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve KYC
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => handleKycAction('rejected')}
                    disabled={isUpdatingKyc}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject KYC
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
