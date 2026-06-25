import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import MetricCard from "@/components/portal/MetricCard";
import { motion } from "framer-motion";
import {
  Phone,
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  Zap,
  BarChart3,
  Activity,
  Target,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";

// Demo data - Replace with real data from Supabase
const callsThisMonthData = [
  { week: "Week 1", calls: 142 },
  { week: "Week 2", calls: 189 },
  { week: "Week 3", calls: 215 },
  { week: "Week 4", calls: 178 },
];

const revenueByPlanData = [
  { plan: "Starter", revenue: 4500 },
  { plan: "Professional", revenue: 12800 },
  { plan: "Enterprise", revenue: 28900 },
];

const topAccountsData = [
  { name: "Acme Corp", calls: 487, revenue: 8200 },
  { name: "TechStart Inc", calls: 412, revenue: 6950 },
  { name: "Global Services", calls: 389, revenue: 6200 },
  { name: "Innovation Labs", calls: 356, revenue: 5100 },
  { name: "Premier Solutions", calls: 298, revenue: 4750 },
];

const agentPerformanceData = [
  {
    agent: "Agent A",
    callsHandled: 234,
    avgDuration: 4.2,
    conversionRate: 68,
  },
  {
    agent: "Agent B",
    callsHandled: 198,
    avgDuration: 5.1,
    conversionRate: 72,
  },
  {
    agent: "Agent C",
    callsHandled: 267,
    avgDuration: 3.8,
    conversionRate: 65,
  },
  {
    agent: "Agent D",
    callsHandled: 156,
    avgDuration: 4.9,
    conversionRate: 71,
  },
  {
    agent: "Agent E",
    callsHandled: 189,
    avgDuration: 4.5,
    conversionRate: 69,
  },
];

const COLORS = ["hsl(var(--primary))", "#8b5cf6", "#ec4899", "#f59e0b"];

interface AnalyticsMetrics {
  totalCallsMonth: number;
  totalRevenueMonth: number;
  totalAccounts: number;
  avgConversionRate: number;
}

const Analytics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalCallsMonth: 724,
    totalRevenueMonth: 46200,
    totalAccounts: 47,
    avgConversionRate: 69,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch calls count for this month
      const callsRes = await supabase
        .from("calls")
        .select("id")
        .eq("user_id", user.id)
        .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      const totalCalls = callsRes.data?.length || 724;

      // Fetch unique accounts
      const accountsRes = await supabase
        .from("leads")
        .select("account_id", { count: "exact" })
        .eq("user_id", user.id);

      const totalAccounts = accountsRes.count || 47;

      setMetrics({
        totalCallsMonth: totalCalls,
        totalRevenueMonth: 46200,
        totalAccounts,
        avgConversionRate: 69,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const chartContainerProps = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
            Analytics
          </h1>
        </div>
        <p className="text-silver text-sm font-mono mb-8">
          Comprehensive performance analytics and insights
        </p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={Phone}
          label="Calls (This Month)"
          value={metrics.totalCallsMonth}
          change="+18%"
          delay={0}
        />
        <MetricCard
          icon={DollarSign}
          label="Revenue (This Month)"
          value={`$${(metrics.totalRevenueMonth / 1000).toFixed(1)}k`}
          change="+24%"
          delay={0.05}
        />
        <MetricCard
          icon={Users}
          label="Active Accounts"
          value={metrics.totalAccounts}
          change="+12%"
          delay={0.1}
        />
        <MetricCard
          icon={Target}
          label="Avg Conversion Rate"
          value={`${metrics.avgConversionRate}%`}
          change="+5%"
          delay={0.15}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Calls This Month */}
        <motion.div
          {...chartContainerProps}
          transition={{ ...chartContainerProps.transition, delay: 0.2 }}
          className="surface-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Activity className="h-4 w-4 text-primary/60" />
            <h3 className="text-sm font-mono font-bold text-foreground tracking-wide">
              Calls This Month
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={callsThisMonthData}>
              <defs>
                <linearGradient id="callGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                  fontFamily: "monospace",
                }}
              />
              <Line
                type="monotone"
                dataKey="calls"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue by Plan */}
        <motion.div
          {...chartContainerProps}
          transition={{ ...chartContainerProps.transition, delay: 0.25 }}
          className="surface-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="h-4 w-4 text-primary/60" />
            <h3 className="text-sm font-mono font-bold text-foreground tracking-wide">
              Revenue by Plan
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={revenueByPlanData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ plan, value }) => `${plan}: $${value.toLocaleString()}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="revenue"
              >
                {revenueByPlanData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                  fontFamily: "monospace",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Accounts */}
      <motion.div
        {...chartContainerProps}
        transition={{ ...chartContainerProps.transition, delay: 0.3 }}
        className="surface-card rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-4 w-4 text-primary/60" />
          <h3 className="text-sm font-mono font-bold text-foreground tracking-wide">
            Top Accounts by Revenue
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topAccountsData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 12,
                fontSize: 12,
                fontFamily: "monospace",
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="calls"
              fill="hsl(var(--primary))"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="revenue"
              fill="#8b5cf6"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Agent Performance */}
      <motion.div
        {...chartContainerProps}
        transition={{ ...chartContainerProps.transition, delay: 0.35 }}
        className="surface-card rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Zap className="h-4 w-4 text-primary/60" />
          <h3 className="text-sm font-mono font-bold text-foreground tracking-wide">
            Agent Performance Analysis
          </h3>
        </div>

        {/* Agent Performance Metrics */}
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Calls Handled */}
            <div>
              <p className="text-xs font-mono text-silver mb-4 tracking-wide">
                CALLS HANDLED
              </p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={agentPerformanceData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="agent"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      fontSize: 12,
                      fontFamily: "monospace",
                    }}
                  />
                  <Bar
                    dataKey="callsHandled"
                    fill="hsl(var(--primary))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Average Duration & Conversion Rate */}
            <div>
              <p className="text-xs font-mono text-silver mb-4 tracking-wide">
                AVG DURATION & CONVERSION RATE
              </p>
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="avgDuration"
                    name="Avg Duration (mins)"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="conversionRate"
                    name="Conversion Rate (%)"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      fontSize: 12,
                      fontFamily: "monospace",
                    }}
                    formatter={(value) =>
                      typeof value === "number"
                        ? value.toFixed(1)
                        : value
                    }
                  />
                  <Scatter
                    name="Agents"
                    data={agentPerformanceData}
                    fill="hsl(var(--primary))"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Agent Performance Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-3 px-4 text-silver font-semibold">
                  Agent
                </th>
                <th className="text-right py-3 px-4 text-silver font-semibold">
                  Calls Handled
                </th>
                <th className="text-right py-3 px-4 text-silver font-semibold">
                  Avg Duration
                </th>
                <th className="text-right py-3 px-4 text-silver font-semibold">
                  Conversion Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {agentPerformanceData.map((agent) => (
                <tr
                  key={agent.agent}
                  className="border-b border-border/15 hover:bg-primary/5 transition-colors"
                >
                  <td className="py-3 px-4 text-silver-bright">{agent.agent}</td>
                  <td className="text-right py-3 px-4 text-foreground font-semibold">
                    {agent.callsHandled}
                  </td>
                  <td className="text-right py-3 px-4 text-foreground font-semibold">
                    {agent.avgDuration.toFixed(1)}m
                  </td>
                  <td className="text-right py-3 px-4">
                    <span className="inline-block px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400">
                      {agent.conversionRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Key Insights */}
      <motion.div
        {...chartContainerProps}
        transition={{ ...chartContainerProps.transition, delay: 0.4 }}
        className="surface-card rounded-2xl p-6 mt-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-4 w-4 text-primary/60" />
          <h3 className="text-sm font-mono font-bold text-foreground tracking-wide">
            Key Insights
          </h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-xs font-mono text-silver mb-2 tracking-wide">
              PEAK PERFORMANCE
            </p>
            <p className="text-sm text-foreground font-semibold">
              Agent C leads with 267 calls handled
            </p>
            <p className="text-xs text-silver-bright mt-1">
              Highest volume this period
            </p>
          </div>
          <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/10">
            <p className="text-xs font-mono text-silver mb-2 tracking-wide">
              TOP PERFORMER
            </p>
            <p className="text-sm text-foreground font-semibold">
              Agent B has 72% conversion rate
            </p>
            <p className="text-xs text-silver-bright mt-1">
              Best quality metrics
            </p>
          </div>
          <div className="p-4 rounded-lg bg-pink-500/5 border border-pink-500/10">
            <p className="text-xs font-mono text-silver mb-2 tracking-wide">
              REVENUE LEADER
            </p>
            <p className="text-sm text-foreground font-semibold">
              Enterprise plan drives 51% revenue
            </p>
            <p className="text-xs text-silver-bright mt-1">
              $28.9k this month
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
