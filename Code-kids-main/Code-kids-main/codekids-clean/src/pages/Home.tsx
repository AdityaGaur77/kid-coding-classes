import { SiGithub } from "react-icons/si";
import { Trophy, Star, Users, Rocket, Linkedin, Clock, Zap, CalendarDays, Video } from "lucide-react";
import { SignupForm } from "@/components/SignupForm";
import { useState } from "react";



type View = "home" | "schedule" | "portal" | "admin";

interface HomeProps {
  setView: (v: View) => void;
}

function CourseCard({ track }: { track: "pygame" | "ml" }) {
  const isMl = track === "ml";

  const cardTheme = isMl
    ? {
        outer: "bg-blue-50 border-blue-200",
        pill: "bg-blue-100 text-blue-700 border-blue-200",
        title: "text-blue-700",
        button: "bg-blue-600 hover:bg-blue-700 text-white",
        price: "text-blue-600",
        metaPill: "bg-white text-blue-700 border-blue-200",
      }
    : {
        outer: "bg-slate-50 border-slate-200",
        pill: "bg-white text-slate-600 border-slate-200",
        title: "text-slate-950",
        button: "bg-slate-950 hover:bg-slate-800 text-white",
        price: "text-slate-950",
        metaPill: "bg-white text-slate-700 border-slate-200",
      };

  const details = isMl
    ? {
        trackLabel: "ML / AI TRACK",
        title: "Build Intelligent AIs",
        description:
          "Learn decision trees, neural networks, and how LLMs work. Build image classifiers and understand how models are trained for real robotics use cases in class.",
        price: "$25",
        originalPrice: "$55",
        cta: "Enroll in ML / AI →",
        age: "Ages 10+",
        prereq: "Python basics included",
      }
    : {
        trackLabel: "PYGAME TRACK",
        title: "Build Games with Python",
        description:
          "Master variables, loops, graphics, collision, and animation. Ship a completely custom playable game by the end of the track.",
        price: "$25",
        originalPrice: "$45",
        cta: "Enroll in Pygame →",
        age: "Ages 8+",
        prereq: "No experience needed",
      };

  return (
    <div className={`rounded-[28px] border p-6 md:p-8 shadow-sm transition-shadow hover:shadow-md ${cardTheme.outer}`}>
      <div className="flex items-start justify-between gap-6">
        <div>
          <span className={`inline-flex items-center rounded-xl border px-3 py-1.5 text-xs font-bold tracking-wide uppercase ${cardTheme.pill}`}>
            {details.trackLabel}
          </span>
        </div>
<div className="text-right shrink-0">
          <div className="flex items-baseline gap-2 justify-end">
            <span className="text-slate-400 text-xl line-through">{details.originalPrice}</span>
            <span className={`font-serif text-5xl leading-none ${cardTheme.price}`}>{details.price}</span>
          </div>
          <div className="text-slate-500 text-sm mt-1">/ week</div>
        </div>
      </div>

      <h3 className={`mt-5 font-serif text-4xl leading-tight ${cardTheme.title}`}>{details.title}</h3>
      <p className="mt-4 max-w-xl text-slate-600 text-[17px] leading-8">{details.description}</p>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold ${cardTheme.metaPill}`}>
          {details.age}
        </span>
        <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold ${cardTheme.metaPill}`}>
          {details.prereq}
        </span>
        <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold ${cardTheme.metaPill}`}>
          9 live classes
        </span>
      </div>

      <button
        onClick={() => document.getElementById("signup-section")?.scrollIntoView({ behavior: "smooth", block: "start" })}
        className={`mt-7 w-full rounded-2xl px-6 py-4 text-lg font-bold transition-colors ${cardTheme.button}`}
      >
        {details.cta}
      </button>
    </div>
  );
}

function MentorSection() {
  const achievements = [
    { icon: <Trophy className="w-5 h-5" />, color: "text-amber-600 bg-amber-50 border-amber-200", label: "USACO Gold", desc: "Top competitive programming division" },
    { icon: <Star className="w-5 h-5" />, color: "text-blue-600 bg-blue-50 border-blue-200", label: "6+ Hackathon Wins", desc: "Consistent top finishes at major competitions" },
    { icon: <Rocket className="w-5 h-5" />, color: "text-purple-600 bg-purple-50 border-purple-200", label: "NASA Space Apps Winner", desc: "Global award at NASA's largest hackathon" },
    { icon: <Users className="w-5 h-5" />, color: "text-emerald-600 bg-emerald-50 border-emerald-200", label: "50+ Students Taught", desc: "Founding and running a school coding club" },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white border-t border-slate-200">
      <div className="max-w-[1120px] mx-auto px-5">
        <div className="text-xs font-bold tracking-widest uppercase text-blue-600 mb-3">Your Instructor</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          <div>
            <h2 className="font-serif text-4xl sm:text-5xl text-slate-900 leading-tight">
              Meet Aditya Gaur.
            </h2>
            <p className="mt-5 text-slate-600 text-lg leading-relaxed">
              Aditya is a competitive programmer, hackathon veteran, and educator who has helped 50+ students discover their love for code. He believes the best way to learn programming is to build something real.
            </p>
            <p className="mt-4 text-slate-500 leading-relaxed">
              Beyond teaching, Aditya competes at the highest levels of algorithmic programming, builds award-winning projects, and runs a school coding club from the ground up. Every class he teaches is shaped by that same hands-on energy.
            </p>
            <div className="flex gap-3 mt-7">
              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-github"
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors"
              >
                <SiGithub className="w-4 h-4" />
                GitHub
              </a>
              <a
                href="https://linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-linkedin"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.map((a) => (
              <div
                key={a.label}
                data-testid={`achievement-${a.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={`border rounded-2xl p-5 ${a.color}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${a.color}`}>
                  {a.icon}
                </div>
                <div className="font-bold text-base mb-1">{a.label}</div>
                <div className="text-sm opacity-80">{a.desc}</div>
              </div>
            ))}

            <div className="sm:col-span-2 border border-slate-200 bg-white rounded-2xl p-5">
              <div className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-3">Quick Stats</div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="font-serif text-3xl text-slate-900">6+</div>
                  <div className="text-xs text-slate-500 mt-1">Hackathon wins</div>
                </div>
                <div className="border-x border-slate-100">
                  <div className="font-serif text-3xl text-slate-900">50+</div>
                  <div className="text-xs text-slate-500 mt-1">Students taught</div>
                </div>
                <div>
                  <div className="font-serif text-3xl text-slate-900 leading-none">Gold</div>
                  <div className="text-xs text-slate-500 mt-1">USACO division</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QrToggle() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-5">
      <button
        onClick={() => setOpen(!open)}
        className="text-sm font-bold text-blue-600 underline"
      >
        {open ? "Hide payment QR codes" : "Already registered? View payment QR codes"}
      </button>
      {open && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="border border-slate-200 rounded-2xl p-3 bg-white">
            <div className="font-bold text-slate-900 text-sm mb-2">PayPal</div>
            <img src="/paypal.jpeg" alt="PayPal QR code" className="w-full aspect-square object-cover rounded-xl border border-slate-200" />
          </div>
          <div className="border border-slate-200 rounded-2xl p-3 bg-white">
            <div className="font-bold text-slate-900 text-sm mb-2">Zelle</div>
            <img src="/zelle.jpeg" alt="Zelle QR code" className="w-full aspect-square object-cover rounded-xl border border-slate-200" />
          </div>
        </div>
      )}
    </div>
  );
}

