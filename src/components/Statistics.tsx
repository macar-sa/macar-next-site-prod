import { ThirdHeading, P, SecondHeading, Raptor } from "@/app/_components/textStyles";


const Statistics = () => {
    const stats = [
        { number: '+6000', text: 'Projets de Rénovation' },
        { number: '24 ans', text: 'd   \'Expérience' },
        { number: '+95%', text: 'Taux de Réussite des Projets' },
    ];

    return (
        <div className="grid grid-cols-3 gap-10">
            {stats.map((stat, index) => (
                <div key={index} className="text-center">
                    {/* Use ThirdHeading for the number and P for the text */}
                    <Raptor>
                        <h4 className="text-lg lg:text-5xl 2xl:text-6xl">{stat.number}</h4>
                    </Raptor>
                    <P content={stat.text} customClasses="text-base" />
                </div>
            ))}
        </div>
    );
};

export default Statistics;
