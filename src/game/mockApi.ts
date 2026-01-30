// Mock API for local development when backend is unavailable
// Robust storage-backed implementation with proper normalization, persistence, and timestamps

import { WORD_DATA } from './mockData';

// Types align with store/types while adding timestamps for client timers
interface Room {
  id: number;
  code: string; // always uppercase
  status: 'lobby' | 'selecting' | 'voting' | 'ended';
  mode: 'infiltrator' | 'spy' | string; // keep backward compatible with existing store typing
  currentTurnPlayerId: number | null;
  options: string | null; // JSON string array for compatibility with existing UI
  winner?: 'citizens' | 'special' | string;
  // Timestamps for server-synced timers
  phaseStartTime?: number;
  lobbyStartTime?: number;
}

interface Player {
  id: number;
  name: string;
  role: string | null;
  word: string | null;
  clue?: string;
  isAlive: number;
  votes: number;
  isHost: number;
}

// Storage keys and helpers
const getStorageKey = (key: string) => `shadow-signal-${key}`;

const normalizeCode = (code: string) => code.trim().toUpperCase();

const readMap = <K, V>(key: string): Map<any, any> => {
  const raw = localStorage.getItem(getStorageKey(key));
  try {
    return raw ? new Map(JSON.parse(raw)) : new Map();
  } catch {
    return new Map();
  }
};

const writeMap = (key: string, map: Map<any, any>) => {
  localStorage.setItem(getStorageKey(key), JSON.stringify(Array.from(map.entries())));
};

const getRooms = (): Map<string, Room> => readMap<string, Room>('rooms');
const setRooms = (rooms: Map<string, Room>) => writeMap('rooms', rooms);

const getPlayers = (): Map<number, Player> => readMap<number, Player>('players');
const setPlayers = (players: Map<number, Player>) => writeMap('players', players);

const getRoomPlayers = (): Map<string, number[]> => readMap<string, number[]>('roomPlayers');
const setRoomPlayers = (roomPlayers: Map<string, number[]>) => writeMap('roomPlayers', roomPlayers);

const getNextIds = () => {
  const roomId = parseInt(localStorage.getItem(getStorageKey('nextRoomId')) || '1', 10);
  const playerId = parseInt(localStorage.getItem(getStorageKey('nextPlayerId')) || '1', 10);
  return { roomId, playerId };
};

const setNextIds = (roomId: number, playerId: number) => {
  localStorage.setItem(getStorageKey('nextRoomId'), roomId.toString());
  localStorage.setItem(getStorageKey('nextPlayerId'), playerId.toString());
};

const generateCode = (length = 4) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Utility: persist room update
const updateRoom = (rooms: Map<string, Room>, code: string, patch: Partial<Room>) => {
  const current = rooms.get(code);
  if (!current) return;
  const next = { ...current, ...patch } as Room;
  rooms.set(code, next);
};

