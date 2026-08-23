"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const steps = [
  {
    number: "01",
    title: "Find a Ground",
    description:
      "Browse available sports grounds and find a venue that matches your sport, location, date, and requirements.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-7 w-7"
      >
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 5 5" />
        <path d="M8.5 11h5" />
        <path d="M11 8.5v5" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Choose Your Slot",
    description:
      "Open the ground details, check available time slots, select your preferred date and choose the time that works for you.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-7 w-7"
      >
        <rect x="3" y="4" width="18" height="17" rx="3" />
        <path d="M8 2v4M16 2v4M3 9h18" />
        <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Confirm Your Booking",
    description:
      "Review your booking details and total amount before confirming your selected ground and time slot.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-7 w-7"
      >
        <path d="M20 7 10 17l-5-5" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Make Payment",
    description:
      "Complete the payment for your booking. Your booking remains pending until the payment process is successfully completed.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-7 w-7"
      >
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="M3 10h18" />
        <path d="M7 15h3" />
      </svg>
    ),
  },
  {
    number: "05",
    title: "Play & Enjoy",
    description:
      "Once your booking is confirmed, simply arrive at the ground at your scheduled time and enjoy your game.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-7 w-7"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8" />
        <path d="m13 8 4 4-4 4" />
      </svg>
    ),
  },
];

