"use client";

import { motion } from "framer-motion";

export default function Screen({
    children,
    isCentered = false,
    noPadding = false,
    id,
    customClassesOuter,
    customClassesInner,
    animate = true,
}: {
    children: React.ReactNode;
    name?: string;
    isCentered?: boolean;
    noPadding?: boolean;
    id?: string;
    customClassesInner?: string;
    customClassesOuter?: string;
    /** false on a page's first screen: rendered visible in the server HTML, no fade-in. */
    animate?: boolean;
}) {
    const innerClasses = `container mx-auto max-w-[1600px] px-4 md:px-16 2xl:px-4 overflow-x-visible overflow-y-visible ${isCentered ? "flex flex-col items-center" : ""
        } ${customClassesInner}`;
    // scroll-mt-16: a link to the section (/#services, /#contact…) stops below the sticky
    // navigation bar (h-16) instead of under it.
    return (
        <section
            className={`relative scroll-mt-16 ${noPadding ? "" : "pt-12 pb-4 md:pb-12"
                } overflow-x-clip overflow-y-visible ${customClassesOuter}`}
            id={id}
        >
            {animate ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className={innerClasses}
                >
                    {children}
                </motion.div>
            ) : (
                <div className={innerClasses}>{children}</div>
            )}
        </section>
    );
}
