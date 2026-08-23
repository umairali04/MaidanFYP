"use client";
// Path: frontend/src/app/search_players/page.js

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SuggestedPlayers from "@/components/SuggestedPlayers";
import { searchPlayers, sendConnectionRequest } from "@/lib/connectionsApi";

const SPORT_OPTIONS = ["CRICKET", "FOOTBALL", "HOCKEY", "BADMINTON", "TENNIS", "SQUASH"];

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

export default function SearchPlayersPage() {
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [requestingId, setRequestingId] = useState(null);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    try {
      setSearching(true);
      setError("");
      const data = await searchPlayers({ name: query, sport });
      setResults(data.players || []);
      setSearched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  }

  async function handleConnect(playerId) {
    try {
      setRequestingId(playerId);
      await sendConnectionRequest(playerId);
      setResults((prev) =>
        prev.map((p) =>
          p.id === playerId ? { ...p, connectionStatus: "PENDING_SENT" } : p
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setRequestingId(null);
    }
  }

  return (
    <>
      <Navbar />

      <div className=" bg-gray-50/50">
        {/* Hero */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-6 md:px-10 py-12 text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold tracking-wide mb-4">
              FIND YOUR NEXT MATCH
            </span>
            <h1
              className="text-gray-900 text-3xl md:text-4xl font-bold mb-2"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Search Players
            </h1>
            <p className="text-gray-500 text-sm md:text-base">
              Find players by name, sport, or discover who you may already know.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 md:px-10 py-10">
          <SuggestedPlayers />

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3 mb-8 bg-white border border-gray-100 rounded-2xl p-3 shadow-sm shadow-gray-100/60"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name…"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
            />
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-white cursor-pointer"
            >
              <option value="">All sports</option>
              {SPORT_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={searching}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
            >
              {searching ? "Searching…" : "Search"}
            </button>
          </form>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-6">
              {error}
            </p>
          )}

          {searched && results.length === 0 && !error && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">
                No players found. Try a different name or sport.
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((player) => (
                <div
                  key={player.id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm shadow-gray-100/60 hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col items-center text-center"
                >
                  <Link href={`/players/${player.id}`} className="flex flex-col items-center group">
                    {player.image ? (
                      <img
                        src={player.image}
                        alt={player.name}
                        className="w-24 h-24 rounded-full object-cover mb-3 bg-gray-50 ring-2 ring-emerald-50"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-emerald-600 text-white font-bold text-lg flex items-center justify-center mb-3 ring-2 ring-emerald-100">
                        {player.name?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <p className="text-gray-900 text-sm font-semibold group-hover:text-emerald-700 transition-colors">
                      {player.name}
                    </p>
                  </Link>
                  <p className="text-gray-400 text-xs mb-3">
                    {[player.city, player.preferredSports?.slice(0, 2).join(", ")]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <button
                    onClick={() => handleConnect(player.id)}
                    disabled={
                      player.connectionStatus !== "NONE" || requestingId === player.id
                    }
                    className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {requestingId === player.id
                      ? "Sending…"
                      : connectButtonLabel(player.connectionStatus)}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}