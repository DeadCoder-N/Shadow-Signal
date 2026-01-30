// Simple test for mock API
import { mockApi } from '../game/mockApi';

export async function testMockApiFlow() {
  console.log('=== TESTING MOCK API ===');
  
  try {
    // Test 1: Create room
    console.log('1. Creating room...');
    const createResult = await mockApi.createRoom('infiltrator');
    console.log('Room created:', createResult.room);
    
    // Test 2: Join the same room
    console.log('2. Joining room:', createResult.room.code);
    const joinResult = await mockApi.joinRoom(createResult.room.code, 'TestPlayer');
    console.log('Join result:', joinResult);
    
    // Test 3: Get room state
    console.log('3. Getting room state...');
    const roomState = await mockApi.getRoom(createResult.room.code);
    console.log('Room state:', roomState);
    
    console.log('✅ Mock API test PASSED');
    return true;
    
  } catch (error) {
    console.error('❌ Mock API test FAILED:', error);
    return false;
  }
}

// Auto-run test
testMockApiFlow();