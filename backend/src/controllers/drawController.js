const { supabaseAdmin } = require('../config/supabase');

// ---------- USER: Get current draw ----------
exports.getCurrentDraw = async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data, error } = await supabaseAdmin
      .from('draws')
      .select('*')
      .eq('month', currentMonth)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('getCurrentDraw error:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json({ success: true, data: data?.[0] || null });
  } catch (error) {
    console.error('getCurrentDraw error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ---------- USER: Get past draws ----------
exports.getPastDraws = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('draws')
      .select('*')
      .eq('status', 'published')
      .order('month', { ascending: false })
      .limit(12);

    if (error) {
      console.error('getPastDraws error:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('getPastDraws error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ---------- ADMIN: Simulate a draw ----------
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

    const allPoints = scores.map(s => s.points);

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
    console.error('simulateDraw error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ---------- ADMIN: Publish a draw (with winner insertion) ----------
exports.publishDraw = async (req, res) => {
  console.log('🔵 publishDraw called for drawId:', req.params.drawId);

  try {
    const { drawId } = req.params;

    // 1. Get the draw
    const { data: draw, error: fetchError } = await supabaseAdmin
      .from('draws')
      .select('*')
      .eq('id', drawId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching draw:', fetchError);
      return res.status(500).json({ error: fetchError.message });
    }

    if (draw.status === 'published') {
      return res.status(400).json({ error: 'Draw already published' });
    }

    // 2. Get all active users and their scores
    const { data: activeUsers } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .eq('subscription_status', 'active');

    const userIds = activeUsers.map(u => u.id);

    const { data: scores } = await supabaseAdmin
      .from('scores')
      .select('user_id, points')
      .in('user_id', userIds)
      .order('date', { ascending: false });

    // 3. Build user -> scores map (latest 5)
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

    console.log('🏆 Matched winners:', matchedWinners);

    // 5. Insert winners
    const winnersToInsert = [];
    const prizePools = {
      5: draw.prize_pool_tier_5 || 0,
      4: draw.prize_pool_tier_4 || 0,
      3: draw.prize_pool_tier_3 || 0,
    };

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

    console.log(`📦 Winners to insert: ${winnersToInsert.length}`);

    if (winnersToInsert.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('winners')
        .insert(winnersToInsert);

      if (insertError) {
        console.error('❌ Insert error:', insertError);
        // Continue even if insert fails
      } else {
        console.log(`✅ ${winnersToInsert.length} winners inserted`);
      }
    }

    // 6. Update draw status
    const { error: updateError } = await supabaseAdmin
      .from('draws')
      .update({ status: 'published' })
      .eq('id', drawId);

    if (updateError) {
      console.error('❌ Update error:', updateError);
      return res.status(500).json({ error: updateError.message });
    }

    res.json({
      success: true,
      message: 'Draw published successfully',
      winnersCount: winnersToInsert.length,
      winners: matchedWinners,
    });
  } catch (error) {
    console.error('❌ publishDraw error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ---------- ADMIN: Get all draws (for admin) ----------
exports.getAllDraws = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('draws')
      .select('*')
      .order('month', { ascending: false })
      .limit(5);

    if (error) {
      console.error('getAllDraws error:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('getAllDraws error:', error);
    res.status(500).json({ error: error.message });
  }
};