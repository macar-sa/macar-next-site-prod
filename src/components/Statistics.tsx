import { Card } from "@heroui/react/card";
import { Raptor } from "@/app/_components/textStyles";

const STATS = [
    { number: "+6000", text: "Projets de Rénovation" },
    { number: "24 ans", text: "d'Expérience" },
];

// Key figures of the home page: HeroUI v3 Cards, the figure in Raptor as before. Only figures
// Macar can back up (projects done, years of activity). One column on phones, then one column
// per figure.
const Statistics = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-10">
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
