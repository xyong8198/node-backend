const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  name: 'Test Customer',
  email: 'test@example.com',
  password: 'TestPass123!',
  role: 'customer'
};

const TEST_OWNER = {
  name: 'Test Owner',
  email: 'owner@example.com',
  password: 'OwnerPass123!',
  role: 'owner'
};

let customerToken = '';
let ownerToken = '';

// Test functions
async function testHealthCheck() {
  console.log('\n🩺 Testing Health Check...');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', response.data.message);
    return true;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
}

async function testRegisterCustomer() {
  console.log('\n👤 Testing Customer Registration...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, TEST_USER);
    customerToken = response.data.data.tokens.accessToken;
    console.log('✅ Customer registration successful');
    console.log('   User ID:', response.data.data.user.id);
    console.log('   Role:', response.data.data.user.role);
    return true;
  } catch (error) {
    console.log('❌ Customer registration failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testRegisterOwner() {
  console.log('\n🏪 Testing Owner Registration...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, TEST_OWNER);
    ownerToken = response.data.data.tokens.accessToken;
    console.log('✅ Owner registration successful');
    console.log('   User ID:', response.data.data.user.id);
    console.log('   Role:', response.data.data.user.role);
    return true;
  } catch (error) {
    console.log('❌ Owner registration failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testLogin() {
  console.log('\n🔐 Testing Login...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    console.log('✅ Login successful');
    console.log('   Token type:', response.data.data.tokens.tokenType);
    return true;
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetMe() {
  console.log('\n👤 Testing Get Current User...');
  try {
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${customerToken}`
      }
    });
    console.log('✅ Get current user successful');
    console.log('   Name:', response.data.data.user.name);
    console.log('   Email:', response.data.data.user.email);
    return true;
  } catch (error) {
    console.log('❌ Get current user failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testPublicEndpoint() {
  console.log('\n🌍 Testing Public Endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/demo/public`);
    console.log('✅ Public endpoint accessible');
    console.log('   Message:', response.data.message);
    return true;
  } catch (error) {
    console.log('❌ Public endpoint failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testCustomerOnlyEndpoint() {
  console.log('\n🛍️ Testing Customer-Only Endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/demo/customer-only`, {
      headers: {
        Authorization: `Bearer ${customerToken}`
      }
    });
    console.log('✅ Customer-only endpoint accessible with customer token');
    return true;
  } catch (error) {
    console.log('❌ Customer-only endpoint failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testOwnerOnlyEndpoint() {
  console.log('\n🏪 Testing Owner-Only Endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/demo/owner-only`, {
      headers: {
        Authorization: `Bearer ${ownerToken}`
      }
    });
    console.log('✅ Owner-only endpoint accessible with owner token');
    return true;
  } catch (error) {
    console.log('❌ Owner-only endpoint failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testUnauthorizedAccess() {
  console.log('\n🚫 Testing Unauthorized Access...');
  try {
    const response = await axios.get(`${BASE_URL}/demo/customer-only`, {
      headers: {
        Authorization: `Bearer ${ownerToken}` // Owner token for customer endpoint
      }
    });
    console.log('❌ Unauthorized access should have failed but succeeded');
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ Unauthorized access properly blocked');
      return true;
    } else {
      console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      return false;
    }
  }
}

async function testLogout() {
  console.log('\n🚪 Testing Logout...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/logout`, {}, {
      headers: {
        Authorization: `Bearer ${customerToken}`
      }
    });
    console.log('✅ Logout successful');
    return true;
  } catch (error) {
    console.log('❌ Logout failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testTokenAfterLogout() {
  console.log('\n🔒 Testing Token After Logout...');
  try {
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${customerToken}`
      }
    });
    console.log('❌ Token should be invalid after logout but request succeeded');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Token properly invalidated after logout');
      return true;
    } else {
      console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      return false;
    }
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 Starting JWT Authentication System Tests...');
  console.log('='.repeat(50));

  const tests = [
    testHealthCheck,
    testRegisterCustomer,
    testRegisterOwner,
    testLogin,
    testGetMe,
    testPublicEndpoint,
    testCustomerOnlyEndpoint,
    testOwnerOnlyEndpoint,
    testUnauthorizedAccess,
    testLogout,
    testTokenAfterLogout
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your JWT authentication system is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the server logs and fix any issues.');
  }
}

// Install axios if not already installed and run tests
if (require.main === module) {
  runTests().catch(error => {
    console.error('💥 Test suite failed to run:', error.message);
    process.exit(1);
  });
}

module.exports = { runTests };