export function Home({ setView }: HomeProps) {
  const heroDetails = [
    { icon: <CalendarDays className="w-4 h-4 text-blue-300" />, title: "June 9 – 25", sub: "Batch 1 · Summer 2026" },
    { icon: <Clock className="w-4 h-4 text-blue-300" />, title: "Tue, Wed, Thu", sub: "9 live classes total" },
    { icon: <Video className="w-4 h-4 text-blue-300" />, title: "Live on Zoom", sub: "Recordings included" },
  ];

  return (
    <div>


      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900 text-white">
        <div className="max-w-[1120px] mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start py-20">
            <div className="lg:col-span-5">
              <div className="text-xs font-bold tracking-widest uppercase text-blue-300 mb-4">
                Summer 2026 | Online | Beginner-Friendly
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white leading-tight max-w-2xl">
                Kids build real games and AI projects in live online classes.
              </h1>
        
              <p className="mt-3 text-blue-200 text-sm font-medium">
                Taught by Aditya Gaur — USACO Gold, NASA Space Apps winner, 6+ hackathon wins.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7">
                {heroDetails.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <div className="font-semibold text-white text-sm">{item.title}</div>
                    </div>
                    <div className="text-white/65 text-xs mt-1.5">{item.sub}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 flex-wrap mt-7">
                <button
                  data-testid="btn-register-now"
                  className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-colors"
                  onClick={() => document.getElementById("signup-section")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                >
                  Reserve a Spot
                </button>
                <button
                  data-testid="btn-see-schedule"
                  className="bg-transparent border border-white/25 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors"
                  onClick={() => setView("schedule")}
                >
                  See Full Schedule
                </button>
              </div>
            </div>

            {/* WIDE "At a Glance" Card */}
            <div className="lg:col-span-7">
              <div className="bg-white/10 backdrop-blur-md rounded-[32px] p-5 sm:p-6 md:p-8 text-white border border-white/10 shadow-2xl">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs sm:text-sm font-bold bg-white/20 text-white border border-white/20">
                      At a Glance
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-300 bg-orange-500/20 border border-orange-400/30 rounded-full px-3 py-1">
                      <Zap className="w-3 h-3" />
                      Early bird ends June 1
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/70">
                    <span className="flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5" />
                      9 live classes
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" />
                      3 weeks
                    </span>
                  </div>
                </div>

                <p className="text-white/70 text-sm max-w-2xl leading-relaxed mb-5">
                  Same live format, different project outcome. Pick your track below.
                </p>

                {/* Main Content: Class Cards Side by Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pygame Card */}
                  <div className="rounded-2xl border border-white/15 bg-white/5 p-4 sm:p-5 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wide bg-teal-500/20 text-teal-300 border border-teal-400/30">
                        Pygame
                      </span>
                      <div className="text-right">
                        <div className="flex items-baseline gap-1.5 justify-end">
                          <span className="text-white/40 text-sm line-through">$45</span>
                          <span className="font-bold text-xl sm:text-2xl leading-none text-white">$25</span>
                        </div>
                        <div className="text-white/50 text-[10px]">/ week</div>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg sm:text-xl leading-tight text-white mb-2">
                      Build Games
                    </h3>
                    
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="inline-flex items-center rounded-full border border-teal-400/30 bg-teal-500/10 px-2 py-0.5 text-[10px] font-semibold text-teal-300">
                        Ages 8+
                      </span>
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                        No experience
                      </span>
                    </div>

                    <p className="text-white/60 text-xs sm:text-sm leading-relaxed flex-grow">
                      Learn variables, loops, graphics, animation, and game logic while building a real playable project.
                    </p>
                  </div>

                  {/* ML Card */}
                  <div className="rounded-2xl border border-white/15 bg-white/5 p-4 sm:p-5 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wide bg-blue-500/20 text-blue-300 border border-blue-400/30">
                        ML / AI
                      </span>
                      <div className="text-right">
                        <div className="flex items-baseline gap-1.5 justify-end">
                          <span className="text-white/40 text-sm line-through">$55</span>
                          <span className="font-bold text-xl sm:text-2xl leading-none text-white">$25</span>
                        </div>
                        <div className="text-white/50 text-[10px]">/ week</div>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg sm:text-xl leading-tight text-white mb-2">
                      Build AIs
                    </h3>
                    
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="inline-flex items-center rounded-full border border-blue-400/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                        Ages 10+
                      </span>
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                        Python basics
                      </span>
                    </div>

                    <p className="text-white/60 text-xs sm:text-sm leading-relaxed flex-grow">
                      Learn how image classifiers, neural networks, and modern AI systems work by building a guided robotics-focused classifier project together.
                    </p>
                  </div>
                </div>

                {/* Footer Features */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 pt-4 border-t border-white/10">
                  {[
                    "Live Zoom + recordings",
                    "Student portal access",
                    "PayPal or Zelle",
                    "Beginner-friendly",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-white/50">
                      <div className="w-1 h-1 rounded-full bg-teal-400 shrink-0"></div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Second Batch Notice */}
      <section className="bg-slate-900 text-white py-5 border-t border-white/10">
        <div className="max-w-[1120px] mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="font-bold text-white text-base">Second Batch — July 7 to July 24</div>
              <div className="text-slate-200 text-sm mt-0.5">
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-[1120px] mx-auto px-5">
          <div className="text-xs font-bold tracking-widest uppercase text-blue-600 mb-3">Choose A Track</div>
          <h2 className="font-serif text-4xl text-slate-900 max-w-xl leading-tight">The two options families compare most.</h2>
          <p className="mt-3 text-slate-500 max-w-2xl">
            Both tracks follow the same calendar and live format. The main choice is whether your student wants to build a game or build an AI-powered robotics classifier project.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-7">
            <CourseCard track="pygame" />
            <CourseCard track="ml" />
          </div>
        </div>
      </section>

      <MentorSection />

      <section className="py-16 border-t border-slate-200" id="signup-section">
        <div className="max-w-[1120px] mx-auto px-5 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-xs font-bold tracking-widest uppercase text-blue-600">Signup</div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Early Bird — ends June 1
              </span>
            </div>
            <h2 className="font-serif text-4xl text-slate-900 leading-tight">Register for class.</h2>
            <p className="mt-3 text-slate-500">Submit the form, send payment, and your registration will be activated after payment is confirmed.</p>
            <SignupForm />
          </div>
          <div className="bg-gradient-to-b from-slate-50 to-blue-50 border border-slate-200 rounded-2xl p-8 self-start">
  <h3 className="font-serif text-2xl text-slate-900 mb-5">Registration steps</h3>
  <div className="flex flex-col gap-4">
    {[
      ["1", "Enter parent name, email, student name, track, and any notes."],
      ["2", "After submitting, scan either the PayPal or Zelle QR code to pay."],
      ["3", "Once payment is confirmed, the registration is activated."],
      ["4", "Use that same email to open the student portal for Zoom links and recordings."],
    ].map(([num, text]) => (
      <div key={num} className="flex gap-3 items-start">
        <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{num}</div>
        <p className="text-slate-600 text-sm leading-relaxed">{text}</p>
      </div>
    ))}
  </div>

  <QrToggle />

  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
    Please include the student name in the payment note so the registration can be matched quickly.
  </div>
</div>
        </div>
      </section>

      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-[1120px] mx-auto px-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            ["Live On Zoom", "Students join class from one saved link for the whole track."],
            ["Recordings Included", "Missed classes can be watched later from the portal."],
            ["Resource Library", "Helpful docs, tools, and links live in one place."],
            ["Flexible Payment", "Use simple PayPal or Zelle payment links or QR codes."],
            ["Beginner Friendly", "Designed for curious students who are just getting started."],
            ["Project Based", "Every student ends with something real they built."],
          ].map(([title, copy]) => (
            <div key={title} className="bg-white border border-slate-200 rounded-2xl p-5">
              <h3 className="font-bold text-slate-900">{title}</h3>
              <p className="text-slate-500 mt-2 text-sm">{copy}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
