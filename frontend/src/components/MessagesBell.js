"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getConversations } from "@/lib/connectionsApi";

const POLL_MS = 10000;

function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const diffMins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diffMins < 1) return "Now";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.floor(diffHours / 24)}d`;
}

function previewText(msg) {
  if (!msg) return "Say hello 👋";
  if (msg.isDeleted) return "This message was deleted";
  if (msg.type === "IMAGE") return "📷 Photo";
  if (msg.type === "VOICE") return "🎤 Voice message";
  return msg.content;
}

export default function MessagesBell() {
  const [conversations, setConversations] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
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
      const data = await getConversations();
      setConversations(data.conversations || []);
    } catch {
      // Silently ignore — user may not be logged in, or a transient blip
    } finally {
      setLoading(false);
    }
  }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Messages"
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
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        {totalUnread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xl shadow-gray-100/80 z-50">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <p
              className="text-gray-900 text-sm font-bold"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Messages
            </p>
            <Link
              href="/messages"
              onClick={() => setOpen(false)}
              className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
            >
              See all
            </Link>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">Loading…</p>
            ) : conversations.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-400 mb-2">No conversations yet.</p>
                <Link
                  href="/connections"
                  onClick={() => setOpen(false)}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  View your connections →
                </Link>
              </div>
            ) : (
              conversations.map(({ player, lastMessage, unreadCount }) => {
                const hasUnread = unreadCount > 0;
                return (
                  <Link
                    key={player.id}
                    href={`/messages/${player.id}`}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 px-4 py-3 transition-colors ${
                      hasUnread ? "bg-emerald-50/50 hover:bg-emerald-50" : "hover:bg-gray-50"
                    }`}
                  >
                    {player.image ? (
                      <img
                        src={player.image}
                        alt={player.name}
                        className="w-10 h-10 rounded-full object-cover bg-gray-50 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {player.name?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs truncate ${
                          hasUnread ? "text-gray-900 font-bold" : "text-gray-900 font-semibold"
                        }`}
                      >
                        {player.name}
                      </p>
                      <p
                        className={`text-xs truncate ${
                          hasUnread ? "text-gray-700 font-medium" : "text-gray-400"
                        }`}
                      >
                        {previewText(lastMessage)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {lastMessage && (
                        <span className="text-[10px] text-gray-400">
                          {formatRelativeTime(lastMessage.createdAt)}
                        </span>
                      )}
                      {hasUnread && (
                        <span className="min-w-[16px] h-4 px-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}