
import dotenv from "dotenv";

dotenv.config();

async function sendBrevoEmail({
  to,
  subject,
  htmlContent,
  textContent,
  replyTo,
  attachments = [],
}) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.EMAIL_USER;

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  if (!senderEmail) {
    throw new Error("EMAIL_USER is not configured");
  }

  const payload = {
    sender: {
      name: "Maidaan",
      email: senderEmail,
    },
    to: [{ email: to }],
    subject,
    htmlContent,
    textContent,
  };

  if (replyTo) {
    payload.replyTo = { email: replyTo };
  }

  if (attachments.length > 0) {
    payload.attachment = attachments;
  }

  const response = await fetch(
    "https://api.brevo.com/v3/smtp/email",
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `Brevo API error (${response.status}): ${responseText}`
    );
  }

  return responseText ? JSON.parse(responseText) : null;
}

// Signup email verification OTP
export async function sendOTPEmail(to, otp) {
  return sendBrevoEmail({
    to,
    subject: "Verify your Maidaan email",
    textContent: `Your verification code is ${otp}. This code will expire in 10 minutes.`,
    htmlContent: `
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1>${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
    `,
  });
}

// Booking confirmation email
export async function sendBookingConfirmationEmail(to, booking) {
  return sendBrevoEmail({
    to,
    subject: `Booking Confirmed at ${booking.ground.name} — ${booking.startTime} to ${booking.endTime}`,
    textContent: `Booking Confirmed!

Ground: ${booking.ground.name}
Date: ${booking.bookingDate.toDateString()}
Slot: ${booking.startTime} - ${booking.endTime}
Amount Paid: PKR ${booking.payment.amount}
Match Code: ${booking.matchCode}

Show this code at the ground as proof of booking.`,
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
        <h2 style="color: #16a34a;">Booking Confirmed ✅</h2>
        <p>Your slot at <strong>${booking.ground.name}</strong> on
        <strong>${booking.bookingDate.toDateString()}</strong>,
        <strong>${booking.startTime} - ${booking.endTime}</strong>,
        has been booked successfully.</p>
        <p>Show this code at the ground as proof of booking:</p>
        <div style="background: #f0fdf4; border: 2px dashed #16a34a;
          padding: 16px; text-align: center; margin: 16px 0;">
          <h1 style="letter-spacing: 2px; color: #15803d; margin: 0;">
            ${booking.matchCode}
          </h1>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td><strong>Ground:</strong></td><td>${booking.ground.name}</td></tr>
          <tr><td><strong>Date:</strong></td><td>${booking.bookingDate.toDateString()}</td></tr>
          <tr><td><strong>Slot:</strong></td><td>${booking.startTime} - ${booking.endTime}</td></tr>
          <tr><td><strong>Amount Paid:</strong></td><td>PKR ${booking.payment.amount}</td></tr>
        </table>
      </div>
    `,
  });
}

// Match invitation email
export async function sendMatchInviteEmail(to, playerName, booking) {
  return sendBrevoEmail({
    to,
    subject: `Match Invite: ${booking.ground.name} — ${booking.startTime} to ${booking.endTime}`,
    textContent: `Hi ${playerName},

You've been invited to a match at ${booking.ground.name} on
${booking.bookingDate.toDateString()}, ${booking.startTime} - ${booking.endTime}.

Match Code: ${booking.matchCode}

Show this code at the ground as proof of your slot booking.`,
    htmlContent: `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
        <h2 style="color: #16a34a;">Match Invitation 🎾</h2>
        <p>Hi ${playerName}, you've been added to a match at
        <strong>${booking.ground.name}</strong> on
        <strong>${booking.bookingDate.toDateString()}</strong>,
        <strong>${booking.startTime} - ${booking.endTime}</strong>.</p>
        <p>Show this code at the ground as proof of your slot booking:</p>
        <div style="background: #f0fdf4; border: 2px dashed #16a34a;
          padding: 16px; text-align: center; margin: 16px 0;">
          <h1 style="letter-spacing: 2px; color: #15803d; margin: 0;">
            ${booking.matchCode}
          </h1>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td><strong>Ground:</strong></td><td>${booking.ground.name}</td></tr>
          <tr><td><strong>Date:</strong></td><td>${booking.bookingDate.toDateString()}</td></tr>
          <tr><td><strong>Slot:</strong></td><td>${booking.startTime} - ${booking.endTime}</td></tr>
        </table>
      </div>
    `,
  });
}

// Contact form email
export async function sendContactEmail({
  name,
  email,
  phone,
  message,
  file,
}) {
  const attachments = file?.buffer
    ? [
        {
          name: file.originalname || "attachment",
          content: file.buffer.toString("base64"),
        },
      ]
    : [];

  return sendBrevoEmail({
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: `New Contact Form Message from ${name}`,
    textContent: `New contact form submission

Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto;">
        <h2 style="color: #16a34a;">New Contact Form Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <h3>Message</h3>
        <p style="white-space: pre-wrap; background: #f8fafc;
          padding: 15px; border-radius: 8px;">${message}</p>
      </div>
    `,
    attachments,
  });
}
