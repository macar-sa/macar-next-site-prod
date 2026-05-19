import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostFrontmatter = {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified: string;
  category: string;
  tags: string[];
  author: string;
  cover: string;
  coverAlt?: string;
  draft?: boolean;
};

export type Post = PostFrontmatter & {
  body: string;
  readingMinutes: number;
};

export type PostSummary = Omit<Post, "body">;

function readPostFile(filename: string): Post | null {
  const fullPath = path.join(BLOG_DIR, filename);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  const slug = (data.slug as string) || filename.replace(/\.mdx?$/, "");

  if (data.draft === true) return null;

  const stats = readingTime(content);

  return {
    title: data.title,
    description: data.description,
    slug,
    datePublished: data.datePublished,
    dateModified: data.dateModified ?? data.datePublished,
    category: data.category,
    tags: Array.isArray(data.tags) ? data.tags : [],
    author: data.author ?? "Macar",
    cover: data.cover,
    coverAlt: data.coverAlt,
    draft: false,
    body: content,
    readingMinutes: Math.max(1, Math.round(stats.minutes)),
  };
}

export function getAllPosts(): PostSummary[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => readPostFile(f))
    .filter((p): p is Post => p !== null)
    .sort((a, b) => (a.datePublished < b.datePublished ? 1 : -1))
    .map(({ body, ...rest }) => rest);
}

export function getPostBySlug(slug: string): Post | null {
  if (!fs.existsSync(BLOG_DIR)) return null;
  const candidates = [`${slug}.mdx`, `${slug}.md`];
  for (const filename of candidates) {
    const fullPath = path.join(BLOG_DIR, filename);
    if (fs.existsSync(fullPath)) return readPostFile(filename);
  }
  return null;
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}

export function formatPostDateFR(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-BE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
