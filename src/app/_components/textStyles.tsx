import localFont from "next/font/local";

const raptor = localFont({
    src: [
        {
            path: "../../../public/fonts/raptor/Semibold.otf",
            weight: "600"
        }
    ],
    variable: "--font-raptor"
})

export const MainHeading = ({
    children,
    customClasses,
}: {
    children?: React.ReactNode;
    customClasses?: string;
}) => {
    return (
        <div
            className={`${raptor.className} leading-loose text-4xl lg:text-6xl 2xl:text-7xl max-w-[20ch] text-headings ${customClasses}`}
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
            className={`${raptor.className} text-3xl max-w-[20ch] lg:text-5xl 2xl:text-6xl lg:max-w-[30ch] text-headings ${customClasses}`}
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
            className={`${raptor.className} text-2xl max-w-[20ch] lg:text-3xl 2xl:text-4xl lg:max-w-[30ch] text-headings ${customClasses}`}
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
