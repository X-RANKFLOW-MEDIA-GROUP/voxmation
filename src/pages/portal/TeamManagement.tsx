import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Shield,
  Lock,
  Eye,
  MessageSquare,
  ChevronDown,
  X,
  Copy,
  Check,
  Settings,
  Zap,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "manager" | "agent" | "viewer" | "custom";
  customRoleId?: string;
  status: "active" | "pending" | "inactive";
  joinedDate: string;
  lastActive?: string;
  avatar?: string;
  permissions?: string[];
}

interface RolePermission {
  id: string;
  name: string;
  description: string;
  category: "members" | "leads" | "campaigns" | "settings" | "billing" | "reports";
}

interface PredefinedRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
  isDefault: boolean;
}

interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  memberCount: number;
  createdDate: string;
  createdBy: string;
}

type TabType = "members" | "roles" | "permissions";

// Mock Data
const MOCK_PERMISSIONS: RolePermission[] = [
  // Members
  {
    id: "perm_add_member",
    name: "Add Members",
    description: "Invite new team members",
    category: "members",
  },
  {
    id: "perm_remove_member",
    name: "Remove Members",
    description: "Remove members from team",
    category: "members",
  },
  {
    id: "perm_manage_roles",
    name: "Manage Roles",
    description: "Assign and change member roles",
    category: "members",
  },
  {
    id: "perm_view_members",
    name: "View Members",
    description: "View team member list",
    category: "members",
  },

  // Leads
  {
    id: "perm_add_lead",
    name: "Add Leads",
    description: "Create and import leads",
    category: "leads",
  },
  {
    id: "perm_assign_lead",
    name: "Assign Leads",
    description: "Assign leads to team members",
    category: "leads",
  },
  {
    id: "perm_edit_lead",
    name: "Edit Leads",
    description: "Edit lead information",
    category: "leads",
  },
  {
    id: "perm_delete_lead",
    name: "Delete Leads",
    description: "Delete leads from system",
    category: "leads",
  },
  {
    id: "perm_view_lead_details",
    name: "View Lead Details",
    description: "View full lead information",
    category: "leads",
  },

  // Campaigns
  {
    id: "perm_create_campaign",
    name: "Create Campaigns",
    description: "Create new campaigns",
    category: "campaigns",
  },
  {
    id: "perm_edit_campaign",
    name: "Edit Campaigns",
    description: "Edit campaign settings and content",
    category: "campaigns",
  },
  {
    id: "perm_launch_campaign",
    name: "Launch Campaigns",
    description: "Launch and manage campaigns",
    category: "campaigns",
  },
  {
    id: "perm_view_campaign_analytics",
    name: "View Campaign Analytics",
    description: "View campaign metrics and performance",
    category: "campaigns",
  },

  // Settings
  {
    id: "perm_manage_integrations",
    name: "Manage Integrations",
    description: "Configure system integrations",
    category: "settings",
  },
  {
    id: "perm_manage_settings",
    name: "Manage Settings",
    description: "Access team settings",
    category: "settings",
  },
  {
    id: "perm_manage_api_keys",
    name: "Manage API Keys",
    description: "Create and manage API keys",
    category: "settings",
  },

  // Billing
  {
    id: "perm_view_billing",
    name: "View Billing",
    description: "View billing and invoice information",
    category: "billing",
  },
  {
    id: "perm_manage_billing",
    name: "Manage Billing",
    description: "Manage billing and payment methods",
    category: "billing",
  },

  // Reports
  {
    id: "perm_view_reports",
    name: "View Reports",
    description: "Access team reports",
    category: "reports",
  },
  {
    id: "perm_export_reports",
    name: "Export Reports",
    description: "Export reports and data",
    category: "reports",
  },
];

