import Image from "next/image";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";

export const LogoCarousel: React.FC = () => {
  // Assume we have the names of the files in the directory
  const filenames = [
    ["ag.png", "axa.png", "ethias.png", "homeras.png", "ip_assistance.png"],
  ];

  const filenames_mobile = [
    ["ag.png", "axa.png", "ethias.png"],
    ["homeras.png", "ip_assistance.png"],
  ];

  const logos = filenames
    .map((group) => {
      return [
        group.map((filename) => {
          return {
            src: `/companies/${filename}`,
            alt: filename.slice(0, -4),
          };
        }),
      ];
    })
    .flat();

  const logos_mobile = filenames_mobile
    .map((group) => {
      return [
        group.map((filename) => {
          return {
            src: `/companies/${filename}`,
            alt: filename.slice(0, -4),
          };
        }),
      ];
    })
    .flat();

  return (
    <div className="relative opacity-95">
      <Carousel
        autoPlay
        infiniteLoop
        showArrows={false}
        showStatus={false}
        showIndicators={false}
        showThumbs={false}
        transitionTime={6000}
        interval={8000}
        className="hidden md:inline"
      >
        {logos.map((slide, index) => {
          return (
            <div
              key={index}
              className="flex flex-row items-center w-3/4 px-0"
            >
              {slide.map((logo, index) => {
                return (
                  <div className="relative h-12 grow" key={index}>
                    <Image
                      key={index}
                      src={logo.src}
                      alt={logo.alt}
                      fill
                      className="object-contain"
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </Carousel>
      <Carousel
        autoPlay
        infiniteLoop
        showArrows={false}
        showStatus={false}
        showIndicators={false}
        showThumbs={false}
        transitionTime={6000}
        interval={8000}
        className="inline md:hidden "
      >
        {logos_mobile.map((slide, index) => {
          return (
            <div key={index} className="flex flex-row items-center gap-10 px-4">
              {slide.map((logo, index) => {
                return (
                  <div className="relative h-12 grow" key={index}>
                    <Image
                      key={index}
                      src={logo.src}
                      alt={logo.alt}
                      fill
                      className="object-contain"
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </Carousel>
      <div className="absolute inset-0" />
      <div className="absolute inset-0" />
    </div>
  );
};
