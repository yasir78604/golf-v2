require('dotenv').config()


const Stripe = require('stripe');
const { supabaseAdmin } = require('../config/supabase');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ================================================================
// 1. CREATE CHECKOUT SESSION (User initiates payment)
// ================================================================
exports.createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { plan } = req.body; // 'monthly' or 'yearly'

    const priceIds = {
      monthly: process.env.STRIPE_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_YEARLY_PRICE_ID,
    };

    const priceId = priceIds[plan];
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/pricing?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?payment=canceled`,
      customer_email: req.user.email,
      client_reference_id: userId,
      metadata: { userId, plan },
    });

    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('❌ Create checkout error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ================================================================
// 2. ACTIVATE SUBSCRIPTION (Manual trigger after payment redirect)
// ================================================================
exports.activateSubscription = async (req, res) => {
  console.log('🔵 activateSubscription called for user:', req.user.id);

  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: 'active',
        payment_status: 'received',
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ User activated successfully:', data);
    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Activation error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ================================================================
// 3. GET SUBSCRIPTION STATUS (Optional)
// ================================================================
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('subscription_status, payment_status, subscription_plan, subscription_renews_at')
      .eq('id', userId)
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Get status error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ================================================================
// 4. STRIPE WEBHOOK HANDLER (Background sync)
// ================================================================
exports.handleWebhook = async (req, res) => {
  console.log('📥 Webhook received!');
  console.log('📥 Headers:', req.headers['stripe-signature'] ? 'Has signature ✅' : 'No signature ❌');

  const sig = req.headers['stripe-signature'];

  if (!sig) {
    console.error('❌ No Stripe signature found');
    return res.status(400).send('Missing Stripe signature');
  }

  let event;

  try {
    console.log('🔐 Constructing event...');
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('✅ Event constructed:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    console.log(`📦 Processing event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        console.log('💳 Checkout session completed!');
        const session = event.data.object;
        console.log('📋 Session client_reference_id:', session.client_reference_id);
        console.log('📋 Session metadata:', session.metadata);
        await handleCheckoutCompleted(session);
        break;

      case 'customer.subscription.deleted':
        console.log('❌ Subscription cancelled');
        const subscription = event.data.object;
        await handleSubscriptionCancelled(subscription);
        break;

      case 'invoice.paid':
        console.log('💰 Invoice paid');
        const invoice = event.data.object;
        await handleInvoicePaid(invoice);
        break;

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ================================================================
// 5. WEBHOOK HELPERS
// ================================================================

async function handleCheckoutCompleted(session) {
  console.log('🏁 Processing checkout completed...');

  const userId = session.client_reference_id;
  if (!userId) {
    console.error('❌ No client_reference_id in session!');
    return;
  }

  console.log('🆔 User ID:', userId);

  const plan = session.metadata?.plan || 'monthly';
  const subscriptionId = session.subscription;

  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  console.log('📋 Subscription plan:', subscription.items.data[0].price.id);

  console.log('📝 Updating profile for user:', userId);
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({
      payment_status: 'received',
      subscription_status: 'active',  // Automatically activate on payment
      subscription_plan: plan,
      stripe_customer_id: session.customer,
      subscription_renews_at: new Date(subscription.current_period_end * 1000),
    })
    .eq('id', userId)
    .select();

  if (error) {
    console.error('❌ Error updating profile:', error);
  } else {
    console.log('✅ Profile updated (webhook):', data);
  }
}

async function handleSubscriptionCancelled(subscription) {
  console.log('🏁 Processing subscription cancelled...');

  const customerId = subscription.customer;

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'cancelled',
    })
    .eq('stripe_customer_id', customerId)
    .select();

  if (error) {
    console.error('❌ Error updating cancellation:', error);
  } else {
    console.log('✅ Subscription cancelled:', data);
  }
}

async function handleInvoicePaid(invoice) {
  console.log('🏁 Processing invoice paid...');

  if (!invoice.subscription) {
    console.log('⚠️ No subscription in invoice, skipping');
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const customerId = subscription.customer;

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'active',
      subscription_renews_at: new Date(subscription.current_period_end * 1000),
    })
    .eq('stripe_customer_id', customerId)
    .select();

  if (error) {
    console.error('❌ Error updating invoice:', error);
  } else {
    console.log('✅ Invoice paid, subscription renewed:', data);
  }
}