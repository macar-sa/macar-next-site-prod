"use client";
import { useState } from "react";
import { NavLink, PrimaryButton } from "./buttons";
import { Logo } from "./icons/logo";
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenuToggle,
    NavbarMenu,
    NavbarMenuItem,
} from "@heroui/react";
import Link from "next/link";
import { Logo_specific } from "./icons/logo copy";

export const NavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuKey = isMenuOpen ? "open" : "closed";
    const menuItems = [
        { name: "Accueil", href: "/#", type: "item" },
        { name: "Découvrez Macar", href: "/about", type: "item" },
        { name: "Services", href: "/#services", type: "item" },
        {
            name: "Nous recrutons",
            href: "/job",
            type: "item",
        },
    ];
    return (
        <Navbar
            height="6rem"
            classNames={{
                wrapper: "max-w-[1600px] px-4 md:px-16 2xl:px-4 !h-16 min-h-16",
                base: "z-50 !min-h-0 !bg-background/70",
            }}
            onMenuOpenChange={setIsMenuOpen}
            isMenuOpen={isMenuOpen}
        >
            <NavbarContent justify="start" className="items-center gap-6">
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    className="md:hidden"
                />
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
            <NavbarMenu>
                {menuItems.map((item, index) => (
                    <NavbarMenuItem key={`${item}-${index}`}>
                        <NavLink
                            href={`${item.href}`}
                            content={item.name}
                            customClasses="my-4 text-regular"
                            onClick={() => {
                                setIsMenuOpen(false);
                            }}
                        />
                    </NavbarMenuItem>
                ))}
            </NavbarMenu>
        </Navbar>
    );
};
