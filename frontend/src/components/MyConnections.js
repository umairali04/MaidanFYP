"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyConnections } from "@/lib/connectionsApi";

export default function MyConnections() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyConnections()
      .then((data) => setConnections(data.connections || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-gray-400">Loading connections…</div>;
  if (error)
    return (
      <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
        {error}
      </p>
    );

  if (connections.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-gray-400">
          You haven't connected with any players yet.
        </p>
        <Link
          href="/search_players"
          className="inline-block mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
        >
          Find players →
        </Link>
      </div>
    );
  }

  return (
    <ul className="w-full space-y-3">
      {connections.map(({ connectionId, player }) => (
        <li
          key={connectionId}
          className="w-full bg-white border border-gray-100 rounded-2xl shadow-sm shadow-gray-100/60 hover:shadow-md hover:border-gray-200 transition-all duration-200"
        >
          <Link
            href={`/players/${player.id}`}
            className="flex items-center gap-3 min-w-0 px-5 py-4 group"
          >
            {player.image ? (
              <img
                src={player.image}
                alt={player.name}
                className="w-11 h-11 rounded-full object-cover bg-gray-50 ring-2 ring-emerald-50 flex-shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center ring-2 ring-emerald-100 flex-shrink-0">
                {player.name?.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-gray-900 text-sm font-semibold truncate group-hover:text-emerald-700 transition-colors">
                {player.name}
              </p>
              <p className="text-gray-400 text-xs truncate">
                {player.preferredSports?.slice(0, 3).join(", ") || "No sports listed"}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}