/**
 * Mock Razorpay Module for Testing
 * 
 * When RAZORPAY_TEST_MODE=true, this module returns fake responses
 * instead of making real API calls to Razorpay.
 * 
 * Use this to test the entire application without needing real Razorpay keys
 */

const crypto = require('crypto');

class MockRazorpay {
  constructor() {
    console.log('🧪 Mock Razorpay initialized (TEST MODE)');
    this.orders = {
      create: this.createOrder.bind(this)
    };
    this.transfers = {
      create: this.createTransfer.bind(this)
    };
  }

  createOrder({ amount, currency = 'INR', receipt }) {
    // Generate a fake order ID
    const orderId = `order_${crypto.randomBytes(8).toString('hex')}`;
    
    console.log(`✅ [MOCK] Created order: ${orderId} for ₹${amount/100}`);
    
    return Promise.resolve({
      id: orderId,
      entity: 'order',
      amount: amount,
      amount_paid: 0,
      amount_due: amount,
      currency: currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      offer_id: null,
      status: 'created',
      attempts: 0,
      notes: {},
      created_at: Math.floor(Date.now() / 1000)
    });
  }

  createTransfer({ account, amount, currency = 'INR', notes }) {
    // Generate a fake transfer ID
    const transferId = `trf_${crypto.randomBytes(8).toString('hex')}`;
    
    console.log(`✅ [MOCK] Transfer created: ${transferId}`);
    console.log(`   From: Your Account → To: ${account}`);
    console.log(`   Amount: ₹${amount/100}`);
    
    return Promise.resolve({
      id: transferId,
      entity: 'transfer',
      source: 'api',
      account: account,
      amount: amount,
      currency: currency,
      notes: notes || {},
      status: 'processed',
      created_at: Math.floor(Date.now() / 1000)
    });
  }

  verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    console.log(`✅ [MOCK] Payment verified: ${razorpay_payment_id}`);
    return true;
  }
}

module.exports = MockRazorpay;
