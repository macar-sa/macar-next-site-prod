import Image from "next/image";

// Partners shown under "Ils nous ont fait confiance". A plain row of five logos: the former
// carousel library loaded its own script and stylesheet, cloned the logos (read twice by screen
// readers) and only ever had one slide on desktop.
const PARTNERS = [
  { file: "ag.png", name: "AG Insurance" },
  { file: "axa.png", name: "AXA" },
  { file: "ethias.png", name: "Ethias" },
  { file: "homeras.png", name: "Homeras" },
  { file: "ip_assistance.png", name: "Inter Partner Assistance" },
];

export const LogoCarousel: React.FC = () => (
  <ul className="grid grid-cols-3 sm:grid-cols-5 items-center gap-4 md:gap-8 md:w-3/4 opacity-95">
    {PARTNERS.map((p) => (
      <li key={p.file} className="relative h-10 md:h-12">
        <Image src={`/companies/${p.file}`} alt={`Logo ${p.name}`} fill sizes="116px" className="object-contain" />
      </li>
    ))}
  </ul>
);
