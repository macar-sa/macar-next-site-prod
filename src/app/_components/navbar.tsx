"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { FocusScope, usePreventScroll, useToggleButton } from "react-aria";
import { Menu, X } from "lucide-react";
import { NavLink, PrimaryButton } from "./buttons";
import { Logo } from "./icons/logo";

const menuItems = [
    { name: "Accueil", href: "/" },
    { name: "Découvrez Macar", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Blog", href: "/blog" },
    { name: "FAQ", href: "/#faq" },
    { name: "Nous recrutons", href: "/job" },
];

// After closing, the panel stays on screen this long, then disappears at once, like the v2 menu:
// its 0.25 s exit animation was hidden by the min-height and started one frame after the click
// (v2 recordings: removed 275 to 284 ms after the click).
const MENU_EXIT_MS = 265;

export const NavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isPanelMounted, setIsPanelMounted] = useState(false);
    const navRef = useRef<HTMLElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);

    if (isMenuOpen && !isPanelMounted) setIsPanelMounted(true);

    useEffect(() => {
        if (isMenuOpen || !isPanelMounted) return;
        const timer = window.setTimeout(() => setIsPanelMounted(false), MENU_EXIT_MS);
        return () => window.clearTimeout(timer);
    }, [isMenuOpen, isPanelMounted]);

    usePreventScroll({ isDisabled: !isMenuOpen });

    // Same rule as the v2 navbar: any width change of the bar closes the menu, except the
    // change caused by the scroll bar appearing or disappearing.
    useEffect(() => {
        const nav = navRef.current;
        if (!nav) return;
        let prevWidth = nav.offsetWidth;
        const observer = new ResizeObserver(() => {
            const currentWidth = nav.offsetWidth;
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            if (currentWidth && currentWidth + scrollbarWidth === prevWidth) return;
            if (currentWidth !== prevWidth) {
                prevWidth = currentWidth;
                setIsMenuOpen(false);
            }
        });
        observer.observe(nav);
        return () => observer.disconnect();
    }, []);

    const label = isMenuOpen ? "Fermer le menu" : "Ouvrir le menu";
    const { buttonProps } = useToggleButton(
        { "aria-label": label },
        {
            isSelected: isMenuOpen,
            defaultSelected: false,
            setSelected: setIsMenuOpen,
            toggle: () => setIsMenuOpen(!isMenuOpen),
        },
        toggleRef,
    );
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav
            ref={navRef}
            className="sticky top-0 z-100 flex w-full min-h-0 items-center justify-center bg-background border-b border-[hsl(var(--v2-default-200)/0.5)]"
        >
            <header className="relative flex flex-row flex-nowrap items-center justify-between gap-4 w-full max-w-full md:max-w-[1600px] px-4 md:px-16 2xl:px-4 h-16">
                <ul className="flex flex-row items-center gap-4 h-full md:hidden">
                    <li className="flex h-full">
                        <button
                            {...buttonProps}
                            ref={toggleRef}
                            className="flex items-center justify-center h-full"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </li>
                </ul>

                <ul className="flex flex-row items-center gap-4 h-full md:hidden">
                    <li className="flex flex-row justify-start items-center whitespace-nowrap">
                        <Link href="/" onClick={closeMenu}>
                            <Logo iconOnly={false} width={120} />
                        </Link>
                    </li>
                </ul>

                <ul className="hidden md:flex flex-row items-center gap-6 h-full">
                    <li className="flex flex-row justify-start items-center whitespace-nowrap">
                        <Link href="/">
                            <Logo iconOnly={false} customClasses="hidden lg:inline" />
                            <Logo iconOnly={false} width={120} customClasses="inline lg:hidden" />
                        </Link>
                    </li>
                    {menuItems.map((item) => (
                        <li key={item.href} className="items-center whitespace-nowrap">
                            <NavLink href={item.href} content={item.name} />
                        </li>
                    ))}
                </ul>

                <ul className="hidden md:flex flex-row items-center gap-4 h-full">
                    <li className="whitespace-nowrap">
                        <PrimaryButton href="/#contact" content="Demander un devis" />
                    </li>
                </ul>
            </header>

            {isPanelMounted &&
                createPortal(
                    <div className="fixed top-16 right-0 bottom-0 left-0 z-9999 bg-background animate-navbar-backdrop-in">
                        <FocusScope restoreFocus>
                            <ul className="fixed top-16 right-0 bottom-0 left-0 z-9999 flex flex-col gap-1 w-full max-w-full h-[calc(100vh-4rem)] min-h-[calc(100dvh-4rem)] overflow-y-auto pt-4 pb-6 px-4 bg-background border-b border-[hsl(var(--v2-default-200)/0.5)] shadow-lg animate-navbar-menu-in">
                                {menuItems.map((item) => (
                                    <li key={item.href} className="min-h-[44px] py-0 rounded-lg">
                                        <Link
                                            className="flex items-center w-full min-h-[44px] px-4 text-base text-foreground hover:text-accent1 active:bg-default-100 rounded-lg transition-colors"
                                            href={item.href}
                                            onClick={closeMenu}
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                                <li className="min-h-[44px] py-0 rounded-lg pt-2 mt-2 border-t border-default-200">
                                    <Link
                                        className="flex items-center justify-center w-full min-h-[44px] px-4 rounded-lg bg-accent1 text-background font-medium text-base active:opacity-90"
                                        href="/#contact"
                                        onClick={closeMenu}
                                    >
                                        Demander un devis
                                    </Link>
                                </li>
                            </ul>
                        </FocusScope>
                    </div>,
                    document.body,
                )}
        </nav>
    );
};
