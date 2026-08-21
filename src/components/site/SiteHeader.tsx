import Link from "next/link";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  return (
    <header className="border-b border-surface-2 bg-surface-0/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-3 font-semibold tracking-tight text-text-primary"
          aria-label="MDT07 Visual Reference home"
        >
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-xl bg-brand text-sm font-bold text-white"
          >
            M7
          </span>
          <span>MDT07 Visual Reference</span>
        </Link>

        <nav aria-label="Primary navigation">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-secondary">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link className="transition-colors hover:text-brand" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
