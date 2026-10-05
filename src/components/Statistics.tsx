import { Card } from "@heroui/react/card";
import { Raptor } from "@/app/_components/textStyles";

const STATS = [
    { number: "+6000", text: "Projets de Rénovation" },
    { number: "24 ans", text: "d'Expérience" },
    { number: "+95%", text: "Taux de Réussite des Projets" },
];

// Key figures of the home page: three HeroUI v3 Cards, the figure in Raptor as before.
// One column on phones: three padded Cards side by side do not fit at 320 px.
const Statistics = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-10">
            {STATS.map((stat) => (
                <Card key={stat.text} className="items-center text-center">
                    <Raptor>
                        <h4 className="text-lg lg:text-5xl 2xl:text-6xl">{stat.number}</h4>
                    </Raptor>
                    <Card.Description>{stat.text}</Card.Description>
                </Card>
            ))}
        </div>
    );
};

export default Statistics;
