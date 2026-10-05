import type { Metadata } from "next";
import { ScrollShadow } from "@heroui/react/scroll-shadow";
import { Separator } from "@heroui/react/separator";
import { Table } from "@heroui/react/table";
import Screen from "../_components/screen";
import { SecondHeading, ThirdHeading, P } from "../_components/textStyles";
import { Breadcrumbs } from "../_components/jsonld";
import { TextLink } from "../_components/links";

export const metadata: Metadata = {
    title: "Politique cookies | Macar",
    description:
        "Politique cookies du site macar.be : cookies utilisés, finalités, durée et gestion de votre consentement.",
    alternates: { canonical: "/politique-cookies" },
    openGraph: {
        title: "Politique cookies | Macar",
        description:
            "Cookies utilisés par macar.be et comment gérer votre consentement.",
        url: "https://www.macar.be/politique-cookies",
        type: "website",
    },
};

const sectionGrid = "grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-12 py-10";

// Cookies listed in the table: name, issuer, purpose, lifetime.
const COOKIES = [
    { name: "_ga", issuer: "Google Analytics 4", purpose: "Distinguer les utilisateurs (mesure d'audience)", duration: "13 mois" },
    { name: "_ga_*", issuer: "Google Analytics 4", purpose: "Conserver l'état de la session", duration: "13 mois" },
    { name: "Vercel Analytics", issuer: "Vercel", purpose: "Mesure d'audience anonyme côté serveur (sans cookie persistant)", duration: "Session" },
    { name: "macar_cookie_consent_is_true", issuer: "Macar", purpose: "Mémoriser votre choix concernant les cookies", duration: "12 mois" },
];
const sectionHeading = "md:col-span-1";
const sectionBody = "md:col-span-2 max-w-none!";

export default function PolitiqueCookiesPage() {
    return (
        <main className="flex min-h-screen flex-col">
            <Breadcrumbs
                items={[
                    { name: "Accueil", url: "https://www.macar.be/" },
                    { name: "Politique cookies", url: "https://www.macar.be/politique-cookies" },
                ]}
            />
            <Screen name="politique-cookies">
                <SecondHeading>
                    <h1 className="leading-tight">Politique cookies</h1>
                </SecondHeading>

                <P customClasses="mt-6 max-w-3xl!" content="Un cookie est un petit fichier texte déposé sur votre appareil lors de votre visite sur un site web. Il permet notamment d'enregistrer des informations relatives à votre navigation. La présente politique vous explique quels cookies sont utilisés sur macar.be, à quelles fins, et comment vous pouvez gérer votre consentement." />

                <div className="mt-10">
                    <section className="py-10">
                        <ThirdHeading customClasses="mb-6">
                            <h2>Cookies utilisés</h2>
                        </ThirdHeading>
                        {/* HeroUI v3 Table. The ScrollShadow takes the place of Table.ScrollContainer: it is
                            the element that scrolls on a phone, so its fade shows that more columns follow. */}
                        <Table>
                            <ScrollShadow orientation="horizontal">
                                <Table.Content aria-label="Cookies utilisés" className="min-w-[600px]">
                                    <Table.Header>
                                        <Table.Column isRowHeader>Cookie</Table.Column>
                                        <Table.Column>Émetteur</Table.Column>
                                        <Table.Column>Finalité</Table.Column>
                                        <Table.Column>Durée</Table.Column>
                                    </Table.Header>
                                    <Table.Body>
                                        {COOKIES.map((cookie) => (
                                            <Table.Row key={cookie.name} id={cookie.name}>
                                                <Table.Cell>{cookie.name}</Table.Cell>
                                                <Table.Cell>{cookie.issuer}</Table.Cell>
                                                <Table.Cell>{cookie.purpose}</Table.Cell>
                                                <Table.Cell>{cookie.duration}</Table.Cell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table.Content>
                            </ScrollShadow>
                        </Table>
                        <p className="mt-4 text-muted text-xs">
                            Aucun cookie publicitaire ni cookie de réseau social tiers n&apos;est
                            déposé par macar.be.
                        </p>
                    </section>
                    <Separator />

                    <section className={sectionGrid}>
                        <ThirdHeading customClasses={sectionHeading}>
                            <h2>Gestion de votre consentement</h2>
                        </ThirdHeading>
                        <div className="md:col-span-2">
                            <P customClasses="max-w-none!" content="Lors de votre première visite sur macar.be, une bannière vous invite à accepter ou refuser le dépôt des cookies non essentiels (mesure d'audience). Vous pouvez modifier ou retirer votre consentement à tout moment :" />
                            <P customClasses="mt-2 max-w-none!">
                                <ul className="list-disc pl-6 leading-loose">
                                    <li>
                                        En supprimant le cookie « macar_cookie_consent_is_true »
                                        dans les paramètres de votre navigateur, la bannière vous
                                        sera proposée à nouveau.
                                    </li>
                                    <li>
                                        En configurant votre navigateur pour bloquer ou supprimer
                                        les cookies tiers (voir l&apos;aide de Chrome, Firefox, Safari,
                                        Edge).
                                    </li>
                                </ul>
                            </P>
                        </div>
                    </section>
                    <Separator />

                    <section className={sectionGrid}>
                        <ThirdHeading customClasses={sectionHeading}>
                            <h2>Plus d&apos;informations</h2>
                        </ThirdHeading>
                        <P customClasses={sectionBody}>
                            <p className="leading-loose">
                                Pour en savoir plus sur le traitement de vos données, consultez
                                notre{" "}
                                <TextLink underline href="/politique-confidentialite">politique de confidentialité</TextLink>
                                . Pour toute question : info@macar.be.
                            </p>
                        </P>
                    </section>
                    <Separator />

                    <p className="text-muted text-xs mt-10">
                        Dernière mise à jour : 17 mai 2026.
                    </p>
                </div>
            </Screen>
        </main>
    );
}
