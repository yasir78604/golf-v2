const { supabaseAdmin } = require('../config/supabase');

// Get all scores (latest 5)
exports.getMyScores = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('scores')
      .select('*')
      .eq('user_id', req.user.id)
      .order('date', { ascending: false })
      .limit(5);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create score (with rolling logic)
exports.createScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, points } = req.body;

    // Validate
    if (!date || !points || points < 1 || points > 45) {
      return res.status(400).json({ error: 'Valid date and points (1-45) required' });
    }

    // Check duplicate date
    const { data: existing } = await supabaseAdmin
      .from('scores')
      .select('id')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ error: 'Score for this date already exists' });
    }

    // Count current scores
    const { count } = await supabaseAdmin
      .from('scores')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    // If 5 scores exist, delete oldest
    if (count >= 5) {
      const { data: oldest } = await supabaseAdmin
        .from('scores')
        .select('id')
        .eq('user_id', userId)
        .order('date', { ascending: true })
        .limit(1);

      if (oldest && oldest.length > 0) {
        await supabaseAdmin.from('scores').delete().eq('id', oldest[0].id);
      }
    }

    // Insert new score
    const { data, error } = await supabaseAdmin
      .from('scores')
      .insert([{ user_id: userId, date, points }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete score
exports.deleteScore = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('scores')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ success: true, message: 'Score deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update score
exports.updateScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, points } = req.body;

    const { data, error } = await supabaseAdmin
      .from('scores')
      .update({ date, points })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Score not found' });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};