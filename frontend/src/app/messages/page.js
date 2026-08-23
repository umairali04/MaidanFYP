"use client";
// Path: frontend/src/app/messages/page.js

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getConversations, isLoggedIn, clearAuthCookies } from "@/lib/connectionsApi"; // CHANGED import

const POLL_MS = 8000;

function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const diffMins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function InboxPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
  if (!isLoggedIn()) {
    router.replace("/login");
    return;
  }
  setCheckingAuth(false);
}, [router]);

  useEffect(() => {
    if (checkingAuth) return;
    load();
    const interval = setInterval(load, POLL_MS);
    return () => clearInterval(interval);
  }, [checkingAuth]);

  async function load() {
  try {
    const data = await getConversations();
    setConversations(data.conversations || []);
  } catch (err) {
    if (err.status === 401) {       // CHANGED: now reliable since authedRequest sets .status
      clearAuthCookies();
      router.replace("/login");
      return;
    }
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

  if (checkingAuth) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-2xl mx-auto px-6 md:px-10 py-10">
          <h1
            className="text-gray-900 text-2xl font-bold mb-1"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Messages
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            All your conversations with connected players.
          </p>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm shadow-gray-100/60 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
              </div>
            ) : error ? (
              <p className="text-sm text-red-500 px-6 py-8 text-center">{error}</p>
            ) : conversations.length === 0 ? (
              <div className="text-center py-16 px-6">
                <p className="text-sm text-gray-400 mb-3">No conversations yet.</p>
                <Link
                  href="/connections"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  View your connections →
                </Link>
              </div>
            ) : (
              <ul>
                {conversations.map(({ player, lastMessage, unreadCount }, i) => {
                  const hasUnread = unreadCount > 0;
                  return (
                    <li key={player.id}>
                      <Link
                        href={`/messages/${player.id}`}
                        className={`flex items-center gap-3 px-5 py-4 transition-colors duration-150 ${
                          hasUnread ? "bg-emerald-50/50" : "hover:bg-gray-50"
                        } ${i !== 0 ? "border-t border-gray-50" : ""}`}
                      >
                        {player.image ? (
                          <img
                            src={player.image}
                            alt={player.name}
                            className="w-12 h-12 rounded-full object-cover bg-gray-50 ring-2 ring-emerald-50 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center ring-2 ring-emerald-100 flex-shrink-0">
                            {player.name?.slice(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm truncate ${
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
                            {lastMessage
                              ? lastMessage.content
                              : player.preferredSports?.slice(0, 3).join(", ") || "Say hello 👋"}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          {lastMessage && (
                            <span className="text-[11px] text-gray-400 whitespace-nowrap">
                              {formatRelativeTime(lastMessage.createdAt)}
                            </span>
                          )}
                          {hasUnread && (
                            <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}