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

/* What a patient can check about a clinic from outside. */
const CHECKS = ["Website", "Replies", "Booking", "Prices", "Reviews", "Social media"];

/* Sample clinics on the last frame of the city flight, placed as a fraction
   of the picture. Illustration only: no real clinic. `d` and `m` are the
   clinic's turn in the scan on wide screens and on phones; a clinic without
   one is not shown there. Each row is [fine, what was found], in CHECKS order. */
type Clinic = {
  x: number;
  y: number;
  leaks: boolean;
  d?: number;
  m?: number;
  left?: boolean;
  chosen?: boolean;
  rows: [boolean, string][];
};
const CLINICS: Clinic[] = [
  {
    x: 0.133, y: 0.43, leaks: true, d: 0,
    rows: [[false, "Down tonight"], [true, "Answers in minutes"], [false, "Link broken"],
      [false, "Nowhere to find"], [true, "All answered"], [false, "Silent for months"]],
  },
  {
    x: 0.62, y: 0.36, leaks: false, d: 1, m: 0,
    rows: [[true, "Fast on phones"], [true, "Answers in minutes"], [true, "Books online"],
      [true, "Shown clearly"], [true, "All answered"], [false, "Silent for weeks"]],
  },
  {
    x: 0.42, y: 0.47, leaks: true, d: 2,
    rows: [[true, "Fast on phones"], [false, "No reply after 6 PM"], [false, "Phone calls only"],
      [true, "Shown clearly"], [false, "Bad ones unanswered"], [true, "Posted this week"]],
  },
  {
    x: 0.675, y: 0.5, leaks: true, m: 1,
    rows: [[true, "Fast on phones"], [false, "No reply after 6 PM"], [false, "Phone calls only"],
      [true, "Shown clearly"], [false, "Bad ones unanswered"], [true, "Posted this week"]],
  },
  {
    x: 0.895, y: 0.48, leaks: true, d: 3, m: 2, left: true,
    rows: [[false, "Slow on phones"], [false, "Messages left unread"], [true, "Books online"],
      [false, "Out of date"], [true, "All answered"], [false, "Silent for months"]],
  },
  {
    x: 0.295, y: 0.56, leaks: false, d: 4,
    rows: [[true, "Fast on phones"], [true, "Answers in minutes"], [true, "Books online"],
      [false, "Nowhere to find"], [true, "All answered"], [true, "Posted this week"]],
  },
  {
    x: 0.77, y: 0.59, leaks: true, d: 5, m: 3, left: true, chosen: true,
    rows: [[false, "Slow on phones"], [false, "Replied after 3 hours"], [false, "Link broken"],
      [true, "Shown clearly"], [false, "Bad ones unanswered"], [true, "Posted this week"]],
  },
];

const SWEEP = { b0: 0.14, b1: 0.23 };
const SCAN = { from: 0.24, to: 0.5 };
const TURN = {
  d: (SCAN.to - SCAN.from) / CLINICS.filter((clinic) => clinic.d !== undefined).length,
  m: (SCAN.to - SCAN.from) / CLINICS.filter((clinic) => clinic.m !== undefined).length,
};
const RESWEEP = { b0: 0.7, b1: 0.84 };
const GOLD_AT = 0.63;
const GREEN_AT = 0.67;

/* What is going wrong inside the chosen clinic, and what each line becomes
   once the engine runs it. */
const INSIDE = [
  ["The phone rings while she serves a patient", "Every call answered, in the clinic's own voice"],
  ["A WhatsApp message nobody has seen", "Every message answered in minutes"],
  ["The booking page shows an error", "Booked on the spot, and reminded"],
  ["Instagram questions left unread", "Old inquiries revived"],
];

const vars = (v: Record<string, string | number>) => v as CSSProperties;

const only = (clinic: Clinic) =>
  clinic.d === undefined ? "narrow-only" : clinic.m === undefined ? "wide-only" : "";

