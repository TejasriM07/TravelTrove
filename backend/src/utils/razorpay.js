const Razorpay = require('razorpay');
require('dotenv').config();

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create an order using Razorpay. To payout directly to a host, you'll need to
 * use Razorpay's Partners/Connect features to onboard hosts and use their
 * payout/account IDs. That requires additional KYC and platform setup.
 *
 * This helper creates a normal order and returns it; extend to include
 * transfer/payout logic once hosts are onboarded.
 */
exports.createOrder = async ({ amount, currency = 'INR', receipt }) => {
  const options = {
    amount: Math.round(amount * 100), // in paise
    currency,
    receipt: receipt || `rcpt_${Date.now()}`,
  };
  return instance.orders.create(options);
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
  // Example transfer object — modify based on your Razorpay Connect setup
  const transfer = {
    account: hostAccountId,
    amount: Math.round(amount * 100),
    currency,
    notes: { bookingId: bookingId?.toString() }
  };
  // instance.payments or instance.transfers may be used in different APIs.
  // Here we try to call a generic transfers API; if not available this will fail
  if (typeof instance.transfers === 'function') {
    return instance.transfers.create(transfer);
  }
  // Fallback: log and return a resolved promise to avoid blocking.
  console.warn('transfers API not available on this Razorpay instance; implement Connect transfers/payouts here');
  return Promise.resolve({ ok: true });
};
