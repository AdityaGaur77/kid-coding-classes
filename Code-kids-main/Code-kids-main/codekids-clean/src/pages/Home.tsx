import { SiGithub } from "react-icons/si";
import { Trophy, Star, Users, Rocket, Linkedin, Clock, CalendarDays, Video } from "lucide-react";
import { SignupForm } from "@/components/SignupForm";



type View = "home" | "schedule" | "portal" | "admin";

interface HomeProps {
  setView: (v: View) => void;
}

function ClosedCard({ track }: { track: "pygame" | "ml" }) {
  const isMl = track === "ml";
  const details = isMl
    ? { label: "AI Track", title: "AI + Image Recognition" }
    : { label: "Python Track", title: "Games with Python" };

  return (
    <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 md:p-8 shadow-sm flex flex-col">
      <div className="flex items-start justify-between gap-6">
        <span className="inline-flex items-center rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-bold tracking-wide uppercase text-amber-700">
          {details.label}
        </span>
        <span className="inline-flex items-center rounded-xl border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-bold tracking-wide uppercase text-amber-800">
          Registration Closed
        </span>
      </div>

      <h3 className="mt-5 font-serif text-4xl leading-tight text-slate-950">{details.title}</h3>
      <p className="mt-4 max-w-xl text-slate-600 text-[17px] leading-8">
        Registration for this batch is now closed. {details.title} might return in July for a second
        batch — it's not confirmed yet, so join the waitlist below to be notified if it does.
      </p>

      <div className="mt-auto flex items-center gap-2 pt-7 text-amber-700 font-bold">
        <Clock className="w-5 h-5" />
        Might return July 2026
      </div>
    </div>
  );
}