const PREDEFINED_ROLES: PredefinedRole[] = [
  {
    id: "role_owner",
    name: "Owner",
    description: "Full access to all features and settings",
    color: "bg-red-500/10 text-red-600",
    isDefault: false,
    permissions: MOCK_PERMISSIONS.map((p) => p.id),
  },
  {
    id: "role_admin",
    name: "Admin",
    description: "Can manage team, members, and most features",
    color: "bg-orange-500/10 text-orange-600",
    isDefault: false,
    permissions: MOCK_PERMISSIONS.filter(
      (p) => !["perm_manage_billing"].includes(p.id)
    ).map((p) => p.id),
  },
  {
    id: "role_manager",
    name: "Manager",
    description: "Can manage leads, campaigns, and team assignments",
    color: "bg-blue-500/10 text-blue-600",
    isDefault: false,
    permissions: [
      "perm_view_members",
      "perm_add_lead",
      "perm_assign_lead",
      "perm_edit_lead",
      "perm_view_lead_details",
      "perm_create_campaign",
      "perm_edit_campaign",
      "perm_launch_campaign",
      "perm_view_campaign_analytics",
      "perm_view_reports",
    ],
  },
  {
    id: "role_agent",
    name: "Agent",
    description: "Can work with assigned leads and campaigns",
    color: "bg-green-500/10 text-green-600",
    isDefault: false,
    permissions: [
      "perm_view_lead_details",
      "perm_edit_lead",
      "perm_view_campaign_analytics",
      "perm_view_reports",
    ],
  },
  {
    id: "role_viewer",
    name: "Viewer",
    description: "Can view information and reports only",
    color: "bg-gray-500/10 text-gray-600",
    isDefault: true,
    permissions: [
      "perm_view_members",
      "perm_view_lead_details",
      "perm_view_campaign_analytics",
      "perm_view_reports",
    ],
  },
];

const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "member_1",
    name: "Sarah Johnson",
    email: "sarah@company.com",
    role: "owner",
    status: "active",
    joinedDate: "2024-01-15",
    lastActive: "2 minutes ago",
    avatar: "SJ",
    permissions: MOCK_PERMISSIONS.map((p) => p.id),
  },
  {
    id: "member_2",
    name: "Michael Chen",
    email: "michael@company.com",
    role: "admin",
    status: "active",
    joinedDate: "2024-02-10",
    lastActive: "1 hour ago",
    avatar: "MC",
  },
  {
    id: "member_3",
    name: "Emily Rodriguez",
    email: "emily@company.com",
    role: "manager",
    status: "active",
    joinedDate: "2024-03-05",
    lastActive: "30 minutes ago",
    avatar: "ER",
  },
  {
    id: "member_4",
    name: "James Wilson",
    email: "james@company.com",
    role: "agent",
    status: "active",
    joinedDate: "2024-03-20",
    lastActive: "5 hours ago",
    avatar: "JW",
  },
  {
    id: "member_5",
    name: "Lisa Wong",
    email: "lisa@company.com",
    role: "agent",
    status: "active",
    joinedDate: "2024-04-01",
    lastActive: "yesterday",
    avatar: "LW",
  },
  {
    id: "member_6",
    name: "David Brown",
    email: "david@company.com",
    role: "viewer",
    status: "pending",
    joinedDate: "2024-06-20",
    avatar: "DB",
  },
];

const MOCK_CUSTOM_ROLES: CustomRole[] = [
  {
    id: "custom_1",
    name: "Senior Lead Manager",
    description: "Enhanced manager with lead assignment permissions",
    permissions: [
      "perm_view_members",
      "perm_add_lead",
      "perm_assign_lead",
      "perm_edit_lead",
      "perm_view_lead_details",
      "perm_create_campaign",
      "perm_edit_campaign",
      "perm_launch_campaign",
      "perm_view_campaign_analytics",
      "perm_view_reports",
      "perm_manage_api_keys",
    ],
    memberCount: 2,
    createdDate: "2024-05-10",
    createdBy: "Sarah Johnson",
  },
  {
    id: "custom_2",
    name: "Campaign Specialist",
    description: "Focused on campaign creation and optimization",
    permissions: [
      "perm_view_members",
      "perm_create_campaign",
      "perm_edit_campaign",
      "perm_launch_campaign",
      "perm_view_campaign_analytics",
      "perm_view_reports",
      "perm_export_reports",
    ],
    memberCount: 1,
    createdDate: "2024-06-01",
    createdBy: "Sarah Johnson",
  },
];

// Component: Role Badge
const RoleBadge: React.FC<{
  role: string;
  isCustom?: boolean;
}> = ({ role, isCustom = false }) => {
  const roleData = PREDEFINED_ROLES.find((r) => r.id === role || r.name === role);
  const colorMap: Record<string, string> = {
    owner: "bg-red-500/10 text-red-600 border-red-200",
    admin: "bg-orange-500/10 text-orange-600 border-orange-200",
    manager: "bg-blue-500/10 text-blue-600 border-blue-200",
    agent: "bg-green-500/10 text-green-600 border-green-200",
    viewer: "bg-gray-500/10 text-gray-600 border-gray-200",
    custom: "bg-purple-500/10 text-purple-600 border-purple-200",
  };

  const bgColor = roleData?.color || colorMap[role] || colorMap.viewer;

  return (
    <Badge
      variant="outline"
      className={`${bgColor} ${isCustom ? "border-dashed" : ""}`}
    >
      {isCustom ? "Custom: " : ""}
      {role}
    </Badge>
  );
};

