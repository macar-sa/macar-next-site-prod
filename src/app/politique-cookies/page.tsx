import type { Metadata } from "next";
import Screen from "../_components/screen";
import { SecondHeading, ThirdHeading, P } from "../_components/textStyles";

export const metadata: Metadata = {
    title: "Politique cookies — Macar",
    description:
        "Politique cookies du site macar.be : cookies utilisés, finalités, durée et gestion de votre consentement.",
    alternates: { canonical: "/politique-cookies" },
    openGraph: {
        title: "Politique cookies — Macar",
        description:
            "Cookies utilisés par macar.be et comment gérer votre consentement.",
        url: "https://www.macar.be/politique-cookies",
        type: "website",
    },
};

const sectionGrid = "grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-12 py-10 border-b border-neutral-500/30";
const sectionHeading = "md:col-span-1";
const sectionBody = "md:col-span-2 !max-w-none";

export default function PolitiqueCookiesPage() {
    return (
        <main className="flex min-h-screen flex-col">
            <Screen name="politique-cookies">
                <SecondHeading>
                    <h1 className="leading-tight">Politique cookies</h1>
                </SecondHeading>

                <P customClasses="mt-6 !max-w-3xl" content="Un cookie est un petit fichier texte déposé sur votre appareil lors de votre visite sur un site web. Il permet notamment d'enregistrer des informations relatives à votre navigation. La présente politique vous explique quels cookies sont utilisés sur macar.be, à quelles fins, et comment vous pouvez gérer votre consentement." />

                <div className="mt-10">
                    <section className="py-10 border-b border-neutral-500/30">
                        <ThirdHeading customClasses="mb-6">
                            <h2>Cookies utilisés</h2>
                        </ThirdHeading>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm lg:text-base">
                                <thead>
                                    <tr className="border-b border-neutral-500 text-left">
                                        <th className="py-2 pr-4 font-medium">Cookie</th>
                                        <th className="py-2 pr-4 font-medium">Émetteur</th>
                                        <th className="py-2 pr-4 font-medium">Finalité</th>
                                        <th className="py-2 pr-4 font-medium">Durée</th>
                                    </tr>
                                </thead>
                                <tbody className="text-font-gray">
                                    <tr className="border-b border-neutral-700/30">
                                        <td className="py-3 pr-4">_ga</td>
                                        <td className="py-3 pr-4">Google Analytics 4</td>
                                        <td className="py-3 pr-4">
                                            Distinguer les utilisateurs (mesure d'audience)
                                        </td>
                                        <td className="py-3 pr-4">13 mois</td>
                                    </tr>
                                    <tr className="border-b border-neutral-700/30">
                                        <td className="py-3 pr-4">_ga_*</td>
                                        <td className="py-3 pr-4">Google Analytics 4</td>
                                        <td className="py-3 pr-4">
                                            Conserver l'état de la session
                                        </td>
                                        <td className="py-3 pr-4">13 mois</td>
                                    </tr>
                                    <tr className="border-b border-neutral-700/30">
                                        <td className="py-3 pr-4">Vercel Analytics</td>
                                        <td className="py-3 pr-4">Vercel</td>
                                        <td className="py-3 pr-4">
                                            Mesure d'audience anonyme côté serveur (sans cookie
                                            persistant)
                                        </td>
                                        <td className="py-3 pr-4">Session</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 pr-4">macar_cookie_consent_is_true</td>
                                        <td className="py-3 pr-4">Macar</td>
                                        <td className="py-3 pr-4">
                                            Mémoriser votre choix concernant les cookies
                                        </td>
                                        <td className="py-3 pr-4">12 mois</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-4 text-font-gray text-xs">
                            Aucun cookie publicitaire ni cookie de réseau social tiers n'est
                            déposé par macar.be.
                        </p>
                    </section>

                    <section className={sectionGrid}>
                        <ThirdHeading customClasses={sectionHeading}>
                            <h2>Gestion de votre consentement</h2>
                        </ThirdHeading>
                        <div className="md:col-span-2">
                            <P customClasses="!max-w-none" content="Lors de votre première visite sur macar.be, une bannière vous invite à accepter ou refuser le dépôt des cookies non essentiels (mesure d'audience). Vous pouvez modifier ou retirer votre consentement à tout moment :" />
                            <P customClasses="mt-2 !max-w-none">
                                <ul className="list-disc pl-6 leading-loose">
                                    <li>
                                        En supprimant le cookie « macar_cookie_consent_is_true »
                                        dans les paramètres de votre navigateur — la bannière vous
                                        sera proposée à nouveau.
                                    </li>
                                    <li>
                                        En configurant votre navigateur pour bloquer ou supprimer
                                        les cookies tiers (voir l'aide de Chrome, Firefox, Safari,
                                        Edge).
                                    </li>
                                </ul>
                            </P>
                        </div>
                    </section>

                    <section className={sectionGrid}>
                        <ThirdHeading customClasses={sectionHeading}>
                            <h2>Plus d'informations</h2>
                        </ThirdHeading>
                        <P customClasses={sectionBody}>
                            <p className="leading-loose">
                                Pour en savoir plus sur le traitement de vos données, consultez
                                notre{" "}
                                <a
                                    href="/politique-confidentialite"
                                    className="text-accent1 hover:underline"
                                >
                                    politique de confidentialité
                                </a>
                                . Pour toute question : info@macar.be.
                            </p>
                        </P>
                    </section>

                    <p className="text-font-gray text-xs mt-10">
                        Dernière mise à jour : 17 mai 2026.
                    </p>
                </div>
            </Screen>
        </main>
    );
}
