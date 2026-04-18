const features = [
  {
    icon: "⚡",
    title: "Instant Booking",
    desc: "Reserve your ground in seconds. No calls, no waiting — just pick a slot and play.",
  },
  {
    icon: "📍",
    title: "Nearby Grounds",
    desc: "Discover top-rated sports grounds closest to your location in real time.",
  },
  {
    icon: "💳",
    title: "Secure Payments",
    desc: "Pay safely with multiple options. Every transaction is encrypted and protected.",
  },
  {
    icon: "🏆",
    title: "Verified Venues",
    desc: "Every ground is manually reviewed and verified for quality and safety.",
  },
]

export default function ChooseUs() {
  return (
    <section
      className="relative py-20 px-5 bg-cover bg-center bg-fixed text-center"
      style={{ backgroundImage: "/images/stadium_img.jpeg" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/80" />

      {/* Content */}
      <div className="relative z-10">

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-[#00cc6a] text-sm font-semibold tracking-widest uppercase">
            Why Maidan?
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#111] mt-2">
            Everything you need to play
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mt-3">
            We make it ridiculously easy to find, book, and enjoy your game.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="group bg-white border border-gray-100 hover:border-[#00cc6a]/40 rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-lg"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-[#00ff88]/15 flex items-center justify-center text-2xl mb-5 group-hover:bg-[#00ff88]/30 transition-colors duration-300">
                {icon}
              </div>

              {/* Text */}
              <h3 className="text-[#111] font-semibold text-base mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>

              {/* Bottom accent */}
              <div className="mt-5 h-0.5 w-8 bg-[#00cc6a]/40 group-hover:w-full transition-all duration-500 rounded-full" />
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}