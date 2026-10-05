import Image from "next/image";
import { Separator } from "@heroui/react/separator";
import type { ComponentPropsWithoutRef } from "react";
import { TextLink } from "../../_components/links";

function isInternalHref(href: string | undefined): boolean {
  if (!href) return false;
  return href.startsWith("/") || href.startsWith("#");
}

const components = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      {...props}
      className="font-heading text-xl lg:text-2xl 2xl:text-3xl text-foreground mt-14 mb-5 scroll-mt-24"
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3
      {...props}
      className="font-heading text-lg lg:text-xl 2xl:text-2xl text-foreground mt-10 mb-3 scroll-mt-24"
    />
  ),
  h4: (props: ComponentPropsWithoutRef<"h4">) => (
    <h4
      {...props}
      className="text-base lg:text-lg text-foreground font-medium mt-8 mb-2 scroll-mt-24"
    />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p
      {...props}
      className="text-sm lg:text-base 2xl:text-lg leading-loose lg:leading-6 2xl:leading-7 text-muted my-5 max-w-prose"
    />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      {...props}
      className="list-disc pl-6 my-5 space-y-2 text-sm lg:text-base 2xl:text-lg leading-loose lg:leading-6 2xl:leading-7 text-muted max-w-prose"
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      {...props}
      className="list-decimal pl-6 my-5 space-y-2 text-sm lg:text-base 2xl:text-lg leading-loose lg:leading-6 2xl:leading-7 text-muted max-w-prose"
    />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li {...props} className="leading-loose" />
  ),
  // Links in running text: the v3 Link look, always underlined (TextLink underline). External
  // links open in a new tab.
  a: ({ href, children, ...rest }: ComponentPropsWithoutRef<"a">) => {
    if (isInternalHref(href)) {
      return (
        <TextLink underline href={href ?? "#"}>
          {children}
        </TextLink>
      );
    }
    return (
      <TextLink {...rest} underline href={href ?? "#"} target="_blank" rel="noopener noreferrer">
        {children}
      </TextLink>
    );
  },
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      {...props}
      className="border-l-4 border-accent pl-5 my-8 italic text-muted max-w-prose"
    />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      {...props}
      className="rounded-sm bg-default px-1.5 py-0.5 text-[0.9em] font-mono"
    />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      {...props}
      className="my-6 overflow-x-auto rounded-lg bg-default p-4 text-sm font-mono"
    />
  ),
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="my-8 overflow-x-auto">
      <table
        {...props}
        className="w-full border-collapse text-sm lg:text-base text-muted"
      />
    </div>
  ),
  thead: (props: ComponentPropsWithoutRef<"thead">) => (
    <thead {...props} className="bg-default text-foreground" />
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      {...props}
      className="border border-border px-4 py-2 text-left font-medium"
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td {...props} className="border border-border px-4 py-2" />
  ),
  hr: () => <Separator className="my-12" />,
  img: ({ src, alt }: ComponentPropsWithoutRef<"img">) => {
    if (typeof src !== "string") return null;
    return (
      <span className="block my-8 relative w-full aspect-video rounded-lg overflow-hidden">
        <Image
          src={src}
          alt={alt ?? ""}
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          className="object-cover"
        />
      </span>
    );
  },
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong {...props} className="font-semibold text-foreground" />
  ),
};

export default components;
