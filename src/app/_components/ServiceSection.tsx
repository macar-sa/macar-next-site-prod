import Image from "next/image";
import Link from "next/link";
import { Chip } from "@heroui/react";
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
              className="flex-shrink-0 object-contain"
              aria-hidden
            />
            <SecondHeading customClasses="text-left text-xl lg:text-2xl mt-0">
              <h2>{title}</h2>
            </SecondHeading>
          </div>
          <p className="text-sm text-default-600 mb-4">{summary}</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {chips.map((label) => (
              <Chip
                key={label}
                variant="flat"
                color="primary"
                size="sm"
                classNames={{
                  base: "bg-primary/10",
                  content: "text-primary font-medium",
                }}
              >
                {label}
              </Chip>
            ))}
          </div>
          <Link
            href="/#contact"
            className="text-sm font-medium text-accent1 hover:underline"
          >
            Demander un devis pour ce service →
          </Link>
        </div>
        <div className="mt-6 lg:mt-0">
          {hasDetailCategories ? (
            <div className="space-y-6">
              <p className="text-sm lg:text-base text-default-700 leading-relaxed">
                {detailIntro}
              </p>
              <div className="space-y-5">
                {detailCategories!.map((cat) => (
                  <div key={cat.title}>
                    <h3 className="text-sm font-semibold text-headings mb-2">
                      {cat.title}
                    </h3>
                    <ul className="text-sm text-default-700 leading-relaxed space-y-1 list-disc list-inside marker:text-primary/70">
                      {cat.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm lg:text-base text-default-700 leading-relaxed">
              {detail}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
