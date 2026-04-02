import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Badge, Button, Card } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  BellRing,
  CalendarDays,
  Mail,
  MessageSquare,
  Search,
  Send,
  Smartphone,
  Users,
} from "lucide-react";
import { customFetch, useGetNotificationLogs, useListNotificationTemplates } from "@workspace/api-client-react";
import { buildAdminUsersApiUrl, buildNotificationApiUrl } from "@/lib/api-config";
import { toast } from "@/hooks/use-toast";

type NotificationTypeOption = {
  label: string;
  value: string;
};

type AdminUser = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
};

type NotificationPayload = {
  notificationType: string;
  senderId: string;
  recipientId: string[];
  content: string;
  scheduledAt: string;
  scheduledBy: string;
};

const ADMIN_USERS_ENDPOINT = buildAdminUsersApiUrl("/admin/getAdminUsers");
const SEND_NOTIFICATION_ENDPOINT = buildNotificationApiUrl("/notifications/send");
const ADMIN_USERS_QUERY_KEY = [ADMIN_USERS_ENDPOINT] as const;

const FALLBACK_NOTIFICATION_TYPES: NotificationTypeOption[] = [
  { label: "User Register", value: "user-register" },
  { label: "Corporate Register", value: "corporate-register" },
  { label: "System Generated", value: "system-generated" },
  { label: "Reminder", value: "Reminder" },
];

const MOCK_TEMPLATES = [
  { id: "TPL-1", name: "Gift Received", trigger: "On Gift Send", channel: "email", subject: "You've received a Golden Gift!", body: "...", active: true, createdAt: "2024-01-01T00:00:00Z" },
  { id: "TPL-2", name: "OTP Verification", trigger: "Auth Login", channel: "sms", subject: "", body: "...", active: true, createdAt: "2024-01-01T00:00:00Z" },
  { id: "TPL-3", name: "Campaign Launch", trigger: "Manual", channel: "whatsapp", subject: "", body: "...", active: false, createdAt: "2024-02-01T00:00:00Z" },
];

const MOCK_LOGS = {
  logs: [
    { id: "L-1", templateId: "TPL-1", templateName: "Gift Received", recipient: "john@example.com", channel: "email", status: "delivered", sentAt: "2024-02-21T10:05:00Z", deliveredAt: "2024-02-21T10:05:02Z" },
    { id: "L-2", templateId: "TPL-2", templateName: "OTP Verification", recipient: "+919876543210", channel: "sms", status: "sent", sentAt: "2024-02-21T11:00:00Z" },
    { id: "L-3", templateId: "TPL-1", templateName: "Gift Received", recipient: "error@example.com", channel: "email", status: "failed", sentAt: "2024-02-21T12:00:00Z" },
  ],
  total: 3, page: 1, limit: 10,
};

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
  };
}

async function fetchAdminUsers() {
  return customFetch<{ users?: unknown[] }>(ADMIN_USERS_ENDPOINT, { method: "GET" });
}

function getNotificationTypeOptions() {
  return FALLBACK_NOTIFICATION_TYPES;
}

function readCurrentUserId() {
  if (typeof window === "undefined") return null;

  try {
    const directId = window.localStorage.getItem("id");
    if (directId && directId.trim()) {
      return directId.trim();
    }

    const raw = window.localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const nestedUser =
      parsed.user && typeof parsed.user === "object"
        ? (parsed.user as Record<string, unknown>)
        : parsed.data && typeof parsed.data === "object"
          ? (parsed.data as Record<string, unknown>)
          : null;
    const id =
      parsed.id ??
      parsed._id ??
      parsed.userId ??
      nestedUser?.id ??
      nestedUser?._id ??
      nestedUser?.userId;
    return typeof id === "string" ? id : null;
  } catch {
    return null;
  }
}

function formatScheduleDate(value: string) {
  if (!value) return "";
  return value.replace(/-/g, "/");
}

