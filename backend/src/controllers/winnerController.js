const { supabaseAdmin } = require('../config/supabase');

// ---------- USER: Get my winnings ----------
exports.getMyWinnings = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from('winners')
      .select(`
        *,
        draw:draw_id (month, numbers)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ---------- USER: Upload proof image ----------
exports.uploadProof = async (req, res) => {
  try {
    const { winnerId } = req.params;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    // Update winner record with proof
    const { data, error } = await supabaseAdmin
      .from('winners')
      .update({
        proof_image_url: imageUrl,
        verification_status: 'pending',
      })
      .eq('id', winnerId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ---------- ADMIN: Get all winners (for verification) ----------
exports.getAllWinners = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('winners')
      .select(`
        *,
        profile:user_id (full_name, email),
        draw:draw_id (month, numbers)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ---------- ADMIN: Verify/update winner status ----------
exports.updateWinnerStatus = async (req, res) => {
  try {
    const { winnerId } = req.params;
    const { verificationStatus } = req.body;

    const { data, error } = await supabaseAdmin
      .from('winners')
      .update({ verification_status: verificationStatus })
      .eq('id', winnerId)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ---------- ADMIN: Mark as paid ----------
exports.markAsPaid = async (req, res) => {
  try {
    const { winnerId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('winners')
      .update({ verification_status: 'paid' })
      .eq('id', winnerId)
      .select()
      .single();

    if (error) throw error;

    // Update user's total winnings
    await supabaseAdmin
      .from('profiles')
      .update({ total_winnings: supabaseAdmin.rpc('increment', { row_id: data.user_id, amount: data.prize_amount }) });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};