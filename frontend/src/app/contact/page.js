'use client'
import { useState, useRef } from 'react'
// import emailjs from '@emailjs/browser'
import ReCAPTCHA from 'react-google-recaptcha'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Image from 'next/image'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', file: null })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [captchaDone, setCaptchaDone] = useState(false)
  const recaptchaRef = useRef(null)

  // ✅ async keyword added — this fixes the error
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!captchaDone) {
      alert('Please complete the CAPTCHA first.')
      return
    }
    setLoading(true)
    const data = new FormData()
    data.append('name', form.name)
    data.append('email', form.email)
    data.append('phone', form.phone)
    data.append('message', form.message)
    if (form.file) data.append('file', form.file)

      const res = await fetch('/api/contact', {
      method: 'POST',
      body: data,   // ⚠️ Do NOT set Content-Type header — browser sets it with boundary automatically
    })

    setLoading(false)
    if (res.ok) setSubmitted(true)
  }

  const inputStyle = {
    width: '100%', padding: '0.8rem 1rem',
    background: '#fff', border: '1px solid #cdd5e0',
    borderRadius: '6px', color: '#111', fontSize: '0.9rem',
    outline: 'none', transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  }

  return (
    <main style={{ background: '#f0f4ff', minHeight: '100vh' }}>
      <Navbar />

      {/* Top Hero Section */}
      <section style={{
        background: '#eef2fb',
        padding: '7rem 2.5rem 4rem',
        borderBottom: '1px solid #dde3f0',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '3rem', alignItems: 'center',
        }}>
          {/* Left — Heading */}
          <div>
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: '700', color: '#111',
              lineHeight: 1.25, marginBottom: '1.2rem',
            }}>
              Contact us for any{' '}
              <span style={{ color: '#3b82f6' }}>inquiries,<br />feedback or support</span>
              {' '}- we're here to help!
            </h1>
            <p style={{ fontSize: '0.95rem', color: '#555', lineHeight: 1.7, maxWidth: '480px' }}>
              Have questions about bookings, venues, teams, or your account? Our support team is ready to help you get the most out of your sports experience.
            </p>
          </div>

          {/* Right — Contact Image */}
