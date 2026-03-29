/**
 * Test script for 2Factor API integration
 * Run this script to test your 2Factor setup before using in production
 */

require('dotenv').config();
const { sendOTP, verifyOTP, generateOTP } = require('./utils/twoFactorService');

async function test2Factor() {
  console.log('🧪 Testing 2Factor API Integration');
  console.log('=====================================');

  // Test configuration
  const testPhone = '9876543210'; // Replace with your test phone number
  const apiKey = process.env.TWOFACTOR_API_KEY;

  console.log('📋 Configuration:');
  console.log('  - Test Phone:', testPhone);
  console.log('  - API Key:', apiKey ? `✅ Set (${apiKey.substring(0, 10)}...)` : '❌ Not set');
  console.log('');

  if (!apiKey) {
    console.log('⚠️  TWOFACTOR_API_KEY not set in .env');
    console.log('   Please add your API key to test the integration');
    console.log('   Get your key from: https://2factor.in/');
    console.log('');
    console.log('🧪 Testing in Development Mode (no API calls)');
  } else {
    console.log('🧪 Testing with Real 2Factor API');
  }

  try {
    // Test 1: Generate OTP
    console.log('\n📱 Test 1: Generate OTP');
    const otp = generateOTP();
    console.log('✅ Generated OTP:', otp);

    // Test 2: Send OTP
    console.log('\n📤 Test 2: Send OTP');
    const sendResult = await sendOTP(testPhone, otp);
    console.log('📤 Send Result:', JSON.stringify(sendResult, null, 2));

    if (sendResult.ok && sendResult.sessionId) {
      // Test 3: Verify OTP (with correct OTP)
      console.log('\n🔍 Test 3: Verify OTP (Correct)');
      const verifyResult = await verifyOTP(testPhone, otp, sendResult.sessionId);
      console.log('🔍 Verify Result (Correct):', JSON.stringify(verifyResult, null, 2));

      // Test 4: Verify OTP (with wrong OTP)
      console.log('\n🔍 Test 4: Verify OTP (Wrong)');
      const wrongOTP = '999999';
      const verifyWrongResult = await verifyOTP(testPhone, wrongOTP, sendResult.sessionId);
      console.log('🔍 Verify Result (Wrong):', JSON.stringify(verifyWrongResult, null, 2));
    } else {
      console.log('⚠️  Could not test verification - no session ID received');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('❌ Stack:', error.stack);
  }

  console.log('\n=====================================');
  console.log('🎉 2Factor Integration Test Complete!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. If tests passed ✅ - Your integration is ready');
  console.log('2. If tests failed ❌ - Check your API key and phone number');
  console.log('3. For production - Complete DLT registration');
  console.log('4. Monitor usage in your 2Factor dashboard');
}

// Run the test
if (require.main === module) {
  test2Factor().catch(console.error);
}

module.exports = { test2Factor };
