import { createFileRoute, Outlet } from "@tanstack/react-router";
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
  return <Outlet />;
}
