interface HeadingWithUnderlineProps {
  text: string;
  desktopSize?: string; // Default size on desktop
  mobileSize?: string; // Default size for mobile/tablet
}

export default function HeadingWithUnderline({
  text,
  desktopSize = "md:text-6xl",
  mobileSize = "text-4xl sm:text-3xl",
}: HeadingWithUnderlineProps) {
  return (
    <div className="relative h-auto">
      {/* Heading with underline */}
      <div className="text-center p-5 relative">
        {/* Heading Text */}
        <span
          className={`font-extrabold text-gray-800 dark:text-white leading-tight ${mobileSize} ${desktopSize}`}

        >
          {text}
        </span>

        {/* Static Responsive Underline */}
        {/* <div
          className="bg-gray-800 h-1 mx-auto mt-5 sm:mt-4 md:mt-6 w-3/4 md:w-1/2 lg:w-2/6"
        /> */}

      </div>
    </div>
  );
}
