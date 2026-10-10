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

/* Sample clinics on the last frame of the city flight, each on a lit spot of
   that picture, as a fraction of it. Illustration only: no real clinic.
   `top` answers every patient; `chosen` is the one the story enters. Phones
   see a narrow band of the picture, so some pins are for one screen only. The
   wide chosen pin sits on the spot the descent clip keeps still. */
type Pin = { x: number; y: number; top?: boolean; chosen?: boolean; on?: "wide" | "narrow" };
const PINS: Pin[] = [
  { x: 0.1, y: 0.245, on: "wide" },
  { x: 0.33, y: 0.3, on: "wide" },
  { x: 0.185, y: 0.4, on: "wide" },
  { x: 0.225, y: 0.46, on: "wide" },
  { x: 0.405, y: 0.33, top: true, on: "wide" },
  { x: 0.503, y: 0.455, chosen: true, on: "wide" },
  { x: 0.9, y: 0.27, on: "wide" },
  { x: 0.845, y: 0.44, top: true, on: "wide" },
  { x: 0.8, y: 0.4, top: true, on: "narrow" },
  { x: 0.375, y: 0.545, on: "wide" },
  { x: 0.585, y: 0.79, top: true, on: "wide" },
  { x: 0.87, y: 0.64, on: "wide" },
  { x: 0.78, y: 0.83, on: "wide" },
  { x: 0.64, y: 0.43, chosen: true, on: "narrow" },
  { x: 0.655, y: 0.29, on: "narrow" },
  { x: 0.83, y: 0.275, on: "narrow" },
  { x: 0.675, y: 0.525, top: true, on: "narrow" },
  { x: 0.81, y: 0.51, on: "narrow" },
];

/* The city scene's timetable: its length, and moments along that length. */
const CITY = 1270;
const at = (svh: number) => +(svh / CITY).toFixed(4);
const SWEEP = { b0: at(210), b1: at(345) };
const FOCUS = at(360);
const OPEN = { from: at(370), to: at(545), row: 25 };
const DIVE = { from: 550, to: 760 };
const DESK = 970;
const RESWEEP = { b0: 0.7, b1: 0.84 };
const GOLD_AT = 0.63;
const GREEN_AT = 0.67;

/* What a patient meets at the chosen clinic, seen from outside. The last four
   are the four things the reception scene then shows going wrong. */
const MEETS = [
  ["Website", "Slow on phones"],
  ["Phone", "Rings out when busy"],
  ["WhatsApp", "No reply after 6 PM"],
  ["Booking", "The link is broken"],
  ["Instagram", "Questions left unread"],
];

/* What is going wrong inside the chosen clinic, and what each line becomes
   once the engine runs it. */
const INSIDE = [
  ["The phone rings while she serves a patient", "Every call answered, in the clinic's own voice"],
  ["A WhatsApp message nobody has seen", "Every message answered in minutes"],
  ["The booking page shows an error", "Booked on the spot, and reminded"],
  ["Instagram questions left unread", "Old inquiries revived"],
];

const vars = (v: Record<string, string | number>) => v as CSSProperties;

/* The phone on the reception desk, as a fraction of the picture, and the
   centre of that picture's phone cut. */
const PHONE = { x: 0.7285, y: 0.545, cx: 0.56 };

/* The call that phone gets. It rings from `at`; at `then` it is over. */
function Call({ at, then, answered = false }: { at: number; then: number; answered?: boolean }) {
  return (
    <div
      className="call"
      style={vars({
        "--xn": PHONE.x,
        "--y": `${PHONE.y * 100}%`,
        "--at": at,
        "--then": then,
        "--end": answered ? "var(--proof)" : "var(--leak)",
      })}
    >
      <span className="call-ring" aria-hidden="true" />
      <p className="call-tag">
        <span className="ringing">
          <span className="label">Incoming call</span>
          New patient
        </span>
        <span className="ended">
          <span className="label">{answered ? "Answered" : "Missed call"}</span>
          New patient
        </span>
      </p>
    </div>
  );
}

const only = (pin: Pin) => (pin.on ? `${pin.on}-only` : "");

const spot = (pin: Pin) => ({ "--xn": pin.x, "--y": `${pin.y * 100}%`, "--yn": pin.y });

