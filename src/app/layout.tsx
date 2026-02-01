import localFont from "next/font/local";
import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from "./providers";
import { NavBar } from "./_components/navbar";
import { Footer } from "./_components/footer";
import CookieConsent from "./_components/CookieConsent";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react"

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

const defaultTitle = "Macar — Rénovation & construction à Bruxelles";
const defaultDescription = "Macar est une entreprise de rénovation, plomberie, électricité et toiture basée à Bruxelles (Belgique), active depuis 2002. Devis et accompagnement pour vos projets.";

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness"],
  "@id": "https://www.macar.be/#localbusiness",
  name: "Macar",
  description: "Macar est une entreprise de rénovation, plomberie, installations électriques et toiture basée à Bruxelles (Belgique), active depuis 2002.",
  url: "https://www.macar.be",
  telephone: "+32478235008",
  email: "info@macar.be",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Avenue Prudent Bols, 43",
    addressLocality: "Bruxelles",
    postalCode: "B-1020",
    addressCountry: "BE",
  },
  foundingDate: "2002",
  areaServed: "Bruxelles, Belgique",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.macar.be/"),
  title: defaultTitle,
  description: defaultDescription,
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
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

const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS?.trim();

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />

        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              async
              strategy="afterInteractive"
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
          if (window.location.hostname !== 'localhost') {
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          }
        `,
              }}
            />
          </>
        )}

      </head>
      <body className={`${open_sans.className} text-text bg-background antialiased`}>
        <Providers>
          <NavBar />
          {children}
          <CookieConsent />
          <Footer />
          <Analytics />
        </Providers></body>
    </html >
  )
}
