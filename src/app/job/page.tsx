import Screen from '../_components/screen'
import { Jobs } from '@/components/jobs';
import { Breadcrumbs } from '../_components/jsonld';
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Carrières & recrutement — Macar recrute à Bruxelles',
    description: 'Macar recrute. Découvrez nos offres en rénovation, plomberie, électricité et toiture à Bruxelles.',
    alternates: { canonical: '/job' },
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
            <Screen name="Job">
                <Jobs />
            </Screen>
        </main>
    )
}