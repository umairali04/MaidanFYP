import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOTPEmail(to, otp) {
  await transporter.sendMail({
    from: `"Ground Booking" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify your email",
    html: `
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1>${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
    `,
  });
}

// Sent to the organizer right after payment confirmation
export async function sendBookingConfirmationEmail(to, booking) {
  await transporter.sendMail({
    from: `"Maidan" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Booking Confirmed at ${booking.ground.name} — ${booking.startTime} to ${booking.endTime}`,
    text: `Booking Confirmed!\n\nGround: ${booking.ground.name}\nDate: ${booking.bookingDate.toDateString()}\nSlot: ${booking.startTime} - ${booking.endTime}\nAmount Paid: PKR ${booking.payment.amount}\nMatch Code: ${booking.matchCode}\n\nShow this code at the ground as proof of booking.`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
        <h2 style="color: #16a34a;">Booking Confirmed ✅</h2>
        <p>Your slot at <strong>${booking.ground.name}</strong> on <strong>${booking.bookingDate.toDateString()}</strong>, <strong>${booking.startTime} - ${booking.endTime}</strong>, has been booked successfully.</p>
        <p>Show this code at the ground as proof of booking:</p>
        <div style="background: #f0fdf4; border: 2px dashed #16a34a; padding: 16px; text-align: center; margin: 16px 0;">
          <h1 style="letter-spacing: 2px; color: #15803d; margin: 0;">${booking.matchCode}</h1>
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

// Sent to each invited player once they're added to the match
export async function sendMatchInviteEmail(to, playerName, booking) {
  await transporter.sendMail({
    from: `"Maidan" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Match Invite: ${booking.ground.name} — ${booking.startTime} to ${booking.endTime}`,
    text: `Hi ${playerName},\n\nYou've been invited to a match at ${booking.ground.name} on ${booking.bookingDate.toDateString()}, ${booking.startTime} - ${booking.endTime}.\n\nMatch Code: ${booking.matchCode}\n\nShow this code at the ground as proof of your slot booking.`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
        <h2 style="color: #16a34a;">Match Invitation 🎾</h2>
        <p>Hi ${playerName}, you've been added to a match at <strong>${booking.ground.name}</strong> on <strong>${booking.bookingDate.toDateString()}</strong>, <strong>${booking.startTime} - ${booking.endTime}</strong>.</p>
        <p>Show this code at the ground as proof of your slot booking:</p>
        <div style="background: #f0fdf4; border: 2px dashed #16a34a; padding: 16px; text-align: center; margin: 16px 0;">
          <h1 style="letter-spacing: 2px; color: #15803d; margin: 0;">${booking.matchCode}</h1>
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

export async function sendContactEmail({
  name,
  email,
  phone,
  message,
  file,
}) {
  await transporter.sendMail({
    from: `"Maidan Website" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: `New Contact Form Message from ${name}`,

    text: `
New contact form submission

Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}
    `,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto;">
        <h2 style="color: #16a34a;">New Contact Form Message</h2>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; font-weight: bold;">Name</td>
            <td style="padding: 8px;">${name}</td>
          </tr>

          <tr>
            <td style="padding: 8px; font-weight: bold;">Email</td>
            <td style="padding: 8px;">${email}</td>
          </tr>

          <tr>
            <td style="padding: 8px; font-weight: bold;">Phone</td>
            <td style="padding: 8px;">${phone}</td>
          </tr>
        </table>

        <hr style="margin: 20px 0;" />

        <h3>Message</h3>

        <p style="
          white-space: pre-wrap;
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
        ">
          ${message}
        </p>
      </div>
    `,

    attachments: file
      ? [
          {
            filename: file.originalname,
            content: file.buffer,
            contentType: file.mimetype,
          },
        ]
      : [],
  });
}