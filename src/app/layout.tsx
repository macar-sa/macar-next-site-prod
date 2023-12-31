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
  metadataBase: new URL("https://www.macar.be/"),
  title: "Macar - Construction, Assistance, Rénovation",
  description:
    "Votre partenaire de confiance pour vos projets de rénovations et constructions",
  openGraph: {
    title: "Macar - Construction, Assistance, Rénovation",
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
    <html lang="fr">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/favicon/safari-pinned-tab.svg"
          color="#02041b"
        />
        <meta name="msapplication-TileColor" content="#00aba9" />
        <meta name="theme-color" content="#ffffff" />
      </head>
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
