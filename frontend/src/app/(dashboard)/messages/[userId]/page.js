"use client";
// Path: frontend/src/app/(dashboard)/messages/[userId]/page.js

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  getConversation,
  getConversations, // NOTE: placeholder — rename to your real "list all conversations" API function if different
  sendMessage,
  sendMediaMessage,
  getPlayerProfile,
  deleteMessage,
  isLoggedIn,        // ADD
  clearAuthCookies, //ADD
} from "@/lib/connectionsApi";

const POLL_MS = 4000;
const LONG_PRESS_MS = 450;

const EMOJIS = [
  "😀","😂","😍","🥳","😎","🤔","😴","😢","😡","👍",
  "👏","🙏","🔥","⚽","🏏","🏸","🎾","🏆","💪","👋",
  "❤️","😊","😅","🤝","✅","⏰","📍","🎉","💯","😭",
];

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatDateDivider(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function groupByDate(messages) {
  const groups = [];
  let currentDate = null;
  let currentGroup = null;
  messages.forEach((msg) => {
    const day = new Date(msg.createdAt).toDateString();
    if (day !== currentDate) {
      currentDate = day;
      currentGroup = { date: msg.createdAt, messages: [] };
      groups.push(currentGroup);
    }
    currentGroup.messages.push(msg);
  });
  return groups;
}

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// sent → single tick, delivered → double gray, seen → double blue
function TickIcon({ status }) {
  if (status === "sent") {
    return (
      <svg viewBox="0 0 16 11" width="13" height="9" fill="none" className="inline-block align-middle">
        <path d="M1 5.5L5 9.5L15 1" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  const color = status === "seen" ? "#7dd3fc" : "rgba(255,255,255,0.6)";
  return (
    <svg viewBox="0 0 20 11" width="16" height="9" fill="none" className="inline-block align-middle">
      <path d="M1 5.5L5 9.5L15 1" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 5.5L10 9.5L20 1" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ReplyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
      <path d="M9 17l-5-5 5-5M4 12h11a5 5 0 015 5v1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VoicePlayer({ src, duration: durationProp, isMine }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(durationProp || 0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setAudioDuration(audio.duration || durationProp || 0);
    const onEnd = () => {
      setPlaying(false);
      setCurrentTime(0);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnd);
    };
  }, [durationProp]);

  function togglePlay(e) {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  }

  const pct = audioDuration ? Math.min(100, (currentTime / audioDuration) * 100) : 0;
  const displayTime = currentTime > 0 ? currentTime : audioDuration;

  return (
    <div className="flex items-center gap-2 w-56 max-w-full py-1">
      <audio ref={audioRef} src={src} className="hidden" preload="metadata" />
      <button
        type="button"
        onClick={togglePlay}
        className="w-8 h-8 flex-shrink-0 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer"
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? (
          <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
            <rect x="5" y="4" width="4" height="16" rx="1" />
            <rect x="15" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
            <path d="M6 4l14 8-14 8V4z" />
          </svg>
        )}
      </button>
      <div className={`flex-1 h-1 rounded-full overflow-hidden ${isMine ? "bg-white/25" : "bg-gray-200"}`}>
        <div className={`h-full ${isMine ? "bg-white/80" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-[11px] tabular-nums flex-shrink-0 ${isMine ? "text-white/70" : "text-gray-500"}`}>
        {formatDuration(displayTime)}
      </span>
    </div>
  );
}

function ImageMessage({ src }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="w-64 max-w-full h-36 rounded-xl mb-1 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
        Image unavailable
      </div>
    );
  }
  return (
    <img
      src={src}
      alt="sent"
      className="rounded-xl mb-1 w-64 max-w-full h-auto max-h-72 object-cover cursor-pointer block"
      onClick={() => window.open(src, "_blank")}
      onError={() => setFailed(true)}
    />
  );
}

function getAvatarColor(name = "") {
  const palette = ["bg-amber-500", "bg-orange-500", "bg-blue-500", "bg-emerald-600", "bg-rose-500", "bg-indigo-500"];
  let sum = 0;
  for (const ch of name) sum += ch.charCodeAt(0);
  return palette[sum % palette.length];
}

function formatSidebarTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-GB", { weekday: "short" });
}

