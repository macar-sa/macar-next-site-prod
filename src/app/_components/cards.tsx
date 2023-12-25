import { useRef, useState } from "react";
import { P } from "./textStyles";
import { motion } from "framer-motion";

export const Card = ({
    children,
    title = "Default Title",
    description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis dictum dui a lectus sollicitudin, sed interdum mi tincidunt. Nunc eu ultrices urna.",
    customClasses = "",
    effectOpacity = 30,
}: {
    children?: React.ReactNode;
    title?: string;
    description?: string;
    customClasses?: string;
    effectOpacity?: number;
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        const { left, top } = cardRef.current?.getBoundingClientRect() || {
            left: 0,
            top: 0,
        };
        setX(event.clientX - left - 160);
        setY(event.clientY - top - 160);
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => {
                setOpacity(effectOpacity);
            }}
            onMouseLeave={() => {
                setOpacity(0);
            }}
            className={`z-20 relative overflow-clip px-5 py-6 border border-card-border bg-cardbackground backdrop-blur-lg transition-all duration-300 hover:border-font-gray ${customClasses}`}
        >
            {children && (
                <div className="relative z-10 w-12 h-12  md:w-12 md:h-12 flex flex-col items-start justify-center">
                    {children}
                </div>
            )}
            <h4
                style={{ fontFamily: 'var(--font-raptor)', fontWeight: 600 }}
                className={`text-sm lg:text-base 2xl:text-lg relative z-10 ${children ? "mt-8" : ""}`}
            >
                {title}
            </h4>
            <P
                content={description}
                customClasses="text-font-gray mt-3 relative z-10"
            />
            <motion.div
                style={{ x: x, y: y }}
                transition={{ duration: 10, type: "inertia", stiffness: 500 }}
                className={`h-96 w-96 bg-neutral-50/5 absolute top-0 left-0 rounded-full blur-2xl opacity-${opacity} transition-opacity duration-300 ease-in-out`}
            />
        </div>
    );
};
