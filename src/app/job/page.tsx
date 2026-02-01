import Screen from '../_components/screen'
import { Jobs } from '@/components/jobs';
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Carrières & recrutement — Macar recrute à Bruxelles',
    description: 'Macar recrute. Découvrez nos offres en rénovation, plomberie, électricité et toiture à Bruxelles.',
}

export default function job() {
    return (
        <main className="flex min-h-screen flex-col">
            <Screen name="Job">
                <Jobs />
            </Screen>
        </main>
    )
}