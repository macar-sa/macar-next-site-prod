"use client";
import { useState } from "react";
import { NavLink, PrimaryButton } from "./buttons";
import { Logo } from "./icons/logo";
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
} from "@heroui/react";
import Link from "next/link";

const MenuIcon = ({ open }: { open: boolean }) => (
    <svg
        aria-hidden
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        {open ? (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
            />
        ) : (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
            />
        )}
    </svg>
);

const menuItems = [
    { name: "Accueil", href: "/#", type: "item" },
    { name: "Découvrez Macar", href: "/about", type: "item" },
    { name: "Services", href: "/#services", type: "item" },
    { name: "Nous recrutons", href: "/job", type: "item" },
];

export const NavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `.macar-navbar-menu{width:100%!important;max-width:100%!important;min-width:100%!important;left:0!important;right:0!important;box-sizing:border-box!important;background:#F6F8FF!important;background-color:#F6F8FF!important}body>div:has(>.macar-navbar-menu){width:100%!important;max-width:100%!important;left:0!important;right:0!important;background:#F6F8FF!important;background-color:#F6F8FF!important;min-height:100vh!important}` }} />
            <Navbar
                height="6rem"
                maxWidth="full"
                classNames={{
                    wrapper: "w-full max-w-full md:max-w-[1600px] px-4 md:px-16 2xl:px-4 !h-16 min-h-16",
                    base: "sticky top-0 z-[100] !min-h-0 !bg-background/70",
                    menu: "z-[100] !bg-background !bg-opacity-100 border-b border-bordercard !w-full !max-w-full !min-w-full !left-0 !right-0",
                }}
                isMenuOpen={isMenuOpen}
                onMenuOpenChange={setIsMenuOpen}
            >
                <NavbarContent justify="start" className="items-center gap-6">
                    <button
                        type="button"
                        className="md:hidden w-10 h-10 min-w-10 min-h-10 p-0 flex items-center justify-center rounded-lg hover:opacity-80 transition-opacity text-foreground"
                        onClick={() => setIsMenuOpen((v) => !v)}
                        aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                        aria-expanded={isMenuOpen}
                    >
                        <MenuIcon open={isMenuOpen} />
                    </button>
                    <NavbarBrand className="">
                        <Link href="/">
                            <Logo iconOnly={false} customClasses="hidden lg:inline" />
                            <Logo
                                iconOnly={false}
                                width={120}
                                customClasses="inline lg:hidden"
                            />
                        </Link>
                    </NavbarBrand>
                    {menuItems.map((item, index) => (
                        <NavbarItem key={index} className="hidden md:flex items-center">
                            <NavLink href={`${item.href}`} content={item.name} />
                        </NavbarItem>
                    ))}
                </NavbarContent>
                <NavbarContent justify="end" className="items-center">
                    <NavbarItem>
                        <PrimaryButton content="Contactez-nous !" href="/#contact" />
                    </NavbarItem>
                </NavbarContent>
                <NavbarMenu className="macar-navbar-menu !bg-background !bg-opacity-100 border-b border-bordercard !w-full !max-w-full !min-w-full">
                    {menuItems.map((item, index) => (
                        <NavbarMenuItem key={`${item.name}-${index}`}>
                            <Link
                                className="w-full text-sm font-regular text-foreground hover:text-accent1 transition-all ease-in-out-quad py-3"
                                href={item.href}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        </NavbarMenuItem>
                    ))}
                </NavbarMenu>
            </Navbar>
        </>
    );
};
