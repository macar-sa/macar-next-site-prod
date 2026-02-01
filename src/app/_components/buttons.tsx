import Link from "next/link";

export const NavLink = ({
    content = "Default Link",
    href = "",
    customClasses,
    onClick,
}: {
    content: string;
    href?: string;
    customClasses?: string;
    onClick?: () => void;
}) => {
    return (
        <Link
            href={href}
            {...(onClick != null ? { onClick } : {})}
            className="group h-full flex items-center justify-center"
        >
            <div
                className={`text-sm font-regular group-hover:text-accent1 transition-all ease-in-out-quad ${customClasses}`}
            >
                <p>{content}</p>
            </div>
        </Link>
    );
};

export const PrimaryButton = ({
    content = "Default Button",
    href = "",
    customClasses,
    onClick,
}: {
    content: string;
    href?: string;
    customClasses?: string;
    onClick?: () => void;
}) => {
    return (
        <Link className="" href={href} {...(onClick != null ? { onClick } : {})}>
            <div
                className={`group inline-block rounded-lg relative px-5 py-3 lg:px-6 lg:py-3 text-xs lg:text-sm bg-accent1 text-background font-regular ${customClasses}`}
            >
                <div className="rounded-lg absolute left-0 bottom-0 h-0 bg-neutral-200/10 w-full group-hover:h-full transition-all ease-in-out-quad"></div>
                <p className="relative z-20 font-medium">{content}</p>
            </div>
        </Link>
    );
};

export const SecondaryButton = ({
    content = "Default Button",
    href = "",
    customClasses,
    onClick,
}: {
    content: string;
    href?: string;
    customClasses?: string;
    onClick?: () => void;
}) => {
    return (
        <Link className="inline-block" href={href} {...(onClick != null ? { onClick } : {})}>
            <div
                className={`group rounded-lg relative px-5 py-3 lg:px-6 lg:py-3 text-xs lg:text-sm bg-white text-accent1 border border-accent1 font-regular hover:bg-accent1/90  hover:text-background w-full" ${customClasses}`}
                style={{
                    transition: "background-color 0.3s ease, color 0.3s ease", // Add this line for smooth transitions
                }}
            >
                <div className="rounded-lg absolute left-0 bottom-0 h-0 bg-accent1/10 w-full group-hover:h-full transition-all ease-in-out-quad"></div>
                <p className="relative z-20 font-medium">{content}</p>
            </div>
        </Link>
    );
};

