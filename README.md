# 🫏 MuleRun World — Multiplayer

A pixel art social metaverse on BNB Chain with **real-time multiplayer** via PartyKit.

## Quick Start

```bash
npm install
npm run dev              # Single-player (works immediately)
```

## Multiplayer (local)

```bash
# Terminal 1: PartyKit server
npm run dev:party

# Terminal 2: Vite frontend
npm run dev

# Open multiple tabs to test multiplayer!
```

## Deploy to Production

```bash
# 1. Deploy PartyKit (free, uses GitHub login)
npx partykit login
npm run deploy:party
# Note the URL: mulerun-world.YOURNAME.partykit.dev

# 2. Create .env with your PartyKit host
echo "VITE_PARTYKIT_HOST=mulerun-world.YOURNAME.partykit.dev" > .env

# 3. Deploy frontend to Vercel
npx vercel
# Add VITE_PARTYKIT_HOST in Vercel environment variables
```

## Features

- Real-time multiplayer (PartyKit WebSockets)
- Pixel art world with BNB diamond plaza
- Token Forge — launch on four.meme with MetaMask
- Agent Lab — deploy AI agents (Claude API + web search)
- Chart Station — live BSC token charts
- 7 bot NPCs with unique personalities
- Emotes, chat, wallet integration

## Project Structure

```
mulerun-world/
├── party/server.js         # Multiplayer server
├── src/App.jsx             # Full game
├── src/useMultiplayer.js   # PartyKit React hook
├── src/main.jsx            # Entry point
├── partykit.json           # PartyKit config
├── vercel.json             # Vercel config
└── .env.example            # Env template
```

MIT License
