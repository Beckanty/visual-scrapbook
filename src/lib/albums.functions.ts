import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Album, PhotoWithSignedUrl } from "./albums";

export const getAlbums = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Album[]> => {
    const { data, error } = await context.supabase
      .from("albums")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  });

export const getAlbum = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ albumId: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }): Promise<Album> => {
    const { data: album, error } = await context.supabase
      .from("albums")
      .select("*")
      .eq("id", data.albumId)
      .eq("user_id", context.userId)
      .single();

    if (error || !album) throw new Error("Album introuvable");
    return album;
  });

export const createAlbum = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        title: z.string().min(1).max(120),
        description: z.string().max(500).optional(),
      })
      .parse(data)
  )
  .handler(async ({ context, data }): Promise<Album> => {
    const { data: album, error } = await context.supabase
      .from("albums")
      .insert({
        user_id: context.userId,
        title: data.title,
        description: data.description,
      })
      .select()
      .single();

    if (error) throw error;
    return album;
  });

export const getPhotos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ albumId: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }): Promise<PhotoWithSignedUrl[]> => {
    const { data: photos, error } = await context.supabase
      .from("photos")
      .select("*")
      .eq("album_id", data.albumId)
      .eq("user_id", context.userId)
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;

    const withUrls = await Promise.all(
      (photos ?? []).map(async (photo) => {
        const { data: signed } = await context.supabase.storage
          .from("photos")
          .createSignedUrl(photo.storage_path, 60 * 60 * 24);

        return {
          ...photo,
          signedUrl: signed?.signedUrl ?? "",
        };
      })
    );

    return withUrls;
  });

export const createPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        albumId: z.string().uuid(),
        storagePath: z.string().min(1),
        caption: z.string().max(300).optional(),
      })
      .parse(data)
  )
  .handler(async ({ context, data }): Promise<PhotoWithSignedUrl> => {
    const { data: album, error: albumError } = await context.supabase
      .from("albums")
      .select("id")
      .eq("id", data.albumId)
      .eq("user_id", context.userId)
      .single();

    if (albumError || !album) throw new Error("Album introuvable");

    const { data: photo, error } = await context.supabase
      .from("photos")
      .insert({
        album_id: data.albumId,
        user_id: context.userId,
        storage_path: data.storagePath,
        url: "",
        caption: data.caption,
      })
      .select()
      .single();

    if (error) throw error;

    const { data: signed } = await context.supabase.storage
      .from("photos")
      .createSignedUrl(photo.storage_path, 60 * 60 * 24);

    return { ...photo, signedUrl: signed?.signedUrl ?? "" };
  });

export const deletePhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        photoId: z.string().uuid(),
        storagePath: z.string().min(1),
      })
      .parse(data)
  )
  .handler(async ({ context, data }) => {
    const { error: dbError } = await context.supabase
      .from("photos")
      .delete()
      .eq("id", data.photoId)
      .eq("user_id", context.userId);

    if (dbError) throw dbError;

    const { error: storageError } = await context.supabase.storage
      .from("photos")
      .remove([data.storagePath]);

    if (storageError) throw storageError;

    return { success: true };
  });

export const deleteAlbum = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ albumId: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    // Storage objects are deleted by cascade trigger? Supabase doesn't cascade
    // storage on album delete, so we clean up photos first.
    const { data: photos, error: photosError } = await context.supabase
      .from("photos")
      .select("storage_path")
      .eq("album_id", data.albumId)
      .eq("user_id", context.userId);

    if (photosError) throw photosError;

    if (photos && photos.length > 0) {
      const { error: storageError } = await context.supabase.storage
        .from("photos")
        .remove(photos.map((p) => p.storage_path));
      if (storageError) throw storageError;
    }

    const { error } = await context.supabase
      .from("albums")
      .delete()
      .eq("id", data.albumId)
      .eq("user_id", context.userId);

    if (error) throw error;
    return { success: true };
  });
