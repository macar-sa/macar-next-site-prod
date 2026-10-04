import NextLink from "next/link";
import type { ComponentProps } from "react";
import { buttonVariants, linkVariants, type ButtonVariants } from "@heroui/styles";

// HeroUI v3 styles on the Next.js link, the way the HeroUI docs pair them with a router: the
// element stays a real <a> with client-side navigation and prefetch. Server-safe (no React Aria).
// className only places the link in its layout (margins, width), never restyles it.
type NextLinkProps = ComponentProps<typeof NextLink>;

// Text link: the v3 Link look (accent colour, underline on hover, focus ring).
// underline: always-visible underline (the documented v3 `underline` class), for links inside
// running text, where colour alone is not enough to tell a link apart (WCAG 1.4.1).
export function TextLink({ className, underline, ...props }: NextLinkProps & { underline?: boolean }) {
  return <NextLink {...props} className={linkVariants().base({ className: [underline && "underline", className] })} />;
}

// Action link: the v3 Button look. variant "primary" for the main action, "tertiary" for the second one.
export function ButtonLink({
  variant = "primary",
  size,
  fullWidth,
  className,
  ...props
}: NextLinkProps & Pick<ButtonVariants, "variant" | "size" | "fullWidth">) {
  return <NextLink {...props} className={buttonVariants({ variant, size, fullWidth, className })} />;
}
