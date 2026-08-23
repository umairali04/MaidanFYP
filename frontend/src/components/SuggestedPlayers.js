"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRecommendedPlayers, sendConnectionRequest } from "@/lib/connectionsApi";

export default function SuggestedPlayers() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState(null);
  const [sentIds, setSentIds] = useState(new Set());
  const [error, setError] = useState("");

  useEffect(() => {
    loadRecommendations();
  }, []);

  async function loadRecommendations() {
    try {
      setLoading(true);
      const data = await getRecommendedPlayers();
      setPlayers(data.players || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect(playerId) {
    try {
      setRequestingId(playerId);
      await sendConnectionRequest(playerId);
      setSentIds((prev) => new Set(prev).add(playerId));
    } catch (err) {
      setError(err.message);
    } finally {
      setRequestingId(null);
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-400">Finding players you may know…</div>;
  }

  if (error && players.length === 0) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  if (players.length === 0) return null;

  return (
    <section className="mb-10">
      <h2
        className="text-gray-900 text-lg font-bold mb-4"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        Players you may know
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {players.map((player) => {
          const alreadySent = sentIds.has(player.id);
          return (
            <div
              key={player.id}
              className="min-w-[190px] bg-white border border-gray-100 rounded-2xl p-5 shadow-sm shadow-gray-100/60 flex flex-col items-center text-center"
            >
              <Link href={`/players/${player.id}`} className="flex flex-col items-center group">
                {player.image ? (
                  <img
                    src={player.image}
                    alt={player.name}
                    className="w-16 h-16 rounded-full object-cover mb-3 bg-gray-50 ring-2 ring-emerald-50"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-emerald-600 text-white font-bold text-lg flex items-center justify-center mb-3 ring-2 ring-emerald-100">
                    {player.name?.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <p className="text-gray-900 text-sm font-semibold group-hover:text-emerald-700 transition-colors">
                  {player.name}
                </p>
              </Link>
              <p className="text-gray-400 text-xs mb-1">
                {[player.city, player.preferredSports?.slice(0, 2).join(", ")]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {player.playedTogetherCount > 0 && (
                <p className="text-[11px] text-emerald-600 font-medium mb-2">
                  Played together {player.playedTogetherCount}x
                </p>
              )}
              <button
                onClick={() => handleConnect(player.id)}
                disabled={alreadySent || requestingId === player.id}
                className="mt-2 px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
              >
                {alreadySent
                  ? "Request sent"
                  : requestingId === player.id
                  ? "Sending…"
                  : "Connect"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}