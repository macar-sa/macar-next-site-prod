import Image from 'next/image'
import { pageOpenGraph } from "@/lib/seo/openGraph";
import Screen from '../_components/screen'
import { MainHeading, P, SecondHeading } from '../_components/textStyles'
import { Card } from '@heroui/react/card';
import aboutbanner from '/src/app/about/about_banner.webp';
import { Logo_specific } from '../_components/icons/logo_specific';
import { Breadcrumbs } from '../_components/jsonld';
import { TextLink } from '../_components/links';
import { LOCAL_BUSINESS_ID, WEBSITE_ID } from '@/lib/seo/localBusiness';
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'À propos de Macar : notre histoire à Bruxelles',
    description: 'Macar, entreprise de rénovation et construction à Bruxelles depuis 2002. Notre histoire, notre équipe et nos valeurs : confiance, professionnalisme, transparence et adaptabilité.',
    alternates: { canonical: '/about' },
    openGraph: pageOpenGraph({ title: 'À propos de Macar : notre histoire à Bruxelles', description: 'Macar, entreprise de rénovation et construction à Bruxelles depuis 2002. Notre histoire, notre équipe et nos valeurs : confiance, professionnalisme, transparence et adaptabilité.', path: '/about' }),
}

const values = [
    {
        title: 'Confiance',
        description: "Nos engagements sont bien plus qu'un contrat signé. Nous bâtissons des relations durables en tenant nos promesses et en dépassant vos attentes.",
    },
    {
        title: 'Transparence',
        description: "Nous communiquons clairement les coûts, les délais et les méthodologies. Vous serez informés à chaque étape, sans coûts cachés ni surprises.",
    },
    {
        title: 'Professionnalisme',
        description: "Notre équipe travaille avec rigueur et attention au détail, protège votre logement pendant le chantier et le laisse propre en partant.",
    },
    {
        title: 'Adaptabilité',
        description: "Nous sommes flexibles et réactifs face aux besoins changeants de nos clients et du marché, garantissant des solutions sur mesure pour chaque projet.",
    },
];

// Facts confirmed by Macar on 23/11/2026 (plan 2026-11-23-corrections-audit-seo-geo, task 12).
const howWeWork = [
    "Une visite sur place avant tout chiffrage.",
    "Un devis détaillé et gratuit, valable 30 jours.",
    "Un paiement réparti sur le chantier : 5 % à la signature, 40 % au début des travaux, 45 % en cours de chantier et 10 % à la fin.",
    "L'échafaudage, quand il en faut un, est toujours chiffré à part dans le devis.",
    "Les urgences sont prises en charge en journée, du lundi au vendredi.",
];

const aboutPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: "https://www.macar.be/about",
    name: "À propos de Macar",
    inLanguage: "fr-BE",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": LOCAL_BUSINESS_ID },
};

export default function about() {
    return (
        <main className="flex min-h-screen flex-col">
            <Breadcrumbs
                items={[
                    { name: 'Accueil', url: 'https://www.macar.be/' },
                    { name: 'À propos', url: 'https://www.macar.be/about' },
                ]}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
            />
            <Screen name="about">
                <div className="lg:mt-16 grid lg:grid-cols-5 gap-8 text-left">
                    <div className="col-span-3">
                        <MainHeading>
                            <h1 className="leading-tight">Découvrez Macar</h1>
                        </MainHeading>
                    </div>
                    <div className="col-span-2">
                        <P customClasses='mt-6 mb-6' content="Macar intervient partout en Belgique, et avant tout à Bruxelles, où l'entreprise est basée depuis 2002. Rénovation, plomberie, électricité et toiture : une seule entreprise pour tout le chantier." />
                    </div>
                </div>
                <div className="relative w-full mt-10 h-40 md:h-[400px]">
                    <Image
                        src={aboutbanner}
                        alt="Bannière Macar, entreprise de rénovation à Bruxelles"
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1280px"
                        className="object-cover"
                    />
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                        <Logo_specific
                            logoType="Logo_border_white"
                            complexity="svg_complete"
                            width="auto"
                            customClasses="hidden lg:inline"
                        />
                    </div>
                </div>
            </Screen>

            <Screen name="Histoire et Equipe">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 mb-8 text-left">
                    <div>
                        <SecondHeading><h2>Notre histoire</h2></SecondHeading>
                        <P customClasses="mt-4" content="Macar a été fondée en 2002 à Bruxelles. En 2010, l'équipe actuelle a repris l'entreprise et l'a fait grandir chantier après chantier. Notre siège est à Laeken." />
                    </div>
                    <div>
                        <SecondHeading><h2>Qui dirige Macar</h2></SecondHeading>
                        <P customClasses="mt-4" content="Macar est dirigée par Shkelzen Shalaj, gérant. Les articles de notre blog portent sa signature. L'équipe réunit des professionnels de la rénovation, de la plomberie, de l'électricité et de la toiture." />
                    </div>
                    <div>
                        <SecondHeading><h2>Nos métiers</h2></SecondHeading>
                        <div className="mt-4 text-sm lg:text-base 2xl:text-lg max-w-prose">
                            <ul className="mt-2 leading-loose list-disc list-inside">
                                <li><TextLink href="/services/renovation">Rénovation intérieure et extérieure</TextLink>, y compris le remplacement de châssis et fenêtres en PVC</li>
                                <li><TextLink href="/services/plomberie">Plomberie et chauffage</TextLink></li>
                                <li><TextLink href="/services/electricite">Installations électriques</TextLink></li>
                                <li><TextLink href="/services/toiture">Toiture</TextLink>, y compris les travaux après un sinistre</li>
                            </ul>
                            <p className="mt-4 leading-loose">
                                Nous travaillons pour des particuliers, des propriétaires bailleurs, des syndics et des copropriétés. Voir aussi nos{" "}
                                <TextLink href="/zones">zones desservies</TextLink>.
                            </p>
                        </div>
                    </div>
                    <div>
                        <SecondHeading><h2>Comment nous travaillons</h2></SecondHeading>
                        <div className="mt-4 text-sm lg:text-base 2xl:text-lg max-w-prose">
                            <ul className="mt-2 leading-loose list-disc list-inside">
                                {howWeWork.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                            <p className="mt-4 leading-loose">
                                Macar est couverte par une assurance responsabilité civile entreprise, pendant le chantier et après la livraison.
                            </p>
                        </div>
                    </div>
                </div>
            </Screen>

            <Screen name="valeurs">
                <SecondHeading customClasses="mb-8"> <h2>Nos Valeurs</h2></SecondHeading>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {values.map((value) => (
                        <Card key={value.title}>
                            <Card.Header>
                                <Card.Title>{value.title}</Card.Title>
                                <Card.Description>{value.description}</Card.Description>
                            </Card.Header>
                        </Card>
                    ))}
                </div>
            </Screen>
        </main >
    )
}