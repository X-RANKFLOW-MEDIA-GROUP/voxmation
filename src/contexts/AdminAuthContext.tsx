import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AdminAuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const verifyStaff = async (user: User | null) => {
  if (!user) return false;
  const { data } = await supabase
    .from("account_members")
    .select("role, accounts!inner(type)")
    .eq("user_id", user.id)
    .in("role", ["owner", "admin"])
    .eq("accounts.type", "master")
    .limit(1)
    .maybeSingle();
  return Boolean(data);
};

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const applySession = async (candidate: User | null) => {
      setUser(candidate);
      setIsAdmin(await verifyStaff(candidate));
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => applySession(data.session?.user || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!(await verifyStaff(data.user))) {
      await supabase.auth.signOut();
      throw new Error("VOXmation staff access required");
    }
    setUser(data.user);
    setIsAdmin(true);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setIsAdmin(false);
  };

  return <AdminAuthContext.Provider value={{ user, loading, signIn, signOut, isAdmin }}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return context;
}
