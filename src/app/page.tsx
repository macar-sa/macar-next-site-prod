"use client";
import Image from 'next/image'
import Screen from './_components/screen'
import { MainHeading, P, SecondHeading } from './_components/textStyles'
import { Card } from './_components/cards';
import { NavLink, PrimaryButton } from "/src/app/_components/buttons.tsx";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Screen name="landing page">
        <div className="lg:mt-20 grid lg:grid-cols-5 gap-8">
          <MainHeading customClasses='col-span-3'>
            <h1 className="leading-tight">
              Votre Partenaire pour Toute Rénovation
            </h1>
          </MainHeading>
          <P customClasses='col-span-2' content="Depuis 2002, nous nous engageons à redonner vie à vos espaces. Que vous recherchiez une rénovation complète, des services de plomberie, d'installations électriques ou de toiture de qualité, nous sommes là pour vous. Notre équipe expérimentée apporte une expertise inégalée à chaque projet, qu'il s'agisse de votre résidence privée ou de vos locaux professionnels." />
        </div>
        <div className="relative w-full mt-10" style={{ height: '400px' }}>
          <Image
            src="/landpage_pics/home_banner.webp"
            alt="Home Banner"
            layout="fill"
            objectFit="cover"
          />
        </div>
      </Screen>
      <Screen name="Services">
        <div className="md:flex md:items-start justify-between">
          <div className="md:flex-shrink-0 md:w-1/3">
            <SecondHeading>
              <h2>Services</h2>
            </SecondHeading>
            <P customClasses="mt-4" content="Chez Macar, notre engagement envers nos clients est clair : nous croyons en la confiance,
                la transparence et la qualité à chaque étape de notre travail." />
            <div className="mt-10">
              <PrimaryButton
                content="Contactez nous"
                href="#" />
            </div>
          </div>
          <div className="md:w-2/3 md:pl-10 mt-10 md:mt-0"> {/* Add left padding and adjust top margin on medium screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card title="Rénovation" description="Que ce soit une rénovation complète de votre maison ou une mise à jour partielle de votre espace, nous sommes prêts à donner vie à votre projet, du début à la fin.">
                <Image
                  src="/sevices/Renovation.png"
                  alt="Renovation."
                  width={100}
                  height={100} />
              </Card>
              <Card title="Plomberie" description="Nos professionnels de la plomberie sont là pour résoudre tous vos problèmes de plomberie, qu'il s'agisse de réparations, d'installations ou de rénovations."
              >
                <Image
                  src="/sevices/Plomberie.png"
                  alt="Renovation."
                  width={100}
                  height={100} />
              </Card>
              <Card title="Installation électrique" description="La sécurité électrique est essentielle. Faites confiance à notre équipe qualifiée pour des installations électriques fiables et conformes à toutes les normes."
              >
                <Image
                  src="/sevices/Installation Electrique.png"
                  alt="Renovation."
                  width={100}
                  height={100} />
              </Card>
              <Card
                title="Toiture"
                description="Protégez votre maison avec des services de toiture de qualité. Nous offrons des solutions de toiture, de réparation et d'entretien pour garantir la durabilité de votre toit."
              >
                <Image
                  src="/sevices/Toiture.png"
                  alt="Renovation."
                  width={100}
                  height={100} />
              </Card>
            </div>
          </div>
        </div>
      </Screen>
    </main >
  )
}