function lastMessagePreview(lastMessage) {
  if (!lastMessage) return "Say hello 👋";
  if (lastMessage.type === "IMAGE") return "📷 Photo";
  if (lastMessage.type === "VOICE") return "🎤 Voice message";
  return lastMessage.content || "";
}

function ConversationsSidebar({ conversations, loading, activeUserId, search, setSearch, onSelect }) {
  const filtered = conversations.filter((c) =>
    (c.player?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="hidden md:flex flex-col w-72 lg:w-80 flex-shrink-0 border-r border-gray-100 bg-white">
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Syne', sans-serif" }}>
          Messages
        </h2>
        <div className="relative mt-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations"
            className="w-full bg-gray-50 border border-gray-200 rounded-full pl-9 pr-3 py-2 text-xs outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-10 px-4">No conversations yet.</p>
        ) : (
          filtered.map((c) => {
            const isActive = c.userId === activeUserId;
            return (
              <button
                key={c.userId}
                onClick={() => onSelect(c.userId)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                  isActive ? "bg-slate-900" : "hover:bg-gray-50"
                }`}
              >
                <div className="relative flex-shrink-0">
                  {c.player?.image ? (
                    <img src={c.player.image} alt={c.player.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className={`w-10 h-10 rounded-full text-white font-bold text-xs flex items-center justify-center ${getAvatarColor(c.player?.name)}`}>
                      {c.player?.name?.slice(0, 2).toUpperCase() || "?"}
                    </div>
                  )}
                  {c.player?.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-semibold truncate ${isActive ? "text-white" : "text-gray-900"}`}>
                      {c.player?.name || "Unknown"}
                    </p>
                    <span className={`text-[10px] flex-shrink-0 ${isActive ? "text-white/60" : "text-gray-400"}`}>
                      {formatSidebarTime(c.lastMessage?.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className={`text-xs truncate ${isActive ? "text-white/70" : "text-gray-500"}`}>
                      {lastMessagePreview(c.lastMessage)}
                    </p>
                    {c.unreadCount > 0 && (
                      <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

const CHAT_BG = {
  backgroundColor: "#eef1f5",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill='none' stroke='%23dde3e9' stroke-width='1.2'%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3Ccircle cx='70' cy='40' r='2'/%3E%3Ccircle cx='40' cy='80' r='2'/%3E%3Cpath d='M10 60 q10 -10 20 0 t20 0' /%3E%3Cpath d='M55 10 q10 -8 20 0' /%3E%3C/g%3E%3C/svg%3E")`,
  backgroundSize: "180px 180px",
};

export default function MessageThreadPage() {
  const { userId } = useParams();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [messages, setMessages] = useState([]);
  const [player, setPlayer] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  // NEW: sidebar conversations list
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [sidebarSearch, setSidebarSearch] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordTimerRef = useRef(null);

  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const [showEmoji, setShowEmoji] = useState(false);
  const emojiPanelRef = useRef(null);
  const emojiBtnRef = useRef(null);

  const [menuMsgId, setMenuMsgId] = useState(null);
  const pressTimer = useRef(null);

  // NEW: reply preview (client-side only — backend doesn't persist reply
  // threading yet, so this only shows a quoted snippet above the composer
  // and prefixes nothing on send. Wire this up to your API when it supports it.)
  const [replyTo, setReplyTo] = useState(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

 useEffect(() => {
  if (!isLoggedIn()) {              // CHANGED
    router.replace("/login");
    return;
  }
  setCheckingAuth(false);
}, [router]);

  useEffect(() => {
    if (checkingAuth) return;
    let interval;
    async function load(initial = false) {
  try {
    const data = await getConversation(userId);
    setMessages(data.messages || []);
    if (initial) {
      const profile = await getPlayerProfile(userId);
      setPlayer(profile.player);
    }
  } catch (err) {
    if (err.status === 401) {
      clearAuthCookies();
      router.replace("/login");
      return;
    }
    setError(err.message);
  } finally {
    setLoading(false);
  }
}
    load(true);
    interval = setInterval(() => load(false), POLL_MS);
    return () => clearInterval(interval);
  }, [userId, checkingAuth]);

  // NEW: fetch conversations list for the sidebar, polled alongside the thread
  useEffect(() => {
    if (checkingAuth) return;
    let interval;
    async function loadConversations() {
      try {
        const data = await getConversations();
        setConversations(data.conversations || []);
      } catch (err) {
        console.error("CONVERSATIONS LIST ERROR:", err);
      } finally {
        setConversationsLoading(false);
      }
    }
    loadConversations();
    interval = setInterval(loadConversations, POLL_MS);
    return () => clearInterval(interval);
  }, [checkingAuth]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close emoji picker when clicking outside of it
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        emojiPanelRef.current &&
        !emojiPanelRef.current.contains(e.target) &&
        emojiBtnRef.current &&
        !emojiBtnRef.current.contains(e.target)
      ) {
        setShowEmoji(false);
      }
      setMenuMsgId(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleEmojiClick(emoji) {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      setSending(true);
      const { message } = await sendMessage(userId, text.trim());
      setMessages((prev) => [...prev, message]);
      setText("");
      setReplyTo(null);
      inputRef.current?.focus();
    } catch (err) {
      console.error("TEXT SEND ERROR:", err);
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  function handleAttachClick() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setUploadingImage(true);
      const { message } = await sendMediaMessage(userId, file, "IMAGE");
      setMessages((prev) => [...prev, message]);
    } catch (err) {
      console.error("IMAGE SEND ERROR:", err);
      setError(err.message);
    } finally {
      setUploadingImage(false);
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const durationSeconds = recordSeconds;

        if (blob.size > 0) {
          try {
            setUploadingImage(true);
            const file = new File([blob], "voice-note.webm", { type: "audio/webm" });
            const { message } = await sendMediaMessage(userId, file, "VOICE", durationSeconds);
            setMessages((prev) => [...prev, message]);
          } catch (err) {
            console.error("VOICE SEND ERROR:", err);
            setError(err.message);
          } finally {
            setUploadingImage(false);
          }
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error("MIC ACCESS ERROR:", err);
      setError("Microphone access denied or unavailable");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    clearInterval(recordTimerRef.current);
  }

  function cancelRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = () => {
        mediaRecorderRef.current.stream?.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    clearInterval(recordTimerRef.current);
    setRecordSeconds(0);
  }

  // ----- Delete for everyone -----
  async function handleDelete(messageId) {
    setMenuMsgId(null);
    try {
      await deleteMessage(messageId);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, isDeleted: true, content: "", fileUrl: null } : m
        )
      );
    } catch (err) {
      console.error("DELETE ERROR:", err);
      setError(err.message);
    }
  }

  // ----- Reply (client-side preview only) -----
  function handleReply(msg) {
    setReplyTo(msg);
    inputRef.current?.focus();
  }

  // ----- Save (download media, or copy text) -----
  async function handleSaveMessage(msg) {
    try {
      if (msg.fileUrl) {
        const a = document.createElement("a");
        a.href = msg.fileUrl;
        a.download = "";
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else if (msg.content) {
        await navigator.clipboard.writeText(msg.content);
      }
    } catch (err) {
      console.error("SAVE ERROR:", err);
    }
  }

  function startPress(msg, isMine) {
    if (!isMine || msg.isDeleted) return;
    pressTimer.current = setTimeout(() => setMenuMsgId(msg.id), LONG_PRESS_MS);
  }
  function cancelPress() {
    clearTimeout(pressTimer.current);
  }

  function getTickStatus(msg) {
    if (msg.readAt) return "seen";
    if (msg.deliveredAt) return "delivered";
    return "sent";
  }

  const groupedMessages = groupByDate(messages);

  if (checkingAuth) return null;

  return (
    <>
      <Navbar />
      <div className="h-[calc(100vh-73px)] bg-gray-100 flex md:items-center md:justify-center md:p-6">
        <div className="flex w-full h-full md:max-w-5xl md:rounded-3xl md:border md:border-gray-200 bg-white overflow-hidden shadow-md shadow-gray-200/60">

          <ConversationsSidebar
            conversations={conversations}
            loading={conversationsLoading}
            activeUserId={userId}
            search={sidebarSearch}
            setSearch={setSidebarSearch}
            onSelect={(uid) => router.push(`/messages/${uid}`)}
          />

          <div className="flex flex-col flex-1 min-w-0 bg-white overflow-hidden">

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 flex-shrink-0 bg-white">
            <button onClick={() => router.push("/messages")} className="md:hidden text-gray-400 hover:text-gray-700 transition-colors cursor-pointer p-1 -ml-1" aria-label="Back to conversations">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {player?.image ? (
              <img src={player.image} alt={player.name} className="w-10 h-10 rounded-full object-cover bg-gray-50 ring-2 ring-emerald-50" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-bold text-sm flex items-center justify-center ring-2 ring-amber-100">
                {player?.name?.slice(0, 2).toUpperCase() || "?"}
              </div>
            )}

            <Link href={player ? `/players/${userId}` : "#"} className="flex-1 min-w-0 group">
              <p className="text-gray-900 font-semibold text-sm truncate group-hover:text-emerald-700 transition-colors" style={{ fontFamily: "'Syne', sans-serif" }}>
                {player?.name || "Conversation"}
              </p>
              <p className="text-[11px] text-emerald-600 flex items-center gap-1 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                Active now
              </p>
            </Link>

            <button className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-full hover:bg-gray-50" aria-label="Search in conversation" title="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-full hover:bg-gray-50" aria-label="More options" title="More">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <circle cx="12" cy="5" r="1.6" />
                <circle cx="12" cy="12" r="1.6" />
                <circle cx="12" cy="19" r="1.6" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4" style={CHAT_BG}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
              </div>
            ) : error && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
                  {error}
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                {player?.image ? (
                  <img src={player.image} alt={player.name} className="w-16 h-16 rounded-full object-cover mb-3 ring-2 ring-emerald-50" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-amber-500 text-white font-bold text-xl flex items-center justify-center mb-3 ring-2 ring-amber-100">
                    {player?.name?.slice(0, 2).toUpperCase() || "?"}
                  </div>
                )}
                <p className="text-gray-900 text-sm font-semibold">{player?.name}</p>
                <p className="text-gray-400 text-xs mt-1">You're connected — say hello and plan your next match.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedMessages.map((group, gi) => (
                  <div key={gi}>
                    <div className="flex justify-center mb-4">
                      <span className="text-[11px] font-medium text-gray-500 bg-white/90 shadow-sm px-3 py-1 rounded-full">
                        {formatDateDivider(group.date)}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {group.messages.map((msg, i) => {
                        const isMine = msg.senderId !== userId;
                        const prevMsg = group.messages[i - 1];
                        const isGrouped = prevMsg && prevMsg.senderId === msg.senderId;
                        const tickStatus = isMine ? getTickStatus(msg) : null;
                        const menuOpen = menuMsgId === msg.id;

                        return (
                          <div key={msg.id} className={`group flex ${isMine ? "justify-end" : "justify-start"} ${isGrouped ? "mt-1" : "mt-3"}`}>
                            <div className={`relative min-w-0 max-w-[75%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                              <div
                                onMouseDown={() => startPress(msg, isMine)}
                                onMouseUp={cancelPress}
                                onMouseLeave={cancelPress}
                                onTouchStart={() => startPress(msg, isMine)}
                                onTouchEnd={cancelPress}
                                onContextMenu={(e) => {
                                  if (isMine && !msg.isDeleted) {
                                    e.preventDefault();
                                    setMenuMsgId(msg.id);
                                  }
                                }}
                                className={`select-none px-3 py-2 text-sm leading-relaxed shadow-sm ${
                                  msg.isDeleted
                                    ? "bg-gray-100 text-gray-400 italic rounded-2xl"
                                    : isMine
                                    ? "bg-slate-900 text-white rounded-2xl rounded-br-md cursor-pointer"
                                    : "bg-white text-gray-900 rounded-2xl rounded-bl-md"
                                }`}
                              >
                                {msg.isDeleted ? (
                                  <p className="px-1">This message was deleted</p>
                                ) : (
                                  <>
                                    {msg.type === "IMAGE" && msg.fileUrl && (
                                      <ImageMessage src={msg.fileUrl} />
                                    )}
                                    {msg.type === "VOICE" && msg.fileUrl && (
                                      <VoicePlayer src={msg.fileUrl} duration={msg.duration} isMine={isMine} />
                                    )}
                                    {msg.type === "TEXT" && (
                                      <p className="whitespace-pre-wrap break-words px-1">{msg.content}</p>
                                    )}
                                  </>
                                )}
                                <div className={`flex items-center gap-1 mt-1 px-1 ${isMine ? "justify-end" : "justify-start"}`}>
                                  <span className={`text-[10px] ${isMine && !msg.isDeleted ? "text-white/60" : "text-gray-400"}`}>
                                    {formatTime(msg.createdAt)}
                                  </span>
                                  {isMine && !msg.isDeleted && <TickIcon status={tickStatus} />}
                                </div>
                              </div>

                              {/* Reply / Save actions — revealed on hover */}
                              {!msg.isDeleted && (
                                <div className="flex items-center gap-3 mt-1 px-1">
                                  <button
                                    onClick={() => handleReply(msg)}
                                    className="flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-emerald-600 transition-colors cursor-pointer"
                                  >
                                    <ReplyIcon /> Reply
                                  </button>
                                  <button
                                    onClick={() => handleSaveMessage(msg)}
                                    className="flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-emerald-600 transition-colors cursor-pointer"
                                  >
                                    <SaveIcon /> Save
                                  </button>
                                </div>
                              )}

                              {menuOpen && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-100 rounded-xl shadow-lg shadow-gray-200/60 overflow-hidden"
                                >
                                  <button
                                    onClick={() => handleDelete(msg.id)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap w-full"
                                  >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Delete for everyone
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="bg-slate-900 flex-shrink-0 px-3 py-3">
            {/* Reply preview strip */}
            {replyTo && !isRecording && (
              <div className="flex items-center justify-between gap-2 bg-slate-800 rounded-xl px-3 py-2 mb-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-emerald-400">
                    Replying to {replyTo.senderId !== userId ? "yourself" : player?.name || "them"}
                  </p>
                  <p className="text-xs text-gray-300 truncate">
                    {replyTo.type === "TEXT" ? replyTo.content : replyTo.type === "IMAGE" ? "Photo" : "Voice message"}
                  </p>
                </div>
                <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-white p-1 flex-shrink-0" aria-label="Cancel reply">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            )}

            {isRecording ? (
              <div className="flex items-center gap-3 px-2">
                <button onClick={cancelRecording} className="text-gray-400 hover:text-red-500 transition-colors p-1" aria-label="Cancel recording" title="Cancel recording">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                <span className="text-sm text-gray-200 flex-1">{formatDuration(recordSeconds)} · Recording…</span>
                <button onClick={stopRecording} className="w-10 h-10 flex-shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-all" aria-label="Stop and send" title="Stop and send">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSend} className="flex items-center gap-2 relative">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelected} />

                <button
                  type="button"
                  onClick={handleAttachClick}
                  disabled={uploadingImage}
                  className="w-9 h-9 flex-shrink-0 rounded-full bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center disabled:opacity-40"
                  aria-label="Attach image"
                  title="Attach image"
                >
                  {uploadingImage ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17">
                      <path d="M21.44 11.05l-9.19 9.19a5.5 5.5 0 01-7.78-7.78l9.19-9.19a3.5 3.5 0 014.95 4.95l-9.19 9.19a1.5 1.5 0 01-2.12-2.12l8.49-8.49" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                <button
                  ref={emojiBtnRef}
                  type="button"
                  onClick={() => setShowEmoji((v) => !v)}
                  className="w-9 h-9 flex-shrink-0 rounded-full bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center"
                  aria-label="Insert emoji"
                  title="Emoji"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8.5 14s1.5 2 3.5 2 3.5-2 3.5-2" strokeLinecap="round" />
                    <circle cx="9" cy="9.5" r="0.9" fill="currentColor" stroke="none" />
                    <circle cx="15" cy="9.5" r="0.9" fill="currentColor" stroke="none" />
                  </svg>
                </button>

                {showEmoji && (
                  <div
                    ref={emojiPanelRef}
                    className="absolute bottom-14 left-0 bg-white border border-gray-200 rounded-2xl shadow-lg p-3 grid grid-cols-6 gap-1 z-10"
                  >
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleEmojiClick(emoji)}
                        className="text-xl hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <input
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-slate-700 rounded-full px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-slate-800 text-white placeholder-gray-400 focus:bg-slate-800"
                />

                {text.trim() ? (
                  <button type="submit" disabled={sending} aria-label="Send message" title="Send" className="w-10 h-10 flex-shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:bg-slate-700 transition-all duration-200">
                    {sending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                      </svg>
                    )}
                  </button>
                ) : (
                  <button type="button" onClick={startRecording} aria-label="Record voice message" title="Record voice message" className="w-10 h-10 flex-shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-all duration-200">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                      <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </form>
            )}
          </div>
          </div>
        </div>
      </div>
    </>
  );
}