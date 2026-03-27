import * as React from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { Mail, MessageSquare, Smartphone, Activity } from "lucide-react";
import { useListNotificationTemplates, useGetNotificationLogs } from "@workspace/api-client-react";
import { formatDate } from "@/lib/utils";

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
  total: 3, page: 1, limit: 10
};

export default function NotificationsList() {
  const { data: tplData, isError: tplErr } = useListNotificationTemplates();
  const { data: logsData, isError: logsErr } = useGetNotificationLogs();

  const templates = (tplData && !tplErr) ? tplData : MOCK_TEMPLATES;
  const logs = (logsData && !logsErr) ? logsData : MOCK_LOGS;

  const getIcon = (channel: string) => {
    switch(channel) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'whatsapp': return <Smartphone className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <Layout title="Notifications & Comms">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Message Templates</h3>
          {templates.map((tpl: any) => (
            <Card key={tpl.id} className={`${tpl.active ? 'border-primary/30' : 'opacity-60'} transition-all`}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-muted rounded-md text-foreground">
                      {getIcon(tpl.channel)}
                    </span>
                    <Badge variant="outline" className="uppercase text-[10px] tracking-wider">{tpl.channel}</Badge>
                  </div>
                  <Badge variant={tpl.active ? 'success' : 'default'}>{tpl.active ? 'Active' : 'Inactive'}</Badge>
                </div>
                <h4 className="font-bold text-foreground text-lg mb-1">{tpl.name}</h4>
                <p className="text-xs text-muted-foreground mb-4">Trigger: {tpl.trigger}</p>
                <Button variant="outline" size="sm" className="w-full bg-transparent border-border">Edit Template</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-2">
          <Card>
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">Delivery Logs</h3>
              <Button variant="outline" size="sm">Export Logs</Button>
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
                        <Badge variant={
                          log.status === 'delivered' ? 'success' : 
                          log.status === 'failed' ? 'destructive' : 'warning'
                        } className="capitalize">
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
        </div>
      </div>
    </Layout>
  );
}
