import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Screen from "../_components/screen";
import { MainHeading, P } from "../_components/textStyles";
import { Breadcrumbs } from "../_components/jsonld";
import { getAllPosts, formatPostDateFR } from "@/lib/blog";

const TITLE = "Blog Macar — Conseils rénovation, plomberie, électricité, toiture à Bruxelles";
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

function PostCard({ post }: { post: ReturnType<typeof getAllPosts>[number] }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-lg overflow-hidden border border-bordercard bg-cardbackground transition-all duration-300 hover:border-accent1 hover:shadow-lg"
    >
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        <Image
          src={post.cover}
          alt={post.coverAlt ?? post.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-3 p-6">
        <div className="flex flex-row items-center gap-3 text-xs text-text/70">
          <span className="inline-block rounded-full bg-accent1/10 text-accent1 px-3 py-1 font-medium">
            {post.category}
          </span>
          <span>{formatPostDateFR(post.datePublished)}</span>
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} min de lecture</span>
        </div>
        <h3 className="text-lg lg:text-xl text-headings font-medium leading-snug group-hover:text-accent1 transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-text leading-relaxed line-clamp-3">
          {post.description}
        </p>
      </div>
    </Link>
  );
}
