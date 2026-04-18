export default function Footer() {
  return (
    <footer className="bg-[#0f0f0f] text-white pt-16 pb-8 px-5">
      <div className="max-w-6xl mx-auto">

        {/* Top Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div>
            <h3 className="text-[#00ff88] text-2xl font-bold mb-3">Maidan</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Pakistan's easiest way to find and book sports grounds near you.
            </p>
            <div className="flex gap-3 mt-5">
              {/* Facebook */}
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#00ff88]/20 flex items-center justify-center transition-colors">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className="text-gray-300">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#00ff88]/20 flex items-center justify-center transition-colors">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-300">
                  <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                </svg>
              </a>
              {/* Twitter/X */}
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#00ff88]/20 flex items-center justify-center transition-colors">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className="text-gray-300">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-widest">Quick Links</h4>
            <ul className="flex flex-col gap-2.5">
              {['Home', 'Explore Grounds', 'How It Works', 'Pricing'].map(link => (
                <li key={link}>
                  <a href="#" className="text-gray-400 text-sm hover:text-[#00ff88] transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sports */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-widest">Sports</h4>
            <ul className="flex flex-col gap-2.5">
              {['Football', 'Cricket', 'Tennis', 'Badminton', 'Hockey'].map(sport => (
                <li key={sport}>
                  <a href="#" className="text-gray-400 text-sm hover:text-[#00ff88] transition-colors">
                    {sport}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-widest">Contact</h4>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2 text-gray-400 text-sm">
                <span className="mt-0.5">📍</span>
                <span>Blue Area, Islamabad, Pakistan</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <span>📧</span>
                <a href="mailto:support@maidan.pk" className="hover:text-[#00ff88] transition-colors">
                  support@maidan.pk
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <span>📞</span>
                <a href="tel:+923001234567" className="hover:text-[#00ff88] transition-colors">
                  +92 300 1234567
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Maidan. All rights reserved.
          </p>
          <div className="flex gap-5">
            <a href="#" className="text-gray-500 text-xs hover:text-[#00ff88] transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-500 text-xs hover:text-[#00ff88] transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  )
}