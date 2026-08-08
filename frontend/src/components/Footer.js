export default function Footer() {
  return (
    <footer className="bg-[#0f0f0f] text-white py-10 px-5">
      <div className="max-w-7xl mx-auto">

        {/* Top */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-8">

          {/* Brand */}
          <div>
            <h3 className="text-3xl font-bold text-emerald-400 mb-3">
              Maidan
            </h3>

            <p className="text-gray-400 text-sm leading-6 max-w-xs">
              Pakistan's easiest way to discover and book sports grounds.
              Play football, cricket, tennis, badminton and much more.
            </p>

            <div className="flex items-center gap-3 mt-5">

              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 transition-all duration-300"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 transition-all duration-300"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 transition-all duration-300"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">
              Quick Links
            </h4>

            <ul className="space-y-2">
              {[
                "Home",
                "Explore Grounds",
                "Sports",
                "How It Works",
                "Pricing",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sports */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">
              Sports
            </h4>

            <ul className="space-y-2">
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
                    className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
                  >
                    {sport}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">
              Contact
            </h4>

            <div className="space-y-3">

              <div className="flex items-start gap-3">
                <span className="text-emerald-400">📍</span>
                <p className="text-gray-400 text-sm">
                  Islamabad, Pakistan
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-emerald-400">📧</span>
                <a
                  href="mailto:support@maidan.pk"
                  className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
                >
                  support@maidan.pk
                </a>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-emerald-400">📞</span>
                <a
                  href="tel:+923001234567"
                  className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
                >
                  +92 300 1234567
                </a>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-5 flex flex-col md:flex-row items-center justify-between gap-4">

          <p className="text-gray-500 text-sm text-center md:text-left">
            © {new Date().getFullYear()} Maidan. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-sm">
            <a
              href="#"
              className="text-gray-500 hover:text-emerald-400 transition-colors"
            >
              Privacy Policy
            </a>

            <a
              href="#"
              className="text-gray-500 hover:text-emerald-400 transition-colors"
            >
              Terms & Conditions
            </a>

            <a
              href="#"
              className="text-gray-500 hover:text-emerald-400 transition-colors"
            >
              Support
            </a>
          </div>

        </div>

      </div>
    </footer>
  )
}