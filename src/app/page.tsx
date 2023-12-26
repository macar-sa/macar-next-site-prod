"use client";
import Image from 'next/image'
import Screen from './_components/screen'
import { MainHeading, P, SecondHeading } from './_components/textStyles'
import { Card } from './_components/cards';
import { PrimaryButton } from './_components/buttons';
import { contact_form } from '@/components/contact_form';

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
          <P customClasses='col-span-2' content="Chez Macar, nous combinons expertise et passion pour transformer vos espaces. Depuis 2002, notre équipe dédiée excelle dans la rénovation, la plomberie, les installations électriques et la toiture. Nous offrons des solutions personnalisées, alliant qualité et fonctionnalité, pour répondre à tous vos besoins." />
        </div>
        <div className="relative w-full mt-10 h-40 md:h-[400px]">
          <Image
            src="/landpage_pics/Construction Tool.jpg"
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
            <P customClasses="mt-4">
              Chez Macar, notre engagement envers nos clients est clair : nous croyons en la
              <span className="text-accent1"> confiance</span>,
              <span className="text-accent1"> transparence</span>, et la
              <span className="text-accent1"> qualité </span>
              à chaque étape de notre travail.
            </P>
            <div className="mt-10">
              <PrimaryButton
                content="Contactez nous"
                href="/#contact-form" />
            </div>
          </div>
          <div className="md:w-2/3 md:pl-10 mt-10 md:mt-0">
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

      <Screen name="Contact">
        <div id="contact-form">
          {contact_form()}
        </div>
      </Screen>

    </main >
  )
}
