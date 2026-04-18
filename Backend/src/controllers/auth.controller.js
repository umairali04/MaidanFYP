import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";
import { generateOTP } from "../utils/otp.js";
import { sendOTPEmail } from "../utils/mailer.js";

// ============================================
// SIGNUP
// ============================================
export const signup = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const allowedRoles = ["PLAYER", "GROUND_OWNER"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be PLAYER or GROUND_OWNER" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password:   hashedPassword,
        phone:      phone || null,
        role:       role  || "PLAYER",
        isVerified: false,
      },
    });

    const otp = generateOTP();

    await prisma.emailVerification.create({
      data: {
        userId:    user.id,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendOTPEmail(email, otp);

    return res.status(201).json({
      message: "Signup successful. Please verify your email.",
      userId:  user.id,
      role:    user.role,
    });

  } catch (error) {
    console.error("SIGNUP ERROR 👉", error);
    return res.status(500).json({ message: error.message });
  }
};

// ============================================
// VERIFY OTP
// ============================================
export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: "userId and otp are required" });
    }

    // Find latest OTP for this user
    const record = await prisma.emailVerification.findFirst({
      where:   { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return res.status(400).json({ message: "No OTP found. Please signup again." });
    }

    // Check expiry
    if (new Date() > record.expiresAt) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Check OTP match
    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    // Mark user as verified
    await prisma.user.update({
      where: { id: userId },
      data:  { isVerified: true },
    });

    // Delete used OTP
    await prisma.emailVerification.delete({ where: { id: record.id } });

    return res.status(200).json({
      message: "Email verified successfully. You can now login.",
    });

  } catch (error) {
    console.error("VERIFY OTP ERROR 👉", error);
    return res.status(500).json({ message: error.message });
  }
};

// ============================================
// LOGIN
// ============================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check verified
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Email not verified. Please verify your email first.",
        userId:  user.id,
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        image: user.image,
        phone: user.phone,
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR 👉", error);
    return res.status(500).json({ message: error.message });
  }
};

// ============================================
// RESEND OTP
// ============================================
export const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    // Delete old OTPs
    await prisma.emailVerification.deleteMany({ where: { userId } });

    // Generate and save new OTP
    const otp = generateOTP();

    await prisma.emailVerification.create({
      data: {
        userId,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendOTPEmail(user.email, otp);

    return res.status(200).json({ message: "New OTP sent to your email." });

  } catch (error) {
    console.error("RESEND OTP ERROR 👉", error);
    return res.status(500).json({ message: error.message });
  }
};

// ============================================
// Forget password
// ============================================

export const forgotPassword = async (req, res) => {
  try {
    
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old reset OTPs
    await prisma.passwordReset.deleteMany({ where: { userId: user.id } });

    // Generate OTP
    const otp = generateOTP();

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendOTPEmail(email, otp);

    return res.status(200).json({
      message: "OTP sent to your email",
      userId: user.id,
    });

  } catch (error) {
    console.error("FORGOT PASSWORD ERROR 👉", error);
    return res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;

    if (!userId || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const record = await prisma.passwordReset.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return res.status(400).json({ message: "No OTP found" });
    }

    if (new Date() > record.expiresAt) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Delete used OTP
    await prisma.passwordReset.delete({ where: { id: record.id } });

    return res.status(200).json({
      message: "Password reset successful",
    });

  } catch (error) {
    console.error("RESET PASSWORD ERROR 👉", error);
    return res.status(500).json({ message: error.message });
  }
};