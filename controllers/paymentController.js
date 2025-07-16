const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);
const client_domain = process.env.CLIENT_DOMAIN;

exports.createCheckoutSession = async (req, res) => {
  try {
    const { products } = req.body;

    const lineItems = products.map((product) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: product?.title,
          images: [product?.image], // optional
        },
        unit_amount: Math.round(product?.price * 100), // amount in paise
      },
      quantity: product?.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${client_domain}/payment-success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${client_domain}/payment-cancel`,
    });

    res.status(200).json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error('Stripe session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};
