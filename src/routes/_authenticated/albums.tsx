import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAlbums } from "@/lib/albums.functions";

export const Route = createFileRoute("/_authenticated/albums")({
  head: () => ({
    meta: [
      { title: "Mes albums — Anthologie" },
      { name: "description", content: "Retrouvez et gérez tous vos albums photos dans votre bibliothèque Anthologie." },
      { property: "og:title", content: "Mes albums — Anthologie" },
      { property: "og:description", content: "Retrouvez et gérez tous vos albums photos dans votre bibliothèque Anthologie." },
    ],
  }),
  component: AlbumsLayout,
});

function AlbumsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isIndex = pathname === "/albums" || pathname === "/albums/";
  return isIndex ? <AlbumsIndex /> : <Outlet />;
}

function AlbumsIndex() {
  const fetchAlbums = useServerFn(getAlbums);
  const { data, isLoading, error } = useQuery({
    queryKey: ["albums"],
    queryFn: () => fetchAlbums(),
  });

  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="mb-2 text-sm font-medium uppercase tracking-widest text-foreground/40">
              Bibliothèque
            </h2>
            <h1 className="font-serif text-4xl text-foreground">Mes albums</h1>
          </div>
          <Link
            to="/albums/new"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Créer un album
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-[20px] bg-muted" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">Impossible de charger vos albums.</p>
        ) : !data || data.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-border px-8 py-20 text-center">
            <h3 className="font-serif text-2xl text-foreground">Aucun album pour l’instant</h3>
            <p className="mx-auto mt-3 max-w-[42ch] text-sm text-muted-foreground">
              Commencez par créer votre premier album, puis ajoutez-y vos photographies.
            </p>
            <Link
              to="/albums/new"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Créer mon premier album
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {data.map((album) => (
              <Link
                key={album.id}
                to="/albums/$albumId"
                params={{ albumId: album.id }}
                className="group block"
              >
                <div className="mb-4 rounded-[20px] bg-background p-3 ring-1 ring-black/5 transition-transform group-hover:-translate-y-1">
                  <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[12px] bg-muted">
                    {album.cover_image ? (
                      <img
                        src={album.cover_image}
                        alt={album.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="font-serif text-3xl text-foreground/25">
                        {album.title.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-base font-medium text-foreground">{album.title}</h3>
                <p className="text-sm text-foreground/50">
                  {new Date(album.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
