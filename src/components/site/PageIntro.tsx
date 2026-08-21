interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
}

export default function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <header className="space-y-5 border-b border-surface-2 pb-10">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
        {eyebrow}
      </p>
      <h1 className="text-4xl font-semibold tracking-[-0.035em] text-text-primary sm:text-5xl">
        {title}
      </h1>
      <p className="max-w-3xl text-lg leading-8 text-text-secondary">{description}</p>
    </header>
  );
}
