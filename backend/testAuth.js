#!/usr/bin/env node

/**
 * Authentication Test Script
 * Tests the custom authentication system
 * 
 * Usage: node testAuth.js
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:4000/api';

// Test data
const testUser = {
  email: `test${Date.now()}@example.com`,
  password: 'Test123456',
  firstName: 'Test',
  lastName: 'User',
  userType: 'startup_founder',
  interests: ['technology', 'AI'],
  bio: 'Test user bio',
};

let authToken = '';
let userId = '';

// Helper function for API calls
const api = {
  post: (url, data, headers = {}) => 
    axios.post(`${API_BASE_URL}${url}`, data, { headers }),
  get: (url, headers = {}) => 
    axios.get(`${API_BASE_URL}${url}`, { headers }),
  put: (url, data, headers = {}) => 
    axios.put(`${API_BASE_URL}${url}`, data, { headers }),
  delete: (url, headers = {}) => 
    axios.delete(`${API_BASE_URL}${url}`, { headers }),
};

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${authToken}`,
});

async function testRegister() {
  console.log('\n📝 Testing Registration...');
  try {
    const response = await api.post('/auth/register', testUser);
    authToken = response.data.token;
    userId = response.data.user.id;
    
    console.log('✅ Registration successful!');
    console.log('   Token:', authToken.substring(0, 20) + '...');
    console.log('   User ID:', userId);
    console.log('   User:', response.data.user.email);
    return true;
  } catch (error) {
    console.error('❌ Registration failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testLogin() {
  console.log('\n🔐 Testing Login...');
  try {
    const response = await api.post('/auth/login', {
      email: testUser.email,
      password: testUser.password,
    });
    authToken = response.data.token;
    
    console.log('✅ Login successful!');
    console.log('   Token:', authToken.substring(0, 20) + '...');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetProfile() {
  console.log('\n👤 Testing Get Profile...');
  try {
    const response = await api.get('/auth/profile', getAuthHeaders());
    
    console.log('✅ Get profile successful!');
    console.log('   Name:', response.data.user.displayName);
    console.log('   Email:', response.data.user.email);
    console.log('   Type:', response.data.user.userType);
    return true;
  } catch (error) {
    console.error('❌ Get profile failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testUpdateProfile() {
  console.log('\n✏️  Testing Update Profile...');
  try {
    const response = await api.put('/auth/profile', {
      bio: 'Updated bio for testing',
      interests: ['technology', 'AI', 'startups'],
    }, getAuthHeaders());
    
    console.log('✅ Update profile successful!');
    console.log('   Bio:', response.data.user.bio);
    console.log('   Interests:', response.data.user.interests.join(', '));
    return true;
  } catch (error) {
    console.error('❌ Update profile failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testChangePassword() {
  console.log('\n🔑 Testing Change Password...');
  try {
    const newPassword = 'NewPassword123';
    await api.put('/auth/change-password', {
      currentPassword: testUser.password,
      newPassword: newPassword,
    }, getAuthHeaders());
    
    console.log('✅ Change password successful!');
    
    // Update password for future tests
    testUser.password = newPassword;
    return true;
  } catch (error) {
    console.error('❌ Change password failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testLoginWithNewPassword() {
  console.log('\n🔐 Testing Login with New Password...');
  try {
    const response = await api.post('/auth/login', {
      email: testUser.email,
      password: testUser.password,
    });
    authToken = response.data.token;
    
    console.log('✅ Login with new password successful!');
    return true;
  } catch (error) {
    console.error('❌ Login with new password failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testUnauthorizedAccess() {
  console.log('\n🚫 Testing Unauthorized Access...');
  try {
    await api.get('/auth/profile', {});
    console.error('❌ Should have been unauthorized!');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Unauthorized access correctly blocked!');
      return true;
    } else {
      console.error('❌ Unexpected error:', error.message);
      return false;
    }
  }
}

async function testLogout() {
  console.log('\n👋 Testing Logout...');
  try {
    await api.post('/auth/logout', {}, getAuthHeaders());
    
    console.log('✅ Logout successful!');
    return true;
  } catch (error) {
    console.error('❌ Logout failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Starting Authentication Tests...');
  console.log('=====================================');
  
  const results = [];
  
  // Run tests in sequence
  results.push(await testRegister());
  results.push(await testGetProfile());
  results.push(await testUpdateProfile());
  results.push(await testChangePassword());
  results.push(await testLoginWithNewPassword());
  results.push(await testUnauthorizedAccess());
  results.push(await testLogin());
  results.push(await testLogout());
  
  // Summary
  console.log('\n=====================================');
  console.log('📊 Test Summary:');
  console.log(`   Total: ${results.length}`);
  console.log(`   Passed: ${results.filter(r => r).length}`);
  console.log(`   Failed: ${results.filter(r => !r).length}`);
  
  if (results.every(r => r)) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    return true;
  } catch (error) {
    console.error('❌ Server is not running at', API_BASE_URL.replace('/api', ''));
    console.error('   Please start the server first: cd backend && npm run dev');
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }
  
  await runTests();
})();
