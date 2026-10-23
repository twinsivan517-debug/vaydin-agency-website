import Image from "next/image";
import Link from "next/link";
import { PAGES, WHATSAPP } from "@/lib/site";

/* The header over the home page: the mark, the five pages in the page's own
   text colour so they read as a menu even while the room is dark, WhatsApp,
   and a phone menu that is a plain <details>, so it works with no script.
   A tap on the mark loads the home page afresh, as the five pages' own marks
   do: Stage lets the browser follow it, where Next's Link would make a client
   navigation that shows nothing on the page already open. Link stays: with a
   plain link the gate's phone score measured 90, with Link 92 (2026-10-23). */
export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-background/80 to-transparent px-5 py-2 sm:px-12 sm:py-4">
      <Link href="/" className="mark flex items-center gap-3" aria-label="Vaydin, home">
        <Image src="/img/mark.png" alt="" width={36} height={31} />
        <span className="hidden font-display text-xl tracking-[0.2em] sm:inline">VAYDIN</span>
      </Link>
      <nav className="hidden items-center gap-7 text-base text-foreground/85 md:flex" aria-label="Pages">
        {PAGES.map(([word, href]) => (
          <a key={href} href={href} className="transition-colors hover:text-gold-bright">
            {word}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <a href={WHATSAPP} className="rounded-full border border-gold bg-background/70 px-4 py-2 text-base text-gold-bright">
          WhatsApp
        </a>
        <details className="menu relative md:hidden">
          <summary className="rounded-full border border-gold/50 bg-background/70 px-4 py-2 text-base text-foreground">Menu</summary>
          <nav
            className="absolute right-0 top-12 grid min-w-40 gap-3 rounded-2xl border border-gold/40 bg-background px-5 py-4 text-base"
            aria-label="Pages"
          >
            {PAGES.map(([word, href]) => (
              <a key={href} href={href} className="text-muted hover:text-gold-bright">
                {word}
              </a>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
