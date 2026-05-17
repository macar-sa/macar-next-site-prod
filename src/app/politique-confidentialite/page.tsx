import type { Metadata } from "next";
import Screen from "../_components/screen";
import { SecondHeading, ThirdHeading, P } from "../_components/textStyles";
import { Breadcrumbs } from "../_components/jsonld";

export const metadata: Metadata = {
    title: "Politique de confidentialité — Macar",
    description:
        "Politique de confidentialité de Macar : données collectées, finalités, durée de conservation, vos droits (RGPD).",
    alternates: { canonical: "/politique-confidentialite" },
    openGraph: {
        title: "Politique de confidentialité — Macar",
        description:
            "Comment Macar traite vos données personnelles, conformément au RGPD.",
        url: "https://www.macar.be/politique-confidentialite",
        type: "website",
    },
};

const sectionGrid = "grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-12 py-10 border-b border-neutral-500/30";
const sectionHeading = "md:col-span-1";
const sectionBody = "md:col-span-2 !max-w-none";

export default function PolitiqueConfidentialitePage() {
    return (
        <main className="flex min-h-screen flex-col">
            <Breadcrumbs
                items={[
                    { name: "Accueil", url: "https://www.macar.be/" },
                    { name: "Politique de confidentialité", url: "https://www.macar.be/politique-confidentialite" },
                ]}
            />
            <Screen name="politique-confidentialite">
                <SecondHeading>
                    <h1 className="leading-tight">Politique de confidentialité</h1>
                </SecondHeading>

                <P customClasses="mt-6 !max-w-3xl" content="La présente politique de confidentialité décrit la manière dont Macar SRL (« Macar », « nous ») collecte, utilise et protège les données à caractère personnel des visiteurs et utilisateurs du site macar.be, conformément au Règlement (UE) 2016/679 (RGPD) et à la loi belge du 30 juillet 2018 relative à la protection des personnes physiques à l'égard des traitements de données à caractère personnel." />

                <div className="mt-10">
                    <section className={sectionGrid}>
                        <ThirdHeading customClasses={sectionHeading}>
                            <h2>Responsable du traitement</h2>
                        </ThirdHeading>
                        <P customClasses={sectionBody}>
                            <p className="leading-loose">
                                Macar SRL<br />
                                Avenue Prudent Bols, 43 — B-1020 Bruxelles<br />
                                TVA : BE0477.45.10.24<br />
                                Email : info@macar.be
                            </p>
                        </P>
                    </section>

                    <section className={sectionGrid}>
                        <ThirdHeading customClasses={sectionHeading}>
                            <h2>Données collectées</h2>
                        </ThirdHeading>
                        <div className="md:col-span-2">
                            <P customClasses="!max-w-none" content="Nous collectons les données suivantes :" />
                            <P customClasses="mt-2 !max-w-none">
                                <ul className="list-disc pl-6 leading-loose">
                                    <li>
                                        Données fournies via le formulaire de contact : nom, adresse
                                        e-mail, contenu du message.
                                    </li>
                                    <li>
                                        Données techniques collectées automatiquement via Google
                                        Analytics 4 et Vercel Analytics : type d'appareil, navigateur,
                                        pages visitées, durée de visite, source de trafic, adresse IP
                                        anonymisée.
                                    </li>
                                </ul>
                            </P>
                        </div>
                    </section>

                    <section className={sectionGrid}>
                        <ThirdHeading customClasses={sectionHeading}>
                            <h2>Finalités et bases légales</h2>
                        </ThirdHeading>
                        <P customClasses={sectionBody}>
                            <ul className="list-disc pl-6 leading-loose">
                                <li>
                                    Répondre à vos demandes de devis ou questions — base légale :
                                    mesures précontractuelles à votre demande (art. 6.1.b RGPD).
                                </li>
                                <li>
                                    Mesurer l'audience et améliorer le site — base légale : votre
                                    consentement recueilli via la bannière cookies (art. 6.1.a
                                    RGPD).
                                </li>
                                <li>
                                    Sécurité et bon fonctionnement du site — base légale : intérêt
                                    légitime (art. 6.1.f RGPD).
                                </li>
                            </ul>
                        </P>
                    </section>

                    <section className={sectionGrid}>
                        <ThirdHeading customClasses={sectionHeading}>
                            <h2>Destinataires et sous-traitants</h2>
                        </ThirdHeading>
                        <div className="md:col-span-2">
                            <P customClasses="!max-w-none" content="Vos données sont traitées par Macar et par les sous-traitants suivants, dans la stricte mesure nécessaire à la finalité poursuivie :" />
                            <P customClasses="mt-2 !max-w-none">
                                <ul className="list-disc pl-6 leading-loose">
                                    <li>Formspree (États-Unis) — hébergement du formulaire de contact.</li>
                                    <li>Vercel Inc. (États-Unis) — hébergement du site et analytics.</li>
                                    <li>Google Ireland Limited — Google Analytics 4.</li>
                                </ul>
                            </P>
                            <P customClasses="mt-2 !max-w-none" content="Lorsque des données sont transférées hors de l'Espace économique européen, ces transferts sont encadrés par les clauses contractuelles types de la Commission européenne." />
                        </div>
                    </section>

                    <section className={sectionGrid}>
                        <ThirdHeading customClasses={sectionHeading}>
                            <h2>Durée de conservation</h2>
                        </ThirdHeading>
                        <P customClasses={sectionBody}>
                            <ul className="list-disc pl-6 leading-loose">
                                <li>
                                    Messages du formulaire de contact : 3 ans à compter du dernier
                                    contact.
                                </li>
                                <li>
                                    Données d'audience (Google Analytics 4) : 14 mois.
                                </li>
                                <li>
                                    Cookies : voir la{" "}
                                    <a
                                        href="/politique-cookies"
                                        className="text-accent1 hover:underline"
                                    >
                                        politique cookies
                                    </a>
                                    .
                                </li>
                            </ul>
                        </P>
                    </section>

                    <section className={sectionGrid}>
                        <ThirdHeading customClasses={sectionHeading}>
                            <h2>Vos droits</h2>
                        </ThirdHeading>
                        <div className="md:col-span-2">
                            <P customClasses="!max-w-none" content="Conformément au RGPD, vous disposez à tout moment des droits suivants : droit d'accès, de rectification, d'effacement, de limitation du traitement, d'opposition et de portabilité de vos données, ainsi que du droit de retirer votre consentement. Vous pouvez exercer ces droits en nous écrivant à info@macar.be, en joignant une preuve d'identité." />
                            <P customClasses="mt-2 !max-w-none" content="Vous avez également le droit d'introduire une réclamation auprès de l'Autorité de protection des données (APD) : Rue de la Presse 35, 1000 Bruxelles — contact@apd-gba.be — www.autoriteprotectiondonnees.be." />
                        </div>
                    </section>

                    <section className={sectionGrid}>
                        <ThirdHeading customClasses={sectionHeading}>
                            <h2>Sécurité</h2>
                        </ThirdHeading>
                        <P customClasses={sectionBody} content="Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte, altération ou divulgation." />
                    </section>

                    <p className="text-font-gray text-xs mt-10">
                        Dernière mise à jour : 17 mai 2026.
                    </p>
                </div>
            </Screen>
        </main>
    );
}
