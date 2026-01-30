import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">Page introuvable</h1>
      <p className="text-text">La page que vous recherchez n&apos;existe pas.</p>
      <Link href="/" className="text-accent1 underline hover:no-underline">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