function MentorSection() {
  const achievements = [
    { icon: <Trophy className="w-5 h-5" />, color: "text-amber-600 bg-amber-50 border-amber-200", label: "USACO Gold", desc: "Top competitive programming division" },
    { icon: <Star className="w-5 h-5" />, color: "text-blue-600 bg-blue-50 border-blue-200", label: "6+ Hackathon Wins", desc: "Consistent top finishes at major competitions" },
    { icon: <Rocket className="w-5 h-5" />, color: "text-purple-600 bg-purple-50 border-purple-200", label: "NASA Space Apps Winner", desc: "Global award at NASA's largest hackathon" },
    { icon: <Users className="w-5 h-5" />, color: "text-emerald-600 bg-emerald-50 border-emerald-200", label: "80+ Students Taught", desc: "Founding and running a school coding club" },
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
                href="https://github.com/AdityaGaur77"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-github"
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors"
              >
                <SiGithub className="w-4 h-4" />
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/aditya-gaur-b42a46392/"
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

export function Home({ setView }: HomeProps) {
  const heroDetails = [
    { icon: <CalendarDays className="w-4 h-4 text-blue-300" />, title: "June 2 – 25", sub: "Summer 2026" },
    { icon: <Clock className="w-4 h-4 text-blue-300" />, title: "Tue, Wed, Thu", sub: "6 classes per track" },
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
                  Join July Waitlist
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

            {/* At a Glance — registration status */}
            <div className="lg:col-span-7">
              <div className="bg-white/10 backdrop-blur-md rounded-[32px] p-6 sm:p-8 text-white border border-white/10 shadow-2xl">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wide bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    Registration Closed
                  </span>
                </div>

                <h2 className="mt-4 font-serif text-2xl sm:text-3xl leading-tight text-white">
                  Both summer tracks are full.
                </h2>

                <p className="mt-3 text-white/70 text-sm sm:text-base leading-relaxed max-w-xl">
                  Games with Python and AI + Image Recognition might return in July for a second
                  batch — it's not confirmed yet. Join the waitlist below and you'll be the first to
                  hear if they do.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80">
                    Games with Python
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80">
                    AI + Image Recognition
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-200">
                    <Clock className="w-3.5 h-3.5" />
                    Might return July 2026
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="max-w-[1120px] mx-auto px-5">
          <div className="text-center mb-8">
            <div className="text-xs font-bold tracking-widest uppercase text-blue-600 mb-2">What Students Are Saying</div>
            <h2 className="font-serif text-3xl sm:text-4xl text-slate-900">Real feedback from real kids</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* 5 stars */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-600 leading-relaxed mb-4">
                "I was actually able to build things with results in just 2 weeks! All the help and external resources were also fantastic!"
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm">A</div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Arshi</div>
                  <div className="text-slate-500 text-xs">Chicago, IL</div>
                </div>
              </div>
            </div>

            {/* 4.5 stars */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(4)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <div className="relative inline-block w-4 h-4">
                  <Star className="w-4 h-4 fill-amber-200 text-amber-200" />
                  <div className="absolute inset-0 overflow-hidden w-1/2">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed mb-4">
                "The AI class was so cool! I also loved how I could transition from his beginner classes to his advanced ones easily!"
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">A</div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Anya</div>
                  <div className="text-slate-500 text-xs">North Carolina</div>
                </div>
              </div>
            </div>

            {/* 4 stars */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(4)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <Star className="w-4 h-4 fill-amber-200 text-amber-200" />
              </div>
              <p className="text-slate-600 leading-relaxed mb-4">
                "Really fun and I actually learned stuff. Aditya is a great teacher. Sometimes I wanted to go faster, but overall super worth it!"
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">T</div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Trisha</div>
                  <div className="text-slate-500 text-xs">Fremont, CA</div>
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
              <div className="font-bold text-white text-base">Both Tracks — A July Batch Might Happen</div>
              <div className="text-slate-200 text-sm mt-0.5">
                Registration for the current batch is closed for both classes. A second batch in July is possible but not confirmed — join the waitlist to be notified.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-[1120px] mx-auto px-5">
          <div className="text-xs font-bold tracking-widest uppercase text-blue-600 mb-3">The Tracks</div>
          <h2 className="font-serif text-4xl text-slate-900 max-w-xl leading-tight">Two summer tracks, both currently full.</h2>
          <p className="mt-3 text-slate-500 max-w-2xl">
            Registration for both Games with Python and AI + Image Recognition is closed. A second batch in July is possible but not yet confirmed — join the waitlist if you'd like to be notified.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-7">
            <ClosedCard track="pygame" />
            <ClosedCard track="ml" />
          </div>
        </div>
      </section>

      <MentorSection />

      <section className="py-16 border-t border-slate-200" id="signup-section">
        <div className="max-w-[1120px] mx-auto px-5 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-xs font-bold tracking-widest uppercase text-blue-600">Waitlist</div>
            </div>
            <h2 className="font-serif text-4xl text-slate-900 leading-tight">Join the July waitlist.</h2>
            <p className="mt-3 text-slate-500">Registration for both summer tracks is closed. A July batch is possible but not confirmed — add your details below and you'll get an email if a batch is scheduled.</p>
            <SignupForm />
          </div>
          <div className="bg-gradient-to-b from-slate-50 to-blue-50 border border-slate-200 rounded-2xl p-8 self-start">
  <h3 className="font-serif text-2xl text-slate-900 mb-5">How the waitlist works</h3>
  <div className="flex flex-col gap-4">
    {[
      ["1", "Enter parent name, email, student name, preferred track, and any notes."],
      ["2", "No payment is needed yet — the waitlist is just to gauge interest."],
      ["3", "If a July batch is confirmed, you'll get an email with dates and payment details."],
      ["4", "Spots will be offered to waitlisted families first, in order."],
    ].map(([num, text]) => (
      <div key={num} className="flex gap-3 items-start">
        <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{num}</div>
        <p className="text-slate-600 text-sm leading-relaxed">{text}</p>
      </div>
    ))}
  </div>

  <div className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
    A July batch is not yet confirmed. Joining the waitlist helps decide whether to run one.
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
            ["Project Based", "Every student builds a real project to show off at the showcase."],
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
