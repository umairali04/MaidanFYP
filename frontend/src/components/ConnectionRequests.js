"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getIncomingRequests,
  getSentRequests,
  respondToConnection,
  removeConnection,
} from "@/lib/connectionsApi";

export default function ConnectionRequests() {
  const [incoming, setIncoming] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      setLoading(true);
      const [incomingData, sentData] = await Promise.all([
        getIncomingRequests(),
        getSentRequests(),
      ]);
      setIncoming(incomingData.requests || []);
      setSent(sentData.requests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRespond(connectionId, action) {
    try {
      await respondToConnection(connectionId, action);
      setIncoming((prev) => prev.filter((r) => r.id !== connectionId));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCancelSent(connectionId) {
    try {
      await removeConnection(connectionId);
      setSent((prev) => prev.filter((r) => r.id !== connectionId));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-400">Loading requests…</div>;
  }

  return (
    <section>
      {error && (
        <p className="text-sm text-red-500 mb-4 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="mb-8">
        <h3
          className="text-gray-900 text-sm font-bold uppercase tracking-wide mb-3"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Incoming requests {incoming.length > 0 && `(${incoming.length})`}
        </h3>

        {incoming.length === 0 ? (
          <p className="text-sm text-gray-400">No pending requests.</p>
        ) : (
          <ul className="space-y-2">
            {incoming.map((req) => (
              <li
                key={req.id}
                className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm shadow-gray-100/60"
              >
                <div className="flex items-center gap-3">
                  <Link href={`/players/${req.sender.id}`} className="flex items-center gap-3 group">
                    {req.sender.image ? (
                      <img
                        src={req.sender.image}
                        alt={req.sender.name}
                        className="w-10 h-10 rounded-full object-cover bg-gray-50 ring-2 ring-emerald-50"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-emerald-100">
                        {req.sender.name?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-gray-900 text-sm font-semibold group-hover:text-emerald-700 transition-colors">
                        {req.sender.name}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {req.sender.preferredSports?.slice(0, 2).join(", ")}
                      </p>
                    </div>
                  </Link>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRespond(req.id, "ACCEPT")}
                    className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 cursor-pointer"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespond(req.id, "REJECT")}
                    className="px-4 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3
          className="text-gray-900 text-sm font-bold uppercase tracking-wide mb-3"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Sent requests
        </h3>
        {sent.length === 0 ? (
          <p className="text-sm text-gray-400">No pending sent requests.</p>
        ) : (
          <ul className="space-y-2">
            {sent.map((req) => (
              <li
                key={req.id}
                className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm shadow-gray-100/60"
              >
                <div className="flex items-center gap-3">
                  {req.receiver.image ? (
                    <img
                      src={req.receiver.image}
                      alt={req.receiver.name}
                      className="w-10 h-10 rounded-full object-cover bg-gray-50 ring-2 ring-emerald-50"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-emerald-100">
                      {req.receiver.name?.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <p className="text-gray-900 text-sm font-semibold">{req.receiver.name}</p>
                </div>
                <button
                  onClick={() => handleCancelSent(req.id)}
                  className="px-4 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}