import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface Account {
  id: string;
  name: string;
  type: 'master' | 'sub';
  parent_account_id?: string;
  plan: string;
  branding: {
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    logo_url?: string;
    logo_dark_url?: string;
    favicon_url?: string;
    company_name?: string;
    font_family?: string;
    support_email?: string;
    support_phone?: string;
    support_url?: string;
    custom_css?: string;
    show_branding?: boolean;
    theme?: 'light' | 'dark' | 'auto';
  };
  settings: {
    features: Record<string, boolean>;
    limits: Record<string, number>;
  };
  is_active: boolean;
}

interface Profile {
  id: string;
  auth_user_id: string;
  account_id: string;
  full_name?: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: 'owner' | 'admin' | 'manager' | 'agent' | 'viewer';
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  account: Account | null;
  role: 'owner' | 'admin' | 'manager' | 'agent' | 'viewer' | null;
  permissions: string[];
  loading: boolean;
  accounts: Account[];
  switchAccount: (accountId: string) => Promise<void>;
  signOut: () => Promise<void>;
  canAccess: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  account: null,
  role: null,
  permissions: [],
  loading: true,
  accounts: [],
  switchAccount: async () => {},
  signOut: async () => {},
  canAccess: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [role, setRole] = useState<'owner' | 'admin' | 'manager' | 'agent' | 'viewer' | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user accounts and set primary account
  const loadUserAccounts = async (userId: string) => {
    try {
      const { data: members, error } = await supabase
        .from('account_members')
        .select('account_id, role, permissions, accounts!inner(*)')
        .eq('user_id', userId);

      if (error) throw error;

      if (members && members.length > 0) {
        const userAccounts = members.map((m: any) => m.accounts);
        setAccounts(userAccounts);

        // Set first account as primary
        const primaryAccount = userAccounts[0];
        const primaryMember = members[0];

        setAccount(primaryAccount);
        setRole(primaryMember.role);
        setPermissions(primaryMember.permissions?.permissions || []);

        // Load profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_user_id', userId)
          .eq('account_id', primaryAccount.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  // Switch to different account
  const switchAccount = async (accountId: string) => {
    try {
      const { data: member, error } = await supabase
        .from('account_members')
        .select('role, permissions, accounts!inner(*)')
        .eq('account_id', accountId)
        .eq('user_id', user?.id || '')
        .single();

      if (error) throw error;

      setAccount(member.accounts);
      setRole(member.role);
      setPermissions(member.permissions?.permissions || []);

      // Load profile for new account
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', user?.id || '')
        .eq('account_id', accountId)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Store in localStorage for persistence
      localStorage.setItem('current_account_id', accountId);
    } catch (error) {
      console.error('Error switching account:', error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadUserAccounts(session.user.id);
        } else {
          setProfile(null);
          setAccount(null);
          setAccounts([]);
          setRole(null);
          setPermissions([]);
        }

        setLoading(false);
      }
    );

    // Check if user already has session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        loadUserAccounts(session.user.id).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    localStorage.removeItem('current_account_id');
    await supabase.auth.signOut();
    setProfile(null);
    setAccount(null);
    setAccounts([]);
    setRole(null);
    setPermissions([]);
  };

  const canAccess = (permission: string): boolean => {
    // Owners and admins have all permissions
    if (role === 'owner' || role === 'admin') return true;
    return permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        account,
        role,
        permissions,
        loading,
        accounts,
        switchAccount,
        signOut,
        canAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
