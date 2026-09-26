import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import Screen from "../../_components/screen";
import { Breadcrumbs } from "../../_components/jsonld";
import { PrimaryButton } from "../../_components/buttons";
import {
  getAllSlugs,
  getPostBySlug,
  formatPostDateFR,
  getAllPosts,
} from "@/lib/blog";
import { LOCAL_BUSINESS_ID } from "@/lib/seo/localBusiness";
import mdxComponents from "../_components/MdxComponents";

const SITE_URL = "https://www.macar.be";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = `${SITE_URL}/blog/${post.slug}`;

  return {
    title: `${post.title} — Macar`,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      images: post.cover ? [{ url: post.cover }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: post.cover ? [post.cover] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const articleUrl = `${SITE_URL}/blog/${post.slug}`;
  const coverAbs = post.cover.startsWith("http")
    ? post.cover
    : `${SITE_URL}${post.cover}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: coverAbs,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    author: {
      "@type": "Organization",
      name: "Macar",
      url: SITE_URL,
    },
    publisher: { "@id": LOCAL_BUSINESS_ID },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    inLanguage: "fr-BE",
    keywords: post.tags.join(", "),
    articleSection: post.category,
  };

  const others = getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

  return (
    <main className="flex min-h-screen flex-col">
      <Breadcrumbs
        items={[
          { name: "Accueil", url: `${SITE_URL}/` },
          { name: "Blog", url: `${SITE_URL}/blog` },
          { name: post.title, url: articleUrl },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <Screen name="post-hero">
        <article className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="inline-block text-sm text-accent1 hover:opacity-80 mb-6"
          >
            ← Tous les articles
          </Link>

          <div className="flex flex-row items-center gap-3 text-xs text-text/70 mb-4">
            <span className="inline-block rounded-full bg-accent1/10 text-accent1 px-3 py-1 font-medium">
              {post.category}
            </span>
            <span>{formatPostDateFR(post.datePublished)}</span>
            <span aria-hidden="true">·</span>
            <span>{post.readingMinutes} min de lecture</span>
          </div>

          <h1 className="text-3xl lg:text-5xl text-headings font-[var(--font-raptor)] leading-tight mb-6">
            {post.title}
          </h1>

          <p className="text-base lg:text-lg text-text leading-relaxed mb-10">
            {post.description}
          </p>

          {post.cover && (
            <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden mb-12">
              <Image
                src={post.cover}
                alt={post.coverAlt ?? post.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
          )}

          <div className="prose-macar">
            <MDXRemote
              source={post.body}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [rehypeSlug],
                },
              }}
            />
          </div>

          <div className="mt-16 rounded-lg border border-bordercard bg-cardbackground p-8">
            <h2 className="font-[var(--font-raptor)] text-2xl lg:text-3xl text-headings mb-3">
              Un projet en tête ?
            </h2>
            <p className="text-sm lg:text-base text-text leading-relaxed mb-6 max-w-prose">
              Macar accompagne particuliers et professionnels à Bruxelles depuis 2002. Demandez un devis gratuit et sans engagement.
            </p>
            <div className="flex flex-row flex-wrap gap-3">
              <PrimaryButton href="/#contact" content="Demander un devis" />
              <Link
                href="/services"
                className="inline-flex items-center px-5 py-2 text-sm font-medium text-accent1 border border-accent1 rounded hover:bg-accent1/5 transition-colors"
              >
                Voir nos services
              </Link>
            </div>
          </div>

          {post.tags.length > 0 && (
            <div className="mt-10 flex flex-row flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded-full border border-bordercard text-text/80 px-3 py-1 text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </Screen>

      {others.length > 0 && (
        <Screen name="related">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-[var(--font-raptor)] text-2xl lg:text-3xl text-headings mb-6">
              À lire ensuite
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {others.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group rounded-lg border border-bordercard bg-cardbackground p-6 transition-all duration-300 hover:border-accent1"
                >
                  <span className="inline-block rounded-full bg-accent1/10 text-accent1 px-3 py-1 text-xs font-medium mb-3">
                    {p.category}
                  </span>
                  <h3 className="text-base lg:text-lg text-headings font-medium leading-snug group-hover:text-accent1 transition-colors">
                    {p.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </Screen>
      )}
    </main>
  );
}
