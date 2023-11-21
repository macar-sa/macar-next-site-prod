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
} from "@nextui-org/react";
import Link from "next/link";

export const NavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuKey = isMenuOpen ? "open" : "closed";
    const menuItems = [
        { name: "Acceuil", href: "/#services", type: "item" },
        { name: "A propos de nous", href: "/#apropos", type: "item" },
        {
            name: "Services",
            href: "/#services",
            type: "item",
        },
    ];
    return (
        <Navbar
            classNames={{
                wrapper: "max-w-[1600px] px-4 md:px-16 2xl:px-4",
                base: "",
            }}
            onMenuOpenChange={setIsMenuOpen}
            isMenuOpen={isMenuOpen}
        >
            <NavbarContent>
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
                {menuItems.map((item, index) => {
                    return (
                        <NavbarItem
                            className="mr-4 hidden md:flex h-full items-center justify-center"
                            key={index}
                        >
                            <NavLink href={`${item.href}`} content={item.name} />
                        </NavbarItem>)
                })}
            </NavbarContent>
            <NavbarContent justify="end">
                <NavbarItem>
                    <PrimaryButton content="Contactez-nous" href="#" />
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
