import * as React from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card, CardContent, Input, Badge, Button } from "@/components/ui";
import { Search, Filter, MoreVertical, Eye } from "lucide-react";
import { useListUsers } from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const MOCK_USERS = {
  users: [
    { id: "1", name: "Rahul Sharma", email: "rahul@example.com", phone: "+91 9876543210", kycStatus: "verified", userType: "individual", totalInvested: 250000, joinedAt: "2023-10-15T00:00:00Z", lastActive: "2024-02-20T00:00:00Z" },
    { id: "2", name: "Acme Corp", email: "admin@acme.com", phone: "+91 9123456780", kycStatus: "pending", userType: "corporate", totalInvested: 5000000, joinedAt: "2024-01-10T00:00:00Z", lastActive: "2024-02-21T00:00:00Z" },
    { id: "3", name: "Priya Patel", email: "priya@example.com", phone: "+91 9876512345", kycStatus: "rejected", userType: "individual", totalInvested: 0, joinedAt: "2024-02-15T00:00:00Z", lastActive: "2024-02-18T00:00:00Z" },
  ],
  total: 3, page: 1, limit: 10
};

export default function UsersList() {
  const { data: usersData, isError } = useListUsers();
  const data = (usersData && !isError) ? usersData : MOCK_USERS;

  return (
    <Layout title="User Management">
      <Card>
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search users by name, email or phone..." className="pl-10" />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" /> KYC Status
            </Button>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" /> User Type
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">User Details</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">KYC Status</th>
                <th className="px-6 py-4 font-medium">Invested</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-muted-foreground">{user.userType}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      user.kycStatus === 'verified' ? 'success' : 
                      user.kycStatus === 'pending' ? 'warning' : 'destructive'
                    }>
                      {user.kycStatus.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    {formatCurrency(user.totalInvested)}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {formatDate(user.joinedAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/users/${user.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-white/5 flex justify-between items-center text-sm text-muted-foreground">
          <p>Showing 1 to {data.users.length} of {data.total} entries</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </Card>
    </Layout>
  );
}
