import { TextLink } from "./_components/links";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">Page introuvable</h1>
      <p className="text-muted">La page que vous recherchez n&apos;existe pas.</p>
      <TextLink href="/">Retour à l&apos;accueil</TextLink>
    </div>
  );
}
