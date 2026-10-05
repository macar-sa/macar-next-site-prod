import type { Metadata } from "next";
import Image from "next/image";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@heroui/react/breadcrumbs";
import { Card } from "@heroui/react/card";
import { Chip } from "@heroui/react/chip";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import Screen from "../../_components/screen";
import { Breadcrumbs as BreadcrumbsJsonLd } from "../../_components/jsonld";
import { ButtonLink } from "../../_components/links";
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
    title: `${post.title} | Macar`,
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
      <BreadcrumbsJsonLd
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
          {/* Visible trail, same items as the JSON-LD above. flex-wrap and shrink on the last item
              let a long title wrap on a phone instead of overflowing (layout classes only). */}
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <Breadcrumbs className="flex-wrap">
              <Breadcrumbs.Item href="/">Accueil</Breadcrumbs.Item>
              <Breadcrumbs.Item href="/blog">Blog</Breadcrumbs.Item>
              <Breadcrumbs.Item className="shrink">{post.title}</Breadcrumbs.Item>
            </Breadcrumbs>
          </nav>

          <div className="flex flex-row flex-wrap items-center gap-3 text-xs text-muted mb-4">
            <Chip color="accent" variant="soft" size="sm">
              {post.category}
            </Chip>
            <span>{formatPostDateFR(post.datePublished)}</span>
            <span aria-hidden="true">·</span>
            <span>{post.readingMinutes} min de lecture</span>
          </div>

          <h1 className="text-3xl lg:text-5xl text-foreground font-heading leading-tight lg:leading-none mb-6">
            {post.title}
          </h1>

          <p className="text-base lg:text-lg text-muted leading-relaxed lg:leading-7 mb-10">
            {post.description}
          </p>

          {post.cover && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-12">
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

          {/* The h2 keeps Raptor and the heading level (Card.Title is an h3). */}
          <Card className="mt-16">
            <Card.Header>
              <h2 className="font-heading text-2xl lg:text-3xl text-foreground mb-3">
                Un projet en tête ?
              </h2>
              <Card.Description className="max-w-prose">
                Macar accompagne particuliers et professionnels à Bruxelles et alentours depuis 2002. Demandez un devis gratuit et sans engagement.
              </Card.Description>
            </Card.Header>
            <Card.Footer className="flex-wrap gap-3">
              <ButtonLink href="/#contact">Demander un devis</ButtonLink>
              <ButtonLink href="/services" variant="tertiary">
                Voir nos services
              </ButtonLink>
            </Card.Footer>
          </Card>

          {post.tags.length > 0 && (
            <div className="mt-10 flex flex-row flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Chip key={tag} size="sm">
                  #{tag}
                </Chip>
              ))}
            </div>
          )}
        </article>
      </Screen>

      {others.length > 0 && (
        <Screen name="related">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-heading text-2xl lg:text-3xl text-foreground mb-6">
              À lire ensuite
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {others.map((p) => (
                <NextLink key={p.slug} href={`/blog/${p.slug}`} className="block h-full">
                  <Card className="h-full">
                    <Chip color="accent" variant="soft" size="sm">
                      {p.category}
                    </Chip>
                    <Card.Header>
                      <Card.Title>{p.title}</Card.Title>
                    </Card.Header>
                  </Card>
                </NextLink>
              ))}
            </div>
          </div>
        </Screen>
      )}
    </main>
  );
}
