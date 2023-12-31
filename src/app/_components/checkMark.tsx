export const CheckMark = ({ content }: { content: string }) => {
  return (
    <div className="inline-block">
      <div className="md:text-sm flex flex-row items-center border-b-1 border-card-border gap-3 px-2 py-1 ">
        <Icon />
        <p className="">{content}</p>
      </div>
    </div>
  );
};

const Icon = ({ width = 18 }: { width?: number }) => {
  return (
    <svg
      width={width}
      height="18"
      viewBox="0 0 19 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="9.00391" cy="9" r="9" fill="url(#paint0_linear_292_103)" />
      <line
        x1="5.35746"
        y1="7.64645"
        x2="8.35746"
        y2="10.6464"
        stroke="white"
      />
      <path d="M12.543 6.54614L8.00387 11.0067" stroke="white" />
      <defs>
        <linearGradient
          id="paint0_linear_292_103"
          x1="9.00391"
          y1="1.5"
          x2="16.4667"
          y2="13.2671"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#124FAA" />
          <stop offset="1" stopColor="#124FAA" />
        </linearGradient>
      </defs>
    </svg>
  );
};
