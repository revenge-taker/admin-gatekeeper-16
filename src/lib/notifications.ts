import { supabase } from "@/integrations/supabase/client";

export type NotificationRow = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link: string;
  created_at: string;
};

export async function listMyNotifications(userId: string): Promise<NotificationRow[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, user_id, title, message, type, is_read, link, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function markAllRead(userId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  if (error) throw new Error(error.message);
}

/** Sends a notification to a single user. Silently ignores permission failures. */
export async function notify(input: {
  userId: string;
  title: string;
  message?: string;
  type?: string;
  link?: string;
}) {
  await supabase.from("notifications").insert({
    user_id: input.userId,
    title: input.title,
    message: input.message ?? "",
    type: input.type ?? "info",
    link: input.link ?? "",
  });
}

/** Logs an action into the activity feed. */
export async function logActivity(input: {
  userId: string | null;
  actorEmail: string;
  action: string;
  entity?: string;
  entityId?: string;
  details?: string;
}) {
  await supabase.from("activity_logs").insert({
    user_id: input.userId,
    actor_email: input.actorEmail,
    action: input.action,
    entity: input.entity ?? "",
    entity_id: input.entityId ?? "",
    details: input.details ?? "",
  });
}

export type ActivityRow = {
  id: string;
  user_id: string | null;
  actor_email: string;
  action: string;
  entity: string;
  entity_id: string;
  details: string;
  created_at: string;
};

export async function listActivity(): Promise<ActivityRow[]> {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("id, user_id, actor_email, action, entity, entity_id, details, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return data ?? [];
}
