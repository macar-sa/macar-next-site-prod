"use client";
import Image from 'next/image'
import Screen from '../_components/screen'
import { MainHeading, P, SecondHeading, ThirdHeading } from '../_components/textStyles'
import { Card } from '../_components/cards';
import { PrimaryButton } from '../_components/buttons';
import { Jobs } from '@/components/jobs';
import aboutbanner from '/src/app/about/about_banner.webp';
import { Heading } from 'lucide-react';
import { Trusted } from '@/components/trusted';

export default function about() {
    return (
        <main className="flex min-h-screen flex-col">
            <Screen name="about">
                <div className="lg:mt-16 grid lg:grid-cols-5 gap-8 text-left">
                    <div className="col-span-3">
                        <MainHeading>
                            <h1 className="leading-tight">
                                Découvrez Macar
                            </h1>
                        </MainHeading>
                    </div>
                    <div className="col-span-2">
                        <P customClasses='mt-6 mb-6' content="Situés au cœur de Bruxelles, nous sommes une entreprise qui a grandi grâce à la confiance de nos clients et à notre engagement envers l'excellence." />
                    </div>
                </div>
                <div className="relative w-full mt-10 h-40 md:h-[400px]">
                    <Image
                        src={aboutbanner}
                        alt="About Banner"
                        layout="fill"
                        objectFit="cover"
                    />
                </div>
            </Screen>

            <Screen name="Histoire et Equipe">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <SecondHeading><h2>Notre Histoire</h2></SecondHeading>
                        <P customClasses="mt-4" content="Macar a débuté son parcours en 2002, fondée sur un héritage d'excellence en rénovation et en savoir-faire artisanal. En 2010, notre équipe actuelle a repris les rênes, insufflant une nouvelle énergie tout en préservant l'essence de la marque que nos clients connaissent et respectent." />
                    </div>
                    <div>
                        <SecondHeading><h2>Notre Equipe</h2></SecondHeading>
                        <P customClasses="mt-4" content="Nous avons une équipe de professionnels dévoués. Chaque membre de notre équipe est engagé à transformer vos idées en réalité avec compétence et attention." />
                    </div>
                </div>
            </Screen>

            <Screen name="valeurs">
                <SecondHeading customClasses="mb-6"> <h2>Nos Valeurs</h2></SecondHeading>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <SecondHeading customClasses="text-base lg:text-base 2xl:text-lg">Confiance</SecondHeading>
                        <P customClasses="mb-6" content="Nos engagements sont bien plus qu'un contrat signé. Nous bâtissons des relations durables en tenant nos promesses et en dépassant vos attentes." />

                        <SecondHeading customClasses="text-base lg:text-base 2xl:text-lg">Professionnalisme</SecondHeading>
                        <P customClasses="mb-6" content="Notre équipe fait preuve d'une rigueur et d'une attention au détail, garantissant que chaque projet est réalisé avec une précision exemplaire et dans les temps." />
                    </div>
                    <div>
                        <SecondHeading customClasses="text-base lg:text-base 2xl:text-lg">Transparence</SecondHeading>
                        <P customClasses="mb-6" content="Nous communiquons clairement les coûts, les délais et les méthodologies. Vous serez informés à chaque étape, sans coûts cachés ni surprises." />
                        <SecondHeading customClasses="text-base lg:text-base 2xl:text-lg">Adaptabilité</SecondHeading>
                        <P customClasses="mb-6" content="Nous sommes flexibles et réactifs face aux besoins changeants de nos clients et du marché, garantissant des solutions sur mesure pour chaque projet." />
                    </div>
                </div>
            </Screen>

            <Screen name="Trusted">
                <Trusted
                    titleAlignment="w-full flex flex-col items-center justify-center"
                    imageAlignment="justify-center mt-2"
                    headingSize="text-xl md:text-2xl"
                    imageSize={{ height: "80", width: "160" }}
                    imageClass="mx-2" // For example, margin between images
                />
            </Screen>
        </main >
    )
}