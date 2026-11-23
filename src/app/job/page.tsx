import Screen from '../_components/screen'
import { pageOpenGraph } from "@/lib/seo/openGraph";
import { Jobs, jobDesc } from '@/components/jobs';
import { LOCAL_BUSINESS_ID } from '@/lib/seo/localBusiness';
import { Breadcrumbs } from '../_components/jsonld';
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Carrières & recrutement : Macar recrute à Bruxelles',
    description: 'Macar recrute. Découvrez nos offres en rénovation, plomberie, électricité et toiture à Bruxelles.',
    alternates: { canonical: '/job' },
    openGraph: pageOpenGraph({ title: 'Carrières & recrutement : Macar recrute à Bruxelles', description: 'Macar recrute. Découvrez nos offres en rénovation, plomberie, électricité et toiture à Bruxelles.', path: '/job' }),
}

// Raise both dates while the offer stays open (Google drops a JobPosting past validThrough).
const JOB_DATE_POSTED = "2026-11-23";
const JOB_VALID_THROUGH = "2027-05-23";

const jobPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: jobDesc.title,
    description: `<p>${jobDesc.presentation}</p><ul>${jobDesc.responsabilites.map((r) => `<li>${r}</li>`).join("")}</ul>`,
    datePosted: JOB_DATE_POSTED,
    validThrough: JOB_VALID_THROUGH,
    employmentType: "CONTRACTOR",
    hiringOrganization: { "@type": "Organization", "@id": LOCAL_BUSINESS_ID, name: "Macar" },
    jobLocation: {
        "@type": "Place",
        address: {
            "@type": "PostalAddress",
            streetAddress: "Avenue Prudent Bols, 43",
            addressLocality: "Bruxelles",
            postalCode: "1020",
            addressCountry: "BE",
        },
    },
}

export default function job() {
    return (
        <main className="flex min-h-screen flex-col">
            <Breadcrumbs
                items={[
                    { name: 'Accueil', url: 'https://www.macar.be/' },
                    { name: 'Carrières', url: 'https://www.macar.be/job' },
                ]}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
            />
            <Screen name="Job">
                <Jobs />
            </Screen>
        </main>
    )
}