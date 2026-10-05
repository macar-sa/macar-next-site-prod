import type { Metadata } from "next";
import Image from "next/image";
import NextLink from "next/link";
import { Card } from "@heroui/react/card";
import { Chip } from "@heroui/react/chip";
import Screen from "../_components/screen";
import { MainHeading, P } from "../_components/textStyles";
import { Breadcrumbs } from "../_components/jsonld";
import { getAllPosts, formatPostDateFR } from "@/lib/blog";

const TITLE = "Blog Macar : conseils rénovation, plomberie, électricité, toiture à Bruxelles";
const DESCRIPTION =
  "Conseils pratiques, prix indicatifs et démarches pour vos travaux de rénovation, plomberie, électricité et toiture à Bruxelles. Par Macar, entreprise belge depuis 2002.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://www.macar.be/blog",
    type: "website",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <main className="flex min-h-screen flex-col">
      <Breadcrumbs
        items={[
          { name: "Accueil", url: "https://www.macar.be/" },
          { name: "Blog", url: "https://www.macar.be/blog" },
        ]}
      />

      <Screen name="blog-hero">
        <div className="lg:mt-16 grid lg:grid-cols-5 gap-8 text-left">
          <div className="col-span-3">
            <MainHeading>
              <h1 className="leading-tight">Le blog Macar</h1>
            </MainHeading>
          </div>
          <div className="col-span-2">
            <P
              customClasses="mt-6 mb-6"
              content="Conseils pratiques, prix indicatifs et démarches pour vos travaux à Bruxelles : rénovation, plomberie, électricité, toiture. Écrits par des professionnels actifs sur le terrain depuis 2002."
            />
          </div>
        </div>
      </Screen>

      <Screen name="blog-list">
        {posts.length === 0 ? (
          <P content="Les premiers articles arrivent prochainement." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </Screen>
    </main>
  );
}

// A HeroUI v3 Card, with its own styles, that links to the article as a whole (same pattern as
// ServiceCard). Only the cover image has its own classes: size, rounded corners, zoom on hover.
function PostCard({ post }: { post: ReturnType<typeof getAllPosts>[number] }) {
  return (
    <NextLink href={`/blog/${post.slug}`} className="group block h-full">
      <Card className="h-full">
        <div className="relative w-full aspect-video overflow-hidden rounded-2xl">
          <Image
            src={post.cover}
            alt={post.coverAlt ?? post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:transform-[scale(1.05)]"
          />
        </div>
        <div className="flex flex-row flex-wrap items-center gap-3 text-xs text-muted">
          <Chip color="accent" variant="soft" size="sm">
            {post.category}
          </Chip>
          <span>{formatPostDateFR(post.datePublished)}</span>
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} min de lecture</span>
        </div>
        <Card.Header>
          <Card.Title>{post.title}</Card.Title>
          <Card.Description className="line-clamp-3">{post.description}</Card.Description>
        </Card.Header>
      </Card>
    </NextLink>
  );
}
