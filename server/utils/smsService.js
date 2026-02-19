/**
 * SMS Service for sending OTP
 * Supports Twilio (including Sandbox for trial accounts) and fallback to console logging for development
 */

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Fetch available Twilio phone numbers (including sandbox/trial number)
async function getTwilioPhoneNumbers(client) {
  try {
    console.log('📱 [SMS SERVICE] Fetching available Twilio phone numbers...');
    const incomingNumbers = await client.incomingPhoneNumbers.list({ limit: 20 });
    const numbers = incomingNumbers.map(num => ({
      phoneNumber: num.phoneNumber,
      friendlyName: num.friendlyName,
      capabilities: num.capabilities,
    }));
    console.log('✅ [SMS SERVICE] Found', numbers.length, 'Twilio phone number(s)');
    if (numbers.length > 0) {
      numbers.forEach((num, idx) => {
        console.log(`   ${idx + 1}. ${num.phoneNumber}${num.friendlyName ? ' (' + num.friendlyName + ')' : ''}`);
      });
    }
    return numbers;
  } catch (error) {
    console.error('❌ [SMS SERVICE] Error fetching Twilio numbers:', error.message);
    return [];
  }
}

// Send OTP via SMS
async function sendOTP(phone, otp) {
  console.log('📱 [SMS SERVICE] Starting sendOTP function');
  console.log('📱 [SMS SERVICE] Input - Phone:', phone, '| OTP:', otp);
  
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  let twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

  console.log('📱 [SMS SERVICE] Environment check:');
  console.log('  - TWILIO_ACCOUNT_SID:', twilioAccountSid ? `✅ Set (${twilioAccountSid.substring(0, 10)}...)` : '❌ Not set');
  console.log('  - TWILIO_AUTH_TOKEN:', twilioAuthToken ? `✅ Set (${twilioAuthToken.substring(0, 10)}...)` : '❌ Not set');
  console.log('  - TWILIO_PHONE_NUMBER:', twilioPhoneNumber ? `✅ Set (${twilioPhoneNumber})` : '❌ Not set');
  console.log('  - Raw values check:');
  console.log('    - process.env.TWILIO_ACCOUNT_SID exists:', !!process.env.TWILIO_ACCOUNT_SID);
  console.log('    - process.env.TWILIO_AUTH_TOKEN exists:', !!process.env.TWILIO_AUTH_TOKEN);
  console.log('    - process.env.TWILIO_PHONE_NUMBER exists:', !!process.env.TWILIO_PHONE_NUMBER);

  // If Twilio is configured, use it
  if (twilioAccountSid && twilioAuthToken) {
    console.log('📱 [SMS SERVICE] Twilio configured, attempting to send via Twilio...');
    try {
      const twilio = require('twilio');
      const client = twilio(twilioAccountSid, twilioAuthToken);
      console.log('✅ [SMS SERVICE] Twilio client created');

      // If no phone number is provided, try to auto-detect from Twilio account
      if (!twilioPhoneNumber) {
        console.log('📱 [SMS SERVICE] No TWILIO_PHONE_NUMBER set, attempting to auto-detect...');
        const availableNumbers = await getTwilioPhoneNumbers(client);
        if (availableNumbers.length > 0) {
          twilioPhoneNumber = availableNumbers[0].phoneNumber;
          console.log('✅ [SMS SERVICE] Auto-detected phone number:', twilioPhoneNumber);
          console.log('💡 [SMS SERVICE] Tip: Set TWILIO_PHONE_NUMBER in .env to avoid auto-detection');
        } else {
          throw new Error('No phone numbers found in Twilio account. Please purchase a number or set TWILIO_PHONE_NUMBER.');
        }
      }

      // Format phone number (add country code if not present)
      let formattedPhone = phone.replace(/\D/g, ''); // Remove non-digits
      console.log('📱 [SMS SERVICE] Original phone:', phone);
      console.log('📱 [SMS SERVICE] Cleaned phone:', formattedPhone);
      
      if (!formattedPhone.startsWith('+')) {
        // Assume Indian number if no country code
        formattedPhone = `+91${formattedPhone}`;
        console.log('📱 [SMS SERVICE] Formatted phone with country code:', formattedPhone);
      }

      const messageBody = `Your UNI10 verification code is: ${otp}. This code will expire in 10 minutes.`;
      console.log('📱 [SMS SERVICE] Message body:', messageBody);
      console.log('📱 [SMS SERVICE] Sending to:', formattedPhone);
      console.log('📱 [SMS SERVICE] From (raw):', twilioPhoneNumber);
      
      // Format Twilio phone number (should be in E.164 format)
      let formattedTwilioNumber = twilioPhoneNumber.replace(/\D/g, '');
      if (!formattedTwilioNumber.startsWith('+')) {
        // If it's a 10-digit number, assume it's Indian and add +91
        if (formattedTwilioNumber.length === 10) {
          formattedTwilioNumber = `+91${formattedTwilioNumber}`;
        } else {
          // Otherwise, try to add +1 for US or keep as is
          formattedTwilioNumber = `+${formattedTwilioNumber}`;
        }
      }
      console.log('📱 [SMS SERVICE] From (formatted):', formattedTwilioNumber);

      let message;
      try {
        message = await client.messages.create({
          body: messageBody,
          from: formattedTwilioNumber,
          to: formattedPhone,
        });

        console.log('✅ [SMS SERVICE] OTP sent via Twilio successfully!');
        console.log('✅ [SMS SERVICE] Twilio Message SID:', message.sid);
        console.log('✅ [SMS SERVICE] Twilio Status:', message.status);
        return { ok: true, messageId: message.sid, status: message.status };
      } catch (sendError) {
        // If the error is about invalid "from" number, try to auto-detect and retry
        if ((sendError.code === 21608 || sendError.message.includes('not a Twilio phone number')) && twilioPhoneNumber) {
          console.log('⚠️  [SMS SERVICE] Provided number failed, attempting to find valid Twilio number...');
          const availableNumbers = await getTwilioPhoneNumbers(client);
          if (availableNumbers.length > 0) {
            const autoDetectedNumber = availableNumbers[0].phoneNumber;
            console.log('🔄 [SMS SERVICE] Retrying with auto-detected number:', autoDetectedNumber);
            
            message = await client.messages.create({
              body: messageBody,
              from: autoDetectedNumber,
              to: formattedPhone,
            });

            console.log('✅ [SMS SERVICE] OTP sent via Twilio successfully (using auto-detected number)!');
            console.log('✅ [SMS SERVICE] Twilio Message SID:', message.sid);
            console.log('✅ [SMS SERVICE] Twilio Status:', message.status);
            console.log('💡 [SMS SERVICE] Update your .env: TWILIO_PHONE_NUMBER=' + autoDetectedNumber);
            return { ok: true, messageId: message.sid, status: message.status };
          }
        }
        // Re-throw the error to be handled by outer catch
        throw sendError;
      }
    } catch (error) {
      console.error('❌ [SMS SERVICE] Twilio SMS error occurred:');
      console.error('❌ [SMS SERVICE] Error message:', error.message);
      console.error('❌ [SMS SERVICE] Error code:', error.code);
      
      // Provide helpful error messages for common issues
      if (error.code === 21608 || error.code === 21659 || error.message.includes('not a Twilio phone number')) {
        console.error('\n⚠️  [SMS SERVICE] IMPORTANT: The phone number in TWILIO_PHONE_NUMBER is not valid in your Twilio account.');
        console.error('   This usually happens when:');
        console.error('   1. You\'re using a "Verified Caller ID" instead of a purchased Twilio phone number');
        console.error('   2. On Twilio Trial accounts, you can only send FROM purchased phone numbers');
        console.error('   3. Verified Caller IDs can only be used as "To" numbers, not "From" numbers');
        
        // Try to fetch available phone numbers and suggest using them
        console.error('\n   🔍 Attempting to find your Twilio phone numbers...');
        try {
          // Re-create client if needed (in case it's not in scope)
          const twilio = require('twilio');
          const errorClient = twilio(twilioAccountSid, twilioAuthToken);
          const availableNumbers = await getTwilioPhoneNumbers(errorClient);
          if (availableNumbers.length > 0) {
            console.error('   ✅ Found', availableNumbers.length, 'available Twilio phone number(s):');
            availableNumbers.forEach((num, idx) => {
              console.error(`   ${idx + 1}. ${num.phoneNumber}${num.friendlyName ? ' (' + num.friendlyName + ')' : ''}`);
            });
            console.error('\n   💡 Solution: Use one of the numbers above in your .env file:');
            console.error(`   TWILIO_PHONE_NUMBER=${availableNumbers[0].phoneNumber}`);
            console.error('   Then restart your server and try again.\n');
          } else {
            console.error('   ❌ No phone numbers found in your Twilio account.');
            console.error('\n   📱 IMPORTANT: You need to purchase a phone number from Twilio:');
            console.error('   1. Go to https://console.twilio.com/');
            console.error('   2. Navigate to: Phone Numbers → Buy a number');
            console.error('   3. Select your country:');
            console.error('      - US numbers: ~$1/month (recommended for testing)');
            console.error('      - India numbers: ~$2-3/month');
            console.error('   4. Click "Search" and then "Buy" on a number');
            console.error('   5. After purchase, go to: Phone Numbers → Manage → Active numbers');
            console.error('   6. Copy the EXACT phone number shown (in E.164 format like +14155552671)');
            console.error('   7. Update TWILIO_PHONE_NUMBER in your .env file:');
            console.error(`      TWILIO_PHONE_NUMBER=+14155552671`);
            console.error('   8. Restart your server');
            console.error('\n   💰 Cost: ~$1-2 USD per month for a US phone number');
            console.error('   📞 Current value in .env:', twilioPhoneNumber);
            console.error('   ⚠️  Note: Verified Caller IDs cannot be used as "From" numbers on trial accounts\n');
          }
        } catch (fetchError) {
          console.error('   ❌ Could not fetch phone numbers:', fetchError.message);
          console.error('\n   📱 Manual steps to get your Twilio phone number:');
          console.error('   1. Go to https://console.twilio.com/');
          console.error('   2. Navigate to: Phone Numbers → Buy a number');
          console.error('   3. Select country (US recommended - cheapest option)');
          console.error('   4. Search and purchase a number (~$1/month)');
          console.error('   5. After purchase, go to: Phone Numbers → Manage → Active numbers');
          console.error('   6. Copy the EXACT phone number shown (in E.164 format like +14155552671)');
          console.error('   7. Update TWILIO_PHONE_NUMBER in your .env file');
          console.error('   8. Restart your server\n');
        }
      } else if (error.code === 21211) {
        console.error('\n⚠️  [SMS SERVICE] Invalid "to" phone number format.');
        console.error('   Make sure the recipient number is in E.164 format.\n');
      } else if (error.code === 21607) {
        console.error('\n⚠️  [SMS SERVICE] Trial account restriction.');
        console.error('   On Twilio trial accounts, you can only send FROM your trial/sandbox phone number.');
        console.error('   Please use the phone number assigned to your trial account.\n');
      }
      
      console.error('❌ [SMS SERVICE] Error stack:', error.stack);
      console.log('📱 [SMS SERVICE] Falling back to console logging...');
      // Fall through to console logging
    }
  } else {
    console.log('⚠️  [SMS SERVICE] Twilio not configured, using development mode');
  }

  // Fallback: Log OTP to console (for development)
  console.log('========================================');
  console.log('📱 [SMS SERVICE] OTP SMS (Development Mode)');
  console.log('📱 Phone Number:', phone);
  console.log('🔢 OTP Code:', otp);
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('========================================');
  console.log('\n⚠️  SMS service not configured. OTP logged above.');
  console.log('To enable SMS, set the following in .env:');
  console.log('  - TWILIO_ACCOUNT_SID');
  console.log('  - TWILIO_AUTH_TOKEN');
  console.log('  - TWILIO_PHONE_NUMBER');
  console.log('========================================\n');

  return { ok: true, messageId: 'console-log', devMode: true };
}

module.exports = {
  generateOTP,
  sendOTP,
};
