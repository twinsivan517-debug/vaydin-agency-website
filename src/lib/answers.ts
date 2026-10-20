/* The questions she answers when asked: draft 3 of 2026-10-17, the figures
   verified by the clinic-growth-bot house that day and the owner's word to
   speak them aloud. A question that matches none of these is handed to
   WhatsApp. No em dashes: the house's style lock for anything a client reads. */

import type { Line } from "./pitch.ts";

export type Answer = {
  id: string;
  short: string;
  question: string;
  answer: string;
  /* A recording she already has for the same words, instead of a-<id>.mp3. */
  voice?: string;
  keywords: string[];
  link: { href: string; label: string };
};

export const ANSWERS: Answer[] = [
  {
    id: "price",
    short: "Price",
    question: "How much does it cost?",
    answer: "Every clinic gets its own plan, and every plan starts with the measurement. Message us on WhatsApp and a person sends yours.",
    keywords: ["price", "prices", "cost", "costs", "how much", "fee", "fees", "charge", "charges", "pricing", "plan", "plans", "expensive", "cheap", "budget", "aed", "dirham", "dirhams", "dollar", "dollars", "pay", "payment", "monthly", "retainer", "install", "free", "trial", "free trial", "free audit", "audit free", "discount", "discounts", "special offer", "founding offer", "any offer", "promo", "promotion", "founding", "refund", "refunds", "quote", "invoice", "vat"],
    link: { href: "/pricing.html", label: "Ask for your plan" },
  },
  {
    id: "diagnostic",
    short: "The diagnostic",
    question: "What is the diagnostic?",
    answer:
      "Every thirty to sixty days a real person messages your clinic on WhatsApp like a new patient. Between shops we read your Google profile and rivals weekly, your Instagram and website monthly. Six rooms, one score, a report every month, and what to fix first.",
    keywords: ["diagnostic", "diagnose", "intelligence", "mystery", "shop", "shopper", "shopping", "audit", "measure", "measured", "measurement", "score", "scored", "scores", "test", "assessment", "report", "first step", "step one", "layer one", "layer 1"],
    link: { href: "/diagnose.html", label: "How the diagnostic works" },
  },
  {
    id: "engine",
    short: "The engine",
    question: "What is the engine?",
    answer:
      "Seven parts: intake, booking, consult conversion, show-up, dormant recovery, cross-sell and a dashboard, plus your estate: Google profile managed, every review answered within a day, Instagram and email on the same intake, website changes within two days. On your own number, your reception approving with a tap.",
    keywords: ["engine", "fix", "run", "operate", "operated", "answer", "answered", "answers", "reply", "replies", "respond", "whatsapp", "booking", "bookings", "book", "reminder", "reminders", "reception", "front door", "no show", "no shows", "revive", "follow up", "estate", "layer two", "layer 2", "dashboard"],
    link: { href: "/fix.html", label: "What the engine runs" },
  },
  {
    id: "bot",
    short: "Is it a bot?",
    question: "Is it a bot?",
    answer: "The shopper is a person, never a bot. In the engine, AI drafts and a person approves; your reception confirms every booking with a tap.",
    keywords: ["ai", "bot", "bots", "robot", "chatbot", "automated", "automatic", "automation", "human", "real person", "people", "machine"],
    link: { href: "/engine.html", label: "Inside the engine" },
  },
  {
    id: "time",
    short: "How long",
    question: "How long does it take?",
    answer: "Your first report comes after the first shop, then monthly. The Engine runs on a three-month minimum, hands-on for the first thirty days.",
    keywords: ["how long", "time", "days", "weeks", "months", "fast", "quick", "soon", "duration", "when", "setup", "set up", "onboarding", "timeline", "first report"],
    link: { href: "/fix.html", label: "The first thirty days" },
  },
  {
    id: "where",
    short: "Where",
    question: "Where are you?",
    answer: "Dubai. A Dubai free-zone company licensed under IFZA, working with clinics in Dubai and the GCC.",
    keywords: ["where", "location", "located", "based", "dubai", "office", "uae", "emirates", "gcc", "mena", "address", "country", "city", "abu dhabi", "riyadh", "saudi", "qatar", "kuwait", "bahrain", "oman"],
    link: { href: "mailto:hello@vaydin.agency", label: "hello@vaydin.agency" },
  },
  {
    id: "who",
    short: "Who it's for",
    question: "Who is this for?",
    answer: "Owner-led aesthetic and wellness clinics, one branch or many.",
    keywords: ["clinic", "clinics", "owner", "owners", "manager", "dermatology", "dermatologist", "aesthetic", "aesthetics", "wellness", "plastic", "surgery", "spa", "doctor", "doctors", "medspa", "who is it for", "who is this for", "who do you work with", "what clinics", "which clinics", "what kind of clinic", "for clinics", "is this for me", "is it for me"],
    link: { href: "/diagnose.html", label: "Start with the diagnostic" },
  },
  {
    id: "ads",
    short: "Ads & Instagram",
    question: "Do you run ads?",
    answer:
      "Growth runs only on a running Engine, never on its own. Paid demand, and reels, statics and stories to a brief. No AI patients and no before-and-afters, ever.",
    keywords: ["ads", "ad", "advertising", "campaign", "campaigns", "instagram", "social", "social media", "marketing", "google ads", "meta", "paid", "reels", "followers", "grow", "growth", "leads", "lead", "content"],
    link: { href: "/grow.html", label: "Growth once the engine runs" },
  },
  {
    id: "proof",
    short: "Proof",
    question: "How do I know it works?",
    answer:
      "Evidence a patient could find themselves: Google, reviews, Instagram, the website, how you answered. Scored and explained, every month. The next shop scores us too.",
    keywords: ["proof", "prove", "results", "result", "guarantee", "guaranteed", "roi", "works", "working", "evidence", "numbers", "track", "tracking", "kpi", "measure", "does it work", "will it work", "work for us", "work for my clinic"],
    link: { href: "/engine.html", label: "Inside the engine" },
  },
  {
    id: "need",
    short: "What you need",
    question: "What do you need from us?",
    answer:
      "For the diagnostic, nothing: it is unannounced. For the Engine, access to your Google profile, Instagram, website and WhatsApp number, which stays yours, and one kickoff call on day one.",
    keywords: ["need", "needs", "require", "required", "access", "password", "passwords", "data", "give", "provide", "from us", "from me", "kickoff"],
    link: { href: "/fix.html", label: "What the engine runs" },
  },
  {
    id: "branches",
    short: "Many branches",
    question: "One branch or many?",
    answer: "Both. Intelligence runs per location, and the Engine runs every branch. Your plan is built for your group: ask us on WhatsApp and a person sends it.",
    keywords: ["branch", "branches", "location", "locations", "multiple", "chain", "several", "two", "three", "group", "sites", "extra", "clinic group"],
    link: { href: "/pricing.html", label: "Ask for your plan" },
  },
  {
    id: "contact",
    short: "Start",
    question: "How do I start?",
    answer: "WhatsApp us, or write to hello at vaydin dot agency. Your plan arrives on WhatsApp, no forms.",
    keywords: ["start", "begin", "contact", "talk", "call", "phone", "email", "reach", "number", "meeting", "demo", "sign up", "signup", "apply", "join", "get started", "book a call", "connect with you", "talk to your team", "connect to you", "where to start"],
    link: { href: "/pricing.html", label: "Ask for your plan" },
  },
  {
    id: "cancel",
    short: "Cancelling",
    question: "Can I cancel?",
    answer: "Intelligence is month to month with thirty days' notice. The Engine has a three-month minimum.",
    keywords: ["cancel", "cancellation", "stop", "quit", "leave", "notice", "contract", "commitment", "minimum", "lock in", "locked", "term", "terms"],
    link: { href: "/pricing.html", label: "Ask for your plan" },
  },
  {
    id: "clients",
    short: "Your clients",
    question: "Who are your clients?",
    answer: "The first cohort is forming now. We name nobody, and we invent nothing.",
    keywords: ["client", "clients", "customers", "customer", "references", "reference", "case study", "case studies", "testimonial", "testimonials", "who else", "portfolio", "worked with", "examples", "have you worked"],
    link: { href: "/engine.html", label: "How we are measured" },
  },
  {
    id: "chatgpt",
    short: "Why not ChatGPT",
    question: "Why not just use ChatGPT?",
    answer: "It only sees inside your clinic. We measure how you look from outside, every month, and we are accountable for it.",
    keywords: ["chatgpt", "gpt", "openai", "ai tools", "myself", "do it myself", "ourselves", "in house", "cheaper", "why not", "twenty dollars", "subscription", "difference"],
    link: { href: "/diagnose.html", label: "What we measure" },
  },
  {
    id: "what",
    short: "What we do",
    question: "What do you do?",
    answer: "Vaydin is a Dubai company for aesthetic and wellness clinics. We measure how your clinic looks to a new patient, then run its front door for you: WhatsApp, Google, reviews, Instagram and the website.",
    voice: "/voice/w1.mp3",
    keywords: ["what is vaydin", "what does vaydin do", "what do you do", "what do you offer", "what services", "services", "about vaydin", "what is this", "how does it work", "how do you work", "how it works", "explain", "tell me about vaydin", "tell me more about vaydin", "more about vaydin", "more information about vaydin", "tell me more about you"],
    link: { href: "/diagnose.html", label: "Start with the diagnostic" },
  },
  {
    id: "unannounced",
    short: "Will staff know?",
    question: "Will my staff know they're being shopped?",
    answer: "No. The shop is unannounced, on a day nobody in the clinic can predict, so we meet your clinic the way a new patient does.",
    keywords: ["staff know", "team know", "they know", "will they know", "know it's you", "know its you", "announced", "shop announced", "unannounced", "tell my staff", "tell the clinic", "tell my team", "clinic know", "know when", "undercover shopper", "shopper undercover", "warn", "warned", "get warned", "warning", "undercover", "secret", "told the date", "staff find out", "employees find out", "team find out"],
    link: { href: "/diagnose.html", label: "How the shop works" },
  },
  {
    id: "often",
    short: "How often",
    question: "Is one shop every 30 to 60 days enough?",
    answer: "Between shops we keep reading: your Google profile and your rivals every week, your Instagram and website every month. And every new shop has the last one to beat.",
    keywords: ["enough", "one shop", "only one", "single shop", "single test", "how often", "how frequently", "frequency", "too few", "once a month", "every week", "too rare", "sample size", "shop us every", "shop a month"],
    link: { href: "/diagnose.html", label: "How the shop works" },
  },
  {
    id: "sample",
    short: "Sample report",
    question: "Can I see a sample report?",
    answer: "The diagnostic page shows a sample monthly verdict for a fictional clinic. Your own report carries your own evidence, redrawn from your own shop.",
    keywords: ["sample", "sample report", "example report", "examples of", "see the report", "see a report", "report look like", "look like", "preview", "demo report", "example of", "monthly report"],
    link: { href: "/diagnose.html", label: "See the sample report" },
  },
  {
    id: "rooms",
    short: "What we measure",
    question: "What do you measure?",
    answer: "Six rooms: first response, the booking push, follow-through, your Google and Instagram front door, reviews and reputation, and the website reality. One score across all six.",
    keywords: ["six rooms", "rooms", "room", "dimensions", "dimension", "six dimensions", "what do you measure", "what do you check", "what do you score", "score us on", "criteria", "categories", "what do you look at", "what do you test", "do you score", "do you measure", "do you check"],
    link: { href: "/diagnose.html", label: "The six rooms" },
  },
  {
    id: "rivals",
    short: "Your rivals",
    question: "Do you watch my competitors?",
    answer: "Yes. We read your rivals every week, and your report shows how you sit against the three clinics beside you on the map, and how the winning clinic handles the same moment.",
    keywords: ["competitor", "competitors", "competition", "rival", "rivals", "benchmark", "benchmarks", "benchmarking", "compare", "comparison", "watch my", "watch competitors", "watch rivals", "spy", "rival price", "track rivals", "compare us", "beside us", "near us on the map"],
    link: { href: "/diagnose.html", label: "What we measure" },
  },
  {
    id: "alone",
    short: "Just the diagnostic",
    question: "Can I just do the diagnostic?",
    answer: "The diagnostic runs on its own, month to month, with no commitment beyond it: its findings either earn the next step or they don't.",
    keywords: ["do the diagnostic", "just the diagnostic", "only the diagnostic", "diagnostic only", "have to buy", "buy the engine", "without the engine", "on its own", "start small", "just intelligence", "only intelligence", "obligation", "need the engine", "buy the diagnostic", "only buy", "compulsory", "mandatory", "try only", "mystery shop first"],
    link: { href: "/diagnose.html", label: "Start with the diagnostic" },
  },
  {
    id: "legit",
    short: "Real company?",
    question: "Is Vaydin a real company?",
    answer: "Vaydin is a Dubai free-zone company, licensed under IFZA, based in Dubai Silicon Oasis.",
    keywords: ["legit", "legitimate", "real company", "scam", "scammer", "fraud", "licensed", "license", "licence", "registered", "registered in", "registration", "trade license", "trust you", "trustworthy", "ifza", "free zone", "fake company", "real business", "company real"],
    link: { href: "/terms/", label: "Our terms" },
  },
  {
    id: "privacy",
    short: "Patient data",
    question: "Is our patient data safe?",
    answer: "Your patient records stay in your own system: we never import them.",
    keywords: ["privacy", "private", "secure", "security", "patient data", "patient records", "records", "medical records", "our data", "my data", "data safe", "data stored", "pdpl", "hipaa", "gdpr", "hipaa compliant", "pdpl compliant", "stored", "storage", "encrypted", "encryption", "data protection", "data kept", "is the data", "patient information"],
    link: { href: "/privacy/", label: "Privacy policy" },
  },
  {
    id: "compliance",
    short: "Ad rules",
    question: "Are your ads DHA compliant?",
    answer: "We never show AI patients or before-and-afters, ever. For the permit and the rules on your ads, a person answers on WhatsApp.",
    keywords: ["dha", "doh", "mohap", "moh", "dhcc", "regulation", "regulations", "advertising rules", "rules", "permit", "permits", "ad permit", "approval", "compliance", "dha compliant", "ads compliant", "dha approved", "before and after", "before after", "before and afters", "law", "laws", "advertising law", "medical advertising", "approved by", "by dha", "advertising permit"],
    link: { href: "/grow.html", label: "Growth once the engine runs" },
  },
  {
    id: "markup",
    short: "Ad spend",
    question: "Do you mark up ad spend?",
    answer: "Your ad accounts and their billing stay yours: spend is paid direct, never marked up. Our own fee comes in your plan, which a person sends on WhatsApp.",
    keywords: ["mark up", "markup", "marked up", "ad spend", "spend", "spending", "ad budget", "ads budget", "media budget", "pay meta", "pay google", "paid direct", "pays for the ads", "pay for the ads", "who pays", "ad account", "ad accounts", "own ad account", "billing"],
    link: { href: "/grow.html", label: "Growth once the engine runs" },
  },
  {
    id: "brief",
    short: "What the shop asks",
    question: "Can I choose what you test?",
    answer: "We message you as a patient, evening, weekend or mid-day, and ask what real patients ask: the treatment, the price, the availability.",
    keywords: ["choose what", "what you test", "which treatment", "which treatments", "brief the shopper", "brief", "pick the treatment", "customise", "customize", "what do you ask", "what questions", "which service", "service to test", "shopper ask", "do you ask about", "shopper ask about"],
    link: { href: "/diagnose.html", label: "How the shop works" },
  },
  {
    id: "you",
    short: "Are you AI?",
    question: "Who are you?",
    answer: "My voice and look are made with AI, but my answers are written by Vaydin and fixed: I'm not a chatbot. Anything I can't answer, a person answers on WhatsApp.",
    keywords: ["who are you", "are you real", "are you a real", "are you a person", "are you human", "are you a human", "are you ai", "are you a bot", "are you a robot", "your name", "what's your name", "whats your name", "what are you", "talking to a bot", "talking to a person", "talking to a real", "who am i talking"],
    link: { href: "/pricing.html", label: "Ask a person on WhatsApp" },
  },
  {
    id: "scope",
    short: "Other clinics",
    question: "Do you work with dental clinics?",
    answer: "We started with aesthetic and wellness clinics, and the diagnostic works for any clinic patients message: dental, dermatology, hair or physio.",
    keywords: ["dental", "dentist", "dentists", "dentistry", "orthodontist", "hair transplant", "physio", "physiotherapy", "ivf", "fertility", "vet", "veterinary", "hospital", "hospitals", "pharmacy", "polyclinic", "salon", "salons", "gym", "fitness", "barber", "dental clinic", "hair transplant clinic", "physiotherapy clinic", "physio clinic", "ivf clinic", "fertility clinic", "vet clinic"],
    link: { href: "/pricing.html", label: "Ask a person on WhatsApp" },
  },
  {
    id: "slots",
    short: "Real appointments?",
    question: "Does the shopper book a real appointment?",
    answer: "The shop happens on WhatsApp. We never hold a real appointment, so no real patient loses a slot.",
    keywords: ["fake appointment", "fake booking", "fake bookings", "real appointment", "waste", "wasted", "our slots", "waste a slot", "block a slot", "no show on purpose", "in person", "visit in person", "walk in", "come to the clinic", "visit the clinic", "physically", "come in", "come by", "real slot", "real booking"],
    link: { href: "/diagnose.html", label: "How the shop works" },
  },
  {
    id: "lawful",
    short: "Is it legal?",
    question: "Is mystery shopping legal here?",
    answer: "The shop sees only what any patient can see: we message you on WhatsApp, the way the public does.",
    keywords: ["legal", "lawful", "illegal", "allowed", "ethical", "ethics", "record", "recording", "recorded", "mystery shopping legal", "is it legal"],
    link: { href: "mailto:hello@vaydin.agency", label: "hello@vaydin.agency" },
  },
  {
    id: "team",
    short: "Who's behind it",
    question: "Who is behind Vaydin?",
    answer: "Vaydin is run by a team in Dubai. For more, message us on WhatsApp or write to hello at vaydin dot agency.",
    keywords: ["behind", "who is behind", "people behind", "founder", "founders", "founded", "ceo", "the team", "account manager", "manage my account", "day to day", "point of contact", "outsourced", "outsource", "who runs vaydin", "who owns vaydin", "owner of vaydin"],
    link: { href: "mailto:hello@vaydin.agency", label: "hello@vaydin.agency" },
  },
  {
    id: "patient",
    short: "Booking a treatment",
    question: "I want to book a treatment",
    answer: "We're not a clinic: we work with clinics. To book a treatment or ask its price, please contact your clinic directly.",
    keywords: ["book me", "i want to book", "appointment for me", "how much is botox", "consultation for me", "have a slot", "for botox", "for filler", "for fillers", "botox price", "filler price", "can i get an appointment", "i want an appointment", "i need an appointment", "much is botox", "much is filler", "much is lip", "i want botox", "i want filler", "i want lip", "want to book", "my lips", "price of botox", "price for botox", "cost of botox", "botox cost", "slot for hydrafacial"],
    link: { href: "mailto:hello@vaydin.agency", label: "hello@vaydin.agency" },
  },
  {
    id: "medical",
    short: "Medical advice",
    question: "Can you give me medical advice?",
    answer: "I can't give medical advice. Please ask a licensed doctor; your clinic can help.",
    keywords: ["side effects", "safe for me", "pregnant", "breastfeeding", "my skin", "my face", "am i a candidate", "downtime", "does it hurt", "allergic", "allergy", "pregnancy", "safe during", "give me medical advice", "me medical advice", "symptoms", "should i get botox", "should i get filler", "is it safe for me"],
    link: { href: "/terms/", label: "Our terms" },
  },
  {
    id: "rate",
    short: "Best clinic?",
    question: "Which clinic is best?",
    answer: "We don't rate clinics for the public. We measure them for their owners, and we name nobody.",
    keywords: ["best clinic", "recommend a clinic", "recommend a doctor", "can you recommend", "which clinic", "good clinic", "top clinic", "best doctor"],
    link: { href: "/diagnose.html", label: "What we measure" },
  },
  {
    id: "jobs",
    short: "Jobs",
    question: "Are you hiring?",
    answer: "Thank you for thinking of us. Send your details to hello at vaydin dot agency.",
    keywords: ["hiring", "are you hiring", "a job", "jobs", "job opening", "job vacancy", "career", "careers", "vacancy", "vacancies", "cv", "resume", "internship", "intern", "work for you", "work at vaydin", "join your team", "join your", "become a mystery shopper", "be a mystery shopper", "mystery shopper job", "apply for"],
    link: { href: "mailto:hello@vaydin.agency", label: "hello@vaydin.agency" },
  },
  {
    id: "write",
    short: "Partners and press",
    question: "Partners, press and investors",
    answer: "Write to hello at vaydin dot agency with what you have in mind.",
    keywords: ["partnership", "partnerships", "partner with", "partner up", "partners", "collaborate", "collaboration", "reseller", "resell", "white label", "affiliate", "referral", "commission", "vendor", "supplier", "sponsor", "sponsorship", "resell this", "i sell", "journalist", "journalists", "reporter", "reporters", "editor", "press", "press release", "interview", "article", "podcast", "media inquiry", "magazine", "writing about", "an article", "writing an article", "investor", "investors", "want to invest", "invest in vaydin", "invest in you", "invest in your company", "funding", "fundraising", "raising", "equity", "valuation"],
    link: { href: "mailto:hello@vaydin.agency", label: "hello@vaydin.agency" },
  },
  {
    id: "business",
    short: "Other businesses",
    question: "Do you work with other businesses?",
    answer: "Vaydin works with clinics. For another kind of business, ask us on WhatsApp and a person answers.",
    keywords: ["restaurant", "restaurants", "real estate", "hotel", "hotels", "retail", "ecommerce", "e commerce", "law firm", "school", "car dealer", "a hotel"],
    link: { href: "/pricing.html", label: "Ask a person on WhatsApp" },
  },
  {
    id: "tech",
    short: "Which AI",
    question: "Which AI do you use?",
    answer: "We keep the machinery private. What you get is the evidence, scored and explained every month.",
    keywords: ["which model", "what model", "built on chatgpt", "built on gpt", "which ai", "what ai", "claude", "gemini", "llm", "tech stack", "built with", "built on", "source code"],
    link: { href: "/diagnose.html", label: "What we measure" },
  },
  {
    id: "legal",
    short: "Legal advice",
    question: "Can you give legal advice?",
    answer: "I can't give legal or regulatory advice for your clinic; your licensing authority or adviser can.",
    keywords: ["do i need a permit", "my licence", "my license", "legal advice", "regulatory advice", "clinic licence", "clinic license"],
    link: { href: "/terms/", label: "Our terms" },
  },
  {
    id: "askus",
    short: "Ask a person",
    question: "Rivals and competitors",
    answer: "Ask us on WhatsApp; a person answers that one.",
    keywords: ["exclusive", "exclusivity", "next door", "same area", "my area", "near me", "work with my competitor", "work with competitors", "other clinics near", "other clinics in", "per area", "nearby", "sign my competitor", "take my competitor", "same street", "close to", "close to mine", "shop my competitor", "shop a competitor", "shop competitors", "spy on", "spy on the", "shop the clinic next door"],
    link: { href: "/pricing.html", label: "Ask a person on WhatsApp" },
  },
  {
    id: "delete",
    short: "Delete my data",
    question: "Delete my data",
    answer: "Email hello at vaydin dot agency with the subject Data Deletion Request, and include the phone or email we know you by.",
    keywords: ["delete my data", "data deletion", "remove my data", "delete my number", "remove my number", "stop messaging me", "unsubscribe", "opt out"],
    link: { href: "/data-deletion/", label: "Data deletion" },
  },
];

export const answer = (id: string) => ANSWERS.find((a) => a.id === id)!;

/* An answer as a spoken line. */
export const answerLine = (a: Answer): Line => ({ id: `a-${a.id}`, text: a.answer, audio: a.voice ?? `/voice/a-${a.id}.mp3` });

export const CHOOSE: Line = { id: "x-choose", text: "Did you mean one of these?", audio: "/voice/x-choose.mp3" };
export const UNKNOWN: Line = {
  id: "x-unknown",
  text: "I don't have that one yet. Try a chapter, or ask us on WhatsApp; a person answers.",
  audio: "/voice/x-unknown.mp3",
};
export const HELLO: Line = { id: "x-hello", text: "Hi. Tap a chapter, or ask me anything about Vaydin.", audio: "/voice/x-hello.mp3" };