// Component: Status Indicator
const StatusIndicator: React.FC<{ status: "active" | "pending" | "inactive" }> =
  ({ status }) => {
    const statusConfig = {
      active: { color: "bg-green-500", label: "Active" },
      pending: { color: "bg-yellow-500", label: "Pending" },
      inactive: { color: "bg-gray-400", label: "Inactive" },
    };

    const config = statusConfig[status];

    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        <span className="text-xs text-muted-foreground">{config.label}</span>
      </div>
    );
  };

// Component: Add Member Dialog
const AddMemberDialog: React.FC<{
  onAdd: (member: Omit<TeamMember, "id" | "lastActive">) => void;
}> = ({ onAdd }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "agent" as TeamMember["role"],
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.email) {
      toast.error("Please fill in all fields");
      return;
    }

    onAdd({
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: "pending",
      joinedDate: new Date().toISOString().split("T")[0],
      avatar: formData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
    });

    setFormData({ name: "", email: "", role: "agent" });
    setOpen(false);
    toast.success(`Invitation sent to ${formData.email}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Add a new member to your team and assign a role
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Full Name</label>
            <Input
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Email</label>
            <Input
              type="email"
              placeholder="john@company.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Role</label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  role: value as TeamMember["role"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PREDEFINED_ROLES.map((role) => (
                  <SelectItem key={role.id} value={role.name.toLowerCase()}>
                    <div>
                      <div className="font-medium">{role.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {role.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSubmit} className="w-full bg-primary">
            Send Invitation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Component: Members List
const MembersList: React.FC<{
  members: TeamMember[];
  onRemove: (id: string) => void;
  onRoleChange: (id: string, role: TeamMember["role"]) => void;
}> = ({ members, onRemove, onRoleChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === "all" || member.role === filterRole;
      const matchesStatus =
        filterStatus === "all" || member.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, searchTerm, filterRole, filterStatus]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search members by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {PREDEFINED_ROLES.map((role) => (
              <SelectItem key={role.id} value={role.name.toLowerCase()}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {filteredMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
                    {member.avatar}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{member.name}</h4>
                      <StatusIndicator status={member.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    {member.lastActive && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last active: {member.lastActive}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <RoleBadge role={member.role} />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Member
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Shield className="w-4 h-4 mr-2" />
                        Change Role
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Message
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Remove ${member.name} from the team?`
                            )
                          ) {
                            onRemove(member.id);
                            toast.success(
                              `${member.name} has been removed from the team`
                            );
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredMembers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No members found</p>
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground pt-4 border-t">
        Showing {filteredMembers.length} of {members.length} members
      </div>
    </div>
  );
};

