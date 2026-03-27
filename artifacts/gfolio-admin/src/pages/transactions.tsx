import * as React from "react";
import { Layout } from "@/components/layout";
import { Card, Badge, Button, Input } from "@/components/ui";
import { Search, RotateCcw, ArrowDownCircle } from "lucide-react";
import { useListTransactions, useRetryTransaction, useRefundTransaction } from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const MOCK_TXNS = {
  transactions: [
    { id: "TXN-001", userName: "Rahul Sharma", type: "purchase", amount: 25000, status: "success", paymentMethod: "UPI", createdAt: "2024-02-21T14:30:00Z" },
    { id: "TXN-002", userName: "Acme Corp", type: "gift", amount: 500000, status: "pending", paymentMethod: "Bank Transfer", createdAt: "2024-02-21T10:00:00Z" },
    { id: "TXN-003", userName: "Priya Patel", type: "purchase", amount: 5000, status: "failed", paymentMethod: "Card", createdAt: "2024-02-20T09:15:00Z", failureReason: "Bank declined" },
  ],
  total: 3, page: 1, limit: 10
};

export default function TransactionsList() {
  const { data: txnsData, isError } = useListTransactions();
  const { mutate: retryTxn } = useRetryTransaction();
  const { mutate: refundTxn } = useRefundTransaction();

  const data = (txnsData && !isError) ? txnsData : MOCK_TXNS;

  const handleRetry = (id: string) => {
    retryTxn({ txnId: id });
    alert(`Retrying transaction ${id}`);
  };

  const handleRefund = (id: string) => {
    if(window.confirm("Are you sure you want to refund this transaction?")) {
      refundTxn({ txnId: id });
    }
  };

  return (
    <Layout title="Transaction Management">
      <Card>
        <div className="p-4 border-b border-white/5 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by Txn ID, User, or Reference..." className="pl-10" />
          </div>
          <Input type="date" className="w-auto" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Transaction</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-mono text-xs text-primary">{txn.id}</p>
                    <span className="text-xs capitalize px-2 py-0.5 mt-1 inline-block rounded bg-white/10 text-white">
                      {txn.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">{txn.userName}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white">{formatCurrency(txn.amount)}</p>
                    <p className="text-xs text-muted-foreground">{txn.paymentMethod}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      txn.status === 'success' ? 'success' : 
                      txn.status === 'pending' ? 'warning' : 'destructive'
                    } className="capitalize">
                      {txn.status}
                    </Badge>
                    {txn.failureReason && (
                      <p className="text-[10px] text-red-400 mt-1 max-w-[150px] truncate" title={txn.failureReason}>
                        {txn.failureReason}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(txn.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {txn.status === 'failed' && (
                        <Button variant="outline" size="sm" onClick={() => handleRetry(txn.id)} className="bg-white/5 border-white/10">
                          <RotateCcw className="w-3 h-3 mr-1" /> Retry
                        </Button>
                      )}
                      {txn.status === 'success' && (
                        <Button variant="outline" size="sm" onClick={() => handleRefund(txn.id)} className="bg-white/5 border-white/10 hover:text-red-500">
                          <ArrowDownCircle className="w-3 h-3 mr-1" /> Refund
                        </Button>
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
