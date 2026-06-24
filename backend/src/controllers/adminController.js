const { supabaseAdmin } = require('../config/supabase');

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
exports.getRecentWinners = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('winners')
      .select(`*, profile:user_id (full_name)`)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Recent winners error:', error);
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
      .select('*')
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
// FORCE MATCH WINNERS (Manual Fallback)
// ============================================
exports.forceMatchWinners = async (req, res) => {
  try {
    const { drawId } = req.params;

    // 1. Get the draw
    const { data: draw, error: fetchError } = await supabaseAdmin
      .from('draws')
      .select('*')
      .eq('id', drawId)
      .single();

    if (fetchError) throw fetchError;

    // 2. Get active users and scores
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

    // 3. Build user score map (latest 5)
    const userScoreMap = {};
    for (const row of scores) {
      if (!userScoreMap[row.user_id]) userScoreMap[row.user_id] = [];
      if (userScoreMap[row.user_id].length < 5) {
        userScoreMap[row.user_id].push(row.points);
      }
    }

    // 4. Match winners
    const drawNumbers = draw.numbers;
    const drawSet = new Set(drawNumbers);
    const matchedWinners = { 5: [], 4: [], 3: [] };

    for (const [userId, userScores] of Object.entries(userScoreMap)) {
      const matches = userScores.filter(n => drawSet.has(n)).length;
      if (matches >= 3) {
        matchedWinners[matches].push(userId);
      }
    }

    // 5. Prize pools
    const prizePools = {
      5: draw.prize_pool_tier_5 || 0,
      4: draw.prize_pool_tier_4 || 0,
      3: draw.prize_pool_tier_3 || 0,
    };

    // 6. Insert winners
    const winnersToInsert = [];
    for (const tier of [5, 4, 3]) {
      const winnerIds = matchedWinners[tier] || [];
      const poolAmount = prizePools[tier] || 0;

      if (winnerIds.length > 0 && poolAmount > 0) {
        const prizePerWinner = poolAmount / winnerIds.length;
        for (const userId of winnerIds) {
          winnersToInsert.push({
            draw_id: drawId,
            user_id: userId,
            tier: tier,
            prize_amount: parseFloat(prizePerWinner.toFixed(2)),
            verification_status: 'pending',
          });
        }
      }
    }

    if (winnersToInsert.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('winners')
        .insert(winnersToInsert);
      if (insertError) throw insertError;
    }

    res.json({
      success: true,
      message: `Inserted ${winnersToInsert.length} winners.`,
      winners: matchedWinners,
    });
  } catch (error) {
    console.error('forceMatchWinners error:', error);
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

// ============================================
// DRAW MANAGEMENT (Admin)
// ============================================
exports.getAllDraws = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('draws')
      .select('*')
      .order('created_at', { ascending: false })   // ✅ Latest first
      .limit(5);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get all draws error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// WINNER MANAGEMENT (Admin)
// ============================================
exports.getAllWinners = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('winners')
      .select(`*, profile:user_id (full_name)`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get all winners error:', error);
    res.status(500).json({ error: error.message });
  }
};

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