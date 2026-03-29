/**
 * 2Factor SMS Service for sending OTP
 * Replaces Twilio with 2Factor API for Indian SMS delivery
 */

const axios = require('axios');

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via 2Factor API
async function sendOTP(phone, otp) {
  console.log('📱 [2FACTOR SERVICE] Starting sendOTP function');
  console.log('📱 [2FACTOR SERVICE] Input - Phone:', phone);
  
  const apiKey = process.env.TWOFACTOR_API_KEY;
  
  console.log('📱 [2FACTOR SERVICE] Environment check:');
  console.log('  - TWOFACTOR_API_KEY:', apiKey ? `✅ Set (${apiKey.substring(0, 10)}...)` : '❌ Not set');

  // Always use 2Factor API
  if (apiKey) {
    console.log('📱 [2FACTOR SERVICE] Using 2Factor API...');
    try {
      // Format phone number (add country code if not present)
      let formattedPhone = phone.replace(/\D/g, ''); // Remove non-digits
      console.log('📱 [2FACTOR SERVICE] Original phone:', phone);
      console.log('📱 [2FACTOR SERVICE] Cleaned phone:', formattedPhone);
      
      if (!formattedPhone.startsWith('+')) {
        // Assume Indian number if no country code
        formattedPhone = `+91${formattedPhone}`;
        console.log('📱 [2FACTOR SERVICE] Formatted phone with country code:', formattedPhone);
      }

      // Remove + for 2Factor API (they want just the number with country code)
      const apiPhone = formattedPhone.replace('+', '');
      
      // Use AUTOGEN template for OTP generation and sending
      const url = `https://2factor.in/API/V1/${apiKey}/SMS/${apiPhone}/AUTOGEN`;
      console.log('📱 [2FACTOR SERVICE] API URL:', url.replace(apiKey, '[API_KEY]'));
      
      console.log('📱 [2FACTOR SERVICE] Sending OTP request to 2Factor...');
      const response = await axios.get(url);
      
      console.log('📱 [2FACTOR SERVICE] 2Factor Response:', JSON.stringify(response.data, null, 2));
      
      if (response.data.Status === 'Success') {
        console.log('✅ [2FACTOR SERVICE] OTP sent via 2Factor successfully!');
        console.log('✅ [2FACTOR SERVICE] Session ID:', response.data.Details);
        
        return { 
          ok: true, 
          sessionId: response.data.Details,
          messageId: response.data.Details,
          status: 'Success'
        };
      } else {
        console.error('❌ [2FACTOR SERVICE] 2Factor API returned error:', response.data);
        throw new Error(response.data.Details || 'Failed to send OTP via 2Factor');
      }
    } catch (error) {
      console.error('❌ [2FACTOR SERVICE] 2Factor API error occurred:');
      console.error('❌ [2FACTOR SERVICE] Error message:', error.message);
      
      if (error.response) {
        console.error('❌ [2FACTOR SERVICE] API Response Status:', error.response.status);
        console.error('❌ [2FACTOR SERVICE] API Response Data:', JSON.stringify(error.response.data, null, 2));
      }
      
      console.error('❌ [2FACTOR SERVICE] Error stack:', error.stack);
      console.log('❌ [2FACTOR SERVICE] 2Factor service failed - no fallback available');
      
      return { ok: false, message: '2Factor service failed. Please check your API key and try again.' };
    }
  } else {
    console.log('❌ [2FACTOR SERVICE] 2Factor not configured - OTP service unavailable');
    console.log('❌ [2FACTOR SERVICE] Please set TWOFACTOR_API_KEY in your .env file');
    console.log('❌ [2FACTOR SERVICE] Get your API key from: https://2factor.in/');

    return { ok: false, message: '2Factor service not configured. Please contact administrator.' };
  }
}

// Verify OTP via 2Factor API
async function verifyOTP(phone, otp, sessionId) {
  console.log('📱 [2FACTOR SERVICE] Starting verifyOTP function');
  console.log('📱 [2FACTOR SERVICE] Input - Phone:', phone, '| OTP:', otp, '| Session ID:', sessionId);
  
  const apiKey = process.env.TWOFACTOR_API_KEY;
  
  if (!apiKey) {
    console.log('❌ [2FACTOR SERVICE] 2Factor not configured - verification unavailable');
    return { ok: false, message: '2Factor service not configured. Please contact administrator.' };
  }

  if (!sessionId) {
    console.log('❌ [2FACTOR SERVICE] No session ID provided - cannot verify');
    return { ok: false, message: 'Invalid verification session. Please request a new OTP.' };
  }

  try {
    // Format phone number (remove non-digits and add country code)
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+91${formattedPhone}`;
    }
    const apiPhone = formattedPhone.replace('+', '');
    
    const url = `https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${sessionId}/${otp}`;
    console.log('📱 [2FACTOR SERVICE] Verification API URL:', url.replace(apiKey, '[API_KEY]').replace(sessionId, '[SESSION_ID]'));
    
    console.log('📱 [2FACTOR SERVICE] Sending verification request to 2Factor...');
    const response = await axios.get(url);
    
    console.log('📱 [2FACTOR SERVICE] 2Factor Verification Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.Status === 'Success') {
      console.log('✅ [2FACTOR SERVICE] OTP verified successfully via 2Factor!');
      return { ok: true, verified: true, message: 'OTP verified successfully' };
    } else {
      console.error('❌ [2FACTOR SERVICE] OTP verification failed:', response.data.Details);
      return { ok: false, message: response.data.Details || 'Invalid OTP' };
    }
  } catch (error) {
    console.error('❌ [2FACTOR SERVICE] 2Factor verification error occurred:');
    console.error('❌ [2FACTOR SERVICE] Error message:', error.message);
    
    if (error.response) {
      console.error('❌ [2FACTOR SERVICE] API Response Status:', error.response.status);
      console.error('❌ [2FACTOR SERVICE] API Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    console.error('❌ [2FACTOR SERVICE] Error stack:', error.stack);
    
    return { ok: false, message: 'OTP verification failed. Please try again.' };
  }
}

module.exports = {
  generateOTP,
  sendOTP,
  verifyOTP,
};
