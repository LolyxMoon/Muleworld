// src/useMultiplayer.js — PartyKit multiplayer hook (fixed)
import { useState, useEffect, useRef, useCallback } from "react";

const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST || "";
const ROOM_ID = "mulerun-main";

export function useMultiplayer(enabled, playerName, playerSkin, walletAddr) {
  const [otherPlayers, setOtherPlayers] = useState({});
  const [onlineCount, setOnlineCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const myIdRef = useRef(null);
  const wsRef = useRef(null);
  const chatCallbackRef = useRef(null);
  const eventCallbackRef = useRef(null);

  useEffect(() => {
    if (!enabled || !playerName || !PARTYKIT_HOST) return;

    let ws;
    try {
      const protocol = PARTYKIT_HOST.includes("localhost") ? "ws" : "wss";
      const url = `${protocol}://${PARTYKIT_HOST}/party/${ROOM_ID}`;
      console.log("[MuleRun MP] Connecting to:", url);
      ws = new WebSocket(url);
      wsRef.current = ws;
    } catch (err) {
      console.warn("[MuleRun MP] Failed to connect:", err);
      return;
    }

    ws.onopen = () => {
      console.log("[MuleRun MP] Connected!");
      setIsConnected(true);
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

      const myId = myIdRef.current;

      switch (data.type) {
        case "init":
          console.log("[MuleRun MP] Init, my ID:", data.playerId, "players:", Object.keys(data.players || {}).length);
          myIdRef.current = data.playerId;
          setOtherPlayers(data.players || {});
          setOnlineCount(Object.keys(data.players || {}).length + 1);
          break;

        case "player_joined":
          if (data.id !== myIdRef.current) {
            console.log("[MuleRun MP] Player joined:", data.player.name);
            setOtherPlayers(prev => ({ ...prev, [data.id]: data.player }));
            if (chatCallbackRef.current) {
              chatCallbackRef.current("🌐 WORLD", `${data.player.name} joined the world! 🫏`, null);
            }
          }
          setOnlineCount(data.count);
          break;

        case "player_moved":
          setOtherPlayers(prev => {
            const p = prev[data.id];
            if (!p) return prev;
            return { ...prev, [data.id]: { ...p, x: data.x, y: data.y, dir: data.dir } };
          });
          break;

        case "player_left":
          console.log("[MuleRun MP] Player left:", data.name);
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
          if (data.id !== myIdRef.current) {
            setOtherPlayers(prev => {
              const p = prev[data.id];
              if (!p) return prev;
              return { ...prev, [data.id]: { ...p, chatMsg: data.msg, chatTimer: 500 } };
            });
            if (chatCallbackRef.current) {
              chatCallbackRef.current(data.name, data.msg, data.skin);
            }
          }
          break;

        case "emote":
          setOtherPlayers(prev => {
            const p = prev[data.id];
            if (!p) return prev;
            return { ...prev, [data.id]: { ...p, emote: data.emote, emoteTimer: 400 } };
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
      console.log("[MuleRun MP] Disconnected");
      setIsConnected(false);
    };

    ws.onerror = (err) => {
      console.warn("[MuleRun MP] Error:", err);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [enabled, playerName, playerSkin, walletAddr]);

  const lastSentRef = useRef(0);
  const sendMove = useCallback((x, y, dir) => {
    const now = Date.now();
    if (now - lastSentRef.current < 50) return;
    lastSentRef.current = now;
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: "move", x, y, dir }));
    }
  }, []);

  const sendChat = useCallback((name, msg, skin) => {
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: "chat", name, msg, skin }));
    }
  }, []);

  const sendEmote = useCallback((emote) => {
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: "emote", emote }));
    }
  }, []);

  const sendEvent = useCallback((event, name, detail) => {
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: "event", event, name, detail }));
    }
  }, []);

  const onChat = useCallback((cb) => { chatCallbackRef.current = cb; }, []);
  const onEvent = useCallback((cb) => { eventCallbackRef.current = cb; }, []);

  return {
    otherPlayers,
    onlineCount,
    isConnected,
    myId: myIdRef.current,
    sendMove,
    sendChat,
    sendEmote,
    sendEvent,
    onChat,
    onEvent,
  };
}
