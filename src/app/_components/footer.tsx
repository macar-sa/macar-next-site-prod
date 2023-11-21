"use client";
import Link from "next/link";
import { PrimaryButton } from "./buttons";
import { Logo } from "./icons/logo";
import { P } from "./textStyles";

export const Footer = () => {
    const menuItems = [
        { name: "Acceuil", href: "#" },
        { name: "A propos de nous", href: "#" },
        { name: "Services", href: "#" },
    ];
    return (
        <div className="pt-28 pb-14">
            <div className="mx-auto max-w-[1600px] px-4 md:px-16 2xl:px-4">
                <div className="flex flex-col gap-8 md:gap-0 md:flex-row md:items-center md:justify-between">
                    <Logo iconOnly={false} width={200} />
                    <div className="flex flex-row items-center">
                        <p className="mr-10 text-sm md:text-base">
                            Pour des informations supplémentaires
                        </p>
                        <PrimaryButton
                            content="info@macar.be"
                            href="mailto:info@macar.be"
                        />
                    </div>
                </div>
                <div className="h-[1px] w-full bg-neutral-500 mt-14" />
                <div className="mt-14 flex flex-row items-start justify-between">
                    <div className="flex flex-col items-start">
                        <p className="font-medium text-sm md:text-base">Entreprise</p>
                        <div className="flex flex-col md:flex-row justify-start gap-8 mt-4">
                            {menuItems.map((item, index) => {
                                return (
                                    <FooterLink
                                        key={index}
                                        href={item.href}
                                        content={item.name}
                                    />
                                );
                            })}
                        </div>
                        <p className="font-medium text-sm md:text-base mt-12">Contact</p>
                        <div className="flex flex-col justify-start gap-1 mt-4">
                            <div>
                                <Link href="tel:+32470428569">
                                    <P customClasses="text-font-gray hover:text-font-lighter-gray text-sm">
                                        {" "}
                                        +32 478 23 50 08
                                    </P>
                                </Link>
                            </div>
                            <div>
                                <P customClasses="text-font-gray text-sm">
                                    {" "}
                                    Avenue Prudent Bols, 43<br />
                                    B-1020 Bruxelles/Brussel
                                </P>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className="font-medium text-sm md:text-base">Rejoignez nos réseaux sociaux</p>
                        <Link
                            href={"#"}
                            className="inline-block mt-6"
                        >
                            <LinkedIn />
                        </Link>
                    </div>
                </div>
                <div className="h-[1px] w-full bg-neutral-500 mt-14" />
                <div className="mt-14 flex flex-col md:flex-row items-start gap-8 justify-between">
                    <p className="text-font-gray text-sm md:text-base">
                        Copyright © {new Date().getFullYear()} Macar
                    </p>
                    {/* <div className="flex flex-row items-center">
                        <Link href={"/termsandconditions"} className="inline-block mr-8">
                            <p className="text-font-gray text-sm md:text-base hover:text-font-lighter-gray transition-all ease-in-out-quad">
                                General Terms & Conditions
                            </p>
                        </Link>
                        <Link href={"/privacypolicy"} className="inline-block">
                            <p className="text-font-gray text-sm md:text-base hover:text-font-lighter-gray transition-all ease-in-out-quad">
                                Privacy Policy
                            </p>
                        </Link>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

const FooterLink = ({ href, content }: { href: string; content: string }) => {
    return (
        <Link href={href} className="inline-block">
            <p className="text-sm md:text-base hover:text-accent1 transition-all ease-in-out-quad">
                {content}
            </p>
        </Link>
    );
};

export const LinkedIn = () => {
    return (
        <svg
            width="29"
            height="30"
            viewBox="0 0 29 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M0 2.7012C0 1.57434 0.943395 0.659668 2.10633 0.659668H26.3937C27.5571 0.659668 28.5 1.57434 28.5 2.7012V27.1185C28.5 28.2457 27.5571 29.1597 26.3937 29.1597H2.10633C0.943506 29.1597 0 28.2458 0 27.1188V2.70087V2.7012Z"
                fill="#7C7D89"
            />
            <path
                d="M8.66067 24.5107V11.6799H4.39591V24.5107H8.66111H8.66067ZM6.52918 9.92839C8.01608 9.92839 8.94177 8.94314 8.94177 7.71185C8.91394 6.45251 8.01608 5.49475 6.55746 5.49475C5.09783 5.49475 4.14453 6.45251 4.14453 7.71174C4.14453 8.94303 5.06989 9.92828 6.50124 9.92828H6.52885L6.52918 9.92839ZM11.0213 24.5107H15.2857V17.3462C15.2857 16.9632 15.3135 16.5792 15.4262 16.3057C15.7343 15.5392 16.436 14.7458 17.6145 14.7458C19.1572 14.7458 19.7748 15.9223 19.7748 17.6473V24.5107H24.0391V17.1539C24.0391 13.213 21.9354 11.3791 19.1296 11.3791C16.8293 11.3791 15.819 12.6648 15.2576 13.5405H15.286V11.6804H11.0215C11.0772 12.884 11.0212 24.5112 11.0212 24.5112L11.0213 24.5107Z"
                fill="#020419"
            />
        </svg>
    );
};
