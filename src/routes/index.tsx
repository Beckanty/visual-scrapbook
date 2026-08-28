import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import heroImage from "@/assets/hero-albums.jpg.asset.json";
import auvergneImage from "@/assets/album-auvergne.jpg.asset.json";
import newbornImage from "@/assets/album-newborn.jpg.asset.json";
import dinnerImage from "@/assets/album-dinner.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Anthologie — Vos albums photos" },
      { name: "description", content: "Créez et partagez vos albums photos dans un espace calme et élégant." },
      { property: "og:title", content: "Anthologie — Vos albums photos" },
      { property: "og:description", content: "Créez et partagez vos albums photos dans un espace calme et élégant." },
    ],
  }),
  component: HomePage,
});

const SAMPLE_ALBUMS = [
  {
    id: "preview-auvergne",
    title: "Été en Auvergne",
    meta: "24 Photographies • 2023",
    image: auvergneImage.url,
    prompt: "Paysage montagneux brumeux dans des tons beiges doux",
  },
  {
    id: "preview-newborn",
    title: "Première Lumière",
    meta: "12 Photographies • 2024",
    image: newbornImage.url,
    prompt: "Gros plan sur des mains tenant un nouveau-né, éclairage chaleureux",
  },
  {
    id: "preview-dinner",
    title: "Rituels du Dimanche",
    meta: "48 Photographies • 2024",
    image: dinnerImage.url,
    prompt: "Table dressée pour le dîner avec fleurs et bougies, mise au point douce",
  },
];

const MASONRY_PROMPTS = [
  { prompt: "Texture macro de lin doux", ratio: "aspect-[3/4]" },
  { prompt: "Ombre de lumière abstraite sur un mur", ratio: "aspect-[3/2]" },
  { prompt: "Vase en céramique avec fleurs séchées", ratio: "aspect-[2/3]" },
  { prompt: "Fenêtre ouverte avec brise légère", ratio: "aspect-square" },
  { prompt: "Table de petit-déjeuner un matin doux", ratio: "aspect-[6/7]" },
  { prompt: "Détail d’un appareil photo argentique", ratio: "aspect-[4/3]" },
];

function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="py-20 px-6 lg:py-28">
        <div className="max-w-6xl mx-auto grid grid-cols-12 gap-12 items-end">
          <div className="col-span-12 lg:col-span-7">
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] text-balance mb-8 text-foreground">
              Vos souvenirs, reliés comme un papier numérique.
            </h1>
            <p className="text-lg text-pretty max-w-[48ch] text-foreground/70 leading-relaxed mb-10">
              Créez de beaux albums photo numériques et tactiles, conçus pour être ressentis. Un espace paisible pour vos moments les plus précieux.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to={user ? "/albums/new" : "/auth"}
                className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Créer un album
              </Link>
              <Link
                to="/albums"
                className="inline-flex items-center justify-center rounded-full border border-input bg-background text-foreground px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
              >
                Voir mes albums
              </Link>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-5">
            <div className="p-3 bg-card ring-1 ring-black/5 rounded-[min(2vw,28px)]">
              <img
                src={heroImage.url}
                alt="Pile d’albums photo reliés de lin sur une table en chêne clair"
                width={1200}
                height={1600}
                className="w-full aspect-[4/5] object-cover rounded-[min(1.5vw,20px)]"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Album Grid */}
      <section className="py-24 bg-muted/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-sm font-medium uppercase tracking-widest text-foreground/40 mb-2">
                Collections récentes
              </h2>
              <h3 className="font-serif text-3xl text-foreground">Bibliothèque</h3>
            </div>
            <Link
              to="/albums"
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              Voir tout →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SAMPLE_ALBUMS.map((album) => (
              <Link key={album.id} to={user ? "/albums" : "/auth"} className="group cursor-pointer block">
                <div className="p-3 bg-background ring-1 ring-black/5 rounded-[20px] mb-4 transition-transform group-hover:-translate-y-1">
                  <img
                    src={album.image}
                    alt={album.prompt}
                    width={800}
                    height={1000}
                    loading="lazy"
                    className="w-full aspect-[4/5] object-cover rounded-[12px]"
                  />
                </div>
                <h4 className="font-medium text-base text-foreground">{album.title}</h4>
                <p className="text-sm text-foreground/50">{album.meta}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Masonry Preview */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-[56ch] mb-16">
            <h3 className="font-serif text-4xl mb-6 text-foreground">Agencement raffiné</h3>
            <p className="text-foreground/70 leading-relaxed">
              Vos photos respirent. Notre grille en masonry s’adapte à l’intention originale de chaque prise de vue, créant un flux qui ressemble à une galerie curatoriale.
            </p>
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {MASONRY_PROMPTS.map((item, idx) => (
              <div
                key={idx}
                className={`relative ${item.ratio} bg-canvas-subtle ring-1 ring-black/5 rounded-[min(1vw,12px)] overflow-hidden flex items-center justify-center`}
              >
                <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-foreground/40 text-center px-4">
                  {item.prompt}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
