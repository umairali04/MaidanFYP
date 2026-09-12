"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getIncomingRequests, respondToConnection } from "@/lib/connectionsApi";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function getToken() {
  return document.cookie
    .split("; ")
    .find((r) => r.startsWith("token="))
    ?.split("=")[1];
}

// How often to check for new notifications
const POLL_MS = 15000;

export default function NotificationBell() {
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [matchInvites, setMatchInvites] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [respondingKey, setRespondingKey] = useState(null); // `${kind}-${id}` currently being responded to
  const dropdownRef = useRef(null);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function load() {
    try {
      const token = getToken();

      const [connData, inviteRes] = await Promise.all([
        getIncomingRequests().catch(() => ({ requests: [] })),
        fetch(`${BASE_URL}/api/bookings/participants/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .catch(() => ({ success: false })),
      ]);

      setConnectionRequests(connData.requests || []);
      if (inviteRes.success) setMatchInvites(inviteRes.invites || []);
    } catch {
      // Silently ignore — e.g. user isn't logged in yet, or a transient network blip.
    } finally {
      setLoading(false);
    }
  }

  async function handleRespondConnection(connectionId, action) {
    const key = `connection-${connectionId}`;
    setRespondingKey(key);
    try {
      await respondToConnection(connectionId, action);
      setConnectionRequests((prev) => prev.filter((r) => r.id !== connectionId));
    } catch {
      // If it fails, leave the request in the list so the user can retry from /connections
    } finally {
      setRespondingKey(null);
    }
  }

  async function handleRespondInvite(participantId, action) {
    const key = `invite-${participantId}`;
    setRespondingKey(key);
    try {
      const token = getToken();
      const res = await fetch(
        `${BASE_URL}/api/bookings/participants/${participantId}/respond`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action }), // "CONFIRM" | "DECLINE"
        }
      );
      if (res.ok) {
        setMatchInvites((prev) => prev.filter((i) => i.id !== participantId));
      }
    } catch {
      // If it fails, leave the invite in the list so the user can retry
    } finally {
      setRespondingKey(null);
    }
  }

  const count = connectionRequests.length + matchInvites.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-50 transition-all duration-200 cursor-pointer"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          width="20"
          height="20"
          className="text-gray-600"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xl shadow-gray-100/80 z-50">
          <div className="px-4 py-3 border-b border-gray-50">
            <p
              className="text-gray-900 text-sm font-bold"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Notifications
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">Loading…</p>
            ) : count === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">
                No new notifications right now.
              </p>
            ) : (
              <>
                {connectionRequests.map((req) => (
                  <div
                    key={`connection-${req.id}`}
                    className="flex items-center justify-between gap-2 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {req.sender.image ? (
                        <img
                          src={req.sender.image}
                          alt={req.sender.name}
                          className="w-8 h-8 rounded-full object-cover bg-gray-50 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                          {req.sender.name?.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-gray-900 text-xs font-semibold truncate">
                          {req.sender.name}
                        </p>
                        <p className="text-gray-400 text-[11px]">
                          wants to connect
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleRespondConnection(req.id, "ACCEPT")}
                        disabled={respondingKey === `connection-${req.id}`}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-60"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespondConnection(req.id, "REJECT")}
                        disabled={respondingKey === `connection-${req.id}`}
                        className="px-2.5 py-1 text-[11px] font-semibold text-gray-500 border border-gray-200 rounded-md hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-60"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}

                {matchInvites.map((inv) => {
                  const organizer = inv.booking.user;
                  const ground = inv.booking.ground;
                  const key = `invite-${inv.id}`;

                  return (
                    <div
                      key={key}
                      className="flex flex-col gap-2 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {organizer.image ? (
                          <img
                            src={organizer.image}
                            alt={organizer.name}
                            className="w-8 h-8 rounded-full object-cover bg-gray-50 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                            {organizer.name?.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-gray-900 text-xs font-semibold truncate">
                            {organizer.name} invited you to a match
                          </p>
                          <p className="text-gray-400 text-[11px] truncate">
                            {ground.name} ·{" "}
                            {new Date(inv.booking.bookingDate).toLocaleDateString(
                              "en-PK",
                              { month: "short", day: "numeric" }
                            )}{" "}
                            · {inv.booking.startTime}–{inv.booking.endTime}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-1.5 justify-end">
                        <button
                          onClick={() => handleRespondInvite(inv.id, "CONFIRM")}
                          disabled={respondingKey === key}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-60"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespondInvite(inv.id, "DECLINE")}
                          disabled={respondingKey === key}
                          className="px-2.5 py-1 text-[11px] font-semibold text-gray-500 border border-gray-200 rounded-md hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-60"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          <Link
            href="/connections"
            onClick={() => setOpen(false)}
            className="block text-center px-4 py-2.5 text-xs font-semibold text-emerald-600 border-t border-gray-50 hover:bg-emerald-50 transition-colors"
          >
            View all connections
          </Link>
        </div>
      )}
    </div>
  );
}