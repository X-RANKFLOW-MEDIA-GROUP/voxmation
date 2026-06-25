import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Headphones, PhoneOff, Users, Calendar, Workflow,
  Plug, CreditCard, LifeBuoy, LogOut, ChevronLeft, ChevronRight, Menu, X,
  UsersRound, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";

const navItems = [
  { path: "/portal", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/portal/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/portal/voice-agent", icon: Headphones, label: "Voice Agent" },
  { path: "/portal/missed-calls", icon: PhoneOff, label: "Missed Calls" },
  { path: "/portal/leads", icon: Users, label: "Leads" },
  { path: "/portal/bookings", icon: Calendar, label: "Bookings" },
  { path: "/portal/automations", icon: Workflow, label: "Automations" },
  { path: "/portal/integrations", icon: Plug, label: "Integrations" },
  { path: "/portal/team-management", icon: UsersRound, label: "Team" },
  { path: "/portal/billing", icon: CreditCard, label: "Billing" },
  { path: "/portal/support", icon: LifeBuoy, label: "Support" },
];

const PortalLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === "/portal") return location.pathname === "/portal";
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-border/50">
        <Link to="/" className="block">
          <span className={`font-display font-bold tracking-tight text-foreground transition-all ${collapsed ? "text-sm" : "text-lg"}`}>
            {collapsed ? "V" : "VOX"}<span className="text-primary">{collapsed ? "" : "MATION"}</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-mono transition-all duration-200 group ${
                active
                  ? "text-primary bg-primary/8"
                  : "text-silver hover:text-silver-bright hover:bg-muted/50"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="portal-nav"
                  className="absolute inset-0 rounded-xl bg-primary/8 border border-primary/15"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon className={`h-4 w-4 shrink-0 relative z-10 ${active ? "text-primary" : ""}`} />
              {!collapsed && (
                <span className="relative z-10 truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-border/50">
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-mono text-silver-bright truncate">{user?.email}</p>
            <p className="text-[10px] font-mono text-silver">Client Portal</p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-mono text-silver hover:text-destructive hover:bg-destructive/8 transition-all w-full"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 shrink-0 ${
          collapsed ? "w-[70px]" : "w-[240px]"
        }`}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-3 border-t border-border/50 flex items-center justify-center text-silver hover:text-silver-bright transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      {/* Mobile Header + Overlay */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <Link to="/">
          <span className="font-display font-bold tracking-tight text-foreground">
            VOX<span className="text-primary">MATION</span>
          </span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[260px] bg-card border-r border-border/50 z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="lg:hidden h-14" /> {/* Spacer for mobile header */}
        <div className="p-6 md:p-8 lg:p-10 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default PortalLayout;
