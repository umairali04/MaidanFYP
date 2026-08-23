"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import {
  getMyConnections,
  getIncomingRequests,
  getSentRequests,
  respondToConnection,
  removeConnection,
} from "@/lib/connectionsApi";

const TABS = [
  {
    key: "connections",
    label: "My Connections",
  },
  {
    key: "requests",
    label: "Requests",
  },
];

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState("connections");

  const [connections, setConnections] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [sent, setSent] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      const [conn, inc, snt] = await Promise.all([
        getMyConnections(),
        getIncomingRequests(),
        getSentRequests(),
      ]);

      setConnections(conn.connections || []);
      setIncoming(inc.requests || []);
      setSent(snt.requests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRespond(connectionId, action) {
    try {
      await respondToConnection(connectionId, action);

      setIncoming((prev) =>
        prev.filter((r) => r.id !== connectionId)
      );

      if (action === "ACCEPT") {
        loadAll();
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCancelSent(connectionId) {
    try {
      await removeConnection(connectionId);

      setSent((prev) =>
        prev.filter((r) => r.id !== connectionId)
      );
    } catch (err) {
      setError(err.message);
    }
  }

  const pendingCount = incoming.length;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7faf9]">

        {/* =========================================
            HERO
        ========================================= */}

        <section className="border-b border-gray-100 bg-white">

          <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-12">

            <div className="flex flex-col justify-between sm:flex-row sm:items-end sm:justify-between">

              <div>

                {/* Small badge */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#009f6b]" />

                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#00895c]">
                    Player Network
                  </span>
                </div>

                <h1
                  className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Your Connections
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
                  Build your sports network, connect with players and
                  discover new people to play with.
                </p>

              </div>

              {/* Find Players */}
              <div className="flex w-fit shrink-0 items-center">
  <Link
    href="/search_players"
    className="inline-flex h-12 w-fit shrink-0 items-center justify-center gap-2 rounded-xl border border-[#00895c] bg-emerald-600 px-6 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#00895c] hover:shadow-md active:translate-y-0"
  >
    <SearchIcon />
    Find Players
  </Link>
</div>

            </div>

          </div>

        </section>

        {/* =========================================
            MAIN
        ========================================= */}

        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">

          {/* =========================================
              STATS
          ========================================= */}

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">

            <StatCard
              icon={<UsersIcon />}
              label="Connections"
              value={loading ? "—" : connections.length}
              description="Players in your network"
            />

            <StatCard
              icon={<BellIcon />}
              label="Pending Requests"
              value={loading ? "—" : pendingCount}
              description={
                pendingCount === 0
                  ? "You're all caught up"
                  : "Waiting for your response"
              }
              highlight={pendingCount > 0}
            />

          </div>

          {/* =========================================
              ERROR
          ========================================= */}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-4">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertIcon />
              </div>

              <div>
                <p className="text-sm font-semibold text-red-700">
                  Something went wrong
                </p>

                <p className="mt-0.5 text-xs text-red-500">
                  {error}
                </p>
              </div>

            </div>
          )}

          {/* =========================================
              TABS
          ========================================= */}

          <div className="mb-6 flex w-full rounded-2xl border border-gray-100 bg-white p-1.5 shadow-sm">
  {TABS.map((tab) => {
    const active = activeTab === tab.key;

    return (
      <button
        key={tab.key}
        onClick={() => setActiveTab(tab.key)}
        className={`relative flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
          active
            ? "bg-[#009f6b] text-black shadow-sm"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
        }`}
      >
        {tab.key === "connections" ? (
          <UsersSmallIcon />
        ) : (
          <InboxSmallIcon />
        )}

        {tab.label}

        {tab.key === "requests" && pendingCount > 0 && (
          <span
            className={`inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
              active
                ? "bg-white text-[#00895c]"
                : "bg-emerald-100 text-[#00895c]"
            }`}
          >
            {pendingCount}
          </span>
        )}
      </button>
    );
  })}
</div>

          {/* =========================================
              CONTENT CARD
          ========================================= */}

          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.035)]">

            {loading ? (
              <LoadingState />
            ) : activeTab === "connections" ? (
              <ConnectionsList connections={connections} />
            ) : (
              <RequestsContent
                incoming={incoming}
                sent={sent}
                handleRespond={handleRespond}
                handleCancelSent={handleCancelSent}
              />
            )}

          </div>

        </div>

      </main>

      <Footer />
    </>
  );
}


/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  icon,
  label,
  value,
  description,
  highlight,
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">

      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-50/70 transition-transform duration-300 group-hover:scale-125" />

      <div className="relative flex items-center gap-4">

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            highlight
              ? "bg-emerald-100 text-[#009f6b]"
              : "bg-gray-50 text-gray-500"
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            {label}
          </p>

          <div className="mt-0.5 flex items-baseline gap-2">

            <p
              className="text-2xl font-bold text-gray-950"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {value}
            </p>

          </div>

          <p className="mt-0.5 text-xs text-gray-400">
            {description}
          </p>

        </div>

      </div>

    </div>
  );
}


