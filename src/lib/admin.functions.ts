import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const seedAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { seedDefaultAdmin } = await import("./admin.server");
  return seedDefaultAdmin();
});

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getOwnProfile } = await import("./profile.server");
    return getOwnProfile(context.supabase, context.userId);
  });

export const getUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin, listAllUsers } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    return listAllUsers();
  });

export const addUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        name: z.string().min(1).max(120),
        email: z.string().email(),
        password: z.string().min(6).max(72),
        phone: z.string().max(40).default(""),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { assertAdmin, createManagedUser } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    return createManagedUser(data);
  });

export const removeUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin, deleteManagedUser } = await import("./admin.server");
    await assertAdmin(context.supabase, context.userId);
    return deleteManagedUser(data.id, context.userId);
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        name: z.string().min(1).max(120),
        phone: z.string().max(40).default(""),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { updateOwnProfile } = await import("./profile.server");
    return updateOwnProfile(context.supabase, context.userId, data);
  });
