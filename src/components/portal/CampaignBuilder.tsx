import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Send,
  Users,
  Eye,
  Settings,
  Bold,
  Italic,
  Link as LinkIcon,
  Type,
  X,
} from "lucide-react";

interface Recipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface ScheduleSettings {
  type: "immediate" | "scheduled" | "recurring";
  date?: string;
  time?: string;
  timezone?: string;
  recurrencePattern?: string;
}

interface CampaignBuilderProps {
  type: "email" | "sms" | "automation";
}

const demoRecipients: Recipient[] = [
  { id: "1", name: "Sarah Mitchell", email: "sarah.m@email.com", phone: "(512) 555-0134" },
  { id: "2", name: "James Wilson", email: "jwilson@email.com", phone: "(512) 555-0189" },
  { id: "3", name: "Maria Gonzalez", email: "maria.g@email.com", phone: "(512) 555-0092" },
  { id: "4", name: "David Chen", email: "dchen@email.com", phone: "(512) 555-0067" },
  { id: "5", name: "Emily Rodriguez", email: "emily.r@email.com", phone: "(512) 555-0201" },
  { id: "6", name: "Robert Johnson", email: "rjohnson@email.com", phone: "(512) 555-0318" },
  { id: "7", name: "Lisa Thompson", email: "lisa.t@email.com", phone: "(512) 555-0445" },
  { id: "8", name: "Michael Park", email: "mpark@email.com", phone: "(512) 555-0109" },
];

const segmentFilters = [
  { id: "lead_score", label: "Lead Score", values: ["90+", "70-89", "50-69", "<50"] },
  { id: "status", label: "Lead Status", values: ["new", "contacted", "qualified", "booked", "lost"] },
  { id: "city", label: "City", values: ["Austin", "Round Rock", "Cedar Park", "Pflugerville", "Georgetown"] },
  { id: "service", label: "Service Type", values: ["AC Repair", "Electrical", "Plumbing", "Maintenance Plan", "Installation"] },
];