/* =====================================================
   CONNECTIONS LIST
===================================================== */

function ConnectionsList({ connections }) {
  if (connections.length === 0) {
    return (
      <EmptyState
        icon={<UsersIcon />}
        title="Your network is waiting"
        subtitle="Find players who share your sports and city, then start building your network."
        ctaHref="/search_players"
        ctaLabel="Find Players"
      />
    );
  }

  return (
    <div>

      {/* Header */}
      <div className="border-b border-gray-100 px-5 py-5 sm:px-7">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-base font-bold text-gray-900">
              My Connections
            </h2>

            <p className="mt-0.5 text-xs text-gray-400">
              Players you're connected with
            </p>
          </div>

          <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#00895c]">
            {connections.length}{" "}
            {connections.length === 1 ? "player" : "players"}
          </div>

        </div>

      </div>

      {/* Players */}
      <div className="p-4 sm:p-5">

        <ul className="grid gap-3 sm:grid-cols-2">

          {connections.map(({ connectionId, player }) => (
            <li key={connectionId}>

              <Link
                href={`/players/${player.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-sm"
              >

                {/* Avatar */}
                <PlayerAvatar
                  player={player}
                  size="large"
                />

                {/* Information */}
                <div className="min-w-0 flex-1">

                  <div className="flex items-center gap-2">

                    <p className="truncate text-sm font-bold text-gray-900 transition-colors group-hover:text-[#00895c]">
                      {player.name}
                    </p>

                    <span className="hidden shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#00895c] sm:inline-flex">
                      Connected
                    </span>

                  </div>

                  {player.preferredSports?.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">

                      {player.preferredSports
                        .slice(0, 2)
                        .map((sport) => (
                          <span
                            key={sport}
                            className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-500"
                          >
                            {formatSport(sport)}
                          </span>
                        ))}

                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-gray-400">
                      No sports listed
                    </p>
                  )}

                </div>

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-300 transition-all group-hover:bg-emerald-100 group-hover:text-[#009f6b]">
                  <ArrowIcon />
                </div>

              </Link>

            </li>
          ))}

        </ul>

      </div>

    </div>
  );
}


/* =====================================================
   REQUESTS CONTENT
===================================================== */

function RequestsContent({
  incoming,
  sent,
  handleRespond,
  handleCancelSent,
}) {
  return (
    <div className="divide-y divide-gray-100">

      {/* =========================
          INCOMING REQUESTS
      ========================= */}
      <section className="p-5 sm:p-7">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Incoming Requests
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Players who want to connect with you
            </p>
          </div>

          {incoming.length > 0 && (
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#00895c]">
              {incoming.length} pending
            </span>
          )}
        </div>

        {incoming.length === 0 ? (
          <EmptyState
            icon={<InboxIcon />}
            title="No incoming requests"
            subtitle="When another player sends you a connection request, it will appear here."
            compact
          />
        ) : (
          <div className="space-y-3">
            {incoming.map((req) => (
              <div
                key={req.id}
                className="rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-200 hover:border-emerald-200 hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-5">

                  {/* PLAYER */}
                  <Link
                    href={`/players/${req.sender.id}`}
                    className="flex min-w-0 flex-1 items-center gap-4"
                  >
                    <PlayerAvatar
                      player={req.sender}
                      size="medium"
                    />

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-gray-900">
                        {req.sender.name}
                      </h3>

                      <div className="mt-1 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#009f6b]" />

                        <span className="text-xs text-gray-400">
                          Wants to connect with you
                        </span>
                      </div>

                      {req.sender.preferredSports?.length > 0 && (
                        <div className="mt-2 flex gap-1.5">
                          {req.sender.preferredSports
                            .slice(0, 2)
                            .map((sport) => (
                              <span
                                key={sport}
                                className="rounded-md bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-500"
                              >
                                {formatSport(sport)}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* ACTIONS */}
                  <div className="flex shrink-0 items-center gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        handleRespond(req.id, "ACCEPT")
                      }
                      className="inline-flex h-10 min-w-[90px] cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 text-xs font-bold text-gray-600 transition-all duration-200 hover:border-green-800 hover:bg-green-800 hover:text-green-50 active:scale-95"
                    >
                      <CheckIcon />
                      Accept
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleRespond(req.id, "REJECT")
                      }
                      className="inline-flex h-10 min-w-[90px] cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 text-xs font-bold text-gray-600 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95"
                    >
                      <XIcon />
                      Decline
                    </button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>


      {/* =========================
          SENT REQUESTS
      ========================= */}
      <section className="p-5 sm:p-7">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            Sent Requests
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Requests you've sent to other players
          </p>
        </div>

        {sent.length === 0 ? (
          <EmptyState
            icon={<PaperPlaneIcon />}
            title="No sent requests"
            subtitle="Requests you send to other players will appear here until they respond."
            compact
          />
        ) : (
          <div className="space-y-3">
            {sent.map((req) => (
              <div
                key={req.id}
                className="rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-200 hover:border-gray-200 hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-5">

                  {/* PLAYER */}
                  <Link
                    href={`/players/${req.receiver.id}`}
                    className="flex min-w-0 flex-1 items-center gap-4"
                  >
                    <PlayerAvatar
                      player={req.receiver}
                      size="medium"
                    />

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-gray-900">
                        {req.receiver.name}
                      </h3>

                      <div className="mt-1 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />

                        <span className="text-xs text-gray-400">
                          Awaiting response
                        </span>
                      </div>

                      {req.receiver.preferredSports?.length > 0 && (
                        <div className="mt-2 flex gap-1.5">
                          {req.receiver.preferredSports
                            .slice(0, 2)
                            .map((sport) => (
                              <span
                                key={sport}
                                className="rounded-md bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-500"
                              >
                                {formatSport(sport)}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* CANCEL */}
                  <button
                    type="button"
                    onClick={() =>
                      handleCancelSent(req.id)
                    }
                    className="inline-flex h-10 min-w-[125px] shrink-0 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-600 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95"
                  >
                    Cancel Request
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}


/* =====================================================
   PLAYER AVATAR
===================================================== */

function PlayerAvatar({ player, size = "medium" }) {
  const sizes = {
    large: "h-14 w-14 text-sm",
    medium: "h-12 w-12 text-xs",
  };

  const sizeClass = sizes[size] || sizes.medium;

  const initials =
    player?.name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <div
      className={`${sizeClass} relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-50 font-bold text-[#00895c] ring-2 ring-emerald-100`}
    >
      {player?.image ? (
        <img
          src={player.image}
          alt={player.name || "Player"}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        initials
      )}

      {/* Fallback initials underneath the image */}
      {player?.image && (
        <span className="absolute inset-0 -z-0 flex items-center justify-center">
          {initials}
        </span>
      )}
    </div>
  );
}


/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyState({
  icon,
  title,
  subtitle,
  ctaHref,
  ctaLabel,
  compact,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? "px-4 py-8" : "px-6 py-16"
      }`}
    >

      <div className="relative mb-5">

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-[#009f6b]">
          {icon}
        </div>

        <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-[#009f6b]" />

      </div>

      <h3 className="text-sm font-bold text-gray-900">
        {title}
      </h3>

      <p className="mt-1.5 max-w-sm text-xs leading-5 text-gray-400">
        {subtitle}
      </p>

      {ctaHref && (
        <Link
          href={ctaHref}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#009f6b] px-5 py-2.5 text-xs font-bold text-white transition-all duration-200 hover:bg-[#00895c] hover:shadow-md"
        >
          {ctaLabel}
          <ArrowIcon />
        </Link>
      )}

    </div>
  );
}


/* =====================================================
   LOADING
===================================================== */

function LoadingState() {
  return (
    <div className="p-5 sm:p-7">

      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
          <div className="mt-2 h-3 w-48 animate-pulse rounded bg-gray-100" />
        </div>

        <div className="h-7 w-20 animate-pulse rounded-full bg-gray-100" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">

        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4"
          >

            <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-gray-100" />

            <div className="flex-1">
              <div className="h-3.5 w-28 animate-pulse rounded bg-gray-100" />
              <div className="mt-2 h-3 w-20 animate-pulse rounded bg-gray-100" />
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}


/* =====================================================
   HELPERS
===================================================== */

function formatSport(sport) {
  if (!sport) return "";

  return sport.charAt(0) + sport.slice(1).toLowerCase();
}


/* =====================================================
   ICONS
===================================================== */

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-7 w-7"
    >
      <path
        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="9"
        cy="7"
        r="4"
      />

      <path
        d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-6 w-6"
    >
      <path
        d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M13.73 21a2 2 0 0 1-3.46 0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path
        d="m20 20-4-4"
        strokeLinecap="round"
      />
    </svg>
  );
}


function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <path
        d="m9 18 6-6-6-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      className="h-3.5 w-3.5"
    >
      <path
        d="m5 12 4 4L19 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-3.5 w-3.5"
    >
      <path
        d="M6 6l12 12M18 6 6 18"
        strokeLinecap="round"
      />
    </svg>
  );
}


function AlertIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <path
        d="M12 9v4"
        strokeLinecap="round"
      />

      <path
        d="M12 17h.01"
        strokeLinecap="round"
      />

      <path
        d="M10.3 3.8 2.6 17a2 2 0 0 0 1.73 3h15.34a2 2 0 0 0 1.73-3L13.7 3.8a2 2 0 0 0-3.4 0Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function UsersSmallIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="9"
        cy="7"
        r="4"
      />

      <path
        d="M22 21v-2a4 4 0 0 0-3-3.87"
        strokeLinecap="round"
      />

      <path
        d="M16 3.13a4 4 0 0 1 0 7.75"
        strokeLinecap="round"
      />
    </svg>
  );
}


function InboxSmallIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <path
        d="M4 4h16v16H4z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M4 13h4l2 3h4l2-3h4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function InboxIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-7 w-7"
    >
      <path
        d="M22 12h-6l-2 3h-4l-2-3H2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function PaperPlaneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-7 w-7"
    >
      <path
        d="M22 2 11 13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="m22 2-7 20-4-9-9-4Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}