"use client";
import { I18nProvider, RouterProvider } from "@heroui/react";
import { useRouter } from "next/navigation";

// React Aria locale for the HeroUI v3 components. Fixed on purpose: reading the
// request headers here would make every route dynamic.
// RouterProvider: the React Aria links inside HeroUI components (the Breadcrumbs items) navigate
// with the Next.js router, without a full page reload.
export function Providers({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    return (
        <RouterProvider navigate={(href) => router.push(href)}>
            <I18nProvider locale="fr-BE">{children}</I18nProvider>
        </RouterProvider>
    );
}
