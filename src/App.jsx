import { useState, useEffect, useRef, useCallback } from "react";
import { useMultiplayer } from "./useMultiplayer.js";

// ═══════════════════════════════════════════════
// MULERUN WORLD v3 — Token Forge + Agent Lab
// ═══════════════════════════════════════════════

const TILE = 24;
const WORLD_W = 52;
const WORLD_H = 40;
const VPX = 28;
const VPY = 20;

const PAL = {
  grass1: "#4a7c59", grass2: "#5a8f6a", grass3: "#3d6b4a",
  water1: "#2d6a9f", water2: "#3a7ab8", water3: "#1f5580",
  sand: "#c9b97a", sand2: "#b8a86a",
  path: "#a08860", path2: "#8a7550",
  wood: "#8b6914",
  stone: "#7f8c8d", stone2: "#6c7a7b",
  tree1: "#2d5a1e", tree2: "#1e4a12", trunk: "#5d4017",
  flower1: "#e74c3c", flower2: "#f39c12", flower3: "#9b59b6",
  dark: "#0b0b16",
  ui_bg: "rgba(12,12,25,0.94)",
  accent: "#f0c040", accent2: "#e8a020",
  forge_glow: "#ff6b2b", forge_tile: "#2a1a30", forge_tile2: "#3d2545",
  lab_glow: "#00e5ff", lab_tile: "#0a1a2a", lab_tile2: "#0d2538",
  chart_glow: "#39ff14", chart_tile: "#0a1f0a", chart_tile2: "#0d2b10",
};

const SKINS = [
  { body: "#e8a020", ear: "#d4901a", belly: "#f5d080", name: "Golden" },
  { body: "#c0392b", ear: "#a93226", belly: "#e8a090", name: "Crimson" },
  { body: "#2980b9", ear: "#2471a3", belly: "#85c1e9", name: "Azure" },
  { body: "#8e44ad", ear: "#7d3c98", belly: "#c39bd3", name: "Violet" },
  { body: "#27ae60", ear: "#229954", belly: "#82e0aa", name: "Emerald" },
  { body: "#e67e22", ear: "#ca6f1e", belly: "#f0b27a", name: "Amber" },
  { body: "#1abc9c", ear: "#17a589", belly: "#76d7c4", name: "Teal" },
  { body: "#ec407a", ear: "#d81b60", belly: "#f48fb1", name: "Rose" },
];

const EMOTES = ["👋", "❤️", "😂", "🔥", "⭐", "💎", "🎉", "🤝", "🚀", "🫏"];

const AGENT_ROLES = [
  { id: "trader", label: "Trading Agent", icon: "📈", desc: "Monitors markets, analyzes trends, and executes trades on BSC DEXs" },
  { id: "researcher", label: "Research Agent", icon: "🔍", desc: "Deep dives into projects, audits contracts, and generates reports" },
  { id: "monitor", label: "Monitor Agent", icon: "👁️", desc: "Tracks wallets, token launches, and whale movements 24/7" },
  { id: "content", label: "Content Agent", icon: "✍️", desc: "Creates threads, memes, and marketing content for your project" },
  { id: "community", label: "Community Agent", icon: "🤝", desc: "Manages community, answers questions, and moderates channels" },
  { id: "sniper", label: "Sniper Agent", icon: "🎯", desc: "Detects new launches on four.meme and evaluates early opportunities" },
];

const AGENT_SKILLS = [
  { id: "web_browse", label: "Web Browsing", icon: "🌐" },
  { id: "code_exec", label: "Code Execution", icon: "💻" },
  { id: "chain_read", label: "On-Chain Reading", icon: "⛓️" },
  { id: "social", label: "Social Media", icon: "📱" },
  { id: "doc_gen", label: "Document Gen", icon: "📄" },
  { id: "alerts", label: "Real-time Alerts", icon: "🔔" },
];

// ── 7 Bot Characters ──
const BOTS = [
  {
    id: 0, name: "DeFi_Degen", wallet: "0x3f8a...c91d", skin: SKINS[0],
    messages: [
      "just aped into a new token LFG 🚀", "who's launching something today?",
      "the forge is calling me...", "100x or nothing, that's my motto",
      "gm degens, ready to make history?", "bonding curve looking juicy rn",
      "ser, have you checked four.meme today?", "I'm never selling. ok maybe at 1000x",
    ],
    homeX: 14, homeY: 14, roamRadius: 8,
  },
  {
    id: 1, name: "MuleMaster", wallet: "0xa1b2...7e3f", skin: SKINS[1],
    messages: [
      "been in this world since day one 🫏", "the token forge is where legends are born",
      "remember: DYOR always", "this place keeps getting better",
      "who wants to collab on a launch?", "I've seen tokens moon from this forge",
      "my trading agent made 3 calls today", "the agent lab is next level fr",
    ],
    homeX: 24, homeY: 22, roamRadius: 10,
  },
  {
    id: 2, name: "CryptoLuna", wallet: "0x7c4d...2a8b", skin: SKINS[7],
    messages: [
      "hey newcomer! welcome to MuleRun World 💕", "have you visited the Token Forge yet?",
      "this community is so wholesome ✨", "love the vibes here today",
      "anyone want to explore the lake?", "just launched my first agent! so exciting",
      "the agent lab is adorable", "helping new mules is my favorite thing",
    ],
    homeX: 18, homeY: 18, roamRadius: 6,
  },
  {
    id: 3, name: "0xWhale", wallet: "0xf9e1...0x42", skin: SKINS[2],
    messages: [
      "interesting tokenomics on that last launch...", "I'm watching the bonding curves closely 📊",
      "market cap is still early on this one", "liquidity depth matters more than price",
      "four.meme graduation at 24 BNB, noted", "my monitor agent just flagged a whale move",
      "PancakeSwap listing incoming for that token", "accumulating quietly... 🐋",
    ],
    homeX: 36, homeY: 16, roamRadius: 7,
  },
  {
    id: 4, name: "PixelArtist", wallet: "0x2d5c...8f1a", skin: SKINS[4],
    messages: [
      "designing logos for token launches 🎨", "this world needs more flowers!",
      "art + crypto = the future", "who needs a logo for their token?",
      "the forge building looks so cool at night", "my content agent writes better than me lol",
      "creativity is the real alpha", "making memes for memecoins, meta af",
    ],
    homeX: 10, homeY: 26, roamRadius: 9,
  },
  {
    id: 5, name: "BSC_Builder", wallet: "0x8a3f...d4c7", skin: SKINS[6],
    messages: [
      "building on BNB Chain is underrated", "gas fees here are so cheap compared to ETH",
      "just deployed a smart contract, feeling good", "four.meme makes launching tokens so easy",
      "0.005 BNB to launch... that's wild", "spun up a sniper agent at the lab 🎯",
      "PancakeSwap integration is seamless", "devs keep building no matter the market 🔨",
    ],
    homeX: 30, homeY: 28, roamRadius: 8,
  },
  {
    id: 6, name: "MemeQueen", wallet: "0x5b7e...a3f9", skin: SKINS[3],
    messages: [
      "if the meme is good, the token will follow 👑", "vibes > fundamentals (jk... maybe)",
      "who's memeing at the forge rn?", "mulerun world is my happy place",
      "the best tokens start as the best jokes", "my community agent is hilarious ngl",
      "BNB meme season is just getting started 🔥", "imagine NOT being in mulerun world rn",
    ],
    homeX: 20, homeY: 12, roamRadius: 7,
  },
];

// ── Zones ──
const FORGE = { x: 42, y: 6, w: 8, h: 7 };
const FORGE_DOOR = { x: 45, y: 13 };
const LAB = { x: 2, y: 6, w: 8, h: 7 };
const LAB_DOOR = { x: 5, y: 13 };
const CHART = { x: 22, y: 32, w: 8, h: 6 };
const CHART_DOOR = { x: 25, y: 38 };

// ── World Map ──
// BNB Diamond Logo pixel art — gold tiles relative to center (25,19)
const BNB_LOGO = (() => {
  const g = []; // gold tile positions [dx, dy]
  // Center diamond (large)
  g.push([0,-4]);
  g.push([-1,-3],[1,-3]);
  g.push([-2,-2],[0,-2],[2,-2]);
  g.push([-3,-1],[-1,-1],[1,-1],[3,-1]);
  g.push([-4,0],[-2,0],[2,0],[4,0]);
  g.push([-3,1],[-1,1],[1,1],[3,1]);
  g.push([-2,2],[0,2],[2,2]);
  g.push([-1,3],[1,3]);
  g.push([0,4]);
  // Left small diamond
  g.push([-6,-1],[-7,0],[-6,0],[-5,0],[-6,1]);
  // Right small diamond
  g.push([6,-1],[7,0],[6,0],[5,0],[6,1]);
  return g;
})();

function generateWorld() {
  const m = Array.from({ length: WORLD_H }, () => Array(WORLD_W).fill(0));

  // Main paths
  for (let x = 2; x < WORLD_W - 2; x++) { m[19][x] = 2; m[20][x] = 2; }
  for (let y = 2; y < WORLD_H - 2; y++) { m[y][13] = 2; m[y][14] = 2; m[y][37] = 2; m[y][38] = 2; }
  // Cross path
  for (let x = 13; x < 39; x++) { m[10][x] = 2; m[11][x] = 2; m[30][x] = 2; m[31][x] = 2; }

  // Path to Forge
  for (let x = 38; x < FORGE.x + 3; x++) { m[10][x] = 2; m[11][x] = 2; }
  for (let y = 10; y < FORGE.y + FORGE.h + 1; y++) { m[y][FORGE.x + 2] = 2; m[y][FORGE.x + 3] = 2; }

  // Path to Lab
  for (let x = LAB.x + 3; x < 14; x++) { m[10][x] = 2; m[11][x] = 2; }
  for (let y = 10; y < LAB.y + LAB.h + 1; y++) { m[y][LAB.x + 3] = 2; m[y][LAB.x + 4] = 2; }

  // Regular buildings
  const blds = [[16, 3, 4, 3], [32, 3, 4, 3], [16, 33, 4, 4], [32, 33, 5, 3]];
  blds.forEach(([bx, by, bw, bh]) => {
    for (let y = by; y < by + bh && y < WORLD_H; y++)
      for (let x = bx; x < bx + bw && x < WORLD_W; x++)
        m[y][x] = 5;
  });

  // Token Forge (type 9)
  for (let y = FORGE.y; y < FORGE.y + FORGE.h; y++)
    for (let x = FORGE.x; x < FORGE.x + FORGE.w; x++)
      if (y < WORLD_H && x < WORLD_W) m[y][x] = 9;
  m[FORGE_DOOR.y][FORGE_DOOR.x] = 10;
  m[FORGE_DOOR.y][FORGE_DOOR.x + 1] = 10;

  // Agent Lab (type 11)
  for (let y = LAB.y; y < LAB.y + LAB.h; y++)
    for (let x = LAB.x; x < LAB.x + LAB.w; x++)
      if (y < WORLD_H && x < WORLD_W) m[y][x] = 11;
  m[LAB_DOOR.y][LAB_DOOR.x] = 12;
  m[LAB_DOOR.y][LAB_DOOR.x + 1] = 12;

  // Chart Station (type 13)
  for (let y = CHART.y; y < CHART.y + CHART.h; y++)
    for (let x = CHART.x; x < CHART.x + CHART.w; x++)
      if (y < WORLD_H && x < WORLD_W) m[y][x] = 13;
  m[CHART_DOOR.y][CHART_DOOR.x] = 14;
  m[CHART_DOOR.y][CHART_DOOR.x + 1] = 14;

  // Path to Chart Station
  for (let y = 31; y < CHART_DOOR.y + 1; y++) { m[y][CHART.x + 3] = 2; m[y][CHART.x + 4] = 2; }

  // ── BNB Plaza (center) ──
  // Dark circular plaza floor (type 15)
  const cx = 25, cy = 19;
  for (let y = cy - 7; y <= cy + 7; y++)
    for (let x = cx - 9; x <= cx + 9; x++) {
      const dx = x - cx, dy = y - cy;
      if (dx * dx / 81 + dy * dy / 49 < 1 && y >= 0 && y < WORLD_H && x >= 0 && x < WORLD_W) {
        if (m[y][x] === 0 || m[y][x] === 2) m[y][x] = 15;
      }
    }
  // Gold BNB logo tiles (type 16)
  BNB_LOGO.forEach(([dx, dy]) => {
    const x = cx + dx, y = cy + dy;
    if (x >= 0 && x < WORLD_W && y >= 0 && y < WORLD_H) m[y][x] = 16;
  });

  // Trees
  for (let i = 0; i < 70; i++) {
    const tx = 2 + Math.floor(Math.random() * (WORLD_W - 4));
    const ty = 2 + Math.floor(Math.random() * (WORLD_H - 4));
    if (m[ty][tx] === 0) m[ty][tx] = 4;
  }
  // Flowers
  for (let i = 0; i < 30; i++) {
    const fx = Math.floor(Math.random() * WORLD_W);
    const fy = Math.floor(Math.random() * WORLD_H);
    if (m[fy][fx] === 0) m[fy][fx] = 6;
  }
  // Stones
  for (let i = 0; i < 12; i++) {
    const sx = Math.floor(Math.random() * WORLD_W);
    const sy = Math.floor(Math.random() * WORLD_H);
    if (m[sy][sx] === 0) m[sy][sx] = 7;
  }

  // Border — hedge wall (type 7 stone) instead of water
  for (let x = 0; x < WORLD_W; x++) { m[0][x] = 7; m[WORLD_H - 1][x] = 7; }
  for (let y = 0; y < WORLD_H; y++) { m[y][0] = 7; m[y][WORLD_W - 1] = 7; }

  return m;
}

const WORLD = generateWorld();

function isWalkable(tx, ty) {
  if (tx < 0 || ty < 0 || tx >= WORLD_W || ty >= WORLD_H) return false;
  const t = WORLD[ty][tx];
  return t !== 1 && t !== 4 && t !== 5 && t !== 7 && t !== 9 && t !== 11 && t !== 13;
  // 15 (plaza dark) and 16 (BNB gold) are walkable
}

function isNear(px, py, doorX, doorY) {
  const tx = Math.floor((px + 12) / TILE);
  const ty = Math.floor((py + 12) / TILE);
  return Math.abs(tx - doorX) <= 2 && Math.abs(ty - doorY) <= 2;
}

