"use client";
import { I18nProvider } from "@heroui/react";

// React Aria locale for the HeroUI v3 components. Fixed on purpose: reading the
// request headers here would make every route dynamic.
export function Providers({ children }: { children: React.ReactNode }) {
    return <I18nProvider locale="fr-BE">{children}</I18nProvider>;
}
