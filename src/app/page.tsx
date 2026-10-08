import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import { NightClock } from "@/components/NightClock";
import { Scene } from "@/components/Scene";
import { ScrubSequence } from "@/components/ScrubSequence";
import FRAMES from "@/lib/frames.json";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const WHATSAPP = "https://wa.me/971505553148";
const SIZES = "(max-width: 820px) 134vh, 100vw";

/* Where each sample clinic sits on the last frame of the city flight,
   as a fraction of the picture. Illustration only: no real clinic. */
const POINTS = [
  { x: 0.77, y: 0.59, text: "Replied after 3 hours", chosen: true, left: true },
  { x: 0.62, y: 0.36, text: "No reply after 6 PM" },
  { x: 0.675, y: 0.5, text: "Reviews unanswered" },
  { x: 0.42, y: 0.47, text: "Booking link broken", left: true, wide: true },
  { x: 0.895, y: 0.48, text: "Instagram DMs unread", left: true, wide: true },
  { x: 0.295, y: 0.56, text: "Missed call, no call back", wide: true },
  { x: 0.133, y: 0.43, text: "Closed on Google, open in fact", wide: true },
];
const CHOSEN = POINTS[0];

const SWEEP = { b0: 0.36, b1: 0.72 };
const RESWEEP = { b0: 0.5, b1: 0.72 };
const GOLD_AT = 0.32;
const GREEN_AT = 0.42;

const vars = (v: Record<string, string | number>) => v as CSSProperties;

function Points({ fixing = false }: { fixing?: boolean }) {
  return POINTS.map((point) => {
    const green = point.chosen ? GREEN_AT : RESWEEP.b0 + (RESWEEP.b1 - RESWEEP.b0) * point.y;
    const tag = `tag ${point.left ? "tag-left" : ""}`;
    return (
      <div
        key={point.text}
        className={`point ${point.wide ? "wide-only" : ""}`}
        style={vars({
          "--xn": point.x,
          "--y": `${point.y * 100}%`,
          "--yn": point.y,
          ...(fixing ? { "--tn": green, ...(point.chosen ? { "--tg": GOLD_AT } : {}) } : {}),
        })}
      >
        <span className="dot" />
        {fixing && point.chosen ? (
          <>
            <span className={`${tag} until`} style={vars({ "--at": GOLD_AT })}>
              {point.text}
            </span>
            <span className={`${tag} since`} style={vars({ "--at": GOLD_AT })}>
              Answered in minutes, booked
            </span>
          </>
        ) : fixing ? (
          <span className={`${tag} until`} style={vars({ "--at": green })}>
            {point.text}
          </span>
        ) : (
          <span className={tag}>{point.text}</span>
        )}
      </div>
    );
  });
}

const TEXT = "absolute inset-x-0 bottom-0 grid px-5 pb-10 sm:px-12 sm:pb-16";
const BLOCK = "max-w-xl [grid-area:1/1] self-end";
const H = "font-display text-3xl leading-tight sm:text-5xl";
const LEAD = "mt-4 max-w-lg text-lg leading-8 text-muted";

