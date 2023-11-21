"use client";
import Image from 'next/image'
import Screen from './_components/screen'
import { MainHeading } from './_components/textStyles'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Screen name="landing page">
        <MainHeading>
          <h1>
            Votre partenaire pour tout type de rénovation
          </h1>
        </MainHeading>
        Ceci est un test zeubi
      </Screen>
      ceci est un test
    </main>
  )
}
