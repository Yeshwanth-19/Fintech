import * as React from "react";
import { ArrowDownCircle, RotateCcw, Search } from "lucide-react";
import { Layout } from "@/components/layout";
import { Badge, Button, Card, Input } from "@/components/ui";
import { customFetch, useListUsers, useRetryTransaction, useRefundTransaction } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/utils";
import { buildTransactionsApiUrl } from "@/lib/api-config";

type TransactionItem = {
  id: string;
  userId?: string;
  userName?: string;
  user?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  providerId?: string;
  merchantTransactionId?: string;
  razorpayPaymentId?: string;
  type?: string;
  transactionType?: string;
  amount?: number;
  status?: string;
  paymentMethod?: string;
  metalType?: string;
  createdAt?: string;
  executedAt?: string;
  failureReason?: string;
  referenceId?: string;
  invoiceNumber?: string;
  investedAmount?: number;
  totalTaxAmount?: string;
  externalPaymentId?: string;
};

type TransactionListResponse = {
  transactions?: unknown[];
  data?: unknown[];
  total?: number;
  page?: number;
  limit?: number;
};

const TRANSACTION_LIST_URL = buildTransactionsApiUrl("/transaction/gettransactions");

function unwrapUsers(data: unknown): unknown[] {
  if (!data || typeof data !== "object") return [];
  const record = data as Record<string, unknown>;
  if (Array.isArray(record.users)) return record.users;
  if (record.data && typeof record.data === "object" && Array.isArray((record.data as Record<string, unknown>).users)) {
    return (record.data as Record<string, unknown>).users as unknown[];
  }
  return [];
}

function unwrapTransactions(payload: TransactionListResponse): unknown[] {
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.transactions)) return payload.transactions;
  return [];
}

function normalizeTransaction(value: unknown): TransactionItem | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const rawId = record.id ?? record._id;
  if (typeof rawId !== "string") return null;

  const user = record.user && typeof record.user === "object" ? (record.user as Record<string, unknown>) : undefined;
  const taxes = record.taxes && typeof record.taxes === "object" ? (record.taxes as Record<string, unknown>) : undefined;

  return {
    id: rawId,
    userId: typeof record.userId === "string" ? record.userId : undefined,
    userName: typeof user?.name === "string" ? user.name : undefined,
    user: user
      ? {
          name: typeof user.name === "string" ? user.name : undefined,
          email: typeof user.email === "string" ? user.email : undefined,
          phone: typeof user.phone === "string" ? user.phone : undefined,
        }
      : undefined,
    providerId: typeof record.providerId === "string" ? record.providerId : undefined,
    merchantTransactionId: typeof record.merchantTransactionId === "string" ? record.merchantTransactionId : undefined,
    razorpayPaymentId: typeof record.razorpayPaymentId === "string" ? record.razorpayPaymentId : undefined,
    type:
      typeof record.transactionType === "string"
        ? record.transactionType
        : typeof record.type === "string"
          ? record.type
          : undefined,
    transactionType:
      typeof record.transactionType === "string"
        ? record.transactionType
        : typeof record.type === "string"
          ? record.type
          : undefined,
    amount:
      typeof record.totalAmount === "number"
        ? record.totalAmount
        : typeof record.amount === "number"
          ? record.amount
          : undefined,
    status: typeof record.status === "string" ? record.status : undefined,
    paymentMethod:
      typeof record.metalType === "string"
        ? record.metalType
        : typeof record.paymentMethod === "string"
          ? record.paymentMethod
          : undefined,
    metalType: typeof record.metalType === "string" ? record.metalType : undefined,
    createdAt:
      typeof record.createdAt === "string"
        ? record.createdAt
        : typeof record.executedAt === "string"
          ? record.executedAt
          : undefined,
    executedAt: typeof record.executedAt === "string" ? record.executedAt : undefined,
    failureReason: typeof record.failureReason === "string" ? record.failureReason : undefined,
    referenceId:
      typeof record.merchantTransactionId === "string"
        ? record.merchantTransactionId
        : typeof record.externalPaymentId === "string"
          ? record.externalPaymentId
          : typeof record.invoiceNumber === "string"
            ? record.invoiceNumber
            : undefined,
    invoiceNumber: typeof record.invoiceNumber === "string" ? record.invoiceNumber : undefined,
    investedAmount: typeof record.investedAmount === "number" ? record.investedAmount : undefined,
    totalTaxAmount: typeof taxes?.totalTaxAmount === "string" ? taxes.totalTaxAmount : undefined,
    externalPaymentId: typeof record.externalPaymentId === "string" ? record.externalPaymentId : undefined,
  };
}

