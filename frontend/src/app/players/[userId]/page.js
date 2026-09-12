"use client";
// Path: frontend/src/app/players/[userId]/page.js

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPlayerProfile, sendConnectionRequest } from "@/lib/connectionsApi";

function connectButtonLabel(status) {
  switch (status) {
    case "ACCEPTED":
      return "Connected";
    case "PENDING_SENT":
      return "Request sent";
    case "PENDING_RECEIVED":
      return "Respond to request";
    default:
      return "Connect";
  }
}

export default function PlayerProfilePage() {
  const { userId } = useParams();
  const router = useRouter();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    getPlayerProfile(userId)
      .then((data) => setPlayer(data.player))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  async function handleConnect() {
    try {
      setRequesting(true);
      await sendConnectionRequest(userId);
      setPlayer((prev) => ({ ...prev, connectionStatus: "PENDING_SENT" }));
    } catch (err) {
      setError(err.message);
    } finally {
      setRequesting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50/50 px-4 py-16">
        <div className="mx-auto max-w-lg">
          <button
            onClick={() => router.back()}
            className="mb-6 text-sm font-medium text-gray-500 hover:text-gray-800 transition cursor-pointer"
          >
            ← Back
          </button>

          {loading ? (
            <div className="rounded-3xl border border-gray-100 bg-white p-20 shadow-sm shadow-gray-100/60">
              <div className="flex justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : (
            <div className="rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-sm shadow-gray-100/60">
              {/* Header */}
              <div className="bg-gray-900 px-8 py-10 flex flex-col items-center text-center">
                {player.image ? (
                  <img
                    src={player.image}
                    alt={player.name}
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-emerald-500/30"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-emerald-500 text-gray-900 font-bold text-3xl flex items-center justify-center ring-4 ring-emerald-500/30">
                    {player.name?.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <h1
                  className="mt-4 text-white text-xl font-bold"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {player.name}
                </h1>
                {player.role && (
                  <span className="mt-2 inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide">
                    {player.role}
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="px-8 py-6 space-y-4">
                <ProfileRow label="City" value={player.city || "Not specified"} />
                <ProfileRow
                  label="Preferred Sports"
                  value={
                    player.preferredSports?.length
                      ? player.preferredSports
                          .map((s) => s.charAt(0) + s.slice(1).toLowerCase())
                          .join(", ")
                      : "Not specified"
                  }
                />
                {player.playedTogetherCount > 0 && (
                  <ProfileRow
                    label="Played together"
                    value={`${player.playedTogetherCount} time${player.playedTogetherCount > 1 ? "s" : ""}`}
                  />
                )}
                <ProfileRow
                  label="Member since"
                  value={new Date(player.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                />

                <p className="text-xs text-gray-400 pt-2">
                  Contact info stays private — use messaging once connected.
                </p>
              </div>

              {/* Action */}
              <div className="px-8 pb-8">
                <button
                  onClick={handleConnect}
                  disabled={player.connectionStatus !== "NONE" || requesting}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
                >
                  {requesting ? "Sending…" : connectButtonLabel(player.connectionStatus)}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-50 pb-3">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-gray-900 text-sm font-semibold text-right">{value}</span>
    </div>
  );
}