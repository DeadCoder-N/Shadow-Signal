/**
 * API client for Shadow Signal game
 * @author Senior Full-Stack Developer
 */

import { createEdgeSpark } from "@edgespark/client";

// Configuration
const WORKER_URL = "https://staging--k0kvgktv0xc7frcvs5ac.youbase.cloud";
const API_TIMEOUT = 10000; // 10 seconds

// Initialize EdgeSpark client
export const client = createEdgeSpark({ 
  baseUrl: WORKER_URL,
  timeout: API_TIMEOUT
});

/**
 * API error class for better error handling
 */
class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Generic API request handler with error handling
 */
const apiRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  try {
    const response = await client.api.fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error('API request blocked or network error:', error);
    throw new ApiError(
      'Connection blocked. Please disable ad blocker or check network.'
    );
  }
};

/**
 * API endpoints
 */
export const api = {
  /**
   * Create a new game room
   */
  createRoom: async (mode: string) => {
    return apiRequest('/api/public/rooms', {
      method: 'POST',
      body: JSON.stringify({ mode }),
    });
  },

  /**
   * Join an existing room
   */
  joinRoom: async (code: string, name: string) => {
    return apiRequest(`/api/public/rooms/${code}/join`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  /**
   * Get room state and players
   */
  getRoom: async (code: string) => {
    return apiRequest(`/api/public/rooms/${code}`);
  },

  /**
   * Start the game
   */
  startGame: async (code: string) => {
    return apiRequest(`/api/public/rooms/${code}/start`, {
      method: 'POST',
    });
  },

  /**
   * Submit a clue
   */
  submitClue: async (code: string, playerId: number, clue: string) => {
    return apiRequest(`/api/public/rooms/${code}/clue`, {
      method: 'POST',
      body: JSON.stringify({ playerId, clue }),
    });
  },

  /**
   * Vote for a player
   */
  vote: async (code: string, targetPlayerId: number) => {
    return apiRequest(`/api/public/rooms/${code}/vote`, {
      method: 'POST',
      body: JSON.stringify({ targetPlayerId }),
    });
  },

  /**
   * Eliminate the player with most votes
   */
  eliminate: async (code: string) => {
    return apiRequest(`/api/public/rooms/${code}/eliminate`, {
      method: 'POST',
    });
  },

  /**
   * Restart the game with same players
   */
  restartGame: async (code: string) => {
    return apiRequest(`/api/public/rooms/${code}/restart`, {
      method: 'POST',
    });
  },
} as const;
