import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const LOGO_BUCKET = "app-logos";

export type AppRow = {
  id: string;
  name: string;
  logo_url: string;
  description: string;
  created_at: string;
};

export type CategoryRow = {
  id: string;
  name: string;
  app_id: string;
  created_at: string;
};

export async function listApps(): Promise<AppRow[]> {
  const { data, error } = await supabase
    .from("apps")
    .select("id, name, logo_url, description, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getApp(id: string): Promise<AppRow | null> {
  const { data, error } = await supabase
    .from("apps")
    .select("id, name, logo_url, description, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function listCategories(appId: string): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, app_id, created_at")
    .eq("app_id", appId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function uploadLogo(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "png";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(LOGO_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return path;
}

/** Resolves a storage path (or absolute URL) into a displayable image src. */
export function useLogoUrl(logoPath: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!logoPath) {
      setUrl(null);
      return;
    }
    if (/^https?:\/\//.test(logoPath)) {
      setUrl(logoPath);
      return;
    }
    supabase.storage
      .from(LOGO_BUCKET)
      .createSignedUrl(logoPath, 60 * 60)
      .then(({ data }) => {
        if (active) setUrl(data?.signedUrl ?? null);
      });
    return () => {
      active = false;
    };
  }, [logoPath]);

  return url;
}