function formatTransactionType(type?: string) {
  return String(type ?? "-").replace(/_/g, " ").toUpperCase();
}

function formatTransactionDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTransactionTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function toDateInputValue(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDateKeys(value?: string) {
  if (!value) return [];
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return [];

  const localKey = toDateInputValue(value);
  const utcKey = date.toISOString().slice(0, 10);

  return localKey === utcKey ? [localKey] : [localKey, utcKey];
}

function statusBadgeVariant(status?: string) {
  const normalized = String(status ?? "").toUpperCase();
  if (normalized === "SUCCESS" || normalized === "COMPLETED" || normalized === "PAID") return "success";
  if (normalized === "PENDING" || normalized === "PROCESSING" || normalized === "IN_PROGRESS") return "warning";
  if (normalized === "FAILED" || normalized === "ERROR" || normalized === "CANCELLED" || normalized === "REFUNDED") return "destructive";
  return "outline";
}

export default function TransactionsList() {
  const { data: usersData } = useListUsers({ page: 1, limit: 1000 });
  const { mutate: retryTxn } = useRetryTransaction();
  const { mutate: refundTxn } = useRefundTransaction();

  const [transactions, setTransactions] = React.useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [dateValue, setDateValue] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const userNameById = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const user of unwrapUsers(usersData)) {
      if (!user || typeof user !== "object") continue;
      const record = user as Record<string, unknown>;
      const rawId = record.id ?? record._id;
      if (typeof rawId !== "string") continue;
      map.set(
        rawId,
        typeof record.name === "string"
          ? record.name
          : typeof record.email === "string"
            ? record.email
            : typeof record.phone === "string"
              ? record.phone
              : rawId,
      );
    }
    return map;
  }, [usersData]);

  const orderedTransactions = React.useMemo(() => {
    return [...transactions].sort((a, b) => {
      const aTime = new Date(a.createdAt ?? a.executedAt ?? 0).getTime();
      const bTime = new Date(b.createdAt ?? b.executedAt ?? 0).getTime();
      if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
      if (Number.isNaN(aTime)) return 1;
      if (Number.isNaN(bTime)) return -1;
      if (aTime !== bTime) return bTime - aTime;
      return String(b.id).localeCompare(String(a.id));
    });
  }, [transactions]);

  React.useEffect(() => {
    let active = true;

    const loadTransactions = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const response = await customFetch<TransactionListResponse>(TRANSACTION_LIST_URL, {
          method: "GET",
        });

        if (!active) return;

        const list = unwrapTransactions(response)
          .map(normalizeTransaction)
          .filter((txn): txn is TransactionItem => txn !== null);

        setTransactions(list);
      } catch {
        if (!active) return;
        setIsError(true);
      } finally {
        if (!active) return;
        setIsLoading(false);
      }
    };

    void loadTransactions();
    return () => {
      active = false;
    };
  }, []);

  const filteredTransactions = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return orderedTransactions.filter((txn) => {
      const id = String(txn.id ?? "").toLowerCase();
      const userName = String(txn.userName ?? txn.user?.name ?? userNameById.get(txn.userId ?? "") ?? "").toLowerCase();
      const userId = String(txn.userId ?? "").toLowerCase();
      const providerId = String(txn.providerId ?? "").toLowerCase();
      const referenceId = String(txn.referenceId ?? "").toLowerCase();
      const invoiceNumber = String(txn.invoiceNumber ?? "").toLowerCase();
      const externalPaymentId = String(txn.externalPaymentId ?? "").toLowerCase();
      const merchantTransactionId = String(txn.merchantTransactionId ?? "").toLowerCase();
      const transactionType = String(txn.transactionType ?? txn.type ?? "").toLowerCase();
      const metalType = String(txn.metalType ?? txn.paymentMethod ?? "").toLowerCase();

      const matchesSearch =
        term.length === 0 ||
        id.includes(term) ||
        userName.includes(term) ||
        userId.includes(term) ||
        providerId.includes(term) ||
        referenceId.includes(term) ||
        invoiceNumber.includes(term) ||
        externalPaymentId.includes(term) ||
        merchantTransactionId.includes(term) ||
        transactionType.includes(term) ||
        metalType.includes(term);

      if (!dateValue) return matchesSearch;
      return matchesSearch && toDateKeys(txn.createdAt ?? txn.executedAt).includes(dateValue);
    });
  }, [dateValue, orderedTransactions, searchTerm, userNameById]);

  React.useEffect(() => {
    setPage(1);
  }, [dateValue, searchTerm]);

  const totalFiltered = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTransactions = React.useMemo(() => {
    return filteredTransactions.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredTransactions]);

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleRetry = (id: string) => {
    retryTxn({ txnId: id });
    alert(`Retrying transaction ${id}`);
  };

  const handleRefund = (id: string) => {
    if (window.confirm("Are you sure you want to refund this transaction?")) {
      refundTxn({ txnId: id });
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDateValue("");
    setPage(1);
  };

  return (
    <Layout title="Transaction Management">
      <Card>
        <div className="p-4 border-b border-border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by Txn ID, User, or Reference..."
              className="pl-10"
            />
          </div>
          <Input type="date" value={dateValue} onChange={(event) => setDateValue(event.target.value)} className="w-auto" />
          <Button variant="outline" onClick={handleClearFilters} disabled={!searchTerm && !dateValue}>
            Clear
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted">
              <tr>
                <th className="px-4 py-4 font-medium">User</th>
                <th className="px-3 py-4 font-medium w-[170px]">Transaction Content</th>
                 <th className="px-4 py-4 font-medium w-[120px]">Invoice</th>
                <th className="px-4 py-4 font-medium w-[120px]">Metal Type</th>
                {/* <th className="px-4 py-4 font-medium w-[140px]">Transaction Type</th> */}
                <th className="px-4 py-4 font-medium w-[120px]">Amount</th>
                <th className="px-4 py-4 font-medium w-[120px]">Status</th>
                <th className="px-4 py-4 font-medium w-[160px]">Date & Time</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Loading transactions...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-destructive">
                    Failed to load transactions.
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((txn) => {
                  const transactionId = txn.razorpayPaymentId ?? txn.merchantTransactionId ?? txn.id;
                  const displayUserName = txn.userName ?? txn.user?.name ?? userNameById.get(txn.userId ?? "") ?? "-";

                  return (
                    <tr key={transactionId} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="px-4 py-4 font-medium text-foreground">
                        <p className="truncate max-w-[160px]">{displayUserName}</p>
                      </td>

                      <td className="px-3 py-4 w-[170px]">
                        <p
                          className="max-w-[140px] truncate font-mono text-xs text-muted-foreground"
                          title={transactionId}
                        >
                          {transactionId}
                        </p>
                          <p className="font-mono text-xs  text-muted-foreground">
                          {formatTransactionType(txn.transactionType ?? txn.type)}
                        </p>
                      </td>
                         <td className="px-4 py-4">
                        <p className="font-mono text-xs text-muted-foreground">{txn.invoiceNumber ?? "-"}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-mono text-xs text-muted-foreground">{txn.metalType ?? "-"}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-bold text-foreground">
                          {typeof txn.amount === "number" ? formatCurrency(txn.amount) : "-"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <Badge variant={statusBadgeVariant(txn.status)} className="capitalize">
                          {String(txn.status ?? "unknown").toUpperCase()}
                        </Badge>
                        {txn.failureReason && (
                          <p className="mt-1 max-w-[150px] truncate text-[10px] text-red-400" title={txn.failureReason}>
                            {txn.failureReason}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4 text-muted-foreground">
                        <div className="space-y-1">
                          <p>{formatTransactionDate(txn.createdAt ?? txn.executedAt)}</p>
                          <p className="text-xs">{formatTransactionTime(txn.createdAt ?? txn.executedAt)}</p>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-white/5 flex justify-between items-center text-sm text-muted-foreground">
          <p>
            Showing {totalFiltered === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, totalFiltered)} of{" "}
            {totalFiltered} entries
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </Layout>
  );
}
