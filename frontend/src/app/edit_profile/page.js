"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const SPORT_OPTIONS = [
  "CRICKET",
  "FOOTBALL",
  "HOCKEY",
  "BADMINTON",
  "TENNIS",
  "SQUASH",
];

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    preferredSports: [],
  });

  const [currentImage, setCurrentImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Change Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ==========================================
  // GET TOKEN
  // ==========================================

  function getToken() {
    return document.cookie
      .split("; ")
      .find((r) => r.startsWith("token="))
      ?.split("=")[1];
  }

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setForm({
            name: d.user.name || "",
            phone: d.user.phone || "",
            city: d.user.city || "",
            preferredSports: d.user.preferredSports || [],
          });

          setCurrentImage(d.user.image || "");
        }
      })
      .catch(() => {
        setError("Failed to load profile.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  // ==========================================
  // PROCESS IMAGE
  // ==========================================

  function processImage(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }

    setError("");
    setSuccess(false);

    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
  }

  // ==========================================
  // NORMAL FILE SELECT
  // ==========================================

  function handleImageChange(e) {
    const file = e.target.files?.[0];

    if (file) {
      processImage(file);
    }
  }

  // ==========================================
  // DRAG & DROP
  // ==========================================

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();

    setDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();

    setDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    setDragging(false);

    const file = e.dataTransfer.files?.[0];

    if (file) {
      processImage(file);
    }
  }

  // ==========================================
  // TOGGLE PREFERRED SPORT
  // ==========================================

  function toggleSport(sport) {
    setForm((prev) => {
      const hasSport = prev.preferredSports.includes(sport);

      return {
        ...prev,
        preferredSports: hasSport
          ? prev.preferredSports.filter((s) => s !== sport)
          : [...prev.preferredSports, sport],
      };
    });

    setSuccess(false);
    setError("");
  }

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  async function handleChangePassword(e) {
    e.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from your current password.");
      return;
    }

    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setChangingPassword(true);

      const res = await fetch(`${BASE_URL}/api/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to change password.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordSuccess("Password changed successfully!");
    } catch (err) {
      setPasswordError(err.message || "Something went wrong.");
    } finally {
      setChangingPassword(false);
    }
  }

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  async function handleSave(e) {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess(false);

    const token = getToken();

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("name", form.name.trim());
      formData.append("phone", form.phone.trim());
      formData.append("city", form.city.trim());

      formData.append(
        "preferredSports",
        JSON.stringify(form.preferredSports)
      );

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(`${BASE_URL}/api/auth/update-profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }

      if (data.user?.image) {
        setCurrentImage(data.user.image);
      }

      setImageFile(null);
      setPreview("");

      document.cookie = `name=${encodeURIComponent(form.name.trim())}; path=/`;

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-slate-50 px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-slate-200 bg-white p-16 shadow-sm">
              <div className="flex justify-center">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 px-4 py-8 font-sans sm:px-6 sm:py-12">
        <div className="mx-auto w-full max-w-3xl">

          {/* BACK */}
          <button onClick={() => router.back()} className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900">
            <span className="text-lg">←</span>
            Back
          </button>

          {/* PAGE HEADER */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21H3v-3.5L16.732 3.732z" />
                </svg>
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Profile Settings
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your personal information and account security.
                </p>
              </div>
            </div>
          </div>

          {/* ==========================================
              PROFILE CARD
          ========================================== */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">

            {/* CARD HEADER */}
            <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
              <h2 className="text-lg font-bold text-slate-900">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Update your profile details and preferences.
              </p>
            </div>

            {/* PROFILE CONTENT */}
            <div className="px-6 py-7 sm:px-8">

              {/* PROFILE IMAGE */}
              <div className="mb-8 flex flex-col gap-5 rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:flex-row sm:items-center">
                
                <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`relative flex h-28 w-28 shrink-0 cursor-pointer items-center justify-center self-center overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-md transition-all sm:self-auto ${dragging ? "scale-105 ring-4 ring-emerald-200" : "hover:ring-4 hover:ring-emerald-100"}`}>
                  {preview || currentImage ? (
                    <img src={preview || currentImage} alt="Profile" className="block h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-emerald-500 text-2xl font-bold text-white">
                      {form.name ? form.name.split(" ").map((word) => word[0]).slice(0, 2).join("").toUpperCase() : "U"}
                    </div>
                  )}

                  {/* CAMERA */}
                  <div className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow-md">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h3l2-3h8l2 3h3v12H3V7z" />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                  </div>

                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleImageChange} className="hidden" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900">
                    Profile Picture
                  </h3>

                  <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                    Upload a clear photo so other players can easily recognize you.
                  </p>

                  <p className="mt-2 text-xs font-medium text-slate-400">
                    JPG, PNG or WebP · Maximum 5 MB
                  </p>

                  {dragging && (
                    <div className="mt-3 inline-flex rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                      Drop image to upload
                    </div>
                  )}
                </div>
              </div>

              {/* SUCCESS */}
              {success && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-semibold text-emerald-700">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    ✓
                  </div>
                  Profile updated successfully!
                </div>
              )}

              {/* ERROR */}
              {error && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-600">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
                    !
                  </div>
                  {error}
                </div>
              )}

              {/* PROFILE FORM */}
              <form onSubmit={handleSave}>

                {/* NAME */}
                <div className="mb-5">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>

                  <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="John Doe" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" />
                </div>

                {/* PHONE + CITY */}
                <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Phone Number
                    </label>

                    <input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="+92 300 1234567" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      City
                    </label>

                    <input value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} placeholder="Islamabad" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" />

                    <p className="mt-1.5 text-xs text-slate-400">
                      Used to match you with players and grounds nearby.
                    </p>
                  </div>

                </div>

                {/* SPORTS */}
                <div className="mb-7">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Preferred Sports
                  </label>

                  <div className="flex flex-wrap gap-2.5">
                    {SPORT_OPTIONS.map((sport) => {
                      const selected = form.preferredSports.includes(sport);

                      return (
                        <button key={sport} type="button" onClick={() => toggleSport(sport)} className={`cursor-pointer rounded-xl border px-4 py-2.5 text-xs font-bold transition-all ${selected ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/50"}`}>
                          <span className="mr-1.5">{selected ? "✓" : "+"}</span>
                          {sport.charAt(0) + sport.slice(1).toLowerCase()}
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Select the sports you regularly play.
                  </p>
                </div>

                {/* SAVE */}
                <div className="flex justify-end border-t border-slate-100 pt-6">
                  <button type="submit" disabled={saving} className="w-full cursor-pointer rounded-xl bg-emerald-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
                    {saving ? "Uploading..." : "Save Changes"}
                  </button>
                </div>

              </form>
            </div>
          </section>

          {/* ==========================================
              PASSWORD CARD
          ========================================== */}

          <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">

            {/* PASSWORD HEADER */}
            <div className="flex items-start gap-4 border-b border-slate-100 px-6 py-6 sm:px-8">
              
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect width="18" height="11" x="3" y="11" rx="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4M12 15v3" />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Password & Security
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Change your password to keep your Maidan account secure.
                </p>
              </div>

            </div>

            {/* PASSWORD CONTENT */}
            <div className="px-6 py-7 sm:px-8">

              {passwordSuccess && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-semibold text-emerald-700">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    ✓
                  </div>
                  {passwordSuccess}
                </div>
              )}

              {passwordError && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-600">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
                    !
                  </div>
                  {passwordError}
                </div>
              )}

              <form onSubmit={handleChangePassword}>

                {/* CURRENT PASSWORD */}
                <div className="mb-5">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Current Password
                  </label>

                  <div className="relative">
                    <input type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter your current password" autoComplete="current-password" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" />

                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                      {showCurrentPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58a2 2 0 102.83 2.83M9.88 4.24A9.77 9.77 0 0112 4c5 0 9.27 3.11 11 8a18.12 18.12 0 01-3.12 5.16M6.23 6.23A18.07 18.07 0 003 12c1.73 4.89 6 8 9 8a9.77 9.77 0 004.12-.88" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-6 9.75-6 9.75 6 9.75 6-3.75 6-9.75 6-9.75-6-9.75-6z" />
                          <circle cx="12" cy="12" r="2.5" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* NEW + CONFIRM */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  {/* NEW PASSWORD */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      New Password
                    </label>

                    <div className="relative">
                      <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" autoComplete="new-password" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" />

                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                        {showNewPassword ? "◉" : "◌"}
                      </button>
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Must contain at least 8 characters.
                    </p>
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Confirm New Password
                    </label>

                    <div className="relative">
                      <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" autoComplete="new-password" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" />

                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                        {showConfirmPassword ? "◉" : "◌"}
                      </button>
                    </div>
                  </div>

                </div>

                {/* PASSWORD ACTION */}
                <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  
                  <p className="text-xs leading-5 text-slate-400">
                    For your security, choose a password you don't use elsewhere.
                  </p>

                  <button type="submit" disabled={changingPassword} className="w-full cursor-pointer rounded-xl border border-slate-900 bg-slate-900 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
                    {changingPassword ? "Changing Password..." : "Update Password"}
                  </button>

                </div>

              </form>
            </div>
          </section>

          {/* BOTTOM SPACE */}
          <div className="h-8" />

        </div>
      </main>

      <Footer />
    </>
  );
}