const CampaignBuilder = ({ type }: CampaignBuilderProps) => {
  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<Record<string, string[]>>({});
  const [schedule, setSchedule] = useState<ScheduleSettings>({
    type: "immediate",
    timezone: "America/Chicago",
  });
  const [showPreview, setShowPreview] = useState(false);
  const [showEditorMenu, setShowEditorMenu] = useState(false);

  const filteredRecipients = useMemo(() => {
    if (Object.keys(selectedSegments).length === 0) {
      return demoRecipients.filter((r) => selectedRecipients.includes(r.id));
    }

    // Filter based on selected segments (simplified logic)
    return demoRecipients.filter((r) =>
      selectedRecipients.length === 0 || selectedRecipients.includes(r.id)
    );
  }, [selectedRecipients, selectedSegments]);

  const handleSelectRecipient = (recipientId: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(recipientId)
        ? prev.filter((id) => id !== recipientId)
        : [...prev, recipientId]
    );
  };

  const handleSelectAll = () => {
    setSelectedRecipients(
      selectedRecipients.length === demoRecipients.length
        ? []
        : demoRecipients.map((r) => r.id)
    );
  };

  const toggleSegmentFilter = (filterId: string, value: string) => {
    setSelectedSegments((prev) => {
      const current = prev[filterId] || [];
      return {
        ...prev,
        [filterId]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  const handleInsertVariable = (variable: string) => {
    setContent((prev) => prev + `{{${variable}}}`);
  };

  return (
    <div className="space-y-6">
      {/* Campaign Name */}
      <Card className="bg-surface-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Campaign Details</CardTitle>
          <CardDescription>Set up your campaign basics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="campaign-name" className="text-sm font-mono mb-2 block">
              Campaign Name
            </Label>
            <Input
              id="campaign-name"
              placeholder="e.g., June Follow-Up Campaign"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="bg-muted border-border/50"
            />
          </div>
          {type === "email" && (
            <div>
              <Label htmlFor="subject" className="text-sm font-mono mb-2 block">
                Email Subject
              </Label>
              <Input
                id="subject"
                placeholder="e.g., Your AC Service Awaits - 20% Off"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-muted border-border/50"
              />
              <p className="text-[10px] text-silver mt-1">
                Use {'{{first_name}}'} for personalization
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Editor */}
      <Card className="bg-surface-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">
              {type === "email" ? "Email Body" : type === "sms" ? "Message" : "Automation Content"}
            </CardTitle>
            <CardDescription>Create your campaign message</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEditorMenu(!showEditorMenu)}
            className="text-primary/70 hover:bg-primary/8"
          >
            <Type className="h-4 w-4 mr-2" />
            Format
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showEditorMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/50 border border-border/30"
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => setContent((prev) => `${prev}**bold**`)}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => setContent((prev) => `${prev}*italic*`)}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => setContent((prev) => `${prev}[link](url)`)}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
              <div className="border-l border-border/30" />
              <div className="text-[10px] text-silver flex items-center gap-2 px-2">
                Variables:
              </div>
              {["first_name", "last_name", "email", "phone", "city"].map((var_name) => (
                <Button
                  key={var_name}
                  variant="outline"
                  size="sm"
                  className="h-8 text-[10px] bg-primary/5 border-primary/15 hover:bg-primary/10"
                  onClick={() => handleInsertVariable(var_name)}
                >
                  {"{{"}{var_name}{"}"}
                </Button>
              ))}
            </motion.div>
          )}

          <div className="relative">
            <Textarea
              placeholder={
                type === "email"
                  ? "Write your email content here... Use {{variables}} for personalization"
                  : type === "sms"
                    ? "Keep it concise (160 characters recommended)"
                    : "Define your automation workflow content..."
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[250px] bg-muted border-border/50 font-mono text-sm resize-none"
            />
            <div className="absolute bottom-3 right-3 text-[10px] text-silver">
              {type === "sms" && `${content.length}/160`}
              {type === "email" && `${content.length} characters`}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="border-border/50"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? "Hide" : "Show"} Preview
            </Button>
          </div>

          {showPreview && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-muted/50 border border-border/30"
            >
              <div className="text-[10px] font-mono text-silver mb-2 uppercase tracking-wider">
                Preview
              </div>
              {type === "email" && (
                <div className="space-y-2">
                  <div className="text-xs font-bold">
                    Subject: <span className="text-primary/70">{subject || "(empty)"}</span>
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/80">
                    {content || "(empty)"}
                  </div>
                </div>
              )}
              {type === "sms" && (
                <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/80 max-w-sm">
                  {content || "(empty)"}
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Recipient Selection */}
      <Card className="bg-surface-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary/60" />
            Recipients & Segments
          </CardTitle>
          <CardDescription>
            Select recipients or filter by segments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Segment Filters */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-silver uppercase tracking-wider">
              Filter by Segments
            </div>
            <div className="space-y-3">
              {segmentFilters.map((filter) => (
                <div key={filter.id} className="space-y-2">
                  <Label className="text-xs font-mono text-silver">{filter.label}</Label>
                  <div className="flex flex-wrap gap-2">
                    {filter.values.map((value) => (
                      <button
                        key={`${filter.id}-${value}`}
                        onClick={() => toggleSegmentFilter(filter.id, value)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-mono transition-all ${
                          selectedSegments[filter.id]?.includes(value)
                            ? "bg-primary/20 border border-primary/40 text-primary"
                            : "bg-muted border border-border/30 text-silver hover:bg-muted/80"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border/30 pt-4" />

          {/* Direct Recipient Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono font-bold text-silver uppercase tracking-wider">
                Direct Selection
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-[10px] h-auto py-1 px-2"
              >
                {selectedRecipients.length === demoRecipients.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
              {demoRecipients.map((recipient) => (
                <div
                  key={recipient.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={`recipient-${recipient.id}`}
                    checked={selectedRecipients.includes(recipient.id)}
                    onCheckedChange={() => handleSelectRecipient(recipient.id)}
                  />
                  <label
                    htmlFor={`recipient-${recipient.id}`}
                    className="flex-1 cursor-pointer text-xs"
                  >
                    <div className="font-mono font-bold text-foreground">
                      {recipient.name}
                    </div>
                    <div className="text-silver text-[10px]">
                      {recipient.email}
                      {recipient.phone && ` • ${recipient.phone}`}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {selectedRecipients.length > 0 && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/15">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-primary/70">
                  {selectedRecipients.length} recipient{selectedRecipients.length !== 1 ? "s" : ""} selected
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedRecipients.slice(0, 3).map((id) => {
                    const recipient = demoRecipients.find((r) => r.id === id);
                    return (
                      <Badge key={id} variant="secondary" className="text-[10px]">
                        {recipient?.name.split(" ")[0]}
                      </Badge>
                    );
                  })}
                  {selectedRecipients.length > 3 && (
                    <Badge variant="secondary" className="text-[10px]">
                      +{selectedRecipients.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Settings */}
      <Card className="bg-surface-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary/60" />
            Schedule & Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="schedule-type" className="text-sm font-mono mb-2 block">
                Send Type
              </Label>
              <Select value={schedule.type} onValueChange={(val) =>
                setSchedule((prev) => ({ ...prev, type: val as ScheduleSettings["type"] }))
              }>
                <SelectTrigger id="schedule-type" className="bg-muted border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Send Immediately</SelectItem>
                  <SelectItem value="scheduled">Schedule for Later</SelectItem>
                  <SelectItem value="recurring">Recurring Campaign</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {schedule.type !== "immediate" && (
              <>
                <div>
                  <Label htmlFor="schedule-date" className="text-sm font-mono mb-2 block">
                    Date
                  </Label>
                  <Input
                    id="schedule-date"
                    type="date"
                    value={schedule.date || ""}
                    onChange={(e) =>
                      setSchedule((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className="bg-muted border-border/50"
                  />
                </div>

                <div>
                  <Label htmlFor="schedule-time" className="text-sm font-mono mb-2 block">
                    Time
                  </Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={schedule.time || ""}
                    onChange={(e) =>
                      setSchedule((prev) => ({ ...prev, time: e.target.value }))
                    }
                    className="bg-muted border-border/50"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <Label htmlFor="timezone" className="text-sm font-mono mb-2 block">
              Timezone
            </Label>
            <Select value={schedule.timezone || "America/Chicago"} onValueChange={(val) =>
              setSchedule((prev) => ({ ...prev, timezone: val }))
            }>
              <SelectTrigger id="timezone" className="bg-muted border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="America/Anchorage">Alaska Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {schedule.type === "recurring" && (
            <div>
              <Label htmlFor="recurrence" className="text-sm font-mono mb-2 block">
                Repeat
              </Label>
              <Select value={schedule.recurrencePattern || ""} onValueChange={(val) =>
                setSchedule((prev) => ({ ...prev, recurrencePattern: val }))
              }>
                <SelectTrigger id="recurrence" className="bg-muted border-border/50">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          size="lg"
          className="flex-1 bg-primary hover:bg-primary/90"
          disabled={!campaignName || !content || selectedRecipients.length === 0}
        >
          <Send className="h-4 w-4 mr-2" />
          {schedule.type === "immediate" ? "Send Campaign" : "Schedule Campaign"}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1 border-border/50"
        >
          <Settings className="h-4 w-4 mr-2" />
          Save as Draft
        </Button>
      </div>
    </div>
  );
};

export default CampaignBuilder;
