import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  CreditCard,
  FileText,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  TrendingUp,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
} from "lucide-react";
import MetricCard from "@/components/portal/MetricCard";

// Types
interface AccountData {
  id: string;
  name: string;
  type: "master" | "sub";
  plan: string;
  status: "active" | "inactive" | "suspended";
  monthly_revenue?: number;
  usage_percentage?: number;
  total_users?: number;
  created_at?: string;
  parent_account_id?: string;
  branding?: {
    company_name?: string;
    logo_url?: string;
  };
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "manager" | "agent" | "viewer";
  account_id: string;
  status: "active" | "inactive";
  last_login?: string;
}

interface BillingData {
  account_id: string;
  account_name: string;
  current_plan: string;
  monthly_cost: number;
  usage_percentage: number;
  billing_cycle_end: string;
  status: "active" | "overdue" | "canceled";
  total_billed: number;
}

interface AuditLog {
  id: string;
  action: string;
  target_account_id: string;
  target_user_id?: string;
  changed_fields?: Record<string, string>;
  performed_by: string;
  timestamp: string;
  severity: "low" | "medium" | "high";
}

type TabType = "accounts" | "team" | "billing" | "audit";

const MOCK_ACCOUNTS: AccountData[] = [
  {
    id: "acc_001",
    name: "Acme Corporation",
    type: "sub",
    plan: "enterprise",
    status: "active",
    monthly_revenue: 4500,
    usage_percentage: 78,
    total_users: 12,
    created_at: "2024-01-15",
  },
  {
    id: "acc_002",
    name: "Smith HVAC Services",
    type: "sub",
    plan: "professional",
    status: "active",
    monthly_revenue: 1800,
    usage_percentage: 45,
    total_users: 5,
    created_at: "2024-02-20",
  },
  {
    id: "acc_003",
    name: "Green Plumbing Co",
    type: "sub",
    plan: "starter",
    status: "inactive",
    monthly_revenue: 400,
    usage_percentage: 0,
    total_users: 2,
    created_at: "2024-03-10",
  },
  {
    id: "acc_004",
    name: "Elite Roofing",
    type: "sub",
    plan: "professional",
    status: "active",
    monthly_revenue: 2200,
    usage_percentage: 62,
    total_users: 7,
    created_at: "2024-01-05",
  },
];

const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "user_001",
    name: "John Mitchell",
    email: "john@acmecorp.com",
    role: "owner",
    account_id: "acc_001",
    status: "active",
    last_login: "2 minutes ago",
  },
  {
    id: "user_002",
    name: "Sarah Chen",
    email: "sarah@smithhvac.com",
    role: "admin",
    account_id: "acc_002",
    status: "active",
    last_login: "1 hour ago",
  },
  {
    id: "user_003",
    name: "Mike Johnson",
    email: "mike@greenplumbing.com",
    role: "manager",
    account_id: "acc_003",
    status: "inactive",
    last_login: "15 days ago",
  },
  {
    id: "user_004",
    name: "Lisa Rodriguez",
    email: "lisa@eliteroofing.com",
    role: "admin",
    account_id: "acc_004",
    status: "active",
    last_login: "30 minutes ago",
  },
];

const MOCK_BILLING: BillingData[] = [
  {
    account_id: "acc_001",
    account_name: "Acme Corporation",
    current_plan: "enterprise",
    monthly_cost: 299,
    usage_percentage: 78,
    billing_cycle_end: "2024-07-15",
    status: "active",
    total_billed: 8970,
  },
  {
    account_id: "acc_002",
    account_name: "Smith HVAC Services",
    current_plan: "professional",
    monthly_cost: 149,
    usage_percentage: 45,
    billing_cycle_end: "2024-07-20",
    status: "active",
    total_billed: 2238,
  },
  {
    account_id: "acc_003",
    account_name: "Green Plumbing Co",
    current_plan: "starter",
    monthly_cost: 49,
    usage_percentage: 0,
    billing_cycle_end: "2024-07-10",
    status: "overdue",
    total_billed: 588,
  },
  {
    account_id: "acc_004",
    account_name: "Elite Roofing",
    current_plan: "professional",
    monthly_cost: 149,
    usage_percentage: 62,
    billing_cycle_end: "2024-07-05",
    status: "active",
    total_billed: 3580,
  },
];

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log_001",
    action: "Plan Upgrade",
    target_account_id: "acc_001",
    changed_fields: { plan: "professional -> enterprise" },
    performed_by: "Admin User",
    timestamp: "2024-06-24T14:30:00Z",
    severity: "low",
  },
  {
    id: "log_002",
    action: "Account Created",
    target_account_id: "acc_004",
    changed_fields: { status: "pending -> active" },
    performed_by: "Admin User",
    timestamp: "2024-06-23T09:15:00Z",
    severity: "low",
  },
  {
    id: "log_003",
    action: "Account Suspended",
    target_account_id: "acc_003",
    changed_fields: { status: "active -> suspended" },
    performed_by: "Billing Manager",
    timestamp: "2024-06-22T16:45:00Z",
    severity: "high",
  },
  {
    id: "log_004",
    action: "User Role Changed",
    target_account_id: "acc_002",
    target_user_id: "user_002",
    changed_fields: { role: "manager -> admin" },
    performed_by: "Admin User",
    timestamp: "2024-06-21T11:20:00Z",
    severity: "low",
  },
];

