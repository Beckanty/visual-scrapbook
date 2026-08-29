import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { createAlbum } from "@/lib/albums.functions";

export const Route = createFileRoute("/_authenticated/albums/new")({
  head: () => ({
    meta: [
      { title: "Nouvel album — Anthologie" },
      { name: "description", content: "Créez un nouvel album photo et commencez à y relier vos souvenirs." },
      { property: "og:title", content: "Nouvel album — Anthologie" },
      { property: "og:description", content: "Créez un nouvel album photo et commencez à y relier vos souvenirs." },
    ],
  }),
  component: NewAlbumPage,
});

function NewAlbumPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const create = useServerFn(createAlbum);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const album = await create({
        data: { title: title.trim(), description: description.trim() || undefined },
      });
      await queryClient.invalidateQueries({ queryKey: ["albums"] });
      toast.success("Album créé.");
      navigate({ to: "/albums/$albumId", params: { albumId: album.id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Création impossible");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-xl">
        <Link to="/albums" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          ← Mes albums
        </Link>
        <h1 className="mt-6 font-serif text-4xl text-foreground">Nouvel album</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Donnez-lui un nom, vous pourrez ajouter vos photos juste après.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
              Titre
            </span>
            <input
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Été en Auvergne"
              className="rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
              Description (optionnelle)
            </span>
            <textarea
              maxLength={500}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Quelques mots sur cette collection…"
              className="resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <button
            type="submit"
            disabled={busy || title.trim().length === 0}
            className="mt-2 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? "Création…" : "Créer l’album"}
          </button>
        </form>
      </div>
    </div>
  );
}
