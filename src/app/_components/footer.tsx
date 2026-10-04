import { Separator } from "@heroui/react/separator";
import { ButtonLink, TextLink } from "./links";
import { Logo_specific } from "./icons/logo_specific";

const menuItems = [
    { name: "Accueil", href: "/" },
    { name: "Découvrez Macar", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Blog", href: "/blog" },
    { name: "FAQ", href: "/#faq" },
    { name: "Nous recrutons", href: "/job" },
];

const legalLinks = [
    { name: "Mentions légales", href: "/mentions-legales" },
    { name: "Politique de confidentialité", href: "/politique-confidentialite" },
    { name: "Politique cookies", href: "/politique-cookies" },
];

// Footer: HeroUI v3 links (TextLink, ButtonLink) and Separator, same layout as before.
export const Footer = () => {
    return (
        <div className="pt-28 pb-14">
            <div className="mx-auto max-w-[1600px] px-4 md:px-16 2xl:px-4">
                <div className="flex flex-col gap-8 md:gap-0 md:flex-row md:items-center md:justify-between">
                    <Logo_specific logoType="Logo_border_blue"
                        complexity="svg_simple"
                        width='100'
                        customClasses="hidden lg:inline">
                    </Logo_specific>
                    <div className="flex flex-row flex-wrap items-center gap-4">
                        <p className="mr-6 text-sm md:text-base">
                            Pour des informations supplémentaires
                        </p>
                        <ButtonLink href="mailto:info@macar.be">info@macar.be</ButtonLink>
                    </div>
                </div>
                <Separator className="mt-14" />
                <div className="mt-14 flex flex-row items-start justify-between">
                    <div className="flex flex-col items-start">
                        <p className="font-medium text-sm md:text-base">Entreprise</p>
                        <ul className="flex flex-col md:flex-row justify-start gap-8 mt-4 text-sm md:text-base">
                            {menuItems.map((item) => (
                                <li key={item.href}>
                                    <TextLink href={item.href} navigation>{item.name}</TextLink>
                                </li>
                            ))}
                        </ul>
                        <p className="font-medium text-sm md:text-base mt-12">Contact</p>
                        <ul className="flex flex-col justify-start gap-2 mt-4 text-sm">
                            <li>
                                tel: <TextLink href="tel:+32478235008" navigation>+32 478 23 50 08</TextLink>
                            </li>
                            <li>
                                email: <TextLink href="mailto:info@macar.be" navigation>info@macar.be</TextLink>
                            </li>
                            <li>
                                fixe: <TextLink href="tel:+3224665304" navigation>+32 246 653 04</TextLink>
                            </li>
                            <li>
                                Avenue Prudent Bols, 43<br />
                                B-1020 Bruxelles/Brussel
                            </li>
                            <li>TVA: BE0477.45.10.24</li>
                        </ul>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className="font-medium text-sm md:text-base">Rejoignez nos réseaux sociaux</p>
                        <TextLink
                            href="https://www.facebook.com/profile.php?id=61552507283765"
                            aria-label="Macar sur Facebook"
                            className="mt-6"
                        >
                            <Facebook />
                        </TextLink>
                    </div>
                </div>
                <Separator className="mt-14" />
                <div className="mt-14 flex flex-col md:flex-row items-start gap-8 justify-between text-sm md:text-base">
                    <p>Copyright © {new Date().getFullYear()} Macar</p>
                    <ul className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
                        {legalLinks.map((item) => (
                            <li key={item.href}>
                                <TextLink href={item.href} navigation>{item.name}</TextLink>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export const Facebook = () => {
    return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_17_24)">
                <path d="M48 24C48 10.7453 37.2547 0 24 0C10.7453 0 0 10.7453 0 24C0 35.255 7.74912 44.6995 18.2026 47.2934V31.3344H13.2538V24H18.2026V20.8397C18.2026 12.671 21.8995 8.8848 29.9194 8.8848C31.44 8.8848 34.0637 9.18336 35.137 9.48096V16.129C34.5706 16.0694 33.5866 16.0397 32.3645 16.0397C28.4294 16.0397 26.9088 17.5306 26.9088 21.4061V24H34.7482L33.4013 31.3344H26.9088V47.8243C38.7926 46.3891 48.001 36.2707 48.001 24H48Z" fill="#0866FF" />
                <path d="M33.4003 31.3344L34.7472 24H26.9078V21.4061C26.9078 17.5306 28.4285 16.0397 32.3635 16.0397C33.5856 16.0397 34.5696 16.0694 35.136 16.129V9.48096C34.0627 9.1824 31.439 8.8848 29.9184 8.8848C21.8986 8.8848 18.2016 12.671 18.2016 20.8397V24H13.2528V31.3344H18.2016V47.2934C20.0582 47.7542 22.0003 48 23.999 48C24.983 48 25.9536 47.9395 26.9069 47.8243V31.3344H33.3994H33.4003Z" fill="white" />
            </g>
            <defs>
                <clipPath id="clip0_17_24">
                    <rect width="48" height="48" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
};
