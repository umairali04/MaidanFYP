import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#071a13] text-white">

      {/* =====================================================
          BACKGROUND DECORATION
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="absolute bottom-0 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-green-500/5 blur-3xl" />
      </div>


      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

        {/* ===================================================
            MAIN FOOTER
        =================================================== */}

        <div className="grid grid-cols-1 gap-7 py-7 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.1fr] lg:gap-8 lg:py-9">


          {/* =================================================
              BRAND
          ================================================= */}

          <div>

            <Link
              href="/"
              className="inline-flex items-center"
            >
              <img
                src="/Maidaan-logo-white.png"
                alt="Maidan"
                className="h-9 w-28 object-contain object-left"
              />
            </Link>

            <p
              className="
                mt-3
                max-w-sm
                text-sm
                leading-6
                text-slate-400
              "
            >
              Pakistan's easiest way to discover and book sports grounds.
              Play football, cricket, tennis, badminton and much more.
            </p>


            {/* Brand badge */}
            <div
              className="
                mt-4
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-white/10
                bg-white/[0.04]
                px-3
                py-2
              "
            >
              <span
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-lg
                  bg-emerald-500
                  text-xs
                  font-black
                  text-[#06130e]
                "
              >
                M
              </span>

              <span className="text-xs font-semibold text-slate-300">
                Built for the love of sport
              </span>
            </div>

          </div>


          {/* =================================================
              QUICK LINKS
          ================================================= */}

          {/* =================================================
    QUICK LINKS
================================================= */}

<div>

  <h4
    className="
      mb-3
      text-xs
      font-extrabold
      uppercase
      tracking-[0.16em]
      text-white
    "
  >
    Quick Links
  </h4>

  <ul className="space-y-2">

    {[
      {
        name: "Home",
        href: "/",
      },
      {
        name: "Explore Grounds",
        href: "/grounds",
      },
      {
        name: "How It Works",
        href: "/how-it-works",
      },
      {
        name: "Contact Us",
        href: "/contact",
      },
    ].map((item) => (
      <li key={item.name}>

        <Link
          href={item.href}
          className="
            group
            inline-flex
            items-center
            gap-2
            text-sm
            text-slate-400
            transition-colors
            hover:text-emerald-400
          "
        >

          <span
            className="
              h-1
              w-1
              rounded-full
              bg-slate-600
              transition-all
              group-hover:w-2
              group-hover:bg-emerald-400
            "
          />

          {item.name}

        </Link>

      </li>
    ))}

  </ul>

</div>


          {/* =================================================
              SPORTS
          ================================================= */}

          <div>

            <h4
              className="
                mb-5
                text-xs
                font-extrabold
                uppercase
                tracking-[0.16em]
                text-white
              "
            >
              Sports
            </h4>

            <ul className="space-y-3">

              {[
                "Football",
                "Cricket",
                "Padel",
                "Badminton",
                "Basketball",
                "Tennis",
              ].map((sport) => (
                <li key={sport}>

                  <a
                    href="#"
                    className="
                      group
                      inline-flex
                      items-center
                      gap-2
                      text-sm
                      text-slate-400
                      transition-colors
                      hover:text-emerald-400
                    "
                  >
                    <span
                      className="
                        h-1
                        w-1
                        rounded-full
                        bg-slate-600
                        transition-all
                        group-hover:w-2
                        group-hover:bg-emerald-400
                      "
                    />

                    {sport}
                  </a>

                </li>
              ))}

            </ul>

          </div>


          {/* =================================================
              CONTACT
          ================================================= */}

          <div>

            <h4
              className="
                mb-5
                text-xs
                font-extrabold
                uppercase
                tracking-[0.16em]
                text-white
              "
            >
              Contact
            </h4>

            <div className="space-y-2.5">


              {/* Location */}
              <div className="flex items-start gap-3">

                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-emerald-400/10
                    bg-emerald-400/10
                    text-sm
                  "
                >
                  📍
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-300">
                    Location
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    Islamabad, Pakistan
                  </p>
                </div>

              </div>


              {/* Email */}
              <div className="flex items-start gap-3">

                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-emerald-400/10
                    bg-emerald-400/10
                    text-sm
                  "
                >
                  ✉
                </div>

                <div className="min-w-0">

                  <p className="text-xs font-semibold text-slate-300">
                    Email
                  </p>

                  <a
                    href="mailto:contact@maidan.pk"
                    className="
                      mt-0.5
                      block
                      truncate
                      text-xs
                      leading-5
                      text-slate-500
                      transition
                      hover:text-emerald-400
                    "
                  >
                    contact@maidan.com
                  </a>

                </div>

              </div>


              {/* Phone */}
              <div className="flex items-start gap-3">

                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-emerald-400/10
                    bg-emerald-400/10
                    text-sm
                  "
                >
                  ☎
                </div>

                <div>

                  <p className="text-xs font-semibold text-slate-300">
                    Phone
                  </p>

                  <a
                    href="tel:+923001234567"
                    className="
                      mt-0.5
                      block
                      text-xs
                      leading-5
                      text-slate-500
                      transition
                      hover:text-emerald-400
                    "
                  >
                    +92 300 1234567
                  </a>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* ===================================================
            BOTTOM
        =================================================== */}

        <div
          className="
            flex
            flex-col
            gap-5
            border-t
            border-white/10
            py-4
            md:flex-row
            md:items-center
            md:justify-between
          "
        >

          {/* Copyright */}
          <p className="text-center text-xs text-slate-500 md:text-left">
            © {new Date().getFullYear()} Maidan. All rights reserved.
          </p>


          {/* Bottom links */}
          <div
            className="
              flex
              flex-wrap
              items-center
              justify-center
              gap-x-6
              gap-y-2
              text-xs
              md:justify-end
            "
          >

            <a
              href="#"
              className="
                text-slate-500
                transition
                hover:text-emerald-400
              "
            >
              Privacy Policy
            </a>

            <a
              href="#"
              className="
                text-slate-500
                transition
                hover:text-emerald-400
              "
            >
              Terms & Conditions
            </a>

            <a
              href="#"
              className="
                text-slate-500
                transition
                hover:text-emerald-400
              "
            >
              Support
            </a>

          </div>

        </div>

      </div>
    </footer>
  );
}