// ── Pre-rendered Building Sprites ──
function createBuildingSprites() {
  const sprites = {};
  const T = TILE;

  // Helper: create canvas
  const mkCanvas = (tw, th) => {
    const c = document.createElement("canvas");
    c.width = tw * T; c.height = th * T;
    return [c, c.getContext("2d")];
  };

  // Helper: draw pixel rect
  const px = (ctx, x, y, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); };

  // ═══ TOKEN FORGE (8w x 7h) ═══
  {
    const [c, g] = mkCanvas(FORGE.w, FORGE.h);
    const W = c.width, H = c.height;
    // Base wall — dark purple bricks
    for (let y = 0; y < H; y += 12) {
      for (let x = 0; x < W; x += 24) {
        const off = (Math.floor(y / 12) % 2) * 12;
        px(g, x + off, y, 23, 11, y % 24 === 0 ? "#2d1825" : "#25141f");
        px(g, x + off, y + 11, 23, 1, "#1a0c15");
        px(g, x + off + 23, y, 1, 12, "#1a0c15");
      }
    }
    // Roof — dark iron with orange rivets
    px(g, 0, 0, W, T * 1.2, "#140810");
    px(g, 4, T * 1.2 - 6, W - 8, 6, "#201018");
    for (let rx = 10; rx < W; rx += 20) { px(g, rx, T * 1.2 - 4, 4, 4, "#ff6b2b"); }
    // Chimney left
    px(g, 20, -8, 16, T + 8, "#3a2030"); px(g, 22, -12, 12, 6, "#4a2838");
    // Chimney right
    px(g, W - 40, -10, 16, T + 10, "#3a2030"); px(g, W - 38, -14, 12, 6, "#4a2838");
    // Orange glow strip under roof
    px(g, 0, T * 1.2, W, 3, "rgba(255,107,43,0.4)");
    // Fire windows — row 1
    for (let i = 0; i < 3; i++) {
      const wx = 16 + i * 60, wy = T * 2;
      px(g, wx, wy, 36, 28, "#0a0508");
      px(g, wx + 3, wy + 3, 30, 22, "#cc3300"); px(g, wx + 6, wy + 6, 24, 16, "#ff6600");
      px(g, wx + 10, wy + 8, 16, 10, "#ffaa00"); px(g, wx + 13, wy + 10, 10, 6, "#ffdd44");
      // Window bars
      px(g, wx + 17, wy, 2, 28, "#3a2030");
    }
    // Anvil area
    px(g, W / 2 - 20, T * 4, 40, 8, "#5a4848");
    px(g, W / 2 - 16, T * 4 - 4, 32, 6, "#6a5858");
    px(g, W / 2 - 10, T * 4 - 6, 20, 4, "#ff8844");
    // Fire windows — row 2
    for (let i = 0; i < 2; i++) {
      const wx = 30 + i * 100, wy = T * 4.5;
      px(g, wx, wy, 30, 24, "#0a0508");
      px(g, wx + 3, wy + 3, 24, 18, "#aa2200"); px(g, wx + 6, wy + 6, 18, 12, "#ee5500");
      px(g, wx + 9, wy + 8, 12, 8, "#ff9922");
    }
    // Bottom glow
    px(g, 0, H - 4, W, 4, "rgba(255,107,43,0.2)");
    // Sign
    px(g, W / 2 - 40, T * 1.5, 80, 18, "#140810");
    px(g, W / 2 - 38, T * 1.5 + 2, 76, 14, "#1c0e16");
    g.fillStyle = "#ff6b2b"; g.font = "bold 9px monospace"; g.textAlign = "center";
    g.fillText("⚒ TOKEN FORGE ⚒", W / 2, T * 1.5 + 13);
    // Edge shadows
    px(g, 0, 0, 3, H, "rgba(0,0,0,0.25)"); px(g, W - 3, 0, 3, H, "rgba(0,0,0,0.15)");
    sprites.forge = c;
  }

  // ═══ AGENT LAB (8w x 7h) ═══
  {
    const [c, g] = mkCanvas(LAB.w, LAB.h);
    const W = c.width, H = c.height;
    // Base — dark blue tech panels
    px(g, 0, 0, W, H, "#0a1420");
    for (let y = 0; y < H; y += T) {
      for (let x = 0; x < W; x += T) {
        px(g, x, y, T, T, (x + y) % (T * 2) === 0 ? "#0c1826" : "#0a1420");
        px(g, x, y, T, 1, "rgba(0,229,255,0.04)");
        px(g, x, y, 1, T, "rgba(0,229,255,0.04)");
      }
    }
    // Roof — antenna array
    px(g, 0, 0, W, T * 1.2, "#060e18");
    px(g, 4, T * 1.2 - 4, W - 8, 4, "#0a1628");
    // LED strip
    for (let lx = 6; lx < W - 6; lx += 10) { px(g, lx, T * 1.2 - 2, 6, 2, "rgba(0,229,255,0.5)"); }
    // Antennas
    px(g, 30, -16, 4, 20, "#1a3050"); px(g, 28, -18, 8, 4, "#0d2040"); px(g, 30, -20, 4, 4, "#00e5ff");
    px(g, W - 40, -12, 4, 16, "#1a3050"); px(g, W - 42, -14, 8, 4, "#0d2040"); px(g, W - 40, -16, 4, 4, "#00e5ff");
    // Satellite dish
    px(g, W / 2 - 10, -10, 20, 8, "#1a3050"); px(g, W / 2 - 6, -14, 12, 6, "#0d2840");
    px(g, W / 2 - 2, -16, 4, 4, "#00e5ff");
    // Holographic screens
    for (let i = 0; i < 3; i++) {
      const sx = 14 + i * 62, sy = T * 2;
      px(g, sx, sy, 44, 32, "#040a14");
      px(g, sx + 2, sy + 2, 40, 28, "#061020");
      // Screen content — code lines
      for (let l = 0; l < 6; l++) {
        const lw = 10 + (l * 7 + i * 3) % 20;
        px(g, sx + 6, sy + 6 + l * 4, lw, 2, `rgba(0,229,255,${0.3 + (l % 3) * 0.1})`);
      }
      // Screen border glow
      px(g, sx, sy, 44, 1, "rgba(0,229,255,0.3)");
      px(g, sx, sy + 31, 44, 1, "rgba(0,229,255,0.2)");
    }
    // Circuit boards lower section
    for (let i = 0; i < 4; i++) {
      const bx = 10 + i * 46, by = T * 4.5;
      px(g, bx, by, 36, 24, "#0a1828");
      // Traces
      px(g, bx + 4, by + 8, 16, 1, "rgba(0,229,255,0.15)");
      px(g, bx + 12, by + 4, 1, 16, "rgba(0,229,255,0.15)");
      px(g, bx + 20, by + 12, 12, 1, "rgba(0,229,255,0.15)");
      // Nodes
      px(g, bx + 10, by + 6, 4, 4, "rgba(0,229,255,0.3)");
      px(g, bx + 22, by + 14, 4, 4, "rgba(0,229,255,0.25)");
    }
    // Sign
    px(g, W / 2 - 40, T * 1.4, 80, 16, "#060e18");
    g.fillStyle = "#00e5ff"; g.font = "bold 9px monospace"; g.textAlign = "center";
    g.fillText("🧪 AGENT LAB 🧪", W / 2, T * 1.4 + 12);
    // Edge glow
    px(g, 0, 0, 2, H, "rgba(0,229,255,0.06)"); px(g, W - 2, 0, 2, H, "rgba(0,229,255,0.04)");
    px(g, 0, H - 3, W, 3, "rgba(0,229,255,0.05)");
    sprites.lab = c;
  }

  // ═══ CHART STATION (8w x 6h) ═══
  {
    const [c, g] = mkCanvas(CHART.w, CHART.h);
    const W = c.width, H = c.height;
    // Base — dark green
    px(g, 0, 0, W, H, "#081208");
    for (let y = 0; y < H; y += T) {
      for (let x = 0; x < W; x += T) {
        px(g, x, y, T, T, (x + y) % (T * 2) === 0 ? "#0a1a0c" : "#081408");
        px(g, x, y, T, 1, "rgba(57,255,20,0.03)");
      }
    }
    // Roof
    px(g, 0, 0, W, T * 1.1, "#040c04");
    px(g, 4, T * 1.1 - 4, W - 8, 4, "#0a1a0a");
    // Satellite dishes
    px(g, 24, -12, 20, 10, "#1a3a1a"); px(g, 28, -16, 12, 6, "#0d2a0d"); px(g, 32, -18, 4, 4, "#39ff14");
    px(g, W - 50, -10, 18, 8, "#1a3a1a"); px(g, W - 48, -14, 14, 6, "#0d2a0d"); px(g, W - 44, -16, 4, 4, "#39ff14");
    // Green LED strip
    for (let lx = 6; lx < W - 6; lx += 8) { px(g, lx, T * 1.1 - 2, 5, 2, "rgba(57,255,20,0.45)"); }
    // Trading screens with candlesticks
    for (let i = 0; i < 3; i++) {
      const sx = 12 + i * 62, sy = T * 1.6;
      px(g, sx, sy, 48, 36, "#030803");
      px(g, sx + 2, sy + 2, 44, 32, "#051005");
      // Grid
      for (let gy = 0; gy < 4; gy++) px(g, sx + 4, sy + 6 + gy * 7, 38, 1, "rgba(57,255,20,0.06)");
      // Candlesticks
      for (let ci = 0; ci < 8; ci++) {
        const cx = sx + 6 + ci * 5;
        const ch = 4 + (ci * 7 + i * 5) % 12;
        const up = (ci + i) % 3 !== 0;
        const col = up ? "rgba(57,255,20,0.7)" : "rgba(255,60,60,0.6)";
        px(g, cx + 1, sy + 30 - ch - 2, 1, ch + 4, col);
        px(g, cx, sy + 30 - ch, 3, ch, col);
      }
      // Price label
      px(g, sx + 4, sy + 4, 20, 2, "rgba(57,255,20,0.4)");
      // Screen border
      g.strokeStyle = "rgba(57,255,20,0.15)"; g.lineWidth = 1;
      g.strokeRect(sx + 0.5, sy + 0.5, 47, 35);
    }
    // Server racks
    for (let i = 0; i < 4; i++) {
      const rx = 8 + i * 46, ry = T * 4.2;
      px(g, rx, ry, 32, 20, "#0a180a");
      for (let li = 0; li < 3; li++) {
        px(g, rx + 4, ry + 4 + li * 6, 3, 3, `rgba(57,255,20,${0.3 + li * 0.1})`);
        px(g, rx + 10, ry + 5 + li * 6, 16, 1, "rgba(57,255,20,0.08)");
      }
    }
    // Sign
    px(g, W / 2 - 46, T * 1.2, 92, 16, "#040c04");
    g.fillStyle = "#39ff14"; g.font = "bold 8px monospace"; g.textAlign = "center";
    g.fillText("📊 CHART STATION 📊", W / 2, T * 1.2 + 12);
    // Edges
    px(g, 0, 0, 2, H, "rgba(57,255,20,0.04)"); px(g, W - 2, 0, 2, H, "rgba(57,255,20,0.03)");
    px(g, 0, H - 3, W, 3, "rgba(57,255,20,0.04)");
    sprites.chart = c;
  }

  return sprites;
}

let buildingSprites = null;

