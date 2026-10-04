import Image from "next/image";
import Link from "next/link";
import { Chip } from "@heroui/react/chip";
import { SecondHeading } from "./textStyles";
import type { ServiceItem } from "@/lib/services";

export default function ServiceSection({
  id,
  title,
  image,
  summary,
  detail,
  detailIntro,
  detailCategories,
  chips,
}: ServiceItem) {
  const hasDetailCategories = detailCategories && detailCategories.length > 0;

  return (
    <section id={id} className="scroll-mt-24">
      <div className="lg:grid lg:grid-cols-[1.1fr_1.25fr] lg:gap-x-12 xl:gap-x-16 lg:items-start">
        <div className="lg:sticky lg:top-28">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src={image}
              alt=""
              width={40}
              height={40}
              className="shrink-0 object-contain"
              aria-hidden
            />
            <SecondHeading customClasses="text-left text-xl lg:text-2xl mt-0">
              <h2>{title}</h2>
            </SecondHeading>
          </div>
          <p className="text-sm text-muted mb-4">{summary}</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {chips.map((label) => (
              <Chip
                key={label}
                className="relative inline-flex items-center justify-between whitespace-nowrap shrink w-auto gap-[normal] px-1 py-0 rounded-full bg-accent-soft text-inherit [font-size:inherit] [line-height:inherit] [font-weight:inherit]"
              >
                <Chip.Label className="flex-1 px-1 text-accent font-medium">{label}</Chip.Label>
              </Chip>
            ))}
          </div>
          <Link
            href="/#contact"
            className="text-sm font-medium text-accent hover:underline"
          >
            Demander un devis pour ce service →
          </Link>
        </div>
        <div className="mt-6 lg:mt-0">
          {hasDetailCategories ? (
            <div className="space-y-6">
              <p className="text-sm lg:text-base text-muted leading-relaxed lg:leading-6">
                {detailIntro}
              </p>
              <div className="space-y-5">
                {detailCategories!.map((cat) => (
                  <div key={cat.title}>
                    <h3 className="text-sm font-semibold text-foreground mb-2">
                      {cat.title}
                    </h3>
                    <ul className="text-sm text-muted leading-relaxed space-y-1 list-disc list-inside marker:text-accent">
                      {cat.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm lg:text-base text-muted leading-relaxed lg:leading-6">
              {detail}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
