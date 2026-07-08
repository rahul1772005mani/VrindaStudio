import crypto from 'crypto';

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    console.log('Received Verify Request Body:', body);
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Validate fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.warn('Missing verification parameters:', { razorpay_order_id, razorpay_payment_id, razorpay_signature });
      return res.status(400).json({ error: 'Missing required payment verification fields' });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      console.error('Razorpay secret not found in env!');
      return res.status(500).json({ error: 'Razorpay secret key is not configured in Vercel environment' });
    }

    console.log('Verifying signature for order:', razorpay_order_id, 'payment:', razorpay_payment_id);
    // Verify signature: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      console.log('Payment signature verified successfully!');
      return res.status(200).json({ success: true, message: 'Payment signature verified successfully' });
    } else {
      console.error('Signature mismatch! Expected:', expectedSignature, 'Got:', razorpay_signature);
      return res.status(400).json({ success: false, error: 'Payment verification failed (signature mismatch)' });
    }
  } catch (err) {
    console.error('Signature verification runtime error:', err);
    return res.status(500).json({ error: err.message || 'Signature verification failed' });
  }
}
