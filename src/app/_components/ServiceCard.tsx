import Image from "next/image";
import NextLink from "next/link";
import { Card } from "@heroui/react/card";

// A HeroUI v3 Card, with its own styles, that links to a page as a whole. The <a> only wraps the
// card and stretches it to the height of its grid row. Server-safe (deep import of the Card).
export function ServiceCard({
  href,
  image,
  imageAlt = "",
  title,
  description,
  footer,
}: {
  href: string;
  image: string;
  imageAlt?: string;
  title: string;
  description?: string;
  footer?: string;
}) {
  return (
    <NextLink href={href} className="block h-full">
      <Card className="h-full">
        <Image src={image} alt={imageAlt} width={48} height={48} className="object-contain" />
        <Card.Header>
          <Card.Title>{title}</Card.Title>
          {description && <Card.Description>{description}</Card.Description>}
        </Card.Header>
        {footer && (
          <Card.Footer className="mt-auto">
            <span className="text-sm font-medium text-accent">{footer}</span>
          </Card.Footer>
        )}
      </Card>
    </NextLink>
  );
}
