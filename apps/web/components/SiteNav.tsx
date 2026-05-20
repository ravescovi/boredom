import Link from "next/link";

export function SiteNav() {
  return (
    <nav className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-5">
      <Link
        href="/"
        className="font-display text-[22px] font-extrabold -tracking-[.04em] text-ink"
      >
        bordon<span className="text-hot">.</span>ai
      </Link>
      <Link
        href="/games/preview"
        className="rounded-full border-2 border-ink bg-ink px-4 py-2.5 text-[13px] font-bold text-cream shadow-brut"
      >
        Peek at a game →
      </Link>
    </nav>
  );
}