export default function Home() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 sm:px-12">
        <a href="#city" className="flex items-center gap-3">
          <Image src="/img/mark.png" alt="" width={36} height={31} />
          <span className="font-display text-xl tracking-[0.2em]">VAYDIN</span>
        </a>
        <a
          href={WHATSAPP}
          className="rounded-full border border-gold bg-background/70 px-4 py-2 text-base text-gold-bright"
        >
          WhatsApp
        </a>
      </header>

      <main className="flex-1">
        <Scene id="city" length={520} label="Dubai tonight">
          <div className="stage" style={vars({ "--cx": 0.72 })}>
            <div
              className="dive"
              style={vars({ "--at": 0.8, "--xn": CHOSEN.x, "--y": `${CHOSEN.y * 100}%` })}
            >
              <Image src="/img/m-first.webp" alt="Dubai at night, seen from above, drawn in gold light" fill sizes={SIZES} loading="eager" fetchPriority="high" />
              <Image src="/img/m-last.webp" alt="" fill sizes={SIZES} className="fade-in" style={vars({ "--at": 0.3, "--over": 0.02 })} />
              <ScrubSequence name="m" count={FRAMES.m} from={0.02} to={0.32} />
              <div className="beam" style={vars({ "--b0": SWEEP.b0, "--b1": SWEEP.b1 })} />
              <div className="hide absolute inset-0" style={vars({ "--b0": SWEEP.b0, "--b1": SWEEP.b1, "--at": 0.79 })}>
                <Points />
              </div>
            </div>
          </div>
          <div className="scrim" />
          <div className="shade fade-in" style={vars({ "--at": 0.84, "--over": 0.12 })} />
          <div className={TEXT}>
            <div className={`${BLOCK} hide`} style={vars({ "--at": 0.3 })}>
              <p className="label text-gold-bright">Sample clinics · Illustration</p>
              <h1 className={`${H} mt-4`}>Somewhere in Dubai tonight, a patient is choosing a clinic.</h1>
              <p className={LEAD}>Your name is on the list.</p>
            </div>
            <div className={`${BLOCK} hide`} style={vars({ "--at": 0.84 })}>
              <div className="show" style={vars({ "--at": 0.34 })}>
                <p className="label text-leak">Step 01 · Diagnose</p>
                <h2 className={`${H} mt-4`}>First, we see what your patients see.</h2>
                <p className={LEAD}>
                  Everything a patient can find about a clinic from the outside: how it answers, how
                  it looks on Google and Instagram. What leaks shows up in red.
                </p>
              </div>
            </div>
          </div>
        </Scene>

        <Scene id="inside" length={260} label="Inside one clinic">
          <div className="stage" style={vars({ "--cx": 0.68 })}>
            <Image src="/img/a-first.webp" alt="An empty clinic reception at sunset, a phone glowing on the marble desk" fill sizes={SIZES} />
            <ScrubSequence name="a" count={FRAMES.a} from={0.05} to={0.92} />
          </div>
          <div className="scrim" />
          <div className="shade fade-out" style={vars({ "--at": 0, "--over": 0.1 })} />
          <div className="absolute inset-x-0 top-24 px-5 sm:top-auto sm:bottom-0 sm:px-12 sm:pb-16">
            <div className="max-w-xl">
              <p className="label text-gold-bright">Sample clinic · Jumeirah · Illustration</p>
              <h2 className={`${H} mt-4`}>Inside one of them. 6:48 PM.</h2>
              <div className="show mt-6" style={vars({ "--at": 0.45 })}>
                <p className="bubble bubble-in">
                  Hi, I&apos;d like to book a consultation for lip filler this week. Do you have
                  Thursday evening?
                  <time>6:48 PM</time>
                </p>
              </div>
            </div>
          </div>
        </Scene>

        <Scene id="wait" length={420} label="The wait">
          <div className="stage" style={vars({ "--cx": 0.68 })}>
            <Image src="/img/b-first.webp" alt="The phone on the desk, still unanswered" fill sizes={SIZES} />
            <Image src="/img/b-last.webp" alt="" fill sizes={SIZES} className="fade-in" style={vars({ "--at": 0.5, "--over": 0.02 })} />
            <ScrubSequence name="b" count={FRAMES.b} from={0.05} to={0.8} />
          </div>
          <div className="scrim" />
          <div className="absolute right-5 top-20 text-right sm:right-12 sm:top-24">
            <NightClock start={18 * 60 + 48} end={21 * 60 + 55} from={0.05} to={0.8} />
            <p className="label mt-1 text-muted">6:48 PM to 9:55 PM</p>
          </div>
          <div className="absolute inset-x-0 top-40 flex max-w-xl flex-col gap-3 px-5 sm:top-1/4 sm:px-12">
            <p className="bubble bubble-in">
              Hi, I&apos;d like to book a consultation for lip filler this week. Do you have Thursday
              evening?
              <time>6:48 PM</time>
            </p>
            <p className="label show text-muted" style={vars({ "--at": 0.38 })}>
              3 hours later
            </p>
            <div className="show" style={vars({ "--at": 0.6 })}>
              <p className="bubble bubble-out">
                Good evening, please call us tomorrow during working hours to book.
                <time>9:52 PM</time>
              </p>
            </div>
            <div className="show" style={vars({ "--at": 0.76 })}>
              <p className="bubble bubble-in">
                No worries, I found another clinic. Thanks.
                <time>9:55 PM</time>
              </p>
            </div>
            <p
              className="label show w-fit rounded-md border border-leak bg-background px-3 py-2 text-leak"
              style={vars({ "--at": 0.87 })}
            >
              Patient lost · never seen
            </p>
          </div>
        </Scene>

        <Scene id="fix" length={520} label="The fix">
          <div className="stage" style={vars({ "--cx": 0.68 })}>
            <Image src="/img/c-first.webp" alt="" fill sizes={SIZES} />
            <ScrubSequence name="c" count={FRAMES.c} from={0} to={0.22} />
          </div>
          <div className="stage fade-in" style={vars({ "--cx": 0.72, "--at": 0.2, "--over": 0.06 })}>
            <Image src="/img/m-last.webp" alt="The city again, the clinic points turning from red to green" fill sizes={SIZES} />
            <ScrubSequence name="m" count={FRAMES.m} from={0.82} to={1} reverse />
            <div className="beam" style={vars({ "--b0": RESWEEP.b0, "--b1": RESWEEP.b1 })} />
            <div className="hide absolute inset-0" style={vars({ "--b0": -2, "--b1": -1, "--at": 0.8 })}>
              <Points fixing />
            </div>
          </div>
          <div className="scrim" />
          <div className={TEXT}>
            <div className={`${BLOCK} hide`} style={vars({ "--at": 0.5 })}>
              <div className="show" style={vars({ "--at": 0.28 })}>
                <p className="label text-gold-bright">Step 02 · Fix &amp; run</p>
                <h2 className={`${H} mt-4`}>Then we fix it, and run it.</h2>
                <p className={LEAD}>
                  Every inquiry answered in minutes, booked, reminded, revived. Your clinic&apos;s own
                  voice and number.
                </p>
              </div>
            </div>
            <div className={`${BLOCK} show`} style={vars({ "--at": 0.54 })}>
              <p className="label text-proof">The loop · measured, not promised</p>
              <h2 className={`${H} mt-4`}>The diagnostic never stops.</h2>
              <p className={LEAD}>
                Red finds the leak. Gold fixes and runs it. Green proves the gain.
              </p>
            </div>
          </div>
        </Scene>

        <section id="contact" className="mx-auto w-full max-w-5xl px-5 py-24 sm:px-12 sm:py-32">
          <h2 className={`${H} max-w-3xl`}>
            Somewhere in Dubai tonight, a patient is choosing a clinic. Vaydin makes sure you
            don&apos;t lose them.
          </h2>
          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            <div>
              <p className="label text-leak">Diagnose</p>
              <p className="mt-3 leading-7 text-muted">
                An unannounced mystery shop of your own clinic, plus a monthly sweep of everything
                a patient can find.
              </p>
            </div>
            <div>
              <p className="label text-gold-bright">Fix</p>
              <p className="mt-3 leading-7 text-muted">
                The Vaydin engine takes over your digital front door: one vendor, your clinic&apos;s
                own voice and number.
              </p>
            </div>
            <div>
              <p className="label text-proof">Grow</p>
              <p className="mt-3 leading-7 text-muted">
                Once the engine runs your clinic, paid patient demand lands in a machine built to
                convert it.
              </p>
            </div>
          </div>
          <div className="mt-14 flex flex-wrap gap-4">
            <a href={WHATSAPP} className="rounded-full bg-gold-bright px-7 py-3 text-base font-medium text-background">
              WhatsApp · +971 50 555 3148
            </a>
            <a href={`mailto:${SITE.email}`} className="rounded-full border border-gold px-7 py-3 text-base text-gold-bright">
              {SITE.email}
            </a>
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-5 py-8 text-sm leading-6 text-muted sm:px-12">
        <p>The diagnostic sells the engine. The engine earns the fuel.</p>
        <p className="mt-2">
          VAYDIN PARTNERS INVESTMENTS - FZCO · DSO-IFZA, IFZA Properties, Dubai Silicon Oasis,
          Dubai, UAE · Licensed under IFZA
        </p>
      </footer>
    </>
  );
}
