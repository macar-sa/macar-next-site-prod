"use client";
import Image from 'next/image'
import Screen from '../_components/screen'
import { MainHeading, P, SecondHeading, ThirdHeading } from '../_components/textStyles'
import { Card } from '../_components/cards';
import { PrimaryButton } from '../_components/buttons';
import { Jobs } from '@/components/jobs';
import LogoLarge from '/src/app/about/Logo_large.webp';
import { Heading } from 'lucide-react';
import { Trusted } from '@/components/trusted';

export default function about() {
    return (
        <main className="flex min-h-screen flex-col">
            <Screen name="about">
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
                        <div>
                            <MainHeading>
                                <h2 className="leading-tight">
                                    A propos
                                </h2>
                            </MainHeading>
                            <P customClasses="mt-4" content="Situés au cœur de Bruxelles, nous sommes une entreprise familiale qui a grandi grâce à la confiance de nos clients et à notre engagement envers l'excellence." />
                        </div>
                        <div className="flex justify-end items-center">
                            <Image
                                src={LogoLarge}
                                alt="Logo_large"
                                objectFit="cover"
                            />
                        </div>
                    </div>

                    <Screen name="Histoire et Equipe">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <ThirdHeading>Notre Histoire</ThirdHeading>
                                <P customClasses="mt-4" content="Macar a débuté son parcours en 2002, fondée sur un héritage d'excellence en rénovation et en savoir-faire artisanal. En 2010, notre équipe actuelle a repris les rênes, insufflant une nouvelle énergie tout en préservant l'essence de la marque que nos clients connaissent et respectent." />
                            </div>
                            <div>
                                <ThirdHeading>Notre Equipe</ThirdHeading>
                                <P customClasses="mt-4" content="Nous avons une équipe de professionnels dévoués. Chaque membre de notre équipe est engagé à transformer vos idées en réalité avec compétence et attention." />
                            </div>
                        </div>
                    </Screen>

                    <Screen name="valeurs">
                        <ThirdHeading customClasses="mb-6">Nos Valeurs</ThirdHeading>
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
                </div>
            </Screen>

            <Screen name="Trusted">
                <Trusted>
                </Trusted>
            </Screen>
        </main>

    )
}