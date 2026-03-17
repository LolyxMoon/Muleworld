// src/useMultiplayer.js — PartyKit multiplayer hook
import { useState, useEffect, useRef, useCallback } from "react";

// ══ CONFIG ══
// Change this after deploying PartyKit:
// npx partykit deploy party/server.js --name mulerun-world
// Then set: PARTYKIT_HOST = "mulerun-world.YOUR_USERNAME.partykit.dev"
const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST || "localhost:1999";
const ROOM_ID = "mulerun-main";

export function useMultiplayer(enabled, playerName, playerSkin, walletAddr) {
  const [otherPlayers, setOtherPlayers] = useState({});
  const [onlineCount, setOnlineCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [myId, setMyId] = useState(null);
  const wsRef = useRef(null);
  const chatCallbackRef = useRef(null);
  const eventCallbackRef = useRef(null);

  // Connect to PartyKit
  useEffect(() => {
    if (!enabled || !playerName) return;

    let ws;
    try {
      const protocol = PARTYKIT_HOST.includes("localhost") ? "ws" : "wss";
      ws = new WebSocket(`${protocol}://${PARTYKIT_HOST}/party/${ROOM_ID}`);
      wsRef.current = ws;
    } catch (err) {
      console.warn("PartyKit not available, running in single-player mode.", err);
      return;
    }

    ws.onopen = () => {
      setIsConnected(true);
      // Send join message
      ws.send(JSON.stringify({
        type: "join",
        name: playerName,
        skin: playerSkin,
        wallet: walletAddr || "",
        x: 25 * 24,
        y: 21 * 24,
      }));
    };

    ws.onmessage = (e) => {
      let data;
      try { data = JSON.parse(e.data); } catch { return; }

      switch (data.type) {
        case "init":
          setMyId(data.playerId);
          setOtherPlayers(data.players || {});
          setOnlineCount(Object.keys(data.players || {}).length + 1);
          break;

        case "player_joined":
          if (data.id !== myId) {
            setOtherPlayers(prev => ({ ...prev, [data.id]: data.player }));
          }
          setOnlineCount(data.count);
          if (chatCallbackRef.current && data.id !== myId) {
            chatCallbackRef.current("🌐 WORLD", `${data.player.name} joined the world! 🫏`, null);
          }
          break;

        case "player_moved":
          setOtherPlayers(prev => {
            const p = prev[data.id];
            if (!p) return prev;
            return { ...prev, [data.id]: { ...p, x: data.x, y: data.y, dir: data.dir } };
          });
          break;

        case "player_left":
          setOtherPlayers(prev => {
            const next = { ...prev };
            delete next[data.id];
            return next;
          });
          setOnlineCount(data.count);
          if (chatCallbackRef.current) {
            chatCallbackRef.current("🌐 WORLD", `${data.name} left the world 👋`, null);
          }
          break;

        case "chat":
          if (data.id !== myId && chatCallbackRef.current) {
            chatCallbackRef.current(data.name, data.msg, data.skin);
          }
          break;

        case "emote":
          setOtherPlayers(prev => {
            const p = prev[data.id];
            if (!p) return prev;
            return { ...prev, [data.id]: { ...p, emote: data.emote, emoteTimer: 140 } };
          });
          break;

        case "event":
          if (eventCallbackRef.current) {
            eventCallbackRef.current(data.event, data.name, data.detail);
          }
          break;
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (err) => {
      console.warn("PartyKit connection error:", err);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [enabled, playerName, playerSkin, walletAddr]);

  // Send player position (throttled)
  const lastSentRef = useRef(0);
  const sendMove = useCallback((x, y, dir) => {
    const now = Date.now();
    if (now - lastSentRef.current < 50) return; // max 20 updates/sec
    lastSentRef.current = now;
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: "move", x, y, dir }));
    }
  }, []);

  // Send chat message
  const sendChat = useCallback((name, msg, skin) => {
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: "chat", name, msg, skin }));
    }
  }, []);

  // Send emote
  const sendEmote = useCallback((emote) => {
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: "emote", emote }));
    }
  }, []);

  // Send event (token launch, agent deploy, etc)
  const sendEvent = useCallback((event, name, detail) => {
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: "event", event, name, detail }));
    }
  }, []);

  // Register callbacks
  const onChat = useCallback((cb) => { chatCallbackRef.current = cb; }, []);
  const onEvent = useCallback((cb) => { eventCallbackRef.current = cb; }, []);

  return {
    otherPlayers,
    onlineCount,
    isConnected,
    myId,
    sendMove,
    sendChat,
    sendEmote,
    sendEvent,
    onChat,
    onEvent,
  };
}
