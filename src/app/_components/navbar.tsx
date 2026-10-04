"use client";
import { useState } from "react";
import Link from "next/link";
import { Button, Drawer, Separator } from "@heroui/react";
import { Menu } from "lucide-react";
import { ButtonLink, TextLink } from "./links";
import { Logo } from "./icons/logo";

const menuItems = [
    { name: "Accueil", href: "/" },
    { name: "Découvrez Macar", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Blog", href: "/blog" },
    { name: "FAQ", href: "/#faq" },
    { name: "Nous recrutons", href: "/job" },
];

// HeroUI v3 has no Navbar: the bar stays plain HTML, its content is v3. On mobile, an icon-only
// Button opens a Drawer from the left (Escape, the close button and the backdrop close it, focus
// stays inside, the page is locked behind); choosing a link closes it.
export const NavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav className="sticky top-0 z-100 flex w-full items-center justify-center bg-background border-b border-separator">
            <header className="flex items-center justify-between gap-4 w-full max-w-full md:max-w-[1600px] px-4 md:px-16 2xl:px-4 h-16">
                <Button
                    isIconOnly
                    variant="ghost"
                    aria-label="Ouvrir le menu"
                    className="md:hidden"
                    onPress={() => setIsMenuOpen(true)}
                >
                    <Menu />
                </Button>
                <Link href="/" className="md:hidden">
                    <Logo width={120} />
                </Link>

                <ul className="hidden md:flex items-center gap-6 text-sm">
                    <li>
                        <Link href="/">
                            <Logo customClasses="hidden lg:inline" />
                            <Logo width={120} customClasses="inline lg:hidden" />
                        </Link>
                    </li>
                    {menuItems.map((item) => (
                        <li key={item.href} className="whitespace-nowrap">
                            <TextLink href={item.href}>{item.name}</TextLink>
                        </li>
                    ))}
                </ul>
                <ButtonLink href="/#contact" className="hidden md:inline-flex">
                    Demander un devis
                </ButtonLink>
            </header>

            <Drawer.Backdrop isOpen={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <Drawer.Content placement="left">
                    <Drawer.Dialog>
                        <Drawer.CloseTrigger aria-label="Fermer le menu" />
                        <Drawer.Header>
                            <Drawer.Heading>Menu</Drawer.Heading>
                        </Drawer.Header>
                        <Drawer.Body>
                            <ul className="flex flex-col gap-4">
                                {menuItems.map((item) => (
                                    <li key={item.href}>
                                        <TextLink href={item.href} onClick={closeMenu}>
                                            {item.name}
                                        </TextLink>
                                    </li>
                                ))}
                            </ul>
                            <Separator className="my-6" />
                            <ButtonLink href="/#contact" fullWidth onClick={closeMenu}>
                                Demander un devis
                            </ButtonLink>
                        </Drawer.Body>
                    </Drawer.Dialog>
                </Drawer.Content>
            </Drawer.Backdrop>
        </nav>
    );
};
