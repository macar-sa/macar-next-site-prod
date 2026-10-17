import type { Metadata } from "next";
import { Separator } from "@heroui/react/separator";
import Screen from "../_components/screen";
import { SecondHeading, ThirdHeading, P } from "../_components/textStyles";
import { Breadcrumbs } from "../_components/jsonld";
import { TextLink } from "../_components/links";
import ManageCookiesButton from "../_components/ManageCookiesButton";

export const metadata: Metadata = {
    title: "Politique de confidentialité | Macar",
    description:
        "Politique de confidentialité de Macar : données collectées, finalités, durée de conservation, vos droits (RGPD).",
    alternates: { canonical: "/politique-confidentialite" },
    openGraph: {
        title: "Politique de confidentialité | Macar",
        description:
            "Comment Macar traite vos données personnelles, conformément au RGPD.",
        url: "https://www.macar.be/politique-confidentialite",
        type: "website",
    },
};

const sectionGrid = "grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-12 py-10";
const sectionHeading = "md:col-span-1";
const sectionBody = "md:col-span-2 max-w-none!";

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

                <P customClasses="mt-6 max-w-3xl!" content="La présente politique de confidentialité décrit la manière dont Macar SA (« Macar », « nous ») collecte, utilise et protège les données à caractère personnel des visiteurs et utilisateurs du site macar.be, conformément au Règlement (UE) 2016/679 (RGPD) et à la loi belge du 30 juillet 2018 relative à la protection des personnes physiques à l'égard des traitements de données à caractère personnel." />

                <div className="mt-10">
                    <section className={sectionGrid}>
                        <ThirdHeading customClasses={sectionHeading}>
                            <h2>Responsable du traitement</h2>
                        </ThirdHeading>
                        <P customClasses={sectionBody}>
                            <p className="leading-loose">
                                Macar SA<br />
                                Avenue Prudent Bols, 43, B-1020 Bruxelles<br />
                                TVA : BE0477.45.10.24<br />
                                Email : info@macar.be
                            </p>
                        </P>
                    </section>
                    <Separator />

                    <section className={sectionGrid}>
                        <ThirdHeading customClasses={sectionHeading}>
                            <h2>Données collectées</h2>
                        </ThirdHeading>
                        <div className="md:col-span-2">
                            <P customClasses="max-w-none!" content="Nous collectons les données suivantes :" />
                            <P customClasses="mt-2 max-w-none!">
                                <ul className="list-disc pl-6 leading-loose">
                                    <li>
                                        Données fournies via le formulaire de contact : nom, adresse
                                        e-mail, numéro de téléphone, contenu du message.
                                    </li>
                                    <li>
                                        Provenance de votre demande, jointe à votre message quand vous
                                        utilisez le formulaire : page d&apos;où vous l&apos;envoyez, page
                                        d&apos;arrivée sur le site et manière dont vous y êtes arrivé
                                        (publicité, campagne, moteur de recherche, site référent ou accès
                                        direct). Si vous acceptez la catégorie Publicité, nous y joignons
                                        aussi l&apos;identifiant du clic sur notre annonce Google, pour
                                        savoir quelles annonces mènent à un devis.
                                    </li>
                                    <li>
                                        Données techniques collectées automatiquement via Google
                                        Analytics 4 (si vous acceptez la catégorie Analytique) et Vercel
                                        Analytics : type d&apos;appareil, navigateur, pages visitées, durée
                                        de visite, source de trafic, adresse IP anonymisée, envoi
                                        d&apos;une demande et clic sur notre numéro de téléphone.
                                    </li>
                                    <li>
                                        Si vous acceptez la catégorie Publicité : données de mesure
                                        publicitaire collectées par Google Ads et par le pixel Meta,
                                        notamment un identifiant de cookie, les pages visitées, le clic
                                        sur une de nos annonces, l&apos;envoi d&apos;une demande et le clic
                                        sur notre numéro de téléphone.
                                    </li>
                                    <li>
                                        Votre choix concernant les cookies, avec sa date, gardé dans un
                                        cookie sur votre appareil.
                                    </li>
                                </ul>
                            </P>
                        </div>
                    </section>
                    <Separator />

                    <section className={sectionGrid}>
                        <ThirdHeading customClasses={sectionHeading}>
                            <h2>Finalités et bases légales</h2>
                        </ThirdHeading>
                        <P customClasses={sectionBody}>
                            <ul className="list-disc pl-6 leading-loose">
                                <li>
                                    Répondre à vos demandes de devis ou questions et savoir comment
                                    vous nous avez trouvés. Base légale : mesures précontractuelles à
                                    votre demande (art. 6.1.b RGPD).
                                </li>
                                <li>
                                    Mesurer l&apos;audience, compter les demandes envoyées et les
                                    clics sur notre numéro, et améliorer le site. Base légale : votre
                                    consentement recueilli via la bannière cookies, catégorie
                                    Analytique (art. 6.1.a RGPD).
                                </li>
                                <li>
                                    Mesurer l&apos;efficacité de nos publicités Google Ads et Meta
                                    (Facebook, Instagram), c&apos;est-à-dire savoir quelles annonces
                                    amènent des demandes de devis, et vous montrer des annonces plus
                                    pertinentes. Si votre demande aboutit à un devis signé, nous
                                    pouvons transmettre à Google Ads l&apos;identifiant du clic et la
                                    date de signature, sans vos coordonnées. Base légale : votre
                                    consentement recueilli via la bannière cookies, catégorie
                                    Publicité (art. 6.1.a RGPD).
                                </li>
                                <li>
                                    Sécurité et bon fonctionnement du site. Base légale : intérêt
                                    légitime (art. 6.1.f RGPD).
                                </li>
                            </ul>
                        </P>
                    </section>
                    <Separator />

                    <section className={sectionGrid}>
                        <ThirdHeading customClasses={sectionHeading}>
                            <h2>Destinataires et sous-traitants</h2>
                        </ThirdHeading>
                        <div className="md:col-span-2">
                            <P customClasses="max-w-none!" content="Vos données sont traitées par Macar et transmises aux destinataires suivants, dans la stricte mesure nécessaire à la finalité poursuivie :" />
                            <P customClasses="mt-2 max-w-none!">
                                <ul className="list-disc pl-6 leading-loose">
                                    <li>Formspree (États-Unis) : hébergement du formulaire de contact.</li>
                                    <li>Vercel Inc. (États-Unis) : hébergement du site et mesure d&apos;audience anonyme.</li>
                                    <li>
                                        Google Ireland Limited : Google Analytics 4, si vous acceptez la
                                        catégorie Analytique, et Google Ads, si vous acceptez la
                                        catégorie Publicité. Google explique l&apos;usage qu&apos;il fait
                                        de ces données dans{" "}
                                        <TextLink underline href="https://policies.google.com/technologies/partner-sites">
                                            Comment utilisons-nous les informations collectées via les
                                            sites ou applications qui font appel à nos services ?
                                        </TextLink>
                                    </li>
                                    <li>
                                        Meta Platforms Ireland Limited : pixel Meta, si vous acceptez la
                                        catégorie Publicité, pour mesurer nos publicités sur Facebook et
                                        Instagram. Meta utilise ces données selon sa{" "}
                                        <TextLink underline href="https://www.facebook.com/privacy/policy/">
                                            politique de confidentialité
                                        </TextLink>
                                        . Pour la collecte de ces données sur notre site et leur
                                        transmission à Meta, Macar et Meta sont en principe
                                        responsables conjoints ; Meta reste seul responsable de leur
                                        utilisation ensuite.
                                    </li>
                                </ul>
                            </P>
                            <P customClasses="mt-2 max-w-none!" content="Lorsque des données sont transférées hors de l'Espace économique européen, ces transferts sont encadrés par les clauses contractuelles types de la Commission européenne." />
                        </div>
                    </section>
                    <Separator />

                    <section className={sectionGrid}>
                        <ThirdHeading customClasses={sectionHeading}>
                            <h2>Durée de conservation</h2>
                        </ThirdHeading>
                        <P customClasses={sectionBody}>
                            <ul className="list-disc pl-6 leading-loose">
                                <li>
                                    Messages du formulaire de contact, provenance et identifiant de
                                    clic compris : 3 ans à compter du dernier contact.
                                </li>
                                <li>
                                    Données d&apos;audience (Google Analytics 4) : 14 mois.
                                </li>
                                <li>
                                    Cookies publicitaires de Google Ads et de Meta : 90 jours.
                                </li>
                                <li>
                                    Provenance de votre visite gardée sur votre appareil (si vous
                                    acceptez la catégorie Publicité) : effacée à la fermeture de
                                    l&apos;onglet.
                                </li>
                                <li>
                                    Cookies : voir la{" "}
                                    <TextLink underline href="/politique-cookies">politique cookies</TextLink>
                                    .
                                </li>
                            </ul>
                        </P>
                    </section>
                    <Separator />

                    <section className={sectionGrid}>
                        <ThirdHeading customClasses={sectionHeading}>
                            <h2>Vos droits</h2>
                        </ThirdHeading>
                        <div className="md:col-span-2">
                            <P customClasses="max-w-none!" content="Conformément au RGPD, vous disposez à tout moment des droits suivants : droit d'accès, de rectification, d'effacement, de limitation du traitement, d'opposition et de portabilité de vos données, ainsi que du droit de retirer votre consentement. Vous pouvez exercer ces droits en nous écrivant à info@macar.be, en joignant une preuve d'identité." />
                            <P customClasses="mt-2 max-w-none!" content="Vous pouvez retirer votre consentement aux cookies à tout moment, aussi simplement que vous l'avez donné, avec le bouton ci-dessous ou le lien « Gérer mes cookies » en bas de chaque page. Les cookies concernés sont alors supprimés et la mesure s'arrête aussitôt." />
                            <div className="mt-4">
                                <ManageCookiesButton appearance="button" />
                            </div>
                            <P customClasses="mt-4 max-w-none!" content="Vous avez également le droit d'introduire une réclamation auprès de l'Autorité de protection des données (APD) : Rue de la Presse 35, 1000 Bruxelles, contact@apd-gba.be, www.autoriteprotectiondonnees.be." />
                        </div>
                    </section>
                    <Separator />

                    <section className={sectionGrid}>
                        <ThirdHeading customClasses={sectionHeading}>
                            <h2>Sécurité</h2>
                        </ThirdHeading>
                        <P customClasses={sectionBody} content="Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte, altération ou divulgation." />
                    </section>
                    <Separator />

                    <p className="text-muted text-xs mt-10">
                        Dernière mise à jour : 17 octobre 2026.
                    </p>
                </div>
            </Screen>
        </main>
    );
}
