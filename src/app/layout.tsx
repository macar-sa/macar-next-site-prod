import localFont from "next/font/local";
import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from "./providers";
import { NavBar } from "./_components/navbar";
import { Footer } from "./_components/footer";
import CookieConsent from "./_components/CookieConsent";

const open_sans = Open_Sans({ subsets: ['latin'] })
const raptor = localFont({
  src: [
    {
      path: "../../public/fonts/raptor/Semibold.otf",
      weight: "600"
    }
  ],
  variable: "--font-raptor"
})

export const metadata: Metadata = {
  metadataBase: new URL("https://b3sr0nts-3000.euw.devtunnels.ms/"),
  title: "Macar - Construction, Assistance et Rénovation",
  description:
    "Votre partenaire de confiance pour vos projets de rénovations et constructions",
  openGraph: {
    title: "Macar - Construction, Assistance et Rénovation",
    description:
      "Votre partenaire de confiance pour vos projets de rénovations et constructions",
    url: "",
    siteName: "Macar",
    images: [
      {
        url: "/opengraph/OpengraphSmall.png",
        width: 800,
        height: 600,
      },
      {
        url: "/opengraph/OpengraphLarge.png",
        width: 1800,
        height: 1600,
      },
    ],
    locale: "fr_BE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${open_sans.className} text-text bg-background antialiased`}>
        <Providers>
          <NavBar />
          {children}
          <CookieConsent />
          <Footer />
        </Providers></body>
    </html >
  )
}
