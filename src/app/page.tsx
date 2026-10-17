import type { Metadata } from "next";
import { Closing } from "@/components/Closing";
import { Header } from "@/components/Header";
import { Stage } from "@/components/Stage";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/* The home page: the guide tells the pitch, chapter by chapter, beside the
   headline; the closing frame below. The headline is the first thing drawn,
   so the page reads before any script or clip arrives. */
export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 pb-16 pt-24 sm:px-12 md:min-h-[100svh] md:grid-cols-[1fr_minmax(0,28rem)] md:items-center md:gap-14">
          <div>
            <p className="label text-gold-bright">Vaydin · Dubai</p>
            <h1 className="mt-4 font-display text-3xl leading-tight sm:text-5xl">
              Somewhere in Dubai tonight, a patient is choosing a clinic.
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-8 text-muted">
              Your name is on the list. Meet the guide: in six short chapters she tells you how Vaydin finds the
              patients your clinic never saw, and keeps them.
            </p>
          </div>
          <Stage />
        </section>
        <Closing />
      </main>
    </>
  );
}
