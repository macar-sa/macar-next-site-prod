"use client";
import Screen from '../_components/screen'
import { Jobs } from '@/components/jobs';

export default function job() {
    return (
        <main className="flex min-h-screen flex-col">
            <Screen name="Job">
                <Jobs>
                </Jobs>
            </Screen>
        </main>
    )
}