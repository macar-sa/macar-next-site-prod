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
    onClick?: any;
}) => {
    return (
        <Link
            href={href}
            onClick={onClick}
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
    onClick = () => { },
}: {
    content: string;
    href?: string;
    customClasses?: string;
    onClick?: any;
}) => {
    return (
        <Link className="display: inline-block" onClick={onClick} href={href}>
            <div
                className={`group rounded-full relative px-5 py-3 lg:px-6 lg:py-3 text-xs lg:text-sm bg-accent1 text-background font-regular ${customClasses}`}
            >
                <div className="rounded-full absolute left-0 bottom-0 h-0 bg-neutral-200/10 w-full group-hover:h-full transition-all ease-in-out-quad"></div>
                <p className="relative z-20 font-medium">{content}</p>
            </div>
        </Link>
    );
};