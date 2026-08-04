import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Unread notification count for the signed-in user (polls every minute). */
export function useUnreadCount() {
  const { data } = useQuery({
    queryKey: ["unread-notifications"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user.id;
      if (!uid) return 0;
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", uid)
        .eq("is_read", false);
      return count ?? 0;
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  return data ?? 0;
}
