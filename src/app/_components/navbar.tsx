"use client";
import { useState, useEffect, useRef } from "react";
import { NavLink, PrimaryButton } from "./buttons";
import { Logo } from "./icons/logo";
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuToggle,
    NavbarMenuItem,
} from "@heroui/react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const menuItems = [
    { name: "Accueil", href: "/#", type: "item" },
    { name: "Découvrez Macar", href: "/about", type: "item" },
    { name: "Services", href: "/#services", type: "item" },
    { name: "Nous recrutons", href: "/job", type: "item" },
];

const MENU_PORTAL_Z_INDEX = 9999;
const NAVBAR_HEIGHT = "4rem";
const PAGE_BG = "#F6F8FF";

const navbarMenuStyles = `
#navbar-menu-portal {
  transition: background-color 0.25s ease;
}
#navbar-menu-portal > * {
  animation: navbar-menu-in 0.25s ease-out;
}
@keyframes navbar-menu-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

export const NavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuPortalEl, setMenuPortalEl] = useState<HTMLDivElement | null>(null);
    const portalCreated = useRef(false);

    useEffect(() => {
        if (portalCreated.current || typeof document === "undefined") return;
        const div = document.createElement("div");
        div.id = "navbar-menu-portal";
        div.style.cssText = `position:fixed;top:${NAVBAR_HEIGHT};left:0;right:0;bottom:0;z-index:${MENU_PORTAL_Z_INDEX};pointer-events:none;`;
        document.body.appendChild(div);
        setMenuPortalEl(div);
        portalCreated.current = true;
        return () => {
            if (div.parentNode) div.parentNode.removeChild(div);
            portalCreated.current = false;
        };
    }, []);

    useEffect(() => {
        if (!menuPortalEl) return;
        menuPortalEl.style.pointerEvents = isMenuOpen ? "auto" : "none";
        menuPortalEl.style.backgroundColor = isMenuOpen ? PAGE_BG : "transparent";
    }, [isMenuOpen, menuPortalEl]);

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: navbarMenuStyles }} />
        <Navbar
            height="4rem"
            maxWidth="full"
            classNames={{
                base: "sticky top-0 z-[100] min-h-0 bg-background border-b border-default-200/50",
                wrapper: "w-full max-w-full md:max-w-[1600px] px-4 md:px-16 2xl:px-4 h-16 min-h-16",
                toggle: "[&_span]:!hidden",
                menu: "!fixed !top-16 !left-0 !right-0 !w-full min-h-[calc(100dvh-4rem)] !z-[9999] pt-4 pb-6 px-4 bg-background border-b border-default-200/50 shadow-lg pointer-events-auto",
                menuItem: "min-h-[44px] py-0 data-[active=true]:bg-default-100 rounded-lg",
            }}
            isMenuOpen={isMenuOpen}
            onMenuOpenChange={setIsMenuOpen}
            isBlurred={false}
        >
            <NavbarContent className="md:hidden" justify="start">
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                    srOnlyText={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                    icon={(isOpen) => (isOpen ? <X size={24} /> : <Menu size={24} />)}
                />
            </NavbarContent>

            <NavbarContent className="md:hidden" justify="center">
                <NavbarBrand>
                    <Link href="/" onClick={() => setIsMenuOpen(false)}>
                        <Logo iconOnly={false} width={120} />
                    </Link>
                </NavbarBrand>
            </NavbarContent>

            <NavbarContent className="hidden md:flex items-center gap-6" justify="start">
                <NavbarBrand>
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
                    <NavbarItem key={index} className="items-center">
                        <NavLink href={item.href} content={item.name} />
                    </NavbarItem>
                ))}
            </NavbarContent>

            <NavbarContent justify="end" className="hidden md:flex items-center">
            </NavbarContent>

            <NavbarMenu className="gap-1" portalContainer={menuPortalEl ?? undefined}>
                {menuItems.map((item, index) => (
                    <NavbarMenuItem key={`${item.name}-${index}`}>
                        <Link
                            className="flex items-center w-full min-h-[44px] px-4 text-base font-regular text-foreground hover:text-accent1 active:bg-default-100 rounded-lg transition-colors"
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {item.name}
                        </Link>
                    </NavbarMenuItem>
                ))}
                <NavbarMenuItem className="pt-2 mt-2 border-t border-default-200">
                    <Link
                        className="flex items-center justify-center w-full min-h-[44px] px-4 rounded-lg bg-accent1 text-background font-medium text-base active:opacity-90"
                        href="/#contact"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Contactez-nous !
                    </Link>
                </NavbarMenuItem>
            </NavbarMenu>
        </Navbar>
        </>
    );
};