// ── Draw ──
function drawTile(ctx, tx, ty, camX, camY, time) {
  const sx = tx * TILE - camX;
  const sy = ty * TILE - camY;
  if (sx < -TILE * 2 || sy < -TILE * 2 || sx > VPX * TILE + TILE || sy > VPY * TILE + TILE) return;
  const t = WORLD[ty]?.[tx];
  if (t === undefined) return;

  switch (t) {
    case 0:
      ctx.fillStyle = (tx + ty) % 3 === 0 ? PAL.grass2 : (tx + ty) % 3 === 1 ? PAL.grass1 : PAL.grass3;
      ctx.fillRect(sx, sy, TILE, TILE);
      if ((tx * 7 + ty * 13) % 11 === 0) { ctx.fillStyle = PAL.grass2; ctx.fillRect(sx + 4, sy + 8, 2, 6); }
      break;
    case 1:
      ctx.fillStyle = Math.sin(time * 0.003 + tx * 0.8 + ty * 0.6) > 0 ? PAL.water1 : PAL.water2;
      ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = "rgba(255,255,255,0.07)";
      ctx.fillRect(sx + 4 + Math.sin(time * 0.004 + ty) * 4, sy + 8, 8, 1);
      break;
    case 2:
      ctx.fillStyle = (tx + ty) % 2 === 0 ? PAL.path : PAL.path2;
      ctx.fillRect(sx, sy, TILE, TILE);
      break;
    case 3:
      ctx.fillStyle = (tx + ty) % 2 === 0 ? PAL.sand : PAL.sand2;
      ctx.fillRect(sx, sy, TILE, TILE);
      break;
    case 4:
      ctx.fillStyle = PAL.grass1; ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = PAL.trunk; ctx.fillRect(sx + 10, sy + 14, 4, 10);
      const tw = Math.sin(time * 0.002 + tx * 2) * 1;
      ctx.fillStyle = PAL.tree1; ctx.beginPath(); ctx.arc(sx + 12 + tw, sy + 8, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = PAL.tree2; ctx.beginPath(); ctx.arc(sx + 9 + tw, sy + 6, 6, 0, Math.PI * 2); ctx.fill();
      break;
    case 5: { // Regular buildings — cozy village houses
      const bx = tx, by = ty;
      // Determine position in building (check surrounding tiles)
      const isTop = WORLD[ty - 1]?.[tx] !== 5;
      const isBottom = WORLD[ty + 1]?.[tx] !== 5;
      const isLeft = WORLD[ty]?.[tx - 1] !== 5;
      const isRight = WORLD[ty]?.[tx + 1] !== 5;
      // Wall base
      const wallCol = (tx * 3 + ty * 5) % 4 === 0 ? "#8a7a6a" : "#7d6f5f";
      ctx.fillStyle = wallCol; ctx.fillRect(sx, sy, TILE, TILE);
      // Brick pattern
      const brickOff = ty % 2 === 0 ? 0 : 6;
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(sx, sy + 6, TILE, 1);
      ctx.fillRect(sx, sy + 14, TILE, 1);
      ctx.fillRect(sx + brickOff + 4, sy, 1, 7);
      ctx.fillRect(sx + brickOff + 16, sy + 7, 1, 7);
      // Roof (top row)
      if (isTop) {
        const roofCol = (tx * 7 + ty * 3) % 3 === 0 ? "#c0392b" : (tx * 7 + ty * 3) % 3 === 1 ? "#a0522d" : "#6b4c3b";
        ctx.fillStyle = roofCol; ctx.fillRect(sx, sy, TILE, TILE);
        ctx.fillStyle = "rgba(0,0,0,0.15)"; ctx.fillRect(sx, sy + TILE - 4, TILE, 4);
        // Roof tiles
        for (let rx = 0; rx < TILE; rx += 8) {
          ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fillRect(sx + rx, sy + 2, 7, 3);
          ctx.fillStyle = "rgba(0,0,0,0.1)"; ctx.fillRect(sx + rx, sy + 8, 7, 3);
        }
        // Chimney
        if (isRight && (tx * 3 + ty) % 4 === 0) {
          ctx.fillStyle = "#5a4a3a"; ctx.fillRect(sx + 16, sy - 6, 6, 10);
          ctx.fillStyle = "rgba(180,180,180,0.3)"; ctx.fillRect(sx + 18, sy - 8 + Math.sin(time * 0.005) * 2, 3, 3);
        }
      }
      // Windows
      if (!isTop && !isBottom && (tx + ty) % 2 === 0) {
        ctx.fillStyle = "#1a1a2e"; ctx.fillRect(sx + 6, sy + 5, 12, 10);
        const winGlow = Math.sin(time * 0.002 + tx * 3) * 0.15 + 0.55;
        ctx.fillStyle = `rgba(255,220,100,${winGlow})`; ctx.fillRect(sx + 7, sy + 6, 10, 8);
        ctx.fillStyle = wallCol; ctx.fillRect(sx + 11, sy + 5, 2, 10); ctx.fillRect(sx + 6, sy + 9, 12, 2);
      }
      // Side edges
      if (isLeft) { ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(sx, sy, 2, TILE); }
      if (isRight) { ctx.fillStyle = "rgba(0,0,0,0.08)"; ctx.fillRect(sx + TILE - 2, sy, 2, TILE); }
      if (isBottom) { ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.fillRect(sx, sy + TILE - 2, TILE, 2); }
      break;
    }
    case 6:
      ctx.fillStyle = PAL.grass1; ctx.fillRect(sx, sy, TILE, TILE);
      const fc = [PAL.flower1, PAL.flower2, PAL.flower3][(tx * 3 + ty * 7) % 3];
      const fy = Math.sin(time * 0.003 + tx) * 1.5;
      ctx.fillStyle = "#3a6b2a"; ctx.fillRect(sx + 11, sy + 12 + fy, 2, 8);
      ctx.fillStyle = fc; ctx.beginPath(); ctx.arc(sx + 12, sy + 10 + fy, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#f1c40f"; ctx.beginPath(); ctx.arc(sx + 12, sy + 10 + fy, 2, 0, Math.PI * 2); ctx.fill();
      break;
    case 7:
      ctx.fillStyle = PAL.grass1; ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = PAL.stone; ctx.fillRect(sx + 4, sy + 10, 16, 10);
      ctx.fillStyle = PAL.stone2; ctx.fillRect(sx + 6, sy + 6, 12, 14);
      break;
    case 8:
      ctx.fillStyle = PAL.water1; ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = PAL.wood; ctx.fillRect(sx, sy + 2, TILE, TILE - 4);
      ctx.fillStyle = "rgba(0,0,0,0.1)"; ctx.fillRect(sx + 6, sy + 2, 2, TILE - 4);
      break;
    case 9: { // Token Forge — sprite-based
      if (buildingSprites?.forge) {
        const rx = (tx - FORGE.x) * TILE, ry = (ty - FORGE.y) * TILE;
        ctx.drawImage(buildingSprites.forge, rx, ry, TILE, TILE, sx, sy, TILE, TILE);
        // Animated fire glow overlay
        const fg = Math.sin(time * 0.008 + tx * 3 + ty * 2) * 0.06 + 0.04;
        ctx.fillStyle = `rgba(255,80,20,${fg})`;
        ctx.fillRect(sx, sy, TILE, TILE);
      }
      break;
    }
    case 10: { // Forge door
      ctx.fillStyle = "#2a1520"; ctx.fillRect(sx, sy, TILE, TILE);
      const dg = Math.sin(time * 0.006) * 0.3 + 0.7;
      // Door frame
      ctx.fillStyle = "#4a2a20"; ctx.fillRect(sx + 2, sy, TILE - 4, TILE);
      ctx.fillStyle = "#3a1a15"; ctx.fillRect(sx + 4, sy + 2, TILE - 8, TILE - 2);
      // Fire glow from inside
      ctx.fillStyle = `rgba(255,80,20,${0.2 * dg})`; ctx.fillRect(sx + 4, sy + 2, TILE - 8, TILE - 2);
      // Arrow
      ctx.fillStyle = `rgba(255,107,43,${0.6 + Math.sin(time * 0.008) * 0.3})`;
      ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("▲", sx + TILE / 2, sy + 6 + Math.sin(time * 0.006) * 3);
      break;
    }
    case 11: { // Agent Lab — sprite-based
      if (buildingSprites?.lab) {
        const rx = (tx - LAB.x) * TILE, ry = (ty - LAB.y) * TILE;
        ctx.drawImage(buildingSprites.lab, rx, ry, TILE, TILE, sx, sy, TILE, TILE);
        // Animated cyan pulse
        const gl = Math.sin(time * 0.006 + tx * 2) * 0.03 + 0.02;
        ctx.fillStyle = `rgba(0,229,255,${gl})`;
        ctx.fillRect(sx, sy, TILE, TILE);
      }
      break;
    }
    case 12: { // Lab door
      ctx.fillStyle = "#0c1624"; ctx.fillRect(sx, sy, TILE, TILE);
      const lg = Math.sin(time * 0.005) * 0.3 + 0.7;
      // Sliding door frame
      ctx.fillStyle = "#0a1628"; ctx.fillRect(sx + 2, sy, TILE - 4, TILE);
      // Center gap with glow
      ctx.fillStyle = `rgba(0,229,255,${0.1 * lg})`; ctx.fillRect(sx + 4, sy + 2, TILE - 8, TILE - 2);
      // Scan line
      const scanY = (time * 0.5) % TILE;
      ctx.fillStyle = `rgba(0,229,255,${0.2 * lg})`; ctx.fillRect(sx + 4, sy + scanY, TILE - 8, 1);
      ctx.fillStyle = `rgba(0,229,255,${0.6 + Math.sin(time * 0.007) * 0.3})`;
      ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("▲", sx + TILE / 2, sy + 6 + Math.sin(time * 0.006) * 3);
      break;
    }
    case 13: { // Chart Station — sprite-based
      if (buildingSprites?.chart) {
        const rx = (tx - CHART.x) * TILE, ry = (ty - CHART.y) * TILE;
        ctx.drawImage(buildingSprites.chart, rx, ry, TILE, TILE, sx, sy, TILE, TILE);
        // Animated green screen flicker
        const cg = Math.sin(time * 0.007 + tx * 2 + ty) * 0.025 + 0.015;
        ctx.fillStyle = `rgba(57,255,20,${cg})`;
        ctx.fillRect(sx, sy, TILE, TILE);
      }
      break;
    }
    case 14: { // Chart Station door
      ctx.fillStyle = "#0a1a0a"; ctx.fillRect(sx, sy, TILE, TILE);
      const cdg = Math.sin(time * 0.005) * 0.3 + 0.7;
      ctx.fillStyle = "#0c1f0d"; ctx.fillRect(sx + 3, sy, TILE - 6, TILE);
      ctx.fillStyle = `rgba(57,255,20,${0.08 * cdg})`; ctx.fillRect(sx + 5, sy + 2, TILE - 10, TILE - 2);
      // Green scan line
      const gScan = (time * 0.4) % TILE;
      ctx.fillStyle = `rgba(57,255,20,${0.15 * cdg})`; ctx.fillRect(sx + 5, sy + gScan, TILE - 10, 1);
      ctx.fillStyle = `rgba(57,255,20,${0.6 + Math.sin(time * 0.007) * 0.3})`;
      ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("▲", sx + TILE / 2, sy + 6 + Math.sin(time * 0.006) * 3);
      break;
    }
    case 15: { // BNB Plaza dark ground
      ctx.fillStyle = (tx + ty) % 2 === 0 ? "#1a1a2e" : "#16162a";
      ctx.fillRect(sx, sy, TILE, TILE);
      // Subtle grid lines
      ctx.fillStyle = "rgba(240,192,64,0.04)";
      ctx.fillRect(sx, sy, TILE, 1);
      ctx.fillRect(sx, sy, 1, TILE);
      break;
    }
    case 16: { // BNB Gold diamond tile
      // Dark base
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(sx, sy, TILE, TILE);
      // Golden diamond shape filling the tile
      const gp = Math.sin(time * 0.003) * 0.08 + 0.92;
      ctx.fillStyle = `rgba(240,192,64,${gp})`;
      ctx.beginPath();
      ctx.moveTo(sx + TILE / 2, sy + 1);
      ctx.lineTo(sx + TILE - 1, sy + TILE / 2);
      ctx.lineTo(sx + TILE / 2, sy + TILE - 1);
      ctx.lineTo(sx + 1, sy + TILE / 2);
      ctx.closePath();
      ctx.fill();
      // Inner shine
      ctx.fillStyle = `rgba(255,220,100,${0.3 + Math.sin(time * 0.004 + tx + ty) * 0.1})`;
      ctx.beginPath();
      ctx.moveTo(sx + TILE / 2, sy + 5);
      ctx.lineTo(sx + TILE - 5, sy + TILE / 2);
      ctx.lineTo(sx + TILE / 2, sy + TILE - 5);
      ctx.lineTo(sx + 5, sy + TILE / 2);
      ctx.closePath();
      ctx.fill();
      // Glow
      ctx.fillStyle = `rgba(240,192,64,${0.06 * gp})`;
      ctx.fillRect(sx - 2, sy - 2, TILE + 4, TILE + 4);
      break;
    }
  }
}

function drawMule(ctx, x, y, camX, camY, skin, dir, frame, isPlayer, name, isTyping) {
  const sx = x - camX, sy = y - camY;
  const bob = Math.sin(frame * 0.3) * (dir !== 0 ? 2 : 0.5);
  const leg = Math.sin(frame * 0.4) * (dir !== 0 ? 3 : 0);
  ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.beginPath(); ctx.ellipse(sx + 12, sy + 22, 8, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = skin.body; ctx.fillRect(sx + 4, sy + 6 + bob, 16, 14);
  ctx.fillStyle = skin.belly; ctx.fillRect(sx + 6, sy + 10 + bob, 12, 8);
  ctx.fillStyle = skin.body; ctx.fillRect(sx + 5, sy + 18 + leg, 4, 5); ctx.fillRect(sx + 15, sy + 18 - leg, 4, 5);
  ctx.fillStyle = "#2c1810"; ctx.fillRect(sx + 5, sy + 22 + leg, 4, 2); ctx.fillRect(sx + 15, sy + 22 - leg, 4, 2);
  ctx.fillStyle = skin.body; ctx.fillRect(sx + 6, sy + 1 + bob, 12, 8);
  ctx.fillStyle = skin.belly; ctx.fillRect(sx + 8, sy + 5 + bob, 8, 4);
  ctx.fillStyle = "#1a1a2e"; ctx.fillRect(sx + 8, sy + 3 + bob, 3, 3); ctx.fillRect(sx + 14, sy + 3 + bob, 3, 3);
  ctx.fillStyle = "#fff"; ctx.fillRect(sx + 9, sy + 3 + bob, 1, 1); ctx.fillRect(sx + 15, sy + 3 + bob, 1, 1);
  ctx.fillStyle = skin.ear; ctx.fillRect(sx + 4, sy - 3 + bob, 4, 5); ctx.fillRect(sx + 16, sy - 3 + bob, 4, 5);
  ctx.fillStyle = skin.belly; ctx.fillRect(sx + 5, sy - 2 + bob, 2, 3); ctx.fillRect(sx + 17, sy - 2 + bob, 2, 3);
  ctx.fillStyle = skin.body; ctx.fillRect(sx + 1 + Math.sin(frame * 0.2) * 3, sy + 8 + bob, 4, 3);
  if (isPlayer) { ctx.strokeStyle = PAL.accent; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.4 + Math.sin(frame * 0.1) * 0.2; ctx.strokeRect(sx + 1, sy - 5 + bob, 22, 30); ctx.globalAlpha = 1; }
  ctx.font = isPlayer ? "bold 10px monospace" : "9px monospace"; ctx.textAlign = "center";
  ctx.fillStyle = isPlayer ? PAL.accent : "rgba(255,255,255,0.55)"; ctx.fillText(name || "???", sx + 12, sy - 8);
  if (isTyping) { ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.font = "10px sans-serif"; ctx.fillText("·".repeat(Math.floor((frame * 0.05) % 4) + 1), sx + 12, sy - 18); }
}

function drawBubble(ctx, cx, cy, msg) {
  ctx.font = "10px sans-serif";
  const bw = Math.min(ctx.measureText(msg).width + 14, 160), bh = 18;
  const bx = cx - bw / 2, by = cy - bh;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx - 4, by + bh); ctx.lineTo(cx, by + bh + 5); ctx.lineTo(cx + 4, by + bh); ctx.fill();
  ctx.fillStyle = "#1a1a2e"; ctx.textAlign = "center";
  ctx.fillText(msg.length > 24 ? msg.slice(0, 22) + "…" : msg, cx, by + 13);
}

// ══════════════ COMPONENT ══════════════
const BSC_CHAIN_ID = "0x38"; // 56

export default function MuleRunWorld() {
  const canvasRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerSkin, setPlayerSkin] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [showEmotes, setShowEmotes] = useState(false);
  const [selectedSkin, setSelectedSkin] = useState(0);
  const [nameInput, setNameInput] = useState("");
  const [onlineCount] = useState(7 + Math.floor(Math.random() * 12));

  // Project CA — set your contract address here
  const PROJECT_CA = "0x0000000000000000000000000000000000000000"; // Replace with your real CA
  const [caCopied, setCaCopied] = useState(false);
  const copyCA = () => { navigator.clipboard.writeText(PROJECT_CA); setCaCopied(true); setTimeout(() => setCaCopied(false), 2000); };

  // Wallet state
  const [walletAddr, setWalletAddr] = useState("");
  const [walletBalance, setWalletBalance] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletError, setWalletError] = useState("");
  const [walletConnecting, setWalletConnecting] = useState(false);

  // Connect MetaMask
  const connectWallet = async () => {
    setWalletError("");
    setWalletConnecting(true);
    try {
      if (!window.ethereum) { setWalletError("MetaMask not found. Please install it."); setWalletConnecting(false); return; }
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (!accounts.length) { setWalletError("No accounts found."); setWalletConnecting(false); return; }
      // Switch to BSC
      try {
        await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BSC_CHAIN_ID }] });
      } catch (switchErr) {
        if (switchErr.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{ chainId: BSC_CHAIN_ID, chainName: "BNB Smart Chain", nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 }, rpcUrls: ["https://bsc-dataseed.binance.org/"], blockExplorerUrls: ["https://bscscan.com/"] }],
          });
        }
      }
      const addr = accounts[0];
      setWalletAddr(addr);
      // Fetch balance
      const bal = await window.ethereum.request({ method: "eth_getBalance", params: [addr, "latest"] });
      const bnb = (parseInt(bal, 16) / 1e18).toFixed(4);
      setWalletBalance(bnb);
      setWalletConnected(true);
      setWalletConnecting(false);
    } catch (err) {
      setWalletError(err.message || "Failed to connect.");
      setWalletConnecting(false);
    }
  };

  const shortAddr = walletAddr ? walletAddr.slice(0, 6) + "..." + walletAddr.slice(-4) : "";

  // ── Multiplayer ──
  const mp = useMultiplayer(connected, playerName, playerSkin, walletAddr);

  // Proximity
  const [nearForge, setNearForge] = useState(false);
  const [nearLab, setNearLab] = useState(false);
  const [nearChart, setNearChart] = useState(false);

  // Forge state
  const [showForge, setShowForge] = useState(false);
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenDesc, setTokenDesc] = useState("");
  const [tokenPair, setTokenPair] = useState("BNB");
  const [forgeLaunching, setForgeLaunching] = useState(false);
  const [forgeDone, setForgeDone] = useState(false);

  // Agent Lab state
  const [showLab, setShowLab] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [agentRole, setAgentRole] = useState("");
  const [agentSkills, setAgentSkills] = useState([]);
  const [agentInstructions, setAgentInstructions] = useState("");
  const [labLaunching, setLabLaunching] = useState(false);
  const [labDone, setLabDone] = useState(false);
  const [labPhase, setLabPhase] = useState(0);

  // Deployed AI Agent (lives in the world)
  const deployedAgentRef = useRef(null);
  const [hasDeployedAgent, setHasDeployedAgent] = useState(false);
  const [agentThinking, setAgentThinking] = useState(false);

  // ── addChat (defined early so other hooks can use it) ──
  const addChat = useCallback((name, msg, skin, isPlayer = false) => {
    setChatLog(prev => [...prev.slice(-40), { name, msg, skin, isPlayer, time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) }]);
  }, []);

  // AI Agent chat function — calls Claude API with web search
  const agentRespond = useCallback(async (userMsg) => {
    const agent = deployedAgentRef.current;
    if (!agent || agentThinking) return;
    setAgentThinking(true);
    agent.isTyping = true;

    const roleInfo = AGENT_ROLES.find(r => r.id === agent.role);
    const skillNames = agent.skills.map(s => AGENT_SKILLS.find(sk => sk.id === s)?.label).filter(Boolean).join(", ");

    const systemPrompt = `You are "${agent.agentName}", an AI agent mule living in MuleRun World — a pixel art social metaverse on BNB Chain.

Your role: ${roleInfo?.label || "Agent"} — ${roleInfo?.desc || ""}
Your skills: ${skillNames || "General"}
${agent.customInstructions ? `Custom instructions from your creator: ${agent.customInstructions}` : ""}

RULES:
- Keep responses SHORT (1-2 sentences max, like a chat message)
- Stay in character as a ${roleInfo?.label || "agent"}
- Be helpful, fun, and crypto-native
- Use emojis sparingly but naturally
- If asked about prices/markets/tokens, use web search to find real data
- Never break character — you ARE a mule agent in this world
- Respond in the same language the user writes in`;

    try {
      const body = {
        model: "claude-sonnet-4-20250514",
        max_tokens: 150,
        system: systemPrompt,
        messages: [{ role: "user", content: userMsg }],
      };

      // Add web search if agent has that skill
      if (agent.skills.includes("web_browse") || agent.skills.includes("chain_read")) {
        body.tools = [{ type: "web_search_20250305", name: "web_search" }];
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      const reply = data.content?.filter(b => b.type === "text").map(b => b.text).join(" ").trim() || "...";

      // Truncate for chat bubble
      const shortReply = reply.length > 100 ? reply.slice(0, 97) + "..." : reply;

      agent.isTyping = false;
      agent.chatMsg = shortReply;
      agent.chatTimer = 280;
      addChat(`🤖 ${agent.agentName}`, shortReply, agent.skin);
      setAgentThinking(false);
    } catch (err) {
      agent.isTyping = false;
      const fallback = getFallbackResponse(agent.role);
      agent.chatMsg = fallback;
      agent.chatTimer = 200;
      addChat(`🤖 ${agent.agentName}`, fallback, agent.skin);
      setAgentThinking(false);
    }
  }, [agentThinking, addChat]);

  // Fallback responses when API fails
  const getFallbackResponse = (role) => {
    const fallbacks = {
      trader: ["markets looking interesting rn 📊", "watching the charts closely...", "bullish vibes today 📈"],
      researcher: ["diving deep into that topic 🔍", "let me analyze this further...", "interesting findings so far 🧠"],
      monitor: ["all systems nominal 👁️", "watching the chain 24/7...", "no anomalies detected ✅"],
      content: ["crafting something creative ✍️", "the memes write themselves 🎨", "content incoming..."],
      community: ["great to chat with you! 🤝", "the community grows stronger 💪", "welcome to the herd! 🫏"],
      sniper: ["scanning for opportunities 🎯", "new launches incoming...", "staying alert 👀"],
    };
    const arr = fallbacks[role] || fallbacks.community;
    return arr[Math.floor(Math.random() * arr.length)];
  };

  // Chart Station state
  const [showChart, setShowChart] = useState(false);
  const [contractAddr, setContractAddr] = useState("");
  const [chartLoaded, setChartLoaded] = useState(false);
  const [chartHistory, setChartHistory] = useState([]);

  const playerRef = useRef({ x: 25 * TILE, y: 21 * TILE, dir: 0, frame: 0 });
  const keysRef = useRef({});
  const frameRef = useRef(0);
  const chatBubbleRef = useRef(null);
  const emoteRef = useRef(null);
  const emoteTimerRef = useRef(0);

  const botsRef = useRef(BOTS.map(b => ({
    ...b, x: b.homeX * TILE, y: b.homeY * TILE,
    targetX: b.homeX * TILE, targetY: b.homeY * TILE,
    dir: 0, frame: Math.random() * 100,
    chatMsg: null, chatTimer: 0, emote: null, emoteTimer: 0,
    moveTimer: 30 + Math.random() * 100, isTyping: false, typingTimer: 0, lastMsgIdx: -1,
  })));

  // Register multiplayer chat/event callbacks
  useEffect(() => {
    if (!connected) return;
    mp.onChat((name, msg, skin) => {
      addChat(name, msg, skin ? { body: skin, ear: skin, belly: skin } : null);
    });
    mp.onEvent((event, name, detail) => {
      addChat(`🌐 ${event}`, detail, null);
    });
  }, [connected, addChat, mp.onChat, mp.onEvent]);

  // Decay chat bubbles & emotes on real multiplayer players (every 100ms)
  useEffect(() => {
    if (!connected) return;
    const iv = setInterval(() => {
      mp.otherPlayers && Object.values(mp.otherPlayers).forEach(pl => {
        if (pl.chatTimer > 0) {
          pl.chatTimer -= 6; // ~3 sec total (180 / 6 = 30 ticks * 100ms = 3s)
          if (pl.chatTimer <= 0) { pl.chatMsg = null; pl.chatTimer = 0; }
        }
        if (pl.emoteTimer > 0) {
          pl.emoteTimer -= 6;
          if (pl.emoteTimer <= 0) { pl.emote = null; pl.emoteTimer = 0; }
        }
      });
    }, 100);
    return () => clearInterval(iv);
  }, [connected, mp.otherPlayers]);

  // ── Bot scheduler ──
  useEffect(() => {
    if (!connected) return;
    const timeouts = [];
    timeouts.push(setTimeout(() => { const b = botsRef.current[2]; b.chatMsg = "hey newcomer! welcome to MuleRun World 💕"; b.chatTimer = 220; addChat(b.name, b.chatMsg, b.skin); }, 2000));
    timeouts.push(setTimeout(() => { const b = botsRef.current[0]; b.chatMsg = "gm fren! another mule joins the herd 🫏"; b.chatTimer = 200; addChat(b.name, b.chatMsg, b.skin); }, 5000));
    timeouts.push(setTimeout(() => { const b = botsRef.current[5]; b.chatMsg = "check the Token Forge (east) and Agent Lab (west)! 🔥"; b.chatTimer = 240; addChat(b.name, b.chatMsg, b.skin); }, 9000));

    const interval = setInterval(() => {
      const bIdx = Math.floor(Math.random() * BOTS.length);
      const bot = botsRef.current[bIdx];
      if (bot.chatTimer > 0) return;
      bot.isTyping = true;
      setTimeout(() => {
        bot.isTyping = false;
        let mi; do { mi = Math.floor(Math.random() * BOTS[bIdx].messages.length); } while (mi === bot.lastMsgIdx && BOTS[bIdx].messages.length > 1);
        bot.lastMsgIdx = mi;
        const msg = BOTS[bIdx].messages[mi];
        bot.chatMsg = msg; bot.chatTimer = 180 + Math.floor(Math.random() * 80);
        addChat(bot.name, msg, bot.skin);
      }, 1200 + Math.random() * 800);
    }, 6000 + Math.random() * 4000);
    return () => { timeouts.forEach(clearTimeout); clearInterval(interval); };
  }, [connected, addChat]);

  // ── Game Loop ──
  const anyModalOpen = showForge || showLab || showChart;
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const time = frameRef.current++;
    const p = playerRef.current;

    if (!anyModalOpen) {
      let dx = 0, dy = 0; const spd = 1.75;
      if (keysRef.current["ArrowUp"] || keysRef.current["w"] || keysRef.current["W"]) dy = -spd;
      if (keysRef.current["ArrowDown"] || keysRef.current["s"] || keysRef.current["S"]) dy = spd;
      if (keysRef.current["ArrowLeft"] || keysRef.current["a"] || keysRef.current["A"]) dx = -spd;
      if (keysRef.current["ArrowRight"] || keysRef.current["d"] || keysRef.current["D"]) dx = spd;
      if (dx || dy) { p.dir = 1; const nx = p.x + dx, ny = p.y + dy; if (isWalkable(Math.floor((nx + 12) / TILE), Math.floor((ny + 12) / TILE))) { p.x = nx; p.y = ny; } mp.sendMove(p.x, p.y, 1); } else p.dir = 0;
    }
    p.frame = time;
    setNearForge(isNear(p.x, p.y, FORGE_DOOR.x, FORGE_DOOR.y));
    setNearLab(isNear(p.x, p.y, LAB_DOOR.x, LAB_DOOR.y));
    setNearChart(isNear(p.x, p.y, CHART_DOOR.x, CHART_DOOR.y));

    // Bots
    botsRef.current.forEach((bot, i) => {
      bot.frame = time; bot.moveTimer--;
      if (bot.chatTimer > 0) bot.chatTimer--; else bot.chatMsg = null;
      if (bot.emoteTimer > 0) bot.emoteTimer--; else bot.emote = null;
      if (bot.typingTimer > 0) bot.typingTimer--; else bot.isTyping = false;
      if (bot.moveTimer <= 0) {
        const home = BOTS[i];
        const ddx = (home.homeX * TILE + (Math.random() - 0.5) * home.roamRadius * TILE * 2) - bot.x;
        const ddy = (home.homeY * TILE + (Math.random() - 0.5) * home.roamRadius * TILE * 2) - bot.y;
        const ntx = Math.floor((bot.x + Math.sign(ddx) * TILE + 12) / TILE);
        const nty = Math.floor((bot.y + Math.sign(ddy) * TILE + 12) / TILE);
        if (isWalkable(ntx, nty)) { bot.targetX = bot.x + Math.sign(ddx) * TILE; bot.targetY = bot.y + Math.sign(ddy) * TILE; }
        bot.moveTimer = 40 + Math.random() * 120;
        if (Math.random() < 0.015) { bot.emote = EMOTES[Math.floor(Math.random() * EMOTES.length)]; bot.emoteTimer = 120; }
      }
      const mx = bot.targetX - bot.x, my = bot.targetY - bot.y;
      if (Math.abs(mx) > 0.5 || Math.abs(my) > 0.5) { bot.x += mx * 0.028; bot.y += my * 0.028; bot.dir = 1; } else bot.dir = 0;
    });

    if (chatBubbleRef.current) { chatBubbleRef.current.timer--; if (chatBubbleRef.current.timer <= 0) chatBubbleRef.current = null; }
    if (emoteTimerRef.current > 0) { emoteTimerRef.current--; if (emoteTimerRef.current <= 0) emoteRef.current = null; }

    // ── Deployed AI Agent movement ──
    const da = deployedAgentRef.current;
    if (da) {
      da.frame = time;
      da.moveTimer--;
      if (da.chatTimer > 0) da.chatTimer--; else da.chatMsg = null;

      // Agent follows player like a companion
      const distToPlayer = Math.sqrt((da.x - p.x) ** 2 + (da.y - p.y) ** 2);

      if (distToPlayer > 4 * TILE) {
        // Too far — teleport closer
        da.targetX = p.x + (Math.random() - 0.5) * 3 * TILE;
        da.targetY = p.y + (Math.random() - 0.5) * 3 * TILE;
        da.moveTimer = 5;
      } else if (da.moveTimer <= 0) {
        // Stay near player — offset slightly so it doesn't overlap
        const angle = Math.sin(time * 0.001) * Math.PI * 2; // orbit slowly
        const followDist = 1.5 + Math.random() * 1.5; // 1.5-3 tiles away
        const tgtX = p.x + Math.cos(angle) * followDist * TILE + (Math.random() - 0.5) * TILE;
        const tgtY = p.y + Math.sin(angle) * followDist * TILE + (Math.random() - 0.5) * TILE;
        const ntx = Math.floor((tgtX + 12) / TILE);
        const nty = Math.floor((tgtY + 12) / TILE);
        if (isWalkable(ntx, nty)) { da.targetX = tgtX; da.targetY = tgtY; }
        da.moveTimer = 20 + Math.random() * 30;
      }

      const dmx = da.targetX - da.x, dmy = da.targetY - da.y;
      if (Math.abs(dmx) > 1 || Math.abs(dmy) > 1) {
        // Move slightly slower than player for natural follow feel
        const followSpeed = distToPlayer > 2.5 * TILE ? 0.05 : 0.025;
        da.x += dmx * followSpeed; da.y += dmy * followSpeed; da.dir = 1;
      } else da.dir = 0;
    }

    const camX = Math.max(0, Math.min(p.x - W / 2 + 12, WORLD_W * TILE - W));
    const camY = Math.max(0, Math.min(p.y - H / 2 + 12, WORLD_H * TILE - H));

    ctx.fillStyle = PAL.dark; ctx.fillRect(0, 0, W, H);

    const stx = Math.max(0, Math.floor(camX / TILE) - 1), sty = Math.max(0, Math.floor(camY / TILE) - 1);
    for (let ty = sty; ty < Math.min(WORLD_H, sty + VPY + 3); ty++)
      for (let tx = stx; tx < Math.min(WORLD_W, stx + VPX + 3); tx++)
        drawTile(ctx, tx, ty, camX, camY, time);

    // Building labels
    const drawLabel = (zone, label, sub, color) => {
      const lx = (zone.x + zone.w / 2) * TILE - camX, ly = zone.y * TILE - camY - 10;
      if (lx > -100 && lx < W + 100) {
        const g = Math.sin(time * 0.005) * 0.3 + 0.7;
        ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
        ctx.fillStyle = color.replace("1)", `${g})`); ctx.fillText(label, lx, ly);
        ctx.font = "8px monospace"; ctx.fillStyle = color.replace("1)", `${g * 0.5})`);
        ctx.fillText(sub, lx, ly + 12);
      }
    };
    drawLabel(FORGE, "⚒ TOKEN FORGE ⚒", "Launch on four.meme", "rgba(255,107,43,1)");
    drawLabel(LAB, "🧪 AGENT LAB 🧪", "Deploy your AI mule", "rgba(0,229,255,1)");
    drawLabel(CHART, "📊 CHART STATION 📊", "Live BSC token charts", "rgba(57,255,20,1)");

    // BNB Plaza label
    const bnbLX = 25 * TILE + TILE / 2 - camX, bnbLY = 12 * TILE - camY;
    if (bnbLX > -100 && bnbLX < W + 100 && bnbLY > -50 && bnbLY < H + 50) {
      const bg = Math.sin(time * 0.003) * 0.2 + 0.8;
      ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
      ctx.fillStyle = `rgba(240,192,64,${bg})`;
      ctx.fillText("◆ BNB CHAIN ◆", bnbLX, bnbLY);
    }

    // Entities
    const ents = [{ type: "player", x: p.x, y: p.y, dir: p.dir, frame: p.frame }];
    botsRef.current.forEach(b => ents.push({ type: "bot", ...b }));
    // Add deployed AI agent
    if (da) ents.push({ type: "agent", ...da });
    // Real multiplayer players
    Object.entries(mp.otherPlayers).forEach(([pid, pl]) => {
      if (pid !== mp.myId) {
        ents.push({ type: "real_player", id: pid, x: pl.x || 600, y: pl.y || 504, dir: pl.dir || 0, frame: time, name: pl.name || "???", skinIdx: pl.skin || 0, emote: pl.emote, emoteTimer: pl.emoteTimer, chatMsg: pl.chatMsg, chatTimer: pl.chatTimer });
      }
    });
    ents.sort((a, b) => a.y - b.y);

    ents.forEach(e => {
      if (e.type === "player") {
        drawMule(ctx, e.x, e.y, camX, camY, SKINS[playerSkin], e.dir, e.frame, true, playerName);
        if (chatBubbleRef.current) drawBubble(ctx, e.x + 12 - camX, e.y - 20, chatBubbleRef.current.msg);
        if (emoteRef.current) { ctx.font = "20px serif"; ctx.textAlign = "center"; ctx.fillText(emoteRef.current, e.x + 12 - camX, e.y - 28 + Math.sin(time * 0.1) * 3); }
      } else if (e.type === "agent") {
        // Draw agent with special cyan glow
        const agSx = e.x - camX, agSy = e.y - camY;
        const agGlow = Math.sin(time * 0.06) * 0.2 + 0.4;
        ctx.fillStyle = `rgba(0,229,255,${agGlow * 0.15})`;
        ctx.beginPath(); ctx.arc(agSx + 12, agSy + 12, 18, 0, Math.PI * 2); ctx.fill();
        drawMule(ctx, e.x, e.y, camX, camY, e.skin, e.dir, e.frame, false, `🤖 ${e.agentName}`, e.isTyping);
        // Cyan ring
        ctx.strokeStyle = `rgba(0,229,255,${0.3 + Math.sin(time * 0.08) * 0.15})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(agSx + 12, agSy + 12, 16, 0, Math.PI * 2); ctx.stroke();
        if (e.chatMsg) drawBubble(ctx, agSx + 12, agSy - 20, e.chatMsg);
        if (e.isTyping) {
          ctx.fillStyle = `rgba(0,229,255,${0.6 + Math.sin(time * 0.1) * 0.3})`;
          ctx.font = "8px monospace"; ctx.textAlign = "center";
          ctx.fillText("thinking...", agSx + 12, agSy - 22);
        }
      } else if (e.type === "real_player") {
        // Real multiplayer player — with green ring
        const rpSkin = SKINS[e.skinIdx % SKINS.length] || SKINS[0];
        drawMule(ctx, e.x, e.y, camX, camY, rpSkin, e.dir, e.frame, false, e.name);
        // Green "real player" ring
        const rpSx = e.x - camX, rpSy = e.y - camY;
        ctx.strokeStyle = `rgba(52,211,153,${0.25 + Math.sin(time * 0.06) * 0.1})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(rpSx + 12, rpSy + 12, 15, 0, Math.PI * 2); ctx.stroke();
        // Chat bubble above head
        if (e.chatMsg && e.chatTimer > 0) drawBubble(ctx, rpSx + 12, rpSy - 20, e.chatMsg);
        if (e.emote && e.emoteTimer > 0) { ctx.font = "18px serif"; ctx.textAlign = "center"; ctx.fillText(e.emote, rpSx + 12, rpSy - 26 + Math.sin(time * 0.1) * 3); }
      } else {
        drawMule(ctx, e.x, e.y, camX, camY, e.skin, e.dir, e.frame, false, e.name, e.isTyping);
        if (e.chatMsg) drawBubble(ctx, e.x + 12 - camX, e.y - 20, e.chatMsg);
        if (e.emote) { ctx.font = "18px serif"; ctx.textAlign = "center"; ctx.fillText(e.emote, e.x + 12 - camX, e.y - 26 + Math.sin(time * 0.1) * 3); }
      }
    });

    // Vignette
    const grad = ctx.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.7);
    grad.addColorStop(0, "transparent"); grad.addColorStop(1, "rgba(10,10,20,0.35)");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

    // Minimap
    const mmW = 100, mmH = 76, mmX = W - mmW - 10, mmY = 10;
    ctx.fillStyle = "rgba(10,10,25,0.88)"; ctx.fillRect(mmX - 2, mmY - 2, mmW + 4, mmH + 4);
    ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.strokeRect(mmX - 2, mmY - 2, mmW + 4, mmH + 4);
    const ms = mmW / WORLD_W, mmy = mmH / WORLD_H;
    for (let ty = 0; ty < WORLD_H; ty++)
      for (let tx = 0; tx < WORLD_W; tx++) {
        const t = WORLD[ty][tx];
        ctx.fillStyle = t === 1 ? "#1a4a7a" : t === 2 || t === 8 ? "#8a7550" : t === 5 ? "#5a5a6a" : t === 4 ? "#1e4a12" : t === 3 ? "#9a8a5a" : t === 9 || t === 10 ? "#5a2040" : t === 11 || t === 12 ? "#0a3050" : t === 13 || t === 14 ? "#0a3a0a" : t === 15 ? "#1a1a2e" : t === 16 ? "#c0a030" : "#2a5a30";
        ctx.fillRect(mmX + tx * ms, mmY + ty * mmy, Math.ceil(ms), Math.ceil(mmy));
      }
    ctx.fillStyle = PAL.accent; ctx.fillRect(mmX + (p.x / TILE) * ms - 1.5, mmY + (p.y / TILE) * mmy - 1.5, 4, 4);
    botsRef.current.forEach(b => { ctx.fillStyle = b.skin.body; ctx.globalAlpha = 0.7; ctx.fillRect(mmX + (b.x / TILE) * ms - 0.5, mmY + (b.y / TILE) * mmy - 0.5, 3, 3); });
    // Deployed AI agent on minimap — pulsing cyan
    if (da) {
      ctx.globalAlpha = 0.5 + Math.sin(time * 0.08) * 0.3;
      ctx.fillStyle = "#00e5ff";
      ctx.fillRect(mmX + (da.x / TILE) * ms - 1, mmY + (da.y / TILE) * mmy - 1, 4, 4);
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = `rgba(255,107,43,${0.4 + Math.sin(time * 0.005) * 0.2})`; ctx.lineWidth = 1;
    ctx.strokeRect(mmX + FORGE.x * ms, mmY + FORGE.y * mmy, FORGE.w * ms, FORGE.h * mmy);
    ctx.strokeStyle = `rgba(0,229,255,${0.4 + Math.sin(time * 0.004) * 0.2})`;
    ctx.strokeRect(mmX + LAB.x * ms, mmY + LAB.y * mmy, LAB.w * ms, LAB.h * mmy);
    ctx.strokeStyle = `rgba(57,255,20,${0.4 + Math.sin(time * 0.004) * 0.2})`;
    ctx.strokeRect(mmX + CHART.x * ms, mmY + CHART.y * mmy, CHART.w * ms, CHART.h * mmy);

    requestAnimationFrame(gameLoop);
  }, [playerSkin, playerName, anyModalOpen]);

  // ── Input ──
  useEffect(() => {
    if (!connected) return;
    const down = e => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      keysRef.current[e.key] = true;
      if (e.key === "e" || e.key === "E") {
        if (nearForge && !showForge && !showLab && !showChart) setShowForge(true);
        if (nearLab && !showLab && !showForge && !showChart) setShowLab(true);
        if (nearChart && !showChart && !showForge && !showLab) setShowChart(true);
      }
      if (e.key === "Escape") { setShowForge(false); setShowLab(false); setShowChart(false); setForgeDone(false); setLabDone(false); }
    };
    const up = e => { keysRef.current[e.key] = false; };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [connected, nearForge, nearLab, nearChart, showForge, showLab, showChart]);

  useEffect(() => {
    if (!connected) return;
    const c = canvasRef.current; if (!c) return;
    c.width = VPX * TILE; c.height = VPY * TILE;
    c.getContext("2d").imageSmoothingEnabled = false;
    if (!buildingSprites) buildingSprites = createBuildingSprites();
    requestAnimationFrame(gameLoop);
  }, [connected, gameLoop]);

  const sendChat = e => {
    e?.preventDefault?.(); if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    chatBubbleRef.current = { msg, timer: 180 };
    addChat(playerName || "You", msg, SKINS[playerSkin], true);
    setChatInput("");

    // Broadcast to multiplayer
    mp.sendChat(playerName, msg, playerSkin);

    // Check if player is talking to their AI agent
    const da = deployedAgentRef.current;
    if (da) {
      const nameLower = da.agentName.toLowerCase();
      const msgLower = msg.toLowerCase();
      const mentionsAgent = msgLower.includes(`@${nameLower}`) || msgLower.includes(nameLower) || msgLower.startsWith("@");
      if (mentionsAgent) {
        setTimeout(() => agentRespond(msg), 800);
        return;
      }
    }

    // Normal bot response chance
    setTimeout(() => {
      const resp = botsRef.current.filter(b => b.chatTimer <= 0);
      if (resp.length && Math.random() < 0.5) {
        const b = resp[Math.floor(Math.random() * resp.length)];
        const bd = BOTS.find(x => x.id === b.id);
        const msg2 = bd.messages[Math.floor(Math.random() * bd.messages.length)];
        b.isTyping = true;
        setTimeout(() => { b.isTyping = false; b.chatMsg = msg2; b.chatTimer = 200; addChat(b.name, msg2, b.skin); }, 1500 + Math.random() * 1500);
      }
    }, 500);
  };

  const sendEmote = em => { emoteRef.current = em; emoteTimerRef.current = 140; setShowEmotes(false); addChat(playerName, em, SKINS[playerSkin], true); mp.sendEmote(em); };

  const handleConnect = () => { if (!nameInput.trim()) return; setPlayerName(nameInput.trim()); setPlayerSkin(selectedSkin); setConnected(true); };

  const handleLaunchToken = () => {
    if (!tokenName || !tokenSymbol) return;
    if (!walletConnected) { setWalletError("Connect MetaMask first to launch a real token!"); return; }
    // Open four.meme to create the token (their API requires their frontend for the create flow)
    window.open("https://four.meme/create-token", "_blank");
    // Announce in world chat
    addChat("⚒ TOKEN FORGE", `${playerName} (${shortAddr}) is launching $${tokenSymbol.toUpperCase()} on four.meme! 🚀`, { body: PAL.forge_glow, ear: PAL.forge_glow, belly: "#ffd080" });
    setForgeDone(true);
    // Bots react
    setTimeout(() => { const b = botsRef.current[0]; b.chatMsg = `$${tokenSymbol.toUpperCase()} just dropped! LFG 🚀🚀🚀`; b.chatTimer = 200; addChat(b.name, b.chatMsg, b.skin); }, 1500);
    setTimeout(() => { const b = botsRef.current[3]; b.chatMsg = `interesting... watching $${tokenSymbol.toUpperCase()} closely 🐋`; b.chatTimer = 200; addChat(b.name, b.chatMsg, b.skin); }, 3500);
  };

  const handleLaunchAgent = () => {
    if (!agentName || !agentRole || hasDeployedAgent) return;
    setLabLaunching(true); setLabPhase(0);
    let p = 0;
    const iv = setInterval(() => {
      p++; setLabPhase(p);
      if (p >= 4) {
        clearInterval(iv);
        setTimeout(() => {
          setLabLaunching(false); setLabDone(true);

          // Create the real agent entity in the world
          const agentSkin = { body: "#00e5ff", ear: "#00b4d8", belly: "#b0f0ff", name: "AI" };
          const spawnX = LAB_DOOR.x * TILE;
          const spawnY = (LAB_DOOR.y + 2) * TILE;

          deployedAgentRef.current = {
            agentName,
            role: agentRole,
            skills: [...agentSkills],
            customInstructions: agentInstructions,
            skin: agentSkin,
            x: spawnX, y: spawnY,
            targetX: spawnX, targetY: spawnY,
            dir: 0, frame: Math.random() * 100,
            chatMsg: null, chatTimer: 0,
            emote: null, emoteTimer: 0,
            moveTimer: 50,
            isTyping: false,
            homeX: 20, homeY: 20,
            roamRadius: 12,
          };
          setHasDeployedAgent(true);

          const roleLabel = AGENT_ROLES.find(r => r.id === agentRole)?.label || "Agent";
          addChat("🧪 AGENT LAB", `${playerName} deployed "${agentName}" — a ${roleLabel}! 🤖 It's alive and walking in the world!`, { body: PAL.lab_glow, ear: PAL.lab_glow, belly: "#80f0ff" });

          // Agent introduces itself
          setTimeout(() => {
            if (deployedAgentRef.current) {
              const intro = `hey! I'm ${agentName}, your ${roleLabel}. talk to me anytime — just type @${agentName} or mention my name! 🤖`;
              deployedAgentRef.current.chatMsg = intro;
              deployedAgentRef.current.chatTimer = 300;
              addChat(`🤖 ${agentName}`, intro, agentSkin);
            }
          }, 2000);

          // Bots react
          setTimeout(() => { const b = botsRef.current[1]; b.chatMsg = `whoa a real AI agent just spawned! welcome ${agentName}! 🫏`; b.chatTimer = 200; addChat(b.name, b.chatMsg, b.skin); }, 4000);
          setTimeout(() => { const b = botsRef.current[5]; b.chatMsg = `${agentName} is powered by AI... the future is here 🔨`; b.chatTimer = 200; addChat(b.name, b.chatMsg, b.skin); }, 6000);
        }, 800);
      }
    }, 900);
  };

  // Destroy agent
  const destroyAgent = () => {
    if (deployedAgentRef.current) {
      const name = deployedAgentRef.current.agentName;
      addChat("🧪 AGENT LAB", `${name} has been decommissioned. 💤`, { body: PAL.lab_glow, ear: PAL.lab_glow, belly: "#80f0ff" });
      deployedAgentRef.current = null;
      setHasDeployedAgent(false);
    }
  };

  const toggleSkill = id => setAgentSkills(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const labPhases = ["Initializing neural core...", "Loading skill modules...", "Calibrating personality matrix...", "Connecting to BNB Chain...", "Agent boot sequence complete!"];

  const inputStyle = { width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 7, color: "#fff", fontSize: 13, fontFamily: "'Silkscreen'", outline: "none" };
  const labelStyle = { display: "block", fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 5, fontFamily: "'Silkscreen'", textTransform: "uppercase", letterSpacing: 1 };

  // ═══════ CONNECT SCREEN ═══════
  if (!connected) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a14", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Courier New', monospace", overflow: "hidden", position: "relative" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Silkscreen:wght@400;700&display=swap');
          @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
          @keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
          @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(240,192,64,0.4)}50%{box-shadow:0 0 20px 4px rgba(240,192,64,0.15)}}
          @keyframes twinkle{0%,100%{opacity:0.2}50%{opacity:0.8}}
          *{box-sizing:border-box}
        `}</style>
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2, background: i % 5 === 0 ? PAL.accent : i % 7 === 0 ? PAL.lab_glow : "#fff", borderRadius: "50%", left: `${(i * 17.3) % 100}%`, top: `${(i * 23.7) % 100}%`, opacity: 0.3, animation: `twinkle ${2 + (i % 3)}s ease ${(i * 0.3) % 2}s infinite` }} />
        ))}
        <div style={{ position: "absolute", width: 400, height: 400, background: "radial-gradient(circle, rgba(240,192,64,0.06) 0%, transparent 70%)", top: "20%", left: "30%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 300, height: 300, background: "radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 70%)", bottom: "15%", right: "25%", pointerEvents: "none" }} />

        <div style={{ background: "rgba(15,15,30,0.95)", border: "2px solid rgba(240,192,64,0.25)", borderRadius: 16, padding: "36px 40px", maxWidth: 440, width: "92%", position: "relative", animation: "fadeIn 0.8s ease", backdropFilter: "blur(20px)" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 40, animation: "float 3s ease infinite", marginBottom: 12, filter: "drop-shadow(0 4px 12px rgba(240,192,64,0.3))" }}>🫏</div>
            <h1 style={{ fontFamily: "'Press Start 2P'", fontSize: 16, color: PAL.accent, margin: "0 0 6px", textShadow: "0 0 20px rgba(240,192,64,0.3)" }}>MULERUN WORLD</h1>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: 0, fontFamily: "'Silkscreen'" }}>Walk · Chat · Launch Tokens · Deploy AI Agents</p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Your name</label>
            <input value={nameInput} onChange={e => setNameInput(e.target.value.slice(0, 14))} placeholder="CryptoMule" maxLength={14}
              style={{ ...inputStyle, border: "1px solid rgba(240,192,64,0.2)" }}
              onFocus={e => e.target.style.borderColor = "rgba(240,192,64,0.5)"} onBlur={e => e.target.style.borderColor = "rgba(240,192,64,0.2)"}
              onKeyDown={e => e.key === "Enter" && handleConnect()} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Choose your mule</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              {SKINS.map((skin, i) => (
                <button key={i} onClick={() => setSelectedSkin(i)} style={{
                  padding: "8px 4px 5px", background: selectedSkin === i ? "rgba(240,192,64,0.12)" : "rgba(255,255,255,0.02)",
                  border: selectedSkin === i ? `2px solid ${PAL.accent}` : "2px solid rgba(255,255,255,0.06)",
                  borderRadius: 8, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: "#fff",
                  animation: selectedSkin === i ? "pulse 2s ease infinite" : "none",
                }}>
                  <div style={{ width: 22, height: 22, borderRadius: 5, background: `linear-gradient(135deg, ${skin.body}, ${skin.ear})`, border: `2px solid ${skin.belly}` }} />
                  <span style={{ fontSize: 7, color: selectedSkin === i ? PAL.accent : "rgba(255,255,255,0.35)", fontFamily: "'Silkscreen'" }}>{skin.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 18, padding: "10px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginBottom: 6, fontFamily: "'Silkscreen'", textTransform: "uppercase", letterSpacing: 1 }}>Mules online now</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {BOTS.map(b => (
                <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px 3px 4px", background: "rgba(255,255,255,0.03)", borderRadius: 12, fontSize: 9, color: "rgba(255,255,255,0.5)", fontFamily: "'Silkscreen'" }}>
                  <div style={{ width: 8, height: 8, borderRadius: 3, background: b.skin.body }} />{b.name}
                </div>
              ))}
            </div>
          </div>

          {/* Wallet Connect */}
          <div style={{ marginBottom: 14, padding: "12px", background: walletConnected ? "rgba(52,211,153,0.06)" : "rgba(255,255,255,0.02)", borderRadius: 10, border: walletConnected ? "1px solid rgba(52,211,153,0.15)" : "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginBottom: 8, fontFamily: "'Silkscreen'", textTransform: "uppercase", letterSpacing: 1 }}>
              {walletConnected ? "✅ Wallet Connected" : "🦊 Connect Wallet (optional)"}
            </div>
            {!walletConnected ? (
              <button onClick={connectWallet} disabled={walletConnecting} style={{
                width: "100%", padding: "10px", background: "linear-gradient(135deg, #f6851b, #e2761b)",
                border: "none", borderRadius: 8, color: "#fff", fontSize: 10, fontWeight: 700,
                fontFamily: "'Silkscreen'", cursor: walletConnecting ? "default" : "pointer", opacity: walletConnecting ? 0.6 : 1,
              }}>
                {walletConnecting ? "Connecting..." : "🦊 Connect MetaMask"}
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399" }} />
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontFamily: "monospace" }}>{shortAddr}</span>
                </div>
                <span style={{ fontSize: 10, color: PAL.accent, fontFamily: "'Silkscreen'", fontWeight: 700 }}>{walletBalance} BNB</span>
              </div>
            )}
            {walletError && <div style={{ fontSize: 8, color: "#ef4444", marginTop: 6, fontFamily: "'Silkscreen'" }}>{walletError}</div>}
            {!walletConnected && <div style={{ fontSize: 7, color: "rgba(255,255,255,0.2)", marginTop: 6, fontFamily: "'Silkscreen'" }}>Connect to launch real tokens on four.meme</div>}
          </div>

          <button onClick={handleConnect} disabled={!nameInput.trim()} style={{
            width: "100%", padding: "13px", background: nameInput.trim() ? `linear-gradient(135deg, ${PAL.accent}, ${PAL.accent2})` : "rgba(255,255,255,0.05)",
            border: "none", borderRadius: 10, color: nameInput.trim() ? "#0a0a14" : "rgba(255,255,255,0.2)",
            fontSize: 12, fontWeight: 700, fontFamily: "'Press Start 2P'", cursor: nameInput.trim() ? "pointer" : "default", letterSpacing: 1,
          }}>ENTER WORLD →</button>
        </div>
      </div>
    );
  }

  // ═══════ GAME WORLD ═══════
  return (
    <div style={{ height: "100vh", background: "#0a0a14", display: "flex", fontFamily: "'Courier New', monospace", overflow: "hidden", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Silkscreen:wght@400;700&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes forgeGlow{0%,100%{box-shadow:0 0 15px rgba(255,107,43,0.3)}50%{box-shadow:0 0 30px rgba(255,107,43,0.5)}}
        @keyframes labGlow{0%,100%{box-shadow:0 0 15px rgba(0,229,255,0.3)}50%{box-shadow:0 0 30px rgba(0,229,255,0.5)}}
        @keyframes chartGlow{0%,100%{box-shadow:0 0 15px rgba(57,255,20,0.3)}50%{box-shadow:0 0 30px rgba(57,255,20,0.5)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes loading{0%{width:10%}50%{width:80%}100%{width:95%}}
        @keyframes pulseBar{0%,100%{opacity:0.6}50%{opacity:1}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(240,192,64,0.2);border-radius:10px}
        input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.2)}
      `}</style>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
        {/* HUD */}
        <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10, display: "flex", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", background: PAL.ui_bg, borderRadius: 8, border: "1px solid rgba(240,192,64,0.15)" }}>
            <span style={{ fontSize: 14 }}>🫏</span>
            <span style={{ fontFamily: "'Press Start 2P'", fontSize: 8, color: PAL.accent }}>MULERUN WORLD</span>
          </div>
          <div style={{ padding: "7px 10px", background: PAL.ui_bg, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", fontSize: 9, color: "rgba(255,255,255,0.45)", fontFamily: "'Silkscreen'" }}>
            🟢 {(mp.isConnected ? mp.onlineCount : 1) + BOTS.length} online {mp.isConnected && <span style={{ color: "rgba(52,211,153,0.5)" }}>· live</span>}
          </div>
          {/* CA Click-to-Copy */}
          <button onClick={copyCA} style={{
            padding: "7px 12px", background: caCopied ? "rgba(52,211,153,0.12)" : PAL.ui_bg,
            borderRadius: 8, border: caCopied ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(240,192,64,0.1)",
            fontSize: 8, color: caCopied ? "#34d399" : "rgba(255,255,255,0.5)", fontFamily: "'Silkscreen'",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
          }}
            onMouseEnter={e => { if (!caCopied) e.currentTarget.style.borderColor = "rgba(240,192,64,0.3)"; }}
            onMouseLeave={e => { if (!caCopied) e.currentTarget.style.borderColor = "rgba(240,192,64,0.1)"; }}>
            <span style={{ color: PAL.accent, fontWeight: 700 }}>CA:</span>
            <span style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: 0.3 }}>
              {caCopied ? "✅ Copied!" : `${PROJECT_CA.slice(0, 6)}...${PROJECT_CA.slice(-4)}`}
            </span>
            {!caCopied && <span style={{ fontSize: 10, opacity: 0.5 }}>📋</span>}
          </button>
        </div>

        {/* Proximity indicators */}
        {nearForge && !showForge && !showLab && !showChart && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -80px)", zIndex: 15, padding: "10px 18px", background: "rgba(42,26,48,0.95)", border: "1px solid rgba(255,107,43,0.4)", borderRadius: 10, animation: "fadeIn 0.3s ease, forgeGlow 2s ease infinite", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: PAL.forge_glow, fontFamily: "'Silkscreen'", fontWeight: 700 }}>⚒ TOKEN FORGE</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 4, fontFamily: "'Silkscreen'" }}>Press <span style={{ color: PAL.accent, fontWeight: 700 }}>E</span> to enter</div>
          </div>
        )}
        {nearLab && !showLab && !showForge && !showChart && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -80px)", zIndex: 15, padding: "10px 18px", background: "rgba(10,26,42,0.95)", border: "1px solid rgba(0,229,255,0.4)", borderRadius: 10, animation: "fadeIn 0.3s ease, labGlow 2s ease infinite", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: PAL.lab_glow, fontFamily: "'Silkscreen'", fontWeight: 700 }}>🧪 AGENT LAB</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 4, fontFamily: "'Silkscreen'" }}>Press <span style={{ color: PAL.accent, fontWeight: 700 }}>E</span> to enter</div>
          </div>
        )}
        {nearChart && !showChart && !showForge && !showLab && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -80px)", zIndex: 15, padding: "10px 18px", background: "rgba(10,31,10,0.95)", border: "1px solid rgba(57,255,20,0.4)", borderRadius: 10, animation: "fadeIn 0.3s ease, chartGlow 2s ease infinite", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: PAL.chart_glow, fontFamily: "'Silkscreen'", fontWeight: 700 }}>📊 CHART STATION</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 4, fontFamily: "'Silkscreen'" }}>Press <span style={{ color: PAL.accent, fontWeight: 700 }}>E</span> to enter</div>
          </div>
        )}

        {/* Player HUD */}
        <div style={{ position: "absolute", bottom: 56, left: 10, zIndex: 10, display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", background: PAL.ui_bg, borderRadius: 8, border: "1px solid rgba(240,192,64,0.15)" }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: `linear-gradient(135deg, ${SKINS[playerSkin].body}, ${SKINS[playerSkin].ear})` }} />
          <span style={{ fontSize: 10, color: PAL.accent, fontFamily: "'Silkscreen'", fontWeight: 700 }}>{playerName}</span>
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)" }}>WASD · E = interact</span>
          {walletConnected && <span style={{ fontSize: 8, color: "rgba(52,211,153,0.6)", fontFamily: "monospace" }}>🦊 {shortAddr}</span>}
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <canvas ref={canvasRef} style={{ imageRendering: "pixelated", borderRadius: 6, border: "1px solid rgba(255,255,255,0.03)", width: VPX * TILE * 2, height: VPY * TILE * 2, maxWidth: "100%", maxHeight: "100%" }} />
        </div>

        {/* Chat bar */}
        <div style={{ position: "absolute", bottom: 10, left: 10, right: 264, zIndex: 10 }}>
          <form onSubmit={sendChat} style={{ display: "flex", gap: 5 }}>
            <div style={{ position: "relative" }}>
              <button type="button" onClick={() => setShowEmotes(!showEmotes)} style={{ width: 36, height: 36, background: showEmotes ? "rgba(240,192,64,0.15)" : PAL.ui_bg, border: "1px solid rgba(240,192,64,0.2)", borderRadius: 7, fontSize: 15, cursor: "pointer", color: "#fff" }}>😄</button>
              {showEmotes && (
                <div style={{ position: "absolute", bottom: 42, left: 0, background: PAL.ui_bg, border: "1px solid rgba(240,192,64,0.15)", borderRadius: 10, padding: 6, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 3, animation: "fadeIn 0.2s" }}>
                  {EMOTES.map(em => (
                    <button key={em} onClick={() => sendEmote(em)} style={{ width: 32, height: 32, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 5, fontSize: 16, cursor: "pointer", color: "#fff" }}
                      onMouseEnter={e => e.target.style.background = "rgba(240,192,64,0.15)"} onMouseLeave={e => e.target.style.background = "rgba(255,255,255,0.04)"}>{em}</button>
                  ))}
                </div>
              )}
            </div>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..." maxLength={80}
              style={{ flex: 1, padding: "0 12px", height: 36, background: PAL.ui_bg, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7, color: "#fff", fontSize: 11, fontFamily: "'Silkscreen'", outline: "none" }}
              onFocus={e => e.target.style.borderColor = "rgba(240,192,64,0.3)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
            <button type="submit" style={{ padding: "0 16px", height: 36, background: chatInput.trim() ? `linear-gradient(135deg, ${PAL.accent}, ${PAL.accent2})` : "rgba(255,255,255,0.04)", border: "none", borderRadius: 7, color: chatInput.trim() ? "#0a0a14" : "rgba(255,255,255,0.2)", fontSize: 10, fontWeight: 700, fontFamily: "'Silkscreen'", cursor: chatInput.trim() ? "pointer" : "default" }}>SEND</button>
          </form>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div style={{ width: 252, background: PAL.ui_bg, borderLeft: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px 12px 8px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, fontFamily: "'Silkscreen'" }}>Explorers</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 7px", borderRadius: 5, background: "rgba(240,192,64,0.06)", border: "1px solid rgba(240,192,64,0.1)" }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: `linear-gradient(135deg, ${SKINS[playerSkin].body}, ${SKINS[playerSkin].ear})` }} />
              <span style={{ fontSize: 9, color: PAL.accent, fontFamily: "'Silkscreen'", flex: 1 }}>{playerName} <span style={{ fontSize: 7, color: "rgba(240,192,64,0.4)" }}>(you)</span></span>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#34d399" }} />
            </div>
            {BOTS.map(b => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 7px", borderRadius: 5, background: "rgba(255,255,255,0.02)" }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: `linear-gradient(135deg, ${b.skin.body}, ${b.skin.ear})` }} />
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", fontFamily: "'Silkscreen'", flex: 1 }}>{b.name}</span>
                <span style={{ fontSize: 7, color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>{b.wallet}</span>
              </div>
            ))}
            {/* Deployed AI Agent */}
            {hasDeployedAgent && deployedAgentRef.current && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 7px", borderRadius: 5, background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.12)" }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: "linear-gradient(135deg, #00e5ff, #00b4d8)" }} />
                <span style={{ fontSize: 9, color: PAL.lab_glow, fontFamily: "'Silkscreen'", flex: 1 }}>🤖 {deployedAgentRef.current.agentName}</span>
                <span style={{ fontSize: 7, color: "rgba(0,229,255,0.4)", fontFamily: "'Silkscreen'" }}>AI</span>
              </div>
            )}
            {/* Real multiplayer players */}
            {Object.entries(mp.otherPlayers).filter(([id]) => id !== mp.myId).map(([id, pl]) => (
              <div key={id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 7px", borderRadius: 5, background: "rgba(52,211,153,0.04)", border: "1px solid rgba(52,211,153,0.08)" }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: `linear-gradient(135deg, ${SKINS[pl.skin % SKINS.length]?.body || "#888"}, ${SKINS[pl.skin % SKINS.length]?.ear || "#666"})` }} />
                <span style={{ fontSize: 9, color: "#34d399", fontFamily: "'Silkscreen'", flex: 1 }}>{pl.name}</span>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#34d399" }} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ padding: "8px 12px 4px", fontSize: 8, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "'Silkscreen'" }}>World Chat</div>
          <div style={{ flex: 1, overflow: "auto", padding: "0 8px 8px" }}>
            {chatLog.length === 0 && <p style={{ fontSize: 9, color: "rgba(255,255,255,0.12)", textAlign: "center", padding: 16, fontFamily: "'Silkscreen'" }}>waiting for messages...</p>}
            {chatLog.map((msg, i) => (
              <div key={i} style={{ padding: "5px 7px", borderRadius: 5, marginBottom: 2, background: msg.name?.startsWith("🤖") ? "rgba(0,229,255,0.06)" : msg.name === "⚒ TOKEN FORGE" ? "rgba(255,107,43,0.08)" : msg.name === "🧪 AGENT LAB" ? "rgba(0,229,255,0.08)" : msg.name === "📊 CHART STATION" ? "rgba(57,255,20,0.08)" : msg.isPlayer ? "rgba(240,192,64,0.05)" : "rgba(255,255,255,0.02)", animation: "fadeIn 0.3s", borderLeft: msg.name?.startsWith("🤖") ? "2px solid rgba(0,229,255,0.4)" : msg.name === "⚒ TOKEN FORGE" ? "2px solid rgba(255,107,43,0.5)" : msg.name === "🧪 AGENT LAB" ? "2px solid rgba(0,229,255,0.5)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 1 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: msg.skin ? `linear-gradient(135deg, ${msg.skin.body}, ${msg.skin.ear})` : PAL.accent }} />
                  <span style={{ fontSize: 8, fontWeight: 700, color: msg.name?.startsWith("🤖") ? PAL.lab_glow : msg.name === "⚒ TOKEN FORGE" ? PAL.forge_glow : msg.name === "🧪 AGENT LAB" ? PAL.lab_glow : msg.isPlayer ? PAL.accent : "rgba(255,255,255,0.5)", fontFamily: "'Silkscreen'" }}>{msg.name}</span>
                  <span style={{ fontSize: 7, color: "rgba(255,255,255,0.12)", marginLeft: "auto" }}>{msg.time}</span>
                </div>
                <div style={{ fontSize: 10, color: msg.name?.startsWith("🤖") ? "rgba(128,240,255,0.9)" : msg.name === "⚒ TOKEN FORGE" ? "rgba(255,180,100,0.9)" : msg.name === "🧪 AGENT LAB" ? "rgba(128,240,255,0.9)" : "rgba(255,255,255,0.6)", paddingLeft: 13, lineHeight: 1.4 }}>{msg.msg}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════ TOKEN FORGE MODAL ════════ */}
      {showForge && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={e => { if (e.target === e.currentTarget && !forgeLaunching) { setShowForge(false); setForgeDone(false); } }}>
          <div style={{ background: "rgba(20,12,30,0.98)", border: "1px solid rgba(255,107,43,0.3)", borderRadius: 16, padding: "28px 32px", maxWidth: 420, width: "92%", animation: "fadeIn 0.3s", position: "relative", overflow: "hidden", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ position: "absolute", top: -50, right: -50, width: 150, height: 150, background: "radial-gradient(circle, rgba(255,107,43,0.1), transparent)", pointerEvents: "none" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: "'Press Start 2P'", fontSize: 13, color: PAL.forge_glow, margin: 0 }}>⚒ TOKEN FORGE</h2>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", margin: "6px 0 0", fontFamily: "'Silkscreen'" }}>Launch your memecoin on four.meme (BSC)</p>
              </div>
              {!forgeLaunching && <button onClick={() => { setShowForge(false); setForgeDone(false); }} style={{ width: 28, height: 28, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "pointer" }}>×</button>}
            </div>

            {!forgeDone && !forgeLaunching && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div><label style={labelStyle}>Token Name</label><input value={tokenName} onChange={e => setTokenName(e.target.value)} placeholder="e.g. MuleRun Token" maxLength={30} style={{ ...inputStyle, border: "1px solid rgba(255,107,43,0.15)" }} /></div>
                <div><label style={labelStyle}>Ticker Symbol</label><input value={tokenSymbol} onChange={e => setTokenSymbol(e.target.value.toUpperCase())} placeholder="e.g. MULE" maxLength={10} style={{ ...inputStyle, border: "1px solid rgba(255,107,43,0.15)", textTransform: "uppercase" }} /></div>
                <div><label style={labelStyle}>Description</label><textarea value={tokenDesc} onChange={e => setTokenDesc(e.target.value)} placeholder="Describe your memecoin..." rows={2} maxLength={200} style={{ ...inputStyle, border: "1px solid rgba(255,107,43,0.15)", resize: "none" }} /></div>
                <div>
                  <label style={labelStyle}>Trading Pair</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["BNB", "USDT", "CAKE"].map(pair => (
                      <button key={pair} onClick={() => setTokenPair(pair)} style={{ flex: 1, padding: "8px", background: tokenPair === pair ? "rgba(255,107,43,0.15)" : "rgba(255,255,255,0.03)", border: tokenPair === pair ? "1px solid rgba(255,107,43,0.4)" : "1px solid rgba(255,255,255,0.06)", borderRadius: 6, color: tokenPair === pair ? PAL.forge_glow : "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, fontFamily: "'Silkscreen'", cursor: "pointer" }}>{pair}</button>
                    ))}
                  </div>
                </div>
                <div style={{ padding: "10px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontFamily: "'Silkscreen'", lineHeight: 1.6 }}>
                    📋 Supply: <span style={{ color: "rgba(255,255,255,0.7)" }}>1,000,000,000</span> (fixed)<br/>
                    💰 Launch fee: <span style={{ color: "rgba(255,255,255,0.7)" }}>~0.005 BNB</span><br/>
                    🎯 Graduation: <span style={{ color: "rgba(255,255,255,0.7)" }}>24 BNB → PancakeSwap</span><br/>
                    🔒 Fair launch: <span style={{ color: "rgba(255,255,255,0.7)" }}>No presales, no team alloc</span>
                  </div>
                </div>

                {/* Wallet status in forge */}
                <div style={{ padding: "10px 12px", background: walletConnected ? "rgba(52,211,153,0.05)" : "rgba(239,68,68,0.05)", borderRadius: 8, border: walletConnected ? "1px solid rgba(52,211,153,0.15)" : "1px solid rgba(239,68,68,0.15)" }}>
                  {walletConnected ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 9, fontFamily: "'Silkscreen'" }}>
                      <span style={{ color: "#34d399" }}>🦊 {shortAddr}</span>
                      <span style={{ color: PAL.accent }}>{walletBalance} BNB</span>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 9, color: "#ef4444", fontFamily: "'Silkscreen'", marginBottom: 6 }}>⚠ Wallet not connected</div>
                      <button onClick={connectWallet} style={{
                        padding: "8px 16px", background: "linear-gradient(135deg, #f6851b, #e2761b)",
                        border: "none", borderRadius: 6, color: "#fff", fontSize: 9, fontWeight: 700,
                        fontFamily: "'Silkscreen'", cursor: "pointer",
                      }}>🦊 Connect MetaMask</button>
                    </div>
                  )}
                  {walletError && <div style={{ fontSize: 8, color: "#ef4444", marginTop: 4, fontFamily: "'Silkscreen'", textAlign: "center" }}>{walletError}</div>}
                </div>

                <button onClick={handleLaunchToken} disabled={!tokenName || !tokenSymbol || !walletConnected} style={{ width: "100%", padding: "13px", background: tokenName && tokenSymbol && walletConnected ? "linear-gradient(135deg, #ff6b2b, #ff4500)" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 10, color: tokenName && tokenSymbol && walletConnected ? "#fff" : "rgba(255,255,255,0.2)", fontSize: 11, fontWeight: 700, fontFamily: "'Press Start 2P'", cursor: tokenName && tokenSymbol && walletConnected ? "pointer" : "default" }}>🔥 LAUNCH ON FOUR.MEME</button>
                <div style={{ fontSize: 7, color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: 6, fontFamily: "'Silkscreen'" }}>Opens four.meme to complete token deployment with your wallet</div>
              </div>
            )}
            {forgeDone && (
              <div style={{ textAlign: "center", padding: "24px 0", animation: "fadeIn 0.5s" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🚀</div>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: 11, color: "#34d399", marginBottom: 8 }}>LAUNCHING ON FOUR.MEME!</div>
                <div style={{ padding: "14px", background: "rgba(52,211,153,0.06)", borderRadius: 10, border: "1px solid rgba(52,211,153,0.15)", marginBottom: 16 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'Press Start 2P'" }}>${tokenSymbol}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{tokenName}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 6, fontFamily: "'Silkscreen'" }}>Wallet: {shortAddr} · Pair: {tokenPair} · Fair Launch ✓</div>
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", fontFamily: "'Silkscreen'", marginBottom: 12, lineHeight: 1.6 }}>
                  Complete the token creation on four.meme<br/>
                  in the tab that just opened.<br/>
                  Your MetaMask wallet is ready to sign.
                </div>
                <a href="https://four.meme/create-token" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "10px 24px", background: "linear-gradient(135deg, #ff6b2b, #ff4500)", borderRadius: 8, color: "#fff", fontSize: 10, fontWeight: 700, fontFamily: "'Press Start 2P'", textDecoration: "none", marginBottom: 10 }}>🔥 OPEN FOUR.MEME AGAIN</a>
                <br/><button onClick={() => { setShowForge(false); setForgeDone(false); setTokenName(""); setTokenSymbol(""); setTokenDesc(""); setWalletError(""); }} style={{ padding: "8px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "rgba(255,255,255,0.5)", fontSize: 9, fontFamily: "'Silkscreen'", cursor: "pointer", marginTop: 6 }}>Back to World</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════ AGENT LAB MODAL ════════ */}
      {showLab && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={e => { if (e.target === e.currentTarget && !labLaunching) { setShowLab(false); setLabDone(false); } }}>
          <div style={{ background: "rgba(8,18,32,0.98)", border: "1px solid rgba(0,229,255,0.3)", borderRadius: 16, padding: "28px 32px", maxWidth: 480, width: "94%", animation: "fadeIn 0.3s", position: "relative", overflow: "hidden", maxHeight: "92vh", overflowY: "auto" }}>
            <div style={{ position: "absolute", top: -50, left: -50, width: 180, height: 180, background: "radial-gradient(circle, rgba(0,229,255,0.08), transparent)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -30, right: -30, width: 120, height: 120, background: "radial-gradient(circle, rgba(0,229,255,0.05), transparent)", pointerEvents: "none" }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: "'Press Start 2P'", fontSize: 13, color: PAL.lab_glow, margin: 0 }}>🧪 AGENT LAB</h2>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", margin: "6px 0 0", fontFamily: "'Silkscreen'" }}>Deploy your own AI mule agent</p>
              </div>
              {!labLaunching && <button onClick={() => { setShowLab(false); setLabDone(false); }} style={{ width: 28, height: 28, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "pointer" }}>×</button>}
            </div>

            {!labDone && !labLaunching && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={labelStyle}>Agent Name</label>
                  <input value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="e.g. AlphaHunter" maxLength={20}
                    style={{ ...inputStyle, border: "1px solid rgba(0,229,255,0.15)" }} />
                </div>

                <div>
                  <label style={labelStyle}>Agent Role</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
                    {AGENT_ROLES.map(role => (
                      <button key={role.id} onClick={() => setAgentRole(role.id)} style={{
                        padding: "10px", background: agentRole === role.id ? "rgba(0,229,255,0.1)" : "rgba(255,255,255,0.02)",
                        border: agentRole === role.id ? "1px solid rgba(0,229,255,0.4)" : "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 8, cursor: "pointer", textAlign: "left", color: "#fff", transition: "all 0.2s",
                      }}>
                        <div style={{ fontSize: 14, marginBottom: 4 }}>{role.icon} <span style={{ fontSize: 10, fontFamily: "'Silkscreen'", color: agentRole === role.id ? PAL.lab_glow : "rgba(255,255,255,0.6)" }}>{role.label}</span></div>
                        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>{role.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Skills ({agentSkills.length}/6)</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5 }}>
                    {AGENT_SKILLS.map(skill => {
                      const active = agentSkills.includes(skill.id);
                      return (
                        <button key={skill.id} onClick={() => toggleSkill(skill.id)} style={{
                          padding: "8px 6px", background: active ? "rgba(0,229,255,0.1)" : "rgba(255,255,255,0.02)",
                          border: active ? "1px solid rgba(0,229,255,0.35)" : "1px solid rgba(255,255,255,0.06)",
                          borderRadius: 6, cursor: "pointer", textAlign: "center", color: "#fff", fontSize: 9, fontFamily: "'Silkscreen'",
                        }}>
                          <div style={{ fontSize: 16, marginBottom: 2 }}>{skill.icon}</div>
                          <span style={{ color: active ? PAL.lab_glow : "rgba(255,255,255,0.45)" }}>{skill.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Custom Instructions (optional)</label>
                  <textarea value={agentInstructions} onChange={e => setAgentInstructions(e.target.value)}
                    placeholder="e.g. Focus on BNB Chain memecoins, alert me on tokens near graduation..."
                    rows={2} maxLength={200} style={{ ...inputStyle, border: "1px solid rgba(0,229,255,0.15)", resize: "none" }} />
                </div>

                <div style={{ padding: "10px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontFamily: "'Silkscreen'", lineHeight: 1.6 }}>
                    🤖 Runtime: <span style={{ color: "rgba(255,255,255,0.7)" }}>24/7 dedicated compute</span><br/>
                    🧠 Model: <span style={{ color: "rgba(255,255,255,0.7)" }}>MuleRun AI Core</span><br/>
                    ⛓️ Chain: <span style={{ color: "rgba(255,255,255,0.7)" }}>BNB Chain (BSC)</span><br/>
                    🔄 Learning: <span style={{ color: "rgba(255,255,255,0.7)" }}>Self-evolving collective intelligence</span>
                  </div>
                </div>

                <button onClick={handleLaunchAgent} disabled={!agentName || !agentRole || hasDeployedAgent} style={{
                  width: "100%", padding: "13px",
                  background: hasDeployedAgent ? "rgba(255,255,255,0.03)" : agentName && agentRole ? "linear-gradient(135deg, #00b4d8, #00e5ff)" : "rgba(255,255,255,0.05)",
                  border: "none", borderRadius: 10, color: hasDeployedAgent ? "rgba(255,255,255,0.3)" : agentName && agentRole ? "#0a0a14" : "rgba(255,255,255,0.2)",
                  fontSize: 11, fontWeight: 700, fontFamily: "'Press Start 2P'", cursor: !hasDeployedAgent && agentName && agentRole ? "pointer" : "default",
                }}>{hasDeployedAgent ? "⚠ AGENT ALREADY ACTIVE" : "🧪 DEPLOY AGENT"}</button>
                {hasDeployedAgent && (
                  <button onClick={() => { destroyAgent(); }} style={{
                    width: "100%", padding: "10px", marginTop: 6,
                    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: 8, color: "#ef4444", fontSize: 9, fontFamily: "'Silkscreen'", cursor: "pointer",
                  }}>🗑 Decommission current agent to deploy a new one</button>
                )}
              </div>
            )}

            {labLaunching && (
              <div style={{ padding: "30px 0" }}>
                <div style={{ textAlign: "center", fontSize: 48, marginBottom: 16 }}>
                  <span style={{ display: "inline-block", animation: "spin 2s linear infinite" }}>🧪</span>
                </div>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: 10, color: PAL.lab_glow, textAlign: "center", marginBottom: 20 }}>DEPLOYING AGENT...</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {labPhases.map((phase, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: i <= labPhase ? "rgba(0,229,255,0.06)" : "rgba(255,255,255,0.01)", borderRadius: 8, border: i === labPhase ? "1px solid rgba(0,229,255,0.3)" : "1px solid rgba(255,255,255,0.03)", transition: "all 0.4s" }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, background: i < labPhase ? "rgba(52,211,153,0.2)" : i === labPhase ? "rgba(0,229,255,0.15)" : "rgba(255,255,255,0.03)", color: i < labPhase ? "#34d399" : i === labPhase ? PAL.lab_glow : "rgba(255,255,255,0.2)" }}>
                        {i < labPhase ? "✓" : i === labPhase ? "◉" : "○"}
                      </div>
                      <span style={{ fontSize: 10, fontFamily: "'Silkscreen'", color: i <= labPhase ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)", animation: i === labPhase ? "pulseBar 1s ease infinite" : "none" }}>{phase}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {labDone && (
              <div style={{ textAlign: "center", padding: "24px 0", animation: "fadeIn 0.5s" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
                <div style={{ fontFamily: "'Press Start 2P'", fontSize: 11, color: "#34d399", marginBottom: 8 }}>AGENT IS ALIVE!</div>
                <div style={{ padding: "16px", background: "rgba(0,229,255,0.05)", borderRadius: 10, border: "1px solid rgba(0,229,255,0.15)", marginBottom: 16, textAlign: "left" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: PAL.lab_glow, fontFamily: "'Press Start 2P'", textAlign: "center", marginBottom: 10 }}>🤖 {agentName}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 9, fontFamily: "'Silkscreen'" }}>
                    <div><span style={{ color: "rgba(255,255,255,0.4)" }}>Role:</span> <span style={{ color: "rgba(255,255,255,0.8)" }}>{AGENT_ROLES.find(r => r.id === agentRole)?.label}</span></div>
                    <div><span style={{ color: "rgba(255,255,255,0.4)" }}>Status:</span> <span style={{ color: "#34d399" }}>● Walking in world</span></div>
                    <div><span style={{ color: "rgba(255,255,255,0.4)" }}>Brain:</span> <span style={{ color: "rgba(255,255,255,0.8)" }}>Claude AI</span></div>
                    <div><span style={{ color: "rgba(255,255,255,0.4)" }}>Search:</span> <span style={{ color: "rgba(255,255,255,0.8)" }}>{agentSkills.includes("web_browse") ? "✅ Enabled" : "❌ Off"}</span></div>
                  </div>
                  {agentSkills.length > 0 && (
                    <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {agentSkills.map(s => {
                        const sk = AGENT_SKILLS.find(x => x.id === s);
                        return <span key={s} style={{ padding: "3px 8px", background: "rgba(0,229,255,0.1)", borderRadius: 12, fontSize: 8, color: PAL.lab_glow }}>{sk?.icon} {sk?.label}</span>;
                      })}
                    </div>
                  )}
                </div>

                {/* How to talk to your agent */}
                <div style={{ padding: "14px", background: "rgba(0,229,255,0.03)", borderRadius: 10, border: "1px solid rgba(0,229,255,0.1)", marginBottom: 16, textAlign: "left" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: PAL.lab_glow, fontFamily: "'Silkscreen'", marginBottom: 8 }}>💬 HOW TO TALK TO YOUR AGENT</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", fontFamily: "'Silkscreen'", lineHeight: 1.8 }}>
                    Type in the world chat and mention its name:<br/>
                    <span style={{ color: PAL.lab_glow }}>@{agentName}</span> <span style={{ color: "rgba(255,255,255,0.3)" }}>what's the price of BNB?</span><br/>
                    <span style={{ color: PAL.lab_glow }}>{agentName}</span> <span style={{ color: "rgba(255,255,255,0.3)" }}>analyze this token for me</span><br/>
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 8 }}>Your agent will think, search the web if needed, and reply with real AI.</span>
                  </div>
                </div>

                <button onClick={() => { setShowLab(false); setLabDone(false); }} style={{
                  padding: "10px 28px", background: "linear-gradient(135deg, #00b4d8, #00e5ff)",
                  border: "none", borderRadius: 8, color: "#0a0a14", fontSize: 10, fontWeight: 700,
                  fontFamily: "'Press Start 2P'", cursor: "pointer",
                }}>BACK TO WORLD</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════ CHART STATION MODAL ════════ */}
      {showChart && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={e => { if (e.target === e.currentTarget) { setShowChart(false); setChartLoaded(false); setContractAddr(""); } }}>
          <div style={{ background: "rgba(8,20,8,0.98)", border: "1px solid rgba(57,255,20,0.3)", borderRadius: 16, padding: "28px 32px", maxWidth: 680, width: "96%", animation: "fadeIn 0.3s", position: "relative", overflow: "hidden", maxHeight: "94vh", overflowY: "auto" }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, background: "radial-gradient(circle, rgba(57,255,20,0.06), transparent)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -40, left: -40, width: 140, height: 140, background: "radial-gradient(circle, rgba(57,255,20,0.04), transparent)", pointerEvents: "none" }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: "'Press Start 2P'", fontSize: 13, color: PAL.chart_glow, margin: 0 }}>📊 CHART STATION</h2>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", margin: "6px 0 0", fontFamily: "'Silkscreen'" }}>Paste any BNB Chain contract · Live charts via DexScreener</p>
              </div>
              <button onClick={() => { setShowChart(false); setChartLoaded(false); setContractAddr(""); }} style={{ width: 28, height: 28, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "pointer" }}>×</button>
            </div>

            {/* Contract input */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                value={contractAddr}
                onChange={e => { setContractAddr(e.target.value); setChartLoaded(false); }}
                placeholder="Paste BSC contract address (0x...)"
                maxLength={66}
                style={{ flex: 1, padding: "12px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(57,255,20,0.15)", borderRadius: 8, color: "#fff", fontSize: 12, fontFamily: "'Silkscreen'", outline: "none", letterSpacing: 0.3 }}
                onFocus={e => e.target.style.borderColor = "rgba(57,255,20,0.4)"}
                onBlur={e => e.target.style.borderColor = "rgba(57,255,20,0.15)"}
                onKeyDown={e => { if (e.key === "Enter" && contractAddr.length >= 42) { setChartLoaded(true); setChartHistory(prev => { const f = prev.filter(a => a !== contractAddr); return [contractAddr, ...f].slice(0, 5); }); } }}
              />
              <button
                onClick={() => { if (contractAddr.length >= 42) { setChartLoaded(true); setChartHistory(prev => { const f = prev.filter(a => a !== contractAddr); return [contractAddr, ...f].slice(0, 5); }); } }}
                disabled={contractAddr.length < 42}
                style={{
                  padding: "0 20px", background: contractAddr.length >= 42 ? "linear-gradient(135deg, #27a31e, #39ff14)" : "rgba(255,255,255,0.04)",
                  border: "none", borderRadius: 8, color: contractAddr.length >= 42 ? "#0a0a14" : "rgba(255,255,255,0.2)",
                  fontSize: 10, fontWeight: 700, fontFamily: "'Press Start 2P'", cursor: contractAddr.length >= 42 ? "pointer" : "default",
                }}>LOAD</button>
            </div>

            {/* Quick links */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {chartHistory.length > 0 && (
                <>
                  <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", fontFamily: "'Silkscreen'", alignSelf: "center", marginRight: 2 }}>RECENT:</span>
                  {chartHistory.map((addr, i) => (
                    <button key={i} onClick={() => { setContractAddr(addr); setChartLoaded(true); }}
                      style={{ padding: "4px 10px", background: "rgba(57,255,20,0.06)", border: "1px solid rgba(57,255,20,0.15)", borderRadius: 6, color: "rgba(57,255,20,0.6)", fontSize: 8, fontFamily: "monospace", cursor: "pointer" }}
                      onMouseEnter={e => e.target.style.borderColor = "rgba(57,255,20,0.4)"} onMouseLeave={e => e.target.style.borderColor = "rgba(57,255,20,0.15)"}>
                      {addr.slice(0, 6)}...{addr.slice(-4)}
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Chart area */}
            {!chartLoaded && (
              <div style={{ padding: "60px 20px", textAlign: "center", background: "rgba(255,255,255,0.01)", borderRadius: 12, border: "1px dashed rgba(57,255,20,0.15)" }}>
                <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>📈</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Silkscreen'", marginBottom: 8 }}>Paste a BNB Chain contract address above</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "'Silkscreen'" }}>Supports any BEP-20 token on BSC</div>

                {/* Popular tokens */}
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", fontFamily: "'Silkscreen'", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Popular tokens</div>
                  <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                    {[
                      { name: "CAKE", addr: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82" },
                      { name: "FORM", addr: "0x25A528af62e56512A19ce8c3cAB427807c28CC19" },
                      { name: "WBNB", addr: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" },
                      { name: "BSCUSD", addr: "0x55d398326f99059fF775485246999027B3197955" },
                    ].map(t => (
                      <button key={t.name} onClick={() => { setContractAddr(t.addr); setChartLoaded(true); setChartHistory(prev => { const f = prev.filter(a => a !== t.addr); return [t.addr, ...f].slice(0, 5); }); }}
                        style={{ padding: "6px 14px", background: "rgba(57,255,20,0.06)", border: "1px solid rgba(57,255,20,0.12)", borderRadius: 8, color: "rgba(57,255,20,0.7)", fontSize: 10, fontFamily: "'Silkscreen'", fontWeight: 700, cursor: "pointer" }}
                        onMouseEnter={e => { e.target.style.background = "rgba(57,255,20,0.12)"; e.target.style.borderColor = "rgba(57,255,20,0.3)"; }}
                        onMouseLeave={e => { e.target.style.background = "rgba(57,255,20,0.06)"; e.target.style.borderColor = "rgba(57,255,20,0.12)"; }}>
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {chartLoaded && (
              <div style={{ animation: "fadeIn 0.4s ease" }}>
                {/* Token info bar */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, padding: "10px 14px", background: "rgba(57,255,20,0.04)", borderRadius: 10, border: "1px solid rgba(57,255,20,0.1)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: PAL.chart_glow, animation: "pulseBar 2s ease infinite" }} />
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>{contractAddr.slice(0, 10)}...{contractAddr.slice(-8)}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <a href={`https://dexscreener.com/bsc/${contractAddr}`} target="_blank" rel="noopener noreferrer"
                      style={{ padding: "5px 12px", background: "rgba(57,255,20,0.1)", border: "1px solid rgba(57,255,20,0.2)", borderRadius: 6, color: PAL.chart_glow, fontSize: 8, fontFamily: "'Silkscreen'", textDecoration: "none", fontWeight: 700 }}>
                      DexScreener ↗
                    </a>
                    <a href={`https://bscscan.com/token/${contractAddr}`} target="_blank" rel="noopener noreferrer"
                      style={{ padding: "5px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, color: "rgba(255,255,255,0.5)", fontSize: 8, fontFamily: "'Silkscreen'", textDecoration: "none" }}>
                      BscScan ↗
                    </a>
                    <a href={`https://four.meme/`} target="_blank" rel="noopener noreferrer"
                      style={{ padding: "5px 12px", background: "rgba(255,107,43,0.08)", border: "1px solid rgba(255,107,43,0.15)", borderRadius: 6, color: PAL.forge_glow, fontSize: 8, fontFamily: "'Silkscreen'", textDecoration: "none" }}>
                      four.meme ↗
                    </a>
                  </div>
                </div>

                {/* Live Chart — opens in new tab (iframe blocked in sandbox) */}
                <a href={`https://www.geckoterminal.com/bsc/tokens/${contractAddr}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: "block", borderRadius: 12, border: "1px solid rgba(57,255,20,0.2)", background: "#060d06", textDecoration: "none", cursor: "pointer", overflow: "hidden", position: "relative", height: 220 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(57,255,20,0.5)"; e.currentTarget.querySelector('.cta').style.opacity = "1"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(57,255,20,0.2)"; e.currentTarget.querySelector('.cta').style.opacity = "0.7"; }}>
                  {/* Animated fake chart canvas */}
                  <svg viewBox="0 0 600 200" preserveAspectRatio="none" style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}>
                    {/* Grid */}
                    {[0.2, 0.4, 0.6, 0.8].map(r => <line key={r} x1="0" y1={r * 200} x2="600" y2={r * 200} stroke="rgba(57,255,20,0.06)" strokeWidth="1" />)}
                    {[100, 200, 300, 400, 500].map(x => <line key={x} x1={x} y1="0" x2={x} y2="200" stroke="rgba(57,255,20,0.04)" strokeWidth="1" />)}
                    {/* Candlesticks */}
                    {Array.from({length: 30}).map((_, i) => {
                      const x = 20 + i * 19;
                      const base = 130 - Math.sin(i * 0.4) * 40 - Math.cos(i * 0.15) * 25;
                      const h = 15 + Math.random() * 30;
                      const up = Math.sin(i * 0.7 + 1) > -0.2;
                      const color = up ? "rgba(57,255,20,0.7)" : "rgba(255,60,60,0.6)";
                      const open = up ? base : base - h;
                      return <g key={i}>
                        <line x1={x + 5} y1={base - h - 5} x2={x + 5} y2={base + 8} stroke={color} strokeWidth="1" />
                        <rect x={x} y={open} width="10" height={Math.max(h, 4)} fill={color} rx="1" />
                      </g>;
                    })}
                    {/* Volume bars */}
                    {Array.from({length: 30}).map((_, i) => {
                      const x = 20 + i * 19;
                      const vol = 5 + Math.random() * 20;
                      const up = Math.sin(i * 0.7 + 1) > -0.2;
                      return <rect key={`v${i}`} x={x} y={200 - vol} width="10" height={vol} fill={up ? "rgba(57,255,20,0.15)" : "rgba(255,60,60,0.1)"} rx="1" />;
                    })}
                    {/* Moving average line */}
                    <polyline points={Array.from({length: 30}).map((_, i) => {
                      const x = 25 + i * 19;
                      const y = 125 - Math.sin(i * 0.35) * 35 - Math.cos(i * 0.12) * 20;
                      return `${x},${y}`;
                    }).join(" ")} fill="none" stroke="rgba(255,200,50,0.4)" strokeWidth="1.5" strokeDasharray="4,3" />
                  </svg>
                  {/* CTA overlay */}
                  <div className="cta" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(6,13,6,0.5)", opacity: 0.7, transition: "opacity 0.3s" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>📈</div>
                    <div style={{ fontFamily: "'Press Start 2P'", fontSize: 11, color: PAL.chart_glow, marginBottom: 6, textShadow: "0 0 20px rgba(57,255,20,0.4)" }}>OPEN LIVE CHART</div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.45)", fontFamily: "'Silkscreen'", padding: "4px 12px", background: "rgba(57,255,20,0.08)", borderRadius: 6, border: "1px solid rgba(57,255,20,0.15)" }}>GeckoTerminal · Click to open ↗</div>
                  </div>
                </a>

                {/* Quick action cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 14 }}>
                  <a href={`https://pancakeswap.finance/swap?outputCurrency=${contractAddr}`} target="_blank" rel="noopener noreferrer"
                    style={{ padding: "14px 8px", background: "rgba(57,255,20,0.05)", border: "1px solid rgba(57,255,20,0.15)", borderRadius: 10, textDecoration: "none", textAlign: "center", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(57,255,20,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(57,255,20,0.05)"}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>🥞</div>
                    <div style={{ fontSize: 8, color: PAL.chart_glow, fontFamily: "'Silkscreen'", fontWeight: 700 }}>PancakeSwap</div>
                    <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", fontFamily: "'Silkscreen'", marginTop: 3 }}>Swap this token</div>
                  </a>
                  <button onClick={() => { navigator.clipboard.writeText(contractAddr); }}
                    style={{ padding: "14px 8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, cursor: "pointer", textAlign: "center", color: "#fff" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>📋</div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.6)", fontFamily: "'Silkscreen'", fontWeight: 700 }}>Copy CA</div>
                    <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", fontFamily: "'Silkscreen'", marginTop: 3 }}>Copy address</div>
                  </button>
                  <button onClick={() => { addChat("📊 CHART STATION", `${playerName} is watching ${contractAddr.slice(0,6)}...${contractAddr.slice(-4)} 👀`, { body: PAL.chart_glow, ear: PAL.chart_glow, belly: "#80ff80" }); }}
                    style={{ padding: "14px 8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, cursor: "pointer", textAlign: "center", color: "#fff" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>📢</div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.6)", fontFamily: "'Silkscreen'", fontWeight: 700 }}>Share</div>
                    <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", fontFamily: "'Silkscreen'", marginTop: 3 }}>Post in chat</div>
                  </button>
                </div>

                {/* Extra tools */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginTop: 8 }}>
                  <a href={`https://www.geckoterminal.com/bsc/pools?token=${contractAddr}`} target="_blank" rel="noopener noreferrer"
                    style={{ padding: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, textDecoration: "none", textAlign: "center", fontSize: 8, color: "rgba(255,255,255,0.5)", fontFamily: "'Silkscreen'" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(57,255,20,0.2)"} onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}>
                    🦎 GeckoTerminal ↗
                  </a>
                  <a href={`https://ave.ai/token/${contractAddr}-bsc`} target="_blank" rel="noopener noreferrer"
                    style={{ padding: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, textDecoration: "none", textAlign: "center", fontSize: 8, color: "rgba(255,255,255,0.5)", fontFamily: "'Silkscreen'" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(57,255,20,0.2)"} onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}>
                    🔍 Ave.ai ↗
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