/* The pins. In the city scene the beam lights them and the chosen one turns
   red; on wide screens it stays through the first frames of the descent. In
   the fix they arrive already lit and the chosen one turns gold, then green. */
function Pins({ fixing = false }: { fixing?: boolean }) {
  return PINS.map((pin) => {
    const held = pin.chosen && pin.on === "wide";
    return (
      <div
        key={`${pin.x}-${pin.y}`}
        className={`pin ${pin.chosen ? "chosen" : ""} ${pin.top ? "top" : ""} ${only(pin)}`}
        style={vars({
          ...spot(pin),
          "--base": pin.top ? "var(--proof)" : "var(--foreground)",
          ...(fixing && pin.chosen ? { "--tg": GOLD_AT, "--tn": GREEN_AT } : {}),
          ...(fixing && held ? { "--i0": 0.565, "--io": 0.035 } : {}),
          ...(!fixing && held ? { "--o0": at(DIVE.from + 8), "--oo": at(42) } : {}),
        })}
      >
        {!fixing && pin.chosen && <span className="pin-ring" aria-hidden="true" />}
        <svg viewBox="0 0 24 32" aria-hidden="true">
          <path
            d="M12 31C12 31 2 19.5 2 11.5a10 10 0 1 1 20 0C22 19.5 12 31 12 31Z"
            fill="rgb(13 8 7 / 0.9)"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path
            d="M12 5.5c.6 3.8 2.2 5.4 6 6-3.8.6-5.4 2.2-6 6-.6-3.8-2.2-5.4-6-6 3.8-.6 5.4-2.2 6-6Z"
            fill="currentColor"
          />
        </svg>
        {fixing && pin.chosen && (
          <span className="tag since" style={vars({ "--at": GOLD_AT })}>
            Answered in minutes, booked
          </span>
        )}
      </div>
    );
  });
}

