"use client";

import { motion } from "framer-motion";

export default function Screen({
    children,
    name,
    isCentered = false,
    noPadding = false,
    id,
    customClassesOuter,
    customClassesInner,
}: {
    children: React.ReactNode;
    name?: string;
    isCentered?: boolean;
    noPadding?: boolean;
    id?: string;
    customClassesInner?: string;
    customClassesOuter?: string;
}) {
    return (
        <section
            className={`relative ${noPadding ? "" : "pt-12 pb-4 md:pb-12"
                } overflow-x-clip overflow-y-visible ${customClassesOuter}`}
            id={id}
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={`container mx-auto max-w-[1600px] px-4 md:px-16 2xl:px-4 overflow-x-visible overflow-y-visible ${isCentered ? "flex flex-col items-center" : ""
                    } ${customClassesInner}`}
            >
                {children}
            </motion.div>
        </section>
    );
}
