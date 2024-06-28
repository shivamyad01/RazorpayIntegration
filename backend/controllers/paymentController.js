// paymentController.js

const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/payment');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Endpoint to initiate auto payment
exports.autoPay = async (req, res) => {
  try {
    const amount = 1; // Fixed amount for auto payment (in Rs)
    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency: 'INR',
      receipt: 'receipt_auto_payment_' + Math.floor(Math.random() * 1000), // Unique receipt identifier
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Error initiating auto payment:', error);
    res.status(500).json({ error: 'Failed to initiate auto payment' });
  }
};

// Endpoint to verify auto payment
exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, name, mobile } = req.body;

  if (!amount || !name || !mobile) {
    return res.status(400).json({ error: 'Amount, name, and mobile number are required' });
  }

  // Verify signature
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
  const generated_signature = hmac.digest('hex');

  if (generated_signature === razorpay_signature) {
    // Signature is valid, save payment details to MongoDB
    const payment = new Payment({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      amount: amount, // Ensure amount is provided
      status: 'success',
      name: name,
      mobile: mobile,
    });

    try {
      const savedPayment = await payment.save();
      res.json({ status: 'success', receipt: savedPayment });
    } catch (error) {
      console.error('Error saving payment:', error);
      res.status(500).json({ error: 'Failed to save payment' });
    }
  } else {
    res.json({ status: 'failure' });
  }
};
