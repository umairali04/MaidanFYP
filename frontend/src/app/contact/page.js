"use client";

import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Image from "next/image";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    file: null,
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaDone, setCaptchaDone] = useState(false);

  const recaptchaRef = useRef(null);

  // =========================================================
  // KEEPING YOUR EXISTING FUNCTIONALITY
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaDone) {
      alert("Please complete the CAPTCHA first.");
      return;
    }

    setLoading(true);

    const data = new FormData();

    data.append("name", form.name);
    data.append("email", form.email);
    data.append("phone", form.phone);
    data.append("message", form.message);

    if (form.file) {
      data.append("file", form.file);
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: data,
      });

      setLoading(false);

      if (res.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Contact form error:", error);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7fbf9] text-slate-900">
      <Navbar />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden border-b border-emerald-100 bg-white">

        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-emerald-100/60 blur-3xl" />

          <div className="absolute right-0 top-0 h-[420px] w-[420px] rounded-full bg-emerald-50 blur-3xl" />

          <div className="absolute bottom-0 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-green-50 blur-3xl" />
        </div>

        <div
          className="
            relative
            mx-auto
            grid
            max-w-7xl
            grid-cols-1
            items-center
            gap-10
            px-5
            pb-16
            pt-12
            sm:px-8
            sm:pb-20
            sm:pt-16
            lg:grid-cols-2
            lg:gap-16
            lg:px-10
            lg:pb-24
            lg:pt-20
          "
        >

          {/* LEFT */}
          <div className="max-w-2xl">

            <div
              className="
                mb-5
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-emerald-100
                bg-emerald-50
                px-3
                py-1.5
                text-[10px]
                font-extrabold
                uppercase
                tracking-[0.18em]
                text-emerald-700
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Contact Maidan
            </div>

            <h1
              className="
                max-w-xl
                text-4xl
                font-black
                leading-[1.08]
                tracking-tight
                text-slate-950
                sm:text-5xl
                lg:text-[3rem]
              "
            >
              Contact us for any{" "}
              <span className="text-emerald-600">
                inquiries,
                <br className="hidden sm:block" />
                feedback or support
              </span>{" "}
              — we're here to help!
            </h1>

            <p
              className="
                mt-6
                max-w-xl
                text-sm
                leading-7
                text-slate-500
                sm:text-base
              "
            >
              Have questions about bookings, venues, teams, or your account?
              Our support team is ready to help you get the most out of your
              sports experience.
            </p>

            {/* Small contact highlights */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">

              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-3.5
                  shadow-sm
                "
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-50
                    text-lg
                  "
                >
                  💬
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Quick Support
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    We're here to help
                  </p>
                </div>
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-3.5
                  shadow-sm
                "
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-50
                    text-lg
                  "
                >
                  ⚡
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Fast Response
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Within 2 business hours
                  </p>
                </div>
              </div>

            </div>
          </div>


          {/* RIGHT IMAGE */}
          <div className="relative">

            <div
              className="
                absolute
                -inset-5
                rounded-[2rem]
                bg-emerald-100/50
                blur-2xl
              "
            />

            <div
              className="
                relative
                overflow-hidden
                rounded-[2rem]
                border
                border-emerald-100
                bg-white
                p-2
                shadow-[0_25px_70px_rgba(15,23,42,0.10)]
              "
            >

              <div className="relative overflow-hidden rounded-[1.5rem]">

                <img
                  src="/images/meeting2.jpeg"
                  alt="Contact our team"
                  loading="eager"
                  className="
                    h-[300px]
                    w-full
                    object-cover
                    sm:h-[380px]
                    lg:h-[410px]
                  "
                />

                {/* Image overlay */}
                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-slate-950/50
                    via-transparent
                    to-transparent
                  "
                />

                {/* Floating contact card */}
                <div
                  className="
                    absolute
                    bottom-4
                    left-4
                    right-4
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    border-white/60
                    bg-white/95
                    p-3.5
                    shadow-xl
                    backdrop-blur-xl
                    sm:bottom-5
                    sm:left-5
                    sm:right-5
                    sm:p-4
                  "
                >

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-emerald-600
                      text-lg
                      text-white
                      shadow-lg
                      shadow-emerald-600/20
                    "
                  >
                    💬
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs font-extrabold text-slate-900 sm:text-sm">
                      Average Response Time
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">
                      We reply within{" "}
                      <strong className="text-emerald-600">
                        2 business hours
                      </strong>
                    </p>

                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>
      </section>


      {/* =====================================================
          SCHEDULE A MEETING
      ===================================================== */}

      <section className="bg-[#f7fbf9] py-16 sm:py-20 lg:py-24">

        <div
          className="
            mx-auto
            grid
            max-w-7xl
            grid-cols-1
            items-center
            gap-10
            px-5
            sm:px-8
            lg:grid-cols-2
            lg:gap-16
            lg:px-10
          "
        >

          {/* Illustration */}
          <div
            className="
              relative
              overflow-hidden
              rounded-[2rem]
              border
              border-emerald-100
              bg-white
              p-5
              shadow-[0_15px_50px_rgba(15,23,42,0.06)]
              sm:p-8
            "
          >


            <div
              className="
                relative
                flex
                min-h-[260px]
                items-center
                justify-center
                overflow-hidden
                rounded-[1.5rem]
                bg-emerald-50/50
              "
            >
              <Image
                src="/images/meeting1.gif"
                alt="meeting"
                width={350}
                height={350}
                className="
                  h-auto
                  max-h-[300px]
                  w-auto
                  max-w-full
                  object-contain
                "
              />
            </div>

          </div>


          {/* Text */}
          <div className="max-w-xl">

            <div
              className="
                mb-4
                inline-flex
                items-center
                gap-2
                text-[10px]
                font-extrabold
                uppercase
                tracking-[0.18em]
                text-emerald-600
              "
            >
              <span className="h-1.5 w-6 rounded-full bg-emerald-500" />
              Let's Talk
            </div>

            <h2
              className="
                text-3xl
                font-black
                tracking-tight
                text-slate-950
                sm:text-4xl
              "
            >
              Schedule a meeting
              <br />
              <span className="text-emerald-600">
                with us
              </span>
            </h2>

            <p
              className="
                mt-5
                text-sm
                leading-7
                text-slate-500
                sm:text-base
              "
            >
              At Nexvora, we pride ourselves on collaborating with some of
              the most esteemed brands in the industry. We invite you to book
              a meeting with our team to discuss your project.
            </p>

            <a
              href="mailto:contact@maidan.com"
              className="
                mt-7
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-emerald-600
                px-6
                py-3.5
                text-sm
                font-bold
                text-white
                shadow-lg
                shadow-emerald-600/20
                transition-all
                hover:-translate-y-0.5
                hover:bg-emerald-700
              "
            >
              Book a Meeting
              <span>→</span>
            </a>

          </div>

        </div>

        <div id="form" />
      </section>


      {/* =====================================================
          MAP + CONTACT FORM
      ===================================================== */}

      <section className="border-t border-emerald-100 bg-white py-16 sm:py-20 lg:py-24">

        <div
          className="
            mx-auto
            grid
            max-w-7xl
            grid-cols-1
            items-start
            gap-8
            px-5
            sm:px-8
            lg:grid-cols-[0.9fr_1.1fr]
            lg:gap-10
            lg:px-10
          "
        >

          {/* =================================================
              MAP
          ================================================= */}

          <div
            className="
              overflow-hidden
              rounded-[1.75rem]
              border
              border-emerald-100
              bg-white
              p-2
              shadow-[0_15px_50px_rgba(15,23,42,0.07)]
            "
          >

            <div className="overflow-hidden rounded-[1.35rem]">

              <iframe
                src="https://www.google.com/maps?q=Saudi+Pak+Tower+Blue+Area+Islamabad+Pakistan&output=embed"
                width="100%"
                height="480"
                style={{
                  border: 0,
                  display: "block",
                }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Nexvora Location - Perth WA"
                className="
                  h-[350px]
                  w-full
                  sm:h-[430px]
                  lg:h-[500px]
                "
              />

            </div>

          </div>


          {/* =================================================
              FORM
          ================================================= */}

          <div
            className="
              rounded-[1.75rem]
              border
              border-slate-200
              bg-white
              p-5
              shadow-[0_15px_50px_rgba(15,23,42,0.06)]
              sm:p-7
              lg:p-9
            "
          >

            <div className="mb-7">

              <div
                className="
                  mb-3
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-emerald-50
                  px-3
                  py-1.5
                  text-[10px]
                  font-extrabold
                  uppercase
                  tracking-[0.16em]
                  text-emerald-700
                "
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Support
              </div>

              <h2
                className="
                  text-3xl
                  font-black
                  tracking-tight
                  text-slate-950
                  sm:text-4xl
                "
              >
                Get in{" "}
                <span className="text-emerald-600">
                  Touch
                </span>
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                You can reach us anytime via{" "}
                <a
                  href="mailto:sales@nexvora.com"
                  className="
                    font-semibold
                    text-emerald-600
                    transition
                    hover:text-emerald-700
                  "
                >
                  contact@maidan.com
                </a>
              </p>

            </div>


            {/* =================================================
                SUCCESS
            ================================================= */}

            {submitted ? (
              <div
                className="
                  flex
                  min-h-[360px]
                  flex-col
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-emerald-100
                  bg-emerald-50/60
                  px-5
                  text-center
                "
              >

                <div
                  className="
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-emerald-600
                    text-2xl
                    text-white
                    shadow-lg
                    shadow-emerald-600/20
                  "
                >
                  ✓
                </div>

                <h3 className="mt-5 text-xl font-extrabold text-slate-900">
                  Message Sent!
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  We'll get back to you within 1 business day.
                </p>

              </div>
            ) : (

              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5"
              >

                {/* =================================================
                    NAME / EMAIL
                ================================================= */}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  {/* Name */}
                  <div>

                    <label
                      className="
                        mb-2
                        block
                        text-xs
                        font-bold
                        text-slate-700
                      "
                    >
                      Name *
                    </label>

                    <input
                      type="text"
                      placeholder="Your Name"
                      value={form.name}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          name: e.target.value,
                        })
                      }
                      required
                      className="
                        h-11
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        px-4
                        text-sm
                        text-slate-900
                        outline-none
                        transition-all
                        placeholder:text-slate-400
                        focus:border-emerald-400
                        focus:bg-white
                        focus:ring-4
                        focus:ring-emerald-500/10
                      "
                    />

                  </div>


                  {/* Email */}
                  <div>

                    <label
                      className="
                        mb-2
                        block
                        text-xs
                        font-bold
                        text-slate-700
                      "
                    >
                      Email *
                    </label>

                    <input
                      type="email"
                      placeholder="you@company.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          email: e.target.value,
                        })
                      }
                      required
                      className="
                        h-11
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        px-4
                        text-sm
                        text-slate-900
                        outline-none
                        transition-all
                        placeholder:text-slate-400
                        focus:border-emerald-400
                        focus:bg-white
                        focus:ring-4
                        focus:ring-emerald-500/10
                      "
                    />

                  </div>

                </div>


                {/* =================================================
                    PHONE
                ================================================= */}

                <div>

                  <label
                    className="
                      mb-2
                      block
                      text-xs
                      font-bold
                      text-slate-700
                    "
                  >
                    Phone Number *
                  </label>

                  <input
                    type="tel"
                    placeholder="+61 4XX XXX XXX"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value,
                      })
                    }
                    required
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      text-sm
                      text-slate-900
                      outline-none
                      transition-all
                      placeholder:text-slate-400
                      focus:border-emerald-400
                      focus:bg-white
                      focus:ring-4
                      focus:ring-emerald-500/10
                    "
                  />

                </div>


                {/* =================================================
                    MESSAGE
                ================================================= */}

                <div>

                  <label
                    className="
                      mb-2
                      block
                      text-xs
                      font-bold
                      text-slate-700
                    "
                  >
                    How can we help? *
                  </label>

                  <textarea
                    placeholder="Tell us a bit about your project..."
                    value={form.message}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        message: e.target.value,
                      })
                    }
                    required
                    rows={5}
                    className="
                      w-full
                      resize-y
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      py-3
                      text-sm
                      leading-6
                      text-slate-900
                      outline-none
                      transition-all
                      placeholder:text-slate-400
                      focus:border-emerald-400
                      focus:bg-white
                      focus:ring-4
                      focus:ring-emerald-500/10
                    "
                  />

                </div>


                {/* =================================================
                    FILE UPLOAD
                ================================================= */}

                <div>

                  <label
                    className="
                      mb-2
                      block
                      text-xs
                      font-bold
                      text-slate-700
                    "
                  >
                    Attach a File{" "}
                    <span className="font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>

                  <label
                    className={`
                      flex
                      cursor-pointer
                      items-center
                      gap-3
                      rounded-xl
                      border-2
                      border-dashed
                      px-4
                      py-3
                      transition-all

                      ${
                        form.file
                          ? "border-emerald-400 bg-emerald-50/60"
                          : "border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/40"
                      }
                    `}
                  >

                    <span
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-white
                        text-base
                        shadow-sm
                      "
                    >
                      📎
                    </span>

                    <div className="min-w-0 flex-1">

                      {form.file ? (
                        <p className="truncate text-xs font-bold text-emerald-700">
                          {form.file.name}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500">
                          Click to upload — PDF, DOC, PNG, JPG
                        </p>
                      )}

                      <p className="mt-0.5 text-[10px] text-slate-400">
                        Maximum file size: 10MB
                      </p>

                    </div>

                    {form.file && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();

                          setForm({
                            ...form,
                            file: null,
                          });
                        }}
                        className="
                          flex
                          h-7
                          w-7
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          text-slate-400
                          transition
                          hover:bg-red-50
                          hover:text-red-500
                        "
                      >
                        ✕
                      </button>
                    )}

                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xls,.xlsx"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];

                        if (
                          file &&
                          file.size > 10 * 1024 * 1024
                        ) {
                          alert(
                            "File is too large. Max size is 10MB."
                          );

                          return;
                        }

                        setForm({
                          ...form,
                          file: file || null,
                        });
                      }}
                    />

                  </label>

                </div>


                {/* =================================================
                    CAPTCHA
                ================================================= */}

                <div
                  className="
                    overflow-hidden
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    p-3
                  "
                >
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={
                      process.env
                        .NEXT_PUBLIC_RECAPTCHA_SITE_KEY
                    }
                    onChange={(token) =>
                      setCaptchaDone(!!token)
                    }
                    onExpired={() =>
                      setCaptchaDone(false)
                    }
                  />
                </div>


                {/* =================================================
                    SUBMIT
                ================================================= */}

                <button
                  type="submit"
                  disabled={!captchaDone || loading}
                  className={`
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    rounded-xl
                    text-sm
                    font-extrabold
                    transition-all

                    ${
                      captchaDone && !loading
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 hover:bg-emerald-700"
                        : "cursor-not-allowed bg-slate-200 text-slate-400"
                    }
                  `}
                >
                  {loading
                    ? "Sending..."
                    : "Get Started →"}
                </button>


                {/* =================================================
                    ADDRESS
                ================================================= */}

                <div
                  className="
                    flex
                    items-start
                    gap-3
                    rounded-xl
                    border
                    border-slate-100
                    bg-slate-50
                    p-4
                  "
                >

                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-emerald-50
                      text-base
                    "
                  >
                    📍
                  </div>

                  <div>

                    <p className="text-xs font-bold text-slate-700">
                      We are located at:
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Saudi-Pak Towers, 61-A Nazim-ud-din Rd,
                      Block L F 7/4 Blue Area
                      <br />
                      Islamabad, 44000, Pakistan
                    </p>

                  </div>

                </div>

              </form>
            )}

          </div>

        </div>
      </section>


      <Footer />
    </main>
  );
}