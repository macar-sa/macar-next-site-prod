import type { Metadata } from "next";
import Screen from "../_components/screen";
import { SecondHeading, ThirdHeading, P } from "../_components/textStyles";
import { Breadcrumbs } from "../_components/jsonld";

export const metadata: Metadata = {
    title: "Mentions légales — Macar",
    description:
        "Mentions légales de Macar : éditeur, hébergeur, propriété intellectuelle, conditions d'utilisation du site macar.be.",
    alternates: { canonical: "/mentions-legales" },
    openGraph: {
        title: "Mentions légales — Macar",
        description:
            "Mentions légales de Macar, entreprise de rénovation à Bruxelles.",
        url: "https://www.macar.be/mentions-legales",
        type: "website",
    },
};

const sectionGrid = "grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-12 py-10 border-b border-neutral-500/30";
const sectionHeading = "md:col-span-1";
const sectionBody = "md:col-span-2 !max-w-none";

export default function MentionsLegalesPage() {
    return (
        <main className="flex min-h-screen flex-col">
            <Breadcrumbs
                items={[
                    { name: "Accueil", url: "https://www.macar.be/" },
                    { name: "Mentions légales", url: "https://www.macar.be/mentions-legales" },
                ]}
            />
            <Screen name="mentions-legales">
                <SecondHeading>
                    <h1 className="leading-tight">Mentions légales</h1>
                </SecondHeading>

                <div className="mt-10">
                    <section className={sectionGrid}>
                        <ThirdHeading customClasses={sectionHeading}>
                            <h2>Éditeur du site</h2>
                        </ThirdHeading>
                        <P customClasses={sectionBody}>
                            <p className="leading-loose">
                                Macar SRL<br />
                                Avenue Prudent Bols, 43<br />
                                B-1020 Bruxelles, Belgique<br />
                                Téléphone : +32 478 23 50 08 — Fixe : +32 2 466 53 04<br />
                                Email : info@macar.be<br />
                                TVA / BCE : BE0477.45.10.24
                            </p>
                        </P>
                    </section>

                    <section className={sectionGrid}>
                        <ThirdHeading customClasses={sectionHeading}>
                            <h2>Directeur de la publication</h2>
                        </ThirdHeading>
                        <P customClasses={sectionBody} content="Le directeur de la publication du site macar.be est le représentant légal de Macar SRL." />
                    </section>

                    <section className={sectionGrid}>
                        <ThirdHeading customClasses={sectionHeading}>
                            <h2>Hébergement</h2>
                        </ThirdHeading>
                        <P customClasses={sectionBody}>
                            <p className="leading-loose">
                                Le site macar.be est hébergé par Vercel Inc.<br />
                                440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
                                Site web : https://vercel.com
                            </p>
                        </P>
                    </section>

                    <section className={sectionGrid}>
                        <ThirdHeading customClasses={sectionHeading}>
                            <h2>Propriété intellectuelle</h2>
                        </ThirdHeading>
                        <P customClasses={sectionBody} content="L'ensemble des contenus présents sur le site macar.be (textes, photographies, illustrations, logos, marques, éléments graphiques) est la propriété exclusive de Macar SRL ou de ses partenaires, et est protégé par la législation belge et internationale relative à la propriété intellectuelle. Toute reproduction, représentation, modification, publication, adaptation totale ou partielle des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans l'autorisation écrite préalable de Macar SRL." />
                    </section>

                    <section className={sectionGrid}>
                        <ThirdHeading customClasses={sectionHeading}>
                            <h2>Responsabilité</h2>
                        </ThirdHeading>
                        <P customClasses={sectionBody} content="Macar SRL s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur le site, mais ne peut garantir l'absence d'erreurs ou d'omissions. L'utilisateur reconnaît utiliser les informations du site sous sa responsabilité exclusive. Macar SRL ne saurait être tenue responsable des dommages directs ou indirects pouvant résulter de l'accès au site ou de l'utilisation de son contenu." />
                    </section>

                    <section className={sectionGrid}>
                        <ThirdHeading customClasses={sectionHeading}>
                            <h2>Droit applicable</h2>
                        </ThirdHeading>
                        <P customClasses={sectionBody} content="Les présentes mentions légales sont régies par le droit belge. Tout litige relatif à l'utilisation du site macar.be relèvera de la compétence exclusive des tribunaux de Bruxelles." />
                    </section>

                    <section className={sectionGrid}>
                        <ThirdHeading customClasses={sectionHeading}>
                            <h2>Contact</h2>
                        </ThirdHeading>
                        <P customClasses={sectionBody} content="Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter à l'adresse info@macar.be." />
                    </section>

                    <p className="text-font-gray text-xs mt-10">
                        Dernière mise à jour : 17 mai 2026.
                    </p>
                </div>
            </Screen>
        </main>
    );
}
