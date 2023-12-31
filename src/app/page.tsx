"use client";
import Image from 'next/image'
import Screen from './_components/screen'
import { MainHeading, P, SecondHeading, ThirdHeading } from './_components/textStyles'
import { Card } from './_components/cards';
import { PrimaryButton, SecondaryButton } from './_components/buttons';
import { contact_form } from '@/components/contact_form';
import Link from "next/link";
import { CheckMark } from './_components/checkMark';
import { Trusted } from '@/components/trusted';
import { Logo_specific } from './_components/icons/logo copy';
import Statistics from '@/components/Statistics';
import { Button } from '@/components/ui/button';
import { Raptor } from './_components/textStyles';
import { Carousel } from 'react-responsive-carousel';
import { LogoCarousel } from './_components/logocarousel';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Screen name="landing page">
        <div className="lg:mt-16 grid lg:grid-cols-5 gap-8 text-left">
          <div className="col-span-3">
            <MainHeading>
              <h1 className="leading-tight">
                Votre Partenaire pour Toute Rénovation
              </h1>
            </MainHeading>
            <div className="mt-4">
              <Raptor><h5 className="mb-4 text-sm lg:text-base 2xl:text-lg">&nbsp;&nbsp;Ils nous ont fait confiance</h5></Raptor>
              <LogoCarousel></LogoCarousel>
              {/*<Trusted
                titleAlignment="text-left"
                imageAlignment="justify-start mt-1"
                headingSize="text-sm lg:text-base 2xl:text-lg max-w-prose"
                imageSize={{ height: 60, width: 120 }}
                imageClass="mx-1"
  />*/}
            </div>
          </div>
          <div className="col-span-2">
            <P customClasses='mt-6 mb-6' content="Depuis 2002, notre équipe dédiée excelle dans la rénovation, la plomberie, les installations électriques et la toiture." />
            <div className="flex space-x-4"> {/* Adjust the space-x-* value as needed */}
              <PrimaryButton href="/#contact" content="Commencez votre projet !" />
              <SecondaryButton href="/#services" content="Services" />
            </div>
          </div>
        </div>
        <div className="relative w-full mt-10 h-40 md:h-[400px]">
          <Image
            src="/landpage_pics/Construction Tool.webp"
            alt="Home Banner"
            layout="fill"
            objectFit="cover"
          />
        </div>
      </Screen>

      <Screen name="Stats">
        <Statistics />
      </Screen>

      <Screen name="Nos Services" id="services">
        <div className="md:flex md:items-start justify-between">
          <div className="md:flex-shrink-0 md:w-1/3">
            <SecondHeading>
              <h2>Nos Services</h2>
            </SecondHeading>
            <P customClasses="mt-4">
              <p className="leading-loose">Chez Macar, notre engagement envers nos clients est clair : nous croyons en la
                <span className="text-accent1"> confiance</span>, la
                <span className="text-accent1"> transparence</span>, et la
                <span className="text-accent1"> qualité </span>
                à chaque étape de notre travail.</p>
            </P>
            <div className="mt-10">
              <PrimaryButton
                content="Commencez votre projet !"
                href="/#contact" />
            </div>
          </div>
          <div className="md:w-2/3 md:pl-10 mt-10 md:mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card title="Rénovation intérieure et extérieure" description="Carrelage de salle de bain, isolation intérieure et extérieure, isolation de façade avec crépis, parquet flottant, abattement de murs porteurs.">
                <Image
                  src="/sevices/Renovation.png"
                  alt="Renovation."
                  width={100}
                  height={100} />
              </Card>
              <Card title="Plomberie" description="Installation de robinetterie, remplacement de chauffe-eau et chaudière, installation complète de chauffage central, débouchage de canalisations, réparation de fuites."
              >
                <Image
                  src="/sevices/Plomberie.png"
                  alt="Renovation."
                  width={100}
                  height={100} />
              </Card>
              <Card title="Installation Electrique" description="Mise aux normes de tableaux électriques, installation de prises de terre, pose de détecteurs de fumée, éclairage LED, câblage réseau."
              >
                <Image
                  src="/sevices/Installation Electrique.png"
                  alt="Renovation."
                  width={100}
                  height={100} />
              </Card>
              <Card
                title="Toiture"
                description="Remplacement de tuiles, construction de nouvelle toiture et charpente, étanchéité de toit-terrasse, isolation, pose de velux, construction/réparation/nettoyage/entretien de corniches et gouttières."
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

      <Screen name="Contact" id="contact">
        <div className='grid md:grid-cols-5 gap-8'>
          <div className='col-span-2'>
            <SecondHeading>
              <h2>Votre projet, notre mission!</h2>
            </SecondHeading>
            <P customClasses="mt-10">
              <p className="leading-loose">Macar est prêt à écouter et à mettre en action vos projets de rénovation. Remplissez ce formulaire et découvrez comment nous pouvons donner vie à vos idées avec efficacité et savoir-faire.</p>
            </P>
            <div className="flex flex-col items-start md:flex-row md:justify-start flex-wrap gap-6 mt-12">
              <CheckMark content="Réponse rapide" />
              <CheckMark content="Devis personnalisé" />
              <CheckMark content="Experts Engagés" />
              <CheckMark content="Transparence" />
              <CheckMark content="Qualité" />
            </div>
            <div className="flex flex-col md:flex-col items-start gap-6 mt-12">
              <div>
                <P customClasses="font-medium">Téléphone</P>
                <Link href="tel:+32478235008">
                  <P customClasses="text-font-gray hover:text-font-lighter-gray">
                    {" "}
                    +32 478 23 50 08
                  </P>
                </Link>
              </div>
              <div>
                <P customClasses="font-medium">Address</P>
                <P customClasses="text-font-gray">
                  {" "}
                  Avenue Prudent Bols, 43 <br />
                  B-1020 Bruxelles/Brussel
                </P>
              </div>
            </div>
          </div>

          <div className='col-span-3'>
            {contact_form()}
          </div>
        </div>
      </Screen>
    </main >
  )
}
