# Shadow Signal - Realtime Social Deduction Game

A multiplayer social deduction game where players must identify the infiltrator or spy among them.

## Project Status

- **Project Type**: React + TypeScript + Youbase (Backend)
- **Frontend**: Vite + React + Tailwind CSS + Framer Motion
- **Backend**: Hono + Drizzle ORM (Youbase)
- **Realtime**: Polling (2s interval)

## Features

- **Game Modes**:
  - **Infiltrator**: 1 Infiltrator (No word) vs Citizens (Secret word).
  - **Spy**: 1 Spy (Similar word) vs Agents (Secret word).
- **Realtime Multiplayer**: Join via 4-letter code.
- **Role Assignment**: Automatic random role and word distribution.
- **Voting System**: Realtime voting and elimination.
- **Win Conditions**: Automatic detection of win states.

## Architecture

- **Frontend**:
  - `src/store/gameStore.ts`: Zustand store managing game state and polling.
  - `src/game/api.ts`: API client for backend communication.
  - `src/components/game/`: UI components (Lobby, GameRoom).
- **Backend**:
  - `backend/src/index.ts`: Hono server with game logic.
  - `backend/src/data.ts`: Word dataset.
  - **Database**: SQLite (D1) with `rooms` and `players` tables.

## How to Play

1. **Create Room**: Enter name and select mode (Infiltrator or Spy).
2. **Share Code**: Share the 4-letter code with friends.
3. **Start Game**: Host starts the game when everyone joins (min 3 players).
4. **Describe**: Players take turns describing their word.
5. **Vote**: Vote for the suspicious player.
6. **Win**: Eliminate the special role to win, or survive as the special role.

## Development

- **Frontend**: `npm run dev`
- **Backend**: `cd backend && npx edgespark deploy`
