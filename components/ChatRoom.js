"use client";

import { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";

const ADJECTIVES = ["Swift","Cosmic","Neon","Solar","Lunar","Crimson","Azure","Golden","Silver","Misty","Bold","Wild","Sage","Coral","Jade"];
const NOUNS = ["Fox","Panda","Hawk","Wolf","Tiger","Raven","Lynx","Orca","Crane","Viper","Bear","Elk","Moth","Lark","Finch"];

function randomName() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj}${noun}`;
}

const COLORS = [
  "#FF6B6B","#FFA94D","#FFD43B","#69DB7C","#4DABF7",
  "#CC5DE8","#F783AC","#63E6BE","#748FFC","#F06595",
];

function colorForName(name) {
  let hash = 0;
  for (let c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return COLORS[Math.abs(hash) % COLORS.length];
}

function timeStr(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatRoom() {
  const [username, setUsername] = useState("");
  const [tempName, setTempName] = useState("");
  const [nameSet, setNameSet] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // Init username from localStorage
  useEffect(() => {
    let stored = null;
    try { stored = localStorage.getItem("chat-username"); } catch {}
    const name = stored || randomName();
    setUsername(name);
    setTempName(name);
    if (stored) setNameSet(true);
  }, []);

  // Firebase real-time listener
  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "asc"),
      limit(200)
    );
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
    });
    return () => unsub();
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const confirmName = () => {
    const n = tempName.trim() || randomName();
    setUsername(n);
    setNameSet(true);
    try { localStorage.setItem("chat-username", n); } catch {}
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await addDoc(collection(db, "messages"), {
        user: username,
        text: input.trim(),
        createdAt: serverTimestamp(),
      });
      setInput("");
    } catch (e) {
      console.error("Send failed:", e);
    }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={root}>
      <div style={shell}>
        {/* Name overlay */}
        {!nameSet && (
          <div style={overlay}>
            <div style={overlayTitle}>GLOBAL CHAT</div>
            <div style={overlaySubtitle}>pick a name — no account needed</div>
            <input
              style={nameInput}
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmName()}
              placeholder="your name..."
              maxLength={20}
              autoFocus
            />
            <button style={joinBtn} onClick={confirmName}>
              JOIN CHAT →
            </button>
            <button
              style={skipBtn}
              onClick={() => {
                const n = randomName();
                setTempName(n);
                setUsername(n);
                setNameSet(true);
                try { localStorage.setItem("chat-username", n); } catch {}
              }}
            >
              give me a random name
            </button>
          </div>
        )}

        {/* Header */}
        <div style={header}>
          <div style={dot} />
          <span style={titleStyle}>GLOBAL CHAT</span>
          <span style={userBadge}>
            you:{" "}
            <span style={{ fontWeight: "700", fontSize: "12px", color: colorForName(username) }}>
              {username}
            </span>
            <button style={changeBtn} onClick={() => setNameSet(false)}>
              rename
            </button>
          </span>
        </div>

        {/* Messages */}
        <div style={messages}>
          {messages.length === 0 && (
            <div style={empty}>no messages yet — say something</div>
          )}
          {messages.map((msg, i) => (
            <div key={msg.id}>
              {i > 0 && messages[i - 1].user !== msg.user && (
                <div style={divider} />
              )}
              <div style={msgRow}>
                <span style={msgTime}>{timeStr(msg.createdAt)}</span>
                <span style={{ ...msgUser, color: colorForName(msg.user) }}>
                  {msg.user}
                </span>
                <span style={msgText}>{msg.text}</span>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={inputArea}>
          <div style={inputWrap}>
            <textarea
              style={textarea}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={nameSet ? "type a message..." : "join first..."}
              maxLength={500}
              disabled={!nameSet}
            />
          </div>
          <button
            style={{ ...sendBtn, opacity: sending || !nameSet ? 0.5 : 1 }}
            onClick={handleSend}
            disabled={sending || !nameSet}
          >
            {sending ? "..." : "SEND"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Styles
const root = {
  minHeight: "100vh", background: "#0d0d0f",
  display: "flex", alignItems: "center", justifyContent: "center",
};
const shell = {
  width: "100%", maxWidth: "720px", height: "100vh",
  display: "flex", flexDirection: "column",
  background: "#111114",
  borderLeft: "1px solid #1e1e22", borderRight: "1px solid #1e1e22",
  position: "relative", overflow: "hidden",
};
const header = {
  padding: "18px 24px", borderBottom: "1px solid #1e1e22",
  display: "flex", alignItems: "center", gap: "12px",
  background: "#111114", zIndex: "10",
};
const dot = {
  width: "10px", height: "10px", borderRadius: "50%",
  background: "#3dff8f", boxShadow: "0 0 8px #3dff8f",
  animation: "pulse 2s ease-in-out infinite", flexShrink: "0",
};
const titleStyle = {
  fontSize: "15px", fontWeight: "600", letterSpacing: "0.08em",
  color: "#e8e8e0", flex: "1",
};
const userBadge = { fontSize: "11px", color: "#666", letterSpacing: "0.05em" };
const changeBtn = {
  background: "none", border: "1px solid #2a2a30", color: "#555",
  fontSize: "10px", padding: "3px 8px", borderRadius: "3px",
  letterSpacing: "0.05em", marginLeft: "8px", fontFamily: "inherit",
  transition: "all 0.15s", cursor: "pointer",
};
const messages = {
  flex: "1", overflowY: "auto", padding: "16px 24px",
  display: "flex", flexDirection: "column", gap: "2px",
  scrollbarWidth: "thin", scrollbarColor: "#222 transparent",
};
const msgRow = {
  display: "flex", alignItems: "baseline", gap: "10px",
  padding: "4px 0", animation: "fadeSlide 0.2s ease",
};
const msgTime = {
  fontSize: "10px", color: "#333", minWidth: "38px",
  letterSpacing: "0.03em", flexShrink: "0",
};
const msgUser = {
  fontSize: "12px", fontWeight: "700", minWidth: "100px", maxWidth: "100px",
  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  letterSpacing: "0.03em", flexShrink: "0",
};
const msgText = { fontSize: "13px", color: "#ccc", lineHeight: "1.5", wordBreak: "break-word" };
const divider = {
  height: "1px",
  background: "linear-gradient(90deg, transparent, #1e1e22, transparent)",
  margin: "8px 0",
};
const inputArea = {
  borderTop: "1px solid #1e1e22", padding: "14px 24px",
  display: "flex", gap: "10px", alignItems: "flex-end", background: "#111114",
};
const inputWrap = {
  flex: "1", background: "#18181c", border: "1px solid #2a2a30",
  borderRadius: "6px", display: "flex", alignItems: "center", padding: "0 12px",
};
const textarea = {
  background: "none", border: "none", outline: "none",
  color: "#e8e8e0", fontSize: "13px", fontFamily: "inherit",
  resize: "none", flex: "1", padding: "10px 0",
  maxHeight: "100px", lineHeight: "1.4",
};
const sendBtn = {
  background: "#3dff8f", border: "none", borderRadius: "6px",
  color: "#0d0d0f", fontFamily: "inherit", fontWeight: "700",
  fontSize: "12px", letterSpacing: "0.08em", padding: "10px 16px",
  transition: "all 0.15s", whiteSpace: "nowrap", cursor: "pointer",
};
const overlay = {
  position: "absolute", top: "0", left: "0", right: "0", bottom: "0",
  background: "rgba(13,13,15,0.97)",
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  zIndex: "100", gap: "20px", padding: "32px",
};
const overlayTitle = {
  fontSize: "22px", fontWeight: "700", letterSpacing: "0.1em",
  color: "#e8e8e0", marginBottom: "8px",
};
const overlaySubtitle = { fontSize: "13px", color: "#555", letterSpacing: "0.05em", marginBottom: "16px" };
const nameInput = {
  background: "#18181c", border: "1px solid #2a2a30",
  borderRadius: "6px", color: "#e8e8e0", fontFamily: "inherit",
  fontSize: "16px", padding: "12px 16px", outline: "none",
  width: "100%", maxWidth: "280px", textAlign: "center", letterSpacing: "0.05em",
};
const joinBtn = {
  background: "#3dff8f", border: "none", borderRadius: "6px",
  color: "#0d0d0f", fontFamily: "inherit", fontWeight: "700",
  fontSize: "13px", letterSpacing: "0.1em", padding: "12px 32px", cursor: "pointer",
};
const skipBtn = {
  background: "none", border: "none", color: "#333", fontFamily: "inherit",
  fontSize: "11px", letterSpacing: "0.08em", textDecoration: "underline", cursor: "pointer",
};
const empty = {
  textAlign: "center", color: "#2a2a30",
  fontSize: "13px", marginTop: "80px", letterSpacing: "0.05em",
};