const place = (clinic: Clinic) => ({
  "--xn": clinic.x,
  "--y": `${clinic.y * 100}%`,
  ...(clinic.d === undefined ? {} : { "--t0d": SCAN.from + clinic.d * TURN.d, "--wd": TURN.d }),
  ...(clinic.m === undefined ? {} : { "--t0m": SCAN.from + clinic.m * TURN.m, "--wm": TURN.m }),
});

/* The dots. In the scan each takes its colour when its turn ends; in the fix
   they arrive already judged and the leaking ones turn green. */
function Points({ fixing = false }: { fixing?: boolean }) {
  return CLINICS.map((clinic) => (
    <div
      key={clinic.x}
      className={`point ${only(clinic)}`}
      style={vars({
        ...(fixing ? { "--xn": clinic.x, "--y": `${clinic.y * 100}%`, "--judged": 1 } : place(clinic)),
        "--yn": clinic.y,
        "--verdict": clinic.leaks ? "var(--leak)" : "var(--proof)",
        ...(fixing && clinic.leaks
          ? { "--tn": clinic.chosen ? GREEN_AT : RESWEEP.b0 + (RESWEEP.b1 - RESWEEP.b0) * clinic.y }
          : {}),
        ...(fixing && clinic.chosen ? { "--tg": GOLD_AT } : {}),
      })}
    >
      {!fixing && <span className="ring" />}
      <span className="dot" />
      {fixing && clinic.chosen && (
        <span className="tag tag-left since" style={vars({ "--at": GOLD_AT })}>
          Answered in minutes, booked
        </span>
      )}
    </div>
  ));
}

function Cards() {
  return CLINICS.map((clinic) => (
    <div
      key={clinic.x}
      className={`card ${clinic.left ? "card-left" : ""} ${only(clinic)}`}
      style={vars(place(clinic))}
    >
      <p className="label text-gold-bright">Sample clinic · Illustration</p>
      <ul className="mt-2">
        {clinic.rows.map(([fine, found], i) => (
          <li key={CHECKS[i]} className="row" style={vars({ "--ri": 0.08 + i * 0.1 })}>
            <span className={`mark ${fine ? "ok" : "bad"}`} aria-hidden="true">
              {fine ? "\u2713" : "\u2715"}
            </span>
            <span>{CHECKS[i]}</span>
            <span className="found">
              <span className="sr-only">{fine ? "fine: " : "problem: "}</span>
              {found}
            </span>
          </li>
        ))}
      </ul>
    </div>
  ));
}

/* A scene's still picture. Phones take the first or last frame of their own
   3:4 sequence, which the canvas then reuses from the cache. */
