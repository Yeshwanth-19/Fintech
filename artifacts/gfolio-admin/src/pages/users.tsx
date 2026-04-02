import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Card, Input, Badge, Button } from "@/components/ui";
import { Search, Filter, Eye } from "lucide-react";
import { customFetch } from "@workspace/api-client-react";
import { formatDate } from "@/lib/utils";
import { buildAdminUsersApiUrl } from "@/lib/api-config";

type AdminUser = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  kycVerified?: string;
  isActive?: boolean;
  createdAt?: string;
  documents?: unknown[];
};

const SELECTED_USER_STORAGE_KEY = "gfolio-admin:selected-user";
const ADMIN_USERS_ENDPOINT = buildAdminUsersApiUrl("/admin/getAdminUsers");
const ADMIN_USERS_QUERY_KEY = [ADMIN_USERS_ENDPOINT] as const;

async function fetchAdminUsers() {
  return customFetch<{ users?: unknown[]; total?: number; page?: number; limit?: number }>(
    ADMIN_USERS_ENDPOINT,
    { method: "GET" },
  );
}

function normalizeUser(value: unknown): AdminUser | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const rawId = record.id ?? record._id;
  if (typeof rawId !== "string") return null;

  return {
    id: rawId,
    name: typeof record.name === "string" ? record.name : undefined,
    email: typeof record.email === "string" ? record.email : undefined,
    phone: typeof record.phone === "string" ? record.phone : undefined,
    role: typeof record.role === "string" ? record.role : undefined,
    kycVerified:
      typeof record.kycVerified === "string"
        ? record.kycVerified
        : typeof record.kycStatus === "string"
          ? record.kycStatus
          : undefined,
    isActive: typeof record.isActive === "boolean" ? record.isActive : undefined,
    createdAt: typeof record.createdAt === "string" ? record.createdAt : undefined,
    documents: Array.isArray(record.documents) ? record.documents : undefined,
  };
}

function unwrapPayload(data: unknown): unknown {
  if (!data || typeof data !== "object") return data;
  const record = data as Record<string, unknown>;
  return "data" in record ? record.data : data;
}

function normalizeUsers(data: unknown): AdminUser[] {
  const payload = unwrapPayload(data);
  if (!payload) return [];

  if (Array.isArray((payload as { users?: unknown }).users)) {
    return (payload as { users: unknown[] }).users
      .map(normalizeUser)
      .filter((user): user is AdminUser => user !== null);
  }

  if (Array.isArray(payload)) {
    return payload
      .map(normalizeUser)
      .filter((user): user is AdminUser => user !== null);
  }

  const single = normalizeUser(payload);
  return single ? [single] : [];
}

function kycBadgeVariant(value?: string) {
  if (value === "approved" || value === "verified") return "success";
  if (value === "pending") return "warning";
  return "destructive";
}

function storeSelectedUser(user: AdminUser) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SELECTED_USER_STORAGE_KEY, JSON.stringify(user));
}

export default function UsersList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: [...ADMIN_USERS_QUERY_KEY],
    queryFn: fetchAdminUsers,
  });
  const [searchTerm, setSearchTerm] = React.useState("");
  const [kycFilter, setKycFilter] = React.useState("all");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const users = React.useMemo(() => normalizeUsers(data), [data]);

  const filteredUsers = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter((user) => {
      const name = String(user.name ?? "").toLowerCase();
      const phone = String(user.phone ?? "").toLowerCase();
      const email = String(user.email ?? "").toLowerCase();
      const role = String(user.role ?? "").toLowerCase();
      const kyc = String(user.kycVerified ?? "").toLowerCase();

      const matchesSearch = term.length === 0 || name.includes(term) || phone.includes(term) || email.includes(term);
      const matchesKyc =
        kycFilter === "all" ||
        (kycFilter === "approved" && (kyc === "approved" || kyc === "verified")) ||
        (kycFilter === "pending" && kyc === "pending") ||
        (kycFilter === "rejected" && kyc === "rejected");
      const matchesRole = roleFilter === "all" || role === roleFilter;

      return matchesSearch && matchesKyc && matchesRole;
    });
  }, [users, searchTerm, kycFilter, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pagedUsers = React.useMemo(() => filteredUsers.slice(startIndex, startIndex + pageSize), [filteredUsers, startIndex]);

  const cycleKycFilter = React.useCallback(() => {
    setKycFilter((current) => {
      if (current === "all") return "approved";
      if (current === "approved") return "pending";
      if (current === "pending") return "rejected";
      return "all";
    });
  }, []);

  const cycleRoleFilter = React.useCallback(() => {
    setRoleFilter((current) => {
      if (current === "all") return "admin";
      if (current === "admin") return "corporate";
      if (current === "corporate") return "user";
      return "all";
    });
  }, []);

  React.useEffect(() => {
    setPage(1);
  }, [searchTerm, kycFilter, roleFilter]);

  const kycFilterLabel = kycFilter === "all" ? "KYC Status" : `KYC: ${kycFilter.charAt(0).toUpperCase()}${kycFilter.slice(1)}`;
  const roleFilterLabel = roleFilter === "all" ? "Role" : `Role: ${roleFilter.charAt(0).toUpperCase()}${roleFilter.slice(1)}`;

  return (
    <Layout title="User Management">
      <Card>
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search users by name or phone..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" className="gap-2" onClick={cycleKycFilter} aria-label={`Current ${kycFilterLabel}`}>
              <Filter className="w-4 h-4" /> {kycFilterLabel}
            </Button>
            <Button variant="outline" className="gap-2" onClick={cycleRoleFilter} aria-label={`Current ${roleFilterLabel}`}>
              <Filter className="w-4 h-4" /> {roleFilterLabel}
            </Button>
          </div>
        </div>

        <div className="w-full max-w-full min-w-0 overflow-hidden">
          <table className="w-full table-fixed text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-white/5">
              <tr>
                <th className="px-4 py-4 font-medium w-[32%]">User</th>
                <th className="px-4 py-4 font-medium w-[16%]">Phone</th>
                <th className="px-4 py-4 font-medium w-[12%] text-center">Role</th>
                <th className="px-4 py-4 font-medium w-[14%] text-center">KYC</th>
                <th className="px-4 py-4 font-medium w-[18%] text-center">Created</th>
                <th className="px-4 py-4 font-medium w-[8%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Loading users...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-destructive">
                    Failed to load users.
                  </td>
                </tr>
              ) : pagedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                pagedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                          {String(user.name ?? "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-muted-foreground truncate">{user.name ?? "-"}</p>
                          {user.email ? <p className="text-xs text-gray truncate">{user.email}</p> : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">{user.phone ?? "-"}</td>
                    <td className="px-4 py-4 text-center">
                      <Badge variant={user.role === "corporate" ? "success" : "default"}>
                        {String(user.role ?? "user").toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge variant={kycBadgeVariant(user.kycVerified)}>
                        {String(user.kycVerified ?? "unknown").toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-center text-muted-foreground whitespace-nowrap">
                      {user.createdAt ? formatDate(user.createdAt) : "-"}
                    </td>
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <Link href={`/users/${user.id}`} onClick={() => storeSelectedUser(user)}>
                        <Button variant="ghost" size="icon" className="cursor-pointer">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-white/5 flex justify-between items-center text-sm text-muted-foreground">
          <p>
            Showing {filteredUsers.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, filteredUsers.length)} of{" "}
            {filteredUsers.length} entries
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
              Next
            </Button>
          </div>
        </div>
      </Card>
    </Layout>
  );
}
