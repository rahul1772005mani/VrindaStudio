import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env variables from root folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5005;

// Initialize Razorpay client
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Endpoint: Create Order
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;

    // Validation
    if (!amount || typeof amount !== 'number' || amount < 100) {
      return res.status(400).json({ error: 'Valid amount in paise (minimum 100 paise) is required' });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(401).json({ error: 'Razorpay keys are missing from the server environment' });
    }

    const options = {
      amount, // amount in paise
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    
    if (!order) {
      throw new Error('Razorpay API did not return an order object');
    }

    res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error('Failed to create order on Razorpay:', err);
    res.status(500).json({ error: err.message || 'Razorpay order creation failed' });
  }
});

// Endpoint: Verify Signature
app.post('/api/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required payment verification fields' });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(401).json({ error: 'Razorpay API secret key is missing' });
    }

    // Verify signature: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      res.status(200).json({ success: true, message: 'Signature verified successfully' });
    } else {
      res.status(400).json({ success: false, error: 'Signature verification mismatch' });
    }
  } catch (err) {
    console.error('Failed to verify signature:', err);
    res.status(500).json({ error: err.message || 'Signature verification failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Razorpay checkout server is running on port ${PORT}`);
});