<div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
  <div style={{
    position: 'relative',
    borderRadius: '20px',
    overflow: 'hidden',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
  }}>
    <img
      src="/images/meeting2.jpeg"
      alt="Contact our team"
      loading="eager"
      style={{
        width: '100%',
        height: '380px',
        objectFit: 'cover',
        display: 'block',
      }}
    />

    {/* Overlay card — contact info floating on image */}
    <div style={{
      position: 'absolute',
      bottom: '20px', left: '20px', right: '20px',
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      borderRadius: '12px',
      padding: '1.2rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '50%',
        background: '#001E68', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <span style={{ fontSize: '1.2rem' }}>💬</span>
      </div>
      <div>
        <p style={{ fontSize: '0.82rem', fontWeight: '700', color: '#111', marginBottom: '0.15rem' }}>
          Average Response Time
        </p>
        <p style={{ fontSize: '0.78rem', color: '#555' }}>
          We reply within <strong style={{ color: '#001E68' }}>2 business hours</strong>
        </p>
      </div>
    </div>
  </div>
</div>
        </div>
      </section>

      {/* Schedule a Meeting */}
      <section style={{ background: '#eef2fb', padding: '4rem 2.5rem', borderBottom: '1px solid #dde3f0' }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '3rem', alignItems: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px',
            padding: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '260px', border: '1px solid #dde3f0',
          }}>
            <Image src="/images/meeting1.gif" alt="meeting" width={350} height={350} />
          </div>
          {/* Illustration placeholder */}
          {/* <div style={{
            background: '#fff', borderRadius: '16px',
            padding: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '260px', border: '1px solid #dde3f0',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🤝</div>
              <p style={{ color: '#888', fontSize: '0.85rem' }}>Team Meeting Illustration</p>
            </div>
          </div> */}

          {/* Text */}
          <div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontFamily: 'DM Sans, sans-serif', fontWeight: '700', color: '#111', marginBottom: '1rem' }}>
              Schedule a meeting with us
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#555', lineHeight: 1.8, marginBottom: '1.5rem' }}>
              At Nexvora, we pride ourselves on collaborating with some of the most esteemed brands in the industry. We invite you to book a meeting with our team to discuss your project.
            </p>
            <a href="mailto:contact@maidan.com" style={{
              padding: '0.8rem 2rem', background: '#3b82f6', color: '#fff',
              borderRadius: '6px', fontSize: '0.88rem', fontWeight: '600',
              display: 'inline-block', letterSpacing: '0.02em',
            }}>Book a Meeting</a>
          </div>
        </div>
        <div id='form'></div>
      </section>
          
      {/* Map + Form Section */}
      <section  style={{ background: '#eef2fb', padding: '5rem 2.5rem' }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '3rem', alignItems: 'start',
        }}>

          {/* Map — Perth, Australia */}
          <div style={{
            borderRadius: '12px', overflow: 'hidden',
            border: '2px solid #3b82f6',
            boxShadow: '0 4px 24px rgba(59,130,246,0.15)',
            minHeight: '480px',
          }}>
            <iframe
              src="https://www.google.com/maps?q=Saudi+Pak+Tower+Blue+Area+Islamabad+Pakistan&output=embed"
              width="100%"
              height="480"
              style={{ border: 0, display: 'block' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Nexvora Location - Perth WA"
            />
          </div>

          {/* Form */}
          <div style={{
            background: '#fff', borderRadius: '16px',
            padding: '2.5rem', border: '1px solid #dde3f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
          }}>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
              fontFamily: 'DM Sans, sans-serif', fontWeight: '700',
              color: '#111', marginBottom: '0.5rem',
            }}>
              Get in <span style={{ color: '#3b82f6' }}>Touch</span>
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '2rem' }}>
              You can reach us anytime via{' '}
              <a href="mailto:sales@nexvora.com" style={{ color: '#3b82f6' }}>contact@maidan.com</a>
            </p>

            {submitted ? (
              <div style={{
                padding: '2.5rem', background: '#fff', borderRadius: '12px',
                border: '1px solid #dde3f0', textAlign: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#111', marginBottom: '0.5rem' }}>Message Sent!</h3>
                <p style={{ color: '#555', fontSize: '0.9rem' }}>We'll get back to you within 1 business day.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

                {/* Fields */}
                {[
                  { key: 'name', label: 'Name *', type: 'text', placeholder: 'Your Name' },
                  { key: 'email', label: 'Email *', type: 'email', placeholder: 'you@company.com' },
                  { key: 'phone', label: 'Phone Number *', type: 'tel', placeholder: '+61 4XX XXX XXX' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#333', fontWeight: '500', marginBottom: '0.4rem' }}>{field.label}</label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      required
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#3b82f6'}
                      onBlur={e => e.target.style.borderColor = '#cdd5e0'}
                    />
                  </div>
                ))}

                {/* Message */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#333', fontWeight: '500', marginBottom: '0.4rem' }}>How can we help? *</label>
                  <textarea
                    placeholder="Tell us a bit about your project..."
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    required rows={4}
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'DM Sans, sans-serif' }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#cdd5e0'}
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#333', fontWeight: '500', marginBottom: '0.4rem' }}>
                    Attach a File <span style={{ color: '#888', fontWeight: '400' }}>(optional)</span>
                  </label>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    border: `2px dashed ${form.file ? '#3b82f6' : '#cdd5e0'}`,
                    borderRadius: '8px', cursor: 'pointer',
                    background: form.file ? '#eff6ff' : '#fafafa',
                    transition: 'all 0.2s',
                  }}>
                    <span style={{ fontSize: '1.4rem' }}>📎</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {form.file ? (
                        <p style={{ fontSize: '0.82rem', fontWeight: '600', color: '#2563eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {form.file.name}
                        </p>
                      ) : (
                        <p style={{ fontSize: '0.82rem', color: '#777' }}>
                          Click to upload — PDF, DOC, PNG, JPG (max 10MB)
                        </p>
                      )}
                    </div>
                    {form.file && (
                      <button
                        type="button"
                        onClick={e => { e.preventDefault(); setForm({ ...form, file: null }) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#999', flexShrink: 0 }}
                      >✕</button>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xls,.xlsx"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files[0]
                        if (file && file.size > 10 * 1024 * 1024) {
                          alert('File is too large. Max size is 10MB.')
                          return
                        }
                        setForm({ ...form, file: file || null })
                      }}
                    />
                  </label>
                </div>

                {/* reCAPTCHA */}
                <div>
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}  
                    onChange={(token) => setCaptchaDone(!!token)}
                    onExpired={() => setCaptchaDone(false)}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!captchaDone || loading}
                  style={{
                    width: '100%', padding: '0.9rem',
                    background: captchaDone && !loading ? '#3b82f6' : '#93c5fd',
                    color: '#fff', border: 'none', borderRadius: '6px',
                    fontSize: '0.95rem', fontWeight: '600',
                    cursor: captchaDone && !loading ? 'pointer' : 'not-allowed',
                    letterSpacing: '0.02em', transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { if (captchaDone && !loading) e.target.style.background = '#2563eb' }}
                  onMouseLeave={e => { if (captchaDone && !loading) e.target.style.background = '#3b82f6' }}
                >
                  {loading ? 'Sending...' : 'Get Started'}
                </button>

                {/* Address */}
                <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'flex-start', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>📍</span>
                  <div>
                    <p style={{ fontSize: '0.82rem', fontWeight: '600', color: '#333', marginBottom: '0.2rem' }}>We are located at:</p>
                    <p style={{ fontSize: '0.82rem', color: '#555', lineHeight: 1.6 }}>
                      Saudi-Pak Towers, 61-A Nazim-ud-din Rd, Block L F 7/4 Blue Area<br />
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
  )
}