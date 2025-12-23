import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Creator {
  id: string;
  user_id: string;
  full_name: string;
  alias: string;
  email: string;
  phone: string | null;
  category_id: string | null;
  profile_photo_url: string | null;
  bio: string | null;
  is_approved: boolean;
  is_active: boolean;
  vote_count: number;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
  } | null;
}

export const useCreators = (categoryFilter?: string) => {
  return useQuery({
    queryKey: ["creators", categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from("creators")
        .select(`
          *,
          category:categories(id, name)
        `)
        .eq("is_approved", true)
        .eq("is_active", true)
        .order("vote_count", { ascending: false });

      if (categoryFilter && categoryFilter !== "all") {
        query = query.eq("category_id", categoryFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Creator[];
    },
  });
};

export const useCreatorByUserId = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["creator", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("creators")
        .select(`
          *,
          category:categories(id, name)
        `)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data as Creator | null;
    },
    enabled: !!userId,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });
};
