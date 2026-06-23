const { supabaseAdmin } = require('../config/supabase');
const { generateDrawNumbers, matchWinners } = require('../services/drawEngine');
const { calculatePrizePool, splitPrize } = require('../services/prizeCalculator');

// ============================================
// DASHBOARD STATS
// ============================================
exports.getDashboardStats = async (req, res) => {
  try {
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    const { count: activeSubscribers } = await supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('subscription_status', 'active');

    const { count: totalCharities } = await supabaseAdmin
      .from('charities')
      .select('id', { count: 'exact', head: true });

    const { data: draws } = await supabaseAdmin
      .from('draws')
      .select('prize_pool_tier_5, prize_pool_tier_4, prize_pool_tier_3');

    let totalPrizePool = 0;
    if (draws) {
      draws.forEach(d => {
        totalPrizePool += (d.prize_pool_tier_5 || 0) + (d.prize_pool_tier_4 || 0) + (d.prize_pool_tier_3 || 0);
      });
    }

    res.json({
      success: true,
      stats: { totalUsers, activeSubscribers, totalCharities, totalPrizePool }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// RECENT WINNERS
// ============================================
// ---------- RECENT WINNERS ----------
exports.getRecentWinners = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('winners')
      .select(`
        *,
        profile:user_id (full_name)   // ✅ REMOVED email
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Recent winners error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ---------- GET ALL WINNERS ----------
exports.getAllWinners = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('winners')
      .select(`
        *,
        profile:user_id (full_name)   // ✅ REMOVED email
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get winners error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// USER MANAGEMENT
// ============================================
exports.getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')   // This is fine because profiles doesn't have email
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// DRAW MANAGEMENT
// ============================================
exports.getAllDraws = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('draws')
      .select('*')
      .order('month', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get draws error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.simulateDraw = async (req, res) => {
  try {
    const { month, logic } = req.body;

    const { data: activeUsers } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('subscription_status', 'active');

    const userIds = activeUsers.map(u => u.id);

    const { data: scores } = await supabaseAdmin
      .from('scores')
      .select('user_id, points')
      .in('user_id', userIds)
      .order('date', { ascending: false });

    const freq = Array(46).fill(0);
    scores.forEach(s => { if (s.points >= 1 && s.points <= 45) freq[s.points]++; });

    const weights = {};
    for (let i = 1; i <= 45; i++) {
      if (logic === 'random') weights[i] = 1;
      else if (logic === 'weighted_popular') weights[i] = freq[i] + 1;
      else if (logic === 'weighted_underdog') weights[i] = 1 / (freq[i] + 0.1);
    }

    const numbers = [];
    const tempWeights = { ...weights };
    for (let k = 0; k < 5; k++) {
      const total = Object.values(tempWeights).reduce((a, b) => a + b, 0);
      let rand = Math.random() * total;
      for (const [num, w] of Object.entries(tempWeights)) {
        rand -= w;
        if (rand <= 0) {
          numbers.push(Number(num));
          delete tempWeights[num];
          break;
        }
      }
    }

    const userScoreMap = {};
    for (const row of scores) {
      if (!userScoreMap[row.user_id]) userScoreMap[row.user_id] = [];
      if (userScoreMap[row.user_id].length < 5) {
        userScoreMap[row.user_id].push(row.points);
      }
    }

    const drawSet = new Set(numbers);
    const matchedWinners = { 5: [], 4: [], 3: [] };

    for (const [userId, userScores] of Object.entries(userScoreMap)) {
      const matches = userScores.filter(n => drawSet.has(n)).length;
      if (matches >= 3) matchedWinners[matches].push(userId);
    }

    const monthlyFee = 10;
    const poolContribution = 0.70;
    const totalPool = activeUsers.length * monthlyFee * poolContribution;
    const pools = {
      tier5: totalPool * 0.40,
      tier4: totalPool * 0.35,
      tier3: totalPool * 0.25,
    };

    const { data: draw, error } = await supabaseAdmin
      .from('draws')
      .insert([{
        month,
        numbers,
        logic,
        status: 'simulated',
        prize_pool_tier_5: pools.tier5,
        prize_pool_tier_4: pools.tier4,
        prize_pool_tier_3: pools.tier3,
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      draw,
      winners: matchedWinners,
      prizePools: pools,
    });
  } catch (error) {
    console.error('Simulate draw error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.publishDraw = async (req, res) => {
  try {
    const { drawId } = req.params;

    const { data: draw, error: fetchError } = await supabaseAdmin
      .from('draws')
      .select('*')
      .eq('id', drawId)
      .single();

    if (fetchError) throw fetchError;

    if (draw.status === 'published') {
      return res.status(400).json({ error: 'Draw already published' });
    }

    const { error } = await supabaseAdmin
      .from('draws')
      .update({ status: 'published' })
      .eq('id', drawId);

    if (error) throw error;

    res.json({ success: true, message: 'Draw published successfully' });
  } catch (error) {
    console.error('Publish draw error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// WINNER MANAGEMENT
// ============================================


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
    console.error('Update winner status error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const { winnerId } = req.params;

    const { data: winner, error: fetchError } = await supabaseAdmin
      .from('winners')
      .select('*')
      .eq('id', winnerId)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabaseAdmin
      .from('winners')
      .update({ verification_status: 'paid' })
      .eq('id', winnerId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Mark as paid error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// CHARITY MANAGEMENT
// ============================================
exports.createCharity = async (req, res) => {
  try {
    const { name, description, imageUrl, website, isFeatured } = req.body;

    const { data, error } = await supabaseAdmin
      .from('charities')
      .insert([{
        name,
        description: description || '',
        image_url: imageUrl || '',
        website: website || '',
        is_featured: isFeatured || false,
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Create charity error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateCharity = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabaseAdmin
      .from('charities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Update charity error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCharity = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('charities')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Charity deleted' });
  } catch (error) {
    console.error('Delete charity error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ---------- ACTIVATE USER SUBSCRIPTION ----------
// ---------- ACTIVATE USER SUBSCRIPTION ----------
exports.activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID format (optional)
    if (!id || id.length < 36) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: 'active',
        // Optionally set payment_status to 'active' or keep 'received'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, data, message: 'User activated successfully' });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ error: error.message });
  }
};