const { supabaseAdmin } = require('../config/supabase');

// ---------- PUBLIC: Get all charities ----------
exports.getAllCharities = async (req, res) => {
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
};

// ---------- PUBLIC: Get featured charities ----------
exports.getFeaturedCharities = async (req, res) => {
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
};

// ---------- PUBLIC: Get single charity ----------
exports.getCharityById = async (req, res) => {
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
};

// ---------- ADMIN: Create charity ----------
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
    res.status(500).json({ error: error.message });
  }
};

// ---------- ADMIN: Update charity ----------
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
    res.status(500).json({ error: error.message });
  }
};

// ---------- ADMIN: Delete charity ----------
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
    res.status(500).json({ error: error.message });
  }
};