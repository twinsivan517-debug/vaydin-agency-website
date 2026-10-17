import type { Metadata } from "next";
import { Closing } from "@/components/Closing";
import { Header } from "@/components/Header";
import { Stage } from "@/components/Stage";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/* The home page: the guide beside her card, the closing frame below. One
   line of title above, so the page reads before any script or clip arrives. */
export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-5 pb-6 pt-24 sm:px-12">
          <p className="label text-gold-bright">Vaydin · Dubai</p>
          <h1 className="mt-2 font-display text-2xl leading-tight sm:text-3xl">We find the patients your clinic never saw.</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
            Vaydin is a Dubai company for aesthetic and wellness clinics in the UAE and the GCC. We measure how your
            clinic looks to a new patient, then run its front door for you: WhatsApp, Google, reviews, Instagram and
            the website, answered and kept current, with your reception approving by a tap.
          </p>
          <div className="mt-6">
            <Stage />
          </div>
        </div>
        <Closing />
      </main>
    </>
  );
}