const PLAN_UPGRADES: Record<string, string[]> = {
  starter: ["professional", "enterprise"],
  professional: ["enterprise"],
  enterprise: [],
};

// Tabs Component
const Tabs = ({
  activeTab,
  onTabChange,
}: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}) => {
  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: "accounts", label: "Accounts", icon: Building2 },
    { id: "team", label: "Team", icon: Users },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "audit", label: "Audit Logs", icon: FileText },
  ];

  return (
    <div className="flex gap-1 border-b border-border/30 mb-8">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all duration-200 ${
            activeTab === id
              ? "border-primary text-foreground"
              : "border-transparent text-silver hover:text-silver-bright"
          }`}
        >
          <Icon className="h-4 w-4" />
          <span className="text-sm font-mono font-bold">{label}</span>
        </button>
      ))}
    </div>
  );
};

// Accounts Tab
const AccountsTab = () => {
  const [accounts, setAccounts] = useState<AccountData[]>(MOCK_ACCOUNTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive" | "suspended"
  >("all");
  const [selectedAccount, setSelectedAccount] =
    useState<AccountData | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState<AccountData | null>(null);
  const [upgradePlan, setUpgradePlan] = useState("");

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || account.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleUpgradeClick = (account: AccountData) => {
    setUpgradeTarget(account);
    setUpgradePlan("");
    setUpgradeModalOpen(true);
  };

  const handleConfirmUpgrade = () => {
    if (upgradeTarget && upgradePlan) {
      setAccounts(
        accounts.map((acc) =>
          acc.id === upgradeTarget.id
            ? { ...acc, plan: upgradePlan, status: "active" }
            : acc
        )
      );
      setUpgradeModalOpen(false);
      setUpgradeTarget(null);
      setUpgradePlan("");
    }
  };

  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter(
    (a) => a.status === "active"
  ).length;
  const totalRevenue = accounts.reduce(
    (sum, a) => sum + (a.monthly_revenue || 0),
    0
  );

  return (
    <div>
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={Building2}
          label="Total Accounts"
          value={totalAccounts}
          delay={0}
        />
        <MetricCard
          icon={CheckCircle}
          label="Active"
          value={activeAccounts}
          delay={0.05}
        />
        <MetricCard
          icon={DollarSign}
          label="Monthly Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          delay={0.1}
        />
        <MetricCard
          icon={TrendingUp}
          label="Avg Usage"
          value={`${Math.round(accounts.reduce((sum, a) => sum + (a.usage_percentage || 0), 0) / accounts.length)}%`}
          delay={0.15}
        />
      </div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6 flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-silver" />
          <input
            type="text"
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-card border border-border/30 rounded-lg text-sm text-foreground placeholder-silver focus:outline-none focus:border-primary/50"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "inactive", "suspended"] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-2 rounded-lg text-sm font-mono transition-all ${
                  filterStatus === status
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "bg-surface-card border border-border/30 text-silver hover:text-foreground"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            )
          )}
        </div>
      </motion.div>

      {/* Accounts List */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="space-y-3"
      >
        <AnimatePresence mode="popLayout">
          {filteredAccounts.map((account, idx) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="surface-card rounded-xl p-4 sm:p-6 border border-border/30 hover:border-primary/15 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-sm font-mono font-bold text-foreground">
                      {account.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-mono font-bold ${
                        account.status === "active"
                          ? "bg-emerald-400/10 text-emerald-400"
                          : account.status === "inactive"
                          ? "bg-silver/10 text-silver"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {account.status.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary">
                      {account.plan.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-silver font-mono">{account.id}</p>
                </div>
                <button
                  onClick={() => setSelectedAccount(account)}
                  className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="h-4 w-4 text-silver" />
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-[10px] text-silver font-mono mb-1">
                    Users
                  </p>
                  <p className="text-sm font-mono font-bold text-foreground">
                    {account.total_users}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-silver font-mono mb-1">
                    Usage
                  </p>
                  <p className="text-sm font-mono font-bold text-foreground">
                    {account.usage_percentage}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-silver font-mono mb-1">
                    Monthly
                  </p>
                  <p className="text-sm font-mono font-bold text-foreground">
                    ${account.monthly_revenue}
                  </p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-[10px] text-silver font-mono mb-1">
                    Since
                  </p>
                  <p className="text-sm font-mono font-bold text-foreground">
                    {new Date(account.created_at || "").toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Usage Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-silver font-mono">
                    Plan Usage
                  </p>
                  <p className="text-[10px] text-silver font-mono">
                    {account.usage_percentage}%
                  </p>
                </div>
                <div className="h-2 bg-surface-darker rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      account.usage_percentage! > 90
                        ? "bg-destructive"
                        : account.usage_percentage! > 70
                        ? "bg-warning"
                        : "bg-primary"
                    }`}
                    style={{ width: `${account.usage_percentage}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                {account.status === "active" && (
                  <button
                    onClick={() => handleUpgradeClick(account)}
                    className="text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
                  >
                    Upgrade/Downgrade
                  </button>
                )}
                <button className="text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg bg-surface-darker text-silver-bright hover:bg-border/50 transition-colors">
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {upgradeModalOpen && upgradeTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={() => setUpgradeModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="surface-card rounded-2xl p-6 max-w-md w-full border border-border/30"
            >
              <h2 className="text-lg font-mono font-bold text-foreground mb-2">
                Update Plan
              </h2>
              <p className="text-sm text-silver font-mono mb-6">
                {upgradeTarget.name} is currently on{" "}
                <span className="font-bold text-primary">
                  {upgradeTarget.plan}
                </span>{" "}
                plan
              </p>

              <div className="space-y-2 mb-6">
                <label className="text-xs font-mono text-silver block mb-3">
                  Select New Plan
                </label>
                {["starter", "professional", "enterprise"].map((plan) => (
                  <button
                    key={plan}
                    onClick={() => setUpgradePlan(plan)}
                    className={`w-full p-3 rounded-lg text-left transition-all border ${
                      upgradePlan === plan
                        ? "bg-primary/15 border-primary/30 text-foreground"
                        : "bg-surface-darker border-border/30 text-silver hover:text-foreground"
                    }`}
                  >
                    <p className="text-sm font-mono font-bold capitalize">
                      {plan}
                    </p>
                    <p className="text-[10px] text-silver font-mono mt-1">
                      {plan === "starter"
                        ? "$49/month"
                        : plan === "professional"
                        ? "$149/month"
                        : "$299/month"}
                    </p>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setUpgradeModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-surface-darker text-silver hover:bg-border/50 transition-colors font-mono text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUpgrade}
                  disabled={!upgradePlan}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-mono text-sm font-bold disabled:opacity-50"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// DollarSign icon fallback
const DollarSign = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

// Team Tab
const TeamTab = () => {
  const [members, setMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "owner" | "admin" | "manager" | "agent" | "viewer"
  >("all");

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const activeMembers = members.filter((m) => m.status === "active").length;
  const totalMembers = members.length;

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={Users}
          label="Total Members"
          value={totalMembers}
          delay={0}
        />
        <MetricCard
          icon={CheckCircle}
          label="Active"
          value={activeMembers}
          delay={0.05}
        />
        <MetricCard
          icon={UserCheck}
          label="Admins"
          value={members.filter((m) => m.role === "admin").length}
          delay={0.1}
        />
        <MetricCard
          icon={Clock}
          label="Last Active"
          value="Now"
          delay={0.15}
        />
      </div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6 flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-silver" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-card border border-border/30 rounded-lg text-sm text-foreground placeholder-silver focus:outline-none focus:border-primary/50"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {(["all", "owner", "admin", "manager", "agent"] as const).map(
            (role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-2 rounded-lg text-sm font-mono whitespace-nowrap transition-all ${
                  roleFilter === role
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "bg-surface-card border border-border/30 text-silver hover:text-foreground"
                }`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            )
          )}
        </div>
      </motion.div>

      {/* Members List */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="space-y-3"
      >
        <AnimatePresence mode="popLayout">
          {filteredMembers.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="surface-card rounded-xl p-4 sm:p-6 border border-border/30 hover:border-primary/15 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                      <span className="text-xs font-mono font-bold text-primary">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-mono font-bold text-foreground">
                        {member.name}
                      </h3>
                      <p className="text-xs text-silver font-mono">
                        {member.email}
                      </p>
                    </div>
                  </div>
                </div>
                <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="h-4 w-4 text-silver" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-[10px] text-silver font-mono mb-1">
                    Role
                  </p>
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-primary/10 text-primary capitalize">
                    {member.role}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-silver font-mono mb-1">
                    Status
                  </p>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-1 rounded ${
                      member.status === "active"
                        ? "bg-emerald-400/10 text-emerald-400"
                        : "bg-silver/10 text-silver"
                    }`}
                  >
                    {member.status.charAt(0).toUpperCase() +
                      member.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-silver font-mono mb-1">
                    Last Login
                  </p>
                  <p className="text-xs text-silver font-mono">
                    {member.last_login}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg bg-surface-darker text-silver-bright hover:bg-border/50 transition-colors">
                  Edit Role
                </button>
                <button className="text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg bg-surface-darker text-silver-bright hover:bg-border/50 transition-colors">
                  Deactivate
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Billing Tab
const BillingTab = () => {
  const [billingData, setBillingData] = useState<BillingData[]>(MOCK_BILLING);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBilling = billingData.filter((item) =>
    item.account_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMonthlyRevenue = billingData.reduce(
    (sum, item) => sum + item.monthly_cost,
    0
  );
  const overdueBilling = billingData.filter(
    (item) => item.status === "overdue"
  ).length;
  const totalBilledAllTime = billingData.reduce(
    (sum, item) => sum + item.total_billed,
    0
  );

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={CreditCard}
          label="Monthly Revenue"
          value={`$${totalMonthlyRevenue}`}
          delay={0}
        />
        <MetricCard
          icon={AlertCircle}
          label="Overdue"
          value={overdueBilling}
          change={overdueBilling > 0 ? "⚠" : ""}
          delay={0.05}
        />
        <MetricCard
          icon={DollarSign}
          label="Total Billed"
          value={`$${totalBilledAllTime.toLocaleString()}`}
          delay={0.1}
        />
        <MetricCard
          icon={TrendingUp}
          label="Avg Plan"
          value="Professional"
          delay={0.15}
        />
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-silver" />
          <input
            type="text"
            placeholder="Search billing..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-card border border-border/30 rounded-lg text-sm text-foreground placeholder-silver focus:outline-none focus:border-primary/50"
          />
        </div>
      </motion.div>

      {/* Billing Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="overflow-x-auto"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left px-4 py-3 font-mono text-xs font-bold text-silver">
                Account
              </th>
              <th className="text-left px-4 py-3 font-mono text-xs font-bold text-silver">
                Plan
              </th>
              <th className="text-right px-4 py-3 font-mono text-xs font-bold text-silver">
                Monthly Cost
              </th>
              <th className="text-right px-4 py-3 font-mono text-xs font-bold text-silver">
                Usage
              </th>
              <th className="text-left px-4 py-3 font-mono text-xs font-bold text-silver">
                Status
              </th>
              <th className="text-left px-4 py-3 font-mono text-xs font-bold text-silver">
                Next Billing
              </th>
              <th className="text-left px-4 py-3 font-mono text-xs font-bold text-silver">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {filteredBilling.map((item, idx) => (
                <motion.tr
                  key={item.account_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className="border-b border-border/20 hover:bg-surface-darker transition-colors"
                >
                  <td className="px-4 py-4 font-mono text-foreground">
                    {item.account_name}
                  </td>
                  <td className="px-4 py-4 font-mono text-silver text-sm capitalize">
                    {item.current_plan}
                  </td>
                  <td className="px-4 py-4 font-mono text-foreground text-right">
                    ${item.monthly_cost}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-surface-darker rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            item.usage_percentage > 90
                              ? "bg-destructive"
                              : item.usage_percentage > 70
                              ? "bg-warning"
                              : "bg-primary"
                          }`}
                          style={{ width: `${item.usage_percentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-silver">
                        {item.usage_percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-1 rounded ${
                        item.status === "active"
                          ? "bg-emerald-400/10 text-emerald-400"
                          : item.status === "overdue"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-silver/10 text-silver"
                      }`}
                    >
                      {item.status.charAt(0).toUpperCase() +
                        item.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-mono text-silver text-sm">
                    {new Date(item.billing_cycle_end).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <button className="text-[11px] font-mono font-bold px-2 py-1 rounded text-primary hover:bg-primary/10 transition-colors">
                      View Invoice
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

// Audit Logs Tab
const AuditLogsTab = () => {
  const [logs, setLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [filterSeverity, setFilterSeverity] = useState<
    "all" | "low" | "medium" | "high"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_account_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity =
      filterSeverity === "all" || log.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={FileText}
          label="Total Logs"
          value={logs.length}
          delay={0}
        />
        <MetricCard
          icon={AlertCircle}
          label="High Severity"
          value={logs.filter((l) => l.severity === "high").length}
          delay={0.05}
        />
        <MetricCard
          icon={Clock}
          label="This Week"
          value={logs.length}
          delay={0.1}
        />
        <MetricCard
          icon={Download}
          label="Export"
          value="Available"
          delay={0.15}
        />
      </div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6 flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-silver" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-card border border-border/30 rounded-lg text-sm text-foreground placeholder-silver focus:outline-none focus:border-primary/50"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "low", "medium", "high"] as const).map((severity) => (
            <button
              key={severity}
              onClick={() => setFilterSeverity(severity)}
              className={`px-3 py-2 rounded-lg text-sm font-mono transition-all ${
                filterSeverity === severity
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-surface-card border border-border/30 text-silver hover:text-foreground"
              }`}
            >
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Logs Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="space-y-3"
      >
        <AnimatePresence mode="popLayout">
          {filteredLogs.map((log, idx) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="surface-card rounded-xl p-4 sm:p-6 border border-border/30"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    log.severity === "high"
                      ? "bg-destructive/15"
                      : log.severity === "medium"
                      ? "bg-warning/15"
                      : "bg-emerald-400/15"
                  }`}
                >
                  {log.severity === "high" ? (
                    <AlertCircle className={`h-5 w-5 text-destructive`} />
                  ) : (
                    <CheckCircle
                      className={`h-5 w-5 ${
                        log.severity === "medium"
                          ? "text-warning"
                          : "text-emerald-400"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-sm font-mono font-bold text-foreground">
                      {log.action}
                    </h3>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-1 rounded ${
                        log.severity === "high"
                          ? "bg-destructive/10 text-destructive"
                          : log.severity === "medium"
                          ? "bg-warning/10 text-warning"
                          : "bg-emerald-400/10 text-emerald-400"
                      }`}
                    >
                      {log.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-2">
                    <div>
                      <p className="text-[10px] text-silver font-mono mb-1">
                        Account
                      </p>
                      <p className="text-xs font-mono text-foreground">
                        {log.target_account_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-silver font-mono mb-1">
                        By
                      </p>
                      <p className="text-xs font-mono text-foreground">
                        {log.performed_by}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-silver font-mono mb-1">
                        Time
                      </p>
                      <p className="text-xs font-mono text-silver">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {log.changed_fields && (
                      <div>
                        <p className="text-[10px] text-silver font-mono mb-1">
                          Changes
                        </p>
                        <p className="text-xs font-mono text-foreground">
                          {Object.entries(log.changed_fields)[0]?.[1] ||
                            "View details"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Main Component
const AdminDashboard = () => {
  const { account } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("accounts");
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (account && account.type === "master") {
      setIsAuthorized(true);
    }
  }, [account]);

  if (!isAuthorized) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen"
      >
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-mono font-bold text-foreground mb-2">
          Access Denied
        </h1>
        <p className="text-silver font-mono">
          Only master account administrators can access this dashboard.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight mb-2">
          Admin Dashboard
        </h1>
        <p className="text-silver text-sm font-mono">
          Manage all accounts, team members, billing, and system activities
        </p>
      </div>

      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "accounts" && (
          <motion.div
            key="accounts"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            <AccountsTab />
          </motion.div>
        )}
        {activeTab === "team" && (
          <motion.div
            key="team"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            <TeamTab />
          </motion.div>
        )}
        {activeTab === "billing" && (
          <motion.div
            key="billing"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            <BillingTab />
          </motion.div>
        )}
        {activeTab === "audit" && (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            <AuditLogsTab />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminDashboard;