// Component: Roles Management
const RolesManagement: React.FC<{
  customRoles: CustomRole[];
  onCreateRole: (role: Omit<CustomRole, "id" | "memberCount" | "createdDate" | "createdBy">) => void;
}> = ({ customRoles, onCreateRole }) => {
  const [showBuilder, setShowBuilder] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const handleCreateRole = () => {
    if (!newRoleName || selectedPermissions.length === 0) {
      toast.error("Please enter a role name and select permissions");
      return;
    }

    onCreateRole({
      name: newRoleName,
      description: newRoleDescription,
      permissions: selectedPermissions,
    });

    setNewRoleName("");
    setNewRoleDescription("");
    setSelectedPermissions([]);
    setShowBuilder(false);
    toast.success("Custom role created successfully");
  };

  const permissionsByCategory = useMemo(() => {
    const categories = new Map<string, RolePermission[]>();
    MOCK_PERMISSIONS.forEach((perm) => {
      if (!categories.has(perm.category)) {
        categories.set(perm.category, []);
      }
      categories.get(perm.category)!.push(perm);
    });
    return categories;
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Predefined Roles</h3>
        <div className="grid gap-3">
          {PREDEFINED_ROLES.map((role) => (
            <Card key={role.id} className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{role.name}</h4>
                      {role.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {role.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.slice(0, 5).map((permId) => {
                        const perm = MOCK_PERMISSIONS.find(
                          (p) => p.id === permId
                        );
                        return perm ? (
                          <Badge key={perm.id} variant="outline" className="text-xs">
                            {perm.name}
                          </Badge>
                        ) : null;
                      })}
                      {role.permissions.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Custom Roles</h3>
          <Button
            onClick={() => setShowBuilder(!showBuilder)}
            className="bg-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Custom Role
          </Button>
        </div>

        <AnimatePresence>
          {showBuilder && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 border border-primary/20 rounded-lg bg-primary/5"
            >
              <h4 className="font-semibold mb-4">Build Custom Role</h4>

              <div className="space-y-4 mb-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Role Name
                  </label>
                  <Input
                    placeholder="e.g., Senior Manager"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Description
                  </label>
                  <Input
                    placeholder="Describe the role's responsibilities"
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Permissions
                  </label>
                  <div className="space-y-4">
                    {Array.from(permissionsByCategory.entries()).map(
                      ([category, perms]) => (
                        <div key={category}>
                          <h5 className="text-xs font-semibold text-primary uppercase mb-2 tracking-wider">
                            {category}
                          </h5>
                          <div className="space-y-2 ml-2">
                            {perms.map((perm) => (
                              <div key={perm.id} className="flex items-center gap-2">
                                <Checkbox
                                  id={perm.id}
                                  checked={selectedPermissions.includes(
                                    perm.id
                                  )}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedPermissions([
                                        ...selectedPermissions,
                                        perm.id,
                                      ]);
                                    } else {
                                      setSelectedPermissions(
                                        selectedPermissions.filter(
                                          (p) => p !== perm.id
                                        )
                                      );
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={perm.id}
                                  className="text-sm cursor-pointer flex-1"
                                >
                                  <div className="font-medium">{perm.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {perm.description}
                                  </div>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateRole}
                    className="flex-1 bg-primary"
                  >
                    Create Role
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowBuilder(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {customRoles.length > 0 ? (
          <div className="grid gap-3">
            {customRoles.map((role) => (
              <Card key={role.id} className="border-purple-200/50">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{role.name}</h4>
                        <Badge variant="outline" className="text-xs border-purple-200">
                          Custom
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {role.description}
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Created by {role.createdBy} on {role.createdDate} •{" "}
                        {role.memberCount} member{role.memberCount !== 1 ? "s" : ""}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.slice(0, 5).map((permId) => {
                          const perm = MOCK_PERMISSIONS.find(
                            (p) => p.id === permId
                          );
                          return perm ? (
                            <Badge
                              key={perm.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {perm.name}
                            </Badge>
                          ) : null;
                        })}
                        {role.permissions.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit Role
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Role
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg">
            <Shield className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              No custom roles yet. Create one to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Component: Permission Matrix
const PermissionMatrix: React.FC<{ members: TeamMember[] }> = ({ members }) => {
  const [selectedRole, setSelectedRole] = useState<string>("role_owner");

  const activeMembers = members.filter((m) => m.status === "active");
  const getRolePermissions = (role: string): string[] => {
    const roleData = PREDEFINED_ROLES.find(
      (r) => r.id === role || r.name.toLowerCase() === role.toLowerCase()
    );
    return roleData?.permissions || [];
  };

  const permissionsByCategory = useMemo(() => {
    const categories = new Map<string, RolePermission[]>();
    MOCK_PERMISSIONS.forEach((perm) => {
      if (!categories.has(perm.category)) {
        categories.set(perm.category, []);
      }
      categories.get(perm.category)!.push(perm);
    });
    return categories;
  }, []);

  const selectedRolePermissions = useMemo(() => {
    return getRolePermissions(selectedRole);
  }, [selectedRole]);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">View Permissions For</label>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-[250px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PREDEFINED_ROLES.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border/50 rounded-lg overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="flex">
            {/* Left column for permission names */}
            <div className="w-64 border-r border-border/50">
              <div className="h-16 border-b border-border/50 flex items-center px-4 bg-muted/30 font-semibold">
                Permissions
              </div>
              {Array.from(permissionsByCategory.entries()).map(
                ([category, perms]) => (
                  <div key={category}>
                    <div className="px-4 py-3 bg-muted/50 text-xs font-semibold text-primary uppercase tracking-wider border-t border-border/50">
                      {category}
                    </div>
                    {perms.map((perm) => (
                      <div
                        key={perm.id}
                        className="px-4 py-3 border-t border-border/50 flex items-center gap-2 hover:bg-muted/30 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{perm.name}</div>
                          <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            {perm.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Right column for role permissions */}
            <div className="flex-1 min-w-[150px]">
              <div className="h-16 border-b border-border/50 flex items-center justify-center px-4 bg-muted/30 font-semibold">
                <RoleBadge role={selectedRole} />
              </div>

              {Array.from(permissionsByCategory.entries()).map(
                ([category, perms]) => (
                  <div key={category}>
                    <div className="px-4 py-3 bg-muted/50 text-xs font-semibold border-t border-border/50" />
                    {perms.map((perm) => (
                      <div
                        key={perm.id}
                        className="px-4 py-3 border-t border-border/50 flex items-center justify-center hover:bg-muted/30 transition-colors"
                      >
                        {selectedRolePermissions.includes(perm.id) ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Lock className="w-5 h-5 text-muted-foreground/30" />
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 text-sm text-muted-foreground pt-4 border-t">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          Permission granted
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground/30" />
          Permission denied
        </div>
      </div>
    </div>
  );
};

// Main Component: Team Management
export default function TeamManagement() {
  const [activeTab, setActiveTab] = useState<TabType>("members");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>(MOCK_CUSTOM_ROLES);

  const handleAddMember = useCallback(
    (member: Omit<TeamMember, "id" | "lastActive">) => {
      const newMember: TeamMember = {
        ...member,
        id: `member_${Date.now()}`,
        lastActive: member.status === "pending" ? undefined : "just now",
      };
      setTeamMembers([...teamMembers, newMember]);
    },
    [teamMembers]
  );

  const handleRemoveMember = useCallback(
    (id: string) => {
      setTeamMembers(teamMembers.filter((m) => m.id !== id));
    },
    [teamMembers]
  );

  const handleCreateCustomRole = useCallback(
    (
      role: Omit<CustomRole, "id" | "memberCount" | "createdDate" | "createdBy">
    ) => {
      const newRole: CustomRole = {
        ...role,
        id: `custom_${Date.now()}`,
        memberCount: 0,
        createdDate: new Date().toISOString().split("T")[0],
        createdBy: "You",
      };
      setCustomRoles([...customRoles, newRole]);
    },
    [customRoles]
  );

  const activeMembers = teamMembers.filter((m) => m.status === "active");
  const pendingMembers = teamMembers.filter((m) => m.status === "pending");

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-background to-background/50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                Team Management
              </h1>
              <p className="text-muted-foreground">
                Manage team members, roles, and permissions
              </p>
            </div>
            <AddMemberDialog onAdd={handleAddMember} />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Members</p>
                    <p className="text-2xl font-bold">{teamMembers.length}</p>
                  </div>
                  <Users className="w-10 h-10 text-primary/20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active</p>
                    <p className="text-2xl font-bold">{activeMembers.length}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-500/20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pending</p>
                    <p className="text-2xl font-bold">{pendingMembers.length}</p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-yellow-500/20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Roles</p>
                    <p className="text-2xl font-bold">
                      {PREDEFINED_ROLES.length + customRoles.length}
                    </p>
                  </div>
                  <Shield className="w-10 h-10 text-blue-500/20" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Card className="border-border/50">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as TabType)}
            className="w-full"
          >
            <div className="border-b border-border/50 px-6 pt-6">
              <TabsList className="bg-transparent border-0">
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="roles">Roles</TabsTrigger>
                <TabsTrigger value="permissions">Permissions Matrix</TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="pt-6">
              <TabsContent value="members" className="mt-0">
                <MembersList
                  members={teamMembers}
                  onRemove={handleRemoveMember}
                  onRoleChange={(id, role) => {
                    setTeamMembers(
                      teamMembers.map((m) =>
                        m.id === id ? { ...m, role } : m
                      )
                    );
                    toast.success("Member role updated");
                  }}
                />
              </TabsContent>

              <TabsContent value="roles" className="mt-0">
                <RolesManagement
                  customRoles={customRoles}
                  onCreateRole={handleCreateCustomRole}
                />
              </TabsContent>

              <TabsContent value="permissions" className="mt-0">
                <PermissionMatrix members={teamMembers} />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
}