export default function NotificationsList() {
  const queryClient = useQueryClient();
  const { data: tplData, isError: tplErr } = useListNotificationTemplates();
  const { data: logsData, isError: logsErr } = useGetNotificationLogs();
  const { data: usersData } = useQuery({
    queryKey: [...ADMIN_USERS_QUERY_KEY],
    queryFn: fetchAdminUsers,
  });

  const [createOpen, setCreateOpen] = React.useState(false);
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([]);
  const [selectedNotificationType, setSelectedNotificationType] = React.useState("");
  const [content, setContent] = React.useState("");
  const [scheduledDate, setScheduledDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [recipientSearch, setRecipientSearch] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);

  const templates = (tplData && !tplErr) ? tplData : MOCK_TEMPLATES;
  const logs = (logsData && !logsErr) ? logsData : MOCK_LOGS;

  const notificationTypeOptions = React.useMemo(() => getNotificationTypeOptions(), []);

  const adminUsers = React.useMemo(() => {
    const rawUsers = Array.isArray(usersData?.users) ? usersData.users : [];
    return rawUsers
      .map(normalizeUser)
      .filter((user): user is AdminUser => user !== null);
  }, [usersData]);

  const filteredUsers = React.useMemo(() => {
    const term = recipientSearch.trim().toLowerCase();
    if (!term) return adminUsers;

    return adminUsers.filter((user) => {
      const name = String(user.name ?? "").toLowerCase();
      const email = String(user.email ?? "").toLowerCase();
      const phone = String(user.phone ?? "").toLowerCase();
      return name.includes(term) || email.includes(term) || phone.includes(term);
    });
  }, [adminUsers, recipientSearch]);

  const toggleRecipient = React.useCallback((userId: string) => {
    setSelectedUsers((current) =>
      current.includes(userId) ? current.filter((value) => value !== userId) : [...current, userId],
    );
  }, []);

  const resetCreateForm = React.useCallback(() => {
    setSelectedUsers([]);
    setSelectedNotificationType("");
    setContent("");
    setScheduledDate(new Date().toISOString().slice(0, 10));
    setRecipientSearch("");
  }, []);

  const handleSendNotification = async () => {
    const senderId = readCurrentUserId();

    if (!selectedNotificationType) {
      toast({ title: "Missing type", description: "Select a notification type first." });
      return;
    }

    if (selectedUsers.length === 0) {
      toast({ title: "No recipients", description: "Choose at least one user to notify." });
      return;
    }

    if (!content.trim()) {
      toast({ title: "Missing content", description: "Enter the notification message." });
      return;
    }

    if (!scheduledDate) {
      toast({ title: "Missing schedule", description: "Choose a scheduled date." });
      return;
    }

    if (!senderId) {
      toast({ title: "Missing sender", description: "Could not find sender id in localStorage." });
      return;
    }

    const payload: NotificationPayload = {
      notificationType: selectedNotificationType,
      senderId,
      recipientId: selectedUsers,
      content: content.trim(),
      scheduledAt: formatScheduleDate(scheduledDate),
      scheduledBy: senderId,
    };

    setIsSending(true);
    try {
      const response = await customFetch<{ message?: string }>(SEND_NOTIFICATION_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      toast({
        title: "Notification queued",
        description: response?.message || "Notification has been scheduled successfully.",
      });
      setCreateOpen(false);
      resetCreateForm();
      void queryClient.invalidateQueries({ queryKey: ["/api/notifications/logs"] });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to send notification. Update the endpoint if your backend uses a different route.";

      toast({
        title: "Send failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const getIcon = (channel: string) => {
    switch (channel) {
      case "email": return <Mail className="w-4 h-4" />;
      case "sms": return <MessageSquare className="w-4 h-4" />;
      case "whatsapp": return <Smartphone className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <Layout title="Notifications & Comms">
      <Card>
        <div className="p-6 border-b border-border flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-foreground">Delivery Logs</h3>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => setCreateOpen(true)}>
              Create Notification
            </Button>
            <Button variant="outline" size="sm" className="cursor-pointer">Export Logs</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted">
              <tr>
                <th className="px-6 py-4 font-medium">Template / Recipient</th>
                <th className="px-6 py-4 font-medium">Channel</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Sent At</th>
              </tr>
            </thead>
            <tbody>
              {logs.logs.map((log: any) => (
                <tr key={log.id} className="border-b border-border hover:bg-muted transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-foreground">{log.templateName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{log.recipient}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground capitalize">
                      {getIcon(log.channel)} {log.channel}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        log.status === "delivered"
                          ? "success"
                          : log.status === "failed"
                            ? "destructive"
                            : "warning"
                      }
                      className="capitalize"
                    >
                      {log.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(log.sentAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-4xl rounded-[24px] border-border bg-card p-0 shadow-2xl">
          <div className="border-b border-border bg-gradient-to-r from-emerald-500/8 via-emerald-500/4 to-transparent px-5 py-3.5">
            <DialogHeader className="gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <BellRing className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle>Create Notification</DialogTitle>
                  <DialogDescription>
                    Schedule a message for selected users using the notification service.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="grid gap-5 px-5 py-4 md:grid-cols-[1fr_1.2fr]">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Notification Type</label>
                <Select value={selectedNotificationType} onValueChange={setSelectedNotificationType}>
                  <SelectTrigger className="h-11 rounded-xl border-border bg-background">
                    <SelectValue placeholder="Select notification type" />
                  </SelectTrigger>
                  <SelectContent>
                    {notificationTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Scheduled Date</label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(event) => setScheduledDate(event.target.value)}
                    className="h-11 rounded-xl border-border bg-background pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Content</label>
                <Textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Enter notification message..."
                  rows={3}
                  className="rounded-2xl border-border bg-background resize-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-3xl border border-border bg-muted/30 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Recipients</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedUsers.length} selected
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-background text-primary">
                    <Users className="h-4 w-4" />
                  </div>
                </div>

                <div className="relative mb-3">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={recipientSearch}
                    onChange={(event) => setRecipientSearch(event.target.value)}
                    placeholder="Search users by name, email, or phone"
                    className="h-11 rounded-xl border-border bg-background pl-10"
                  />
                </div>

                <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                  {filteredUsers.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-6 text-center text-sm text-muted-foreground">
                      No users match this search.
                    </div>
                  ) : (
                    filteredUsers.map((user) => {
                      const checked = selectedUsers.includes(user.id);
                      return (
                        <label
                          key={user.id}
                          className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition-colors hover:bg-muted/60"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleRecipient(user.id)}
                            className="mt-1"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{user.name ?? "Unnamed user"}</p>
                            <p className="truncate text-xs text-muted-foreground">{user.email ?? user.phone ?? user.id}</p>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border px-5 py-3.5 sm:justify-between sm:space-x-0">
            <Button
              variant="ghost"
              className="cursor-pointer"
              onClick={resetCreateForm}
              disabled={isSending}
            >
              Reset
            </Button>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => setCreateOpen(false)}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                className="cursor-pointer gap-2"
                onClick={() => void handleSendNotification()}
                disabled={isSending}
              >
                <Send className="h-4 w-4" />
                {isSending ? "Sending..." : "Send Notification"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
