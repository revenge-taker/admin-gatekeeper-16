import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Sends a notification to every administrator. Regular members cannot insert
 * rows for other users, so this runs with elevated privileges after auth.
 */
export const notifyAdmins = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        title: z.string().min(1).max(160),
        message: z.string().max(500).default(""),
        type: z.string().max(40).default("info"),
        link: z.string().max(300).default(""),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: admins } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    const rows = (admins ?? []).map((a) => ({
      user_id: a.user_id,
      title: data.title,
      message: data.message,
      type: data.type,
      link: data.link,
    }));
    if (rows.length) await supabaseAdmin.from("notifications").insert(rows);
    return { sent: rows.length };
  });

/** Admin-only: notify the owner of a product about a review decision. */
export const notifyUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        title: z.string().min(1).max(160),
        message: z.string().max(500).default(""),
        type: z.string().max(40).default("info"),
        link: z.string().max(300).default(""),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("notifications").insert({
      user_id: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      link: data.link,
    });
    return { ok: true };
  });
