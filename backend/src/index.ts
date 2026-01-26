import { Hono } from "hono";
import type { Client } from "@sdk/server-types";
import { tables } from "@generated";
import { eq, and } from "drizzle-orm";
import { WORD_DATA } from "./data";

export async function createApp(
  edgespark: Client<typeof tables>
): Promise<Hono> {
  const app = new Hono();

  // Helper to generate room code
  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Create Room
  app.post("/api/public/rooms", async (c) => {
    const { mode } = await c.req.json();
    let code = generateCode();
    let exists = await edgespark.db.select().from(tables.rooms).where(eq(tables.rooms.code, code));
    while (exists.length > 0) {
      code = generateCode();
      exists = await edgespark.db.select().from(tables.rooms).where(eq(tables.rooms.code, code));
    }

    const [room] = await edgespark.db.insert(tables.rooms).values({
      code,
      mode: mode || "infiltrator",
      status: "lobby",
    }).returning();

    return c.json({ room });
  });

  // Join Room
  app.post("/api/public/rooms/:code/join", async (c) => {
    const code = c.req.param("code").toUpperCase();
    const { name } = await c.req.json();

    const [room] = await edgespark.db.select().from(tables.rooms).where(eq(tables.rooms.code, code));
    if (!room) return c.json({ error: "Room not found" }, 404);
    if (room.status !== "lobby") return c.json({ error: "Game already started" }, 400);

    const players = await edgespark.db.select().from(tables.players).where(eq(tables.players.roomId, room.id));
    const isHost = players.length === 0 ? 1 : 0;

    const [player] = await edgespark.db.insert(tables.players).values({
      roomId: room.id,
      name,
      isHost,
      isAlive: 1,
    }).returning();

    return c.json({ player, room });
  });

  // Get Room State (Polling)
  app.get("/api/public/rooms/:code", async (c) => {
    const code = c.req.param("code").toUpperCase();
    const [room] = await edgespark.db.select().from(tables.rooms).where(eq(tables.rooms.code, code));
    if (!room) return c.json({ error: "Room not found" }, 404);

    const players = await edgespark.db.select().from(tables.players).where(eq(tables.players.roomId, room.id));
    
    return c.json({ room, players });
  });

  // Start Game
  app.post("/api/public/rooms/:code/start", async (c) => {
    const code = c.req.param("code").toUpperCase();
    const [room] = await edgespark.db.select().from(tables.rooms).where(eq(tables.rooms.code, code));
    if (!room) return c.json({ error: "Room not found" }, 404);

    const players = await edgespark.db.select().from(tables.players).where(eq(tables.players.roomId, room.id));
    if (players.length < 3) return c.json({ error: "Need at least 3 players" }, 400);

    // Assign Roles
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const specialIndex = Math.floor(Math.random() * shuffled.length);
    
    // Pick Word
    const domains = WORD_DATA.domains;
    const domainIndex = Math.floor(Math.random() * domains.length);
    const domain = domains[domainIndex];
    const wordObj = domain.words[Math.floor(Math.random() * domain.words.length)];
    
    const commonWord = wordObj.word;
    const specialWord = room.mode === "spy" 
      ? wordObj.similar[Math.floor(Math.random() * wordObj.similar.length)] 
      : ""; 

    // Generate Options (2 Related + 2 Decoy)
    const relatedCandidates = domain.words
      .filter(w => w.word !== commonWord)
      .map(w => w.word);
    const related = relatedCandidates.sort(() => 0.5 - Math.random()).slice(0, 2);
    
    let decoyDomainIndex = Math.floor(Math.random() * domains.length);
    while (decoyDomainIndex === domainIndex && domains.length > 1) {
      decoyDomainIndex = Math.floor(Math.random() * domains.length);
    }
    const decoyDomain = domains[decoyDomainIndex];
    const decoyCandidates = decoyDomain.words.map(w => w.word);
    const decoy = decoyCandidates.sort(() => 0.5 - Math.random()).slice(0, 2);
    
    const options = [...related, ...decoy].sort(() => 0.5 - Math.random());

    const updates = shuffled.map((p, i) => {
      const isSpecial = i === specialIndex;
      let role = "citizen";
      let word = commonWord;

      if (room.mode === "infiltrator") {
        if (isSpecial) {
          role = "infiltrator";
          word = ""; 
        } else {
          role = "citizen";
        }
      } else { // Spy mode
        if (isSpecial) {
          role = "spy";
          word = specialWord || "";
        } else {
          role = "agent";
        }
      }

      return edgespark.db.update(tables.players)
        .set({ role, word, clue: null }) // Reset clue
        .where(eq(tables.players.id, p.id));
    });

    await Promise.all(updates);

    // Update Room
    // Deployment trigger comment
    await edgespark.db.update(tables.rooms)
      .set({ 
        status: "selecting", 
        currentTurnPlayerId: shuffled[0].id,
        options: JSON.stringify(options)
      })
      .where(eq(tables.rooms.id, room.id));

    return c.json({ success: true });
  });

  // Submit Clue
  app.post("/api/public/rooms/:code/clue", async (c) => {
    const code = c.req.param("code").toUpperCase();
    const { playerId, clue } = await c.req.json();
    
    const [room] = await edgespark.db.select().from(tables.rooms).where(eq(tables.rooms.code, code));
    if (!room) return c.json({ error: "Room not found" }, 404);

    // Update player clue
    await edgespark.db.update(tables.players)
      .set({ clue })
      .where(eq(tables.players.id, playerId));

    // Check if all alive players have clues
    const players = await edgespark.db.select().from(tables.players).where(eq(tables.players.roomId, room.id));
    const alivePlayers = players.filter(p => p.isAlive === 1);
    // Note: The player we just updated might not be reflected in the select query yet depending on transaction isolation, 
    // but usually it is. To be safe, we check if everyone has a clue OR is the current player.
    const allSubmitted = alivePlayers.every(p => (p.clue && p.clue.length > 0) || p.id === playerId);

    if (allSubmitted) {
      await edgespark.db.update(tables.rooms)
        .set({ status: "voting" })
        .where(eq(tables.rooms.id, room.id));
    }

    return c.json({ success: true });
  });

  // Vote / Eliminate
  app.post("/api/public/rooms/:code/vote", async (c) => {
    const code = c.req.param("code").toUpperCase();
    const { targetPlayerId } = await c.req.json();
    
    const [target] = await edgespark.db.select().from(tables.players).where(eq(tables.players.id, targetPlayerId));
    if (target) {
      await edgespark.db.update(tables.players)
        .set({ votes: (target.votes || 0) + 1 })
        .where(eq(tables.players.id, targetPlayerId));
    }

    return c.json({ success: true });
  });

  // End Voting / Eliminate Player
  app.post("/api/public/rooms/:code/eliminate", async (c) => {
    const code = c.req.param("code").toUpperCase();
    const [room] = await edgespark.db.select().from(tables.rooms).where(eq(tables.rooms.code, code));
    if (!room) return c.json({ error: "Room not found" }, 404);

    const players = await edgespark.db.select().from(tables.players).where(eq(tables.players.roomId, room.id));
    
    // Find max votes
    let maxVotes = -1;
    let toEliminate: any = null;
    
    players.forEach(p => {
      const votes = p.votes || 0;
      if (votes > maxVotes) {
        maxVotes = votes;
        toEliminate = p;
      }
    });

    if (toEliminate) {
      await edgespark.db.update(tables.players)
        .set({ isAlive: 0 })
        .where(eq(tables.players.id, toEliminate.id));
        
      // Check Win Condition
      if (toEliminate.role === "infiltrator" || toEliminate.role === "spy") {
        await edgespark.db.update(tables.rooms).set({ status: "ended" }).where(eq(tables.rooms.id, room.id));
        return c.json({ eliminated: toEliminate, winner: "citizens" });
      }
      
      // If only 2 players left and special is alive -> Special wins
      const alive = players.filter(p => p.id !== toEliminate.id && p.isAlive === 1);
      if (alive.length <= 2) {
         await edgespark.db.update(tables.rooms).set({ status: "ended" }).where(eq(tables.rooms.id, room.id));
         return c.json({ eliminated: toEliminate, winner: "special" });
      }
    }
    
    // Reset votes
    await edgespark.db.update(tables.players).set({ votes: 0 }).where(eq(tables.players.roomId, room.id));

    return c.json({ eliminated: toEliminate });
  });

  // Force Phase Advance (Host only)
  app.post("/api/public/rooms/:code/advance", async (c) => {
    const code = c.req.param("code").toUpperCase();
    const [room] = await edgespark.db.select().from(tables.rooms).where(eq(tables.rooms.code, code));
    if (!room) return c.json({ error: "Room not found" }, 404);

    let newStatus = room.status;
    if (room.status === "selecting") {
      newStatus = "voting";
    } else if (room.status === "voting") {
      // Auto-eliminate player with most votes
      const players = await edgespark.db.select().from(tables.players).where(eq(tables.players.roomId, room.id));
      
      let maxVotes = -1;
      let toEliminate: any = null;
      
      players.forEach(p => {
        const votes = p.votes || 0;
        if (votes > maxVotes) {
          maxVotes = votes;
          toEliminate = p;
        }
      });

      if (toEliminate) {
        await edgespark.db.update(tables.players)
          .set({ isAlive: 0 })
          .where(eq(tables.players.id, toEliminate.id));
          
        // Check Win Condition
        if (toEliminate.role === "infiltrator" || toEliminate.role === "spy") {
          newStatus = "ended";
        } else {
          const alive = players.filter(p => p.id !== toEliminate.id && p.isAlive === 1);
          if (alive.length <= 2) {
            newStatus = "ended";
          } else {
            newStatus = "selecting"; // Next round
          }
        }
      }
      
      // Reset votes
      await edgespark.db.update(tables.players).set({ votes: 0 }).where(eq(tables.players.roomId, room.id));
    }

    await edgespark.db.update(tables.rooms)
      .set({ status: newStatus })
      .where(eq(tables.rooms.id, room.id));

    return c.json({ success: true, newStatus });
  });
  return app;
}