import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Layout } from "@/components/layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
} from "@/components/ui";
import { ArrowLeft, CheckCircle, XCircle, Clock, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";
import { customFetch } from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { adminUsersApiConfig, buildAdminUsersApiUrl } from "@/lib/api-config";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type UserDocument =
  | string
  | {
      _id?: string;
      status?: string;
      docType?: string;
      fileName?: string;
      mediaUrl?: string;
      url?: string;
      name?: string;
      type?: string;
      title?: string;
    };

type DocumentEntry = {
  id: string;
  label: string;
  url: string | null;
};

const SELECTED_USER_STORAGE_KEY = "gfolio-admin:selected-user";
const ADMIN_USERS_ENDPOINT = buildAdminUsersApiUrl("/admin/getAdminUsers");
const ADMIN_USERS_QUERY_KEY = [ADMIN_USERS_ENDPOINT] as const;
const DOCUMENTS_ENDPOINTS = {VERIFY_KYC: "/admin/verifykyc",} as const;

async function fetchAdminUsers() {
  return customFetch<{ users?: unknown[]; total?: number; page?: number; limit?: number }>(
    ADMIN_USERS_ENDPOINT,
    { method: "GET" },
  );
}

function resolveDocumentUrl(document: UserDocument | undefined, fallbackBaseUrl = ""): string | null {
  if (!document) return null;

  if (typeof document === "string") {
    if (/^https?:\/\//i.test(document)) return document;
    if (document.startsWith("/")) return document;
    return `${fallbackBaseUrl}/${document}`.replace(/([^:]\/)\/+/g, "$1");
  }

  const rawUrl = document.mediaUrl ?? document.url ?? document.name ?? document.fileName ?? document.title;
  if (!rawUrl) return null;
  if (/^https?:\/\//i.test(rawUrl) || rawUrl.startsWith("/")) return rawUrl;
  return `${fallbackBaseUrl}/${rawUrl}`.replace(/([^:]\/)\/+/g, "$1");
}

function formatDocumentLabel(value?: string | null, fallback = "Document") {
  const normalized = String(value ?? "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return fallback;

  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
}

function getDocumentEntries(profile: any): DocumentEntry[] {
  const documents: UserDocument[] = Array.isArray(profile?.documents)
    ? profile.documents
    : Array.isArray(profile?.kycDocuments)
      ? profile.kycDocuments
      : [];

  const fallbackBaseUrl = adminUsersApiConfig.baseUrl;
  return documents.map((document, index) => {
    if (typeof document === "string") {
      const fileName = document.split("/").pop() ?? document;
      const inferredType = fileName.replace(/\.[^/.]+$/, "");

      return {
        id: `${index}-${document}`,
        label: formatDocumentLabel(inferredType),
        url: resolveDocumentUrl(document, fallbackBaseUrl),
      };
    }

    const labelSource =
      document.docType ??
      document.type ??
      document.title ??
      document.fileName ??
      document.name;

    return {
      id: document._id ?? `${index}-${labelSource ?? "document"}`,
      label: formatDocumentLabel(labelSource),
      url: resolveDocumentUrl(document, fallbackBaseUrl),
    };
  });
}

function unwrapProfile(data: unknown): any {
  if (!data || typeof data !== "object") return data;

  const record = data as Record<string, unknown>;
  if ("data" in record && record.data) return record.data;
  if ("user" in record && record.user) return record.user;

  return data;
}

function normalizeUser(value: unknown): any | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const rawId = record.id ?? record._id;

  if (typeof rawId !== "string") return null;

  return {
    id: rawId,
    ...record,
  };
}

function extractUsers(data: unknown): any[] {
  const payload = unwrapProfile(data);
  if (!payload) return [];

  if (Array.isArray(payload)) {
    return payload.map(normalizeUser).filter(Boolean);
  }

  if (typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.users)) {
      return record.users.map(normalizeUser).filter(Boolean);
    }
    if (record.data && typeof record.data === "object" && Array.isArray((record.data as Record<string, unknown>).users)) {
      return ((record.data as Record<string, unknown>).users as unknown[]).map(normalizeUser).filter(Boolean);
    }
    const single = normalizeUser(payload);
    return single ? [single] : [];
  }

  return [];
}

function readSelectedUser(id?: string): any | null {
  if (typeof window === "undefined" || !id) return null;

  try {
    const raw = window.sessionStorage.getItem(SELECTED_USER_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const selected = unwrapProfile(parsed);
    const selectedId = selected?.id ?? selected?._id;

    return selectedId === id ? selected : null;
  } catch {
    return null;
  }
}

function kycBadgeVariant(value?: string) {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "approved" || normalized === "verified") return "success";
  if (normalized === "pending" || normalized === "in_review" || normalized === "review") return "warning";
  if (normalized === "rejected" || normalized === "declined" || normalized === "inactive") return "destructive";
  return "outline";
}

export default function UserDetail() {
  const { id } = useParams();
  const { data: usersData } = useQuery({queryKey: [...ADMIN_USERS_QUERY_KEY],queryFn: fetchAdminUsers,});
  const queryClient = useQueryClient();
  const [isUpdatingKyc, setIsUpdatingKyc] = React.useState(false);
  const [kycOverride, setKycOverride] = React.useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [rejectComment, setRejectComment] = React.useState("");

  const [localProfile, setLocalProfile] = React.useState<any>(() => readSelectedUser(id));

  React.useEffect(() => {
    const users = extractUsers(usersData);
    const nextProfile = users.find((user) => user?.id === id || user?._id === id) ?? null;

    if (nextProfile) {
      setLocalProfile((prev: any) => ({ ...(prev ?? {}), ...(nextProfile ?? {}) }));
      return;
    }

    setLocalProfile(readSelectedUser(id));
  }, [id, usersData]);

  const profile = React.useMemo(() => {
    const users = extractUsers(usersData);
    const fetchedProfile = users.find((user) => user?.id === id || user?._id === id) ?? null;
    return fetchedProfile ?? localProfile ?? null;
  }, [id, localProfile, usersData]);
  const documents: UserDocument[] = Array.isArray(profile?.documents)
    ? profile.documents
    : Array.isArray(profile?.kycDocuments)
      ? profile.kycDocuments
      : [];
  const canApproveKyc = documents.length > 0;
  const documentEntries = React.useMemo(() => getDocumentEntries(profile), [profile]);
  const kycValue = kycOverride ?? profile?.kycVerified ?? profile?.kycStatus ?? "pending";

  const handleOpenDocument = (url: string | null) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleKycAction = (kycStatus: "approved" | "rejected", comment = "") => {
    setIsUpdatingKyc(true);
    void customFetch(DOCUMENTS_ENDPOINTS.VERIFY_KYC, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ targetUserId: id!, kycStatus, comment }),
    })
      .then((updatedProfile: any) => {
        setKycOverride(kycStatus);
        setLocalProfile((prev: any) => ({
          ...(prev ?? {}),
          ...(unwrapProfile(updatedProfile) ?? updatedProfile ?? {}),
          kycVerified: kycStatus,
          kycStatus,
        }));
        void queryClient.invalidateQueries({ queryKey: [...ADMIN_USERS_QUERY_KEY] });
      })
      .catch(() => {
        setKycOverride(kycStatus);
        setLocalProfile((prev: any) => ({
          ...prev,
          kycVerified: kycStatus,
          kycStatus,
        }));
      })
      .finally(() => {
        setIsUpdatingKyc(false);
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
                {String(profile?.name ?? "?").charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-foreground">{profile?.name ?? "Unknown User"}</h2>
              <p className="text-muted-foreground capitalize mb-4">
                {profile?.role ? `${profile.role} Account` : "Account"}
              </p>
              <Badge variant={kycBadgeVariant(kycValue)} className="px-4 py-1 text-sm">
                KYC {String(kycValue).toUpperCase()}
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
                <span className="text-foreground">{profile?.email ?? "—"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{profile?.phone ?? "—"}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span className="text-foreground flex-1">{profile?.address ?? "—"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">
                  PAN: <span className="font-mono">{profile?.panNumber ?? "—"}</span>
                </span>
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
                <h3 className="text-3xl font-bold text-primary">{profile?.totalInvested ? formatCurrency(profile.totalInvested) : "—"}</h3>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[#151A21] to-[#0A0A0A]">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-1">Portfolio Value</p>
                <h3 className="text-3xl font-bold text-primary">{profile?.portfolioValue ? formatCurrency(profile.portfolioValue) : "—"}</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Gifts Sent</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{profile?.giftsSent ?? "—"}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <ArrowLeft className="w-5 h-5 text-primary rotate-45" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Gifts Received</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{profile?.giftsReceived ?? "—"}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
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
              <div className="p-4 border border-border rounded-xl bg-muted mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">Review Documents</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Review all submitted documents before approving this user&apos;s KYC.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {documentEntries.length ? (
                        documentEntries.map((document) => (
                          <div key={document.id} className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-muted cursor-pointer"
                              disabled={!document.url}
                              onClick={() => handleOpenDocument(document.url)}
                            >
                              View {document.label}
                            </Button>
                            {!document.url ? (
                              <span className="text-xs text-muted-foreground">File unavailable</span>
                            ) : null}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No documents submitted yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {kycValue === 'pending' && profile ? (
                <div className="flex gap-4">
                    <Button 
                      className="flex-1 cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-foreground shadow-emerald-500/20"
                      onClick={() => handleKycAction('approved')}
                      disabled={isUpdatingKyc || !canApproveKyc}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Approve KYC
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1 cursor-pointer"
                    onClick={() => setRejectOpen(true)}
                    disabled={isUpdatingKyc}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject KYC
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC</DialogTitle>
            <DialogDescription>
              Add a comment before rejecting this user&apos;s KYC request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Textarea
              value={rejectComment}
              onChange={(event) => setRejectComment(event.target.value)}
              placeholder="Enter rejection comment"
              className="min-h-[120px]"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRejectOpen(false);
                setRejectComment("");
              }}
              disabled={isUpdatingKyc}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleKycAction("rejected", rejectComment.trim());
                setRejectOpen(false);
                setRejectComment("");
              }}
              disabled={isUpdatingKyc}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
