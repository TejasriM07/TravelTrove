const Razorpay = require('razorpay');
const MockRazorpay = require('./mockRazorpay');
require('dotenv').config();

// Lazy-load Razorpay instance only when keys are available
let instance = null;

const getRazorpayInstance = () => {
  if (!instance) {
    // Check if in test mode
    if (process.env.RAZORPAY_TEST_MODE === 'true' || process.env.RAZORPAY_TEST_MODE === true) {
      console.log('🧪 Using MOCK Razorpay (TEST MODE)');
      instance = new MockRazorpay();
      return instance;
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!keyId || !keySecret) {
      console.warn('⚠️  Razorpay keys not configured. Set RAZORPAY_TEST_MODE=true for testing, or add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
      return null;
    }
    
    instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    console.log('✅ Razorpay instance initialized with real API keys');
  }
  return instance;
};

/**
 * Create an order using Razorpay. To payout directly to a host, you'll need to
 * use Razorpay's Partners/Connect features to onboard hosts and use their
 * payout/account IDs. That requires additional KYC and platform setup.
 *
 * This helper creates a normal order and returns it; extend to include
 * transfer/payout logic once hosts are onboarded.
 */
exports.createOrder = async ({ amount, currency = 'INR', receipt }) => {
  const razorpay = getRazorpayInstance();
  if (!razorpay) throw new Error('Razorpay is not configured. Set RAZORPAY_TEST_MODE=true or add real Razorpay keys.');
  
  const options = {
    amount: Math.round(amount * 100), // in paise
    currency,
    receipt: receipt || `rcpt_${Date.now()}`,
  };
  return razorpay.orders.create(options);
};

exports.verifyWebhook = (body, signature) => {
  // Implement verification if using webhooks
};

/**
 * transferToHost: stub demonstrating transfer API usage.
 * Note: Razorpay transfer or payouts to connected accounts requires the
 * Connect/Partner setup and appropriate permissions. This function will
 * attempt a transfer call but in many setups you need to use the 'transfers'
 * API or 'payouts' depending on your account capability.
 */
exports.transferToHost = async ({ amount, currency = 'INR', hostAccountId, bookingId }) => {
  if (!hostAccountId) throw new Error('No hostAccountId provided');
  
  const razorpay = getRazorpayInstance();
  if (!razorpay) throw new Error('Razorpay is not configured');
  
  // Example transfer object — modify based on your Razorpay Connect setup
  const transfer = {
    account: hostAccountId,
    amount: Math.round(amount * 100),
    currency,
    notes: { bookingId: bookingId?.toString() }
  };
  // instance.payments or instance.transfers may be used in different APIs.
  // Here we try to call a generic transfers API; if not available this will fail
  if (typeof razorpay.transfers === 'function') {
    return razorpay.transfers.create(transfer);
  }
  
  if (typeof razorpay.transfers?.create === 'function') {
    return razorpay.transfers.create(transfer);
  }
  
  // Fallback: log and return a resolved promise to avoid blocking.
  console.warn('transfers API not available on this Razorpay instance; implement Connect transfers/payouts here');
  return Promise.resolve({ ok: true });
};
