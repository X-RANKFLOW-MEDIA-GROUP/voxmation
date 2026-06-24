import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactsTable } from "@/components/crm/ContactsTable";
import { BarChart3, Users, TrendingUp, Phone } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  source: string;
  lead_score: number;
  tags: string[];
  last_contacted_at?: string;
  created_at: string;
}

export const CRM = () => {
  const { account, canAccess } = useAuth();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [view, setView] = useState<"contacts" | "pipeline" | "analytics">(
    "contacts"
  );

  if (!account) {
    return (
      <div className="p-8 text-center">
        <p>Please select an account first</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">CRM</h1>
        <p className="text-muted-foreground mt-2">
          Manage your contacts, opportunities, and sales pipeline
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Contacts</p>
                <p className="text-3xl font-bold mt-1">0</p>
              </div>
              <Users className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Leads</p>
                <p className="text-3xl font-bold mt-1">0</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Deals</p>
                <p className="text-3xl font-bold mt-1">0</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Calls This Week</p>
                <p className="text-3xl font-bold mt-1">0</p>
              </div>
              <Phone className="w-8 h-8 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Manage</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={view} onValueChange={(v) => setView(v as any)}>
            <TabsList>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              {canAccess("view_analytics") && (
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="contacts" className="mt-6">
              <ContactsTable onSelectContact={setSelectedContact} />
            </TabsContent>

            <TabsContent value="pipeline" className="mt-6">
              <div className="py-8 text-center text-muted-foreground">
                <p>Pipeline view coming soon</p>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="py-8 text-center text-muted-foreground">
                <p>Analytics dashboard coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Contact Detail Panel */}
      {selectedContact && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedContact.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{selectedContact.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{selectedContact.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Company</p>
                <p className="font-medium">{selectedContact.company || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lead Score</p>
                <p className="font-medium">{selectedContact.lead_score}/100</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
