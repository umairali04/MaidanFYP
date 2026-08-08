"use client";

import { useState, useRef, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const getToken = () => localStorage.getItem("token");

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Hi! I'm Maidan Assistant. I can help you find grounds, book slots, or answer any questions. How can I help you today?", feedback: null },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  // Load all sessions on open
  useEffect(() => {
    if (isOpen) fetchSessions();
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";
        recognition.onresult = (e) => { setInput(e.results[0][0].transcript); setIsListening(false); };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const fetchSessions = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/chatbot/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    }
  };

  const loadSession = async (sessionId) => {
    const token = getToken();
    try {
      const res = await fetch(`${API_URL}/api/chatbot/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const formatted = data.messages.map((m) => ({ role: m.role, content: m.content, feedback: null }));
      setMessages([
        { role: "assistant", content: "👋 Hi! I'm Maidan Assistant. How can I help you today?", feedback: null },
        ...formatted,
      ]);
      setCurrentSessionId(sessionId);
      setShowHistory(false);
    } catch (err) {
      console.error("Failed to load session", err);
    }
  };

  const deleteSession = async (sessionId, e) => {
    e.stopPropagation();
    const token = getToken();
    await fetch(`${API_URL}/api/chatbot/sessions/${sessionId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (currentSessionId === sessionId) startNewChat();
  };

  const clearAllSessions = async () => {
    const token = getToken();
    await fetch(`${API_URL}/api/chatbot/sessions`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setSessions([]);
    startNewChat();
  };

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([{ role: "assistant", content: "👋 Hi! I'm Maidan Assistant. How can I help you today?", feedback: null }]);
    setShowHistory(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = { role: "user", content: input, feedback: null };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/api/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ message: input, sessionId: currentSessionId }),
      });
      const data = await res.json();
      const assistantMsg = { role: "assistant", content: data.reply || "Sorry, I couldn't process that.", feedback: null };
      setMessages([...updatedMessages, assistantMsg]);

      // Update session ID and refresh sidebar
      if (data.sessionId) {
        setCurrentSessionId(data.sessionId);
        fetchSessions(); // refresh sidebar with updated session
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Connection error. Please try again.", feedback: null }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (!recognitionRef.current) { alert("Speech recognition not supported."); return; }
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { recognitionRef.current.start(); setIsListening(true); }
  };

  const setFeedback = (msgIndex, type) => {
    setMessages((prev) => prev.map((m, i) => i === msgIndex ? { ...m, feedback: m.feedback === type ? null : type } : m));
  };

  const openFeedbackModal = (msgIndex, type) => { setFeedbackModal({ msgIndex, type }); setFeedbackText(""); setFeedbackSubmitted(false); };

  const submitFeedback = () => {
    if (!feedbackText.trim()) return;
    setFeedbackSubmitted(true);
    setTimeout(() => setFeedbackModal(null), 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const renderContent = (content) =>
    content.split("\n").map((line, j) => (
      <span key={j}>
        {line.split(/\*\*(.*?)\*\*/g).map((part, k) => k % 2 === 1 ? <strong key={k}>{part}</strong> : part)}
        <br />
      </span>
    ));

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diff < 604800000) return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <>
      {/* Floating Button */}
      <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999 }}>
        {!isOpen && (
          <div style={{
            position: "absolute", bottom: "64px", right: "0", background: "#111", color: "white",
            fontSize: "12px", fontWeight: "600", padding: "7px 13px", borderRadius: "8px",
            whiteSpace: "nowrap", pointerEvents: "none", opacity: showTooltip ? 1 : 0,
            transition: "opacity 0.2s", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}>
            Help Assistant
            <div style={{ position: "absolute", bottom: "-4px", right: "20px", width: "8px", height: "8px", background: "#111", transform: "rotate(45deg)", borderRadius: "1px" }} />
          </div>
        )}
        <button
          onClick={() => { setIsOpen(!isOpen); setShowTooltip(false); }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; if (!isOpen) setShowTooltip(true); }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; setShowTooltip(false); }}
          style={{
            width: "54px", height: "54px", borderRadius: "50%",
            background: "linear-gradient(135deg, #1a6b3c, #22c55e)", color: "white",
            border: "none", cursor: "pointer", fontSize: "22px",
            boxShadow: "0 4px 20px rgba(26,107,60,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
        >{isOpen ? "✕" : "💬"}</button>
      </div>

      {isOpen && (
        <div style={{
          position: "fixed", bottom: "90px", right: "24px", width: "380px", height: "580px",
          background: "#ffffff", borderRadius: "20px", boxShadow: "0 16px 56px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column", zIndex: 9998, overflow: "hidden",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          border: "1px solid rgba(26,107,60,0.12)",
        }}>

          {/* Header */}
          <div style={{
            padding: "13px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "linear-gradient(135deg, #1a6b3c 0%, #15803d 100%)", color: "white", flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", border: "2px solid rgba(255,255,255,0.3)", flexShrink: 0 }}>🏟️</div>
              <div>
                <div style={{ fontWeight: "700", fontSize: "14px" }}>Maidan Assistant</div>
                <div style={{ fontSize: "11px", opacity: 0.85, display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                  Online • Sports Ground Helper
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              <button onClick={() => setShowHistory(!showHistory)} title="Chat History"
                style={{ background: showHistory ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px", cursor: "pointer", padding: "6px 9px", color: "white", fontSize: "15px" }}>☰</button>
              <button onClick={startNewChat} title="New Chat"
                style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px", cursor: "pointer", padding: "6px 9px", color: "white", fontSize: "15px" }}>✏️</button>
              <button onClick={() => setIsOpen(false)}
                style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px", cursor: "pointer", padding: "6px 9px", color: "white", fontSize: "15px" }}>✕</button>
            </div>
          </div>

          {/* History Panel */}
          {showHistory ? (
            <div style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
              <button onClick={startNewChat} style={{
                width: "calc(100% - 24px)", margin: "12px", padding: "10px",
                background: "linear-gradient(135deg, #1a6b3c, #15803d)", color: "white",
                border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: "600",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}>✏️ Start New Chat</button>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 16px 10px", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ fontWeight: "600", fontSize: "13px", color: "#111" }}>Recent Chats</span>
                {sessions.length > 0 && (
                  <button onClick={clearAllSessions} style={{ fontSize: "12px", color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontWeight: "500" }}>
                    Clear all
                  </button>
                )}
              </div>

              {sessions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#aaa", fontSize: "13px" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>💬</div>
                  No chat history yet
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => loadSession(session.id)}
                    style={{
                      padding: "11px 16px", borderBottom: "1px solid #f5f5f5", cursor: "pointer",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: currentSessionId === session.id ? "#f0faf4" : "transparent",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f0faf4")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = currentSessionId === session.id ? "#f0faf4" : "transparent")}
                  >
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div style={{ fontSize: "13px", fontWeight: "500", color: "#222", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        💬 {session.title}
                      </div>
                      <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>{formatDate(session.updatedAt)}</div>
                    </div>
                    <button
                      onClick={(e) => deleteSession(session.id, e)}
                      style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: "14px", marginLeft: "8px" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#ccc")}
                    >🗑️</button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", background: "#f8fdf9" }}>
                {messages.map((msg, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: "8px", alignItems: "flex-end" }}>
                      {msg.role === "assistant" && (
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#1a6b3c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", flexShrink: 0 }}>🏟️</div>
                      )}
                      <div style={{
                        maxWidth: "78%", padding: "10px 14px",
                        borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        background: msg.role === "user" ? "#1a6b3c" : "#ffffff",
                        color: msg.role === "user" ? "white" : "#111",
                        fontSize: "13.5px", lineHeight: "1.55", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                      }}>
                        {renderContent(msg.content)}
                      </div>
                    </div>

                    {msg.role === "assistant" && i > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "5px", marginLeft: "36px" }}>
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <button onClick={() => setFeedback(i, "like")} style={{ background: msg.feedback === "like" ? "#dcfce7" : "transparent", border: "1px solid", borderColor: msg.feedback === "like" ? "#1a6b3c" : "#e5e7eb", borderRadius: "6px", padding: "3px 7px", cursor: "pointer", fontSize: "13px", color: msg.feedback === "like" ? "#1a6b3c" : "#aaa", transition: "all 0.15s" }}
                            onMouseEnter={(e) => { if (msg.feedback !== "like") e.currentTarget.style.borderColor = "#1a6b3c"; e.currentTarget.nextSibling.style.opacity = "1"; }}
                            onMouseLeave={(e) => { if (msg.feedback !== "like") e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.nextSibling.style.opacity = "0"; }}
                          >👍</button>
                          <span style={{ position: "absolute", bottom: "110%", left: "50%", transform: "translateX(-50%)", background: "#111", color: "white", fontSize: "10px", padding: "3px 7px", borderRadius: "5px", whiteSpace: "nowrap", opacity: 0, transition: "opacity 0.15s", pointerEvents: "none", zIndex: 10 }}>Helpful</span>
                        </div>
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <button onClick={() => setFeedback(i, "dislike")} style={{ background: msg.feedback === "dislike" ? "#fee2e2" : "transparent", border: "1px solid", borderColor: msg.feedback === "dislike" ? "#ef4444" : "#e5e7eb", borderRadius: "6px", padding: "3px 7px", cursor: "pointer", fontSize: "13px", color: msg.feedback === "dislike" ? "#ef4444" : "#aaa", transition: "all 0.15s" }}
                            onMouseEnter={(e) => { if (msg.feedback !== "dislike") e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.nextSibling.style.opacity = "1"; }}
                            onMouseLeave={(e) => { if (msg.feedback !== "dislike") e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.nextSibling.style.opacity = "0"; }}
                          >👎</button>
                          <span style={{ position: "absolute", bottom: "110%", left: "50%", transform: "translateX(-50%)", background: "#111", color: "white", fontSize: "10px", padding: "3px 7px", borderRadius: "5px", whiteSpace: "nowrap", opacity: 0, transition: "opacity 0.15s", pointerEvents: "none", zIndex: 10 }}>Unhelpful</span>
                        </div>
                        {msg.feedback && (
                          <button onClick={() => openFeedbackModal(i, msg.feedback)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#1a6b3c", fontWeight: "500", textDecoration: "underline", padding: "0 2px" }}>
                            Tell us more
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#1a6b3c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>🏟️</div>
                    <div style={{ background: "#fff", borderRadius: "18px 18px 18px 4px", padding: "12px 16px", display: "flex", gap: "4px", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                      {[0, 1, 2].map((i) => (
                        <span key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1a6b3c", display: "inline-block", animation: "bounce 1.2s infinite", animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick Suggestions */}
              <div style={{ padding: "8px 12px", display: "flex", gap: "6px", flexWrap: "wrap", borderTop: "1px solid #e8f5ee", background: "#fff", flexShrink: 0 }}>
                {["Find grounds", "How to book?", "Cancel booking", "Add my ground"].map((s) => (
                  <button key={s} onClick={() => setInput(s)}
                    style={{ fontSize: "11.5px", padding: "5px 12px", borderRadius: "999px", border: "1px solid #d1fae5", background: "#f0fdf4", color: "#1a6b3c", cursor: "pointer", fontWeight: "500", transition: "all 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#1a6b3c"; e.currentTarget.style.color = "white"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.color = "#1a6b3c"; }}
                  >{s}</button>
                ))}
              </div>

              {/* Input Row */}
              <div style={{ padding: "10px 12px", borderTop: "1px solid #e8f5ee", display: "flex", alignItems: "center", gap: "8px", background: "#fff", flexShrink: 0 }}>
                <input
                  value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="Reply or ask anything"
                  style={{ flex: 1, border: "1px solid #d1fae5", borderRadius: "999px", padding: "9px 16px", fontSize: "13.5px", outline: "none", color: "#111", background: "#f8fdf9" }}
                  onFocus={(e) => e.target.style.borderColor = "#1a6b3c"}
                  onBlur={(e) => e.target.style.borderColor = "#d1fae5"}
                />
                <button onClick={toggleMic} style={{ background: isListening ? "#ef4444" : "#f0fdf4", border: isListening ? "none" : "1px solid #d1fae5", borderRadius: "50%", width: "38px", height: "38px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s", animation: isListening ? "pulse 1s infinite" : "none" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={isListening ? "white" : "#1a6b3c"}>
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke={isListening ? "white" : "#1a6b3c"} strokeWidth="2" strokeLinecap="round" fill="none" />
                    <line x1="12" y1="19" x2="12" y2="23" stroke={isListening ? "white" : "#1a6b3c"} strokeWidth="2" strokeLinecap="round" />
                    <line x1="8" y1="23" x2="16" y2="23" stroke={isListening ? "white" : "#1a6b3c"} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
                <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ background: input.trim() ? "linear-gradient(135deg, #1a6b3c, #15803d)" : "#e5e7eb", color: input.trim() ? "white" : "#aaa", border: "none", borderRadius: "50%", width: "38px", height: "38px", cursor: loading || !input.trim() ? "not-allowed" : "pointer", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s", boxShadow: input.trim() ? "0 2px 8px rgba(26,107,60,0.3)" : "none" }}>➤</button>
              </div>
            </>
          )}

          {/* Feedback Modal */}
          {feedbackModal && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, borderRadius: "20px" }}>
              <div style={{ background: "white", borderRadius: "16px", padding: "24px", width: "85%", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", position: "relative" }}>
                <button onClick={() => setFeedbackModal(null)} style={{ position: "absolute", top: "12px", right: "12px", background: "#f3f4f6", border: "none", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                {feedbackSubmitted ? (
                  <div style={{ textAlign: "center", padding: "12px 0" }}>
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>🎉</div>
                    <div style={{ fontWeight: "600", fontSize: "14px", color: "#111" }}>Thanks for your feedback!</div>
                  </div>
                ) : (
                  <>
                    <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: "700", color: "#111" }}>Leave feedback</h3>
                    <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#555", lineHeight: "1.5" }}>
                      {feedbackModal.type === "like" ? "We're happy to know that helped! Tell us more." : "We're sorry. Help us improve by sharing what went wrong."}
                    </p>
                    <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Write your feedback here..." rows={3}
                      style={{ width: "100%", border: "1.5px solid #d1fae5", borderRadius: "10px", padding: "10px 12px", fontSize: "13px", outline: "none", resize: "none", color: "#111", boxSizing: "border-box", fontFamily: "inherit" }}
                      onFocus={(e) => e.target.style.borderColor = "#1a6b3c"}
                      onBlur={(e) => e.target.style.borderColor = "#d1fae5"}
                    />
                    <button onClick={submitFeedback} style={{ marginTop: "12px", width: "100%", padding: "11px", background: feedbackText.trim() ? "linear-gradient(135deg, #1a6b3c, #15803d)" : "#e5e7eb", color: feedbackText.trim() ? "white" : "#aaa", border: "none", borderRadius: "10px", cursor: feedbackText.trim() ? "pointer" : "not-allowed", fontSize: "14px", fontWeight: "600", transition: "all 0.2s" }}>Submit</button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }
        @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); } }
      `}</style>
    </>
  );
}