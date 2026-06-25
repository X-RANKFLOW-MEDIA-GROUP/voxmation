import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CampaignBuilder from "@/components/portal/CampaignBuilder";
import StatusBadge from "@/components/portal/StatusBadge";
import { Mail, MessageSquare, Workflow, Plus, BarChart3, Archive, Trash2, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Campaign {
  id: string;
  name: string;
  type: "email" | "sms" | "automation";
  status: "draft" | "scheduled" | "sent" | "active" | "paused";
  recipientCount: number;
  sentCount?: number;
  openRate?: number;
  clickRate?: number;
  createdAt: string;
  scheduledFor?: string;
}

const demoCampaigns: Campaign[] = [
  {
    id: "1",
    name: "AC Service Promotion - June",
    type: "email",
    status: "sent",
    recipientCount: 247,
    sentCount: 247,
    openRate: 42,
    clickRate: 18,
    createdAt: "2024-06-20",
  },
  {
    id: "2",
    name: "Appointment Reminder Series",
    type: "sms",
    status: "active",
    recipientCount: 85,
    sentCount: 156,
    openRate: 95,
    clickRate: 0,
    createdAt: "2024-06-15",
  },
  {
    id: "3",
    name: "Lead Nurture - 7 Day Sequence",
    type: "automation",
    status: "active",
    recipientCount: 342,
    sentCount: 1024,
    openRate: 65,
    clickRate: 28,
    createdAt: "2024-06-01",
  },
  {
    id: "4",
    name: "Holiday Special - Limited Time",
    type: "email",
    status: "scheduled",
    recipientCount: 500,
    scheduledFor: "2024-07-01",
    createdAt: "2024-06-18",
  },
  {
    id: "5",
    name: "Review Request Automation",
    type: "automation",
    status: "active",
    recipientCount: 156,
    sentCount: 428,
    openRate: 58,
    clickRate: 15,
    createdAt: "2024-05-20",
  },
  {
    id: "6",
    name: "Seasonal Upsell Campaign",
    type: "email",
    status: "draft",
    recipientCount: 0,
    createdAt: "2024-06-22",
  },
];

const Campaigns = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderType, setBuilderType] = useState<"email" | "sms" | "automation">("email");

  const emailCampaigns = demoCampaigns.filter((c) => c.type === "email");
  const smsCampaigns = demoCampaigns.filter((c) => c.type === "sms");
  const automationCampaigns = demoCampaigns.filter((c) => c.type === "automation");

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "sms":
        return <MessageSquare className="h-4 w-4" />;
      case "automation":
        return <Workflow className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "email":
        return "bg-blue-500/10 text-blue-600 border-blue-200/30";
      case "sms":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200/30";
      case "automation":
        return "bg-purple-500/10 text-purple-600 border-purple-200/30";
      default:
        return "";
    }
  };

  const handleNewCampaign = (type: "email" | "sms" | "automation") => {
    setBuilderType(type);
    setShowBuilder(true);
  };

  const CampaignCard = ({ campaign }: { campaign: Campaign }) => (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card className="bg-surface-card border-border/50 hover:border-primary/25 transition-all duration-500 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-lg border ${getTypeColor(campaign.type)}`}>
                  {getTypeIcon(campaign.type)}
                </div>
                <StatusBadge status={campaign.status} />
              </div>
              <CardTitle className="text-sm font-mono font-bold text-foreground truncate">
                {campaign.name}
              </CardTitle>
              <CardDescription className="text-[10px] mt-1">
                Created {campaign.createdAt}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/30">
            <div>
              <p className="text-lg font-mono font-bold text-foreground">
                {campaign.recipientCount}
              </p>
              <p className="text-[10px] font-mono text-silver">Recipients</p>
            </div>
            {campaign.sentCount !== undefined && (
              <div>
                <p className="text-lg font-mono font-bold text-foreground">
                  {campaign.sentCount}
                </p>
                <p className="text-[10px] font-mono text-silver">Sent</p>
              </div>
            )}
            {campaign.openRate !== undefined && (
              <div>
                <p className="text-lg font-mono font-bold text-foreground">
                  {campaign.openRate}%
                </p>
                <p className="text-[10px] font-mono text-silver">Open Rate</p>
              </div>
            )}
            {campaign.clickRate !== undefined && (
              <div>
                <p className="text-lg font-mono font-bold text-foreground">
                  {campaign.clickRate}%
                </p>
                <p className="text-[10px] font-mono text-silver">Click Rate</p>
              </div>
            )}
          </div>

          {campaign.scheduledFor && (
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-200/30">
              <p className="text-[10px] font-mono text-amber-700">
                Scheduled for {campaign.scheduledFor}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {campaign.status === "draft" && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-8 text-[10px] bg-primary/10 hover:bg-primary/20 text-primary/80"
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </>
            )}
            {campaign.status === "sent" && (
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-8 text-[10px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-600"
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                Analytics
              </Button>
            )}
            {campaign.status === "active" && (
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-8 text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600"
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                View Stats
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-silver hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div>
      <AnimatePresence mode="wait">
        {!showBuilder ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between gap-4 mb-1">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary/60" />
                  <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
                    Campaigns
                  </h1>
                </div>
                <Button
                  onClick={() => handleNewCampaign("email")}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Campaign
                </Button>
              </div>
              <p className="text-silver text-sm font-mono">
                Email, SMS, and automation campaigns in one place
              </p>
            </motion.div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-surface-card border border-border/50 p-1 h-auto">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  All Campaigns
                </TabsTrigger>
                <TabsTrigger
                  value="email"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </TabsTrigger>
                <TabsTrigger
                  value="sms"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  SMS
                </TabsTrigger>
                <TabsTrigger
                  value="automations"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Workflow className="h-4 w-4 mr-2" />
                  Automations
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-surface-card border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-mono text-silver">
                        Total Campaigns
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-mono font-bold text-foreground">
                        {demoCampaigns.length}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-surface-card border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-mono text-silver">
                        Active Campaigns
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-mono font-bold text-emerald-600">
                        {demoCampaigns.filter((c) => c.status === "active").length}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-surface-card border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-mono text-silver">
                        Messages Sent
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-mono font-bold text-foreground">
                        {demoCampaigns
                          .reduce((sum, c) => sum + (c.sentCount || 0), 0)
                          .toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-surface-card border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-mono text-silver">
                        Avg. Open Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-mono font-bold text-blue-600">
                        {Math.round(
                          demoCampaigns
                            .filter((c) => c.openRate)
                            .reduce((sum, c) => sum + (c.openRate || 0), 0) /
                          demoCampaigns.filter((c) => c.openRate).length
                        )}
                        %
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Campaigns */}
                <div>
                  <h2 className="text-lg font-mono font-bold text-foreground mb-4">
                    Recent Campaigns
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {demoCampaigns.slice(0, 4).map((campaign) => (
                      <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Email Tab */}
              <TabsContent value="email" className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleNewCampaign("email")}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Email Campaign
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {emailCampaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                  {emailCampaigns.length === 0 && (
                    <Card className="col-span-full bg-surface-card border-border/50 border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Mail className="h-12 w-12 text-silver/30 mb-3" />
                        <p className="text-sm font-mono text-silver">
                          No email campaigns yet
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* SMS Tab */}
              <TabsContent value="sms" className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleNewCampaign("sms")}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New SMS Campaign
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {smsCampaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                  {smsCampaigns.length === 0 && (
                    <Card className="col-span-full bg-surface-card border-border/50 border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <MessageSquare className="h-12 w-12 text-silver/30 mb-3" />
                        <p className="text-sm font-mono text-silver">
                          No SMS campaigns yet
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Automations Tab */}
              <TabsContent value="automations" className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleNewCampaign("automation")}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Automation
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {automationCampaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                  {automationCampaigns.length === 0 && (
                    <Card className="col-span-full bg-surface-card border-border/50 border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Workflow className="h-12 w-12 text-silver/30 mb-3" />
                        <p className="text-sm font-mono text-silver">
                          No automation campaigns yet
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        ) : (
          <motion.div
            key="builder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Builder Header */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowBuilder(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Mail className="h-5 w-5 text-primary/60" />
                </button>
                <div>
                  <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
                    Create {builderType.charAt(0).toUpperCase() + builderType.slice(1)} Campaign
                  </h1>
                  <p className="text-silver text-sm font-mono">
                    Design and schedule your campaign
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowBuilder(false)}
                className="text-silver hover:text-foreground"
              >
                Back
              </Button>
            </div>

            {/* Builder Component */}
            <CampaignBuilder type={builderType} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Campaigns;