const ownerSteps = [
  {
    number: "01",
    title: "Create Your Ground",
    description:
      "Add your sports ground with its name, location, sport type, pricing, images, and other relevant details.",
  },
  {
    number: "02",
    title: "Manage Availability",
    description:
      "Keep your ground information and availability organized so players can easily find suitable slots.",
  },
  {
    number: "03",
    title: "Receive Bookings",
    description:
      "Players can discover your ground and make bookings through the Maidan platform.",
  },
  {
    number: "04",
    title: "Manage Your Ground",
    description:
      "Use your ground owner dashboard to view bookings, track activity, and manage your grounds.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[#f8fcfa] text-slate-900">
      <Navbar />

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden border-b border-emerald-100">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-emerald-100/50 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-green-100/40 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:px-10 lg:pb-28">
          <div className="mx-auto max-w-4xl text-center">

            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-bold text-emerald-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              SIMPLE. FAST. CONVENIENT.
            </div>

            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              How{" "}
              <span className="text-emerald-600">
                Maidan
              </span>{" "}
              Works
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
              Finding and booking a sports ground shouldn't be complicated.
              Maidan makes the entire process simple — from discovering the
              right ground to getting ready for your game.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/grounds"
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-600
                  px-7
                  py-3.5
                  text-sm
                  font-bold
                  text-white
                  shadow-lg
                  shadow-emerald-600/20
                  transition
                  hover:-translate-y-0.5
                  hover:bg-emerald-700
                "
              >
                Find a Ground
                <span className="ml-2">→</span>
              </Link>

              <Link
                href="/signup"
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-7
                  py-3.5
                  text-sm
                  font-bold
                  text-slate-700
                  shadow-sm
                  transition
                  hover:border-emerald-200
                  hover:bg-emerald-50
                  hover:text-emerald-700
                "
              >
                Create an Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          PLAYER JOURNEY
      ========================================================= */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">

        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-600">
            For Players
          </p>

          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Book your ground in{" "}
            <span className="text-emerald-600">
              five simple steps
            </span>
          </h2>

          <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
            Everything you need to get from searching for a ground to playing
            your game.
          </p>
        </div>


        {/* Steps */}
        <div className="relative">

          {/* Connecting line */}
          <div className="absolute left-[27px] top-8 hidden h-[calc(100%-64px)] w-px bg-gradient-to-b from-emerald-300 via-emerald-200 to-transparent lg:block" />

          <div className="space-y-5">

            {steps.map((step, index) => (
              <div
                key={step.number}
                className="
                  group
                  relative
                  flex
                  flex-col
                  gap-5
                  rounded-2xl
                  border
                  border-slate-200/80
                  bg-white
                  p-5
                  shadow-[0_8px_30px_rgba(15,23,42,0.04)]
                  transition-all
                  hover:-translate-y-1
                  hover:border-emerald-200
                  hover:shadow-[0_15px_40px_rgba(16,185,129,0.10)]
                  sm:flex-row
                  sm:p-6
                  lg:items-center
                  lg:pl-5
                "
              >

                {/* Number */}
                <div className="relative z-10 flex shrink-0 items-center gap-3">

                  <div
                    className="
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-2xl
                      bg-emerald-50
                      text-emerald-600
                      transition
                      group-hover:bg-emerald-600
                      group-hover:text-white
                    "
                  >
                    {step.icon}
                  </div>

                  <span className="text-xs font-black tracking-widest text-emerald-600 sm:hidden">
                    STEP {step.number}
                  </span>

                </div>


                {/* Content */}
                <div className="flex-1">

                  <div className="mb-1 hidden text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400 sm:block">
                    Step {step.number}
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900">
                    {step.title}
                  </h3>

                  <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-500">
                    {step.description}
                  </p>

                </div>


                {/* Step number desktop */}
                <div className="hidden pr-3 text-3xl font-black text-slate-100 sm:block">
                  {step.number}
                </div>

              </div>
            ))}

          </div>
        </div>
      </section>


      {/* =========================================================
          VISUAL FLOW
      ========================================================= */}
      <section className="border-y border-emerald-100 bg-white">

        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">

          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* Left */}
            <div>

              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-600">
                Your Booking Journey
              </p>

              <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                From{" "}
                <span className="text-emerald-600">
                  search
                </span>{" "}
                to game day.
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
                Maidan brings the complete ground booking experience into one
                simple platform. No unnecessary steps. No complicated process.
              </p>

              <div className="mt-8 space-y-4">

                {[
                  ["Search", "Find grounds based on your needs."],
                  ["Select", "Choose your date and available slot."],
                  ["Book", "Review and confirm your booking."],
                  ["Pay", "Complete your payment securely."],
                  ["Play", "Show up and enjoy your game."],
                ].map(([title, description], index) => (
                  <div
                    key={title}
                    className="flex items-start gap-3"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">
                      {index + 1}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        {title}
                      </h3>

                      <p className="mt-0.5 text-xs leading-5 text-slate-500">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}

              </div>
            </div>


            {/* Right visual */}
            <div className="relative">

              <div className="absolute -inset-5 rounded-[2rem] bg-emerald-100/50 blur-2xl" />

              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-[#f8fcfa] p-5 shadow-xl shadow-slate-900/5 sm:p-7">

                {/* Mock app header */}
                <div className="mb-6 flex items-center justify-between">

                  <div>
                    <div className="h-2.5 w-24 rounded-full bg-slate-200" />
                    <div className="mt-2 h-2 w-16 rounded-full bg-slate-100" />
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    ✓
                  </div>

                </div>


                {/* Search box */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >
                        <circle cx="11" cy="11" r="6.5" />
                        <path d="m16 16 5 5" />
                      </svg>
                    </div>

                    <div className="flex-1">
                      <div className="h-2.5 w-32 rounded-full bg-slate-200" />
                      <div className="mt-2 h-2 w-20 rounded-full bg-slate-100" />
                    </div>

                  </div>

                </div>


                {/* Ground cards */}
                <div className="mt-4 grid grid-cols-2 gap-3">

                  {[1, 2].map(item => (
                    <div
                      key={item}
                      className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                    >

                      <div className="h-20 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50" />

                      <div className="mt-3 h-2.5 w-20 rounded-full bg-slate-200" />
                      <div className="mt-2 h-2 w-14 rounded-full bg-slate-100" />

                      <div className="mt-3 flex items-center justify-between">
                        <div className="h-2 w-12 rounded-full bg-emerald-100" />
                        <div className="h-7 w-14 rounded-lg bg-emerald-500" />
                      </div>

                    </div>
                  ))}

                </div>


                {/* Success */}
                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-emerald-600 p-4 text-white shadow-lg shadow-emerald-600/20">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-lg">
                    ✓
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      Booking Confirmed
                    </p>

                    <p className="mt-0.5 text-xs text-emerald-100">
                      You're ready for game day.
                    </p>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================
          GROUND OWNER SECTION
      ========================================================= */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">

        <div className="overflow-hidden rounded-[2rem] bg-slate-950">

          <div className="grid lg:grid-cols-2">

            {/* Intro */}
            <div className="relative overflow-hidden p-7 sm:p-10 lg:p-14">

              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

              <div className="relative">

                <div className="mb-5 inline-flex rounded-full bg-emerald-500/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-400">
                  For Ground Owners
                </div>

                <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Manage your ground.
                  <br />
                  <span className="text-emerald-400">
                    Grow your bookings.
                  </span>
                </h2>

                <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400">
                  Maidan gives ground owners a simple way to showcase their
                  grounds and manage bookings from one place.
                </p>

                <Link
                  href="/signup"
                  className="
                    mt-8
                    inline-flex
                    items-center
                    rounded-xl
                    bg-emerald-500
                    px-6
                    py-3
                    text-sm
                    font-bold
                    text-slate-950
                    transition
                    hover:bg-emerald-400
                  "
                >
                  Get Started
                  <span className="ml-2">→</span>
                </Link>

              </div>
            </div>


            {/* Owner steps */}
            <div className="border-t border-white/10 bg-white/[0.03] p-7 sm:p-10 lg:border-l lg:border-t-0 lg:p-14">

              <div className="space-y-6">

                {ownerSteps.map(step => (
                  <div
                    key={step.number}
                    className="flex gap-4"
                  >

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-xs font-black text-emerald-400">
                      {step.number}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {step.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        {step.description}
                      </p>
                    </div>

                  </div>
                ))}

              </div>

            </div>

          </div>
        </div>
      </section>


      {/* =========================================================
          CTA
      ========================================================= */}
      <section className="border-t border-emerald-100 bg-emerald-50/50">

        <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-2xl text-white shadow-lg shadow-emerald-600/20">
            ⚽
          </div>

          <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Ready to play?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            Find your next ground, choose your slot, and get your game
            underway with Maidan.
          </p>

          <Link
            href="/grounds"
            className="
              mt-8
              inline-flex
              items-center
              rounded-xl
              bg-emerald-600
              px-8
              py-3.5
              text-sm
              font-bold
              text-white
              shadow-lg
              shadow-emerald-600/20
              transition
              hover:-translate-y-0.5
              hover:bg-emerald-700
            "
          >
            Explore Grounds
            <span className="ml-2">→</span>
          </Link>

        </div>

      </section>


      <Footer />
    </main>
  );
}