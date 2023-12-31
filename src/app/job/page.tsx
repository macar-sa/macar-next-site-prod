import Screen from '../_components/screen'
import { Jobs } from '@/components/jobs';
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Emploi',
    description: 'Nous Recrutons',
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