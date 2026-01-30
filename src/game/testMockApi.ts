// Simple test for the mock API
import { mockApi } from './mockApi';

async function testMockApi() {
  try {
    console.log('Testing Mock API...');
    
    // Test 1: Create room
    console.log('1. Creating room...');
    const { room } = await mockApi.createRoom('infiltrator');
    console.log('✅ Room created:', room.code);
    
    // Test 2: Join room
    console.log('2. Joining room...');
    const { player } = await mockApi.joinRoom(room.code, 'TestPlayer');
    console.log('✅ Player joined:', player.name);
    
    // Test 3: Get room
    console.log('3. Getting room state...');
    const roomState = await mockApi.getRoom(room.code);
    console.log('✅ Room state retrieved, players:', roomState.players.length);
    
    console.log('🎉 All tests passed! Mock API is working.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test if this file is executed directly
if (typeof window === 'undefined') {
  testMockApi();
}

export { testMockApi };