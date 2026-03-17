// party/server.js — MuleRun World Multiplayer Server

export default class MuleRunServer {
  constructor(room) {
    this.room = room;
    this.players = {};
  }

  onRequest(req) {
    const count = Object.keys(this.players).length;
    return new Response(JSON.stringify({ status: "ok", players: count }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  onConnect(conn) {
    const existing = {};
    for (const [id, data] of Object.entries(this.players)) {
      existing[id] = data;
    }
    conn.send(JSON.stringify({
      type: "init",
      players: existing,
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
        this.players[sender.id] = {
          name: data.name || "Anon",
          skin: data.skin || 0,
          x: data.x || 600,
          y: data.y || 504,
          dir: 0,
          wallet: data.wallet || "",
        };
        this.room.broadcast(JSON.stringify({
          type: "player_joined",
          id: sender.id,
          player: this.players[sender.id],
          count: Object.keys(this.players).length,
        }));
        break;
      }

      case "move": {
        const player = this.players[sender.id];
        if (player) {
          player.x = data.x;
          player.y = data.y;
          player.dir = data.dir;
        }
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
    const player = this.players[conn.id];
    delete this.players[conn.id];
    this.room.broadcast(JSON.stringify({
      type: "player_left",
      id: conn.id,
      name: player?.name || "???",
      count: Object.keys(this.players).length,
    }));
  }
}
