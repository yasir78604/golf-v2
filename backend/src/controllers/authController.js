const jwt = require('jsonwebtoken');
const { supabaseAdmin, supabasePublic } = require('../config/supabase');

// ---------- SIGNUP ----------
exports.signup = async (req, res) => {
  try {
    console.log('📝 Signup request body:', req.body);

    const { email, password, fullName, charityId, charityPercentage = 10 } = req.body;

    // 1. Create user via Supabase Auth
    console.log('🔐 Creating user in Supabase Auth...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (authError) {
      console.error('❌ Auth error:', authError);
      return res.status(400).json({ error: authError.message });
    }

    console.log('✅ User created:', authData.user.id);

    const userId = authData.user.id;

    // 2. Create profile
    console.log('📝 Creating profile...');
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([{
        id: userId,
        full_name: fullName,
        charity_id: charityId,
        charity_percentage: charityPercentage,
        subscription_status: 'pending',
        role: 'user',
      }])
      .select()
      .single();

    if (profileError) {
      console.error('❌ Profile error:', profileError);
      // Rollback: delete auth user if profile fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return res.status(400).json({ 
        error: 'Failed to create profile: ' + profileError.message,
        details: profileError
      });
    }

    console.log('✅ Profile created:', profileData);

    res.status(201).json({
      message: 'User created. Please subscribe to activate.',
      user: { id: userId, email, fullName },
      profile: profileData,
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};

// ---------- LOGIN ----------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: sessionData, error: sessionError } = await supabasePublic.auth.signInWithPassword({
      email,
      password,
    });

    if (sessionError) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', sessionData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile fetch error:', profileError);
      return res.status(500).json({ error: 'Error fetching profile' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: sessionData.user.id, email: sessionData.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login successful',
      user: { ...sessionData.user, ...profile },
      token,
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ---------- GET CURRENT USER ----------
exports.getMe = async (req, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*, charity:charity_id(*)')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('❌ GetMe error:', error);
      return res.status(500).json({ error: 'Error fetching profile' });
    }

    res.json({ success: true, user: profile });
  } catch (error) {
    console.error('❌ GetMe error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ---------- LOGOUT ----------
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};