function Poster({
  clip,
  end = false,
  alt,
  eager = false,
  className,
  style,
}: {
  clip: keyof typeof FRAMES;
  end?: boolean;
  alt: string;
  eager?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const frame = String(end ? FRAMES[clip] : 1).padStart(3, "0");
  return (
    <picture>
      <source media="(max-width: 820px)" srcSet={`/frames/${clip}/m/${frame}.webp`} />
      <img
        src={`/img/${clip}-${end ? "last" : "first"}.webp`}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
        className={className}
        style={style}
      />
    </picture>
  );
}

/* One clip of a scene: it takes over the picture at `from`, plays to `to`,
   and leaves its last (or, played backwards, its first) frame standing. */
function Shot({
  clip,
  from,
  to,
  reverse = false,
  dissolve = 0.008,
  alt = "",
}: {
  clip: keyof typeof FRAMES;
  from: number;
  to: number;
  reverse?: boolean;
  dissolve?: number;
  alt?: string;
}) {
  return (
    <div className="fade-in absolute inset-0" style={vars({ "--at": from - dissolve, "--over": dissolve })}>
      <Poster clip={clip} end={reverse} alt="" />
      <Poster
        clip={clip}
        end={!reverse}
        alt={alt}
        className="fade-in"
        style={vars({ "--at": (from + to) / 2, "--over": 0.01 })}
      />
      <ScrubSequence name={clip} count={FRAMES[clip]} from={from} to={to} reverse={reverse} />
    </div>
  );
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
        <Scene id="city" length={1500} label="Dubai tonight">
          <div className="stage" style={vars({ "--cx": 0.72 })}>
            <Poster clip="m" alt="Dubai at night, seen from above, drawn in gold light" eager />
            <Poster clip="m" end alt="" className="fade-in" style={vars({ "--at": 0.11, "--over": 0.01 })} />
            <ScrubSequence name="m" count={FRAMES.m} from={0.01} to={0.12} />
            <div className="beam" style={vars({ "--b0": SWEEP.b0, "--b1": SWEEP.b1 })} />
            <div className="cut absolute inset-0" style={vars({ "--b0": SWEEP.b0, "--b1": SWEEP.b1, "--at": 0.515 })}>
              <Points />
            </div>
            <Shot clip="n" from={0.52} to={0.66} alt="The entrance of a clinic at sunset, its reception glowing inside" />
            <Shot clip="e" from={0.66} to={0.8} alt="Inside: a receptionist on the phone, a patient waiting, a colleague rushing past" />
          </div>
          <div className="scrim" />
          <div className="stage cut" style={vars({ "--cx": 0.72, "--at": 0.515 })}>
            <Cards />
          </div>
          <div className="shade fade-in" style={vars({ "--at": 0.96, "--over": 0.04 })} />
          <div className={TEXT}>
            <div className={`${BLOCK} hide`} style={vars({ "--at": 0.115 })}>
              <p className="label text-gold-bright">Sample clinics · Illustration</p>
              <h1 className={`${H} mt-4`}>Somewhere in Dubai tonight, a patient is choosing a clinic.</h1>
              <p className={LEAD}>Your name is on the list.</p>
            </div>
            <div className={`${BLOCK} hide`} style={vars({ "--at": SCAN.from })}>
              <div className="show" style={vars({ "--at": 0.125 })}>
                <p className="label text-leak">Step 01 · Diagnose</p>
                <h2 className={`${H} mt-4`}>First, we see what your patients see.</h2>
                <p className={LEAD}>
                  Everything a patient can find about a clinic from the outside: how it answers, how
                  it looks on Google and Instagram. What leaks shows up in red.
                </p>
              </div>
            </div>
            <div className={`${BLOCK} wide-only hide`} style={vars({ "--at": 0.515 })}>
              <div className="show" style={vars({ "--at": SCAN.from + 0.005 })}>
                <p className="label text-leak">Step 01 · Diagnose</p>
                <p className="mt-2 text-lg text-foreground">
                  Clinic by clinic. Green holds. Red leaks patients.
                </p>
              </div>
            </div>
            <div className={`${BLOCK} hide`} style={vars({ "--at": 0.64 })}>
              <div className="show" style={vars({ "--at": 0.53 })}>
                <p className="label text-gold-bright">Sample clinic · Illustration</p>
                <h2 className={`${H} mt-4`}>Then we go inside the one that leaks most.</h2>
              </div>
            </div>
            <div className={`${BLOCK} show`} style={vars({ "--at": 0.8 })}>
              <p className="label text-gold-bright">Sample clinic · 6:48 PM · Illustration</p>
              <h2 className={`${H} mt-4`}>Nobody here is doing anything wrong.</h2>
              <p className={LEAD}>The team is busy with the patient in front of them. Meanwhile:</p>
              <ul className="mt-4 flex flex-col gap-2">
                {INSIDE.map(([leak], i) => (
                  <li key={leak} className="show flex gap-3 text-lg" style={vars({ "--at": 0.83 + i * 0.03 })}>
                    <span className="mark bad" aria-hidden="true">{"\u2715"}</span>
                    {leak}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Scene>

        <Scene id="wait" length={380} label="The wait">
          <div className="stage" style={vars({ "--cx": 0.68 })}>
            <Poster clip="b" alt="The phone on the reception desk, still unanswered" />
            <Poster clip="b" end alt="" className="fade-in" style={vars({ "--at": 0.5, "--over": 0.02 })} />
            <ScrubSequence name="b" count={FRAMES.b} from={0.08} to={0.78} />
          </div>
          <div className="scrim" />
          <div className="shade fade-out" style={vars({ "--at": 0, "--over": 0.08 })} />
          <div className="absolute right-5 top-20 text-right sm:right-12 sm:top-24">
            <NightClock start={18 * 60 + 48} end={21 * 60 + 55} from={0.08} to={0.78} />
            <p className="label mt-1 text-muted">6:48 PM to 9:55 PM</p>
          </div>
          <div className="absolute inset-x-0 top-44 flex max-w-xl flex-col gap-3 px-5 sm:top-28 sm:px-12">
            <p className="label text-gold-bright">That one message · Illustration</p>
            <h2 className="font-display text-2xl leading-tight sm:text-4xl">
              She wanted to book. The phone lay on the desk all evening.
            </h2>
            <p className="bubble bubble-in mt-2">
              Hi, I&apos;d like to book a consultation for lip filler this week. Do you have Thursday
              evening?
              <time>6:48 PM</time>
            </p>
            <p className="label show text-muted" style={vars({ "--at": 0.38 })}>
              3 hours later, the team has gone home
            </p>
            <div className="show" style={vars({ "--at": 0.58 })}>
              <p className="bubble bubble-out">
                Good evening, please call us tomorrow during working hours to book.
                <time>9:52 PM</time>
              </p>
            </div>
            <div className="show" style={vars({ "--at": 0.74 })}>
              <p className="bubble bubble-in">
                No worries, I found another clinic. Thanks.
                <time>9:55 PM</time>
              </p>
            </div>
            <p
              className="label show w-fit rounded-md border border-leak bg-background px-3 py-2 text-leak"
              style={vars({ "--at": 0.86 })}
            >
              Patient lost · never seen
            </p>
          </div>
        </Scene>

        <Scene id="fix" length={1100} label="The fix">
          <div className="stage" style={vars({ "--cx": 0.72 })}>
            <Poster clip="r" alt="The same reception the next evening, just as busy" />
            <Shot clip="r" from={0.05} to={0.27} alt="The receptionist puts the phone down and smiles at her patient; the rush has calmed" />
            <Shot clip="n" from={0.42} to={0.6} reverse dissolve={0.06} alt="The city again, the clinic points turning from red to green" />
            <div className="beam" style={vars({ "--b0": RESWEEP.b0, "--b1": RESWEEP.b1 })} />
            <div className="fade-in absolute inset-0" style={vars({ "--at": 0.6, "--over": 0.01 })}>
              <div className="cut absolute inset-0" style={vars({ "--b0": -2, "--b1": -1, "--at": 0.875 })}>
                <Points fixing />
              </div>
            </div>
            <Shot clip="m" from={0.88} to={1} reverse />
          </div>
          <div className="scrim" />
          <div className="shade fade-out" style={vars({ "--at": 0, "--over": 0.05 })} />
          <div className={TEXT}>
            <div className={`${BLOCK} hide`} style={vars({ "--at": 0.36 })}>
              <p className="label text-gold-bright">Step 02 · Fix &amp; run · The next evening</p>
              <h2 className={`${H} mt-4`}>Then we fix it, and run it.</h2>
              <p className={LEAD}>Same clinic, same rush. Your clinic&apos;s own voice and number.</p>
              <ul className="mt-4 flex flex-col gap-2">
                {INSIDE.map(([, fixed], i) => (
                  <li key={fixed} className="show flex gap-3 text-lg" style={vars({ "--at": 0.1 + i * 0.045 })}>
                    <span className="mark ok" aria-hidden="true">{"\u2713"}</span>
                    {fixed}
                  </li>
                ))}
              </ul>
            </div>
            <div className={`${BLOCK} show`} style={vars({ "--at": 0.62 })}>
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
