import { supabase } from './supabaseClient';
import { WORD_DATA } from './mockData';

// Helper to generate 4-letter room codes
const generateCode = (length = 4) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < length; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

const nowIso = () => new Date().toISOString();
const toMs = (iso?: string | null) => (iso ? new Date(iso).getTime() : undefined);

// Normalize Supabase row to client-friendly shape (camelCase timers)
const normalizeRoom = (room: any) => {
  if (!room) return room;
  return {
    ...room,
    lobbyStartTime: toMs(room.lobby_start_time),
    phaseStartTime: toMs(room.phase_start_time),
  };
};

const normalizePlayer = (p: any) => {
  if (!p) return p;
  return {
    id: p.id,
    name: p.name,
    role: p.role ?? null,
    word: p.word ?? null,
    clue: p.clue ?? undefined,
    color: p.color ?? null,
    isAlive: typeof p.is_alive === 'number' ? p.is_alive : (p.is_alive ? 1 : 0),
    votes: p.votes ?? 0,
    isHost: typeof p.is_host === 'number' ? p.is_host : (p.is_host ? 1 : 0),
  };
};

export const supaApi = {
  createRoom: async (mode: string) => {
    // generate unique code
    let code = generateCode(4);
    for (let i = 0; i < 10; i++) {
      const { data } = await supabase.from('rooms').select('id').eq('code', code).single();
      if (!data) break;
      code = generateCode(4);
    }

    const { data: room, error } = await supabase
      .from('rooms')
      .insert({ code, mode: mode || 'infiltrator', status: 'lobby' })
      .select('*')
      .single();

    if (error || !room) throw new Error(error?.message || 'Failed to create room');
    return { room: normalizeRoom(room) } as any;
  },

  joinRoom: async (code: string, name: string, color?: string) => {
    const upper = code.trim().toUpperCase();
    const { data: room, error: roomErr } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', upper)
      .single();
    if (roomErr || !room) throw new Error('Room not found');

    // Count players
    const { count: playerCount, error: cntErr } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', room.id);
    if (cntErr) throw new Error(cntErr.message);

    const isHost = (playerCount || 0) === 0 ? 1 : 0;

    const { data: player, error: playerErr } = await supabase
      .from('players')
      .insert({ room_id: room.id, name: name.trim(), color: color || null, is_host: isHost, is_alive: 1, votes: 0 })
      .select('*')
      .single();
    if (playerErr || !player) throw new Error(playerErr?.message || 'Failed to join');

    // If we reached 3 players and no lobby_start_time, set it
    if ((playerCount || 0) + 1 >= 3 && !room.lobby_start_time) {
      await supabase
        .from('rooms')
        .update({ lobby_start_time: nowIso() })
        .eq('id', room.id);
    }

    // Fetch fresh room row after potential update
    const { data: updatedRoom } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', room.id)
      .single();

    return { player: normalizePlayer(player), room: normalizeRoom(updatedRoom) } as any;
  },

  getRoom: async (code: string) => {
    const upper = code.trim().toUpperCase();
    const { data: room, error: roomErr } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', upper)
      .single();
    if (roomErr || !room) throw new Error('Room not found');

    const { data: players, error: playersErr } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', room.id)
      .order('id', { ascending: true });
    if (playersErr) throw new Error(playersErr.message);

    return { room: normalizeRoom(room), players: (players || []).map(normalizePlayer) } as any;
  },

  startGame: async (code: string) => {
    const upper = code.trim().toUpperCase();
    const { data: room } = await supabase.from('rooms').select('*').eq('code', upper).single();
    if (!room) throw new Error('Room not found');

    const { data: players } = await supabase.from('players').select('*').eq('room_id', room.id);
    if (!players || players.length < 3) throw new Error('Need at least 3 players');

    // Assign roles/words/options
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const specialIndex = Math.floor(Math.random() * shuffled.length);

    const domains = WORD_DATA.domains;
    const domainIndex = Math.floor(Math.random() * domains.length);
    const domain = domains[domainIndex];
    const wordObj = domain.words[Math.floor(Math.random() * domain.words.length)];

    const commonWord = wordObj.word;
    const specialWord = room.mode === 'spy'
      ? wordObj.similar[Math.floor(Math.random() * wordObj.similar.length)]
      : '';

    const relatedCandidates = domain.words.filter((w: any) => w.word !== commonWord).map((w: any) => w.word);
    const related = relatedCandidates.sort(() => 0.5 - Math.random()).slice(0, 2);

    let decoyDomainIndex = Math.floor(Math.random() * domains.length);
    while (decoyDomainIndex === domainIndex && domains.length > 1) {
      decoyDomainIndex = Math.floor(Math.random() * domains.length);
    }
    const decoyDomain = domains[decoyDomainIndex];
    const decoyCandidates = decoyDomain.words.map((w: any) => w.word);
    const decoy = decoyCandidates.sort(() => 0.5 - Math.random()).slice(0, 2);

    const options = [...related, ...decoy].sort(() => 0.5 - Math.random());

    // Update players roles/words
    for (let i = 0; i < shuffled.length; i++) {
      const p = shuffled[i];
      const isSpecial = i === specialIndex;
      let role = 'citizen';
      let word = commonWord;

      if (room.mode === 'infiltrator') {
        if (isSpecial) { role = 'infiltrator'; word = ''; }
      } else {
        if (isSpecial) { role = 'spy'; word = specialWord || ''; } else { role = 'agent'; }
      }

      await supabase.from('players').update({ role, word, clue: null }).eq('id', p.id);
    }

    await supabase.from('rooms').update({
      status: 'selecting',
      options: options,
      phase_start_time: nowIso(),
      lobby_start_time: null,
      winner: null,
    }).eq('id', room.id);

    return { success: true };
  },

  submitClue: async (code: string, playerId: number, clue: string) => {
    const upper = code.trim().toUpperCase();
    const { data: room } = await supabase.from('rooms').select('id').eq('code', upper).single();
    if (!room) throw new Error('Room not found');

    await supabase.from('players').update({ clue }).eq('id', playerId);

    const { data: players } = await supabase
      .from('players')
      .select('id, is_alive, clue')
      .eq('room_id', room.id);

    const alive = (players || []).filter((p: any) => p.is_alive === 1);
    const allSubmitted = alive.every((p: any) => p.clue && p.clue.length > 0);

    if (allSubmitted) {
      await supabase.from('rooms').update({ status: 'voting', phase_start_time: nowIso() }).eq('id', room.id);
    }

    return { success: true };
  },

  vote: async (_code: string, targetPlayerId: number) => {
    // Simplified: increment target's votes (no per-voter tracking yet)
    const { data: target } = await supabase.from('players').select('votes').eq('id', targetPlayerId).single();
    const newVotes = (target?.votes || 0) + 1;
    await supabase.from('players').update({ votes: newVotes }).eq('id', targetPlayerId);
    return { success: true };
  },

  eliminate: async (code: string) => {
    const upper = code.trim().toUpperCase();
    const { data: room } = await supabase.from('rooms').select('*').eq('code', upper).single();
    if (!room) throw new Error('Room not found');

    const { data: players } = await supabase.from('players').select('*').eq('room_id', room.id);
    if (!players) throw new Error('No players');

    let maxVotes = -1; let toEliminate: any = null;
    players.forEach((p: any) => { const v = p.votes || 0; if (v > maxVotes) { maxVotes = v; toEliminate = p; } });

    if (!toEliminate || maxVotes <= 0) {
      // No elimination, reset votes and go back to selecting
      for (const p of players) await supabase.from('players').update({ votes: 0 }).eq('id', (p as any).id);
      await supabase.from('rooms').update({ status: 'selecting', phase_start_time: nowIso() }).eq('id', room.id);
      return { eliminated: null };
    }

    await supabase.from('players').update({ is_alive: 0 }).eq('id', toEliminate.id);

    let winner: string | null = null;
    if (toEliminate.role === 'infiltrator' || toEliminate.role === 'spy') {
      winner = 'citizens';
    } else {
      const alive = players.filter((p: any) => p.id !== toEliminate.id && p.is_alive === 1);
      if (alive.length <= 2) winner = 'special';
    }

    for (const p of players) await supabase.from('players').update({ votes: 0 }).eq('id', (p as any).id);

    if (winner) {
      await supabase.from('rooms').update({ status: 'ended', winner }).eq('id', room.id);
      return { eliminated: toEliminate, winner };
    }

    await supabase.from('rooms').update({ status: 'selecting', phase_start_time: nowIso() }).eq('id', room.id);
    return { eliminated: toEliminate };
  },

  forcePhaseAdvance: async (code: string) => {
    const upper = code.trim().toUpperCase();
    const { data: room } = await supabase.from('rooms').select('*').eq('code', upper).single();
    if (!room) throw new Error('Room not found');

    if (room.status === 'selecting') {
      await supabase.from('rooms').update({ status: 'voting', phase_start_time: nowIso() }).eq('id', room.id);
      return { success: true, newStatus: 'voting' } as any;
    }

    if (room.status === 'voting') {
      await supaApi.eliminate(code);
      const { data: after } = await supabase.from('rooms').select('status').eq('id', room.id).single();
      return { success: true, newStatus: (after as any)?.status } as any;
    }

    return { success: true, newStatus: room.status } as any;
  },

  // Reset the room to lobby for replay with same participants
  restartGame: async (code: string) => {
    const upper = code.trim().toUpperCase();
    const { data: room } = await supabase.from('rooms').select('*').eq('code', upper).single();
    if (!room) throw new Error('Room not found');

    // Reset players
    await supabase
      .from('players')
      .update({ is_alive: 1, votes: 0, role: null, word: null, clue: null })
      .eq('room_id', room.id);

    // Reset room
    await supabase
      .from('rooms')
      .update({ status: 'lobby', winner: null, options: null, phase_start_time: null, lobby_start_time: null })
      .eq('id', room.id);

    // Return updated state
    const { data: updated } = await supabase.from('rooms').select('*').eq('id', room.id).single();
    const { data: players } = await supabase.from('players').select('*').eq('room_id', room.id);

    return { room: normalizeRoom(updated), players: (players || []).map(normalizePlayer) } as any;
  },

  updatePlayerColor: async (playerId: number, color: string) => {
    const { error } = await supabase
      .from('players')
      .update({ color })
      .eq('id', playerId);
    
    if (error) throw new Error(error.message);
    return { success: true };
  }
};
