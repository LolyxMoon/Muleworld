// party/server.js — MuleRun World Multiplayer Server
// Handles: player join/leave, position sync, chat, events

export default class MuleRunServer {
  constructor(room) {
    this.room = room;
    this.players = new Map(); // id -> { name, skin, x, y, dir, wallet }
  }

  onConnect(conn, ctx) {
    // Send existing players to the new connection
    const existingPlayers = {};
    for (const [id, data] of this.players) {
      existingPlayers[id] = data;
    }
    conn.send(JSON.stringify({
      type: "init",
      players: existingPlayers,
      playerId: conn.id,
    }));
  }

  onMessage(message, sender) {
    let data;
    try {
      data = JSON.parse(message);
    } catch {
      return;
    }

    switch (data.type) {
      case "join": {
        // Player joins with their info
        this.players.set(sender.id, {
          name: data.name || "Anon",
          skin: data.skin || 0,
          x: data.x || 600,
          y: data.y || 504,
          dir: 0,
          wallet: data.wallet || "",
        });

        // Broadcast to ALL (including sender gets confirmation)
        this.room.broadcast(JSON.stringify({
          type: "player_joined",
          id: sender.id,
          player: this.players.get(sender.id),
          count: this.players.size,
        }));
        break;
      }

      case "move": {
        // Update player position
        const player = this.players.get(sender.id);
        if (player) {
          player.x = data.x;
          player.y = data.y;
          player.dir = data.dir;
        }

        // Broadcast to others (not sender — they already know their pos)
        this.room.broadcast(JSON.stringify({
          type: "player_moved",
          id: sender.id,
          x: data.x,
          y: data.y,
          dir: data.dir,
        }), [sender.id]);
        break;
      }

      case "chat": {
        // Broadcast chat message to all
        this.room.broadcast(JSON.stringify({
          type: "chat",
          id: sender.id,
          name: data.name,
          msg: data.msg,
          skin: data.skin,
        }));
        break;
      }

      case "emote": {
        this.room.broadcast(JSON.stringify({
          type: "emote",
          id: sender.id,
          emote: data.emote,
        }), [sender.id]);
        break;
      }

      case "event": {
        // Token launches, agent deploys, etc — broadcast to all
        this.room.broadcast(JSON.stringify({
          type: "event",
          event: data.event,
          name: data.name,
          detail: data.detail,
        }));
        break;
      }
    }
  }

  onClose(conn) {
    const player = this.players.get(conn.id);
    this.players.delete(conn.id);

    // Notify everyone
    this.room.broadcast(JSON.stringify({
      type: "player_left",
      id: conn.id,
      name: player?.name || "???",
      count: this.players.size,
    }));
  }
}
