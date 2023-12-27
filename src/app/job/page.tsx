"use client";
import Image from 'next/image'
import Screen from '../_components/screen'
import { MainHeading, P, SecondHeading } from '../_components/textStyles'
import { Card } from '../_components/cards';
import { PrimaryButton } from '../_components/buttons';
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