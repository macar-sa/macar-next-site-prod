// Headings use the Raptor font through the font-heading utility (variable set in layout.tsx).
export const Raptor = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return <div className="font-heading text-foreground">{children}</div>;
};

export const MainHeading = ({
    children,
    customClasses,
}: {
    children?: React.ReactNode;
    customClasses?: string;
}) => {
    return (
        <div
            className={`font-heading leading-loose lg:leading-none text-4xl lg:text-6xl 2xl:text-7xl max-w-[20ch] text-foreground ${customClasses}`}
        >
            {children}
        </div>
    );
};

export const SecondHeading = ({
    children,
    customClasses,
}: {
    children?: React.ReactNode;
    customClasses?: string;
}) => {
    return (
        <div
            className={`font-heading text-3xl max-w-[20ch] lg:text-5xl 2xl:text-6xl lg:max-w-[30ch] text-foreground ${customClasses}`}
        >
            {children}
        </div>
    );
};

export const ThirdHeading = ({
    children,
    customClasses,
}: {
    children?: React.ReactNode;
    customClasses?: string;
}) => {
    return (
        <div
            className={`font-heading text-base max-w-[20ch] lg:text-3xl 2xl:text-4xl lg:max-w-[30ch] text-foreground ${customClasses}`}
        >
            {children}
        </div>
    );
};

export const P = ({
    children,
    content,
    customClasses,
}: {
    children?: React.ReactNode;
    content?: string;
    customClasses?: string;
}) => {
    return (
        <div
            className={`text-sm lg:text-base 2xl:text-lg max-w-prose  ${customClasses}`}
        >
            <p className="leading-loose">{content}</p>
            {children}
        </div>
    );
};
