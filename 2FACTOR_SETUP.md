# 2Factor API Integration Guide

This guide explains how to set up and use 2Factor API for SMS OTP verification in your KissanCity application.

## 🚀 What is 2Factor?

2Factor is an Indian SMS service provider that offers:
- ✅ **Robust HTTP API** for SMS OTP delivery
- ✅ **High Performance** - 200+ requests per second
- ✅ **Indian DLT Compliant** - Follows TRAI regulations
- ✅ **Free Trial** - 250 free credits for testing
- ✅ **Cost Effective** - Affordable for Indian market

## 📋 Setup Steps

### 1. Create 2Factor Account

1. Visit [2Factor Signup Page](https://2factor.in/)
2. Enter your **Email ID** and **Phone Number**
3. You'll receive **250 free credits** for testing
4. Account details will be sent to your registered email

### 2. Get API Key

After registration:
1. Check your email for API credentials
2. Copy the **API Key** (looks like: `a1b2c3d4e5f6g7h8`)
3. Add to your `.env` file:

```bash
TWOFACTOR_API_KEY=your_actual_api_key_here
```

### 3. DLT Registration (Required for Production)

For sending SMS to Indian numbers, you must complete DLT registration:

#### Why DLT Registration?
- **TRAI Mandate** - Required by Telecom Regulatory Authority of India
- **Prevents Spam** - Controls unsolicited commercial communication
- **Traceability** - End-to-end tracking of messages

#### Steps:
1. **Register as Enterprise** on DLT platform
2. **Get Sender ID** (6-character brand identifier)
3. **Submit SMS Templates** for approval
4. **Choose Telecom Operator** (Vodafone recommended for fast approval)

**Recommended DLT Portals:**
- [Vodafone DLT Registration](https://dlt.vodafoneidea.com/)
- [Airtel DLT Registration](https://dlt.airtel.in/)
- [Videocon DLT Registration](https://dlt.videocon.com/)

## 🔧 Technical Implementation

### API Endpoints Used

#### 1. Send OTP
```
GET https://2factor.in/API/V1/{API_KEY}/SMS/{PHONE}/AUTOGEN
```

#### 2. Verify OTP
```
GET https://2factor.in/API/V1/{API_KEY}/SMS/VERIFY/{SESSION_ID}/{OTP}
```

### Integration Details

#### Features Implemented:
- ✅ **Auto OTP Generation** - 2Factor generates OTP automatically
- ✅ **Session Management** - Tracks OTP sessions for verification
- ✅ **Fallback Support** - Console logging for development
- ✅ **Error Handling** - Comprehensive error responses
- ✅ **Logging** - Detailed debug logs for troubleshooting

#### Flow:
```
User enters phone → Send OTP API → 2Factor sends SMS → 
User enters OTP → Verify OTP API → 2Factor verifies → 
Account created
```

## 🧪 Testing

### Development Mode
If `TWOFACTOR_API_KEY` is not set:
- OTP is logged to console
- Any 6-digit OTP is accepted for verification
- Perfect for local development

### Production Mode
With valid API key:
- Real SMS are sent via 2Factor
- OTP must match what 2Factor sends
- Full audit trail in logs

## 📱 Phone Number Format

The system automatically formats Indian numbers:
- Input: `9876543210`
- Processed: `+919876543210`
- API expects: `919876543210` (without +)

## 🔍 Debugging

### Common Issues & Solutions

#### 1. "API Key Invalid"
- ✅ Check your API key in `.env`
- ✅ Ensure no extra spaces or quotes
- ✅ Verify key from 2Factor dashboard

#### 2. "OTP Not Received"
- ✅ Check phone number format (10 digits)
- ✅ Verify DLT registration (production)
- ✅ Check SMS template approval

#### 3. "Verification Failed"
- ✅ Check OTP session hasn't expired (10 minutes)
- ✅ Verify correct OTP entered
- ✅ Check server logs for API responses

### Log Examples

#### Successful Send:
```
📱 [2FACTOR SERVICE] OTP sent via 2Factor successfully!
✅ [2FACTOR SERVICE] Session ID: abc123def456
```

#### Successful Verify:
```
📱 [VERIFY OTP] 2Factor verification successful
✅ [VERIFY OTP] OTP marked as verified in database
```

## 🎯 Best Practices

### 1. Security
- ✅ Keep API key secure (never commit to git)
- ✅ Use environment variables
- ✅ Rotate API keys periodically

### 2. User Experience
- ✅ Show loading states during API calls
- ✅ Display clear error messages
- ✅ Implement resend timer (60 seconds)

### 3. Monitoring
- ✅ Monitor API usage and credits
- ✅ Track delivery success rates
- ✅ Log failed attempts for analysis

## 💰 Pricing & Credits

### Free Trial: 250 Credits
- Perfect for development and testing
- No credit card required

### Production Plans:
- **Pay-as-you-go** - ₹1-2 per SMS
- **Bulk packages** - Discounts available
- **No monthly commitments**

## 🆘 Support

### 2Factor Support:
- **Email**: support@2factor.in
- **Documentation**: https://2factor.in/API

### Common Issues:
1. **DLT Registration Issues** - Contact 2Factor support
2. **API Key Problems** - Check dashboard for active keys
3. **SMS Delivery** - Verify DLT compliance

## 🔄 Migration from Twilio

### What Changed:
- ❌ Removed Twilio dependency
- ✅ Added 2Factor API integration
- ✅ Maintained same frontend interface
- ✅ Preserved all existing functionality

### Benefits:
- ✅ **Indian Market Focus** - Better delivery rates in India
- ✅ **Cost Effective** - Cheaper than international providers
- ✅ **DLT Compliant** - Follows Indian regulations
- ✅ **Local Support** - Indian timezone support

## 🚀 Next Steps

1. **Get API Key**: Register at 2factor.in
2. **Update .env**: Add `TWOFACTOR_API_KEY`
3. **Test Development**: Try signup flow
4. **Complete DLT**: For production deployment
5. **Monitor Usage**: Track SMS delivery and credits

---

**🎉 Your KissanCity application now uses 2Factor for reliable SMS OTP delivery!**

For any issues, check the server logs or contact 2Factor support.
