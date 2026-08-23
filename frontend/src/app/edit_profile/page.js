"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

  const [currentImage, setCurrentImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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

    try {
      const formData = new FormData();

      formData.append("name", form.name.trim());
      formData.append("phone", form.phone.trim());

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(
        `${BASE_URL}/api/auth/update-profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }

      if (data.user?.image) {
        setCurrentImage(data.user.image);
      }

      setImageFile(null);
      setPreview("");

      document.cookie = `name=${encodeURIComponent(
        form.name
      )}; path=/`;

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

        <main className="min-h-screen bg-[#f8fafc] px-4 py-10">
          <div className="mx-auto max-w-xl">
            <div className="rounded-3xl border border-gray-100 bg-white p-16 shadow-sm">
              <div className="flex justify-center">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#00ff88] border-t-transparent" />
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

      <main className="min-h-screen bg-[#f8fafc] px-4 py-10 font-sans sm:py-12">

        <div className="mx-auto w-full max-w-xl">

          {/* BACK */}
          <button
            onClick={() => router.back()}
            className="mb-5 cursor-pointer text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            ← Back
          </button>

          {/* CARD */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.06)] sm:p-8">

            {/* HEADER */}
            <div className="mb-7">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Edit Profile
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Update your personal information and profile picture.
              </p>
            </div>

            {/* ==========================================
                PROFILE IMAGE AREA
            ========================================== */}

            <div className="mb-7">

              <div className="flex items-center gap-5">

                {/* IMAGE */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex h-[120px] w-[120px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 bg-gray-50 transition-all ${
                    dragging
                      ? "border-[#00cc6f] bg-[#00ff88]/10 scale-105"
                      : "border-gray-200 hover:border-[#00cc6f]"
                  }`}
                >

                  {preview || currentImage ? (
                    <img
                      src={preview || currentImage}
                      alt="Profile"
                      className="block h-full w-full object-cover"
                      style={{
                        width: "120px",
                        height: "120px",
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#00cc6f] text-2xl font-bold text-white">
                      {form.name
                        ? form.name
                            .split(" ")
                            .map((word) => word[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()
                        : "U"}
                    </div>
                  )}

                  {/* CAMERA ICON */}
                  <div className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#00cc6f] text-white shadow-md">

                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 7h3l2-3h8l2 3h3v12H3V7z"
                      />

                      <circle
                        cx="12"
                        cy="13"
                        r="3"
                      />
                    </svg>

                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                </div>

                {/* IMAGE INFORMATION */}
                <div className="min-w-0">

                  <h2 className="text-base font-semibold text-gray-900">
                    Profile Picture
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-gray-500">
                    Drag & drop an image here
                    <br />
                    or click the picture to browse.
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    JPG, PNG or WebP · Max 5 MB
                  </p>

                </div>

              </div>

              {/* DRAGGING MESSAGE */}
              {dragging && (
                <div className="mt-3 rounded-xl border border-dashed border-[#00cc6f] bg-[#00ff88]/5 px-4 py-2 text-center text-xs font-semibold text-[#00a85b]">
                  Drop your profile picture here
                </div>
              )}

            </div>

            {/* SUCCESS */}
            {success && (
              <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                ✅ Profile updated successfully!
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            {/* ==========================================
                FORM
            ========================================== */}

            <form onSubmit={handleSave} className="space-y-5">

              {/* NAME */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Full Name
                </label>

                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="John Doe"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#00ff88] focus:bg-white focus:ring-4 focus:ring-[#00ff88]/15"
                />
              </div>

              {/* PHONE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Phone Number
                </label>

                <input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="+92 300 1234567"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#00ff88] focus:bg-white focus:ring-4 focus:ring-[#00ff88]/15"
                />
              </div>

              {/* SAVE */}
              <button
                type="submit"
                disabled={saving}
                className="w-full cursor-pointer rounded-2xl bg-emerald-600 mt-5 py-3.5 text-base font-bold text-black shadow-lg shadow-green-200 transition hover:scale-[1.01] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              >
                {saving ? "Uploading..." : "Save Changes"}
              </button>

            </form>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}