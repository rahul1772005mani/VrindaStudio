import Razorpay from 'razorpay';

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
    const { amount, currency, receipt } = req.body;

    // Validation
    if (!amount || typeof amount !== 'number' || amount < 100) {
      return res.status(400).json({ error: 'Valid amount in paise (minimum 100 paise) is required' });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return res.status(500).json({ error: 'Razorpay API credentials are not configured in Vercel environment' });
    }

    const razorpay = new Razorpay({ key_id, key_secret });

    const options = {
      amount, // amount in paise
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    
    if (!order) {
      throw new Error('Razorpay order creation returned an empty response');
    }

    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    const errorMsg = err.error?.description || err.message || 'Failed to create order on Razorpay';
    return res.status(500).json({ error: errorMsg });
  }
}
