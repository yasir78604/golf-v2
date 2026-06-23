const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');

// Get all charities (public)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('charities')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get featured charities
router.get('/featured', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('charities')
      .select('*')
      .eq('is_featured', true)
      .limit(5);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single charity
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('charities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;