import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: Record<string, string>) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata,
      },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };
};

export const useUserRole = (userId: string | undefined) => {
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);

  const fetchRoles = async (uid: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid);

      if (error) throw error;
      const fetchedRoles = data?.map((r) => r.role) || [];
      setRoles(fetchedRoles);
      setLoadedUserId(uid);
      return fetchedRoles;
    } catch {
      // Intentionally silent to avoid leaking sensitive auth details
      setRoles([]);
      setLoadedUserId(uid);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setRoles([]);
      setLoadedUserId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Ensure loadedUserId is reset for this uid so consumers can reliably wait.
    setLoadedUserId(null);
    fetchRoles(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const refetchRoles = async (): Promise<string[]> => {
    if (!userId) return [];
    setLoading(true);
    setLoadedUserId(null);
    return fetchRoles(userId);
  };

  // Prevent race conditions when userId changes: treat roles as loading
  // until we've completed at least one fetch for the current userId.
  const roleLoading = loading || (!!userId && loadedUserId !== userId);

  const isAdmin = roles.includes("admin") || roles.includes("superadmin");
  const isSuperAdmin = roles.includes("superadmin");
  const isCreator = roles.includes("creator");

  return { roles, loading: roleLoading, isAdmin, isSuperAdmin, isCreator, refetchRoles };
};