/* The one window: what a patient meets at the chosen clinic. */
function Brief() {
  return PINS.filter((pin) => pin.chosen).map((pin) => (
    <div
      key={pin.x}
      className={`brief ${only(pin)}`}
      style={vars({ ...spot(pin), "--t0": OPEN.from, "--t1": OPEN.to })}
    >
      <p className="label text-leak">Sample clinic · Illustration</p>
      <p className="brief-title">Patients want this clinic. Here is what they meet.</p>
      <ul>
        {MEETS.map(([what, found], i) => (
          <li key={what} className="row show" style={vars({ "--at": at(385 + i * OPEN.row) })}>
            <span className="mark bad" aria-hidden="true">
              {"✕"}
            </span>
            <span>{what}</span>
            <span className="found">
              <span className="sr-only">problem: </span>
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
        <Scene id="city" length={CITY} label="Dubai tonight">
          <div className="stage" style={vars({ "--cx": 0.72 })}>
            <Poster clip="m" alt="Dubai at night, seen from above, drawn in gold light" eager />
            <Poster clip="m" end alt="" className="fade-in" style={vars({ "--at": at(165), "--over": 0.01 })} />
            <ScrubSequence name="m" count={FRAMES.m} from={at(15)} to={at(180)} />
            <div className="beam" style={vars({ "--b0": SWEEP.b0, "--b1": SWEEP.b1 })} />
            <Shot clip="n" from={at(DIVE.from)} to={at(DIVE.to)} alt="The entrance of a clinic at sunset, its reception glowing inside" />
            <Shot clip="e" from={at(DIVE.to)} to={at(DESK)} alt="Inside: a receptionist giving a patient her full attention while the phone on the desk lights up" />
            <div
              className="absolute inset-0"
              style={vars({
                "--b0": SWEEP.b0,
                "--b1": SWEEP.b1,
                "--f0": FOCUS,
                "--o0": at(DIVE.from - 14),
                "--oo": at(14),
              })}
            >
              <Pins />
            </div>
          </div>
          <div className="scrim" />
          <div className="stage" style={vars({ "--cx": 0.72 })}>
            <Brief />
          </div>
          <div className="stage" style={vars({ "--cx": PHONE.cx })}>
            <Call at={at(DESK + 15)} then={at(DESK + 150)} />
          </div>
          <div className="shade fade-in" style={vars({ "--at": at(CITY - 60), "--over": at(60) })} />
          <div className={TEXT}>
            <div className={`${BLOCK} hide`} style={vars({ "--at": at(172) })}>
              <p className="label text-gold-bright">Sample clinics · Illustration</p>
              <h1 className={`${H} mt-4`}>Somewhere in Dubai tonight, a patient is choosing a clinic.</h1>
              <p className={LEAD}>Your name is on the list.</p>
            </div>
            <div className={`${BLOCK} hide`} style={vars({ "--at": FOCUS })}>
              <div className="show" style={vars({ "--at": at(187) })}>
                <p className="label text-leak">Step 01 · Diagnose</p>
                <h2 className={`${H} mt-4`}>First, we see what your patients see.</h2>
                <p className={LEAD}>
                  Everything a patient can find about a clinic from the outside: how it answers, how
                  it looks on Google and Instagram. What leaks shows up in red.
                </p>
              </div>
            </div>
            <div className={`${BLOCK} wide-only hide`} style={vars({ "--at": OPEN.to })}>
              <div className="show" style={vars({ "--at": FOCUS + 0.004 })}>
                <p className="label text-leak">Step 01 · Diagnose</p>
                <p className="mt-2 text-lg text-foreground">
                  Green clinics answer every patient. This one is losing them.
                </p>
              </div>
            </div>
            <div className={`${BLOCK} hide`} style={vars({ "--at": at(DIVE.to - 30) })}>
              <div className="show" style={vars({ "--at": at(DIVE.from + 12) })}>
                <p className="label text-gold-bright">Sample clinic · Illustration</p>
                <h2 className={`${H} mt-4`}>Then we go inside.</h2>
              </div>
            </div>
            <div className={`${BLOCK} show`} style={vars({ "--at": at(DESK) })}>
              <p className="label text-gold-bright">Sample clinic · 6:48 PM · Illustration</p>
              <h2 className={`${H} mt-4`}>Nobody here is doing anything wrong.</h2>
              <p className={LEAD}>The team is busy with the patient in front of them. Meanwhile:</p>
              <ul className="mt-4 flex flex-col gap-2">
                {INSIDE.map(([leak], i) => (
                  <li key={leak} className="show flex gap-3 text-lg" style={vars({ "--at": at(DESK + 45 + i * 45) })}>
                    <span className="mark bad" aria-hidden="true">{"✕"}</span>
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
            <Shot clip="r" from={0.05} to={0.27} alt="The receptionist stays with her patient and smiles; the phone on the desk goes quiet and the screen turns green" />
            <Shot clip="n" from={0.42} to={0.6} reverse dissolve={0.06} alt="The city again, the chosen clinic turning from red to green" />
            <div className="beam" style={vars({ "--b0": RESWEEP.b0, "--b1": RESWEEP.b1 })} />
            <div
              className="fixing cut absolute inset-0"
              style={vars({
                "--b0": RESWEEP.b0,
                "--b1": RESWEEP.b1,
                "--f0": -1,
                "--i0": 0.6,
                "--io": 0.01,
                "--at": 0.875,
              })}
            >
              <Pins fixing />
            </div>
            <Shot clip="m" from={0.88} to={1} reverse />
          </div>
          <div className="scrim" />
          <div className="stage cut" style={vars({ "--cx": PHONE.cx, "--at": 0.36 })}>
            <Call at={0} then={0.1} answered />
          </div>
          <div className="shade fade-out" style={vars({ "--at": 0, "--over": 0.05 })} />
          <div className={TEXT}>
            <div className={`${BLOCK} hide`} style={vars({ "--at": 0.36 })}>
              <p className="label text-gold-bright">Step 02 · Fix &amp; run · The next evening</p>
              <h2 className={`${H} mt-4`}>Then we fix it, and run it.</h2>
              <p className={LEAD}>Same clinic, same rush. Your clinic&apos;s own voice and number.</p>
              <ul className="mt-4 flex flex-col gap-2">
                {INSIDE.map(([, fixed], i) => (
                  <li key={fixed} className="show flex gap-3 text-lg" style={vars({ "--at": 0.1 + i * 0.045 })}>
                    <span className="mark ok" aria-hidden="true">{"✓"}</span>
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
