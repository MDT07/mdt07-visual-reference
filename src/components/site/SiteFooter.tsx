import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/contact", label: "Contact" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-surface-2 bg-surface-1">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1fr_auto] md:items-end">
        <div className="max-w-2xl space-y-3">
          <p className="font-semibold text-text-primary">MDT07 Pinterest Reference</p>
          <p className="text-sm leading-6 text-text-secondary">
            A web tool for discovering and exploring Pinterest visual references for
            web design and development projects.
          </p>
          <p className="text-xs leading-5 text-text-tertiary">
            MDT07 Pinterest Reference is an independent project and is not endorsed
            by, affiliated with, or an official product of Pinterest.
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <ul className="flex max-w-xl flex-wrap gap-x-5 gap-y-2 text-sm text-text-secondary md:justify-end">
            {links.map((item) => (
              <li key={item.href}>
                <Link className="transition-colors hover:text-brand" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
