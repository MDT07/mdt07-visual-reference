import Link from "next/link";
import { deploymentConfig } from "@/lib/deployment";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/boards", label: "Boards" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const adminNavigation = [
  { href: "/admin", label: "Admin" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-surface-2/80 bg-surface-0/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 lg:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-3 font-semibold tracking-tight text-text-primary"
          aria-label="MDT07 Visual Reference home"
        >
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-[0.7rem] bg-text-primary text-xs font-bold tracking-wide text-white"
          >
            M7
          </span>
          <span className="hidden sm:inline">MDT07 Visual Reference</span>
        </Link>

        <nav aria-label="Primary navigation">
          <ul className="flex items-center gap-4 text-sm text-text-secondary sm:gap-6">
            {[...navigation, ...(deploymentConfig.isAdmin ? adminNavigation : [])].map((item) => (
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