export const mockApi = {
  // Create a new room
  createRoom: async (mode: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));

    const rooms = getRooms();
    const { roomId, playerId } = getNextIds();

    let code = generateCode(4);
    while (rooms.has(code)) {
      code = generateCode(4);
    }

    const room: Room = {
      id: roomId,
      code,
      mode: (mode as Room['mode']) || 'infiltrator',
      status: 'lobby',
      currentTurnPlayerId: null,
      options: null,
      lobbyStartTime: undefined,
      phaseStartTime: undefined,
    };

    rooms.set(code, room);
    setRooms(rooms);

    const roomPlayers = getRoomPlayers();
    roomPlayers.set(code, []);
    setRoomPlayers(roomPlayers);

    // increment only roomId; playerId will be consumed on join
    setNextIds(roomId + 1, playerId);

    console.log(`🏠 Mock: Created room ${code}, total rooms: ${rooms.size}`);
    return { room };
  },

  // Join an existing room by code
  joinRoom: async (code: string, name: string) => {
    await new Promise(resolve => setTimeout(resolve, 150));

    const upperCode = normalizeCode(code);
    if (upperCode.length !== 4) throw new Error('Invalid room code');

    const rooms = getRooms();
    const players = getPlayers();
    const roomPlayers = getRoomPlayers();
    const { roomId, playerId } = getNextIds();

    const room = rooms.get(upperCode);
    if (!room) {
      console.error(`❌ Mock: Room ${upperCode} not found. Known rooms:`, Array.from(rooms.keys()));
      throw new Error('Room not found');
    }

    if (room.status !== 'lobby') throw new Error('Game already started');

    const ids = roomPlayers.get(upperCode) || [];
    const isHost = ids.length === 0 ? 1 : 0;

    const player: Player = {
      id: playerId,
      name: name.trim(),
      role: null,
      word: null,
      isAlive: 1,
      votes: 0,
      isHost,
      clue: undefined,
    };

    players.set(player.id, player);
    ids.push(player.id);
    roomPlayers.set(upperCode, ids);

    // If lobby reaches threshold and no lobbyStartTime set, initialize it
    if ((ids.length >= 3) && !room.lobbyStartTime) {
      updateRoom(rooms, upperCode, { lobbyStartTime: Date.now() });
    }

    setPlayers(players);
    setRoomPlayers(roomPlayers);
    setRooms(rooms);
    setNextIds(roomId, playerId + 1);

    console.log(`✅ Mock: ${name} joined ${upperCode} (${isHost ? 'HOST' : 'PLAYER'})`);
    return { player, room: rooms.get(upperCode)! };
  },

  // Get room state with players list
  getRoom: async (code: string) => {
    await new Promise(resolve => setTimeout(resolve, 80));

    const upperCode = normalizeCode(code);
    const rooms = getRooms();
    const players = getPlayers();
    const roomPlayers = getRoomPlayers();

    const room = rooms.get(upperCode);
    if (!room) throw new Error('Room not found');

    const ids = roomPlayers.get(upperCode) || [];
    const roomPlayersData = ids.map(id => players.get(id)).filter(Boolean) as Player[];

    return { room, players: roomPlayersData };
  },

  // Start the game: assign roles/words and move to selecting
  startGame: async (code: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));

    const upperCode = normalizeCode(code);
    const rooms = getRooms();
    const players = getPlayers();
    const roomPlayers = getRoomPlayers();

    const room = rooms.get(upperCode);
    if (!room) throw new Error('Room not found');

    const ids = roomPlayers.get(upperCode) || [];
    const roomPlayersData = ids.map(id => players.get(id)).filter(Boolean) as Player[];
    if (roomPlayersData.length < 3) throw new Error('Need at least 3 players');

    // Assign Roles
    const shuffled = [...roomPlayersData].sort(() => Math.random() - 0.5);
    const specialIndex = Math.floor(Math.random() * shuffled.length);

    // Pick Words
    const domains = WORD_DATA.domains;
    const domainIndex = Math.floor(Math.random() * domains.length);
    const domain = domains[domainIndex];
    const wordObj = domain.words[Math.floor(Math.random() * domain.words.length)];

    const commonWord = wordObj.word;
    const specialWord = room.mode === 'spy'
      ? wordObj.similar[Math.floor(Math.random() * wordObj.similar.length)]
      : '';

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

    // Update players
    shuffled.forEach((p, i) => {
      const isSpecial = i === specialIndex;
      let role = 'citizen';
      let word = commonWord;

      if (room.mode === 'infiltrator') {
        if (isSpecial) {
          role = 'infiltrator';
          word = '';
        } else {
          role = 'citizen';
        }
      } else { // spy mode
        if (isSpecial) {
          role = 'spy';
          word = specialWord || '';
        } else {
          role = 'agent';
        }
      }

      const player = players.get(p.id);
      if (player) {
        player.role = role;
        player.word = word;
        player.clue = undefined;
      }
    });

    // Update Room
    updateRoom(rooms, upperCode, {
      status: 'selecting',
      currentTurnPlayerId: shuffled[0].id,
      options: JSON.stringify(options),
      phaseStartTime: Date.now(),
      lobbyStartTime: undefined,
      winner: undefined,
    });

    setPlayers(players);
    setRooms(rooms);

    return { success: true };
  },

  // Submit a clue for a player; advance to voting if all alive have clues
  submitClue: async (code: string, playerId: number, clue: string) => {
    await new Promise(resolve => setTimeout(resolve, 120));

    const upperCode = normalizeCode(code);
    const rooms = getRooms();
    const players = getPlayers();
    const roomPlayers = getRoomPlayers();

    const room = rooms.get(upperCode);
    if (!room) throw new Error('Room not found');

    const player = players.get(playerId);
    if (player) {
      player.clue = clue;
    }

    const ids = roomPlayers.get(upperCode) || [];
    const roomPlayersData = ids.map(id => players.get(id)).filter(Boolean) as Player[];
    const alivePlayers = roomPlayersData.filter(p => p.isAlive === 1);
    const allSubmitted = alivePlayers.every(p => p.clue && p.clue.length > 0);

    if (allSubmitted) {
      updateRoom(rooms, upperCode, { status: 'voting', phaseStartTime: Date.now() });
    }

    setPlayers(players);
    setRooms(rooms);

    return { success: true };
  },

  // Register a vote for a target player (note: voter tracking not available in current API shape)
  vote: async (code: string, targetPlayerId: number) => {
    await new Promise(resolve => setTimeout(resolve, 100));

    const players = getPlayers();
    const target = players.get(targetPlayerId);
    if (target) {
      target.votes = (target.votes || 0) + 1;
    }

    setPlayers(players);
    return { success: true };
  },

  // Eliminate top-voted player and compute win/phase transitions
  eliminate: async (code: string) => {
    await new Promise(resolve => setTimeout(resolve, 180));

    const upperCode = normalizeCode(code);
    const rooms = getRooms();
    const players = getPlayers();
    const roomPlayers = getRoomPlayers();

    const room = rooms.get(upperCode);
    if (!room) throw new Error('Room not found');

    const ids = roomPlayers.get(upperCode) || [];
    const roomPlayersData = ids.map(id => players.get(id)).filter(Boolean) as Player[];

    // Determine elimination target
    let maxVotes = -1;
    let toEliminate: Player | null = null;

    roomPlayersData.forEach(p => {
      const v = p.votes || 0;
      if (v > maxVotes) {
        maxVotes = v;
        toEliminate = p;
      }
    });

    // No votes => no elimination, go to next round
    if (!toEliminate || maxVotes <= 0) {
      // Reset votes
      roomPlayersData.forEach(p => (p.votes = 0));
      updateRoom(rooms, upperCode, { status: 'selecting', phaseStartTime: Date.now() });
      setPlayers(players);
      setRooms(rooms);
      return { eliminated: null };
    }

    // Apply elimination
    toEliminate.isAlive = 0;

    // Win condition
    if (toEliminate.role === 'infiltrator' || toEliminate.role === 'spy') {
      updateRoom(rooms, upperCode, { status: 'ended', winner: 'citizens' });
      // Reset votes
      roomPlayersData.forEach(p => (p.votes = 0));
      setPlayers(players);
      setRooms(rooms);
      return { eliminated: toEliminate, winner: 'citizens' };
    }

    // If only 2 players left and special is alive -> Special wins
    const alive = roomPlayersData.filter(p => p.id !== toEliminate.id && p.isAlive === 1);
    if (alive.length <= 2) {
      updateRoom(rooms, upperCode, { status: 'ended', winner: 'special' });
      // Reset votes
      roomPlayersData.forEach(p => (p.votes = 0));
      setPlayers(players);
      setRooms(rooms);
      return { eliminated: toEliminate, winner: 'special' };
    }

    // Continue next round
    roomPlayersData.forEach(p => (p.votes = 0));
    updateRoom(rooms, upperCode, { status: 'selecting', phaseStartTime: Date.now() });

    setPlayers(players);
    setRooms(rooms);

    return { eliminated: toEliminate };
  },

  // Force advance phase (host control)
  forcePhaseAdvance: async (code: string) => {
    await new Promise(resolve => setTimeout(resolve, 120));

    const upperCode = normalizeCode(code);
    const rooms = getRooms();
    const players = getPlayers();
    const roomPlayers = getRoomPlayers();

    const room = rooms.get(upperCode);
    if (!room) throw new Error('Room not found');

    let newStatus: Room['status'] = room.status;

    if (room.status === 'selecting') {
      newStatus = 'voting';
      updateRoom(rooms, upperCode, { status: newStatus, phaseStartTime: Date.now() });
    } else if (room.status === 'voting') {
      // Auto-eliminate player with most votes (if any), else move to selecting
      const ids = roomPlayers.get(upperCode) || [];
      const roomPlayersData = ids.map(id => players.get(id)).filter(Boolean) as Player[];

      let maxVotes = -1;
      let toEliminate: Player | null = null;

      roomPlayersData.forEach(p => {
        const v = p.votes || 0;
        if (v > maxVotes) {
          maxVotes = v;
          toEliminate = p;
        }
      });

      if (toEliminate && maxVotes > 0) {
        toEliminate.isAlive = 0;
        // Check win conditions
        if (toEliminate.role === 'infiltrator' || toEliminate.role === 'spy') {
          newStatus = 'ended';
          updateRoom(rooms, upperCode, { status: newStatus, winner: 'citizens' });
        } else {
          const alive = roomPlayersData.filter(p => p.id !== toEliminate.id && p.isAlive === 1);
          if (alive.length <= 2) {
            newStatus = 'ended';
            updateRoom(rooms, upperCode, { status: newStatus, winner: 'special' });
          } else {
            newStatus = 'selecting';
            updateRoom(rooms, upperCode, { status: newStatus, phaseStartTime: Date.now() });
          }
        }
      } else {
        // No votes -> no elimination, go back to selecting
        newStatus = 'selecting';
        updateRoom(rooms, upperCode, { status: newStatus, phaseStartTime: Date.now() });
      }

      // Reset votes
      roomPlayersData.forEach(p => (p.votes = 0));
      setPlayers(players);
    }

    setRooms(rooms);

    return { success: true, newStatus: rooms.get(upperCode)!.status };
  },
};
